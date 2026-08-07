import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BrandMark } from '../brand/BrandMark';

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

/* ── Carregando ────────────────────────────────────────────────────────────
   A marca nova em movimento: o gradiente atravessa o kanji 働 do verde Brasil
   ao vermelho Japão enquanto o dado vem. É a mesma travessia da identidade,
   agora indicando espera.

   Só para dado em trânsito. A abertura continua sendo o globo, intocado.   */
export function Loader({ texto = 'carregando' }: { texto?: string }) {
  return (
    <div className="ssj-carregando" role="status" aria-live="polite" aria-busy="true">
      <BrandMark size={30} carregando />
      <span className="ssj-carregando__texto">{texto}</span>
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
