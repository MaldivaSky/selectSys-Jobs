/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · DOMÍNIO — OS 17 ESTADOS DO FUNIL DEKASSEGUI
   ---------------------------------------------------------------------------
   Cada estado carrega o termo que a contraparte japonesa usa no papel dela.
   Não é tradução literal: é o vocabulário operacional da imigração e do RH
   japonês. 内定 não é "aprovado", é a palavra que existe para oferta de
   emprego no Japão. 在留資格認定証明書 não é "COE", é o nome do documento.

   Usar o termo errado — 派遣 no lugar de 請負, por exemplo — denuncia
   desconhecimento do processo numa reunião. Por isso isto é dado central,
   não string espalhada por tela.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Os 17 estados de `application_status` (docs/schema/schema.sql). */
export type StatusCandidatura =
  | 'rascunho'
  | 'recebida'
  | 'verificacao_documentos'
  | 'aguardando_entrevista'
  | 'entrevista_realizada'
  | 'aprovado_entrevista'
  | 'curriculo_enviado_japao'
  | 'selecao_empresa_japonesa'
  | 'entrevista_empresa_japonesa'
  | 'aprovado_oferta'
  | 'preparacao_coe'
  | 'coe_andamento'
  | 'coe_emitido'
  | 'visto_andamento'
  | 'visto_emitido'
  | 'preparacao_viagem'
  | 'chegada_japao'
  | 'admissao_concluida'
  | 'reprovado'
  | 'desistente'
  | 'inativo';

export type TomStatus = 'neutro' | 'andamento' | 'positivo' | 'atencao' | 'encerrado';

export interface DefinicaoStatus {
  id: StatusCandidatura;
  pt: string;
  /** Termo japonês operacional — o que aparece no documento deles. */
  ja: string;
  /** Leitura em romaji: o brasileiro consegue pronunciar na reunião. */
  romaji: string;
  /** Etapa do funil de 11 passos a que o estado pertence. */
  etapa: number;
  /** O que precisa acontecer para sair deste estado. */
  descricao: string;
  tom: TomStatus;
  /** Prazo típico do estado, em dias — base dos alertas de SLA. */
  slaDias?: number;
}

export const STATUS: Record<StatusCandidatura, DefinicaoStatus> = {
  rascunho: {
    id: 'rascunho',
    pt: 'Rascunho',
    ja: '入力中',
    romaji: 'nyūryoku-chū',
    etapa: 1,
    descricao: 'A ficha começou a ser preenchida e ainda não foi enviada.',
    tom: 'neutro',
  },
  recebida: {
    id: 'recebida',
    pt: 'Candidatura recebida',
    ja: '受付',
    romaji: 'uketsuke',
    etapa: 1,
    descricao: 'Ficha enviada. A triagem automática já rodou.',
    tom: 'andamento',
    slaDias: 1,
  },
  verificacao_documentos: {
    id: 'verificacao_documentos',
    pt: 'Verificação de documentos',
    ja: '書類確認',
    romaji: 'shorui kakunin',
    etapa: 2,
    descricao: 'Conferência de passaporte, RG, koseki e comprovação de descendência.',
    tom: 'andamento',
    slaDias: 5,
  },
  aguardando_entrevista: {
    id: 'aguardando_entrevista',
    pt: 'Aguardando entrevista',
    ja: '面接待ち',
    romaji: 'mensetsu-machi',
    etapa: 3,
    descricao: 'Entrevista agendada com a equipe no Brasil.',
    tom: 'andamento',
    slaDias: 7,
  },
  entrevista_realizada: {
    id: 'entrevista_realizada',
    pt: 'Entrevista realizada',
    ja: '面接済',
    romaji: 'mensetsu-zumi',
    etapa: 3,
    descricao: 'Entrevista concluída, aguardando parecer.',
    tom: 'andamento',
    slaDias: 3,
  },
  aprovado_entrevista: {
    id: 'aprovado_entrevista',
    pt: 'Aprovado na entrevista',
    ja: '一次選考通過',
    romaji: 'ichiji senkō tsūka',
    etapa: 4,
    descricao: 'Aprovado no Brasil. A partir daqui o processo segue no Japão.',
    tom: 'positivo',
  },
  curriculo_enviado_japao: {
    id: 'curriculo_enviado_japao',
    pt: 'Ficha enviada ao Japão',
    ja: '書類送付済',
    romaji: 'shorui sōfu-zumi',
    etapa: 5,
    descricao: 'A ficha traduzida foi enviada à empreiteira no Japão.',
    tom: 'andamento',
    slaDias: 3,
  },
  selecao_empresa_japonesa: {
    id: 'selecao_empresa_japonesa',
    pt: 'Em seleção pela empresa japonesa',
    ja: '企業選考中',
    romaji: 'kigyō senkō-chū',
    etapa: 6,
    descricao: 'A fábrica analisa o perfil para uma vaga concreta.',
    tom: 'andamento',
    slaDias: 14,
  },
  entrevista_empresa_japonesa: {
    id: 'entrevista_empresa_japonesa',
    pt: 'Entrevista com a empresa japonesa',
    ja: '企業面接',
    romaji: 'kigyō mensetsu',
    etapa: 6,
    descricao: 'Entrevista direta com a fábrica, normalmente online.',
    tom: 'andamento',
    slaDias: 7,
  },
  aprovado_oferta: {
    id: 'aprovado_oferta',
    pt: 'Oferta aceita',
    ja: '内定',
    romaji: 'naitei',
    etapa: 7,
    descricao: 'Oferta formal da empresa japonesa, aceita pelo candidato.',
    tom: 'positivo',
  },
  preparacao_coe: {
    id: 'preparacao_coe',
    pt: 'Preparação da autorização de visto',
    ja: '在留資格認定証明書 準備',
    romaji: 'zairyū shikaku nintei shōmeisho — junbi',
    etapa: 8,
    descricao: 'Montagem do dossiê que a empresa protocola na imigração japonesa.',
    tom: 'andamento',
    slaDias: 10,
  },
  coe_andamento: {
    id: 'coe_andamento',
    pt: 'Autorização de visto em análise',
    ja: '在留資格認定証明書 申請中',
    romaji: 'zairyū shikaku nintei shōmeisho — shinsei-chū',
    etapa: 8,
    descricao: 'Em análise pelo Departamento de Imigração (入国管理局).',
    tom: 'andamento',
    slaDias: 45,
  },
  coe_emitido: {
    id: 'coe_emitido',
    pt: 'Autorização de visto emitida',
    ja: '在留資格認定証明書 交付',
    romaji: 'zairyū shikaku nintei shōmeisho — kōfu',
    etapa: 8,
    descricao: 'Documento emitido e a caminho do Brasil.',
    tom: 'positivo',
  },
  visto_andamento: {
    id: 'visto_andamento',
    pt: 'Visto em processamento',
    ja: '査証申請中',
    romaji: 'sashō shinsei-chū',
    etapa: 9,
    descricao: 'Protocolado no consulado japonês no Brasil.',
    tom: 'andamento',
    slaDias: 7,
  },
  visto_emitido: {
    id: 'visto_emitido',
    pt: 'Visto emitido',
    ja: '査証発給',
    romaji: 'sashō hakkyū',
    etapa: 9,
    descricao: 'Visto carimbado no passaporte.',
    tom: 'positivo',
  },
  preparacao_viagem: {
    id: 'preparacao_viagem',
    pt: 'Preparação da viagem',
    ja: '渡航準備',
    romaji: 'tokō junbi',
    etapa: 10,
    descricao: 'Passagem, orientação pré-embarque e alojamento definidos.',
    tom: 'andamento',
    slaDias: 14,
  },
  chegada_japao: {
    id: 'chegada_japao',
    pt: 'Chegada ao Japão',
    ja: '入国',
    romaji: 'nyūkoku',
    etapa: 10,
    descricao: 'Desembarque e retirada do 在留カード no aeroporto.',
    tom: 'andamento',
    slaDias: 3,
  },
  admissao_concluida: {
    id: 'admissao_concluida',
    pt: 'Admissão concluída',
    ja: '入社',
    romaji: 'nyūsha',
    etapa: 11,
    descricao: 'Entrada oficial na empresa. O processo se encerra com sucesso.',
    tom: 'positivo',
  },
  reprovado: {
    id: 'reprovado',
    pt: 'Não aprovado',
    ja: '不採用',
    romaji: 'fusaiyō',
    etapa: 0,
    descricao: 'Reprovado com parecer registrado e direito a revisão humana.',
    tom: 'encerrado',
  },
  desistente: {
    id: 'desistente',
    pt: 'Desistência',
    ja: '辞退',
    romaji: 'jitai',
    etapa: 0,
    descricao: 'O candidato desistiu do processo.',
    tom: 'encerrado',
  },
  inativo: {
    id: 'inativo',
    pt: 'Inativo',
    ja: '保留',
    romaji: 'horyū',
    etapa: 0,
    descricao: 'Processo suspenso, sem contato há muito tempo.',
    tom: 'atencao',
  },
};

