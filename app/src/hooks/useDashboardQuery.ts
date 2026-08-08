/* ═══════════════════════════════════════════════════════════════════════════
   USE DASHBOARD QUERY — TANSTACK QUERY V5 (TIER 3)
   ---------------------------------------------------------------------------
   Hook customizado para gerenciamento de estado server-side do Painel B2B:
   1. `useDashboardData`: `useQuery` com cache inteligente de 5min, deduplicação
      e stale-while-revalidate.
   2. `useMoverStatusMutation`: `useMutation` com OPTIMISTIC UPDATES no funil.
      A UI do Kanban move o card instantaneamente (0ms). Se o Supabase falhar,
      realiza o rollback automático do estado visual e dispara o toast de erro.
   ═════════════════════════════════════════════════════════════════════════ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../dados/supabase';

export interface CandidatoLinha {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado?: string;
  vagaDesejada: string;
  status: string;
  submetidoEm: string;
  origem: string;
  updated_at?: string;
  candidates?: any;
  dadosFicha?: Record<string, any>;
}

export interface VagaLinha {
  id: string;
  titulo: string;
  empresa_japonesa?: string;
  provincia?: string;
  cidade?: string;
  setor?: string;
  salario_hora_jpy?: number;
  vagas_total: number;
  vagas_preenchidas: number;
  publicada: boolean;
  createdAt?: string;
}

export interface DashboardCacheData {
  candidaturas: CandidatoLinha[];
  vagas: VagaLinha[];
  tenant: { id: string; nome: string; slug: string; logoUrl?: string; plano: string } | null;
}

/**
 * Fetcher para carregar dados do Dashboard com deduplicação de requisições.
 */
async function fetchDashboardData(tenantIdOrSlug: string): Promise<DashboardCacheData> {
  if (!supabase) {
    return { candidaturas: [], vagas: [], tenant: null };
  }

  // 1. Obter Organização por id ou slug
  let tenantQuery = supabase.from('organizations').select('id, nome, slug, logo_url, plano');
  if (tenantIdOrSlug.includes('-') && tenantIdOrSlug.length === 36) {
    tenantQuery = tenantQuery.eq('id', tenantIdOrSlug);
  } else {
    tenantQuery = tenantQuery.eq('slug', tenantIdOrSlug);
  }

  const { data: orgData } = await tenantQuery.single();
  const tenantObj = orgData
    ? { id: orgData.id, nome: orgData.nome, slug: orgData.slug, logoUrl: orgData.logo_url, plano: orgData.plano }
    : null;

  const orgId = orgData?.id;

  // 2. Buscar Vagas do Tenant
  let vagasResult: VagaLinha[] = [];
  if (orgId) {
    const { data: vData } = await supabase
      .from('jobs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    vagasResult = (vData ?? []).map((v: any) => ({
      id: v.id,
      titulo: v.titulo,
      empresa_japonesa: v.empresa_japonesa,
      provincia: v.provincia,
      cidade: v.cidade,
      setor: v.setor,
      salario_hora_jpy: v.salario_hora_jpy,
      vagas_total: v.vagas_total ?? 1,
      vagas_preenchidas: v.vagas_preenchidas ?? 0,
      publicada: v.publicada ?? true,
      createdAt: v.created_at,
    }));
  }

  // 3. Buscar Candidaturas do Tenant
  let candidaturasResult: CandidatoLinha[] = [];
  if (orgId) {
    const { data: appData } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        origem,
        submetida_em,
        created_at,
        updated_at,
        candidates (
          id,
          nome_completo,
          email,
          telefone,
          cidade,
          estado,
          cpf,
          geracao,
          altura_cm,
          peso_kg,
          tem_tatuagem
        ),
        jobs (
          titulo,
          provincia
        ),
        application_data (
          data,
          rascunho
        )
      `)
      .eq('organization_id', orgId)
      .order('updated_at', { ascending: false });

    candidaturasResult = (appData ?? []).map((app: any) => {
      const cand = app.candidates;
      const job = app.jobs;
      const dataPayload = app.application_data;

      return {
        id: app.id,
        nome: cand?.nome_completo || 'Sem Nome',
        email: cand?.email || 'N/A',
        telefone: cand?.telefone || 'N/A',
        cidade: cand?.cidade ? `${cand.cidade}/${cand.estado || ''}` : 'N/A',
        estado: cand?.estado,
        vagaDesejada: job ? `${job.titulo} (${job.provincia || 'JP'})` : 'Banco de Talentos',
        status: app.status,
        submetidoEm: app.submetida_em || app.created_at,
        updated_at: app.updated_at,
        candidates: cand,
        dadosFicha: dataPayload?.data || dataPayload?.rascunho || {},
        origem: app.origem || 'Direto',
      };
    });
  }

  return {
    candidaturas: candidaturasResult,
    vagas: vagasResult,
    tenant: tenantObj,
  };
}

/**
 * Hook `useQuery` com cache de 5 minutos (staleTime) e stale-while-revalidate.
 */
export function useDashboardData(tenantIdOrSlug: string) {
  return useQuery<DashboardCacheData>({
    queryKey: ['dashboard', tenantIdOrSlug],
    queryFn: () => fetchDashboardData(tenantIdOrSlug),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    gcTime: 1000 * 60 * 30, // 30 minutos em memória
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook `useMutation` com OPTIMISTIC UPDATES para transição de candidato no funil.
 */
export function useMoverStatusMutation(
  tenantIdOrSlug: string,
  onErroCallback?: (mensagem: string) => void
) {
  const queryClient = useQueryClient();
  const queryKey = ['dashboard', tenantIdOrSlug];

  return useMutation({
    mutationFn: async ({ applicationId, novoStatus }: { applicationId: string; novoStatus: string }) => {
      if (!supabase) throw new Error('Supabase indisponível');

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('id, status')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'Falha ao atualizar status');
      }

      return data;
    },

    // 1. OPTIMISTIC UPDATE: Atualiza a UI no instante do clique (0ms)
    onMutate: async ({ applicationId, novoStatus }) => {
      // Cancela refetches em andamento para evitar sobrescrever o estado otimista
      await queryClient.cancelQueries({ queryKey });

      // Salva o snapshot dos dados anteriores para rollback se falhar
      const previousData = queryClient.getQueryData<DashboardCacheData>(queryKey);

      // Atualiza otimisticamente o cache do TanStack Query
      if (previousData) {
        queryClient.setQueryData<DashboardCacheData>(queryKey, {
          ...previousData,
          candidaturas: previousData.candidaturas.map((c) =>
            c.id === applicationId ? { ...c, status: novoStatus, updated_at: new Date().toISOString() } : c
          ),
        });
      }

      return { previousData };
    },

    // 2. ROLLBACK AUTOMÁTICO EM CASO DE ERRO
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData<DashboardCacheData>(queryKey, context.previousData);
      }
      if (onErroCallback) {
        onErroCallback(`Não foi possível mover o candidato: ${err.message}`);
      }
    },

    // 3. RESSINCRONIZAÇÃO EM BACKGROUND
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
