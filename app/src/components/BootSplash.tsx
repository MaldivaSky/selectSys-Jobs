import { useEffect, useState } from 'react';
import { GloboTravessia } from '../brand/GloboTravessia';
import { BRAND, BRAND_COLORS as C } from '../brand/brand';

/* ═══════════════════════════════════════════════════════════════════════════
   ABERTURA DA MARCA · tela de carregamento com Globo da Travessia
   ═════════════════════════════════════════════════════════════════════════ */

const HOLD_MS = 2800;
const FADE_MS = 480;

export function BootSplash() {
  const [state, setState] = useState<'oculto' | 'ativo' | 'saindo'>('ativo');

  useEffect(() => {
    if (state !== 'ativo') return;
    const t = setTimeout(() => setState('saindo'), HOLD_MS);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state !== 'saindo') return;
    const t = setTimeout(() => setState('oculto'), FADE_MS);
    return () => clearTimeout(t);
  }, [state]);

  // Trava o scroll do corpo enquanto a abertura ocupa a tela.
  useEffect(() => {
    if (state === 'oculto') return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [state]);

  useEffect(() => {
    if (state !== 'ativo') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setState('saindo');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  if (state === 'oculto') return null;

  return (
    <div
      onClick={() => setState('saindo')}
      role="status"
      aria-label={`Carregando ${BRAND.name}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(120% 100% at 50% 30%,#1c2331 0%,#0d1016 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: state === 'saindo' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        padding: '0 24px',
      }}
    >
      <GloboTravessia size={220} tone="dark" comRotulos={true} />

      <div style={{ marginTop: 14, textAlign: 'center', opacity: 0, animation: 'ssj-fadeUp .7s 1.35s ease forwards' }}>
        <div
          style={{
            font: "700 clamp(24px,7vw,30px)/1 var(--ssj-font-display)",
            letterSpacing: '-0.02em',
            color: C.cream,
          }}
        >
          {BRAND.wordmark.strong}
        </div>
        <div
          style={{
            marginTop: 9,
            font: "500 12px/1 var(--ssj-font-mono)",
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: '#c98a7d',
            paddingLeft: '0.5em',
          }}
        >
          {BRAND.wordmark.light}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          font: "400 11px/1 var(--ssj-font-mono)",
          letterSpacing: '0.14em',
          color: '#6d7890',
          opacity: 0,
          animation: 'ssj-fadeIn .8s 1.7s ease forwards',
        }}
      >
        {BRAND.route.from} <span style={{ color: C.shu }}>→</span> {BRAND.route.to}
      </div>

      <p
        style={{
          marginTop: 22,
          maxWidth: 340,
          textAlign: 'center',
          font: '400 12.5px/1.6 var(--ssj-font-sans)',
          color: '#5c6780',
          opacity: 0,
          animation: 'ssj-fadeIn 1s 2.05s ease forwards',
        }}
      >
        {BRAND.missionShort}
      </p>

      <div
        style={{
          position: 'absolute',
          bottom: 64,
          width: 140,
          height: 3,
          borderRadius: 3,
          background: 'rgba(255,255,255,.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg,${C.verde},${C.ambar},${C.shu})`,
            transformOrigin: 'left',
            animation: `ssj-barload ${HOLD_MS}ms .2s cubic-bezier(.6,0,.3,1) forwards`,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          font: "400 9.5px/1 var(--ssj-font-mono)",
          letterSpacing: '0.1em',
          color: '#4b5670',
          opacity: 0,
          animation: 'ssj-fadeIn 1s 2.2s ease forwards',
        }}
      >
        toque para pular
      </div>
    </div>
  );
}
