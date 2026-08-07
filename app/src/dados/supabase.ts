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

export const supabase: SupabaseClient | null = temBanco
  ? createClient(url!, chave!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      global: { headers: { 'x-application': 'selectsys-jobs' } },
    })
  : null;

if (!temBanco && envMeta?.DEV) {
  console.info(
    '[SelectSys] Sem VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — rodando em modo demonstração, sem persistência.',
  );
}
