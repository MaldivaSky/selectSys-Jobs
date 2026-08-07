/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · DOMÍNIO — VOCABULÁRIO JAPONÊS DA OPERAÇÃO
   ---------------------------------------------------------------------------
   Documentos, regimes de contratação, turnos, províncias e datas em 和暦.
   Tudo aqui existe porque aparece no papel da FUJIARTE ou no balcão da
   imigração. Nada é enfeite.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Termo {
  pt: string;
  ja: string;
  romaji: string;
  nota?: string;
}

/* ── Documentos ──────────────────────────────────────────────────────────── */
export const DOCUMENTOS: Record<string, Termo> = {
  foto: { pt: 'Foto', ja: '写真', romaji: 'shashin' },
  passaporte: { pt: 'Passaporte', ja: '旅券', romaji: 'ryoken', nota: 'パスポート no uso corrente' },
  rg: { pt: 'RG', ja: '身分証明書', romaji: 'mibun shōmeisho' },
  cpf: { pt: 'CPF', ja: '納税者番号', romaji: 'nōzeisha bangō' },
  koseki: {
    pt: 'Certidão de família japonesa',
    ja: '戸籍謄本',
    romaji: 'koseki tōhon',
    nota: 'O documento é o tōhon (a cópia integral), não o registro em si. Comprova a descendência.',
  },
  reentry: {
    pt: 'Autorização de reentrada',
    ja: '再入国許可',
    romaji: 'sainyūkoku kyoka',
    nota: 'みなし再入国許可 é a modalidade simplificada, válida por 1 ano.',
  },
  zairyu_card: { pt: 'Cartão de residência', ja: '在留カード', romaji: 'zairyū kādo' },
  coe: {
    pt: 'Autorização prévia de visto',
    ja: '在留資格認定証明書',
    romaji: 'zairyū shikaku nintei shōmeisho',
    nota: 'O que se chama "COE" no Brasil. Emitido pela imigração japonesa a pedido da empresa.',
  },
  visto: { pt: 'Visto', ja: '査証', romaji: 'sashō', nota: 'ビザ no uso coloquial; 査証 no documento.' },
  juminhyo: { pt: 'Comprovante de residência no Japão', ja: '住民票', romaji: 'jūminhyō' },
  foto_tatuagem: { pt: 'Foto de tatuagem', ja: '入れ墨の写真', romaji: 'irezumi no shashin' },
  atestado_medico: { pt: 'Atestado médico', ja: '健康診断書', romaji: 'kenkō shindansho' },
};

/* ── Status de residência (o visto que o nikkei realmente recebe) ────────── */
export const STATUS_RESIDENCIA: Record<string, Termo> = {
  teijusha: {
    pt: 'Residente de longa permanência',
    ja: '定住者',
    romaji: 'teijūsha',
    nota: 'Status típico do sansei e do yonsei. Permite trabalhar sem restrição de atividade.',
  },
  nihonjin_haiguusha: {
    pt: 'Cônjuge ou filho de japonês',
    ja: '日本人の配偶者等',
    romaji: 'nihonjin no haigūsha tō',
    nota: 'Status do nissei e do cônjuge de japonês.',
  },
  eijusha: { pt: 'Residente permanente', ja: '永住者', romaji: 'eijūsha' },
  gijutsu: {
    pt: 'Engenharia / humanidades / serviços internacionais',
    ja: '技術・人文知識・国際業務',
    romaji: 'gijutsu jinbun chishiki kokusai gyōmu',
  },
  tokutei_ginou: {
    pt: 'Trabalhador especializado',
    ja: '特定技能',
    romaji: 'tokutei ginō',
    nota: 'Criado em 2019 para setores com falta de mão de obra.',
  },
};

/* ── Regime de contratação — errar aqui é erro jurídico, não de tradução ── */
export const REGIMES: Record<string, Termo> = {
  haken: {
    pt: 'Empresa de trabalho temporário',
    ja: '派遣会社',
    romaji: 'haken-gaisha',
    nota: 'O trabalhador é empregado da haken e recebe ordens da fábrica. Regido pela 労働者派遣法.',
  },
  ukeoi: {
    pt: 'Empresa contratada por empreitada',
    ja: '請負会社',
    romaji: 'ukeoi-gaisha',
    nota: 'A empresa entrega um resultado e comanda a própria equipe. A fábrica NÃO dá ordens diretas — confundir com haken configura 偽装請負 (empreitada disfarçada), que é ilegal.',
  },
  seishain: { pt: 'Efetivo', ja: '正社員', romaji: 'seishain' },
  keiyaku: { pt: 'Contrato por prazo determinado', ja: '契約社員', romaji: 'keiyaku shain' },
  arubaito: { pt: 'Trabalho por hora', ja: 'アルバイト', romaji: 'arubaito' },
};

