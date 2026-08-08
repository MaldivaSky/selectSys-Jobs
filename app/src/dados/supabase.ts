import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE SUPABASE — projeto selectSys-Jobs (sa-east-1, São Paulo)
   ---------------------------------------------------------------------------
   A chave publicável é pública por desenho: quem protege os dados é a RLS no
   banco, não o segredo da chave. Um bug de query não vaza dados entre
   organizações porque a política roda no PostgreSQL, não na aplicação.

   O cliente é OPCIONAL. Sem as variáveis de ambiente o app continua de pé em
   modo demonstração — a vitrine e o protótipo não podem cair numa reunião
   porque o banco está indisponível.
   ═════════════════════════════════════════════════════════════════════════ */

const envMeta = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
const envProc = typeof globalThis !== 'undefined' && (globalThis as any).process?.env ? (globalThis as any).process.env : undefined;

const url = (envMeta?.VITE_SUPABASE_URL || envProc?.VITE_SUPABASE_URL) as string | undefined;
const chave = (envMeta?.VITE_SUPABASE_PUBLISHABLE_KEY || envProc?.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const temBanco = Boolean(url && chave);

/* Onde a sessão é guardada
   ---------------------------------------------------------------------------
   `sessionStorage`, não `localStorage`. A diferença prática: o token morre ao
   fechar a aba e nunca é escrito no perfil em disco do navegador, então um
   computador compartilhado na agência não deixa sessão viva para o próximo
   que sentar. Em `localStorage` o token sobrevive a reinício de máquina.

   O que isso NÃO resolve: qualquer JavaScript rodando na página continua
   capaz de ler `sessionStorage`. Sessão que o front não consegue ler exige
   cookie httpOnly emitido por servidor — ou seja, um BFF/SSR na frente do
   Supabase. Está registrado como decisão de arquitetura pendente; não é um
   ajuste de flag.

   PKCE porque o fluxo implícito devolve o token na URL, e URL vai parar em
   histórico, log de proxy e cabeçalho Referer. */
export const supabase: SupabaseClient | null = temBanco
  ? createClient(url!, chave!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        storageKey: 'ssj-auth',
      },
      global: { headers: { 'x-application': 'selectsys-jobs' } },
    })
  : null;

/* Limpeza da sessão antiga: quem já usou o app tem um token do Supabase
   gravado em `localStorage`, que sobrevive a reinício de máquina. Trocar o
   armazenamento não apaga o que já está lá — isto apaga. */
if (typeof window !== 'undefined') {
  for (const chaveAntiga of Object.keys(window.localStorage)) {
    if (/^sb-.*-auth-token/.test(chaveAntiga)) window.localStorage.removeItem(chaveAntiga);
  }
}

if (!temBanco && envMeta?.DEV) {
  console.info(
    '[SelectSys] Sem VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — rodando em modo demonstração, sem persistência.',
  );
}
