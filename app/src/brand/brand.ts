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

/* ── Marca 働 ──────────────────────────────────────────────────────────────
   O gradiente do kanji, na ordem da viagem. Espelha .kseal .kj em
   app/src/styles/marca.css, que e a copia literal da arte do CEO.          */
export const KANJI = '働';

export const KANJI_GRADIENTE = [
  { cor: '#12c257', em: '12%' },   // verde Brasil — a origem
  { cor: '#e8a02e', em: '40%' },   // ambar — o transito
  { cor: '#ffffff', em: '52%' },   // o clarao da chegada
  { cor: '#e8a02e', em: '64%' },
  { cor: '#e23b22', em: '90%' },   // vermelho Japao — o destino
] as const;

/** Vermelho do sol e do logotipo: o da bandeira, nao o shu dos carimbos. */
export const HINOMARU = '#c8102e';
