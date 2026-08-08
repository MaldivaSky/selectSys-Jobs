/* ═══════════════════════════════════════════════════════════════════════════
   GERAR-FICHA-EXCEL — Worker assíncrono de exportação FUJIARTE
   ---------------------------------------------------------------------------
   Fluxo:
     1. Recebe { job_id: string } via POST (chamado pelo trigger pg_net ou
        diretamente pelo front para retry manual).
     2. Busca o export_job; valida que está `pendente` ou `falhou` (idempotente).
     3. Marca como `processando` com tentativa incrementada.
     4. Para cada candidate_id: puxa todos os dados do candidato.
     5. Gera o .xlsx com ExcelJS a partir do template FUJIARTE.
     6. Faz upload para `export-fichas/{org_id}/{job_id}.xlsx` (service_role).
     7. Gera signed URL com 1h de validade.
     8. Atualiza export_jobs com status `pronto`, signed_url, expira_em.

   Retry: o trigger dispara apenas no INSERT. Para retries manuais o front
   chama POST /gerar-ficha-excel diretamente. O job volta para `pendente`
   no banco antes do retry via `reiniciar_export_job` (a definir no front).

   Limites:
     - Máximo 3 tentativas por job (campo `tentativas`).
     - Timeout 55s (Edge Function limit do Supabase).
     - ExcelJS processa cada candidato em ~100ms → suporta ~500 candidatos/job.
   ═════════════════════════════════════════════════════════════════════════ */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
// @ts-ignore — ExcelJS é importado via npm: em Deno Edge Functions
import ExcelJS from 'npm:exceljs@4';

const MAX_TENTATIVAS = 3;
const SIGNED_URL_EXPIRY_SECS = 3600; // 1 hora
const BUCKET = 'export-fichas';

function cors(req: Request) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      req.headers.get('access-control-request-headers') ??
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

