import { test, expect } from './fixtures/supabase-stub';
import { observarDialogos, observarRede } from './fixtures/observadores';
import { CANDIDATURA, FICHA_NOVA, ORGANIZACAO } from './fixtures/dados-mock';

/* ═══════════════════════════════════════════════════════════════════════════
   GOLDEN PATH B2C — O CANDIDATO DEKASSEGUI
   ---------------------------------------------------------------------------
   A jornada que não pode quebrar: abrir a ficha pública da agência, preencher
   as 7 etapas, submeter e ver o processo andando. Se isto cai, a agência para
   de receber candidato — é a única entrada de dado do produto.
   ═════════════════════════════════════════════════════════════════════════ */

const ROTA_FICHA = `/c/${ORGANIZACAO.slug}`;
const ROTA_ACOMPANHAMENTO = `/c/${ORGANIZACAO.slug}/acompanhamento`;

/* Título de cada etapa do wizard. Ancorar a navegação no cabeçalho — e não no
   contador "Etapa N de 7" — porque o contador existe duas vezes na página: o
   do rodapé, visível no desktop, e o do resumo compacto, que o CSS esconde
   acima de 768px. Um `getByText` pega o oculto e o teste falha por motivo
   errado. O cabeçalho é único e diz mais: prova que o conteúdo da etapa
   montou, não só que um número mudou. */
const TITULO_DA_ETAPA: Record<number, RegExp> = {
  1: /Etapa 1: Dados Pessoais/,
  2: /Etapa 2: Biometria para EPIs/,
  3: /Etapa 3: Endereço & Contatos de Emergência/,
  4: /Etapa 4: Histórico Laboral no Japão/,
  5: /Etapa 5: Enquete Bloco A/,
  6: /Etapa 6: Enquete de Saúde/,
  7: /Sua Ficha de Cadastro está Pronta/,
};

