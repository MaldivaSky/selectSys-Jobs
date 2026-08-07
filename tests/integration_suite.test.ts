import { executarTriagem } from '../app/src/dados/triagemEngine';
import { buildGaroonCloudPayload, buildGaroonOnPremiseSoapXml, executarSincronizacaoGaroon } from '../app/src/services/garoonSync';
import { generateSitemapXml } from '../app/src/utils/sitemapGenerator';

/* ═══════════════════════════════════════════════════════════════════════════
   SUÍTE DE TESTES AUTOMATIZADOS DE INTEGRAÇÃO — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Testa empiricamente todos os motores do sistema:
   1. Motor de Triagem Automática (Idade 55+, Descendência e Tatuagem)
   2. Conector Cybozu Garoon (REST API Cloud & SOAP XML On-Premise)
   3. Gerador de Sitemap XML Dinâmico (SEO & Buscadores)
   ═════════════════════════════════════════════════════════════════════════ */

async function rodarTestes() {
  console.log('🚀 Iniciando Suíte de Testes de Integração SelectSys Jobs...\n');

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

  // ── TESTE 1: Motor de Triagem (Regra de Idade 55+) ──
  try {
    const res1 = executarTriagem({ dataNascimento: '1965-01-01' });
    assert(res1.status === 'reprovado' && res1.regrasDisparadas.includes('REGRA_LIMITE_IDADE'), 'Triagem Reprova Candidato de 55+ Anos');
  } catch (err: any) {
    assert(false, `Triagem Idade erro: ${err.message}`);
  }

  // ── TESTE 2: Motor de Triagem (Regra de Descendência) ──
  try {
    const res2 = executarTriagem({ geracaoNikkei: 'nao_descendente' });
    assert(res2.status === 'encerrar_fluxo' && res2.regrasDisparadas.includes('REGRA_DESCENDENCIA'), 'Triagem Encerra Fluxo de Não Descendente');
  } catch (err: any) {
    assert(false, `Triagem Descendência erro: ${err.message}`);
  }

  // ── TESTE 3: Motor de Triagem (Regra de Tatuagem) ──
  try {
    const res3 = executarTriagem({ temTatuagem: 'Sim' });
    assert(res3.status === 'revisao_manual' && res3.regrasDisparadas.includes('REGRA_TATUAGEM'), 'Triagem Encaminha Tatuagem para Revisão Manual');
  } catch (err: any) {
    assert(false, `Triagem Tatuagem erro: ${err.message}`);
  }

  // ── TESTE 4: Conector Cybozu Garoon Cloud (REST API Payload) ──
  try {
    const payload = buildGaroonCloudPayload({
      nome_completo: 'Taro Yamada',
      cpf: '123.456.789-00',
      passaporte: 'TK998877',
      altura_cm: 172,
      peso_kg: 68,
      pe_cm: 26.5,
      geracao: 'nissei',
    });
    assert(payload.app === 1042 && payload.record.candidate_name.value === 'Taro Yamada', 'Garoon Sync Cloud REST constrói payload real');
  } catch (err: any) {
    assert(false, `Garoon Cloud erro: ${err.message}`);
  }

  // ── TESTE 5: Conector Cybozu Garoon On-Premise (SOAP XML) ──
  try {
    const xml = buildGaroonOnPremiseSoapXml(
      { nome_completo: 'Hanako Sato', cpf: '987.654.321-11', passaporte: 'TK112233' },
      'admin_soap',
      'soap_pass_2026'
    );
    assert(xml.includes('<garoon:Username>admin_soap</garoon:Username>') && xml.includes('<garoon:name>Hanako Sato</garoon:name>'), 'Garoon Sync On-Premise gera envelope SOAP XML válido');
  } catch (err: any) {
    assert(false, `Garoon OnPremise erro: ${err.message}`);
  }

  // ── TESTE 6: Validação de Parâmetros de Conexão Garoon ──
  try {
    const garoonRes = await executarSincronizacaoGaroon({
      subdomain: '',
      usuario: '',
      apiToken: '',
      ambiente: 'cloud',
      candidato: {},
    });
    assert(!garoonRes.ok && garoonRes.detalhes.includes('incompletos'), 'Garoon Sync Bloqueia Execução com Parâmetros Ausentes');
  } catch (err: any) {
    assert(false, `Garoon Validação erro: ${err.message}`);
  }

  // ── TESTE 7: Sitemap XML Generator ──
  try {
    const xml = generateSitemapXml([{ loc: 'https://selectsys.jobs/c/fujiarte/vagas', priority: 0.9 }]);
    assert(xml.includes('<urlset') && xml.includes('https://selectsys.jobs/c/fujiarte/vagas'), 'Gerador de Sitemap XML produz estrutura válida');
  } catch (err: any) {
    assert(false, `Sitemap erro: ${err.message}`);
  }

  console.log(`\n📊 RESULTADO DA SUÍTE DE TESTES: ${sucessos} Passaram | ${falhas} Falharam\n`);

  if (falhas > 0) {
    process.exit(1);
  }
}

rodarTestes();
