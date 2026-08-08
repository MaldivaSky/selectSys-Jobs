import ExcelJS from 'exceljs';
import { test as base, type Page, type Route } from '@playwright/test';
import {
  CANDIDATO,
  CANDIDATURA,
  ORGANIZACAO,
  RECRUTADOR,
  VAGA,
  VIACEP_RESPOSTA,
} from './dados-mock';

/* ═══════════════════════════════════════════════════════════════════════════
   STUB DE REDE DO SUPABASE
   ---------------------------------------------------------------------------
   Por que interceptar em vez de apontar para um Supabase de verdade:

   1. Um E2E que fala com o banco compartilhado falha quando outra pessoa mexe
      no dado — vermelho que não é regressão. O objetivo aqui é detectar que a
      jornada quebrou, não que alguém moveu um candidato de coluna.
   2. PR de fork não recebe segredo de repositório. Um teste que exige
      `VITE_SUPABASE_URL` real fica permanentemente vermelho nessas PRs.
   3. Submeter ficha grava CPF, passaporte e dado de saúde. Suíte de CI não
      escreve PII em banco nenhum, nem de staging.

   Como funciona: `VITE_SUPABASE_URL` aponta para `<origem-do-app>/__supabase`
   (ver `playwright.config.ts`). Sendo a MESMA origem da página, não há CORS
   nem preflight para emular — o `page.route` devolve a resposta e acabou.

   O stub implementa o pedaço do PostgREST que o app usa de fato: filtro `eq`
   e `neq` na query string, e a distinção entre resposta em lista e resposta
   singular pelo cabeçalho `Accept: application/vnd.pgrst.object+json` que o
   `.single()` / `.maybeSingle()` do supabase-js envia.
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Onde o stub finge que está o arquivo pronto. É a "URL assinada" que a edge
 * function devolveria — mesma origem do preview, para o download não sair da
 * máquina. Ver `responderFuncao`.
 */
export const URL_FICHA_FALSA = '/__ficha-assinada/ficha.xlsx';

/**
 * Um .xlsx de verdade, montado aqui no Node. Serve para o teste exercitar o
 * caminho inteiro do download — invoke → URL assinada → fetch → abrir o
 * arquivo — sem depender do modelo da FUJIARTE, que não está mais no
 * repositório nem no build.
 *
 * Se o modelo oficial foi de fato usado é responsabilidade do servidor agora,
 * e por isso deixou de ser verificável aqui: o E2E confere o contrato entre
 * painel e função, não o conteúdo que a função produz.
 */
