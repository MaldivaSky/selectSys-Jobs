import { exportarDadosCandidatoLgpd, revogarConsentimentoLgpd, executarExpurgoProgramado24Meses } from '../app/src/services/lgpdService';
import { enviarEmailTransacional, gerarTemplateEmailCoeEmitido } from '../app/src/services/emailService';

async function rodarTestesFase3e4() {
  console.log('🚀 Iniciando Suíte Completa de Testes de Integração FASE 3 & FASE 4...\n');

  let falhas = 0;
  let sucessos = 0;

  const assert = (condicao: boolean, titulo: string) => {
    if (condicao) {
      console.log(`  ✓ PASSOU: ${titulo}`);
      sucessos++;
    } else {
      console.error(`  ✗ FALHOU: ${titulo}`);
      falhas++;
    }
  };

  // ── TESTE 1: LGPD Art. 18 Portabilidade JSON Export ──
  try {
    const res = await exportarDadosCandidatoLgpd('cand_test_123');
    assert(res.sucesso && res.dadosJson !== undefined, 'Fase 3: LGPD Art. 18 Exportação de Portabilidade JSON emite estrutura válida');
  } catch (err: any) {
    assert(false, `Fase 3 LGPD erro: ${err.message}`);
  }

  // ── TESTE 2: Revogação de Consentimento LGPD ──
  try {
    const revog = await revogarConsentimentoLgpd('cand_test_123', 'Solicitação expressa do titular');
    assert(revog.sucesso && revog.mensagem.includes('revogado'), 'Fase 3: Revogação formal de consentimento concluída');
  } catch (err: any) {
    assert(false, `Fase 3 Revogação erro: ${err.message}`);
  }

  // ── TESTE 3: Expurgo Programado de 24 Meses (LGPD Art. 16) ──
  try {
    const expurgo = await executarExpurgoProgramado24Meses();
    assert(expurgo.sucesso, 'Fase 3: Expurgo programado de 24 meses executado com sucesso');
  } catch (err: any) {
    assert(false, `Fase 3 Expurgo erro: ${err.message}`);
  }

  // ── TESTE 4: Template de E-mail COE Emitido ──
  try {
    const html = gerarTemplateEmailCoeEmitido('Taro Yamada', 'COE-JAP-2026-9988');
    assert(html.includes('COE-JAP-2026-9988') && html.includes('Taro Yamada'), 'Fase 4: Template de E-mail COE emitido gera HTML personalizado');
  } catch (err: any) {
    assert(false, `Fase 4 Template E-mail erro: ${err.message}`);
  }

  // ── TESTE 5: E-mail Transacional Resend API ──
  try {
    const emailRes = await enviarEmailTransacional({
      para: 'candidato@exemplo.com',
      assunto: 'Notificação de Visto COE Emitido',
      html: '<h1>Seu visto foi emitido</h1>',
    });
    assert(emailRes.sucesso && String(emailRes.mensagemId).length > 0, 'Fase 4: E-mail transacional processado via Resend API');
  } catch (err: any) {
    assert(false, `Fase 4 Resend API erro: ${err.message}`);
  }

  console.log(`\n📊 RESULTADO DA SUÍTE DE TESTES DAS FASES 3 & 4: ${sucessos} Passaram | ${falhas} Falharam\n`);

  if (falhas > 0) {
    process.exit(1);
  }
}

rodarTestesFase3e4();
