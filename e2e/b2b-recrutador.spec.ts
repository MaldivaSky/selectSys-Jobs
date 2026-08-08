import ExcelJS from 'exceljs';
import { test, expect } from './fixtures/supabase-stub';
import { observarDialogos, observarRede } from './fixtures/observadores';
import { CANDIDATO, ORGANIZACAO } from './fixtures/dados-mock';

/* ═══════════════════════════════════════════════════════════════════════════
   GOLDEN PATH B2B — O RECRUTADOR DA AGÊNCIA
   ---------------------------------------------------------------------------
   A jornada que sustenta a mensalidade: entrar no painel, ver o funil e tirar
   a Ficha Cadastral no formato .xlsx que a FUJIARTE aceita no Japão. O Excel
   é o entregável final do produto — sem ele o candidato não embarca.

   O login é simulado por injeção de sessão no `sessionStorage` (mesma chave
   `ssj-auth` do cliente Supabase). Não há credencial de verdade no repo nem
   no runner, e o teste não depende do provedor de e-mail estar de pé.
   ═════════════════════════════════════════════════════════════════════════ */

const ROTA_PAINEL = `/admin/${ORGANIZACAO.slug}`;
const ARQUIVO_ESPERADO = 'marina-tanaka-oliveira-ficha-fujiarte.xlsx';


