import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CHAVE_TEMA, ContextoTema, FUNDO, type Tema, type TemaCtx } from './contexto';

/* ═══════════════════════════════════════════════════════════════════════════
   TEMA — FONTE ÚNICA
   Antes cada página tinha o próprio botão e o próprio estado: navegar da Home
   para o walkthrough virava o app inteiro do escuro para o claro. Agora existe
   UM estado, no shell, persistido. Página nenhuma declara tema.

   O contexto e o hook `useTheme` vivem em `contexto.ts` — ver a justificativa
   de Fast Refresh lá. Este arquivo exporta só o componente.
   ═════════════════════════════════════════════════════════════════════════ */

function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  if (salvo === 'light' || salvo === 'dark') return salvo;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', FUNDO[tema]);
    localStorage.setItem(CHAVE_TEMA, tema);
  }, [tema]);

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const valor = useMemo<TemaCtx>(
    () => ({ tema, escuro: tema === 'dark', alternar, definir: setTema }),
    [tema, alternar],
  );

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>;
}
