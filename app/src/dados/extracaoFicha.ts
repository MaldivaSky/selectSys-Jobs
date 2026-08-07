/* ═══════════════════════════════════════════════════════════════════════════
   EXTRAÇÃO DA FICHA — arquivo → texto → campos
   ---------------------------------------------------------------------------
   Duas etapas separadas de propósito:

   1. ARQUIVO → TEXTO, no navegador. PDF pelo pdf.js, imagem por OCR, texto
      direto. Fazer isso no cliente evita subir o documento do candidato para
      qualquer servidor antes dele revisar o que será enviado — o arquivo com
      RG e CPF nunca sai do aparelho nesta etapa.

   2. TEXTO → CAMPOS, na Edge Function. É lá que mora a chave da DeepSeek.

   O OCR (tesseract) só é baixado se o candidato enviar uma imagem. São ~12 MB
   de modelo de linguagem: carregar isso adiantado num celular 3G, para um
   candidato que talvez só mande PDF, seria desrespeito com o plano de dados
   dele.
   ═════════════════════════════════════════════════════════════════════════ */

import { supabase } from './supabase';

export type OrigemTexto = 'pdf' | 'imagem' | 'texto';

export interface ProgressoExtracao {
  fase: 'lendo' | 'ocr' | 'ia' | 'pronto';
  /** 0 a 1, quando a fase sabe medir. */
  pct?: number;
  mensagem: string;
}

export interface ResultadoIA {
  campos: Record<string, unknown>;
  confianca: Record<string, number>;
  avisos: string[];
  custo?: { tokens_entrada: number | null; tokens_saida: number | null };
}

export class ErroExtracao extends Error {
  readonly codigo: string;
  /** Texto pronto para o candidato ler — sem jargão nem stack trace. */
  readonly amigavel: string;

  constructor(codigo: string, mensagem: string, amigavel: string) {
    super(mensagem);
    this.name = 'ErroExtracao';
    this.codigo = codigo;
    this.amigavel = amigavel;
  }
}

const LIMITE_BYTES = 12 * 1024 * 1024;

export const TIPOS_ACEITOS = '.pdf,.txt,.jpg,.jpeg,.png,.webp';

/* ── 1. ARQUIVO → TEXTO ─────────────────────────────────────────────────── */

export async function extrairTexto(
  arquivo: File,
  aoProgredir: (p: ProgressoExtracao) => void,
): Promise<{ texto: string; origem: OrigemTexto }> {
  if (arquivo.size > LIMITE_BYTES) {
    throw new ErroExtracao(
      'ARQUIVO_GRANDE',
      `${arquivo.size} bytes`,
      'O arquivo passa de 12 MB. Tente uma foto com resolução menor ou um PDF mais leve.',
    );
  }

  const nome = arquivo.name.toLowerCase();
  const tipo = arquivo.type;

  if (tipo === 'application/pdf' || nome.endsWith('.pdf')) {
    aoProgredir({ fase: 'lendo', mensagem: 'Lendo o PDF...' });
    return { texto: await lerPdf(arquivo, aoProgredir), origem: 'pdf' };
  }

  if (tipo.startsWith('image/')) {
    return { texto: await lerImagem(arquivo, aoProgredir), origem: 'imagem' };
  }

  if (tipo.startsWith('text/') || nome.endsWith('.txt')) {
    aoProgredir({ fase: 'lendo', mensagem: 'Lendo o arquivo...' });
    return { texto: await arquivo.text(), origem: 'texto' };
  }

  throw new ErroExtracao(
    'TIPO_NAO_SUPORTADO',
    tipo,
    'Formato não suportado. Envie PDF, JPG, PNG ou TXT. Se tiver um .doc, exporte como PDF antes.',
  );
}

