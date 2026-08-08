-- =============================================================================
-- SelectSys Jobs — Migration 01: Row Level Security (RLS) Completo Multi-Tenant
-- =============================================================================

-- 1. Extensões essenciais
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Função de identificação do Tenant atual (GUC local ou via memberships do auth.uid)
CREATE OR REPLACE FUNCTION public.app_current_org() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
    SELECT COALESCE(
      nullif(current_setting('app.current_org', true), '')::uuid,
      (SELECT m.organization_id FROM public.memberships m
        WHERE m.user_id = auth.uid() AND m.ativo
        ORDER BY m.created_at LIMIT 1)
    )
  $$;

-- 3. Função de identificação do Usuário atual
CREATE OR REPLACE FUNCTION public.app_current_user() RETURNS uuid
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
    SELECT COALESCE(
      nullif(current_setting('app.current_user', true), '')::uuid,
      auth.uid()
    )
  $$;

-- 4. Função de identificação do Papel (Role) do Usuário na Organização Atual
CREATE OR REPLACE FUNCTION public.app_current_role() RETURNS public.user_role
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
    SELECT COALESCE(
      nullif(current_setting('app.current_role', true), '')::public.user_role,
      (SELECT m.role FROM public.memberships m
        WHERE m.user_id = auth.uid() AND m.organization_id = public.app_current_org() AND m.ativo
        ORDER BY m.created_at LIMIT 1)
    )
  $$;

-- =============================================================================
-- HABILITAR RLS NAS TABELAS DO SISTEMA
-- =============================================================================

ALTER TABLE public.organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_schemas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rulesets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_transitions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_health       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_decisions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_links           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions          ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEFINIÇÃO DAS POLÍTICAS DE RLS
-- =============================================================================

-- ORGANIZATIONS
DROP POLICY IF EXISTS tenant_read_org ON public.organizations;
CREATE POLICY tenant_read_org ON public.organizations
  FOR SELECT USING (id = public.app_current_org() OR ativo = true);

-- AGENCIES
DROP POLICY IF EXISTS tenant_isolation_agencies ON public.agencies;
CREATE POLICY tenant_isolation_agencies ON public.agencies
  FOR ALL USING (organization_id = public.app_current_org());

-- FORM SCHEMAS
DROP POLICY IF EXISTS tenant_isolation_form_schemas ON public.form_schemas;
CREATE POLICY tenant_isolation_form_schemas ON public.form_schemas
  FOR ALL USING (organization_id = public.app_current_org());

-- RULESETS
DROP POLICY IF EXISTS tenant_isolation_rulesets ON public.rulesets;
CREATE POLICY tenant_isolation_rulesets ON public.rulesets
  FOR ALL USING (organization_id = public.app_current_org());

-- PIPELINE TRANSITIONS
DROP POLICY IF EXISTS tenant_isolation_pipeline_transitions ON public.pipeline_transitions;
CREATE POLICY tenant_isolation_pipeline_transitions ON public.pipeline_transitions
  FOR ALL USING (organization_id = public.app_current_org());

-- CANDIDATES
-- Regra de leitura/escrita por tenant. Agências leem apenas os próprios candidatos.
DROP POLICY IF EXISTS tenant_isolation_candidates ON public.candidates;
CREATE POLICY tenant_isolation_candidates ON public.candidates
  FOR ALL USING (
    organization_id = public.app_current_org()
    AND (
      public.app_current_role() IS NULL
      OR public.app_current_role() <> 'agencia'::public.user_role
      OR agency_id = (
        SELECT m.agency_id FROM public.memberships m
        WHERE m.user_id = public.app_current_user()
          AND m.organization_id = public.app_current_org()
      )
    )
  );

-- WORK HISTORY
DROP POLICY IF EXISTS tenant_isolation_work_history ON public.work_history;
CREATE POLICY tenant_isolation_work_history ON public.work_history
  FOR ALL USING (
    candidate_id IN (
      SELECT c.id FROM public.candidates c WHERE c.organization_id = public.app_current_org()
    )
  );