/* ── Turnos, jornada e chão de fábrica ───────────────────────────────────── */
export const TRABALHO: Record<string, Termo> = {
  kojo: { pt: 'Fábrica', ja: '工場', romaji: 'kōjō' },
  nikkin: { pt: 'Turno diurno', ja: '日勤', romaji: 'nikkin' },
  yakin: { pt: 'Turno noturno', ja: '夜勤', romaji: 'yakin' },
  kotai: { pt: 'Turno alternado', ja: '交替勤務', romaji: 'kōtai kinmu' },
  zangyo: { pt: 'Hora extra', ja: '残業', romaji: 'zangyō' },
  kyujitsu: { pt: 'Folga', ja: '休日', romaji: 'kyūjitsu' },
  ryo: { pt: 'Alojamento da empresa', ja: '寮', romaji: 'ryō' },
  jikyu: { pt: 'Salário por hora', ja: '時給', romaji: 'jikyū' },
  denshi: { pt: 'Eletrônica', ja: '電子部品', romaji: 'denshi buhin' },
  jidosha: { pt: 'Autopeças', ja: '自動車部品', romaji: 'jidōsha buhin' },
  shokuhin: { pt: 'Alimentício', ja: '食品', romaji: 'shokuhin' },
};

/* ── Pessoas e tratamento ────────────────────────────────────────────────── */
export const TRATAMENTO = {
  /** Pessoa física: sobrenome + 様. Nunca usar com o próprio nome. */
  pessoa: (nome: string) => `${nome} 様`,
  /** Empresa: razão social + 御中. */
  empresa: (nome: string) => `${nome} 御中`,
  nikkei: { pt: 'Descendente de japonês', ja: '日系人', romaji: 'nikkeijin' } as Termo,
  geracoes: {
    issei: { pt: '1ª geração', ja: '一世', romaji: 'issei' },
    nissei: { pt: '2ª geração', ja: '二世', romaji: 'nisei' },
    sansei: { pt: '3ª geração', ja: '三世', romaji: 'sansei' },
    yonsei: { pt: '4ª geração', ja: '四世', romaji: 'yonsei' },
  } as Record<string, Termo>,
  /** Ficha do candidato, no formato que o RH japonês reconhece. */
  ficha: { pt: 'Ficha do candidato', ja: '応募者カルテ', romaji: 'ōbosha karute' } as Termo,
  curriculo: { pt: 'Currículo', ja: '履歴書', romaji: 'rirekisho' } as Termo,
  historico: { pt: 'Histórico profissional', ja: '職務経歴書', romaji: 'shokumu keirekisho' } as Termo,
};

/* ── As 47 províncias ─────────────────────────────────────────────────────
   `nikkei: true` marca onde a comunidade brasileira se concentra — essas
   sobem no topo do seletor, porque são ~90% das respostas reais.            */
export interface Provincia {
  codigo: string;
  pt: string;
  ja: string;
  romaji: string;
  regiao: string;
  nikkei?: boolean;
}

