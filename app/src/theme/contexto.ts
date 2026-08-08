import { createContext, useContext } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXTO DO TEMA — SEPARADO DO PROVIDER
   ---------------------------------------------------------------------------
   O contexto e o hook moram aqui, e não em `theme.tsx`, por uma razão de
   ferramenta: um arquivo que exporta um componente E outras coisas quebra o
   Fast Refresh do Vite — ao editar o provider, o React remonta a árvore e o
   estado da tela some. O `react(only-export-components)` do oxlint aponta
   exatamente isso, e é regra de erro na CI deste repo.

   Com a separação, `theme.tsx` exporta só `<ThemeProvider>` e este arquivo
   exporta só valor. É a mesma divisão que o React Router e o TanStack Query
   fazem entre provider e hook de acesso.
   ═════════════════════════════════════════════════════════════════════════ */

export type Tema = 'light' | 'dark';

export interface TemaCtx {
  tema: Tema;
  escuro: boolean;
  alternar: () => void;
  definir: (t: Tema) => void;
}

export const CHAVE_TEMA = 'ssj:tema';

export const FUNDO: Record<Tema, string> = { light: '#f4f5f2', dark: '#0d1016' };

export const ContextoTema = createContext<TemaCtx | null>(null);

export function useTheme(): TemaCtx {
  const ctx = useContext(ContextoTema);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