async function lerPdf(arquivo: File, aoProgredir: (p: ProgressoExtracao) => void): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // O worker precisa ser resolvido pelo bundler, não por CDN: sem rede externa
  // o parsing continua funcionando.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

  const buffer = await arquivo.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  // Currículos passam de 6 páginas raramente; o teto evita travar o celular
  // num PDF de 200 páginas enviado por engano.
  const total = Math.min(doc.numPages, 8);
  const partes: string[] = [];

  for (let i = 1; i <= total; i++) {
    aoProgredir({ fase: 'lendo', pct: i / total, mensagem: `Lendo página ${i} de ${total}...` });
    const pagina = await doc.getPage(i);
    const conteudo = await pagina.getTextContent();
    partes.push(
      conteudo.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' '),
    );
  }

  const texto = partes.join('\n').trim();

  if (texto.length < 40) {
    throw new ErroExtracao(
      'PDF_SEM_TEXTO',
      'camada de texto vazia',
      'Este PDF parece ser uma imagem escaneada, sem texto selecionável. Tire uma foto nítida da folha e envie como JPG — aí conseguimos ler.',
    );
  }
  return texto;
}

async function lerImagem(arquivo: File, aoProgredir: (p: ProgressoExtracao) => void): Promise<string> {
  aoProgredir({ fase: 'ocr', pct: 0, mensagem: 'Preparando a leitura da imagem...' });

  const { createWorker } = await import('tesseract.js');
  // 'por' cobre o currículo brasileiro; 'jpn' cobre documento japonês
  // (zairyu card, koseki) que muitos candidatos já têm em mãos.
  const worker = await createWorker(['por', 'jpn'], 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        aoProgredir({ fase: 'ocr', pct: m.progress, mensagem: `Lendo a imagem... ${Math.round(m.progress * 100)}%` });
      }
    },
  });

  try {
    const { data } = await worker.recognize(arquivo);
    const texto = (data.text ?? '').replace(/\s+/g, ' ').trim();
    if (texto.length < 40) {
      throw new ErroExtracao(
        'IMAGEM_ILEGIVEL',
        'OCR devolveu pouco texto',
        'Não conseguimos ler esta imagem. Tente com mais luz, sem sombra e com a folha reta no enquadramento.',
      );
    }
    return texto;
  } finally {
    await worker.terminate();
  }
}

/* ── 2. TEXTO → CAMPOS ──────────────────────────────────────────────────── */

const MENSAGENS: Record<string, string> = {
  CHAVE_AUSENTE: 'O autopreenchimento ainda não está ativado nesta conta. Você pode preencher a ficha normalmente.',
  SEM_SALDO: 'O autopreenchimento está temporariamente indisponível. Pode preencher a ficha manualmente — nada se perde.',
  LIMITE_EXCEDIDO: 'Muitos envios seguidos. Aguarde alguns minutos e tente de novo.',
  TEXTO_CURTO: 'Não conseguimos ler texto suficiente no arquivo. Tente outro documento ou uma foto mais nítida.',
  TENANT_INVALIDO: 'Este link de captação não está mais ativo. Fale com a agência.',
  IA_INDISPONIVEL: 'O serviço de leitura demorou demais para responder. Tente de novo em instantes.',
  RESPOSTA_NAO_JSON: 'A leitura voltou incompleta. Tente enviar o documento novamente.',
};

/**
 * Recupera o código de erro que a Edge Function devolveu no corpo.
 *
 * Sem isto o candidato recebe sempre a mensagem genérica, e "sem saldo na
 * DeepSeek" fica indistinguível de "documento ilegível" — o que manda a
 * agência caçar o problema no lugar errado.
 */
async function extrairCodigoErro(error: unknown): Promise<string> {
  const ctx = (error as { context?: unknown }).context;

  if (import.meta.env.DEV) {
    console.debug(
      '[extracao] erro bruto ' +
        JSON.stringify({
          nome: (error as Error)?.name,
          mensagem: (error as Error)?.message,
          tipoContexto: (ctx as object)?.constructor?.name,
          ehResponse: typeof Response !== 'undefined' && ctx instanceof Response,
          status: (ctx as Response)?.status,
        }),
    );
  }

  if (!ctx) return 'FALHA_REDE';

  if (typeof Response !== 'undefined' && ctx instanceof Response) {
    try {
      const texto = await ctx.clone().text();
      const corpo = JSON.parse(texto) as { erro?: string };
      if (corpo?.erro) return corpo.erro;
    } catch {
      /* corpo consumido ou não-JSON: cai para as tentativas abaixo */
    }
  }

  if (typeof ctx === 'string') {
    try {
      const corpo = JSON.parse(ctx) as { erro?: string };
      if (corpo?.erro) return corpo.erro;
    } catch {
      /* não era JSON */
    }
  }

  if (typeof ctx === 'object' && ctx !== null && 'erro' in ctx) {
    return String((ctx as { erro: unknown }).erro);
  }

  return 'FALHA_REDE';
}

