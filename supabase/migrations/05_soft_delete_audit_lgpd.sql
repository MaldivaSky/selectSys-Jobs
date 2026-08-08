-- =============================================================================
-- SelectSys Jobs — Migration 05: Proteção de Dados, Soft Delete, RLS, 
-- Audit Log Trigger em Schema Isolado e Expurgo LGPD via pg_cron
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TAREFA 1: COLUNAS DE SOFT DELETE (deleted_at, deleted_by)
-- -----------------------------------------------------------------------------

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL REFERENCES public.users(id) ON DELETE SET NULL;

-- Índices para otimização de performance em consultas de registros ativos
CREATE INDEX IF NOT EXISTS idx_candidates_deleted_at ON public.candidates (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON public.applications (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memberships_deleted_at ON public.memberships (deleted_at) WHERE deleted_at IS NULL;

-- Garante que candidatos soft-deleted não saturem o constraint de CPF único ao se candidatarem novamente
ALTER TABLE public.candidates DROP CONSTRAINT IF EXISTS candidates_organization_id_cpf_key;
DROP INDEX IF EXISTS idx_candidates_org_cpf_active;
CREATE UNIQUE INDEX idx_candidates_org_cpf_active ON public.candidates (organization_id, cpf) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- TAREFA 2: ATUALIZAÇÃO DAS POLÍTICAS DE RLS (SELECT FILTRA deleted_at IS NULL)
-- -----------------------------------------------------------------------------

-- CANDIDATES
DROP POLICY IF EXISTS tenant_isolation_candidates ON public.candidates;
CREATE POLICY tenant_isolation_candidates ON public.candidates
  FOR ALL USING (
    deleted_at IS NULL
    AND organization_id = public.app_current_org()
    AND (
      public.app_current_role() IS NULL
      OR public.app_current_role() <> 'agencia'::public.user_role
      OR agency_id = (
        SELECT m.agency_id FROM public.memberships m
        WHERE m.user_id = public.app_current_user()
          AND m.organization_id = public.app_current_org()
          AND m.deleted_at IS NULL
      )
    )
  );

-- APPLICATIONS
DROP POLICY IF EXISTS tenant_isolation_applications ON public.applications;
CREATE POLICY tenant_isolation_applications ON public.applications
  FOR ALL USING (
    deleted_at IS NULL
    AND organization_id = public.app_current_org()
  );

-- MEMBERSHIPS
DROP POLICY IF EXISTS tenant_isolation_memberships ON public.memberships;
CREATE POLICY tenant_isolation_memberships ON public.memberships
  FOR ALL USING (
    deleted_at IS NULL
    AND organization_id = public.app_current_org()
  );

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON public.users;
CREATE POLICY tenant_isolation_users ON public.users
  FOR ALL USING (
    deleted_at IS NULL
  );

-- -----------------------------------------------------------------------------
-- TAREFA 3: SCHEMA ISOLADO audit E TRIGGER GENÉRICO audit_log_trigger
-- -----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.audit_logs (
  id           bigserial PRIMARY KEY,
  table_name   text NOT NULL,
  operation    text NOT NULL,
  old_data     jsonb,
  new_data     jsonb,
  performed_by uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE audit.audit_logs FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION audit.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = audit, public, pg_catalog AS $$
DECLARE
  v_old_data jsonb := NULL;
  v_new_data jsonb := NULL;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  END IF;

  INSERT INTO audit.audit_logs (
    table_name,
    operation,
    old_data,
    new_data,
    performed_by,
    created_at
  ) VALUES (
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    TG_OP,
    v_old_data,
    v_new_data,
    auth.uid(),
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Registra o trigger genérico de auditoria nas tabelas críticas
DROP TRIGGER IF EXISTS audit_applications_trigger ON public.applications;
CREATE TRIGGER audit_applications_trigger
  AFTER UPDATE OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION audit.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_candidates_trigger ON public.candidates;
CREATE TRIGGER audit_candidates_trigger
  AFTER UPDATE OR DELETE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION audit.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit.audit_log_trigger();

DROP TRIGGER IF EXISTS audit_memberships_trigger ON public.memberships;
CREATE TRIGGER audit_memberships_trigger
  AFTER UPDATE OR DELETE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION audit.audit_log_trigger();

-- -----------------------------------------------------------------------------
-- TAREFA 4: FUNÇÃO DE ANONIMIZAÇÃO E EXPURGO LGPD E AGENDAMENTO VIA pg_cron
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.anonymize_expired_candidates_lgpd()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, audit, pg_catalog AS $$
DECLARE
  v_count integer := 0;
BEGIN
  -- 1. Mascaramento / Anonimização de PII de candidatos com soft delete > 5 anos
  WITH target_candidates AS (
    SELECT id FROM public.candidates
    WHERE deleted_at IS NOT NULL
      AND deleted_at < (now() - INTERVAL '5 years')
  ),
  anonymized AS (
    UPDATE public.candidates
    SET nome_completo = 'ANONIMIZADO_LGPD',
        cpf = NULL,
        rg = NULL,
        passaporte = NULL,
        email = NULL,
        telefone = NULL,
        cidade = NULL,
        estado = NULL,
        cep = NULL,
        foto_key = NULL
    WHERE id IN (SELECT id FROM target_candidates)
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM anonymized;

  -- 2. Hard Delete em dados secundários e sensíveis de saúde/documentos expirados
  DELETE FROM public.candidate_health
  WHERE candidate_id IN (
    SELECT id FROM public.candidates
    WHERE deleted_at IS NOT NULL AND deleted_at < (now() - INTERVAL '5 years')
  );

  DELETE FROM public.documents
  WHERE candidate_id IN (
    SELECT id FROM public.candidates
    WHERE deleted_at IS NOT NULL AND deleted_at < (now() - INTERVAL '5 years')
  );

  RETURN v_count;
END;
$$;

-- Habilita extensão pg_cron e agenda execução diária às 03:00 AM
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'lgpd_anonymize_expired_candidates') THEN
    PERFORM cron.unschedule('lgpd_anonymize_expired_candidates');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron unschedule skipped: %', SQLERRM;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule(
    'lgpd_anonymize_expired_candidates',
    '0 3 * * *',
    $cron$ SELECT public.anonymize_expired_candidates_lgpd(); $cron$
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'cron.schedule skipped: %', SQLERRM;
END $$;