test.describe('B2C · Candidatura pública', () => {
  test('preenche a ficha das 7 etapas e submete a candidatura', async ({ page, supabase }) => {
    const rede = observarRede(page);
    const dialogos = observarDialogos(page);

    // ── Rota pública do tenant ──────────────────────────────────────────
    await page.goto(ROTA_FICHA);

    await expect(
      page.getByRole('heading', { name: TITULO_DA_ETAPA[1] }),
      'a ficha do tenant precisa abrir na etapa 1 — se caiu no /login, o tenant não foi resolvido',
    ).toBeVisible();

    // A vitrine do tenant tem que ter sido lida pelo slug da URL.
    expect(supabase.chamadasDe('/rest/v1/organizations').length).toBeGreaterThan(0);

    // ── Etapa 1: identificação ──────────────────────────────────────────
    await page.getByPlaceholder('MARINA TANAKA OLIVEIRA').fill(FICHA_NOVA.nomeCompleto);
    await page.locator('input[type="date"]').first().fill(FICHA_NOVA.dataNascimento);
    await page.getByPlaceholder('000.000.000-00').fill(FICHA_NOVA.cpf);

    // O CPF passa nos dígitos verificadores: nenhuma mensagem de campo.
    await expect(page.getByText('CPF inválido — confira os números.')).toBeHidden();

    await avancar(page, 2);

    // ── Etapa 2: biometria de EPI ───────────────────────────────────────
    await page.getByPlaceholder('Ex: 175').fill(FICHA_NOVA.alturaCm);
    await page.getByPlaceholder('Ex: 72').fill(FICHA_NOVA.pesoKg);
    await page.getByPlaceholder('Ex: 85').fill(FICHA_NOVA.cinturaCm);
    await page.getByPlaceholder('Ex: 26.5').fill(FICHA_NOVA.peCm);

    await avancar(page, 3);

    // ── Etapa 3: endereço e contato ─────────────────────────────────────
    await page.getByPlaceholder('07064-020').fill(FICHA_NOVA.cep);
    // O ViaCEP (stubado) devolve o logradouro e o wizard preenche sozinho.
    await expect(page.getByText(/Vila Rosália, Guarulhos\/SP/)).toBeVisible();

    await page.getByPlaceholder('(11) 99999-9999').fill(FICHA_NOVA.celular);
    await page
      .getByPlaceholder('Rua Gabriel Vasconcelos, 265')
      .fill(FICHA_NOVA.logradouro);

    await avancar(page, 4); // histórico no Japão: candidato de primeira viagem
    await avancar(page, 5); // enquete bloco A: os padrões já servem
    await avancar(page, 6);

    // ── Etapa 6: consentimento LGPD Art. 11 (saúde) ─────────────────────
    // Sem este aceite o envio é barrado — é o único campo travante da etapa.
    const consentimento = page.locator(
      'label:has-text("Termo de Consentimento LGPD Art. 11") input[type="checkbox"]',
    );
    await consentimento.check();
    await expect(consentimento).toBeChecked();

    await avancar(page, 7);

    // ── Etapa 7: envio ──────────────────────────────────────────────────
    await page.getByRole('button', { name: /Enviar Candidatura/ }).click();

    // ── Confirmação ─────────────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: 'Ficha Submetida com Sucesso!' }),
    ).toBeVisible();
    await expect(page.getByText(`Sua candidatura foi gravada na base da`)).toBeVisible();

    // Nenhum alert() de campo obrigatório: a validação do wizard passou toda.
    expect(dialogos, `o formulário recusou algum campo: ${dialogos.join(' | ')}`).toEqual([]);

    // A persistência foi mesmo acionada, com o slug do tenant certo.
    const envios = supabase.chamadasDe('/rest/v1/rpc/submeter_candidatura');
    expect(envios, 'a RPC de submissão precisa ter sido chamada').toHaveLength(1);
    expect((envios[0].corpo as Record<string, unknown>).p_org_slug).toBe(ORGANIZACAO.slug);

    // O consentimento de saúde precisa viajar como concedido — é o registro
    // que sustenta o tratamento de dado sensível perante a LGPD.
    const consentimentosEnviados = (envios[0].corpo as Record<string, any>).p_consentimentos;
    expect(consentimentosEnviados.saude_v1).toBe(true);

    expect(rede.erros, `houve resposta 5xx na jornada:\n${rede.resumo()}`).toEqual([]);
  });

  test('portal de acompanhamento mostra a etapa 1 do processo', async ({ page, supabase }) => {
    const rede = observarRede(page);

    // O portal só mostra a linha do tempo para o titular identificado: a RLS
    // recorta no Postgres, mas a tela exige sessão antes mesmo de consultar.
    await supabase.autenticarComo(page);

    await page.goto(ROTA_ACOMPANHAMENTO);

    await expect(page.getByRole('heading', { name: 'Acompanhamento do seu processo' })).toBeVisible();

    // A candidatura do stub está em `recebida` — primeira posição da régua.
    await expect(page.getByRole('heading', { name: 'Ficha recebida' })).toBeVisible();
    await expect(page.getByText(`Etapa 1 de 11`)).toBeVisible();

    // E o passo correspondente aparece marcado como o atual, não como futuro.
    const passoAtual = page.locator('.ssj-acomp__passo.e-atual');
    await expect(passoAtual).toHaveCount(1);
    await expect(passoAtual).toContainText('Ficha recebida');

    // A leitura foi filtrada pela organização da URL — recorte multi-tenant.
    const leituras = supabase.chamadasDe('/rest/v1/applications');
    expect(leituras.length).toBeGreaterThan(0);
    expect(leituras[0].parametros.organization_id).toBe(`eq.${CANDIDATURA.organization_id}`);

    expect(rede.erros, `houve resposta 5xx na jornada:\n${rede.resumo()}`).toEqual([]);
  });
});

/**
 * Avança uma etapa pelo botão do rodapé e confirma que o wizard chegou lá.
 * Assertar a etapa a cada passo faz a falha apontar onde a navegação travou,
 * em vez de estourar lá na frente com um campo "não encontrado".
 */
async function avancar(page: import('@playwright/test').Page, etapaEsperada: number) {
  await page.getByRole('button', { name: /Próxima/ }).click();
  await expect(
    page.getByRole('heading', { name: TITULO_DA_ETAPA[etapaEsperada] }),
    `o wizard não chegou na etapa ${etapaEsperada}`,
  ).toBeVisible();
}
