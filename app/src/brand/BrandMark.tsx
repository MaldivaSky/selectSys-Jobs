import { BRAND, BRAND_COLORS as C, BRIDGE_PATH, MARK_GEO as G } from './brand';

/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · LOGO
   Único lugar onde a logo é desenhada. Ninguém redesenha o símbolo à mão.

     <BrandMark />                  símbolo
     <BrandMark tone="light" />     símbolo sobre fundo escuro
     <BrandMark animated />         símbolo que se desenha (abertura/loading)
     <BrandLockup />                símbolo + logotipo

   Leitura do símbolo: o círculo é o mundo; a ponte liga os dois lados; o ponto
   verde é o Brasil (origem) e o vermelho é o Japão (destino).
   ═════════════════════════════════════════════════════════════════════════ */

type Tone = 'auto' | 'ink' | 'light';

/** O traço acompanha o tema: nunca some sobre fundo escuro. */
function tracos(tone: Tone) {
  if (tone === 'light') return { stroke: C.cream, ring: C.ring };
  if (tone === 'ink') return { stroke: C.ink, ring: C.ink };
  return { stroke: 'var(--ssj-text)', ring: 'var(--ssj-text)' };
}

interface MarkProps {
  /** Lado do símbolo em px. Mínimo legível: 20. */
  size?: number;
  /** `auto` segue o tema (padrão). `light` força fundo escuro; `ink`, claro. */
  tone?: Tone;
  /** Desenha o traço e faz o ponto atravessar a ponte. */
  animated?: boolean;
  /** Some com os pontos de origem/destino (uso em marca-d'água). */
  bare?: boolean;
  className?: string;
}

export function BrandMark({ size = 26, tone = 'auto', animated = false, bare = false, className }: MarkProps) {
  const { stroke, ring } = tracos(tone);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label={BRAND.name}
      style={{ flex: 'none' }}
    >
      <circle
        cx={G.anel.cx}
        cy={G.anel.cy}
        r={G.anel.r}
        stroke={ring}
        strokeWidth={G.anel.w}
        pathLength={1}
        strokeDasharray={animated ? 1 : undefined}
        style={animated ? { strokeDashoffset: 1, animation: 'ssj-draw 1s .1s ease forwards' } : undefined}
      />

      {animated && (
        <line
          x1={G.origem.cx}
          y1={G.origem.cy}
          x2={G.destino.cx}
          y2={G.destino.cy}
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: 1, animation: 'ssj-draw .7s .35s ease forwards' }}
        />
      )}

      <path
        d={BRIDGE_PATH}
        stroke={stroke}
        strokeWidth={G.ponte.w}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={animated ? 1 : undefined}
        style={animated ? { strokeDashoffset: 1, animation: 'ssj-draw 1s .3s ease forwards' } : undefined}
      />

      {!bare && (
        <>
          <circle
            cx={G.origem.cx}
            cy={G.origem.cy}
            r={G.origem.r}
            fill={C.verde}
            style={animated ? { opacity: 0, animation: 'ssj-pop .4s .35s ease forwards' } : undefined}
          />
          <circle
            cx={G.destino.cx}
            cy={G.destino.cy}
            r={G.destino.r}
            fill={C.shu}
            style={
              animated
                ? { opacity: 0, transformOrigin: `${G.destino.cx}px ${G.destino.cy}px`, animation: 'ssj-pop .5s 1.25s cubic-bezier(.3,1.4,.5,1) forwards' }
                : undefined
            }
          />
        </>
      )}

      {/* O ponto que faz a travessia: verde → âmbar → vermelho. */}
      {animated && <circle className="ssj-bridge-dot" r={G.origem.r} fill={C.verde} />}
    </svg>
  );
}

interface LockupProps {
  size?: number;
  tone?: Tone;
  /** Mostra a assinatura "Brasil → Japão" abaixo do nome. */
  withTagline?: boolean;
  className?: string;
}

/** Símbolo + logotipo, na proporção correta. Use no cabeçalho e no rodapé. */
export function BrandLockup({ size = 32, tone = 'auto', withTagline = false, className }: LockupProps) {
  const fg = tone === 'light' ? C.cream : 'var(--ssj-text)';

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36 }}>
      <BrandMark size={size} tone={tone} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--ssj-font-display)',
            fontWeight: 700,
            fontSize: size * 0.56,
            letterSpacing: '-0.025em',
            color: fg,
            whiteSpace: 'nowrap',
          }}
        >
          {BRAND.wordmark.strong}
          <span style={{ color: tone === 'light' ? C.shu : 'var(--ssj-shu)' }}> {BRAND.wordmark.light}</span>
        </span>
        {withTagline && (
          <span
            style={{
              fontFamily: 'var(--ssj-font-mono)',
              fontSize: Math.max(8.5, size * 0.29),
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: tone === 'light' ? C.ring : 'var(--ssj-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {BRAND.route.from} → {BRAND.route.to}
          </span>
        )}
      </span>
    </span>
  );
}
