-- ════════════════════════════════════════════════════════════════════════
-- 2026-08-08 · ISOLAMENTO MULTI-TENANT
-- Aplicada em produção (projeto cpucbenejecedextdltn) em 3 migrações:
--   fecha_rls_multi_tenant_e_remove_credenciais_expostas
--   endurece_superficie_rpc_e_search_path
--   move_helpers_de_rls_para_schema_privado
-- Este arquivo é o estado final consolidado, para reconstruir do zero.
--
-- MOTIVO
-- 13 tabelas em `public` estavam sem RLS e com SELECT concedido a `anon`.
-- Como a chave publicável vai no bundle do navegador, qualquer pessoa lia
-- organizations, users (incluindo as colunas senha_hash e totp_secret),
-- memberships, work_history, family_members, application_data, audit_log,
-- subscriptions, upload_links, rulesets, form_schemas, message_templates e
-- pipeline_transitions — de qualquer tenant, sem autenticar. Verificado por
-- requisição HTTP real antes e depois.
--
-- DECISÃO DE DESENHO
-- Os helpers de contexto vivem em `private`, não em `public`. Em `public` o
-- PostgREST os publica como /rest/v1/rpc/*, e revogar EXECUTE para fechar
-- essa rota quebra a avaliação das próprias políticas — o Postgres checa
-- EXECUTE contra o papel que faz a requisição, inclusive dentro da RLS.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Credenciais fora de tabela exposta ───────────────────────────────
-- Autenticação é do Supabase Auth (auth.users, schema protegido).
ALTER TABLE public.users DROP COLUMN IF EXISTS senha_hash;
ALTER TABLE public.users DROP COLUMN IF EXISTS totp_secret;

-- ── 2. Helpers de contexto em schema não exposto ────────────────────────
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.app_current_org()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog' AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_org', true), '')::uuid,
    (SELECT m.organization_id FROM public.memberships m
      WHERE m.user_id = auth.uid() AND m.ativo ORDER BY m.created_at LIMIT 1)
  )
$$;

CREATE OR REPLACE FUNCTION private.app_current_user()
RETURNS uuid LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_catalog' AS $$
  SELECT COALESCE(NULLIF(current_setting('app.current_user', true), '')::uuid, auth.uid())
$$;

-- Antes lia apenas um GUC que o PostgREST nunca define: retornava NULL
-- sempre, o que tornava toda política por papel letra morta — inclusive a de
-- dado de saúde, que na prática negava acesso a todo mundo.
CREATE OR REPLACE FUNCTION private.app_current_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog' AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_role', true), ''),
    (SELECT m.role::text FROM public.memberships m
      WHERE m.user_id = auth.uid() AND m.ativo ORDER BY m.created_at LIMIT 1)
  )
$$;

CREATE OR REPLACE FUNCTION private.app_is_member(org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog' AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m
                  WHERE m.user_id = auth.uid() AND m.organization_id = org AND m.ativo)
$$;

CREATE OR REPLACE FUNCTION private.app_pode_ver_candidato(cand uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog' AS $$
  SELECT EXISTS (SELECT 1 FROM public.candidates c
                  WHERE c.id = cand
                    AND (c.user_id = auth.uid() OR private.app_is_member(c.organization_id)))
$$;

GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.app_current_org(), private.app_current_user(),
                          private.app_current_role(), private.app_is_member(uuid),
                          private.app_pode_ver_candidato(uuid) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.app_is_member(uuid);
DROP FUNCTION IF EXISTS public.app_pode_ver_candidato(uuid);
DROP FUNCTION IF EXISTS public.app_current_role();
DROP FUNCTION IF EXISTS public.app_current_org();
DROP FUNCTION IF EXISTS public.app_current_user();

-- ── 3. RLS nas 13 tabelas que estavam abertas ───────────────────────────
ALTER TABLE public.organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_schemas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rulesets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_links         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_data     ENABLE ROW LEVEL SECURITY;

-- Escopo por organização
CREATE POLICY tenant_isolation ON public.memberships
  USING (user_id = auth.uid() OR private.app_is_member(organization_id));
CREATE POLICY tenant_isolation ON public.rulesets          USING (private.app_is_member(organization_id));
CREATE POLICY tenant_isolation ON public.message_templates USING (private.app_is_member(organization_id));
CREATE POLICY tenant_isolation ON public.audit_log         USING (private.app_is_member(organization_id));
CREATE POLICY tenant_isolation ON public.subscriptions     USING (private.app_is_member(organization_id));
CREATE POLICY tenant_isolation ON public.upload_links      USING (private.app_is_member(organization_id));

-- Formulário e transições do funil: o portal público precisa ler para
-- renderizar a ficha; não carregam dado de candidato.
CREATE POLICY tenant_isolation ON public.form_schemas         USING (private.app_is_member(organization_id));
CREATE POLICY leitura_publica  ON public.form_schemas         FOR SELECT USING (true);
CREATE POLICY tenant_isolation ON public.pipeline_transitions USING (private.app_is_member(organization_id));
CREATE POLICY leitura_publica  ON public.pipeline_transitions FOR SELECT USING (true);

-- PII do candidato: a agência dona ou o próprio candidato.
CREATE POLICY escopo_candidato ON public.work_history   USING (private.app_pode_ver_candidato(candidate_id));
CREATE POLICY escopo_candidato ON public.family_members USING (private.app_pode_ver_candidato(candidate_id));
CREATE POLICY escopo_candidatura ON public.application_data USING (
  EXISTS (SELECT 1 FROM public.applications a
           WHERE a.id = application_data.application_id
             AND (private.app_is_member(a.organization_id)
                  OR private.app_pode_ver_candidato(a.candidate_id)))
);

-- Organização: membros veem tudo, o público vê só a vitrine. O recorte é por
-- COLUNA, não só por linha — `features`, `plano` e `retencao_meses` são
-- configuração comercial e não saem sem login.
CREATE POLICY tenant_isolation ON public.organizations USING (private.app_is_member(id));
CREATE POLICY vitrine_publica  ON public.organizations FOR SELECT USING (ativo);
REVOKE SELECT ON public.organizations FROM anon;
GRANT SELECT (id, slug, nome, nome_ja, locale, timezone, ativo, logo_url,
              cor_primaria, config_ficha, setores) ON public.organizations TO anon;

-- users: cada um enxerga a si mesmo; anon não enxerga nada.
CREATE POLICY proprio_usuario ON public.users USING (id = auth.uid());
REVOKE ALL ON public.users FROM anon;

-- ── 4. Correções em políticas que já existiam ───────────────────────────
-- Quadro público de vagas: sem esta política anon recebia zero linhas, então
-- o Vagas Hub e a indexação no Google Jobs não funcionavam.
CREATE POLICY vitrine_publica ON public.jobs FOR SELECT USING (publicada);

-- Dado de saúde: a política citava um GUC nunca definido e negava para todos.
DROP POLICY IF EXISTS health_restrita ON public.candidate_health;
CREATE POLICY health_restrita ON public.candidate_health USING (
  private.app_is_member(organization_id)
  AND private.app_current_role() IN ('super_admin', 'org_admin', 'entrevistador')
);

-- ── 5. search_path fixo (sequestro de resolução de nomes) ───────────────
ALTER FUNCTION public.candidate_idade(date)           SET search_path TO 'public', 'pg_catalog';
ALTER FUNCTION public.expurgar_candidatos_expirados() SET search_path TO 'public', 'pg_catalog';
ALTER FUNCTION private.get_health_key()               SET search_path TO 'private', 'public', 'pg_catalog';
