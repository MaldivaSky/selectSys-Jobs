import { supabase, temBanco } from './supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   RASCUNHO DA FICHA — PERSISTÊNCIA NO SERVIDOR
   ---------------------------------------------------------------------------
   A ficha do dekassegui carrega CPF, RG, passaporte, koseki e composição
   familiar. Isso não pode ficar em `localStorage`: o armazenamento sobrevive
   ao fechamento do navegador, é legível por qualquer script da página e, num
   computador compartilhado — lan house, balcão da agência —, fica disponível
   para o próximo que sentar. Antes gravávamos a ficha inteira em
   `ssj:ficha:<slug>` a cada 1,2 s.

   Regra que passa a valer:

     candidato identificado  → rascunho no Postgres, em
                               `application_data.rascunho`, sob a RLS que só
                               deixa o dono e a agência dele enxergarem
     candidato anônimo       → NADA de PII sai da memória. Só o número da
                               etapa vai para `sessionStorage`, que morre com
                               a aba e não diz nada sobre a pessoa

   A candidatura nasce com status `rascunho` (primeiro valor do enum), então
   ela não aparece no funil da agência até ser submetida.
   ═════════════════════════════════════════════════════════════════════════ */

export interface RascunhoFicha {
  dados: Record<string, unknown>;
  etapa: number;
  quando: number;
}

export type OrigemRascunho = 'servidor' | 'nenhum';

/** Rascunho mais velho que isto atrapalha mais do que ajuda. */
const VALIDADE_MS = 30 * 24 * 3600 * 1000;

/** Só a etapa. Nenhum dado pessoal — é um número de 1 a 7. */
const chaveEtapa = (slug: string) => `ssj:etapa:${slug}`;

/**
 * Apaga qualquer resíduo do formato antigo, em ambos os armazenamentos.
 * Roda na abertura da ficha e depois do envio: quem já usou o app tem PII
 * gravada em disco, e trocar a estratégia não limpa o que ficou para trás.
 */
export function sanitizarResiduosLocais(): number {
  if (typeof window === 'undefined') return 0;
  let removidos = 0;
  for (const area of [window.localStorage, window.sessionStorage]) {
    for (const chave of Object.keys(area)) {
      if (/^ssj:ficha/.test(chave)) {
        area.removeItem(chave);
        removidos += 1;
      }
    }
  }
  return removidos;
}

export function lerEtapaLocal(slug: string): number | null {
  if (typeof window === 'undefined') return null;
  const bruto = window.sessionStorage.getItem(chaveEtapa(slug));
  const n = bruto ? Number(bruto) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function salvarEtapaLocal(slug: string, etapa: number) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(chaveEtapa(slug), String(etapa));
}

export function limparEtapaLocal(slug: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(chaveEtapa(slug));
}

interface ContextoCandidato {
  userId: string;
  candidateId: string;
  applicationId: string;
}

/** `null` quando não há sessão — e aí nenhuma linha é criada no banco. */
export async function obterSessao(): Promise<{ id: string; email?: string } | null> {
  if (!temBanco || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
}

/**
 * Encontra — ou cria, na primeira gravação — o par candidato/candidatura em
 * estado `rascunho` desta pessoa nesta agência.
 */
async function contexto(orgId: string, nomeSugerido?: string): Promise<ContextoCandidato | null> {
  if (!temBanco || !supabase) return null;
  const sessao = await obterSessao();
  if (!sessao) return null;

  const { data: existente } = await supabase
    .from('candidates')
    .select('id')
    .eq('user_id', sessao.id)
    .eq('organization_id', orgId)
    .maybeSingle();

  let candidateId = existente?.id as string | undefined;

  if (!candidateId) {
    const { data: criado, error } = await supabase
      .from('candidates')
      .insert({
        user_id: sessao.id,
        organization_id: orgId,
        // `nome_completo` é NOT NULL. Enquanto o candidato não preenche, o
        // e-mail da sessão segura o registro sem inventar dado.
        nome_completo: (nomeSugerido || sessao.email || 'Candidato em preenchimento').slice(0, 120),
        email: sessao.email ?? null,
      })
      .select('id')
      .single();
    if (error || !criado) return null;
    candidateId = criado.id as string;
  }

  const { data: cand } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('organization_id', orgId)
    .eq('status', 'rascunho')
    .maybeSingle();

  let applicationId = cand?.id as string | undefined;

  if (!applicationId) {
    const { data: schema } = await supabase
      .from('form_schemas')
      .select('id')
      .eq('organization_id', orgId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!schema?.id) return null;

    const { data: criada, error } = await supabase
      .from('applications')
      .insert({
        organization_id: orgId,
        candidate_id: candidateId,
        form_schema_id: schema.id,
        status: 'rascunho',
        origem: 'portal_candidato',
      })
      .select('id')
      .single();
    if (error || !criada) return null;
    applicationId = criada.id as string;
  }

  return { userId: sessao.id, candidateId, applicationId };
}

export async function carregarRascunho(
  orgId: string,
): Promise<{ origem: OrigemRascunho; rascunho?: RascunhoFicha }> {
  if (!temBanco || !supabase) return { origem: 'nenhum' };
  const sessao = await obterSessao();
  if (!sessao) return { origem: 'nenhum' };

  const { data } = await supabase
    .from('applications')
    .select('id, application_data(rascunho, updated_at)')
    .eq('organization_id', orgId)
    .eq('status', 'rascunho')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const bruto = (data as { application_data?: { rascunho?: unknown; updated_at?: string } | null } | null)
    ?.application_data;
  const rascunho = bruto?.rascunho as RascunhoFicha | undefined;
  if (!rascunho || typeof rascunho !== 'object') return { origem: 'nenhum' };

  const quando = rascunho.quando ?? (bruto?.updated_at ? Date.parse(bruto.updated_at) : Date.now());
  if (Date.now() - quando > VALIDADE_MS) return { origem: 'nenhum' };

  return { origem: 'servidor', rascunho: { ...rascunho, quando } };
}

export async function salvarRascunho(
  orgId: string,
  r: RascunhoFicha,
  nomeSugerido?: string,
): Promise<{ ok: boolean; origem: OrigemRascunho }> {
  const ctx = await contexto(orgId, nomeSugerido);
  if (!ctx || !supabase) return { ok: false, origem: 'nenhum' };

  const { error } = await supabase.from('application_data').upsert(
    {
      application_id: ctx.applicationId,
      rascunho: r,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'application_id' },
  );

  return error ? { ok: false, origem: 'nenhum' } : { ok: true, origem: 'servidor' };
}

/** Chamado ao "começar do zero" e após o envio. */
export async function descartarRascunho(orgId: string, slug?: string) {
  if (slug) limparEtapaLocal(slug);
  sanitizarResiduosLocais();
  if (!temBanco || !supabase) return;
  const sessao = await obterSessao();
  if (!sessao) return;

  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('organization_id', orgId)
    .eq('status', 'rascunho');

  for (const linha of (data ?? []) as { id: string }[]) {
    await supabase.from('application_data').delete().eq('application_id', linha.id);
  }
}
