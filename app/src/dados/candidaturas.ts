import { FICHA_FUJIARTE_2024_06 } from '@selectsys/core';
import { supabase, temBanco } from './supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   PERSISTÊNCIA DA CANDIDATURA
   ---------------------------------------------------------------------------
   Duas garantias que o escopo exige e que precisam ser explícitas:

   IDEMPOTÊNCIA — o autosave dispara a cada 3s e o candidato pode reenviar o
   formulário. Nenhuma dessas repetições pode criar candidato duplicado. A
   chave é (organization_id, cpf) e todo caminho de escrita usa upsert sobre
   ela. Rodar duas vezes tem o mesmo efeito de rodar uma.

   ATOMICIDADE — enviar a candidatura toca candidates, applications,
   application_data, work_history, family_members e consents. Ou entra tudo,
   ou não entra nada: uma ficha sem consentimento registrado é uma infração,
   não um registro parcial. Por isso o envio final passa por UMA função no
   banco (rpc), dentro de uma transação — e não por seis chamadas soltas do
   navegador, que falham no meio e deixam lixo.
   ═════════════════════════════════════════════════════════════════════════ */

export type Valores = Record<string, unknown>;
export type Linhas = Record<string, Valores[]>;

export interface Rascunho {
  valores: Valores;
  linhas: Linhas;
  consentimentos: Record<string, boolean>;
  etapa: number;
}

const CHAVE_LOCAL = 'ssj:ficha:rascunho';

/* ── Rascunho ────────────────────────────────────────────────────────────
   Grava sempre local primeiro: o candidato preenche no celular, muitas vezes
   com sinal ruim. O banco é o segundo destino, não o primeiro — perder
   conexão não pode custar 130 campos.                                      */

export function salvarLocal(r: Rascunho) {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify({ ...r, em: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function lerLocal(): Rascunho | null {
  try {
    const bruto = localStorage.getItem(CHAVE_LOCAL);
    return bruto ? (JSON.parse(bruto) as Rascunho) : null;
  } catch {
    return null;
  }
}

export function limparLocal() {
  localStorage.removeItem(CHAVE_LOCAL);
}

/**
 * Espelha o rascunho no banco quando há candidatura aberta e sessão.
 * Idempotente: sempre o mesmo `application_id`, sempre upsert.
 */
export async function salvarRascunhoRemoto(applicationId: string, r: Rascunho) {
  if (!temBanco || !supabase) return { ok: false, motivo: 'sem-banco' as const };
  const { error } = await supabase
    .from('application_data')
    .upsert(
      { application_id: applicationId, rascunho: r, updated_at: new Date().toISOString() },
      { onConflict: 'application_id' },
    );
  return error ? { ok: false as const, motivo: error.message } : { ok: true as const };
}

/* ── Envio ───────────────────────────────────────────────────────────────── */

export interface ResultadoEnvio {
  ok: boolean;
  candidateId?: string;
  applicationId?: string;
  motivo?: string;
  /** Sem banco configurado a ficha segue válida em modo demonstração. */
  demonstracao?: boolean;
}

/**
 * Envia a candidatura inteira numa transação só.
 *
 * Chama `submeter_candidatura`, que no banco:
 *   1. faz upsert do candidato por (organization_id, cpf) — idempotente;
 *   2. grava o histórico 1:N substituindo o anterior, sem duplicar;
 *   3. registra os consentimentos com versão, IP e user-agent;
 *   4. cria (ou reaproveita) a candidatura e guarda as respostas;
 *   5. roda a triagem e persiste a decisão com os fatos de entrada.
 *
 * Reenviar a mesma ficha atualiza; não cria uma segunda.
 */
export async function enviarCandidatura(
  r: Rascunho,
  opcoes: { orgSlug?: string; agenciaCodigo?: string | null } = {},
): Promise<ResultadoEnvio> {
  if (!temBanco || !supabase) {
    return { ok: true, demonstracao: true };
  }

  const { data, error } = await supabase.rpc('submeter_candidatura', {
    p_org_slug: opcoes.orgSlug ?? 'fujiarte',
    p_agencia_codigo: opcoes.agenciaCodigo ?? null,
    p_form_version: FICHA_FUJIARTE_2024_06.version,
    p_valores: r.valores,
    p_linhas: r.linhas,
    p_consentimentos: r.consentimentos,
    p_user_agent: navigator.userAgent,
  });

  if (error) return { ok: false, motivo: error.message };

  const linha = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    candidateId: linha?.candidate_id,
    applicationId: linha?.application_id,
  };
}