async function fichaDeMentira(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const aba = wb.addWorksheet('FICHA CADASTRAL');
  aba.getCell('A6').value = CANDIDATO.nome_completo;
  aba.getCell('A25').value = CANDIDATO.cpf;
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export type Registro = Record<string, any>;

export interface ChamadaRegistrada {
  metodo: string;
  caminho: string;
  parametros: Record<string, string>;
  corpo: unknown;
}

/** Parâmetros do PostgREST que não são filtro de coluna. */
const NAO_SAO_FILTRO = new Set([
  'select',
  'order',
  'limit',
  'offset',
  'on_conflict',
  'columns',
  'apikey',
]);

function aplicarFiltros(linhas: Registro[], parametros: Record<string, string>): Registro[] {
  return linhas.filter((linha) =>
    Object.entries(parametros).every(([coluna, expressao]) => {
      if (NAO_SAO_FILTRO.has(coluna)) return true;
      const [operador, ...resto] = expressao.split('.');
      const alvo = resto.join('.');
      const valor = linha[coluna];
      if (valor === undefined) return true; // coluna que o stub não modela: não filtra
      if (operador === 'eq') return String(valor) === alvo;
      if (operador === 'neq') return String(valor) !== alvo;
      if (operador === 'is') return alvo === 'null' ? valor === null : String(valor) === alvo;
      return true; // operador fora do subconjunto suportado
    }),
  );
}

export class StubSupabase {
  /** Tabela → linhas. Mutável: um teste pode ajustar o cenário antes do goto. */
  readonly tabelas = new Map<string, Registro[]>();
  /** Nome da função → resposta (ou fábrica que recebe os argumentos). */
  readonly rpcs = new Map<string, (argumentos: Registro) => unknown>();
  /** Tudo que passou pelo stub — para o teste afirmar o que foi chamado. */
  readonly chamadas: ChamadaRegistrada[] = [];
  /** Rotas que o app pediu e o stub não modela. Útil para diagnóstico. */
  readonly naoMapeadas: string[] = [];

  private sessao: Registro | null = null;

  constructor() {
    this.tabelas.set('organizations', [ORGANIZACAO]);
    this.tabelas.set('candidates', [CANDIDATO]);
    this.tabelas.set('applications', [CANDIDATURA]);
    this.tabelas.set('jobs', [VAGA]);
    this.tabelas.set('application_data', []);
    this.tabelas.set('consents', []);
    this.tabelas.set('screening_decisions', []);
    this.tabelas.set('pipeline_events', CANDIDATURA.pipeline_events);

    this.rpcs.set('submeter_candidatura', () => [
      { candidate_id: CANDIDATO.id, application_id: CANDIDATURA.id },
    ]);
    this.rpcs.set('buscar_candidatos', () => []);
    this.rpcs.set('criar_export_job', () => ({
      id: '66666666-6666-4666-8666-666666666666',
      status: 'pendente',
      signed_url: null,
      expira_em: null,
      erro_mensagem: null,
      total_candidatos: 1,
      tentativas: 0,
      created_at: new Date().toISOString(),
    }));
  }

  /** Chamadas de uma tabela/função específica, para asserção no teste. */
  chamadasDe(fragmentoDoCaminho: string): ChamadaRegistrada[] {
    return this.chamadas.filter((c) => c.caminho.includes(fragmentoDoCaminho));
  }

  /**
   * Injeta uma sessão válida no `sessionStorage`, na chave `ssj-auth` — o
   * mesmo `storageKey` que `dados/supabase.ts` configura. É o "login simulado"
   * do fluxo B2B: o `ProtectedRoute` chama `auth.getSession()`, que lê daí e
   * libera `/admin` sem passar pela tela de e-mail.
   *
   * `expires_at` fica 24h à frente para o auth-js não disparar refresh.
   *
   * Precisa ser chamado ANTES do `page.goto`.
   */
  async autenticarComo(page: Page, usuario: Registro = RECRUTADOR): Promise<void> {
    this.sessao = {
      access_token: 'e2e-access-token-nao-e-um-jwt-real',
      refresh_token: 'e2e-refresh-token',
      token_type: 'bearer',
      expires_in: 86_400,
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
      user: usuario,
    };

    const chave = 'ssj-auth';
    const valor = JSON.stringify(this.sessao);
    await page.addInitScript(
      ([k, v]) => {
        window.sessionStorage.setItem(k as string, v as string);
      },
      [chave, valor],
    );
  }

  async instalar(page: Page): Promise<void> {
    /* Realtime: o painel assina `export_jobs` e `job_queues`. Sem este mock o
       navegador tenta abrir um WebSocket que ninguém atende e o cliente entra
       em laço de reconexão, poluindo o console. Aqui a conexão é aceita e
       nunca encaminhada — o canal fica mudo, que é o cenário do teste. */
    await page.routeWebSocket(/realtime/, () => {
      /* mock silencioso: não chama connectToServer */
    });

    // ViaCEP: API pública de terceiro. Teste não depende de rede externa.
    await page.route(/viacep\.com\.br/, (rota) =>
      rota.fulfill({ contentType: 'application/json', body: JSON.stringify(VIACEP_RESPOSTA) }),
    );

    // A "URL assinada" do arquivo pronto.
    const ficha = await fichaDeMentira();
    await page.route(/__ficha-assinada/, (rota) =>
      rota.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: ficha,
      }),
    );

    await page.route(/\/__supabase\//, (rota) => this.despachar(rota));
  }

  private async despachar(rota: Route): Promise<void> {
    const requisicao = rota.request();
    const url = new URL(requisicao.url());
    const caminho = url.pathname.replace('/__supabase', '');
    const metodo = requisicao.method();

    const parametros: Record<string, string> = {};
    url.searchParams.forEach((valor, chave) => {
      parametros[chave] = valor;
    });

    let corpo: unknown = null;
    try {
      corpo = requisicao.postDataJSON();
    } catch {
      corpo = requisicao.postData();
    }

    this.chamadas.push({ metodo, caminho, parametros, corpo });

    if (caminho.startsWith('/auth/v1/')) return this.responderAuth(rota, caminho);
    if (caminho.startsWith('/rest/v1/rpc/')) {
      return this.responderRpc(rota, caminho.replace('/rest/v1/rpc/', ''), corpo as Registro);
    }
    if (caminho.startsWith('/rest/v1/')) {
      return this.responderTabela(rota, caminho.replace('/rest/v1/', ''), metodo, parametros, corpo);
    }
    if (caminho.startsWith('/functions/v1/')) {
      return this.responderFuncao(rota, caminho.replace('/functions/v1/', ''));
    }

    this.naoMapeadas.push(`${metodo} ${caminho}`);
    return responder(rota, []);
  }

  /**
   * Edge functions. A que importa é `gerar-ficha-excel`: desde que o modelo da
   * FUJIARTE saiu do repositório e do site, é ela quem monta a ficha, lendo o
   * modelo de um bucket privado. O front só invoca e baixa da URL assinada.
   *
   * O stub devolve a URL assinada apontando para uma rota local que serve um
   * .xlsx de verdade (ver `URL_FICHA_FALSA`), para o teste exercitar o caminho
   * inteiro: invoke → signed URL → download → abrir o arquivo.
   */
  private async responderFuncao(rota: Route, nome: string): Promise<void> {
    if (nome !== 'gerar-ficha-excel') return responder(rota, { ok: true });

    if (this.funcaoDeveFalhar) {
      return responder(
        rota,
        { erro: 'PROCESSAMENTO_FALHOU', detalhe: this.funcaoDeveFalhar },
        500,
      );
    }

    return responder(rota, {
      ok: true,
      job_id: '66666666-6666-4666-8666-666666666666',
      signed_url: URL_FICHA_FALSA,
      expira_em: new Date(Date.now() + 3600_000).toISOString(),
      total_candidatos: 1,
    });
  }

  /** Faz a próxima chamada da função responder 500 com este detalhe. */
  funcaoDeveFalhar: string | null = null;

  private async responderAuth(rota: Route, caminho: string): Promise<void> {
    if (caminho.endsWith('/logout')) return rota.fulfill({ status: 204, body: '' });
    if (caminho.endsWith('/user')) {
      return this.sessao
        ? responder(rota, this.sessao.user)
        : responder(rota, { message: 'não autenticado' }, 401);
    }
    if (caminho.includes('/token')) {
      return this.sessao
        ? responder(rota, this.sessao)
        : responder(rota, { error: 'invalid_grant' }, 400);
    }
    return responder(rota, {});
  }

  private async responderRpc(rota: Route, nome: string, argumentos: Registro): Promise<void> {
    const manipulador = this.rpcs.get(nome);
    if (!manipulador) {
      this.naoMapeadas.push(`RPC ${nome}`);
      return responder(rota, null);
    }
    return responder(rota, manipulador(argumentos ?? {}));
  }

  private async responderTabela(
    rota: Route,
    tabela: string,
    metodo: string,
    parametros: Record<string, string>,
    corpo: unknown,
  ): Promise<void> {
    const singular = querSingular(rota);

    if (metodo === 'GET') {
      const linhas = aplicarFiltros(this.tabelas.get(tabela) ?? [], parametros);
      if (!singular) return responder(rota, linhas);
      // PostgREST devolve 406/PGRST116 quando o singular não acha linha; é
      // esse código que o `.maybeSingle()` do supabase-js converte em null.
      return linhas.length
        ? responder(rota, linhas[0])
        : responder(
            rota,
            { code: 'PGRST116', details: '0 rows', hint: null, message: 'nenhuma linha' },
            406,
          );
    }

    if (metodo === 'DELETE') return responder(rota, singular ? {} : []);

    // POST (insert/upsert) e PATCH (update): devolve o que foi gravado, que é
    // o que o `.select()` encadeado espera. Suficiente para o front seguir.
    const escrito = Array.isArray(corpo) ? corpo : [corpo ?? {}];
    const comId = escrito.map((linha: Registro, indice: number) => ({
      id: (linha && linha.id) || `e2e-${tabela}-${indice}`,
      ...(linha ?? {}),
    }));
    return responder(rota, singular ? comId[0] : comId, 201);
  }
}

function querSingular(rota: Route): boolean {
  const accept = rota.request().headers()['accept'] ?? '';
  return accept.includes('vnd.pgrst.object');
}

function responder(rota: Route, corpo: unknown, status = 200): Promise<void> {
  return rota.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(corpo ?? null),
  });
}

/* ── FIXTURE ───────────────────────────────────────────────────────────────
   Cada teste recebe um stub já instalado na página. Instalar dentro da
   fixture garante que as rotas existem antes de qualquer `goto` do teste —
   `page.route` registrado depois da navegação não pega a primeira leva de
   requisições, que é justamente a que carrega o tenant. */
export const test = base.extend<{ supabase: StubSupabase }>({
  supabase: async ({ page }, usar) => {
    const stub = new StubSupabase();
    await stub.instalar(page);
    await usar(stub);
  },
});

export { expect } from '@playwright/test';
