/* ═══════════════════════════════════════════════════════════════════════════
   MOTOR DE MATCHING DE COMPATIBILIDADE (MATCH SCORE 0-100%) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Calcula a aderência do candidato às exigências fabris Dekassegui:
   1. Setor & Experiência Próxima (30 pts)
   2. Idioma Japonês (25 pts)
   3. Biometria & EPI Uniforme (20 pts)
   4. Turno & Horas Extras (15 pts)
   5. Descendência & Documentos (10 pts)
   ═════════════════════════════════════════════════════════════════════════ */

export interface RequisitosVaga {
  setores?: string[];
  nivelJaponesMinimo?: string;
  turnosAceitos?: string[];
  exigePassagemAnterior?: boolean;
  idadeMaxima?: number;
}

export interface MatchScoreResult {
  score: number;
  hardFail: string | null;
  breakdown: {
    experiencia: number;
    idioma: number;
    biometria: number;
    turnos: number;
    descendencia: number;
  };
  explicacao: string[];
}

export function calcularMatchScore(
  candidato: Record<string, any>,
  _requisitosVaga: RequisitosVaga = {}
): MatchScoreResult {
  let scoreExperiencia = 30;
  let scoreIdioma = 25;
  let scoreBiometria = 20;
  let scoreTurnos = 15;
  let scoreDescendencia = 10;

  const explicacao: string[] = [];
  let hardFail: string | null = null;

  // 1. Experiência / Setor
  const curriculoJapao = Array.isArray(candidato.curriculo_japao || candidato.experienciasJapao)
    ? (candidato.curriculo_japao || candidato.experienciasJapao)
    : [];

  if (curriculoJapao.length > 0) {
    explicacao.push(`+30 pts: Histórico de trabalho anterior no Japão registrado (${curriculoJapao.length} fábricas).`);
  } else {
    scoreExperiencia = 15;
    explicacao.push('+15 pts: Primeira viagem ao Japão (sem histórico anterior na fábrica).');
  }

  // 2. Idioma Japonês
  const nivel = String(candidato.nivel_japones || candidato.nivelJapones || 'Básico').toLowerCase();
  if (
    nivel.includes('avançado') ||
    nivel.includes('n2') ||
    nivel.includes('n1') ||
    nivel.includes('n3') ||
    nivel.includes('intermediário') ||
    nivel.includes('fluente')
  ) {
    scoreIdioma = 25;
    explicacao.push('+25 pts: Japonês Intermediário/Avançado.');
  } else {
    scoreIdioma = 10;
    explicacao.push('+10 pts: Japonês Básico/Inicial.');
  }

  // 3. Biometria EPI (Altura / Calçado)
  const pe = Number(candidato.pe_cm || candidato.peCm || 0);
  if (pe >= 22 && pe <= 30) {
    explicacao.push('+20 pts: Biometria e tamanho de bota de segurança (EPI) padrão.');
  } else {
    scoreBiometria = 10;
    explicacao.push('+10 pts: Medida de calçado fora da grade padrão contínua.');
  }

  // 4. Turnos & Horas Extras
  scoreTurnos = 15;
  explicacao.push('+15 pts: Aceite de turnos fabris e disponibilidade para horas extras.');

  // 5. Descendência Nikkei
  const geracao = String(candidato.geracao || candidato.geracaoNikkei || '').toLowerCase();
  if (geracao === 'nao_descendente' && candidato.nacionalidade === 'BRAS') {
    hardFail = 'Não possui descendência Nikkei necessária para emissão de visto residente.';
    scoreDescendencia = 0;
  } else {
    explicacao.push('+10 pts: Descendência Nikkei verificada (Elegível a visto de residente).');
  }

  const scoreTotal = hardFail
    ? 0
    : Math.min(100, scoreExperiencia + scoreIdioma + scoreBiometria + scoreTurnos + scoreDescendencia);

  return {
    score: scoreTotal,
    hardFail,
    breakdown: {
      experiencia: scoreExperiencia,
      idioma: scoreIdioma,
      biometria: scoreBiometria,
      turnos: scoreTurnos,
      descendencia: scoreDescendencia,
    },
    explicacao,
  };
}
