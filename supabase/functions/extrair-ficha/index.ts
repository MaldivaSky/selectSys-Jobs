/* ═══════════════════════════════════════════════════════════════════════════
   EXTRAIR-FICHA — parsing de currículo/documento com DeepSeek V3
   ---------------------------------------------------------------------------
   Por que uma Edge Function e não uma chamada direta do navegador:

   1. SEGREDO. Toda variável VITE_* entra no bundle enviado ao navegador. Uma
      chave de API paga no bundle é uma chave publicada — qualquer visitante
      lê o JS e gasta o saldo. Aqui a chave vive no ambiente do Supabase.
   2. CORS. api.deepseek.com não envia cabeçalhos CORS; o navegador bloquearia
      a resposta mesmo com a chave correta.
   3. CUSTO. Só aqui dá para impor teto de tokens, tamanho de entrada e
      limite por IP antes de gastar saldo.

   Contrato:
     POST { texto: string, tenant: string, origem?: 'pdf'|'imagem'|'texto' }
     200  { campos: {...}, confianca: {...}, avisos: string[], custo: {...} }
     4xx  { erro: string }
   ═════════════════════════════════════════════════════════════════════════ */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

/* O cliente do app manda cabeçalhos próprios (`x-application`, definido em
   dados/supabase.ts) além dos do supabase-js. Qualquer cabeçalho fora desta
   lista faz o preflight falhar e o navegador nem chega a enviar o POST — o
   sintoma é um FunctionsFetchError genérico, sem nada no log da função.
   Ecoar o que o preflight pediu evita ter que caçar essa lista de novo a cada
   header novo no cliente. */
function cors(req: Request) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      req.headers.get('access-control-request-headers') ??
      'authorization, x-client-info, apikey, content-type, x-application',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

/** Teto de entrada. Um currículo real cabe folgado; o resto é abuso. */
const MAX_CHARS = 24_000;
/** Teto de saída. O JSON da ficha é pequeno; isto limita o gasto por chamada. */
const MAX_TOKENS = 1_400;

/* ── LIMITE POR IP ──────────────────────────────────────────────────────────
   Best-effort: a memória do worker não é compartilhada entre instâncias, mas
   segura a rajada óbvia de um mesmo cliente. O gate forte de produção é
   captcha ou magic link antes do upload — está anotado no plano sênior. */
const JANELA_MS = 10 * 60 * 1000;
const MAX_POR_JANELA = 8;
const visitas = new Map<string, number[]>();

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const anteriores = (visitas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  anteriores.push(agora);
  visitas.set(ip, anteriores);
  if (visitas.size > 5_000) visitas.clear(); // trava de memória
  return anteriores.length > MAX_POR_JANELA;
}

/* ── ESQUEMA DA FICHA ───────────────────────────────────────────────────────
   Os nomes batem 1:1 com o formData do CandidateWizard. Enumerar os valores
   aceitos no próprio prompt é o que evita a IA inventar "Sansei (3ª geração)"
   quando o <select> só entende "sansei". */
const ESQUEMA = `{
  "nomeCompleto":    "string, MAIÚSCULAS, como no documento",
  "dataNascimento":  "string ISO YYYY-MM-DD",
  "sexo":            "M | F",
  "estadoCivil":     "solteiro | casado | divorciado | viuvo | uniao_estavel",
  "nacionalidade":   "string, sigla de 4 letras quando brasileiro: BRAS",
  "geracaoNikkei":   "issei | nissei | sansei | yonsei | nao_descendente",
  "cpf":             "string, só dígitos",
  "rg":              "string",
  "passaporte":      "string",
  "passaporteValidade": "string ISO YYYY-MM-DD",
  "vistoValidade":   "string ISO YYYY-MM-DD",
  "alturaCm":        "string, só número em centímetros",
  "pesoKg":          "string, só número em quilos",
  "escolaridade":    "fundamental | medio_incompleto | medio_completo | superior_incompleto | superior_completo",
  "cep":             "string, só dígitos",
  "logradouro":      "string",
  "bairro":          "string",
  "cidade":          "string",
  "estado":          "string, sigla UF com 2 letras",
  "email":           "string",
  "celular":         "string com DDD",
  "jaEstveJapao":    "sim | nao",
  "experienciasJapao": [
    {
      "empresa": "string",
      "empreiteira": "string",
      "tipoServico": "string",
      "provincia": "string",
      "cidade": "string",
      "periodoInicio": "string ISO YYYY-MM",
      "periodoFim": "string ISO YYYY-MM"
    }
  ],
  "nivelJapones":    "nenhum | basico | intermediario | avancado | fluente",
  "temTatuagem":     "sim | nao",
  "usaOculos":       "sim | nao",
  "fuma":            "sim | nao"
}`;

