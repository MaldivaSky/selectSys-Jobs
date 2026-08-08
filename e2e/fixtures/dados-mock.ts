/* ═══════════════════════════════════════════════════════════════════════════
   DADOS FIXOS DA SUÍTE E2E
   ---------------------------------------------------------------------------
   Nenhum destes registros existe no Supabase real: eles alimentam o stub de
   rede (`supabase-stub.ts`). O teste E2E não pode depender do banco de
   produção — um candidato movido de etapa por alguém da agência não pode
   pintar a pipeline de vermelho, e a suíte precisa rodar em PR de fork, onde
   não há segredo de ambiente disponível.

   CPF abaixo é sintético e passa nos dígitos verificadores de `validarCpf`.
   ═════════════════════════════════════════════════════════════════════════ */

export const ORGANIZACAO = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'FUJIARTE',
  slug: 'fujiarte',
  logo_url: null as string | null,
  cor_primaria: '#294b86',
  plano: 'enterprise',
};

export const CANDIDATO = {
  id: '22222222-2222-4222-8222-222222222222',
  organization_id: ORGANIZACAO.id,
  nome_completo: 'MARINA TANAKA OLIVEIRA',
  email: 'marina.tanaka@exemplo.test',
  telefone: '(11) 98888-7766',
  cidade: 'Guarulhos',
  estado: 'SP',
  cpf: '529.982.247-25',
  geracao: 'sansei',
  altura_cm: 168,
  peso_kg: 61,
  cintura_cm: 74,
  pe_cm: 24,
  tem_tatuagem: false,
  data_nascimento: '1994-05-12',
};

/** Agora menos 3 dias: fora da janela de SLA atrasado (15 dias). */
const TRES_DIAS_ATRAS = new Date(Date.now() - 3 * 86_400_000).toISOString();

/**
 * Uma candidatura em `recebida` — a primeira etapa do funil, tanto no painel
 * da agência (coluna "Triagem") quanto no portal do candidato ("Ficha
 * recebida"). É esse registro que o botão de Excel exporta.
 *
 * O objeto carrega de uma vez os embeds que as duas telas pedem em `select`
 * diferentes. O PostgREST devolveria só o que foi pedido; chave sobrando é
 * inofensiva para o front e evita manter duas fixtures quase iguais.
 */
export const CANDIDATURA = {
  id: '33333333-3333-4333-8333-333333333333',
  organization_id: ORGANIZACAO.id,
  candidate_id: CANDIDATO.id,
  status: 'recebida',
  origem: 'Portal público',
  submetida_em: TRES_DIAS_ATRAS,
  created_at: TRES_DIAS_ATRAS,
  updated_at: TRES_DIAS_ATRAS,
  candidates: CANDIDATO,
  jobs: { titulo: 'Montagem de autopeças', provincia: 'Aichi-ken' },
  application_data: {
    data: {
      nomeCompleto: CANDIDATO.nome_completo,
      cpf: CANDIDATO.cpf,
      dataNascimento: CANDIDATO.data_nascimento,
      alturaCm: String(CANDIDATO.altura_cm),
      pesoKg: String(CANDIDATO.peso_kg),
      peCm: String(CANDIDATO.pe_cm),
      celular: CANDIDATO.telefone,
      cidade: CANDIDATO.cidade,
      estado: CANDIDATO.estado,
      geracaoNikkei: CANDIDATO.geracao,
      temTatuagem: 'nao',
    },
    rascunho: null,
  },
  pipeline_events: [{ para_status: 'recebida', created_at: TRES_DIAS_ATRAS }],
};

export const VAGA = {
  id: '44444444-4444-4444-8444-444444444444',
  organization_id: ORGANIZACAO.id,
  titulo: 'Montagem de autopeças',
  empresa_japonesa: 'Aichi Precision Co.',
  provincia: 'Aichi-ken',
  cidade: 'Toyota-shi',
  setor: 'Autopeças',
  salario_hora_jpy: 1320,
  vagas_total: 8,
  vagas_preenchidas: 2,
  publicada: true,
  requisitos: null,
  created_at: TRES_DIAS_ATRAS,
};

/** Recrutador da agência — vira a sessão injetada no `sessionStorage`. */
export const RECRUTADOR = {
  id: '55555555-5555-4555-8555-555555555555',
  email: 'recrutador@fujiarte.test',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { organization_id: ORGANIZACAO.id },
  created_at: TRES_DIAS_ATRAS,
  updated_at: TRES_DIAS_ATRAS,
};

/* ── FICHA DO CANDIDATO DE TESTE (fluxo B2C) ───────────────────────────────
   Dados de uma pessoa que não existe. O CPF é válido no algoritmo mas não
   corresponde a ninguém; a data de nascimento é fixa para a idade calculada
   não sair da faixa 18–75 conforme o tempo passa. */
export const FICHA_NOVA = {
  nomeCompleto: 'AKIRA SOUZA YAMAMOTO',
  dataNascimento: '1994-05-12',
  cpf: '529.982.247-25',
  alturaCm: '175',
  pesoKg: '72',
  cinturaCm: '85',
  peCm: '26.5',
  cep: '07064-020',
  celular: '(11) 99999-9999',
  logradouro: 'Rua Gabriel Vasconcelos, 265',
};

/** Resposta do ViaCEP para o CEP acima — o wizard consulta a API pública. */
export const VIACEP_RESPOSTA = {
  cep: '07064-020',
  logradouro: 'Rua Gabriel Vasconcelos',
  bairro: 'Vila Rosália',
  localidade: 'Guarulhos',
  uf: 'SP',
};
