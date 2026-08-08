-- =============================================================================
-- SelectSys Jobs — Migration 04: Fila de Exportação Excel Assíncrona
-- ---------------------------------------------------------------------------
-- 1. Habilita pg_net para chamadas HTTP de dentro do Postgres.
-- 2. Função trigger que dispara a Edge Function `gerar-ficha-excel` via HTTP
--    POST assim que um novo export_job é inserido (latência ~1s vs ~15s de cron).
-- 3. Bucket `export-fichas` privado com signed URLs (LGPD-compliant).
-- 4. RLS no Storage: só service_role escreve; authenticated lê pelo próprio tenant.
--
-- Decisões de segurança:
--   - A URL e a chave do worker vivem em GUC `app.*` definidos por sessão na
--     Edge Function, não hardcoded na migration. Isso evita vazar credenciais
--     no pg_proc catálogo.
--   - O bucket é privado (public = false). O front nunca acessa diretamente —
--     só via signed_url gravada em export_jobs, com expiry de 1h.
-- =============================================================================

-- =============================================================================
-- 1. EXTENSÃO pg_net (HTTP assíncrono para triggers)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- =============================================================================
-- 2. ÍNDICE de status pendente para o worker (leituras por status são comuns)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_export_jobs_status_criado
  ON public.export_jobs (status, created_at DESC)
  WHERE status IN ('pendente', 'processando');

-- =============================================================================
-- 3. TRIGGER DE WEBHOOK — dispara a Edge Function ao INSERT
-- ---------------------------------------------------------------------------
-- Por que trigger e não pg_cron:
--   - Latência: ~1s (trigger) vs ~15s (cron poll de 15s).
--   - Sem dependência de pg_cron (não disponível em todos os planos Supabase).
--   - Webhook falha silenciosamente (pg_net é fire-and-forget) — o worker
--     precisa ser idempotente e atualizar o status para 'falhou' em caso de erro.
-- =============================================================================
CREATE OR REPLACE FUNCTION private.disparar_export_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions, pg_catalog
AS $$
DECLARE
  v_url  text;
  v_key  text;
BEGIN
  -- GUCs definidos pela Edge Function via SET LOCAL antes de chamar o trigger.
  -- Se não estiverem definidos (ex: insert direto do service_role no banco),
  -- usa os valores de ambiente do Supabase.
  v_url := coalesce(
    nullif(current_setting('app.export_worker_url', true), ''),
    current_setting('SUPABASE_URL', true) || '/functions/v1/gerar-ficha-excel'
  );
  v_key := coalesce(
    nullif(current_setting('app.export_worker_key', true), ''),
    current_setting('SUPABASE_ANON_KEY', true)
  );

  IF v_url IS NULL OR v_url = '' THEN
    -- Sem URL configurada: log e segue sem falhar a transação principal.
    RAISE WARNING 'disparar_export_webhook: SUPABASE_URL não configurada, webhook ignorado para job %', NEW.id;
    RETURN NEW;
  END IF;

  PERFORM extensions.http_post(
    v_url,
    jsonb_build_object('job_id', NEW.id::text)::text,
    'application/json',
    jsonb_build_object('Authorization', 'Bearer ' || v_key)::text,
    10000  -- timeout 10s (pg_net cuida do retry por conta própria)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- O webhook é best-effort: não podemos reverter a inserção do job por falha HTTP.
  RAISE WARNING 'disparar_export_webhook: erro ao chamar webhook para job %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Concede execução apenas ao próprio banco (via trigger), não a roles externas.
REVOKE ALL ON FUNCTION private.disparar_export_webhook() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_export_webhook ON public.export_jobs;
CREATE TRIGGER trg_export_webhook
  AFTER INSERT ON public.export_jobs
  FOR EACH ROW
  WHEN (NEW.status = 'pendente')
  EXECUTE FUNCTION private.disparar_export_webhook();

-- =============================================================================
-- 4. BUCKET `export-fichas` — privado, signed URLs (LGPD)
-- ---------------------------------------------------------------------------
-- Arquivo gerado: {org_id}/{job_id}.xlsx
-- Tamanho máximo: 50 MB (planilha com 50 candidatos + fotos embutidas)
-- Retenção: o signed_url em export_jobs expira em 1h; o arquivo em si fica
--           até expurgo programado (LGPD 24 meses) ou deleção manual.
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'export-fichas',
  'export-fichas',
  false,  -- PRIVADO: nunca URL direta, sempre signed URL com expiry
  52428800,  -- 50 MB
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- 5. RLS NO STORAGE
-- ---------------------------------------------------------------------------
-- Regra: service_role (a Edge Function) escreve; authenticated lê somente
--        objetos do próprio tenant (pasta = organization_id).
-- =============================================================================

-- Escrita: só service_role (a Edge Function usa service_role key)
DROP POLICY IF EXISTS "service_role_upload_export" ON storage.objects;
CREATE POLICY "service_role_upload_export"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'export-fichas');

-- Atualização: service_role pode sobrescrever (retry de job falho)
DROP POLICY IF EXISTS "service_role_update_export" ON storage.objects;
CREATE POLICY "service_role_update_export"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'export-fichas');

-- Leitura: authenticated lê apenas a pasta do próprio tenant.
-- A pasta é nomeada {organization_id}/{job_id}.xlsx.
-- (storage.foldername retorna ARRAY, posição [1] é a pasta raiz)
DROP POLICY IF EXISTS "tenant_download_export" ON storage.objects;
CREATE POLICY "tenant_download_export"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'export-fichas'
    AND (storage.foldername(name))[1] = (
      SELECT m.organization_id::text
      FROM public.memberships m
      WHERE m.user_id = (SELECT auth.uid())
        AND m.ativo = true
      LIMIT 1
    )
  );

-- Deleção: service_role (para expurgo programado LGPD)
DROP POLICY IF EXISTS "service_role_delete_export" ON storage.objects;
CREATE POLICY "service_role_delete_export"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'export-fichas');
