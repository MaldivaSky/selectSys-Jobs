import { executarSincronizacaoGaroon } from '../app/src/services/garoonSync';
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

  // ── TESTE 1: Cybozu Garoon REST Cloud Sync ──
  try {
    const garoonRes = await executarSincronizacaoGaroon({
      subdomain: 'fujiarte-japan',
      usuario: 'admin_dekassegui',
      apiToken: 'tok_sec_2026',
      ambiente: 'cloud',
      candidato: { nome_completo: 'MARINA TANAKA OLIVEIRA', cpf: '123.456.789-00', geracao: 'sansei' },
    });
    assert(garoonRes.ok && String(garoonRes.garoonRecordId).startsWith('GRN-'), 'Módulo 1: Garoon REST Cloud Sync envia registro');
  } catch (err: any) {
    assert(false, `Módulo 1 erro: ${err.message}`);
  }

  // ── TESTE 2: Cybozu Garoon SOAP On-Premise Sync ──
  try {
    const garoonSoap = await executarSincronizacaoGaroon({
      subdomain: 'fujiarte-onprem',
      usuario: 'admin_soap',
      apiToken: 'soap_pass',
      ambiente: 'on_premise',
      candidato: { nome_completo: 'HIROSHI TANAKA', passaporte: 'TK887766' },
    });
    assert(garoonSoap.ok && String(garoonSoap.payloadEnviado).includes('<SOAP-ENV:Envelope'), 'Módulo 1: Garoon SOAP Envelope XML gerado com sucesso');
  } catch (err: any) {
    assert(false, `Garoon SOAP erro: ${err.message}`);
  }

  // ── TESTE 3: Match Score Engine (Perfil Ideal -> Score 100%) ──
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

  // ── TESTE 4: Match Score Engine (Hard Fail sem descendência) ──
  try {
    const matchFail = calcularMatchScore({
      nacionalidade: 'BRAS',
      geracao: 'nao_descendente',
    });
    assert(matchFail.score === 0 && matchFail.hardFail !== null, 'Módulo 4: Match Score Engine aciona Hard Fail para Não Descendente');
  } catch (err: any) {
    assert(false, `Match Score HardFail erro: ${err.message}`);
  }

  // ── TESTE 5: Motor de Triagem 3 Regras ──
  try {
    const triagem = executarTriagem({ dataNascimento: '1965-01-01' });
    assert(triagem.status === 'reprovado', 'Módulo 7: Triagem reprova idade 55+ sem histórico de mesma empresa');
  } catch (err: any) {
    assert(false, `Triagem erro: ${err.message}`);
  }

  // ── TESTE 6: Exportador Híbrido Node/Python ──
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
