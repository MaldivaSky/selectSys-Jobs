/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · CORE — SCHEMA DE FORMULÁRIO VERSIONADO
   ---------------------------------------------------------------------------
   Princípio 2 da arquitetura (docs/02): CONFIGURAÇÃO > CÓDIGO.
   O formulário não é JSX escrito à mão — é um documento de definição guardado
   em `form_schemas.definition` (JSONB), versionado por organização. Mudar uma
   pergunta, um rótulo ou uma célula da exportação NÃO exige deploy.

   Cada campo carrega três responsabilidades de uma vez:
     1. como perguntar      → type, label, hint, options, mask
     2. quando perguntar    → required, visibleWhen  (fricção zero: só o que cabe)
     3. onde exportar       → cell  (a célula exata do .xls da FUJIARTE)

   É o `cell` que sustenta o Épico D — a exportação idêntica, maior risco
   técnico do projeto. O mapa vive aqui, não no código do exportador.
   ═════════════════════════════════════════════════════════════════════════ */

export type Locale = 'pt-BR' | 'ja-JP' | 'es';

/** Texto que o candidato lê. Bilíngue porque a ficha é operada nos dois países. */
export type Texto = Partial<Record<Locale, string>> & { 'pt-BR': string };

export type TipoCampo =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'        // escolha única, sempre visível (menos toques que um select)
  | 'checkbox'     // sim/não isolado
  | 'multi'        // múltipla escolha (regiões de tatuagem, turnos, setores)
  | 'chips'        // múltipla escolha visual — 1 toque, sem teclado
  | 'escala'       // seletor numérico em pílulas (calçado, cintura, horas)
  | 'tel'
  | 'email'
  | 'cpf'
  | 'cep'
  | 'foto'
  | 'assinatura';

/** Condição de visibilidade: só aparece quando o que veio antes pede. */
export interface VisivelQuando {
  campo: string;
  igual?: string | number | boolean;
  diferenteDe?: string | number | boolean;
  em?: (string | number)[];
}

export interface Opcao {
  valor: string;
  label: Texto;
  /** Valor gravado na planilha quando difere do valor interno. */
  exporta?: string;
}

export interface Campo {
  key: string;
  type: TipoCampo;
  label: Texto;
  hint?: Texto;
  required?: boolean;
  options?: Opcao[];
  /** Máscara de digitação: reduz erro e evita teclado errado no celular. */
  mask?: 'cpf' | 'cep' | 'telefone' | 'passaporte' | 'data';
  /** Teclado que o celular deve abrir. Detalhe pequeno, atrito grande. */
  teclado?: 'texto' | 'numerico' | 'email' | 'telefone';
  min?: number;
  max?: number;
  step?: number;
  unidade?: string;
  /** Valores prontos para toque único (calçado 23,0…29,0 etc.). */
  escala?: (string | number)[];
  visibleWhen?: VisivelQuando;
  /** MAIÚSCULA porque a ficha original exige letra de forma. */
  transform?: 'uppercase';
  /** Campo derivado — nunca digitado (idade sai da data de nascimento). */
  derivaDe?: { campo: string; fn: 'anos_desde' };
  /** Dado pessoal sensível (LGPD Art. 11) — vai para tabela apartada e cifrada. */
  sensivel?: boolean;
  /** Célula do .xls onde este valor é escrito na exportação. */
  cell?: string;
  /** Célula onde escrever quando a resposta for "sim"/"não" (marcações ○). */
  cellSim?: string;
  cellNao?: string;
}

/** Bloco repetível 1:N — currículo, família. A planilha trunca; o sistema não. */
export interface Repetivel {
  key: string;
  label: Texto;
  campos: Campo[];
  min?: number;
  /** Quantas entradas cabem fisicamente na folha (só a exportação trunca). */
  truncaExportacaoEm: number;
  /** Uma linha de células por entrada. */
  cellsPorEntrada?: Record<string, string>[];
}

export interface Etapa {
  id: string;
  titulo: Texto;
  /** Uma frase dizendo por que estamos perguntando isso. Reduz abandono. */
  motivo?: Texto;
  campos?: Campo[];
  repetiveis?: Repetivel[];
  /** A etapa inteira só aparece se o consentimento correspondente foi dado. */
  exigeConsentimento?: string;
}

export interface Consentimento {
  id: string;
  versao: string;
  texto: Texto;
  obrigatorio: boolean;
  /** Destacado e separado do consentimento geral (exigência do Art. 11). */
  destacado?: boolean;
}

export interface DefinicaoFormulario {
  version: string;
  localeDefault: Locale;
  /** Arquivo .xls usado como template da exportação. */
  templateExportacao: string;
  etapas: Etapa[];
  consentimentos: Consentimento[];
  /** Campos preenchidos pela agência/promotor, nunca pelo candidato. */
  camposInternos: Campo[];
}