export const PROVINCIAS: Provincia[] = [
  { codigo: 'aichi', pt: 'Aichi', ja: '愛知県', romaji: 'Aichi-ken', regiao: 'Chūbu', nikkei: true },
  { codigo: 'shizuoka', pt: 'Shizuoka', ja: '静岡県', romaji: 'Shizuoka-ken', regiao: 'Chūbu', nikkei: true },
  { codigo: 'mie', pt: 'Mie', ja: '三重県', romaji: 'Mie-ken', regiao: 'Kansai', nikkei: true },
  { codigo: 'gunma', pt: 'Gunma', ja: '群馬県', romaji: 'Gunma-ken', regiao: 'Kantō', nikkei: true },
  { codigo: 'gifu', pt: 'Gifu', ja: '岐阜県', romaji: 'Gifu-ken', regiao: 'Chūbu', nikkei: true },
  { codigo: 'nagano', pt: 'Nagano', ja: '長野県', romaji: 'Nagano-ken', regiao: 'Chūbu', nikkei: true },
  { codigo: 'shiga', pt: 'Shiga', ja: '滋賀県', romaji: 'Shiga-ken', regiao: 'Kansai', nikkei: true },
  { codigo: 'kanagawa', pt: 'Kanagawa', ja: '神奈川県', romaji: 'Kanagawa-ken', regiao: 'Kantō', nikkei: true },
  { codigo: 'saitama', pt: 'Saitama', ja: '埼玉県', romaji: 'Saitama-ken', regiao: 'Kantō', nikkei: true },
  { codigo: 'ibaraki', pt: 'Ibaraki', ja: '茨城県', romaji: 'Ibaraki-ken', regiao: 'Kantō', nikkei: true },
  { codigo: 'tochigi', pt: 'Tochigi', ja: '栃木県', romaji: 'Tochigi-ken', regiao: 'Kantō', nikkei: true },
  { codigo: 'hokkaido', pt: 'Hokkaidō', ja: '北海道', romaji: 'Hokkaidō', regiao: 'Hokkaidō' },
  { codigo: 'aomori', pt: 'Aomori', ja: '青森県', romaji: 'Aomori-ken', regiao: 'Tōhoku' },
  { codigo: 'iwate', pt: 'Iwate', ja: '岩手県', romaji: 'Iwate-ken', regiao: 'Tōhoku' },
  { codigo: 'miyagi', pt: 'Miyagi', ja: '宮城県', romaji: 'Miyagi-ken', regiao: 'Tōhoku' },
  { codigo: 'akita', pt: 'Akita', ja: '秋田県', romaji: 'Akita-ken', regiao: 'Tōhoku' },
  { codigo: 'yamagata', pt: 'Yamagata', ja: '山形県', romaji: 'Yamagata-ken', regiao: 'Tōhoku' },
  { codigo: 'fukushima', pt: 'Fukushima', ja: '福島県', romaji: 'Fukushima-ken', regiao: 'Tōhoku' },
  { codigo: 'chiba', pt: 'Chiba', ja: '千葉県', romaji: 'Chiba-ken', regiao: 'Kantō' },
  { codigo: 'tokyo', pt: 'Tóquio', ja: '東京都', romaji: 'Tōkyō-to', regiao: 'Kantō' },
  { codigo: 'niigata', pt: 'Niigata', ja: '新潟県', romaji: 'Niigata-ken', regiao: 'Chūbu' },
  { codigo: 'toyama', pt: 'Toyama', ja: '富山県', romaji: 'Toyama-ken', regiao: 'Chūbu' },
  { codigo: 'ishikawa', pt: 'Ishikawa', ja: '石川県', romaji: 'Ishikawa-ken', regiao: 'Chūbu' },
  { codigo: 'fukui', pt: 'Fukui', ja: '福井県', romaji: 'Fukui-ken', regiao: 'Chūbu' },
  { codigo: 'yamanashi', pt: 'Yamanashi', ja: '山梨県', romaji: 'Yamanashi-ken', regiao: 'Chūbu' },
  { codigo: 'kyoto', pt: 'Kyoto', ja: '京都府', romaji: 'Kyōto-fu', regiao: 'Kansai' },
  { codigo: 'osaka', pt: 'Osaka', ja: '大阪府', romaji: 'Ōsaka-fu', regiao: 'Kansai' },
  { codigo: 'hyogo', pt: 'Hyōgo', ja: '兵庫県', romaji: 'Hyōgo-ken', regiao: 'Kansai' },
  { codigo: 'nara', pt: 'Nara', ja: '奈良県', romaji: 'Nara-ken', regiao: 'Kansai' },
  { codigo: 'wakayama', pt: 'Wakayama', ja: '和歌山県', romaji: 'Wakayama-ken', regiao: 'Kansai' },
  { codigo: 'tottori', pt: 'Tottori', ja: '鳥取県', romaji: 'Tottori-ken', regiao: 'Chūgoku' },
  { codigo: 'shimane', pt: 'Shimane', ja: '島根県', romaji: 'Shimane-ken', regiao: 'Chūgoku' },
  { codigo: 'okayama', pt: 'Okayama', ja: '岡山県', romaji: 'Okayama-ken', regiao: 'Chūgoku' },
  { codigo: 'hiroshima', pt: 'Hiroshima', ja: '広島県', romaji: 'Hiroshima-ken', regiao: 'Chūgoku' },
  { codigo: 'yamaguchi', pt: 'Yamaguchi', ja: '山口県', romaji: 'Yamaguchi-ken', regiao: 'Chūgoku' },
  { codigo: 'tokushima', pt: 'Tokushima', ja: '徳島県', romaji: 'Tokushima-ken', regiao: 'Shikoku' },
  { codigo: 'kagawa', pt: 'Kagawa', ja: '香川県', romaji: 'Kagawa-ken', regiao: 'Shikoku' },
  { codigo: 'ehime', pt: 'Ehime', ja: '愛媛県', romaji: 'Ehime-ken', regiao: 'Shikoku' },
  { codigo: 'kochi', pt: 'Kōchi', ja: '高知県', romaji: 'Kōchi-ken', regiao: 'Shikoku' },
  { codigo: 'fukuoka', pt: 'Fukuoka', ja: '福岡県', romaji: 'Fukuoka-ken', regiao: 'Kyūshū' },
  { codigo: 'saga', pt: 'Saga', ja: '佐賀県', romaji: 'Saga-ken', regiao: 'Kyūshū' },
  { codigo: 'nagasaki', pt: 'Nagasaki', ja: '長崎県', romaji: 'Nagasaki-ken', regiao: 'Kyūshū' },
  { codigo: 'kumamoto', pt: 'Kumamoto', ja: '熊本県', romaji: 'Kumamoto-ken', regiao: 'Kyūshū' },
  { codigo: 'oita', pt: 'Ōita', ja: '大分県', romaji: 'Ōita-ken', regiao: 'Kyūshū' },
  { codigo: 'miyazaki', pt: 'Miyazaki', ja: '宮崎県', romaji: 'Miyazaki-ken', regiao: 'Kyūshū' },
  { codigo: 'kagoshima', pt: 'Kagoshima', ja: '鹿児島県', romaji: 'Kagoshima-ken', regiao: 'Kyūshū' },
  { codigo: 'okinawa', pt: 'Okinawa', ja: '沖縄県', romaji: 'Okinawa-ken', regiao: 'Okinawa' },
];

