import { supabase } from './supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTAÇÃO DA FICHA FUJIARTE (.XLSX) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   A ficha é gerada NO SERVIDOR, pela edge function `gerar-ficha-excel`. Este
   módulo só pede, espera e baixa.

   Por que não no navegador, como era antes
   ---------------------------------------------------------------------------
   O gerador antigo montava o .xlsx aqui, com ExcelJS, a partir de
   `fetch('/templates/ficha_fujiarte_template.xlsx')`. Isso obrigava o modelo da
   ficha — material da FUJIARTE — a estar publicado no site, baixável por
   qualquer pessoa sem login, e versionado no repositório. Quebra de compliance
   com o cliente, e nenhuma quantidade de cuidado no front resolvia: para o
   navegador montar a planilha, o navegador precisa alcançar o modelo.

   Agora o modelo mora no bucket privado `app-templates`, sem policy de leitura
   para `anon` ou `authenticated`. Quem o lê é a edge function, com
   `service_role`. O navegador nunca vê o modelo — só o arquivo pronto, por uma
   URL assinada de 1 hora.

   Efeito colateral bem-vindo: o ExcelJS (~250 KB minificado) sai do bundle.

   O caminho é o mesmo para 1 ou para N candidatos: `criar_export_job` valida no
   Postgres que todos os IDs pertencem à organização de quem pediu — isolamento
   multi-tenant no banco, não na aplicação —, e a função processa.
   ═════════════════════════════════════════════════════════════════════════ */

export interface ExportJob {
  id: string;
  status: 'pendente' | 'processando' | 'pronto' | 'falhou';
  signed_url: string | null;
  expira_em: string | null;
  erro_mensagem: string | null;
  total_candidatos: number;
  tentativas: number;
  created_at: string;
}

/** Dispara o download de um Blob já pronto. */
export function baixarFichaExcel(blob: Blob, nomeArquivo: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo.endsWith('.xlsx') ? nomeArquivo : `${nomeArquivo}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Enfileira a exportação de um lote de candidatos.
 *
 * A RPC `criar_export_job` valida que TODOS os candidate_ids pertencem à
 * organização do chamador antes de inserir — proteção multi-tenant no banco,
 * não só no front.
 */
export async function solicitarExportacaoLote(
  candidateIds: string[],
): Promise<{ jobId: string | null; erro?: string }> {
  if (!supabase) return { jobId: null, erro: 'Banco não configurado.' };
  if (!candidateIds.length) return { jobId: null, erro: 'Lista vazia.' };

  const { data, error } = await supabase
    .rpc('criar_export_job', { p_candidate_ids: candidateIds })
    .single<ExportJob>();

  if (error || !data) {
    return { jobId: null, erro: error?.message ?? 'Falha ao criar job de exportação.' };
  }

  return { jobId: data.id };
}

/**
 * Baixa o arquivo a partir de uma signed URL (resultado do worker).
 * A signed URL dura 1h; use dentro deste período.
 */
export async function baixarPorUrl(signedUrl: string, nomeArquivo: string): Promise<void> {
  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error(`Download falhou: ${res.status} ${res.statusText}`);
  const blob = await res.blob();
  baixarFichaExcel(blob, nomeArquivo);
}

export interface ResultadoExportacao {
  ok: boolean;
  signedUrl?: string;
  jobId?: string;
  erro?: string;
}

/**
 * Gera a ficha de um ou mais candidatos e devolve a URL assinada do arquivo.
 *
 * Cria o job e chama a função na sequência, em vez de criar o job e esperar o
 * trigger. São dois motivos: o recrutador recebe o arquivo na mesma ação, sem
 * depender de Realtime chegar; e uma falha de geração vira erro na hora, com
 * motivo legível, em vez de um job que fica `pendente` para sempre porque o
 * webhook não disparou.
 *
 * O acompanhamento por Realtime segue valendo para lotes grandes, que podem
 * estourar o tempo da invocação.
 */
export async function exportarFichaPeloServidor(
  candidateIds: string[],
): Promise<ResultadoExportacao> {
  if (!supabase) return { ok: false, erro: 'Banco não configurado.' };

  const { jobId, erro } = await solicitarExportacaoLote(candidateIds);
  if (!jobId) return { ok: false, erro: erro ?? 'Não foi possível criar a exportação.' };

  const { data, error } = await supabase.functions.invoke('gerar-ficha-excel', {
    body: { job_id: jobId },
  });

  if (error) {
    return { ok: false, jobId, erro: traduzirErro(error) };
  }

  const resposta = data as { ok?: boolean; signed_url?: string; erro?: string; detalhe?: string };
  if (!resposta?.signed_url) {
    return { ok: false, jobId, erro: resposta?.detalhe ?? resposta?.erro ?? 'A ficha não foi gerada.' };
  }

  return { ok: true, jobId, signedUrl: resposta.signed_url };
}

/**
 * A causa mais provável de falha aqui é o modelo da ficha não estar publicado
 * no bucket privado — e a mensagem crua da função não diz o que fazer.
 */
function traduzirErro(error: unknown): string {
  const bruto = error instanceof Error ? error.message : String(error);
  if (/TEMPLATE_INDISPONIVEL/i.test(bruto)) {
    return 'O modelo da ficha não está publicado no servidor. Avise o suporte técnico — ' +
      'a exportação fica indisponível até isso ser corrigido.';
  }
  return bruto;
}
