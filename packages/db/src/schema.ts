import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  customType,
  bigserial,
  inet,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Custom type for citext
const citext = customType<{ data: string }>({
  dataType() {
    return 'citext';
  },
});

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'org_admin',
  'recrutador',
  'entrevistador',
  'agencia',
  'candidato',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'rascunho',
  'recebida',
  'verificacao_documentos',
  'aguardando_entrevista',
  'entrevista_realizada',
  'aprovado_entrevista',
  'curriculo_enviado_japao',
  'selecao_empresa_japonesa',
  'entrevista_empresa_japonesa',
  'aprovado_oferta',
  'preparacao_coe',
  'coe_andamento',
  'coe_emitido',
  'visto_andamento',
  'visto_emitido',
  'preparacao_viagem',
  'chegada_japao',
  'admissao_concluida',
  'reprovado',
  'desistente',
  'inativo',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'nao_solicitado',
  'solicitado',
  'enviado',
  'conferido',
  'rejeitado',
]);

export const screeningOutcomeEnum = pgEnum('screening_outcome', [
  'aprovar',
  'reprovar',
  'revisao_manual',
  'encerrar_fluxo',
]);

export const geracaoNikkeiEnum = pgEnum('geracao_nikkei', [
  'issei',
  'nissei',
  'sansei',
  'yonsei',
  'nao_descendente',
]);

export const turnoTrabalhoEnum = pgEnum('turno_trabalho', [
  'diurno',
  'noturno',
  'alternado',
]);

// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  nomeJa: text('nome_ja'),
  logoUrl: text('logo_url'),
  corPrimaria: text('cor_primaria').default('#294b86'),
  configFicha: jsonb('config_ficha').notNull().default({}),
  setores: text('setores').array().notNull().default(sql`ARRAY['Autopeças','Eletrônica','Alimentício','Metalurgia','Plásticos','Logística']::text[]`),
  locale: text('locale').notNull().default('pt-BR'),
  timezone: text('timezone').notNull().default('America/Sao_Paulo'),
  plano: text('plano').notNull().default('founder'),
  features: jsonb('features').notNull().default({}),
  retencaoMeses: integer('retencao_meses').notNull().default(24),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: citext('email').notNull().unique(),
  nome: text('nome').notNull(),
  senhaHash: text('senha_hash'),
  totpSecret: text('totp_secret'),
  locale: text('locale').notNull().default('pt-BR'),
  emailVerificadoEm: timestamp('email_verificado_em', { withTimezone: true }),
  ultimoAcesso: timestamp('ultimo_acesso', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
});

// Agencies
export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  codigo: text('codigo').notNull(),
  responsavel: text('responsavel'),
  email: citext('email'),
  telefone: text('telefone'),
  comissaoPct: numeric('comissao_pct', { precision: 5, scale: 2 }),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Memberships
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'set null' }),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
});

