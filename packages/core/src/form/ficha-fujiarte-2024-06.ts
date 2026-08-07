import type { Campo, DefinicaoFormulario, Etapa, Opcao, Texto } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA CADASTRAL FUJIARTE — versão 2024.06
   ---------------------------------------------------------------------------
   Transcrição fiel da planilha `白紙 FUJIARTE Ficha Cadastral Jun2024.xls`
   (1 aba, 147 linhas × 59 colunas, 2 páginas lógicas). Todo campo do papel
   está aqui, com a célula de origem — é esse mapa que faz a exportação sair
   idêntica à planilha que o Japão já usa.

   A ordem NÃO é a do papel. O papel foi desenhado para caber numa folha; isto
   foi desenhado para ser preenchido no celular, em pé, no intervalo do turno:
   7 etapas curtas, do fácil para o difícil, teclado certo em cada campo,
   escolha por toque sempre que possível, e o bloco de saúde por último —
   depois do consentimento específico dele.
   ═════════════════════════════════════════════════════════════════════════ */

const pt = (s: string, ja?: string): Texto => (ja ? { 'pt-BR': s, 'ja-JP': ja } : { 'pt-BR': s });

const SIM_NAO: Opcao[] = [
  { valor: 'sim', label: pt('Sim') },
  { valor: 'nao', label: pt('Não') },
];

/** Pergunta sim/não da enquete, com as duas células de marcação do papel. */
const simNao = (key: string, label: string, cellSim: string, cellNao: string, ja?: string): Campo => ({
  key,
  type: 'radio',
  label: pt(label, ja),
  options: SIM_NAO,
  required: true,
  cellSim,
  cellNao,
});

/** Detalhe que só aparece quando a resposta anterior foi "sim". */
const detalheSe = (key: string, campo: string, label: string, cell: string, sensivel = false): Campo => ({
  key,
  type: 'text',
  label: pt(label),
  visibleWhen: { campo, igual: 'sim' },
  cell,
  sensivel,
});

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 1 · Quem é você
   Abre com o que a pessoa sabe de cor. Nada de documento logo de cara.
   ───────────────────────────────────────────────────────────────────────── */