/** As 11 etapas do funil, como a diretoria enxerga. */
export const ETAPAS_FUNIL = [
  { n: 1, pt: 'Candidatura', ja: '応募', romaji: 'ōbo' },
  { n: 2, pt: 'Triagem automática', ja: '自動選考', romaji: 'jidō senkō' },
  { n: 3, pt: 'Entrevista', ja: '面接', romaji: 'mensetsu' },
  { n: 4, pt: 'Aprovação no Brasil', ja: '一次選考', romaji: 'ichiji senkō' },
  { n: 5, pt: 'Envio da ficha ao Japão', ja: '書類送付', romaji: 'shorui sōfu' },
  { n: 6, pt: 'Seleção pela fábrica', ja: '企業選考', romaji: 'kigyō senkō' },
  { n: 7, pt: 'Oferta', ja: '内定', romaji: 'naitei' },
  { n: 8, pt: 'Autorização de visto', ja: '在留資格認定証明書', romaji: 'zairyū shikaku nintei shōmeisho' },
  { n: 9, pt: 'Visto', ja: '査証', romaji: 'sashō' },
  { n: 10, pt: 'Embarque', ja: '渡航', romaji: 'tokō' },
  { n: 11, pt: 'Admissão', ja: '入社', romaji: 'nyūsha' },
] as const;

export const ORDEM_FUNIL: StatusCandidatura[] = [
  'rascunho',
  'recebida',
  'verificacao_documentos',
  'aguardando_entrevista',
  'entrevista_realizada',
  'aprovado_entrevista',
  'curriculo_enviado_japao',
  'selecao_empresa_japonesa',
  'entrevista_empresa_japonesa',
  'aprovado_oferta',
  'preparacao_coe',
  'coe_andamento',
  'coe_emitido',
  'visto_andamento',
  'visto_emitido',
  'preparacao_viagem',
  'chegada_japao',
  'admissao_concluida',
];

export function statusDaEtapa(etapa: number): DefinicaoStatus[] {
  return ORDEM_FUNIL.map((s) => STATUS[s]).filter((s) => s.etapa === etapa);
}

/** Prazo acumulado até a admissão — usado para prometer prazo ao candidato. */
export function slaAcumuladoDias(): number {
  return ORDEM_FUNIL.reduce((n, s) => n + (STATUS[s].slaDias ?? 0), 0);
}