const INSTRUCAO = `Você extrai dados de currículos e documentos de candidatos brasileiros a trabalho no Japão (dekasseguis). O texto pode vir em português, japonês ou misturado, e pode estar sujo por OCR.

Devolva um objeto json com exatamente duas chaves no topo:
- "campos": objeto seguindo o esquema abaixo. INCLUA APENAS as chaves cujo valor você realmente encontrou no texto. Nunca invente, nunca preencha por estatística, nunca deduza um CPF ou uma data que não esteja escrita. Omitir é sempre melhor que chutar.
- "confianca": objeto com as MESMAS chaves de "campos", cada uma valendo um número de 0 a 1 indicando o quanto o texto sustenta aquele valor. Use abaixo de 0.7 quando o OCR estiver ambíguo.

Esquema dos campos:
${ESQUEMA}

Regras de normalização:
- Datas sempre em ISO. "14/05/1992" vira "1992-05-14". Se só houver mês e ano, use YYYY-MM.
- CPF e CEP apenas com dígitos, sem pontos ou traços.
- Nome completo em MAIÚSCULAS.
- Província japonesa (Aichi, Shizuoka, Gunma...) NÃO é o campo "estado". "estado" é a UF brasileira. Província japonesa só entra dentro de experienciasJapao.
- "Sansei", "3ª geração", "terceira geração" viram "sansei". Aplique o mesmo para issei/nissei/yonsei.
- Se o texto mencionar qualquer trabalho anterior no Japão, jaEstveJapao vira "sim".
- Não devolva markdown, comentários nem texto fora do json.`;

Deno.serve(async (req: Request) => {
  const CORS = cors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const json = (corpo: unknown, status = 200) =>
    new Response(JSON.stringify(corpo), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  if (req.method !== 'POST') return json({ erro: 'Use POST.' }, 405);

  const chave = Deno.env.get('DEEPSEEK_API_KEY');
  if (!chave) {
    return json(
      {
        erro: 'CHAVE_AUSENTE',
        detalhe:
          'DEEPSEEK_API_KEY não está definida nos secrets do projeto. Rode: supabase secrets set DEEPSEEK_API_KEY=sk-...',
      },
      503,
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    'desconhecido';
  if (excedeuLimite(ip)) {
    return json({ erro: 'LIMITE_EXCEDIDO', detalhe: 'Muitos envios seguidos. Tente de novo em alguns minutos.' }, 429);
  }

  let corpo: { texto?: string; tenant?: string; origem?: string };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: 'JSON_INVALIDO' }, 400);
  }

  const texto = (corpo.texto ?? '').trim();
  if (texto.length < 40) {
    return json(
      {
        erro: 'TEXTO_CURTO',
        detalhe: 'Não foi possível ler texto suficiente no arquivo. Se for uma foto, tente uma imagem mais nítida.',
      },
      400,
    );
  }

  // O tenant precisa existir: impede que a função vire um proxy de IA aberto
  // para qualquer um que descubra a URL.
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceKey && corpo.tenant) {
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: org } = await admin
      .from('organizations')
      .select('id')
      .eq('slug', corpo.tenant)
      .eq('ativo', true)
      .maybeSingle();
    if (!org) return json({ erro: 'TENANT_INVALIDO' }, 403);
  }

  const recorte = texto.slice(0, MAX_CHARS);
  const avisos: string[] = [];
  if (texto.length > MAX_CHARS) {
    avisos.push(`O documento é longo; analisamos os primeiros ${MAX_CHARS.toLocaleString('pt-BR')} caracteres.`);
  }

  let resposta: Response;
  try {
    const controle = new AbortController();
    const prazo = setTimeout(() => controle.abort(), 55_000);
    resposta = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave}` },
      signal: controle.signal,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: INSTRUCAO },
          { role: 'user', content: `Origem do texto: ${corpo.origem ?? 'desconhecida'}\n\n---\n${recorte}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: MAX_TOKENS,
      }),
    });
    clearTimeout(prazo);
  } catch (e) {
    return json({ erro: 'IA_INDISPONIVEL', detalhe: String(e) }, 502);
  }

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    // 402 na DeepSeek é saldo esgotado — vale dizer isso com todas as letras.
    const erro = resposta.status === 402 ? 'SEM_SALDO' : 'IA_ERRO';
    return json({ erro, status: resposta.status, detalhe: detalhe.slice(0, 500) }, 502);
  }

  const bruto = await resposta.json();
  const conteudo: string = bruto?.choices?.[0]?.message?.content ?? '';

  let analisado: { campos?: Record<string, unknown>; confianca?: Record<string, number> };
  try {
    analisado = JSON.parse(conteudo);
  } catch {
    return json({ erro: 'RESPOSTA_NAO_JSON', detalhe: conteudo.slice(0, 500) }, 502);
  }

  // Descarta chaves vazias: campo vazio não é extração, é ruído na revisão.
  const campos: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(analisado.campos ?? {})) {
    if (v === null || v === undefined || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    campos[k] = v;
  }

  return json({
    campos,
    confianca: analisado.confianca ?? {},
    avisos,
    custo: {
      tokens_entrada: bruto?.usage?.prompt_tokens ?? null,
      tokens_saida: bruto?.usage?.completion_tokens ?? null,
      cache_hit: bruto?.usage?.prompt_cache_hit_tokens ?? null,
    },
  });
});