const etapaIdentificacao: Etapa = {
  id: 'identificacao',
  titulo: pt('Quem é você', '本人確認'),
  motivo: pt('Começamos pelo básico — leva menos de um minuto.'),
  campos: [
    {
      key: 'nome_completo',
      type: 'text',
      label: pt('Nome completo'),
      hint: pt('Exatamente como está no RG'),
      required: true,
      transform: 'uppercase',
      cell: 'A6',
    },
    { key: 'foto', type: 'foto', label: pt('Sua foto'), hint: pt('Foto recente, de frente'), required: true, cell: 'AU11' },
    { key: 'foto_data', type: 'date', label: pt('Data da foto'), cell: 'AU29' },
    {
      key: 'data_nascimento',
      type: 'date',
      label: pt('Data de nascimento'),
      hint: pt('A ficha usa Ano/Mês/Dia'),
      required: true,
      cell: 'A16',
    },
    { key: 'idade', type: 'number', label: pt('Idade'), derivaDe: { campo: 'data_nascimento', fn: 'anos_desde' }, cell: 'S16' },
    {
      key: 'sexo',
      type: 'radio',
      label: pt('Sexo'),
      required: true,
      options: [
        { valor: 'f', label: pt('Feminino') },
        { valor: 'm', label: pt('Masculino') },
      ],
      cell: 'Y16',
    },
    {
      key: 'estado_civil',
      type: 'chips',
      label: pt('Estado civil'),
      required: true,
      options: [
        { valor: 'solteiro', label: pt('Solteiro(a)') },
        { valor: 'casado', label: pt('Casado(a)') },
        { valor: 'divorciado', label: pt('Divorciado(a)') },
        { valor: 'viuvo', label: pt('Viúvo(a)') },
        { valor: 'uniao', label: pt('União estável') },
      ],
      cell: 'AF16',
    },
    {
      key: 'nacionalidade',
      type: 'radio',
      label: pt('Nacionalidade'),
      required: true,
      options: [
        { valor: 'BRAS', label: pt('Brasileira'), exporta: 'BRAS' },
        { valor: 'JAP', label: pt('Japonesa'), exporta: 'JAP' },
        { valor: 'OUTRA', label: pt('Outra') },
      ],
      cell: 'A18',
    },
    { key: 'nacionalidade_outra', type: 'text', label: pt('Qual?'), visibleWhen: { campo: 'nacionalidade', igual: 'OUTRA' }, cell: 'W18' },
    {
      key: 'geracao',
      type: 'chips',
      label: pt('Geração', '世代'),
      hint: pt('Define a elegibilidade ao visto de descendente'),
      required: true,
      // Origem étnica é dado pessoal sensível (LGPD Art. 5º, II) — tanto quanto
      // saúde. Finalidade legítima e documentável: sem ela não há visto 定住者.
      sensivel: true,
      visibleWhen: { campo: 'nacionalidade', igual: 'BRAS' },
      options: [
        { valor: 'issei', label: pt('Issei · 1ª') },
        { valor: 'nissei', label: pt('Nissei · 2ª') },
        { valor: 'sansei', label: pt('Sansei · 3ª') },
        { valor: 'yonsei', label: pt('Yonsei · 4ª') },
        { valor: 'nao_descendente', label: pt('Não sou descendente') },
      ],
      cell: 'AI18',
    },
    {
      key: 'como_soube',
      type: 'chips',
      label: pt('Como você conheceu a FUJIARTE?'),
      options: [
        { valor: 'agencia', label: pt('Agência') },
        { valor: 'indicacao', label: pt('Indicação de alguém') },
        { valor: 'internet', label: pt('Internet') },
        { valor: 'redes', label: pt('Redes sociais') },
        { valor: 'outro', label: pt('Outro') },
      ],
      cell: 'A11',
    },
    { key: 'indicou_nome', type: 'text', label: pt('Quem indicou você?'), visibleWhen: { campo: 'como_soube', igual: 'indicacao' }, cell: 'A13' },
    { key: 'indicou_relacao', type: 'text', label: pt('Qual a relação com essa pessoa?'), visibleWhen: { campo: 'como_soube', igual: 'indicacao' }, cell: 'AJ13' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 2 · Documentos — o candidato precisa ter os papéis em mãos
   ───────────────────────────────────────────────────────────────────────── */
const etapaDocumentos: Etapa = {
  id: 'documentos',
  titulo: pt('Seus documentos', '書類'),
  motivo: pt('Tenha os documentos por perto. Se faltar algum, dá para voltar depois.'),
  campos: [
    { key: 'cpf', type: 'cpf', label: pt('CPF'), mask: 'cpf', teclado: 'numerico', required: true, cell: 'A25' },
    { key: 'rg', type: 'text', label: pt('RG'), required: true, cell: 'X25' },
    { key: 'rg_emissor', type: 'text', label: pt('Órgão emissor do RG'), cell: 'AN25' },
    { key: 'passaporte', type: 'text', label: pt('Passaporte'), mask: 'passaporte', transform: 'uppercase', cell: 'A21' },
    { key: 'passaporte_validade', type: 'date', label: pt('Validade do passaporte'), cell: 'G21' },
    { key: 'visto', type: 'text', label: pt('Visto'), cell: 'X21' },
    { key: 'visto_validade', type: 'date', label: pt('Validade do visto'), cell: 'AD21' },
    {
      key: 'koseki',
      type: 'text',
      label: pt('Koseki', '戸籍'),
      hint: pt('Registro de família japonês — comprova a descendência'),
      sensivel: true,
      cell: 'A23',
    },
    { key: 'koseki_validade', type: 'date', label: pt('Validade do koseki'), cell: 'G23' },
    {
      key: 'reentry',
      type: 'text',
      label: pt('Reentry', '再入国許可'),
      hint: pt('Autorização de reentrada, se você já morou no Japão'),
      cell: 'X23',
    },
    { key: 'reentry_validade', type: 'date', label: pt('Validade do reentry'), cell: 'AD23' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 3 · Onde te encontrar (endereço, contato, família, emergência no Japão)
   ───────────────────────────────────────────────────────────────────────── */
const etapaContato: Etapa = {
  id: 'contato',
  titulo: pt('Onde te encontrar'),
  motivo: pt('O CEP preenche o endereço sozinho.'),
  campos: [
    { key: 'cep', type: 'cep', label: pt('CEP'), mask: 'cep', teclado: 'numerico', required: true, cell: 'G39' },
    { key: 'endereco', type: 'text', label: pt('Endereço'), required: true, cell: 'G35' },
    { key: 'numero', type: 'text', label: pt('Número'), teclado: 'numerico', cell: 'AZ35' },
    { key: 'complemento', type: 'text', label: pt('Complemento'), cell: 'G37' },
    { key: 'bairro', type: 'text', label: pt('Bairro'), cell: 'Y37' },
    { key: 'cidade', type: 'text', label: pt('Cidade'), required: true, cell: 'AN37' },
    { key: 'estado', type: 'select', label: pt('Estado'), required: true, cell: 'BB37' },
    { key: 'email', type: 'email', label: pt('E-mail'), teclado: 'email', required: true, cell: 'Z39' },
    { key: 'celular', type: 'tel', label: pt('Celular'), mask: 'telefone', teclado: 'telefone', required: true, cell: 'G41' },
    { key: 'telefone_fixo', type: 'tel', label: pt('Telefone fixo'), mask: 'telefone', teclado: 'telefone', cell: 'AK41' },
  ],
  repetiveis: [
    {
      key: 'familia',
      label: pt('Formação familiar'),
      truncaExportacaoEm: 5,
      campos: [
        {
          key: 'parentesco',
          type: 'chips',
          label: pt('Parentesco'),
          required: true,
          options: [
            { valor: 'pai', label: pt('Pai') },
            { valor: 'mae', label: pt('Mãe') },
            { valor: 'conjuge', label: pt('Cônjuge') },
            { valor: 'filho', label: pt('Filho(a)') },
            { valor: 'irmao', label: pt('Irmão(ã)') },
          ],
        },
        { key: 'nome', type: 'text', label: pt('Nome completo'), transform: 'uppercase' },
        { key: 'idade', type: 'number', label: pt('Idade'), teclado: 'numerico' },
        { key: 'telefone', type: 'tel', label: pt('Telefone'), mask: 'telefone', teclado: 'telefone' },
      ],
      // Linhas 45,47,49,51,53 do papel: PAI, MÃE, CÔNJUGE, FILHOS/IRMÃOS ×2
      cellsPorEntrada: [
        { parentesco: 'G45', nome: 'L45', idade: 'AM45', telefone: 'AQ45' },
        { parentesco: 'G47', nome: 'L47', idade: 'AM47', telefone: 'AQ47' },
        { parentesco: 'G49', nome: 'L49', idade: 'AM49', telefone: 'AQ49' },
        { parentesco: 'G51', nome: 'L51', idade: 'AM51', telefone: 'AQ51' },
        { parentesco: 'G53', nome: 'L53', idade: 'AM53', telefone: 'AQ53' },
      ],
    },
  ],
};

const etapaContatoEmergencia: Campo[] = [
  { key: 'emergencia_nome', type: 'text', label: pt('Nome do contato de emergência no Japão'), cell: 'G55' },
  { key: 'emergencia_relacao', type: 'text', label: pt('Relação com você'), cell: 'AN55' },
  { key: 'emergencia_provincia', type: 'text', label: pt('Província', '県'), cell: 'G57' },
  { key: 'emergencia_telefone', type: 'tel', label: pt('Telefone'), mask: 'telefone', teclado: 'telefone', cell: 'AN57' },
];

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 4 · Formação e uniforme
   Medidas viram seletor de toque: ninguém digita "23,5" com uma mão só.
   ───────────────────────────────────────────────────────────────────────── */
const escalaCalcado = ['22,0', '22,5', '23,0', '23,5', '24,0', '24,5', '25,0', '25,5', '26,0', '26,5', '27,0', '27,5', '28,0', '28,5', '29,0'];

const etapaFormacaoUniforme: Etapa = {
  id: 'formacao_uniforme',
  titulo: pt('Formação e uniforme'),
  motivo: pt('As medidas são para encomendar seu uniforme e calçado de segurança na fábrica.'),
  campos: [
    {
      key: 'ensino_fundamental',
      type: 'radio',
      label: pt('Ensino fundamental'),
      options: [
        { valor: 'completo', label: pt('Completo') },
        { valor: 'incompleto', label: pt('Incompleto') },
      ],
      cell: 'L30',
    },
    { key: 'fundamental_serie', type: 'text', label: pt('Parou em que série?'), visibleWhen: { campo: 'ensino_fundamental', igual: 'incompleto' }, cell: 'T30' },
    {
      key: 'ensino_medio',
      type: 'radio',
      label: pt('Ensino médio'),
      options: [
        { valor: 'completo', label: pt('Completo') },
        { valor: 'incompleto', label: pt('Incompleto') },
      ],
      cell: 'L32',
    },
    { key: 'medio_serie', type: 'text', label: pt('Parou em que série?'), visibleWhen: { campo: 'ensino_medio', igual: 'incompleto' }, cell: 'T32' },
    {
      key: 'tecnico',
      type: 'radio',
      label: pt('Curso técnico'),
      options: [
        { valor: 'completo', label: pt('Completo') },
        { valor: 'incompleto', label: pt('Incompleto') },
        { valor: 'nao', label: pt('Não fiz') },
      ],
      cell: 'AF30',
    },
    {
      key: 'faculdade',
      type: 'radio',
      label: pt('Faculdade'),
      options: [
        { valor: 'completo', label: pt('Completa') },
        { valor: 'incompleto', label: pt('Incompleta') },
        { valor: 'nao', label: pt('Não fiz') },
      ],
      cell: 'AF32',
    },
    { key: 'curso', type: 'text', label: pt('Qual curso?'), visibleWhen: { campo: 'faculdade', diferenteDe: 'nao' }, cell: 'AN30' },
    { key: 'instituicao', type: 'text', label: pt('Nome da instituição'), visibleWhen: { campo: 'faculdade', diferenteDe: 'nao' }, cell: 'AN32' },
    { key: 'ano_conclusao', type: 'number', label: pt('Ano de conclusão'), teclado: 'numerico', visibleWhen: { campo: 'faculdade', diferenteDe: 'nao' }, cell: 'BB30' },

    { key: 'altura_cm', type: 'escala', label: pt('Altura'), unidade: 'cm', min: 140, max: 200, required: true, cell: 'A28' },
    { key: 'peso_kg', type: 'escala', label: pt('Peso'), unidade: 'kg', min: 40, max: 140, required: true, cell: 'N28' },
    { key: 'cintura_cm', type: 'escala', label: pt('Cintura'), unidade: 'cm', min: 55, max: 130, required: true, cell: 'AA28' },
    { key: 'pe_cm', type: 'escala', label: pt('Calçado'), unidade: 'cm', escala: escalaCalcado, required: true, cell: 'AN28' },
    { key: 'nivel_japones', type: 'chips', label: pt('Nível de japonês', '日本語'), options: [
      { valor: 'nenhum', label: pt('Nenhum') },
      { valor: 'basico', label: pt('Básico') },
      { valor: 'intermediario', label: pt('Intermediário') },
      { valor: 'avancado', label: pt('Avançado') },
      { valor: 'fluente', label: pt('Fluente') },
    ] },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 5 · Experiência — 1:N no sistema, truncado só na folha (4 JP + 2 BR)
   ───────────────────────────────────────────────────────────────────────── */
const etapaExperiencia: Etapa = {
  id: 'experiencia',
  titulo: pt('Sua experiência'),
  motivo: pt('Do trabalho mais recente para o mais antigo.'),
  campos: [
    simNao('ja_esteve_japao', 'Você já esteve no Japão?', 'G60', 'L60', '日本渡航歴'),
    { key: 'japao_para', type: 'text', label: pt('Foi para quê?'), visibleWhen: { campo: 'ja_esteve_japao', igual: 'sim' }, cell: 'Q60' },
    {
      key: 'retorno_ajuda_governo',
      type: 'radio',
      label: pt('Retornou com ajuda do governo?'),
      options: SIM_NAO,
      visibleWhen: { campo: 'ja_esteve_japao', igual: 'sim' },
      cellSim: 'AZ60',
      cellNao: 'BE60',
    },
  ],
  repetiveis: [
    {
      key: 'curriculo_japao',
      label: pt('Trabalhos no Japão', '日本での職歴'),
      truncaExportacaoEm: 4,
      campos: [
        { key: 'fabrica', type: 'text', label: pt('Nome da fábrica') },
        { key: 'empreiteira', type: 'text', label: pt('Nome da empreiteira') },
        { key: 'tipo_servico', type: 'text', label: pt('Tipo de serviço') },
        { key: 'provincia', type: 'select', label: pt('Província', '県') },
        { key: 'cidade', type: 'text', label: pt('Cidade') },
        { key: 'inicio', type: 'date', label: pt('Início') },
        { key: 'fim', type: 'date', label: pt('Fim') },
        { key: 'motivo_saida', type: 'text', label: pt('Motivo da saída') },
        { key: 'tipo_contrato', type: 'text', label: pt('Tipo de contrato') },
      ],
      cellsPorEntrada: [
        { fabrica: 'G62', empreiteira: 'G64', tipo_servico: 'V62', provincia: 'AO66', cidade: 'AO68', inicio: 'AX66', fim: 'BC66', motivo_saida: 'G70', tipo_contrato: 'AX70' },
        { fabrica: 'G67', empreiteira: 'G69', tipo_servico: 'V67', provincia: 'AO71', cidade: 'AO73', inicio: 'AX71', fim: 'BC71', motivo_saida: 'G75', tipo_contrato: 'AX75' },
        { fabrica: 'G72', empreiteira: 'G74', tipo_servico: 'V72', provincia: 'AO76', cidade: 'AO78', inicio: 'AX76', fim: 'BC76', motivo_saida: 'G80', tipo_contrato: 'AX80' },
        { fabrica: 'G77', empreiteira: 'G79', tipo_servico: 'V77', provincia: 'AO81', cidade: 'AO83', inicio: 'AX81', fim: 'BC81', motivo_saida: 'G85', tipo_contrato: 'AX85' },
      ],
    },
    {
      key: 'curriculo_brasil',
      label: pt('Trabalhos no Brasil'),
      truncaExportacaoEm: 2,
      campos: [
        { key: 'empresa', type: 'text', label: pt('Empresa') },
        { key: 'cargo', type: 'text', label: pt('Cargo') },
        { key: 'uf', type: 'select', label: pt('UF') },
        { key: 'cidade', type: 'text', label: pt('Cidade') },
        { key: 'inicio', type: 'date', label: pt('Início') },
        { key: 'fim', type: 'date', label: pt('Fim') },
        { key: 'motivo_saida', type: 'text', label: pt('Motivo da saída') },
        { key: 'tipo_contrato', type: 'text', label: pt('Tipo de contrato') },
      ],
      cellsPorEntrada: [
        { empresa: 'G86', cargo: 'V86', uf: 'AO86', cidade: 'AO88', inicio: 'AX86', fim: 'BC86', motivo_saida: 'G90', tipo_contrato: 'AX90' },
        { empresa: 'G91', cargo: 'V91', uf: 'AO91', cidade: 'AO93', inicio: 'AX91', fim: 'BC91', motivo_saida: 'G95', tipo_contrato: 'AX95' },
      ],
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 6 · Enquete — Bloco A (Q1 a Q15): aptidão e disponibilidade
   ───────────────────────────────────────────────────────────────────────── */
const etapaDisponibilidade: Etapa = {
  id: 'disponibilidade',
  titulo: pt('O que você aceita', 'アンケート A'),
  motivo: pt('Isso define quais vagas combinam com você. Não existe resposta errada.'),
  campos: [
    {
      key: 'q1_setores',
      type: 'chips',
      label: pt('1 · Aceita trabalhar em qual setor?'),
      required: true,
      options: [
        { valor: 'eletronica', label: pt('Eletrônica'), exporta: 'ELETRÔNICA' },
        { valor: 'autopecas', label: pt('Autopeças'), exporta: 'AUTOPEÇAS' },
        { valor: 'alimenticio', label: pt('Alimentício'), exporta: 'ALIMENTÍCIO' },
      ],
      cell: 'B103',
    },
    { key: 'q1_porque_nao', type: 'text', label: pt('Se recusa algum, por quê?'), cell: 'B104' },
    simNao('q2_prefere_regiao', '2 · Tem preferência por região de trabalho?', 'V105', 'AA105'),
    { key: 'q2_onde', type: 'text', label: pt('Onde?'), visibleWhen: { campo: 'q2_prefere_regiao', igual: 'sim' }, cell: 'B106' },
    { key: 'q2_porque', type: 'text', label: pt('Por quê?'), visibleWhen: { campo: 'q2_prefere_regiao', igual: 'sim' }, cell: 'S106' },
    simNao('q3_horas_extras', '3 · Pode fazer horas extras?', 'V107', 'AA107'),
    { key: 'q3_horas', type: 'escala', label: pt('Quantas horas por dia?'), unidade: 'h', escala: [1, 2, 3, 4, 5, 6], visibleWhen: { campo: 'q3_horas_extras', igual: 'sim' }, cell: 'B108' },
    { key: 'q3_porque_nao', type: 'text', label: pt('Por quê?'), visibleWhen: { campo: 'q3_horas_extras', igual: 'nao' }, cell: 'Q108' },
    {
      key: 'q4_turnos',
      type: 'chips',
      label: pt('4 · Quais turnos pode trabalhar?'),
      required: true,
      options: [
        { valor: 'diurno', label: pt('Diurno') },
        { valor: 'noturno', label: pt('Noturno') },
        { valor: 'alternado', label: pt('Alternado') },
      ],
      cell: 'Q109',
    },
    { key: 'q4_porque', type: 'text', label: pt('Por quê?'), cell: 'B110' },
    {
      key: 'q5_dias',
      type: 'chips',
      label: pt('5 · Pode trabalhar aos:'),
      options: [
        { valor: 'sabados', label: pt('Sábados') },
        { valor: 'domingos', label: pt('Domingos') },
        { valor: 'feriados', label: pt('Feriados') },
      ],
      cell: 'Q112',
    },
    { key: 'q5_porque_nao', type: 'text', label: pt('Se não, por quê?'), cell: 'B113' },
    simNao('q6_folga', '6 · Pode trabalhar no seu dia de folga?', 'V114', 'AA114'),
    { key: 'q6_porque_nao', type: 'text', label: pt('Se não, por quê?'), visibleWhen: { campo: 'q6_folga', igual: 'nao' }, cell: 'B115' },
    simNao('q7_trabalhou_em_pe', '7 · Já trabalhou em pé?', 'V116', 'AA116'),
    { key: 'q7_horas', type: 'escala', label: pt('Quantas horas por dia?'), unidade: 'h', escala: [2, 4, 6, 8, 10, 12], visibleWhen: { campo: 'q7_trabalhou_em_pe', igual: 'sim' }, cell: 'O116' },
    simNao('q8_divida_brasil', '8 · Tem alguma dívida no Brasil?', 'V117', 'AA117'),
    detalheSe('q8_qual', 'q8_divida_brasil', 'Qual?', 'B118'),
    simNao('q9_pendencia_japao', '9 · Deixou alguma pendência no Japão? (imposto, por exemplo)', 'V119', 'AA119'),
    detalheSe('q9_qual', 'q9_pendencia_japao', 'Qual?', 'B120'),
    simNao('q10_dependentes', '10 · Viajará com dependentes ou eles irão depois?', 'V121', 'AA121'),
    { key: 'q10_quem', type: 'text', label: pt('Quem?'), visibleWhen: { campo: 'q10_dependentes', igual: 'sim' }, cell: 'B122' },
    {
      key: 'q10_quando',
      type: 'radio',
      label: pt('Quando?'),
      visibleWhen: { campo: 'q10_dependentes', igual: 'sim' },
      options: [
        { valor: 'juntos', label: pt('Irão juntos') },
        { valor: 'depois', label: pt('Irão depois') },
      ],
      cell: 'F123',
    },
    { key: 'q10_quanto_depois', type: 'text', label: pt('Quanto tempo depois?'), visibleWhen: { campo: 'q10_quando', igual: 'depois' }, cell: 'T123' },
    simNao('q11_pet', '11 · Pretende levar animal de estimação?', 'V124', 'AA124'),
    { key: 'q12_embarque', type: 'date', label: pt('12 · Quando pretende embarcar?'), cell: 'V125' },
    { key: 'q13_tempo_japao', type: 'escala', label: pt('13 · Por quanto tempo pretende trabalhar no Japão?'), unidade: 'anos', escala: [1, 2, 3, 5, 10, 'Indefinido'], cell: 'AC126' },
    // Q14: pergunta juridicamente sensível (Súmula 443 TST) — desligável por organização.
    simNao('q14_detido', '14 · Já foi detido pela polícia?', 'V127', 'AA127'),
    { key: 'q14_detalhe', type: 'textarea', label: pt('Onde, quando e motivo'), visibleWhen: { campo: 'q14_detido', igual: 'sim' }, cell: 'B128' },
    simNao('q15_tatuagem', '15 · Tem tatuagem?', 'K129', 'P129', '入れ墨'),
    {
      key: 'q15_regioes',
      type: 'multi',
      label: pt('Em quais partes do corpo?'),
      hint: pt('A foto não é pedida agora — só depois da entrevista, e nunca de locais íntimos.'),
      visibleWhen: { campo: 'q15_tatuagem', igual: 'sim' },
      options: [
        { valor: 'cabeca', label: pt('Cabeça') },
        { valor: 'rosto', label: pt('Rosto') },
        { valor: 'pescoco', label: pt('Pescoço') },
        { valor: 'peito', label: pt('Peito') },
        { valor: 'costas', label: pt('Costas') },
        { valor: 'ombros', label: pt('Ombros') },
        { valor: 'bracos', label: pt('Braços') },
        { valor: 'maos', label: pt('Mãos') },
        { valor: 'abdomen', label: pt('Abdômen') },
        { valor: 'cintura', label: pt('Cintura') },
        { valor: 'pernas', label: pt('Pernas') },
      ],
      cell: 'U129',
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   ETAPA 7 · Saúde (Q16–Q31) — dado sensível, atrás de consentimento próprio
   ───────────────────────────────────────────────────────────────────────── */
const etapaSaude: Etapa = {
  id: 'saude',
  titulo: pt('Saúde e segurança', 'アンケート B'),
  motivo: pt('Serve para adequar sua função na fábrica. Você pode recusar — a candidatura continua.'),
  exigeConsentimento: 'saude_v1',
  campos: [
    simNao('q16_visao', '16 · Tem problema de visão?', 'AZ102', 'BE102'),
    detalheSe('q16_qual', 'q16_visao', 'Qual?', 'AG103', true),
    {
      key: 'q16_correcao',
      type: 'chips',
      label: pt('Usa óculos ou lentes?'),
      options: [
        { valor: 'oculos', label: pt('Óculos') },
        { valor: 'lentes', label: pt('Lentes de contato') },
        { valor: 'nenhum', label: pt('Nenhum') },
      ],
      sensivel: true,
      cell: 'AG104',
    },
    { key: 'q16_grau_od', type: 'text', label: pt('Grau — olho direito'), sensivel: true, cell: 'AZ104' },
    { key: 'q16_grau_oe', type: 'text', label: pt('Grau — olho esquerdo'), sensivel: true, cell: 'BE104' },
    {
      key: 'q17_daltonismo',
      type: 'radio',
      label: pt('17 · Tem daltonismo?'),
      options: [...SIM_NAO, { valor: 'nao_sei', label: pt('Não sei') }],
      sensivel: true,
      cell: 'AQ105',
    },
    simNao('q18_dividir_apto', '18 · Se mora sozinho(a), aceita dividir apartamento?', 'AZ106', 'BE106'),
    {
      key: 'q19_habilitacao',
      type: 'chips',
      label: pt('19 · Tem habilitação?'),
      options: [
        { valor: 'br', label: pt('Brasileira') },
        { valor: 'jp', label: pt('Japonesa') },
        { valor: 'nao', label: pt('Não tenho') },
      ],
      cell: 'AZ107',
    },
    simNao('q20_bicicleta', '20 · Sabe andar de bicicleta?', 'AZ108', 'BE108'),
    {
      key: 'q21_mao_dominante',
      type: 'radio',
      label: pt('21 · Qual sua mão dominante?'),
      options: [
        { valor: 'destro', label: pt('Destro') },
        { valor: 'canhoto', label: pt('Canhoto') },
      ],
      cell: 'AZ109',
    },
    simNao('q22_fuma', '22 · Fuma cigarro?', 'AZ110', 'BE110'),
    { key: 'q22_quantos', type: 'escala', label: pt('Quantos por dia?'), escala: [1, 5, 10, 15, 20, 'mais de 20'], visibleWhen: { campo: 'q22_fuma', igual: 'sim' }, sensivel: true, cell: 'AH111' },
    simNao('q23_acidente', '23 · Sofreu acidente, doença grave ou operação?', 'AZ112', 'BE112'),
    detalheSe('q23_qual', 'q23_acidente', 'Qual?', 'AG113', true),
    { key: 'q23_quando', type: 'text', label: pt('Quando?'), visibleWhen: { campo: 'q23_acidente', igual: 'sim' }, sensivel: true, cell: 'AZ113' },
    simNao('q24_sequela', '24 · Deixou algum tipo de sequela?', 'AZ114', 'BE114'),
    simNao('q25_dor_cronica', '25 · Sofre de alguma dor crônica?', 'AZ115', 'BE115'),
    {
      key: 'q25_locais',
      type: 'multi',
      label: pt('Onde?'),
      visibleWhen: { campo: 'q25_dor_cronica', igual: 'sim' },
      sensivel: true,
      options: [
        { valor: 'lombar', label: pt('Dor lombar / coluna') },
        { valor: 'mao', label: pt('Mão') },
        { valor: 'joelho', label: pt('Joelho') },
        { valor: 'escoliose', label: pt('Escoliose') },
        { valor: 'hernia', label: pt('Hérnia') },
        { valor: 'ciatico', label: pt('Nervo ciático') },
        { valor: 'outro', label: pt('Outro local') },
      ],
      cell: 'AG116',
    },
    { key: 'q25_outro_onde', type: 'text', label: pt('Qual outro local?'), visibleWhen: { campo: 'q25_locais', igual: 'outro' }, sensivel: true, cell: 'BA116' },
    simNao('q26_movimento', '26 · Tem dificuldade em algum movimento do corpo?', 'AZ118', 'BE118'),
    detalheSe('q26_onde', 'q26_movimento', 'Onde?', 'AG119', true),
    simNao('q27_saude_mental', '27 · Tem ou já teve depressão, esquizofrenia ou outra questão mental?', 'AZ120', 'BE120'),
    detalheSe('q27_qual', 'q27_saude_mental', 'Qual?', 'AG121', true),
    simNao('q28_alergia', '28 · Tem alergia a alimento, medicamento ou produto químico?', 'AZ122', 'BE122'),
    detalheSe('q28_qual', 'q28_alergia', 'Qual?', 'AG123', true),
    simNao('q29_fobia', '29 · Tem alguma fobia?', 'AZ124', 'BE124'),
    detalheSe('q29_qual', 'q29_fobia', 'Qual?', 'AG125', true),
    simNao('q30_tratamento', '30 · Está fazendo algum tratamento?', 'AZ126', 'BE126'),
    detalheSe('q30_qual', 'q30_tratamento', 'Qual?', 'AG127', true),
    simNao('q31_medicamento', '31 · Está tomando algum medicamento?', 'AZ128', 'BE128'),
    detalheSe('q31_qual', 'q31_medicamento', 'Qual?', 'AG129', true),
    { key: 'q31_quanto', type: 'text', label: pt('Quanto por dia?'), visibleWhen: { campo: 'q31_medicamento', igual: 'sim' }, sensivel: true, cell: 'AY129' },
    {
      key: 'q32_motivo',
      type: 'chips',
      label: pt('32 · Por que quer ir ao Japão?'),
      required: true,
      options: [
        { valor: 'salario_baixo', label: pt('Salário baixo aqui') },
        { valor: 'desemprego', label: pt('Desemprego') },
        { valor: 'familia_japao', label: pt('Família no Japão') },
        { valor: 'comprar_imovel', label: pt('Comprar imóvel') },
        { valor: 'poupanca', label: pt('Fazer poupança') },
        { valor: 'divida', label: pt('Quitar dívida') },
        { valor: 'outros', label: pt('Outro motivo') },
      ],
      cell: 'AG131',
    },
    { key: 'q32_outros', type: 'text', label: pt('Qual outro motivo?'), visibleWhen: { campo: 'q32_motivo', igual: 'outros' }, cell: 'AG132' },
  ],
};

etapaContato.campos = [...(etapaContato.campos ?? []), ...etapaContatoEmergencia];

export const FICHA_FUJIARTE_2024_06: DefinicaoFormulario = {
  version: '2024.06',
  localeDefault: 'pt-BR',
  templateExportacao: '白紙 FUJIARTE Ficha Cadastral Jun2024 (1).xls',
  etapas: [
    etapaIdentificacao,
    etapaDocumentos,
    etapaContato,
    etapaFormacaoUniforme,
    etapaExperiencia,
    etapaDisponibilidade,
    etapaSaude,
  ],
  consentimentos: [
    {
      id: 'geral_v1',
      versao: 'geral_v1',
      obrigatorio: true,
      texto: pt(
        'Declaro que as informações desta ficha são verdadeiras e autorizo a empresa a entrar em contato pelos dados fornecidos sobre o resultado da entrevista, promoções e comunicados.',
      ),
    },
    {
      id: 'saude_v1',
      versao: 'saude_v1',
      obrigatorio: false,
      destacado: true,
      texto: pt(
        'Autorizo o tratamento dos meus dados de saúde (perguntas 16 a 31) com a finalidade exclusiva de adequação da função na fábrica. Estes dados são armazenados criptografados, com acesso restrito e registrado. Posso recusar — minha candidatura continua sem eles.',
      ),
    },
    {
      id: 'descendencia_v1',
      versao: 'descendencia_v1',
      obrigatorio: true,
      destacado: true,
      texto: pt(
        'Autorizo o tratamento da informação sobre minha ascendência japonesa (geração e certidão 戸籍謄本) com a finalidade exclusiva de comprovar minha elegibilidade ao visto de descendente perante as autoridades japonesas.',
      ),
    },
    {
      id: 'transferencia_internacional_v1',
      versao: 'transferencia_internacional_v1',
      obrigatorio: true,
      texto: pt(
        'Autorizo a transferência dos meus dados para a empresa no Japão, para fins de seleção e emissão de visto, conforme a LGPD (Brasil) e a APPI (Japão).',
      ),
    },
  ],
  // Rodapé do papel: preenchido pela agência/promotor, nunca pelo candidato.
  camposInternos: [
    { key: 'agencia', type: 'text', label: pt('Agência'), cell: 'AI144' },
    { key: 'entrevistador', type: 'text', label: pt('Entrevistador'), cell: 'AI145' },
    { key: 'promotor', type: 'text', label: pt('Promotor (nome/agência)'), cell: 'AI146' },
    { key: 'data_preenchimento', type: 'date', label: pt('Data de preenchimento'), cell: 'AU2' },
    { key: 'assinatura', type: 'assinatura', label: pt('Assinatura'), cell: 'AG140' },
  ],
};

/** Quantos campos a ficha tem, de fato — usado nos testes de cobertura. */
export function contarCampos(def: DefinicaoFormulario = FICHA_FUJIARTE_2024_06) {
  const simples = def.etapas.reduce((n, e) => n + (e.campos?.length ?? 0), 0);
  const repetidos = def.etapas.reduce(
    (n, e) => n + (e.repetiveis ?? []).reduce((m, r) => m + r.campos.length * r.truncaExportacaoEm, 0),
    0,
  );
  return { simples, repetidos, total: simples + repetidos + def.camposInternos.length };
}