export async function analisarComIA(
  texto: string,
  tenant: string,
  origem: OrigemTexto,
  aoProgredir: (p: ProgressoExtracao) => void,
): Promise<ResultadoIA> {
  if (!supabase) {
    throw new ErroExtracao('SEM_BANCO', 'cliente supabase ausente', 'Sem conexão com o servidor. Tente mais tarde.');
  }

  aoProgredir({ fase: 'ia', mensagem: 'Identificando seus dados no documento...' });

  const { data, error } = await supabase.functions.invoke('extrair-ficha', {
    body: { texto, tenant, origem },
  });

  // `invoke` trata status >= 400 como erro e guarda a Response em `context`.
  // O corpo pode vir como Response ainda não lida, como texto ou já como
  // objeto, dependendo da versão do supabase-js — daí as três tentativas.
  if (error) {
    const codigo = await extrairCodigoErro(error);
    throw new ErroExtracao(
      codigo,
      error.message,
      MENSAGENS[codigo] ?? 'Não foi possível ler o documento agora. Você pode preencher a ficha manualmente.',
    );
  }

  const resultado = data as ResultadoIA;
  if (!resultado?.campos || Object.keys(resultado.campos).length === 0) {
    throw new ErroExtracao(
      'NADA_ENCONTRADO',
      'campos vazios',
      'Lemos o documento, mas não encontramos dados de ficha nele. Verifique se enviou o arquivo certo.',
    );
  }

  aoProgredir({ fase: 'pronto', mensagem: 'Pronto!' });
  return resultado;
}

/* ── RÓTULOS PARA A TELA DE REVISÃO ─────────────────────────────────────── */

export const ROTULOS: Record<string, string> = {
  nomeCompleto: 'Nome completo',
  dataNascimento: 'Data de nascimento',
  sexo: 'Sexo',
  estadoCivil: 'Estado civil',
  nacionalidade: 'Nacionalidade',
  geracaoNikkei: 'Geração nikkei',
  cpf: 'CPF',
  rg: 'RG',
  passaporte: 'Passaporte',
  passaporteValidade: 'Validade do passaporte',
  vistoValidade: 'Validade do visto',
  alturaCm: 'Altura (cm)',
  pesoKg: 'Peso (kg)',
  escolaridade: 'Escolaridade',
  cep: 'CEP',
  logradouro: 'Logradouro',
  bairro: 'Bairro',
  cidade: 'Cidade',
  estado: 'Estado (UF)',
  email: 'E-mail',
  celular: 'Celular',
  jaEstveJapao: 'Já esteve no Japão',
  experienciasJapao: 'Experiências no Japão',
  nivelJapones: 'Nível de japonês',
  temTatuagem: 'Possui tatuagem',
  usaOculos: 'Usa óculos',
  fuma: 'Fuma',
};

/** Formata o valor extraído para leitura humana na tela de revisão. */
export function formatarValor(chave: string, valor: unknown): string {
  if (Array.isArray(valor)) {
    if (chave === 'experienciasJapao') {
      return valor
        .map((e: Record<string, string>) =>
          [e.empresa, e.provincia, [e.periodoInicio, e.periodoFim].filter(Boolean).join('–')]
            .filter(Boolean)
            .join(' · '),
        )
        .join('  |  ');
    }
    return valor.join(', ');
  }
  const s = String(valor);
  // Datas ISO ficam mais legíveis no formato brasileiro.
  const iso = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (iso) return iso[3] ? `${iso[3]}/${iso[2]}/${iso[1]}` : `${iso[2]}/${iso[1]}`;
  if (chave === 'cpf' && s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (chave === 'cep' && s.length === 8) return s.replace(/(\d{5})(\d{3})/, '$1-$2');
  return s;
}