// Form Schemas
export const formSchemas = pgTable('form_schemas', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  definition: jsonb('definition').notNull(),
  publicadoEm: timestamp('publicado_em', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Rulesets
export const rulesets = pgTable('rulesets', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  rules: jsonb('rules').notNull(),
  justificativa: text('justificativa'),
  publicadoEm: timestamp('publicado_em', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Pipeline Transitions
export const pipelineTransitions = pgTable('pipeline_transitions', {
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  de: applicationStatusEnum('de').notNull(),
  para: applicationStatusEnum('para').notNull(),
  rolesPermitidos: userRoleEnum('roles_permitidos').array().notNull(),
  slaDias: integer('sla_dias'),
});

// Candidates
export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'set null' }),
  nomeCompleto: text('nome_completo').notNull(),
  dataNascimento: date('data_nascimento'),
  sexo: text('sexo'),
  estadoCivil: text('estado_civil'),
  nacionalidade: text('nacionalidade'),
  geracao: geracaoNikkeiEnum('geracao'),
  cpf: text('cpf'),
  rg: text('rg'),
  passaporte: text('passaporte'),
  passaporteValidade: date('passaporte_validade'),
  vistoValidade: date('visto_validade'),
  reentryValidade: date('reentry_validade'),
  kosekiValidade: date('koseki_validade'),
  email: citext('email'),
  telefone: text('telefone'),
  cidade: text('cidade'),
  estado: text('estado'),
  cep: text('cep'),
  alturaCm: integer('altura_cm'),
  pesoKg: numeric('peso_kg', { precision: 5, scale: 2 }),
  cinturaCm: integer('cintura_cm'),
  peCm: numeric('pe_cm', { precision: 4, scale: 1 }),
  nivelJapones: text('nivel_japones'),
  fotoKey: text('foto_key'),
  fotoData: date('foto_data'),
  jaEsteveJapao: boolean('ja_esteve_japao'),
  temTatuagem: boolean('tem_tatuagem'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ultimoContatoEm: timestamp('ultimo_contato_em', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
});

// Work History
export const workHistory = pgTable('work_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  pais: text('pais').notNull(),
  ordem: integer('ordem').notNull(),
  empresa: text('empresa'),
  empreiteira: text('empreiteira'),
  tipoServico: text('tipo_servico'),
  provinciaUf: text('provincia_uf'),
  cidade: text('cidade'),
  periodoInicio: date('periodo_inicio'),
  periodoFim: date('periodo_fim'),
  motivoSaida: text('motivo_saida'),
  tipoContrato: text('tipo_contrato'),
});

// Family Members
export const familyMembers = pgTable('family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  parentesco: text('parentesco').notNull(),
  nome: text('nome'),
  idade: integer('idade'),
  telefone: text('telefone'),
  contatoEmergenciaJapao: boolean('contato_emergencia_japao').notNull().default(false),
  provincia: text('provincia'),
});

// Consents
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(),
  textoVersao: text('texto_versao').notNull(),
  concedido: boolean('concedido').notNull(),
  ip: inet('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Jobs
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  titulo: text('titulo').notNull(),
  empresaJaponesa: text('empresa_japonesa'),
  provincia: text('provincia'),
  cidade: text('cidade'),
  setor: text('setor'),
  turnos: turnoTrabalhoEnum('turnos').array(),
  horasExtrasDia: integer('horas_extras_dia'),
  salarioHoraJpy: integer('salario_hora_jpy'),
  vagasTotal: integer('vagas_total').notNull().default(1),
  vagasPreenchidas: integer('vagas_preenchidas').notNull().default(0),
  requisitos: jsonb('requisitos').notNull().default({}),
  publicada: boolean('publicada').notNull().default(false),
  fechaEm: date('fecha_em'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Applications
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  formSchemaId: uuid('form_schema_id').notNull().references(() => formSchemas.id),
  status: applicationStatusEnum('status').notNull().default('rascunho'),
  origem: text('origem'),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'set null' }),
  entrevistadorId: uuid('entrevistador_id').references(() => users.id),
  promotor: text('promotor'),
  submetidaEm: timestamp('submetida_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
});

// Application Data
export const applicationData = pgTable('application_data', {
  applicationId: uuid('application_id').primaryKey().references(() => applications.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull().default({}),
  rascunho: jsonb('rascunho').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Screening Decisions
export const screeningDecisions = pgTable('screening_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  rulesetVersion: integer('ruleset_version').notNull(),
  facts: jsonb('facts').notNull(),
  firedRules: jsonb('fired_rules').notNull(),
  outcome: screeningOutcomeEnum('outcome').notNull(),
  reasonCode: text('reason_code'),
  revisadoPor: uuid('revisado_por').references(() => users.id),
  revisadoEm: timestamp('revisado_em', { withTimezone: true }),
  revisaoResultado: screeningOutcomeEnum('revisao_resultado'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
