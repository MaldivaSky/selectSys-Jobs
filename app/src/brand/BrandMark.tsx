import { BRAND, BRAND_COLORS as C } from './brand';

/* ═══════════════════════════════════════════════════════════════════════════
   SELECTSYS JOBS · LOGO — 働
   ---------------------------------------------------------------------------
   Único lugar onde a marca é desenhada. Arte aprovada pelo CEO; a geometria e
   o gradiente vêm de app/src/styles/marca.css, cópia literal do arquivo em
   brand/. Ninguém redesenha o símbolo.

     <BrandMark />                símbolo
     <BrandMark tone="light" />   sobre fundo escuro (dispensa a caixa)
     <BrandMark carregando />     a travessia correndo dentro do kanji
     <BrandLockup />              símbolo + logotipo

   Leitura: 働 é "trabalhar". O gradiente atravessa o glifo do verde Brasil ao
   vermelho Japão, e o sol 日の丸 marca o destino no canto.

   NÃO confundir com o globo (GloboTravessia.tsx): aquele é a animação de
   abertura e continua como estava.
   ═════════════════════════════════════════════════════════════════════════ */

type Tone = 'auto' | 'ink' | 'light';

interface MarkProps {
  /** Lado do selo em px. Abaixo de 20 o kanji vira mancha. */
  size?: number;
  /** `light` sobre fundo escuro dispensa a caixa; `auto` e `ink` mantêm. */
  tone?: Tone;
  /** Gradiente em movimento — use só em carregamento de dados. */
  carregando?: boolean;
  /** Entrada da marca com a batida do selo. */
  animado?: boolean;
  className?: string;
}

export function BrandMark({
  size = 34,
  tone = 'auto',
  carregando = false,
  animado = false,
  className,
}: MarkProps) {
  const semCaixa = tone === 'light';
  const sol = Math.max(6, Math.round(size * 0.235));

  return (
    <span
      className={`kseal${semCaixa ? ' kseal--sem-caixa' : ''}${className ? ' ' + className : ''}`}
      role="img"
      aria-label={BRAND.name}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, Math.round(size * 0.28)),
        animation: animado ? 'ssj-sealIn .8s cubic-bezier(.3,1.25,.5,1) both' : undefined,
      }}
    >
      <span
        className={`jp kj${carregando ? ' ssj-carregando__kanji' : ''}`}
        style={{ fontSize: Math.round(size * 0.63), lineHeight: 1 }}
        aria-hidden="true"
      >
        働
      </span>
      <span
        className={`sun${carregando ? ' ssj-carregando__sol' : ''}`}
        aria-hidden="true"
        style={{
          top: Math.round(size * 0.16),
          right: Math.round(size * 0.16),
          width: sol,
          height: sol,
        }}
      />
    </span>
  );
}

interface LockupProps {
  size?: number;
  tone?: Tone;
  /** Mostra a assinatura "Brasil → Japão" abaixo do nome. */
  withTagline?: boolean;
  className?: string;
}

/** Símbolo + logotipo, na proporção do lockup oficial. */
export function BrandLockup({ size = 40, tone = 'auto', withTagline = false, className }: LockupProps) {
  const fg = tone === 'light' ? C.cream : 'var(--ssj-text)';

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34 }}>
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
          {/* O vermelho do logotipo é o da bandeira, igual ao sol do selo. */}
          <span style={{ color: '#c8102e' }}> {BRAND.wordmark.light}</span>
        </span>
        {withTagline && (
          <span
            style={{
              fontFamily: 'var(--ssj-font-mono)',
              fontSize: Math.max(12, size * 0.28),
              letterSpacing: '0.18em',
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
