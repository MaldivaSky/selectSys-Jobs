import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   TEMA — FONTE ÚNICA
   Antes cada página tinha o próprio botão e o próprio estado: navegar da Home
   para o walkthrough virava o app inteiro do escuro para o claro. Agora existe
   UM estado, no shell, persistido. Página nenhuma declara tema.
   ═════════════════════════════════════════════════════════════════════════ */

export type Tema = 'light' | 'dark';

const CHAVE = 'ssj:tema';
const FUNDO: Record<Tema, string> = { light: '#f4f5f2', dark: '#0d1016' };

interface TemaCtx {
  tema: Tema;
  escuro: boolean;
  alternar: () => void;
  definir: (t: Tema) => void;
}

const Ctx = createContext<TemaCtx | null>(null);

function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE);
  if (salvo === 'light' || salvo === 'dark') return salvo;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', FUNDO[tema]);
    localStorage.setItem(CHAVE, tema);
  }, [tema]);

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const valor = useMemo<TemaCtx>(
    () => ({ tema, escuro: tema === 'dark', alternar, definir: setTema }),
    [tema, alternar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useTheme(): TemaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
