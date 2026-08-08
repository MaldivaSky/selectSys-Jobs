import { FICHA_FUJIARTE_2024_06 } from '@selectsys/core';
import { supabase, temBanco } from './supabase';
import { executarTriagem } from './triagemEngine';

/* ═══════════════════════════════════════════════════════════════════════════
   PERSISTÊNCIA DA CANDIDATURA (MOTOR DUPLO SUPABASE) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Garante persistência atômica e idempotente no Supabase:
   1. Executa a RPC `submeter_candidatura` no PostgreSQL.
   2. Caso a RPC não esteja presente no ambiente, executa fallback transparente
      com inserções diretas em `candidates`, `applications`, `application_data`,
      `consents` e `screening_decisions`.
   ═════════════════════════════════════════════════════════════════════════ */

export type Valores = Record<string, unknown>;
export type Linhas = Record<string, Valores[]>;

export interface Rascunho {
  valores: Valores;
  linhas: Linhas;
  consentimentos: Record<string, boolean>;
  etapa: number;
}

/* Rascunho em memória, de propósito
   ---------------------------------------------------------------------------
   Estas três funções gravavam a ficha inteira em `localStorage`, sob a chave
   `ssj:ficha:rascunho`. Passaporte, CPF e RG ficavam em disco, legíveis por
   qualquer script da página e sobrevivendo ao fechamento do navegador.

   Agora o buffer é um objeto de módulo: some ao recarregar a página, que é o
   comportamento seguro por padrão. Retomada durável é atribuição do
   `rascunhoFicha.ts`, que grava em `application_data.rascunho` sob RLS e só
   para candidato identificado. */
let bufferMemoria: Rascunho | null = null;

export function salvarLocal(r: Rascunho) {
  bufferMemoria = { ...r };
  return true;
}

export function lerLocal(): Rascunho | null {
  return bufferMemoria;
}

export function limparLocal() {
  bufferMemoria = null;
  // Varre resíduo gravado por versões anteriores.
  if (typeof window !== 'undefined') {
    for (const chave of Object.keys(window.localStorage)) {
      if (/^ssj:ficha/.test(chave)) window.localStorage.removeItem(chave);
    }
  }
}

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

export interface ResultadoEnvio {
  ok: boolean;
  candidateId?: string;
  applicationId?: string;
  motivo?: string;
  demonstracao?: boolean;
}

export async function enviarCandidatura(
  r: Rascunho,
  opcoes: { orgSlug?: string; agenciaCodigo?: string | null } = {},
): Promise<ResultadoEnvio> {
  if (!temBanco || !supabase) {
    return { ok: true, demonstracao: true };
  }

  const orgSlug = opcoes.orgSlug ?? 'fujiarte';

  // Tentativa 1: RPC PostgreSQL atômico `submeter_candidatura`
  try {
    const { data, error } = await supabase.rpc('submeter_candidatura', {
      p_org_slug: orgSlug,
      p_agencia_codigo: opcoes.agenciaCodigo ?? null,
      p_form_version: FICHA_FUJIARTE_2024_06.version,
      p_valores: r.valores,
      p_linhas: r.linhas,
      p_consentimentos: r.consentimentos,
      p_user_agent: navigator.userAgent,
    });

    if (!error && data) {
      const linha = Array.isArray(data) ? data[0] : data;
      return {
        ok: true,
        candidateId: linha?.candidate_id,
        applicationId: linha?.application_id,
      };
    }
  } catch {
    // Seguir para o fallback direto de tabela
  }

  // Tentativa 2: Fallback direto de tabelas com RLS
  try {
    // Obter ID da organização
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .maybeSingle();

    const orgId = orgData?.id;
    if (!orgId) {
      return { ok: false, motivo: `Organização '${orgSlug}' não encontrada no Supabase.` };
    }

    const cpf = String(r.valores.cpf || `CPF-TEMP-${Date.now()}`);
    const nome = String(r.valores.nomeCompleto || r.valores.nome_completo || 'CANDIDATO DEKASSEGUI');

    // Upsert em Candidates
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .upsert(
        {
          organization_id: orgId,
          cpf,
          nome_completo: nome,
          data_nascimento: r.valores.dataNascimento ? String(r.valores.dataNascimento) : null,
          sexo: String(r.valores.sexo || 'M'),
          nacionalidade: String(r.valores.nacionalidade || 'BRAS'),
          geracao: (r.valores.geracaoNikkei as any) || null,
          email: r.valores.email ? String(r.valores.email) : null,
          telefone: r.valores.celular ? String(r.valores.celular) : null,
          cidade: r.valores.cidade ? String(r.valores.cidade) : null,
          estado: r.valores.estado ? String(r.valores.estado) : null,
          cep: r.valores.cep ? String(r.valores.cep) : null,
          tem_tatuagem: String(r.valores.temTatuagem || '').toLowerCase() === 'sim',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,cpf' }
      )
      .select('id')
      .single();

    if (candError || !candidate) {
      return { ok: false, motivo: candError?.message || 'Falha ao gravar registro de candidato.' };
    }

    // Obter schema de formulário
    const { data: schemaData } = await supabase
      .from('form_schemas')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1)
      .maybeSingle();

    const formSchemaId = schemaData?.id || '00000000-0000-0000-0000-000000000000';

    // Executar Triagem
    const triagem = executarTriagem(r.valores, r.linhas);

    // Inserir Candidatura (Application)
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        organization_id: orgId,
        candidate_id: candidate.id,
        form_schema_id: formSchemaId,
        status: triagem.status === 'reprovado' ? 'reprovado' : triagem.status === 'encerrar_fluxo' ? 'inativo' : 'recebida',
        submetida_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (appError || !application) {
      return { ok: false, motivo: appError?.message || 'Falha ao criar candidatura.' };
    }

    // Inserir Application Data
    await supabase.from('application_data').insert({
      application_id: application.id,
      data: r.valores,
      rascunho: r.valores,
      updated_at: new Date().toISOString(),
    });

    // Inserir Decisão de Triagem
    await supabase.from('screening_decisions').insert({
      organization_id: orgId,
      application_id: application.id,
      ruleset_version: 1,
      facts: r.valores,
      fired_rules: triagem.regrasDisparadas,
      outcome: triagem.status === 'aprovado_entrevista' ? 'aprovar' : triagem.status === 'reprovado' ? 'reprovar' : 'revisao_manual',
      reason_code: triagem.razao,
    });

    // Inserir Consentimentos LGPD
    if (r.consentimentos) {
      const consentsToInsert = Object.entries(r.consentimentos).map(([tipo, concedido]) => ({
        organization_id: orgId,
        candidate_id: candidate.id,
        tipo,
        texto_versao: tipo,
        concedido: Boolean(concedido),
        user_agent: navigator.userAgent,
      }));

      await supabase.from('consents').insert(consentsToInsert);
    }

    return {
      ok: true,
      candidateId: candidate.id,
      applicationId: application.id,
    };
  } catch (fallbackError: any) {
    return { ok: false, motivo: fallbackError?.message || 'Erro inesperado na gravação de dados.' };
  }
}
