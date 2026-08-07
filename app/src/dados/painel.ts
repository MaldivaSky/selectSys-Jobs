import { ORDEM_FUNIL, STATUS, type StatusCandidatura } from '@selectsys/core';
import { supabase, temBanco } from './supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSULTAS DO PAINEL DE GESTÃO
   ---------------------------------------------------------------------------
   Tudo aqui volta da RLS já filtrado pela organização de quem consulta. Não
   existe `where organization_id = ...` no código do cliente — se existisse,
   um esquecimento viraria vazamento. O banco decide o que a pessoa vê.
   ═════════════════════════════════════════════════════════════════════════ */

export interface LinhaCandidato {
  id: string;
  application_id: string;
  nome_completo: string;
  idade: number | null;
  cidade: string | null;
  estado: string | null;
  geracao: string | null;
  nivel_japones: string | null;
  status: StatusCandidatura;
  agencia: string | null;
  parecer: string | null;
  outcome: string | null;
  submetida_em: string | null;
  dias_parado: number;
}

export interface Filtros {
  busca?: string;
  status?: StatusCandidatura | 'todos';
  agencia?: string | 'todas';
  idadeMin?: number;
  idadeMax?: number;
}

export interface ResumoFunil {
  status: StatusCandidatura;
  total: number;
  atrasados: number;
}

/** Sessão ativa? O painel inteiro depende disso — sem login a RLS devolve zero. */
export async function sessaoAtiva() {
  if (!temBanco || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function entrar(email: string, senha: string) {
  if (!temBanco || !supabase) return { ok: false as const, motivo: 'Banco não configurado.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  return error ? { ok: false as const, motivo: error.message } : { ok: true as const };
}

export async function sair() {
  await supabase?.auth.signOut();
}

/** Quem sou eu nesta organização — alimenta o cabeçalho e as permissões. */
export async function meuVinculo() {
  if (!temBanco || !supabase) return null;
  const { data } = await supabase
    .from('memberships')
    .select('role, organizations(nome, nome_ja, slug)')
    .eq('ativo', true)
    .limit(1)
    .maybeSingle();
  return data as { role: string; organizations: { nome: string; nome_ja: string | null; slug: string } } | null;
}

/**
 * Contagem por etapa do funil.
 *
 * `atrasados` usa o SLA da própria transição: candidato parado no mesmo estado
 * além do prazo previsto. É o alerta que o escopo pede — COE parado há mais de
 * 45 dias é o caso que dói na operação.
 */
export async function resumoFunil(): Promise<ResumoFunil[]> {
  if (!temBanco || !supabase) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('status, updated_at');
  if (error || !data) return [];

  const agora = Date.now();
  const mapa = new Map<StatusCandidatura, ResumoFunil>();
  for (const s of ORDEM_FUNIL) mapa.set(s, { status: s, total: 0, atrasados: 0 });

  for (const linha of data as { status: StatusCandidatura; updated_at: string }[]) {
    const atual = mapa.get(linha.status) ?? { status: linha.status, total: 0, atrasados: 0 };
    atual.total += 1;
    const sla = STATUS[linha.status]?.slaDias;
    if (sla) {
      const dias = (agora - new Date(linha.updated_at).getTime()) / 86_400_000;
      if (dias > sla) atual.atrasados += 1;
    }
    mapa.set(linha.status, atual);
  }
  return [...mapa.values()];
}

function idadeDe(nascimento: string | null): number | null {
  if (!nascimento) return null;
  const n = new Date(nascimento);
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
  return a;
}

/** Lista de candidatos com busca e filtros combináveis (critério C2). */
export async function listarCandidatos(f: Filtros = {}): Promise<LinhaCandidato[]> {
  if (!temBanco || !supabase) return [];

  let q = supabase
    .from('applications')
    .select(
      `id, status, submetida_em, updated_at,
       candidates!inner ( id, nome_completo, data_nascimento, cidade, estado, geracao, nivel_japones ),
       agencies ( nome ),
       screening_decisions ( outcome, reason_code, created_at )`,
    )
    .order('updated_at', { ascending: false })
    .limit(200);

  if (f.status && f.status !== 'todos') q = q.eq('status', f.status);
  if (f.busca?.trim()) {
    // ilike cobre acento parcialmente; a busca tolerante de verdade usa o
    // índice trigram e entra como RPC quando o volume justificar.
    q = q.ilike('candidates.nome_completo', `%${f.busca.trim()}%`);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  const agora = Date.now();
  return (data as unknown as Record<string, any>[])
    .map((r) => {
      const c = r.candidates;
      const pareceres = (r.screening_decisions ?? []) as { outcome: string; reason_code: string; created_at: string }[];
      const ultimo = pareceres.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
      return {
        id: c.id,
        application_id: r.id,
        nome_completo: c.nome_completo,
        idade: idadeDe(c.data_nascimento),
        cidade: c.cidade,
        estado: c.estado,
        geracao: c.geracao,
        nivel_japones: c.nivel_japones,
        status: r.status as StatusCandidatura,
        agencia: r.agencies?.nome ?? null,
        parecer: ultimo?.reason_code ?? null,
        outcome: ultimo?.outcome ?? null,
        submetida_em: r.submetida_em,
        dias_parado: Math.floor((agora - new Date(r.updated_at).getTime()) / 86_400_000),
      } as LinhaCandidato;
    })
    .filter((l) => {
      if (f.agencia && f.agencia !== 'todas' && l.agencia !== f.agencia) return false;
      if (f.idadeMin != null && (l.idade ?? 0) < f.idadeMin) return false;
      if (f.idadeMax != null && (l.idade ?? 999) > f.idadeMax) return false;
      return true;
    });
}

/** Só as transições que a organização permitiu — o dropdown vem do banco. */
export async function transicoesDe(status: StatusCandidatura): Promise<StatusCandidatura[]> {
  if (!temBanco || !supabase) return [];
  const { data } = await supabase.from('pipeline_transitions').select('para').eq('de', status);
  return ((data ?? []) as { para: StatusCandidatura }[]).map((t) => t.para);
}

/** Move o candidato no funil e registra o evento com autor e horário (C4). */
export async function moverStatus(
  applicationId: string,
  de: StatusCandidatura,
  para: StatusCandidatura,
  nota?: string,
) {
  if (!temBanco || !supabase) return { ok: false as const, motivo: 'Banco não configurado.' };

  const { error } = await supabase
    .from('applications')
    .update({ status: para, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (error) return { ok: false as const, motivo: error.message };

  const { data: sessao } = await supabase.auth.getUser();
  const { data: app } = await supabase
    .from('applications')
    .select('organization_id')
    .eq('id', applicationId)
    .single();

  await supabase.from('pipeline_events').insert({
    organization_id: app?.organization_id,
    application_id: applicationId,
    de_status: de,
    para_status: para,
    ator_id: sessao.user?.id ?? null,
    automatico: false,
    nota: nota ?? null,
  });

  return { ok: true as const };
}

export async function listarAgencias(): Promise<string[]> {
  if (!temBanco || !supabase) return [];
  const { data } = await supabase.from('agencies').select('nome').eq('ativo', true);
  return ((data ?? []) as { nome: string }[]).map((a) => a.nome);
}
