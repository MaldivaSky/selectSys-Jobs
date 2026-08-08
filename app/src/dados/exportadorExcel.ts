import ExcelJS from 'exceljs';
import { FICHA_FUJIARTE_2024_06 } from '@selectsys/core';
import { supabase } from './supabase';


/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTADOR EXCEL FIEL AO TEMPLATE FUJIARTE (.XLSX) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Abre o arquivo template ORIGINAL da FUJIARTE (`ficha_fujiarte_template.xlsx`),
   preservando 100% das mesclagens, bordas, fontes e textos em japonês.
   Escreve os dados do candidato diretamente nas 221 células mapeadas.
   ═════════════════════════════════════════════════════════════════════════ */

function formatarDataJaponesa(valor: unknown): string {
  if (!valor) return '';
  const d = new Date(String(valor));
  if (isNaN(d.getTime())) return String(valor);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}/${mes}/${dia}`;
}

function calcularIdade(dataNascimento: unknown): string {
  if (!dataNascimento) return '';
  const d = new Date(String(dataNascimento));
  if (isNaN(d.getTime())) return '';
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) {
    idade--;
  }
  return String(idade);
}

export async function gerarFichaExcel(dados: Record<string, any>): Promise<Blob> {
  // Desembrulha dados vindos de application_data.rascunho, application_data.data ou candidatos
  const appData = Array.isArray(dados?.application_data)
    ? dados.application_data[0]
    : dados?.application_data;

  const rascunho = appData?.rascunho ?? appData?.data ?? dados?.rascunho ?? dados?.data ?? {};
  const valoresRascunho = rascunho?.valores ?? rascunho?.dados ?? (typeof rascunho === 'object' ? rascunho : {});
  const linhasRascunho = rascunho?.linhas ?? {};

  // Objeto unificado mesclando topo, candidates e rascunho do servidor
  const d: Record<string, any> = {
    ...dados,
    ...(dados?.candidates ?? {}),
    ...(typeof valoresRascunho === 'object' ? valoresRascunho : {}),
    ...(typeof linhasRascunho === 'object' ? linhasRascunho : {}),
  };

  // Mapeamento de aliases (camelCase -> snake_case do schema FUJIARTE)
  if (!d.nome_completo && d.nomeCompleto) d.nome_completo = d.nomeCompleto;
  if (!d.data_nascimento && d.dataNascimento) d.data_nascimento = d.dataNascimento;
  if (!d.geracao && d.geracaoNikkei) d.geracao = d.geracaoNikkei;
  if (!d.tem_tatuagem && d.temTatuagem) d.tem_tatuagem = d.temTatuagem;
  if (!d.ja_esteve_japao && d.jaEsteveJapao) d.ja_esteve_japao = d.jaEsteveJapao;
  if (!d.nivel_japones && d.nivelJapones) d.nivel_japones = d.nivelJapones;

  const workbook = new ExcelJS.Workbook();
  let sheet: ExcelJS.Worksheet;

  // Carregar o template XLSX oficial gerado a partir da planilha da FUJIARTE
  try {
    const response = await fetch('/templates/ficha_fujiarte_template.xlsx');
    if (response.ok) {
      const templateArrayBuffer = await response.arrayBuffer();
      await workbook.xlsx.load(templateArrayBuffer);
      sheet = workbook.getWorksheet('FICHA CADASTRAL') || workbook.worksheets[0];
    } else {
      sheet = workbook.addWorksheet('FICHA CADASTRAL');
    }
  } catch {
    sheet = workbook.addWorksheet('FICHA CADASTRAL');
  }

  // Função para escrever celulas por coordenada A1 ("AU2", "A6")
  const setCell = (ref: string, val: any) => {
    if (val === undefined || val === null || val === '') return;
    try {
      const cell = sheet.getCell(ref);
      cell.value = val;
    } catch {
      // Ignora referencias invalidas
    }
  };

  // Preenchimento dos Campos Mapeados no Schema FUJIARTE
  for (const etapa of FICHA_FUJIARTE_2024_06.etapas) {
    if (etapa.campos) {
      for (const campo of etapa.campos) {
        const val = d[campo.key];
        
        if (campo.key === 'idade' && d.data_nascimento) {
          setCell(campo.cell || 'S16', calcularIdade(d.data_nascimento));
          continue;
        }

        if (campo.cellSim && campo.cellNao) {
          const sim = String(val).toLowerCase() === 'sim' || val === true;
          setCell(sim ? campo.cellSim : campo.cellNao, '○');
          continue;
        }

        if (campo.cell && val !== undefined && val !== null && val !== '') {
          if (campo.type === 'date') {
            setCell(campo.cell, formatarDataJaponesa(val));
          } else {
            setCell(campo.cell, Array.isArray(val) ? val.join(' / ') : String(val));
          }
        }
      }
    }

    // Preenchimento de Tabelas Repetíveis (Família, Histórico Japão, Histórico Brasil)
    if (etapa.repetiveis) {
      for (const rep of etapa.repetiveis) {
        const lista = (d[rep.key] as Array<Record<string, any>>) || [];
        const celulas = rep.cellsPorEntrada || [];
        
        lista.slice(0, rep.truncaExportacaoEm).forEach((item, index) => {
          const mapaLinha = celulas[index];
          if (mapaLinha) {
            Object.entries(mapaLinha).forEach(([subKey, cellRef]) => {
              const itemVal = item[subKey];
              if (itemVal) {
                setCell(cellRef, subKey.includes('inicio') || subKey.includes('fim') ? formatarDataJaponesa(itemVal) : String(itemVal));
              }
            });
          }
        });
      }
    }
  }

  // Preenchimento dos Campos Internos da Agência
  if (FICHA_FUJIARTE_2024_06.camposInternos) {
    for (const c of FICHA_FUJIARTE_2024_06.camposInternos) {
      const v = d[c.key];
      if (v && c.cell) {
        setCell(c.cell, c.type === 'date' ? formatarDataJaponesa(v) : String(v));
      }
    }
  }

  // Data de preenchimento automatica (AU2)
  if (!d.data_preenchimento) {
    setCell('AU2', formatarDataJaponesa(new Date().toISOString()));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

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

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTAÇÃO EM LOTE — ASSÍNCRONA VIA FILA (export_jobs)
   ---------------------------------------------------------------------------
   Para 2+ candidatos: não bloqueia a UI. O front enfileira o job, assina
   o canal Realtime de `export_jobs` e baixa o arquivo quando a signed_url
   aparecer (≤30s tipicamente, depende do tamanho do lote).

   Para 1 candidato: ainda usa gerarFichaExcel + baixarFichaExcel (síncrono,
   <2s, sem overhead de fila).
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

/**
 * Enfileira a exportação de um lote de candidatos no banco.
 *
 * A RPC `criar_export_job` valida que TODOS os candidate_ids pertencem à
 * organização do chamador antes de inserir — proteção multi-tenant no banco,
 * não só no front.
 *
 * @returns job_id para subscrição via Realtime, ou null em caso de erro.
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
 * Baixa o arquivo a partir de uma signed URL (resultado do worker assíncrono).
 * A signed URL dura 1h; use dentro deste período.
 */
export async function baixarPorUrl(signedUrl: string, nomeArquivo: string): Promise<void> {
  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error(`Download falhou: ${res.status} ${res.statusText}`);
  const blob = await res.blob();
  baixarFichaExcel(blob, nomeArquivo);
}