/** Províncias na ordem em que o candidato provavelmente vai procurar. */
export const PROVINCIAS_ORDENADAS = [
  ...PROVINCIAS.filter((p) => p.nikkei),
  ...PROVINCIAS.filter((p) => !p.nikkei),
];

/* ── 和暦 · calendário imperial ────────────────────────────────────────────
   Documento oficial japonês data em era, não em ano ocidental. Um carimbo
   com 令和8年8月10日 lê como papel deles; com 10/08/2026 lê como sistema
   estrangeiro.                                                              */
const ERAS = [
  { nome: '令和', romaji: 'Reiwa', inicio: new Date(2019, 4, 1) },
  { nome: '平成', romaji: 'Heisei', inicio: new Date(1989, 0, 8) },
  { nome: '昭和', romaji: 'Shōwa', inicio: new Date(1926, 11, 25) },
];

export function paraWareki(data: Date): { era: string; romaji: string; ano: number; texto: string } {
  const era = ERAS.find((e) => data >= e.inicio) ?? ERAS[ERAS.length - 1];
  const ano = data.getFullYear() - era.inicio.getFullYear() + 1;
  // O primeiro ano de uma era é 元年, não 1年.
  const anoTexto = ano === 1 ? '元' : String(ano);
  return {
    era: era.nome,
    romaji: era.romaji,
    ano,
    texto: `${era.nome}${anoTexto}年${data.getMonth() + 1}月${data.getDate()}日`,
  };
}

/** Data no formato ocidental japonês: 2026年8月10日. */
export function dataJa(data: Date): string {
  return `${data.getFullYear()}年${data.getMonth() + 1}月${data.getDate()}日`;
}

/** Período com o til japonês, como na ficha: 2023年4月～2025年3月. */
export function periodoJa(inicio: Date, fim?: Date): string {
  const f = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月`;
  return `${f(inicio)}～${fim ? f(fim) : '現在'}`;
}

/** Contador de pessoas: 8名, não "8". */
export function contarPessoas(n: number): string {
  return `${n}名`;
}

/** Iene com o símbolo que eles usam em documento. */
export function iene(valor: number): string {
  return `${valor.toLocaleString('ja-JP')}円`;
}
