/* ═══════════════════════════════════════════════════════════════════════════
   PROCESSAR-JOB — Worker Assíncrono para Filas de Tarefas (Tier 2)
   ---------------------------------------------------------------------------
   Edge Function de processamento pesado em segundo plano:
   - Tipo EXCEL_EXPORT: Gera planilha .xlsx FUJIARTE, faz upload para Storage
     privado `export-fichas` e grava Signed URL (1h) em `result_url`.
   - Tipo OCR_EXTRACT: Processa extração/parsing de currículo com DeepSeek IA,
     salva os campos extraídos no `payload` e atualiza `status` para COMPLETED.
   ═════════════════════════════════════════════════════════════════════════ */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import ExcelJS from 'npm:exceljs@4.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
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
    return jsonResponse({ erro: 'CONFIG_INCOMPLETA', detalhe: 'VARS_SUPABASE_AUSENTES' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ erro: 'PAYLOAD_INVALIDO' }, 400);
  }

  const jobId = body.job_id ?? body.record?.id;
  if (!jobId) {
    return jsonResponse({ erro: 'JOB_ID_AUSENTE' }, 400);
  }

  // 1. Buscar o registro em job_queues
  const { data: job, error: fetchErr } = await supabase
    .from('job_queues')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchErr || !job) {
    return jsonResponse({ erro: 'JOB_NAO_ENCONTRADO', detalhe: fetchErr?.message }, 404);
  }

  // Se já foi concluído, retorna resultado imediatamente
  if (job.status === 'COMPLETED') {
    return jsonResponse({ sucesso: true, status: 'COMPLETED', result_url: job.result_url });
  }

  // 2. Marcar como PROCESSING
  await supabase
    .from('job_queues')
    .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
    .eq('id', jobId);

  try {
    const payload = job.payload ?? {};

    // ── A) PROCESSAMENTO: EXCEL_EXPORT ──────────────────────────────────────
    if (job.type === 'EXCEL_EXPORT') {
      const candidateIds: string[] = payload.candidate_ids ?? [];
      if (candidateIds.length === 0) {
        throw new Error('Nenhum candidate_id informado no payload.');
      }

      // Buscar candidatos completos
      const { data: candidatos, error: candErr } = await supabase
        .from('candidates')
        .select(`
          *,
          work_history (*),
          family_members (*),
          applications (
            id,
            status,
            created_at,
            jobs (titulo, provincia),
            application_data (data)
          )
        `)
        .in('id', candidateIds);

      if (candErr) throw new Error(`Erro ao buscar candidatos: ${candErr.message}`);

      // Gerar Pasta de Trabalho Excel com ExcelJS
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SelectSys Jobs Engine Tier 2';
      workbook.created = new Date();

      const wsResumo = workbook.addWorksheet('Resumo Lote');
      wsResumo.columns = [
        { header: 'ID Candidato', key: 'id', width: 38 },
        { header: 'Nome Completo', key: 'nome', width: 35 },
        { header: 'CPF', key: 'cpf', width: 16 },
        { header: 'E-mail', key: 'email', width: 30 },
        { header: 'Telefone', key: 'telefone', width: 18 },
        { header: 'Cidade/UF', key: 'cidade', width: 20 },
        { header: 'Geração Nikkei', key: 'geracao', width: 18 },
        { header: 'Nível Japonês', key: 'nivel_japones', width: 22 },
        { header: 'Vaga Desejada', key: 'vaga', width: 30 },
        { header: 'Status Candidatura', key: 'status', width: 22 },
      ];

      (candidatos ?? []).forEach((c: any) => {
        const appRecente = Array.isArray(c.applications) ? c.applications[0] : null;
        const vaga = appRecente?.jobs ? `${appRecente.jobs.titulo} (${appRecente.jobs.provincia ?? 'JP'})` : 'Banco de Talentos';
        wsResumo.addRow({
          id: c.id,
          nome: c.nome_completo,
          cpf: c.cpf ?? 'N/A',
          email: c.email ?? 'N/A',
          telefone: c.telefone ?? 'N/A',
          cidade: c.cidade ? `${c.cidade}/${c.estado ?? ''}` : 'N/A',
          geracao: c.geracao ?? 'N/A',
          nivel_japones: c.nivel_japones ?? 'N/A',
          vaga,
          status: appRecente?.status ?? 'cadastrado',
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const storagePath = `${job.tenant_id}/${job.id}.xlsx`;

      // Upload para o Storage Bucket `export-fichas`
      const { error: uploadErr } = await supabase.storage
        .from('export-fichas')
        .upload(storagePath, buffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: true,
        });

      if (uploadErr) throw new Error(`Erro ao salvar no Storage: ${uploadErr.message}`);

      // Gerar Signed URL por 3600s
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('export-fichas')
        .createSignedUrl(storagePath, 3600);

      if (signedErr || !signedData?.signedUrl) throw new Error(`Erro ao gerar Signed URL: ${signedErr?.message}`);

      // Marcar Job como COMPLETED
      await supabase
        .from('job_queues')
        .update({
          status: 'COMPLETED',
          result_url: signedData.signedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return jsonResponse({
        sucesso: true,
        job_id: jobId,
        status: 'COMPLETED',
        result_url: signedData.signedUrl,
      });
    }

    // ── B) PROCESSAMENTO: OCR_EXTRACT ───────────────────────────────────────
    if (job.type === 'OCR_EXTRACT') {
      const textoDocumento: string = payload.texto ?? '';
      if (!textoDocumento) throw new Error('Nenhum texto informado para extração OCR.');

      const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY') ?? '';
      let camposExtraidos: Record<string, unknown> = {};

      if (deepseekKey) {
        const aiResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Extraia os campos cadastrais do currículo no formato JSON: { nome_completo, cpf, email, telefone, data_nascimento, geracao_nikkei, nivel_japones }',
              },
              { role: 'user', content: textoDocumento.slice(0, 4000) },
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
          }),
        });

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          try {
            camposExtraidos = JSON.parse(aiJson?.choices?.[0]?.message?.content ?? '{}');
          } catch {
            camposExtraidos = {};
          }
        }
      }

      const payloadAtualizado = {
        ...payload,
        resultado: camposExtraidos,
        processado_em: new Date().toISOString(),
      };

      await supabase
        .from('job_queues')
        .update({
          status: 'COMPLETED',
          payload: payloadAtualizado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return jsonResponse({
        sucesso: true,
        job_id: jobId,
        status: 'COMPLETED',
        resultado: camposExtraidos,
      });
    }

    throw new Error(`Tipo de job não suportado: ${job.type}`);
  } catch (err: any) {
    const errorMsg = err?.message ?? 'Erro desconhecido durante execução do worker.';
    await supabase
      .from('job_queues')
      .update({
        status: 'FAILED',
        error_message: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return jsonResponse({ erro: 'FALHA_WORKER', detalhe: errorMsg }, 500);
  }
});
