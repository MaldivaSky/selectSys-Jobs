/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · MARCA
   A identidade verbal do produto. Nome, missão e assinatura ficam AQUI —
   nunca digitados solto numa página. Mudou aqui, muda no produto inteiro.
   ═════════════════════════════════════════════════════════════════════════ */

export const BRAND = {
  /** Nome completo, como aparece em contrato e no lockup. */
  name: 'SelectSys Jobs',
  /** As duas metades do logotipo: peso forte + assinatura mono espaçada. */
  wordmark: { strong: 'SelectSys', light: 'Jobs' },

  /** A rota. É o eixo de toda a identidade — origem verde, destino vermelho. */
  route: { from: 'Brasil', to: 'Japão' },
  tagline: 'Brasil → Japão',

  /** Missão: uma frase, dita do jeito que o candidato entende. */
  mission:
    'Tornar visível cada etapa da travessia — do primeiro cadastro no Brasil à admissão na fábrica no Japão.',
  missionShort: 'Cada etapa da travessia, visível.',

  /** O que a logo conta. Usado na abertura e no material de apresentação. */
  story:
    'Um ponto sai do Brasil, cruza a ponte e chega no sol vermelho: o Japão.',

  /** Descritor curto de categoria. */
  category: 'SaaS Dekassegui',
  legal: 'Plataforma SaaS Dekassegui · conformidade LGPD (Brasil) e APPI (Japão)',
} as const;

/** Cores da marca em TS, para SVG e canvas. Espelham os tokens CSS. */
export const BRAND_COLORS = {
  ink: '#14181f',
  cream: '#f4f2ec',
  indigo: '#294b86',
  shu: '#c4452b',
  verde: '#1f9d57',
  ambar: '#c99a2e',
  ring: '#3a4560',
} as const;

/** Caminho da ponte, compartilhado por logo, favicon e animação de abertura. */
/** Caminho oficial da ponte. Copia literal de
 *  prototipo/SelectSys Jobs App (standalone).html — a fonte da marca.
 *  Compartilhado por logo, favicon, icones e animacao de abertura. */
export const BRIDGE_PATH = 'M42 70 Q60 38 78 70';

/** Geometria oficial do simbolo, em viewBox 120. Nao ajustar. */
export const MARK_GEO = {
  anel: { cx: 60, cy: 58, r: 30, w: 2.4 },
  ponte: { w: 4 },
  origem: { cx: 42, cy: 70, r: 5 },
  destino: { cx: 78, cy: 70, r: 5.5 },
} as const;
