/* ═══════════════════════════════════════════════════════════════════════════
   MOTOR DE TRIAGEM AUTOMATIZADA — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Avalia as regras operacionais Dekassegui na submissão da ficha:
   1. Idade >= 55 anos E sem passagem anterior na mesma empresa → Reprovado
   2. Geração = não_descendente → Encerrar Fluxo (incompatível com visto)
   3. Tatuagem = sim → Revisão Manual (requer fotos e parecer da agência)
   4. Caso contrário → Aprovado para Entrevista

   Retorna o parecer com razões detalhadas (LGPD Art. 20 - direito à explicação).
   ═════════════════════════════════════════════════════════════════════════ */

export interface RegrasOrganizacao {
  limiteIdade: number;
  exigeDescendencia: boolean;
  alertaTatuagem: boolean;
}

export const REGRAS_PADRAO_FUJIARTE: RegrasOrganizacao = {
  limiteIdade: 55,
  exigeDescendencia: true,
  alertaTatuagem: true,
};

export interface ResultadoTriagem {
  status: 'aprovado_entrevista' | 'reprovado' | 'encerrar_fluxo' | 'revisao_manual';
  titulo: string;
  razao: string;
  detalhes: string[];
  regrasDisparadas: string[];
  versaoRuleset: string;
  timestamp: string;
  dadosSnapshot: Record<string, unknown>;
}

export function calcularIdade(dataNascimento: string): number {
  if (!dataNascimento) return 0;
  const birth = new Date(dataNascimento);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function executarTriagem(
  valores: Record<string, unknown>,
  linhasHist: Record<string, unknown[]> = {},
  regras: RegrasOrganizacao = REGRAS_PADRAO_FUJIARTE,
): ResultadoTriagem {
  const dataNasc = (valores.data_nascimento as string) || (valores.dataNascimento as string) || '';
  const idade = calcularIdade(dataNasc);
  const geracao = (valores.geracao as string) || (valores.geracaoNikkei as string) || '';
  const nacionalidade = (valores.nacionalidade as string) || 'BRAS';
  const temTatuagem = String(valores.q15_tatuagem || valores.temTatuagem || '').toLowerCase() === 'sim';
  
  // Verificar se trabalhou previamente na mesma fábrica/empreiteira
  const curriculoJapao = (linhasHist.curriculo_japao || []) as Array<Record<string, unknown>>;
  const trabalhouMesmaEmpresa = curriculoJapao.some(item => {
    const emp = String(item.empreiteira || '').toUpperCase();
    const fab = String(item.fabrica || '').toUpperCase();
    return emp.includes('FUJIARTE') || fab.includes('FUJIARTE');
  });

  const regrasDisparadas: string[] = [];
  const detalhes: string[] = [];
  let status: ResultadoTriagem['status'] = 'aprovado_entrevista';
  let titulo = 'Aprovado para Entrevista';
  let razao = 'Candidato atende aos critérios prévios de elegibilidade da organização.';

  // Regra 1: Geração / Descendência
  if (regras.exigeDescendencia && nacionalidade === 'BRAS' && geracao === 'nao_descendente') {
    status = 'encerrar_fluxo';
    titulo = 'Fluxo Encerrado · Descendência';
    razao = 'Candidato não possui descendência Nikkei necessária para a emissão do visto de residente (定住者).';
    regrasDisparadas.push('REGRA_DESCENDENCIA');
    detalhes.push('Geração declarada: Não é descendente.');
  }

  // Regra 2: Limite de Idade
  if (status !== 'encerrar_fluxo' && idade >= regras.limiteIdade && !trabalhouMesmaEmpresa) {
    status = 'reprovado';
    titulo = 'Triagem: Reprovado por Idade';
    razao = `Idade (${idade} anos) acima do limite de ${regras.limiteIdade} anos sem histórico prévio de trabalho na FUJIARTE.`;
    regrasDisparadas.push('REGRA_LIMITE_IDADE');
    detalhes.push(`Idade calculada: ${idade} anos.`);
    detalhes.push('Passagem prévia na empresa: Não registrada.');
  }

  // Regra 3: Tatuagem (Encaminha para Revisão Manual se não tiver sido encerrado/reprovado por prioridade maior)
  if (status === 'aprovado_entrevista' && temTatuagem && regras.alertaTatuagem) {
    status = 'revisao_manual';
    titulo = 'Revisão Manual · Tatuagem';
    razao = 'Candidato declarou possuir tatuagem. Requer fotos (locais não íntimos) e análise prévia da agência antes da fábrica.';
    regrasDisparadas.push('REGRA_TATUAGEM');
    const regioes = Array.isArray(valores.q15_regioes) ? (valores.q15_regioes as string[]).join(', ') : 'Não especificadas';
    detalhes.push(`Regiões com tatuagem: ${regioes}.`);
  }

  return {
    status,
    titulo,
    razao,
    detalhes,
    regrasDisparadas,
    versaoRuleset: 'ruleset_fujiarte_v1',
    timestamp: new Date().toISOString(),
    dadosSnapshot: {
      idade,
      geracao,
      nacionalidade,
      temTatuagem,
      trabalhouMesmaEmpresa,
    },
  };
}
