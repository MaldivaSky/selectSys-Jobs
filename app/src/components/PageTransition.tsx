import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════════════
   TRANSIÇÃO DE PÁGINA
   Troca de rota = barra fina no topo (verde → âmbar → vermelho, a travessia) +
   conteúdo entrando de baixo. Sempre sobe ao topo na rota nova.
   Envolve <Routes> uma única vez, no App.
   ═════════════════════════════════════════════════════════════════════════ */

const BARRA_MS = 420;

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
    const t = setTimeout(() => setCarregando(false), BARRA_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      {carregando && <div className="ssj-progressbar" aria-hidden="true" />}
      {/* A key força o remonte: a animação de entrada roda a cada rota. */}
      <div key={pathname} className="ssj-page">
        {children}
      </div>
    </>
  );
}

/* ── Estado de carregando reutilizável ─────────────────────────────────────
   Para dados em trânsito dentro de uma página (fetch, import, cálculo).    */
export function Loader({ texto = 'carregando' }: { texto?: string }) {
  return (
    <div className="ssj-loader" role="status" aria-live="polite">
      <span className="ssj-loader__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{texto}</span>
    </div>
  );
}

/** Bloco de carregamento que ocupa a área de conteúdo. */
export function LoaderBloco({ altura = 240, texto }: { altura?: number; texto?: string }) {
  return (
    <div
      style={{
        minHeight: altura,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loader texto={texto} />
    </div>
  );
}