test.describe('B2B · Painel do recrutador', () => {
  test.beforeEach(async ({ page, supabase }) => {
    await supabase.autenticarComo(page);
  });

  test('acessa o painel autenticado e exporta a Ficha FUJIARTE em .xlsx', async ({
    page,
    supabase,
  }) => {
    const rede = observarRede(page);
    const dialogos = observarDialogos(page);

    // ── Painel sob rota protegida ───────────────────────────────────────
    await page.goto(ROTA_PAINEL);

    // Chegar aqui já prova que o ProtectedRoute aceitou a sessão: sem ela a
    // rota redireciona para /login e nada abaixo existiria na página.
    await expect(page.getByRole('heading', { name: 'Visão Geral' })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${ROTA_PAINEL}$`));
    await expect(page.getByText(`/${ORGANIZACAO.slug}`)).toBeVisible();

    // ── Funil de candidatos ─────────────────────────────────────────────
    await page.getByRole('button', { name: /Funil de Candidatos/ }).click();

    const cartao = page.locator('div').filter({ hasText: CANDIDATO.nome_completo }).last();
    await expect(cartao).toBeVisible();

    // ── Exportação da ficha ─────────────────────────────────────────────
    // O gerador lê o template oficial (`/templates/ficha_fujiarte_template.xlsx`)
    // e escreve as 221 células no browser. Se qualquer parte disso quebrar, ou
    // o download não nasce, ou a resposta do template vem com erro.
    const botaoExcel = page.getByRole('button', { name: /Ficha \.XLS/ }).first();
    await expect(botaoExcel).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      botaoExcel.click(),
    ]);

    expect(download.suggestedFilename()).toBe(ARQUIVO_ESPERADO);

    await expect(
      page.getByText('Ficha Cadastral Excel (.xlsx) baixada com sucesso!'),
    ).toBeVisible();

    /* ── O arquivo, não só o clique ──────────────────────────────────────
       Afirmar apenas que "baixou" deixa passar a pior falha silenciosa deste
       produto: `gerarFichaExcel` engole o erro de carga do template num
       `catch` e devolve uma planilha em branco. O download acontece, o toast
       diz sucesso, e a agência só descobre quando a FUJIARTE recusa a ficha
       no Japão. Por isso o teste abre o .xlsx e confere as duas coisas que
       importam: o template oficial entrou e os dados do candidato foram
       escritos nele. */
    /* O modelo da FUJIARTE não é mais servido pelo site — é material do
       cliente e vive num bucket privado. Confirmar isso faz parte do teste:
       se alguém reintroduzir o arquivo em app/public/, aqui acende. */
    const tentativaTemplate = await page.request.get('/templates/ficha_fujiarte_template.xlsx');
    const tipo = tentativaTemplate.headers()['content-type'] ?? '';
    expect(
      tipo,
      'o modelo da FUJIARTE voltou a ser publicado pelo site — é material do cliente',
    ).not.toContain('spreadsheet');

    /* O painel precisa ter pedido a ficha ao SERVIDOR, com o candidato certo.
       `criar_export_job` valida no Postgres que o candidato pertence à
       organização de quem pediu: é o isolamento multi-tenant. */
    const jobs = supabase.chamadasDe('/rest/v1/rpc/criar_export_job');
    expect(jobs, 'a exportação precisa passar pela RPC que valida o tenant').toHaveLength(1);
    expect((jobs[0].corpo as Record<string, any>).p_candidate_ids).toEqual([CANDIDATO.id]);

    const invocacoes = supabase.chamadasDe('/functions/v1/gerar-ficha-excel');
    expect(invocacoes, 'a edge function de geração precisa ter sido chamada').toHaveLength(1);

    // E o que chegou ao disco é um .xlsx legível, com os dados do candidato.
    const caminho = await download.path();
    expect(caminho, 'o download precisa ter sido materializado em disco').toBeTruthy();

    const planilha = new ExcelJS.Workbook();
    await planilha.xlsx.readFile(caminho!);

    const aba = planilha.getWorksheet('FICHA CADASTRAL');
    expect(aba, 'a aba oficial "FICHA CADASTRAL" precisa existir no arquivo').toBeTruthy();
    expect(
      textoDaPlanilha(aba!),
      'o nome do candidato precisa estar escrito na ficha',
    ).toContain(CANDIDATO.nome_completo);

    // ── Critério de aceite: nada de 5xx na jornada ──────────────────────
    // Vale para tudo que a página pediu — inclusive o template .xlsx e as
    // leituras do painel, não só o clique do Excel.
    expect(rede.erros, `houve resposta 5xx na jornada:\n${rede.resumo()}`).toEqual([]);
    expect(rede.falhas, `houve requisição abortada:\n${rede.resumo()}`).toEqual([]);
    expect(dialogos, `apareceu um alerta inesperado: ${dialogos.join(' | ')}`).toEqual([]);

    // O painel leu os dados do tenant certo — o recorte multi-tenant vale
    // tanto quanto o Excel sair.
    const leituras = supabase.chamadasDe('/rest/v1/applications');
    expect(leituras.length).toBeGreaterThan(0);
    expect(leituras[0].parametros.organization_id).toBe(`eq.${ORGANIZACAO.id}`);
  });

  /* ── A regressão que este teste existe para impedir ─────────────────────
     Por muito tempo, quando a geração da ficha falhava, o app disfarçava: o
     `catch` montava uma planilha vazia e o painel dizia "baixada com sucesso".
     O recrutador mandava para o Japão uma ficha sem um único rótulo da
     FUJIARTE e só descobria quando o cliente recusava.

     Agora falha tem que aparecer como falha. Se alguém reintroduzir qualquer
     fallback silencioso, este teste acende. */
  test('quando o servidor falha, o painel mostra o erro em vez de fingir sucesso', async ({
    page,
    supabase,
  }) => {
    supabase.funcaoDeveFalhar =
      'TEMPLATE_INDISPONIVEL: não foi possível ler app-templates/ficha_fujiarte_template.xlsx';

    await page.goto(ROTA_PAINEL);
    await page.getByRole('button', { name: /Funil de Candidatos/ }).click();

    const botaoExcel = page.getByRole('button', { name: /Ficha \.XLS/ }).first();
    await expect(botaoExcel).toBeVisible();

    let baixou = false;
    page.on('download', () => {
      baixou = true;
    });

    await botaoExcel.click();

    await expect(page.getByText(/Erro na exportação Excel/)).toBeVisible();
    await expect(page.getByText('Ficha Cadastral Excel (.xlsx) baixada com sucesso!')).toBeHidden();
    expect(baixou, 'não pode baixar arquivo nenhum quando a geração falhou').toBe(false);
  });

  test('sem sessão, a rota do painel devolve o usuário para o login', async ({ page, context }) => {
    // Contraprova do teste acima: se `/admin` abrisse sem sessão, o assert de
    // autenticação lá em cima não estaria provando nada.
    await context.clearCookies();
    await page.addInitScript(() => window.sessionStorage.clear());

    await page.goto(ROTA_PAINEL);

    await expect(page).toHaveURL(/\/login$/);
  });
});

/** Concatena todo o texto das células — o corpo da ficha, em uma string. */
function textoDaPlanilha(aba: ExcelJS.Worksheet): string {
  const pedacos: string[] = [];
  aba.eachRow({ includeEmpty: false }, (linha) => {
    linha.eachCell({ includeEmpty: false }, (celula) => {
      const valor = celula.value;
      if (valor == null) return;
      pedacos.push(typeof valor === 'object' ? JSON.stringify(valor) : String(valor));
    });
  });
  return pedacos.join(' ');
}