Deno.serve(async (req: Request) => {
  const CORS = cors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const json = (corpo: unknown, status = 200) =>
    new Response(JSON.stringify(corpo), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ erro: 'Use POST.' }, 405);

  // ── Admin client (service_role) ────────────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── Parse body ─────────────────────────────────────────────────────────
  let corpo: { job_id?: string };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: 'JSON_INVALIDO' }, 400);
  }

  const jobId = corpo.job_id?.trim();
  if (!jobId) return json({ erro: 'job_id obrigatório.' }, 400);

  // ── Buscar e validar o job ─────────────────────────────────────────────
  const { data: job, error: jobErr } = await admin
    .from('export_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (jobErr || !job) return json({ erro: 'JOB_NAO_ENCONTRADO' }, 404);
  if (job.status === 'pronto') return json({ ok: true, signed_url: job.signed_url });
  if (job.tentativas >= MAX_TENTATIVAS && job.status === 'falhou') {
    return json({ erro: 'MAX_TENTATIVAS_ATINGIDO', tentativas: job.tentativas }, 429);
  }

  // ── Marcar como processando (otimistic lock via eq status) ──────────────
  const { error: lockErr } = await admin
    .from('export_jobs')
    .update({
      status: 'processando',
      tentativas: job.tentativas + 1,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', jobId)
    .in('status', ['pendente', 'falhou']);

  if (lockErr) {
    return json({ erro: 'JOB_EM_PROCESSAMENTO', detalhe: lockErr.message }, 409);
  }

  try {
    // ── Buscar dados completos de cada candidato ───────────────────────
    const candidateIds: string[] = job.candidate_ids ?? [];
    if (candidateIds.length === 0) throw new Error('Lista de candidatos vazia.');

    const { data: candidatos, error: candErr } = await admin
      .from('candidates')
      .select(`
        id, nome_completo, cpf, data_nascimento, sexo, estado_civil,
        nacionalidade, geracao, email, telefone, cidade, estado, cep,
        altura_cm, peso_kg, cintura_cm, pe_cm, nivel_japones, tem_tatuagem,
        ja_esteve_japao, passaporte, passaporte_validade, visto, visto_validade,
        work_history ( pais, empresa, empreiteira, tipo_servico, provincia_uf,
                       cidade, periodo_inicio, periodo_fim, motivo_saida, ordem ),
        family_members ( parentesco, nome, idade, telefone, contato_emergencia_japao, provincia )
      `)
      .in('id', candidateIds)
      .eq('organization_id', job.organization_id);

    if (candErr) throw new Error(`Erro ao buscar candidatos: ${candErr.message}`);
    if (!candidatos?.length) throw new Error('Nenhum candidato encontrado para os IDs fornecidos.');

    // ── Criar workbook Excel com múltiplas abas ────────────────────────
    // Cada candidato ganha uma aba separada nomeada pelo CPF (máx 31 chars).
    // Para exportação individual (1 candidato), o arquivo tem 1 aba.
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SelectSys Jobs';
    workbook.created = new Date();

    // Tentar carregar o template FUJIARTE do Storage público
    let templateBuffer: ArrayBuffer | null = null;
    try {
      const templatePath = 'templates/ficha_fujiarte_template.xlsx';
      const { data: templateBlob } = await admin.storage
        .from('public-assets')
        .download(templatePath);
      if (templateBlob) {
        templateBuffer = await templateBlob.arrayBuffer();
      }
    } catch {
      // Template não disponível no Storage — usa planilha em branco estruturada
    }

    for (const candidato of candidatos as Record<string, any>[]) {
      let sheet: ExcelJS.Worksheet;

      if (templateBuffer) {
        const templateWb = new ExcelJS.Workbook();
        await templateWb.xlsx.load(templateBuffer);
        const templateSheet = templateWb.worksheets[0];
        // Copia a estrutura do template para o workbook principal
        sheet = workbook.addWorksheet(
          (candidato.cpf ?? candidato.id).slice(0, 31),
          { properties: templateSheet.properties }
        );
        templateSheet.eachRow({ includeEmpty: true }, (row, rowNum) => {
          const newRow = sheet.getRow(rowNum);
          row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            const newCell = newRow.getCell(colNum);
            newCell.value = cell.value;
            newCell.style = { ...cell.style };
          });
          newRow.commit();
        });
      } else {
        sheet = workbook.addWorksheet(
          (candidato.cpf ?? candidato.id).slice(0, 31)
        );
      }

      // ── Preencher campos mapeados ──────────────────────────────────
      const setCell = (ref: string, val: unknown) => {
        if (val === null || val === undefined || val === '') return;
        try {
          sheet.getCell(ref).value = String(val);
        } catch { /* célula inválida, ignora */ }
      };

      const fmtData = (v: unknown): string => {
        if (!v) return '';
        const d = new Date(String(v));
        if (isNaN(d.getTime())) return String(v);
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      };

      // Mapa direto campo → célula (espelhado do schema TypeScript)
      setCell('A6',  candidato.nome_completo);
      setCell('A16', fmtData(candidato.data_nascimento));
      setCell('A18', candidato.nacionalidade);
      setCell('AI18', candidato.geracao);
      setCell('A25', candidato.cpf);
      setCell('A21', candidato.passaporte);
      setCell('G21', fmtData(candidato.passaporte_validade));
      setCell('X21', candidato.visto);
      setCell('AD21', fmtData(candidato.visto_validade));
      setCell('G35', candidato.logradouro);
      setCell('G37', candidato.bairro);
      setCell('AN37', candidato.cidade);
      setCell('BB37', candidato.estado);
      setCell('G39', candidato.cep);
      setCell('Z39', candidato.email);
      setCell('G41', candidato.telefone);
      setCell('A28', candidato.altura_cm);
      setCell('N28', candidato.peso_kg);
      setCell('AA28', candidato.cintura_cm);
      setCell('AN28', candidato.pe_cm);
      // Tatuagem: marcação ○
      if (candidato.tem_tatuagem) setCell('K129', '○');
      else setCell('P129', '○');
      // Já esteve no Japão
      if (candidato.ja_esteve_japao) setCell('G60', '○');
      else setCell('L60', '○');
      // Data de preenchimento automática
      setCell('AU2', fmtData(new Date().toISOString()));
      // Agência (rodapé)
      setCell('AI144', job.organization_id);

      // Histórico Japão (blocos 1:N)
      const curriculo_japao = (candidato.work_history as any[])
        ?.filter((w: any) => w.pais === 'JP')
        ?.sort((a: any, b: any) => a.ordem - b.ordem)
        ?? [];

      const celulasJapao = [
        { fabrica: 'G62', empreiteira: 'G64', tipo_servico: 'V62', inicio: 'AX66', fim: 'BC66', motivo_saida: 'G70' },
        { fabrica: 'G67', empreiteira: 'G69', tipo_servico: 'V67', inicio: 'AX71', fim: 'BC71', motivo_saida: 'G75' },
        { fabrica: 'G72', empreiteira: 'G74', tipo_servico: 'V72', inicio: 'AX76', fim: 'BC76', motivo_saida: 'G80' },
        { fabrica: 'G77', empreiteira: 'G79', tipo_servico: 'V77', inicio: 'AX81', fim: 'BC81', motivo_saida: 'G85' },
      ];

      curriculo_japao.slice(0, 4).forEach((w: any, i: number) => {
        const c = celulasJapao[i];
        setCell(c.fabrica, w.empresa);
        setCell(c.empreiteira, w.empreiteira);
        setCell(c.tipo_servico, w.tipo_servico);
        setCell(c.inicio, fmtData(w.periodo_inicio));
        setCell(c.fim, fmtData(w.periodo_fim));
        setCell(c.motivo_saida, w.motivo_saida);
      });

      // Família
      const familia = (candidato.family_members as any[]) ?? [];
      const celFamilia = [
        { parentesco: 'G45', nome: 'L45', idade: 'AM45', telefone: 'AQ45' },
        { parentesco: 'G47', nome: 'L47', idade: 'AM47', telefone: 'AQ47' },
        { parentesco: 'G49', nome: 'L49', idade: 'AM49', telefone: 'AQ49' },
        { parentesco: 'G51', nome: 'L51', idade: 'AM51', telefone: 'AQ51' },
        { parentesco: 'G53', nome: 'L53', idade: 'AM53', telefone: 'AQ53' },
      ];
      familia.slice(0, 5).forEach((f: any, i: number) => {
        const c = celFamilia[i];
        setCell(c.parentesco, f.parentesco);
        setCell(c.nome, f.nome);
        setCell(c.idade, f.idade);
        setCell(c.telefone, f.telefone);
      });
    }

    // ── Serializar e fazer upload ──────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const caminho = `${job.organization_id}/${jobId}.xlsx`;

    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(caminho, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadErr) throw new Error(`Upload falhou: ${uploadErr.message}`);

    // ── Gerar signed URL ───────────────────────────────────────────────
    const { data: signedData, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(caminho, SIGNED_URL_EXPIRY_SECS);

    if (signErr || !signedData?.signedUrl) {
      throw new Error(`Falha ao gerar signed URL: ${signErr?.message}`);
    }

    const expiraEm = new Date(Date.now() + SIGNED_URL_EXPIRY_SECS * 1000).toISOString();

    // ── Atualizar job como pronto ──────────────────────────────────────
    await admin
      .from('export_jobs')
      .update({
        status: 'pronto',
        arquivo_bucket: caminho,
        signed_url: signedData.signedUrl,
        expira_em: expiraEm,
        atualizado_em: new Date().toISOString(),
        erro_mensagem: null,
      })
      .eq('id', jobId);

    return json({
      ok: true,
      job_id: jobId,
      signed_url: signedData.signedUrl,
      expira_em: expiraEm,
      total_candidatos: candidatos.length,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    // ── Marcar job como falhou ─────────────────────────────────────────
    await admin
      .from('export_jobs')
      .update({
        status: 'falhou',
        erro_mensagem: msg.slice(0, 500),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.error(`[gerar-ficha-excel] job ${jobId} falhou:`, msg);
    return json({ erro: 'PROCESSAMENTO_FALHOU', detalhe: msg }, 500);
  }
});
