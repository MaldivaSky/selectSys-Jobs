-- =============================================================================
-- SelectSys Jobs — Migration 03: Busca trigram robusta + Fila de Exportação
-- ---------------------------------------------------------------------------
-- 1. Índices GIN com `pg_trgm` + `unaccent` em candidates.
--    A extensão já foi criada na migration 01; o que faltava era o ÍNDICE.
--    O operador `%` (similaridade) e `similarity()` deixam a busca tolerante
--    a erro de digitação e a acento — a promessa do protótipo que ainda não
--    estava no produto real (o front filtrava por String.includes no client).
--
-- 2. Tabela `export_jobs` — a fila de exportação Excel.
--    O front deixa de gerar o Blob no thread principal e pede um JOB; a Edge
--    Function `exportar-ficha` processa, sobe para o bucket e grava o
--    signed_url. A tabela segue o padrão multi-tenant (RLS por organização).
-- =============================================================================

-- =============================================================================
-- 1. BUSCA — ÍNDICES TRIGRAM
-- =============================================================================

-- Índice GIN para busca tolerante a acento e erro de digitação em nome.
DROP INDEX IF EXISTS idx_candidates_nome_trgm_unaccent;
CREATE INDEX idx_candidates_nome_trgm_unaccent
  ON public.candidates
  USING GIN (unaccent(nome_completo) gin_trgm_ops);

-- Índice GIN para busca de CPF (numérico; não leva unaccent).
DROP INDEX IF EXISTS idx_candidates_cpf_trgm;
CREATE INDEX idx_candidates_cpf_trgm
  ON public.candidates
  USING GIN (cpf gin_trgm_ops);

-- Índice composto status×org para acelerar o join de busca com funil.
DROP INDEX IF EXISTS idx_applications_org_status;
CREATE INDEX idx_applications_org_status
  ON public.applications (organization_id, status);

-- =============================================================================

