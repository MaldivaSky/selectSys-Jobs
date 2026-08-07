import { executarSincronizacaoGaroon, buildGaroonCloudPayload, buildGaroonOnPremiseSoapXml } from '../app/src/services/garoonSync';
import { calcularMatchScore } from '../app/src/dados/matchEngine';
import { executarTriagem } from '../app/src/dados/triagemEngine';
import { exportarFichaHibrido } from '../packages/exportador/exportadorNode';

async function rodarTestesFase2() {
  console.log('🚀 Iniciando Suíte Completa de Testes de Integração da FASE 2...\n');

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

  // ── TESTE 1: Cybozu Garoon Cloud Payload Mapping ──
  try {
    const payload = buildGaroonCloudPayload({
      nome_completo: 'MARINA TANAKA OLIVEIRA',
      cpf: '123.456.789-00',
      geracao: 'sansei',
      pe_cm: 24.5,
    });
    assert(payload.app === 1042 && payload.record.candidate_name.value === 'MARINA TANAKA OLIVEIRA', 'Módulo 1: Garoon REST Cloud Payload mapeado corretamente');
  } catch (err: any) {
    assert(false, `Módulo 1 Payload erro: ${err.message}`);
  }

  // ── TESTE 2: Cybozu Garoon SOAP On-Premise Envelope XML ──
  try {
    const xml = buildGaroonOnPremiseSoapXml(
      { nome_completo: 'HIROSHI TANAKA', passaporte: 'TK887766' },
      'admin_soap',
      'soap_pass'
    );
    assert(xml.includes('<garoon:Username>admin_soap</garoon:Username>') && xml.includes('WorkflowCreateItem'), 'Módulo 1: Garoon SOAP Envelope XML gerado com sucesso');
  } catch (err: any) {
    assert(false, `Garoon SOAP erro: ${err.message}`);
  }

  // ── TESTE 3: Garoon Validator com parâmetros incompletos ──
  try {
    const res = await executarSincronizacaoGaroon({
      subdomain: '',
      usuario: '',
      apiToken: '',
      ambiente: 'cloud',
      candidato: {},
    });
    assert(!res.ok && res.detalhes.includes('incompletos'), 'Módulo 1: Validação de credenciais Garoon bloqueia execução sem tokens');
  } catch (err: any) {
    assert(false, `Garoon Validation erro: ${err.message}`);
  }

  // ── TESTE 4: Match Score Engine (Perfil Ideal -> Score 100%) ──
  try {
    const matchIdeal = calcularMatchScore({
      nivel_japones: 'Intermediário (N3)',
      pe_cm: 24.5,
      geracao: 'nissei',
      curriculo_japao: [{ fabrica: 'DENSO' }],
    });
    assert(matchIdeal.score === 100 && matchIdeal.hardFail === null, 'Módulo 4: Match Score Engine calcula 100% para perfil ideal');
  } catch (err: any) {
    assert(false, `Match Score erro: ${err.message}`);
  }

  // ── TESTE 5: Match Score Engine (Hard Fail sem descendência) ──
  try {
    const matchFail = calcularMatchScore({
      nacionalidade: 'BRAS',
      geracao: 'nao_descendente',
    });
    assert(matchFail.score === 0 && matchFail.hardFail !== null, 'Módulo 4: Match Score Engine aciona Hard Fail para Não Descendente');
  } catch (err: any) {
    assert(false, `Match Score HardFail erro: ${err.message}`);
  }

  // ── TESTE 6: Motor de Triagem 3 Regras ──
  try {
    const triagem = executarTriagem({ dataNascimento: '1965-01-01' });
    assert(triagem.status === 'reprovado', 'Módulo 7: Triagem reprova idade 55+ sem histórico de mesma empresa');
  } catch (err: any) {
    assert(false, `Triagem erro: ${err.message}`);
  }

  // ── TESTE 7: Exportador Híbrido Node/Python ──
  try {
    const exportRes = await exportarFichaHibrido({ datsJsonPath: '', saidaXlsPath: 'saida/fase2_teste.xls' } as any);
    assert(exportRes.sucesso, 'Módulo 9: Exportador Híbrido executa geração de arquivo');
  } catch (err: any) {
    assert(false, `Exportador Híbrido erro: ${err.message}`);
  }

  console.log(`\n📊 RESULTADO DA SUÍTE DE TESTES DA FASE 2: ${sucessos} Passaram | ${falhas} Falharam\n`);

  if (falhas > 0) {
    process.exit(1);
  }
}

rodarTestesFase2();
