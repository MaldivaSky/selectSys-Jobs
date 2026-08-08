-- =============================================================================
-- SelectSys Jobs — Migration 06: Processamento Assíncrono e Resiliência (job_queues)
-- ---------------------------------------------------------------------------
-- 1. Tabela `job_queues` para enfileiramento desacoplado de tarefas pesadas.
-- 2. Políticas RLS multi-tenant por `tenant_id`.
-- 3. Índices de performance para status de jobs.
-- 4. Trigger Webhook via `pg_net` para processamento assíncrono em background.
-- =============================================================================

-- 1. TABELA JOB_QUEUES
CREATE TABLE IF NOT EXISTS public.job_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('EXCEL_EXPORT', 'OCR_EXTRACT')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  result_url text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_job_queues_tenant_status ON public.job_queues (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_queues_status ON public.job_queues (status) WHERE status IN ('PENDING', 'PROCESSING');

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.job_queues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_job_queues ON public.job_queues;
CREATE POLICY tenant_isolation_job_queues ON public.job_queues
  FOR ALL
  TO authenticated
  USING (tenant_id = public.app_current_org());

-- Permissões
GRANT ALL ON TABLE public.job_queues TO authenticated, service_role;

-- 4. FUNÇÃO TRIGGER E WEBHOOK PARA DISPARO DE WORKER
CREATE OR REPLACE FUNCTION private.trg_process_job_queue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, pg_catalog
AS $$
DECLARE
  v_url text;
  v_service_key text;
BEGIN
  -- Define URL do worker (Edge Function processar-job)
  v_url := COALESCE(nullif(current_setting('app.edge_function_base_url', true), ''), 'http://localhost:54321/functions/v1') || '/processar-job';
  v_service_key := nullif(current_setting('app.service_role_key', true), '');

  -- Invoca worker em background via pg_net se a extensão estiver ativa no Postgres
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_key, '')
      ),
      body := jsonb_build_object(
        'job_id', NEW.id,
        'record', jsonb_build_object(
          'id', NEW.id,
          'tenant_id', NEW.tenant_id,
          'type', NEW.type,
          'payload', NEW.payload
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_queue_created ON public.job_queues;
CREATE TRIGGER trg_job_queue_created
  AFTER INSERT ON public.job_queues
  FOR EACH ROW
  EXECUTE FUNCTION private.trg_process_job_queue();