-- =============================================================================
-- 2. FUNÇÃO DE BUSCA `buscar_candidatos`
-- ---------------------------------------------------------------------------
-- Busca textual NO BANCO (não no navegador), devolvendo ordenado por
-- relevância. Tolerante a acento (unaccent) e a erro de digitação.
--
-- SEGURANÇA: SECURITY INVOKER (padrão) — a RLS de candidates/applications
-- é avaliada no contexto do chamador. Filtro explícito de organização via
-- p_org (ou app_current_org()) garante isolamento multi-tenant mesmo se a
-- RLS for ajustada futuramente. Um usuário autenticado nunca lê outra org.
-- =============================================================================
DROP FUNCTION IF EXISTS public.buscar_candidatos(text, text, uuid, int, int);
CREATE OR REPLACE FUNCTION public.buscar_candidatos(
  p_termo   text DEFAULT NULL,
  p_status  text DEFAULT NULL,
  p_org     uuid DEFAULT NULL,
  p_limit   int  DEFAULT 60,
  p_offset  int  DEFAULT 0
)
RETURNS TABLE (
  id              uuid,
  application_id  uuid,
  nome_completo   text,
  cpf             text,
  data_nascimento date,
  cidade          text,
  estado          text,
  telefone        text,
  email           citext,
  geracao         public.geracao_nikkei,
  nivel_japones   text,
  altura_cm       int,
  peso_kg         numeric,
  cintura_cm      int,
  pe_cm           numeric,
  tem_tatuagem    boolean,
  status          public.application_status,
  updated_at      timestamptz,
  ja_esteve_japao boolean,
  relevancia      real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
  WITH recorte AS (
    SELECT
      c.id,
      a.id                       AS application_id,
      c.nome_completo,
      c.cpf,
      c.data_nascimento,
      c.cidade,
      c.estado,
      c.telefone,
      c.email,
      c.geracao,
      c.nivel_japones,
      c.altura_cm,
      c.peso_kg,
      c.cintura_cm,
      c.pe_cm,
      c.tem_tatuagem,
      a.status::text             AS status,
      a.updated_at,
      c.ja_esteve_japao
    FROM public.candidates c
    JOIN public.applications a ON a.candidate_id = c.id
    WHERE c.organization_id = COALESCE(p_org, public.app_current_org())
      AND (p_status IS NULL OR a.status::text = p_status)
  )
  SELECT
    r.id,
    r.application_id,
    r.nome_completo,
    r.cpf,
    r.data_nascimento,
    r.cidade,
    r.estado,
    r.telefone,
    r.email,
    r.geracao,
    r.nivel_japones,
    r.altura_cm,
    r.peso_kg,
    r.cintura_cm,
    r.pe_cm,
    r.tem_tatuagem,
    r.status::public.application_status,
    r.updated_at,
    r.ja_esteve_japao,
    CASE WHEN p_termo IS NULL OR p_termo = '' THEN 1.0
         ELSE similarity(unaccent(r.nome_completo), unaccent(p_termo))
    END AS relevancia
  FROM recorte r
  WHERE
    (p_termo IS NULL OR p_termo = '')
    OR unaccent(r.nome_completo) % unaccent(p_termo)
    OR r.cpf ILIKE (replace(replace(p_termo, '.', ''), '-', '') || '%')
  ORDER BY
    CASE WHEN p_termo IS NULL OR p_termo = '' THEN 0 ELSE 1 END,
    CASE WHEN p_termo IS NULL OR p_termo = '' THEN 0
         ELSE similarity(unaccent(r.nome_completo), unaccent(p_termo))
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_candidatos(text, text, uuid, int, int) TO authenticated, service_role;

-- =============================================================================

-- =============================================================================
-- 3. FILA DE EXPORTAÇÃO — `export_jobs`
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE public.export_job_status AS ENUM (
    'pendente',
    'processando',
    'pronto',
    'falhou'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.export_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  solicitado_por   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  candidate_ids    uuid[] NOT NULL DEFAULT '{}',
  status           public.export_job_status NOT NULL DEFAULT 'pendente',
  arquivo_bucket   text,
  signed_url       text,
  expira_em        timestamptz,
  erro_mensagem    text,
  tentativas       int NOT NULL DEFAULT 0,
  total_candidatos int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  atualizado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_pendentes
  ON public.export_jobs (organization_id, status, created_at DESC);

-- RLS: cada organização enxerga/edita apenas os próprios jobs de exportação.
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_export_jobs ON public.export_jobs;
CREATE POLICY tenant_isolation_export_jobs ON public.export_jobs
  FOR ALL
  USING (organization_id = private.app_current_org());

-- =============================================================================
-- 4. HELPER DE CRIAÇÃO DE JOB — anti-vazamento multi-tenant
-- ---------------------------------------------------------------------------
-- O front chama esta RPC com os candidate_ids. A função valida que TODOS os
-- id pertencem à organização do chamador (via private.app_current_org()), de
-- modo que um usuário não consegue enfileirar exportação de candidato de outro
-- tenant — a mesma exigência que o policy de export_jobs impõe, mas verificada
-- no dado de entrada antes de criar o job.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.criar_export_job(
  p_candidate_ids uuid[]
)
RETURNS public.export_jobs
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_org  uuid;
  v_user uuid;
  v_job  public.export_jobs;
BEGIN
  v_org  := private.app_current_org();
  v_user := auth.uid();

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Sessão sem organização determinada.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_candidate_ids) AS cid
    WHERE NOT EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = cid AND c.organization_id = v_org
    )
  ) THEN
    RAISE EXCEPTION 'Há candidato(s) fora da sua organização nesta solicitação.';
  END IF;

  INSERT INTO public.export_jobs (
    organization_id, solicitado_por, candidate_ids, status,
    total_candidatos, tentativas
  )
  VALUES (v_org, v_user, p_candidate_ids, 'pendente',
          coalesce(array_length(p_candidate_ids, 1), 0), 0)
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_export_job(uuid[]) TO authenticated, service_role;
