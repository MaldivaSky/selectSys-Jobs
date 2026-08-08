/* ═══════════════════════════════════════════════════════════════════════════
   JOB QUEUE SERVICE — SELECTSYS JOBS (TIER 2)
   ---------------------------------------------------------------------------
   Serviço de gerenciamento de tarefas assíncronas no frontend:
   - Enfileira exportações Excel e extrações OCR com resposta HTTP 202.
   - Escuta atualizações de status em tempo real via Supabase Realtime (com fallback de polling).
   ═════════════════════════════════════════════════════════════════════════ */

import { supabase } from '../dados/supabase';

export interface JobQueueItem {
  id: string;
  tenant_id: string;
  type: 'EXCEL_EXPORT' | 'OCR_EXTRACT';
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result_url?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Enfileira um job pesado e retorna o ID e status HTTP 202 PENDING imediatamente.
 */
export async function solicitarJobAssincrono(
  tenantId: string,
  type: 'EXCEL_EXPORT' | 'OCR_EXTRACT',
  payload: Record<string, any>
): Promise<{ jobId: string; status: string }> {
  if (!supabase) {
    throw new Error('Cliente Supabase não inicializado.');
  }

  const { data, error } = await supabase
    .from('job_queues')
    .insert({
      tenant_id: tenantId,
      type,
      payload,
      status: 'PENDING',
    })
    .select('id, status')
    .single();

  if (error || !data) {
    throw new Error(`Falha ao criar tarefa assíncrona: ${error?.message ?? 'Erro desconhecido'}`);
  }

  return { jobId: data.id, status: data.status };
}

/**
 * Escuta alterações de status de um job em tempo real via Supabase Realtime + Polling Fallback.
 */
export function escutarJobRealtime(
  jobId: string,
  onUpdate: (job: JobQueueItem) => void
): () => void {
  if (!supabase) {
    return () => {};
  }

  // 1. Escuta canal Realtime do Supabase
  const channel = supabase
    .channel(`job_queue_${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'job_queues',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as JobQueueItem);
        }
      }
    )
    .subscribe();

  const client = supabase;

  // 2. Polling de fallback a cada 2.5s para garantir resiliência se Realtime cair
  const intervalId = setInterval(async () => {
    if (!client) return;
    const { data } = await client
      .from('job_queues')
      .select('*')
      .eq('id', jobId)
      .single();

    if (data) {
      onUpdate(data as JobQueueItem);
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        clearInterval(intervalId);
      }
    }
  }, 2500);

  // Retorna função de limpeza (cleanup)
  return () => {
    clearInterval(intervalId);
    if (client) {
      void client.removeChannel(channel);
    }
  };
}
