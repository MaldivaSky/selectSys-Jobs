/* ═══════════════════════════════════════════════════════════════════════════
   ENFILEIRAR-JOB — Rota API Leve para Enfileiramento de Tarefas (HTTP 202 Accepted)
   ---------------------------------------------------------------------------
   1. Recebe requisição de exportação Excel em lote ou extração OCR.
   2. Valida o tenant e os parâmetros de entrada.
   3. Insere o registro na tabela `job_queues` com status `PENDING`.
   4. Retorna HTTP 202 Accepted IMEDIATAMENTE com o `job_id` para o frontend.
   ═════════════════════════════════════════════════════════════════════════ */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json202(corpo: unknown) {
  return new Response(JSON.stringify(corpo), {
    status: 202,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function jsonErro(mensagem: string, status = 400) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonErro('Configuração do servidor incompleta.', 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: { tenant_id?: string; type?: string; payload?: Record<string, any> } = {};
  try {
    body = await req.json();
  } catch {
    return jsonErro('Payload JSON inválido.');
  }

  const { tenant_id, type, payload } = body;

  if (!tenant_id) return jsonErro('tenant_id é obrigatório.');
  if (!type || !['EXCEL_EXPORT', 'OCR_EXTRACT'].includes(type)) {
    return jsonErro('type deve ser EXCEL_EXPORT ou OCR_EXTRACT.');
  }

  // Insere na fila de jobs com status PENDING
  const { data: newJob, error: insertErr } = await supabase
    .from('job_queues')
    .insert({
      tenant_id,
      type,
      payload: payload ?? {},
      status: 'PENDING',
    })
    .select()
    .single();

  if (insertErr || !newJob) {
    return jsonErro(`Falha ao enfileirar job: ${insertErr?.message}`, 500);
  }

  // Retorna HTTP 202 Accepted imediatamente
  return json202({
    sucesso: true,
    message: 'Job enfileirado com sucesso.',
    job_id: newJob.id,
    status: 'PENDING',
    type: newJob.type,
    created_at: newJob.created_at,
  });
});
