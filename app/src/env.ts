export interface EnvVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_DEEPSEEK_API_KEY?: string;
  VITE_GAROON_SUBDOMAIN?: string;
  VITE_GAROON_USER?: string;
  VITE_GAROON_TOKEN?: string;
  VITE_RESEND_API_KEY?: string;
}

function validarEnv(): EnvVariables {
  const envSource = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && (globalThis as any).process?.env ? (globalThis as any).process.env : {});

  const url = envSource.VITE_SUPABASE_URL || '';
  const key = envSource.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const deepseek = envSource.VITE_DEEPSEEK_API_KEY || '';
  const garoonSubdomain = envSource.VITE_GAROON_SUBDOMAIN || '';
  const garoonUser = envSource.VITE_GAROON_USER || '';
  const garoonToken = envSource.VITE_GAROON_TOKEN || '';
  const resendKey = envSource.VITE_RESEND_API_KEY || '';

  const erros: string[] = [];

  if (envSource.PROD) {
    if (!url) erros.push('VITE_SUPABASE_URL está ausente.');
    if (!key) erros.push('VITE_SUPABASE_PUBLISHABLE_KEY está ausente.');
  }

  if (erros.length > 0) {
    const msg = `🚨 ERRO CRÍTICO DE CONFIGURAÇÃO DE AMBIENTE (.env):\n${erros.map(e => `  - ${e}`).join('\n')}`;
    console.error(msg);

    if (typeof document !== 'undefined') {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="background-color: #1a1a2e; color: #ff4d4d; font-family: sans-serif; padding: 2rem; border-radius: 8px; margin: 2rem; border: 1px solid #ff4d4d;">
            <h2 style="margin-top: 0; color: #ff6b6b;">⚠️ Falha de Boot — Variáveis de Ambiente Inválidas</h2>
            <p>O sistema foi interrompido para evitar inconsistência de dados em produção.</p>
            <pre style="background: #0f0f1b; padding: 1rem; border-radius: 4px; color: #ff8585; white-space: pre-wrap;">${msg}</pre>
          </div>
        `;
      }
    }
  }

  return {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: key,
    VITE_DEEPSEEK_API_KEY: deepseek,
    VITE_GAROON_SUBDOMAIN: garoonSubdomain,
    VITE_GAROON_USER: garoonUser,
    VITE_GAROON_TOKEN: garoonToken,
    VITE_RESEND_API_KEY: resendKey,
  };
}

export const env = validarEnv();
