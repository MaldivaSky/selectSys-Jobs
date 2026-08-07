/* ═══════════════════════════════════════════════════════════════════════════
   MARCA DO TENANT — DERIVAÇÃO DE PALETA
   ---------------------------------------------------------------------------
   A agência escolhe UMA cor. Todo o resto do painel (superfícies, realces,
   estados ativos, texto sobre a cor, faixas do funil) é derivado dela por
   cálculo — não por tabela chumbada. Assim qualquer cor que o cliente colar
   no seletor produz um painel legível, no claro e no escuro.

   O contraste do texto sobre a marca é decidido por luminância relativa
   (WCAG), então uma marca amarela recebe tinta escura e uma marca vinho
   recebe tinta branca, sem ninguém precisar configurar nada.
   ═════════════════════════════════════════════════════════════════════════ */

export const COR_PADRAO = '#294b86';

type RGB = { r: number; g: number; b: number };

/** Aceita `#rgb`, `#rrggbb` e devolve null para lixo — o front nunca quebra. */
export function hexParaRgb(hex: string): RGB | null {
  const limpo = hex.trim().replace(/^#/, '');
  const cheio =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo;
  if (!/^[0-9a-f]{6}$/i.test(cheio)) return null;
  return {
    r: parseInt(cheio.slice(0, 2), 16),
    g: parseInt(cheio.slice(2, 4), 16),
    b: parseInt(cheio.slice(4, 6), 16),
  };
}

export function normalizarHex(hex: string | null | undefined): string {
  if (!hex) return COR_PADRAO;
  const rgb = hexParaRgb(hex);
  if (!rgb) return COR_PADRAO;
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

function rgbParaHex({ r, g, b }: RGB): string {
  const h = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Mistura duas cores. `peso` = quanto de `b` entra (0..1). */
function misturar(a: RGB, b: RGB, peso: number): RGB {
  return {
    r: a.r + (b.r - a.r) * peso,
    g: a.g + (b.g - a.g) * peso,
    b: a.b + (b.b - a.b) * peso,
  };
}

const BRANCO: RGB = { r: 255, g: 255, b: 255 };
const PRETO: RGB = { r: 0, g: 0, b: 0 };

/** Luminância relativa WCAG 2.1 — base para decidir tinta sobre a marca. */
export function luminancia(rgb: RGB): number {
  const canal = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(rgb.r) + 0.7152 * canal(rgb.g) + 0.0722 * canal(rgb.b);
}

export function contraste(a: RGB, b: RGB): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [claro, escuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (escuro + 0.05);
}

export interface PaletaTenant {
  /** A cor da agência, já normalizada. */
  marca: string;
  /** Texto/ícone legível POR CIMA da cor da agência (branco ou tinta escura). */
  sobreMarca: string;
  /** Variação da marca com contraste garantido contra o fundo do painel. */
  marcaLegivel: string;
  /** Marca mais forte, para hover de botão sólido. */
  marcaForte: string;
  /** Véu da marca sobre a superfície — chips, estado ativo, fundos de realce. */
  marcaVeu: string;
  marcaVeuForte: string;
  /** Borda tingida pela marca. */
  marcaBorda: string;
  /** Sombra colorida para elevar o botão primário. */
  marcaSombra: string;
  /** Gradiente de assinatura, usado no cabeçalho e na placa do logo. */
  gradiente: string;
  /** Rampa de 6 tons para o funil — da marca clara à marca escura. */
  rampa: string[];
}

/**
 * Deriva a paleta completa do tenant.
 *
 * No escuro a marca é clareada até passar de ~3.5:1 contra o fundo, no claro é
 * escurecida pelo mesmo critério. É isso que impede que uma marca azul-marinho
 * suma no tema escuro ou que uma marca amarela suma no tema claro.
 */
export function derivarPaleta(corBruta: string | null | undefined, escuro: boolean): PaletaTenant {
  const marca = normalizarHex(corBruta);
  const rgb = hexParaRgb(marca)!;

  const fundoPainel = hexParaRgb(escuro ? '#0d1016' : '#f0f2f5')!;
  const tintaEscura = '#14181f';

  // Texto sobre a cor sólida da marca.
  const sobreMarca = contraste(rgb, BRANCO) >= 3.2 ? '#ffffff' : tintaEscura;

  // Ajusta a marca até ficar legível contra o fundo do painel.
  let legivel = rgb;
  for (let i = 0; i < 12 && contraste(legivel, fundoPainel) < 3.6; i++) {
    legivel = misturar(legivel, escuro ? BRANCO : PRETO, 0.08);
  }

  const forte = misturar(rgb, escuro ? BRANCO : PRETO, 0.14);
  const clara = misturar(rgb, BRANCO, 0.55);
  const escura = misturar(rgb, PRETO, 0.45);

  const rgba = (a: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

  return {
    marca,
    sobreMarca,
    marcaLegivel: rgbParaHex(legivel),
    marcaForte: rgbParaHex(forte),
    marcaVeu: rgba(escuro ? 0.16 : 0.09),
    marcaVeuForte: rgba(escuro ? 0.28 : 0.16),
    marcaBorda: rgba(escuro ? 0.42 : 0.28),
    marcaSombra: rgba(escuro ? 0.4 : 0.28),
    gradiente: `linear-gradient(135deg, ${rgbParaHex(misturar(rgb, BRANCO, 0.12))} 0%, ${marca} 45%, ${rgbParaHex(
      misturar(rgb, PRETO, 0.28),
    )} 100%)`,
    rampa: [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) =>
      rgbParaHex(t <= 0.5 ? misturar(clara, rgb, t * 2) : misturar(rgb, escura, (t - 0.5) * 2)),
    ),
  };
}