-- FAMILY MEMBERS
DROP POLICY IF EXISTS tenant_isolation_family_members ON public.family_members;
CREATE POLICY tenant_isolation_family_members ON public.family_members
  FOR ALL USING (
    candidate_id IN (
      SELECT c.id FROM public.candidates c WHERE c.organization_id = public.app_current_org()
    )
  );

-- CANDIDATE HEALTH (Dados sensíveis LGPD Art. 11: Apenas org_admin, entrevistador e super_admin)
DROP POLICY IF EXISTS health_restrita ON public.candidate_health;
CREATE POLICY health_restrita ON public.candidate_health
  FOR ALL USING (
    organization_id = public.app_current_org()
    AND public.app_current_role() IN ('super_admin'::public.user_role, 'org_admin'::public.user_role, 'entrevistador'::public.user_role)
  );

-- CONSENTS
DROP POLICY IF EXISTS tenant_isolation_consents ON public.consents;
CREATE POLICY tenant_isolation_consents ON public.consents
  FOR ALL USING (organization_id = public.app_current_org());

-- JOBS
DROP POLICY IF EXISTS tenant_isolation_jobs ON public.jobs;
CREATE POLICY tenant_isolation_jobs ON public.jobs
  FOR ALL USING (organization_id = public.app_current_org() OR publicada = true);

-- APPLICATIONS
DROP POLICY IF EXISTS tenant_isolation_applications ON public.applications;
CREATE POLICY tenant_isolation_applications ON public.applications
  FOR ALL USING (organization_id = public.app_current_org());

-- APPLICATION DATA
DROP POLICY IF EXISTS tenant_isolation_application_data ON public.application_data;
CREATE POLICY tenant_isolation_application_data ON public.application_data
  FOR ALL USING (
    application_id IN (
      SELECT a.id FROM public.applications a WHERE a.organization_id = public.app_current_org()
    )
  );

-- SCREENING DECISIONS
DROP POLICY IF EXISTS tenant_isolation_screening_decisions ON public.screening_decisions;
CREATE POLICY tenant_isolation_screening_decisions ON public.screening_decisions
  FOR ALL USING (organization_id = public.app_current_org());

-- MATCH SCORES
DROP POLICY IF EXISTS tenant_isolation_match_scores ON public.match_scores;
CREATE POLICY tenant_isolation_match_scores ON public.match_scores
  FOR ALL USING (organization_id = public.app_current_org());

-- PIPELINE EVENTS
DROP POLICY IF EXISTS tenant_isolation_pipeline_events ON public.pipeline_events;
CREATE POLICY tenant_isolation_pipeline_events ON public.pipeline_events
  FOR ALL USING (organization_id = public.app_current_org());

-- DOCUMENTS
DROP POLICY IF EXISTS tenant_isolation_documents ON public.documents;
CREATE POLICY tenant_isolation_documents ON public.documents
  FOR ALL USING (organization_id = public.app_current_org());

-- UPLOAD LINKS
DROP POLICY IF EXISTS tenant_isolation_upload_links ON public.upload_links;
CREATE POLICY tenant_isolation_upload_links ON public.upload_links
  FOR ALL USING (organization_id = public.app_current_org());

-- MESSAGE TEMPLATES
DROP POLICY IF EXISTS tenant_isolation_message_templates ON public.message_templates;
CREATE POLICY tenant_isolation_message_templates ON public.message_templates
  FOR ALL USING (organization_id = public.app_current_org());

-- MESSAGES
DROP POLICY IF EXISTS tenant_isolation_messages ON public.messages;
CREATE POLICY tenant_isolation_messages ON public.messages
  FOR ALL USING (organization_id = public.app_current_org());

-- AUDIT LOG
DROP POLICY IF EXISTS tenant_isolation_audit_log ON public.audit_log;
CREATE POLICY tenant_isolation_audit_log ON public.audit_log
  FOR ALL USING (organization_id = public.app_current_org());

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS tenant_isolation_subscriptions ON public.subscriptions;
CREATE POLICY tenant_isolation_subscriptions ON public.subscriptions
  FOR ALL USING (organization_id = public.app_current_org());
