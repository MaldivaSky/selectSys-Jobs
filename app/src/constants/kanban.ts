/* ═══════════════════════════════════════════════════════════════════════════
   ETAPAS DO FUNIL — DADO, NÃO COMPONENTE
   ---------------------------------------------------------------------------
   Fora de `KanbanBoard.tsx` porque constante exportada ao lado de componente
   quebra o Fast Refresh do Vite (`react(only-export-components)`, erro na CI).

   Nota de arquitetura, para quem for ligar este componente: esta lista é um
   enum chumbado no código, enquanto o funil de verdade é configuração do
   tenant. `TenantDashboard` já mantém a própria `ETAPAS`, com outros rótulos.
   Unificar as duas — e mover a taxonomia para o banco, por organização — é
   trabalho pendente, não um detalhe de estilo.
   ═════════════════════════════════════════════════════════════════════════ */

export const ETAPAS_KANBAN = [
  { id: 'recebida', label: '1. Triagem', cor: '#3b82f6' },
  { id: 'verificacao_documentos', label: '2. Documentos', cor: '#06b6d4' },
  { id: 'aguardando_entrevista', label: '3. Entrevista BR', cor: '#8b5cf6' },
  { id: 'aprovado_entrevista', label: '4. Aprovado BR', cor: '#10b981' },
  { id: 'selecao_empresa_japonesa', label: '5. Seleção Japão', cor: '#f59e0b' },
  { id: 'aprovado_oferta', label: '6. Oferta Aceita', cor: '#ec4899' },
  { id: 'coe_andamento', label: '7. COE Imigração', cor: '#6366f1' },
  { id: 'visto_andamento', label: '8. Visto Emitido', cor: '#14b8a6' },
  { id: 'preparacao_viagem', label: '9. Preparo Viagem', cor: '#ef4444' },
] as const;
