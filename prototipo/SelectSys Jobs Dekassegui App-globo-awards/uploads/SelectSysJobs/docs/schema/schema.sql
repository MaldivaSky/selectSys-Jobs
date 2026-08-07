-- =============================================================================
-- SelectSys Jobs — Schema do núcleo (PostgreSQL 16)
-- Multi-tenant com Row Level Security + criptografia de dados sensíveis.
-- Referência de modelagem; a fonte da verdade será packages/db (Drizzle).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Contexto de tenant/usuário, definido pela aplicação a cada transação:
--   SET LOCAL app.current_org  = '<uuid>';
--   SET LOCAL app.current_user = '<uuid>';
--   SET LOCAL app.current_role = 'recrutador';
CREATE OR REPLACE FUNCTION app_current_org() RETURNS uuid
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_org', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_current_user() RETURNS uuid
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_user', true), '')::uuid $$;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'super_admin',    -- você (provedor do SaaS)
  'org_admin',      -- o cliente japonês
  'recrutador',
  'entrevistador',  -- único papel abaixo de org_admin com acesso a dados de saúde
  'agencia',
  'candidato'
);

CREATE TYPE application_status AS ENUM (
  'rascunho', 'recebida', 'verificacao_documentos', 'aguardando_entrevista',
  'entrevista_realizada', 'aprovado_entrevista', 'curriculo_enviado_japao',
  'selecao_empresa_japonesa', 'entrevista_empresa_japonesa', 'aprovado_oferta',
  'preparacao_coe', 'coe_andamento', 'coe_emitido',
  'visto_andamento', 'visto_emitido',
  'preparacao_viagem', 'chegada_japao', 'admissao_concluida',
  'reprovado', 'desistente', 'inativo'
);

CREATE TYPE document_status  AS ENUM ('nao_solicitado','solicitado','enviado','conferido','rejeitado');
CREATE TYPE screening_outcome AS ENUM ('aprovar','reprovar','revisao_manual','encerrar_fluxo');
CREATE TYPE geracao_nikkei   AS ENUM ('issei','nissei','sansei','yonsei','nao_descendente');
CREATE TYPE setor_fabril     AS ENUM ('eletronica','autopecas','alimenticio','outros');
CREATE TYPE turno_trabalho   AS ENUM ('diurno','noturno','alternado');

-- =============================================================================
-- TENANTS E ACESSO
-- =============================================================================

CREATE TABLE organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  nome         text NOT NULL,
  nome_ja      text,
  locale       text NOT NULL DEFAULT 'pt-BR',
  timezone     text NOT NULL DEFAULT 'America/Sao_Paulo',
  plano        text NOT NULL DEFAULT 'founder',
  features     jsonb NOT NULL DEFAULT '{}'::jsonb,  -- flags: perguntar_antecedentes, whatsapp, garoon...
  retencao_meses int NOT NULL DEFAULT 24,
  ativo        boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext NOT NULL UNIQUE,
  nome          text NOT NULL,
  senha_hash    text,                       -- nulo para candidatos (magic link)
  totp_secret   text,                       -- obrigatório para staff
  locale        text NOT NULL DEFAULT 'pt-BR',
  email_verificado_em timestamptz,
  ultimo_acesso timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            user_role NOT NULL,
  agency_id       uuid,                     -- preenchido quando role = 'agencia'
  ativo           boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE agencies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  codigo          text NOT NULL,            -- usado em /c/{codigo}
  responsavel     text,
  email           citext,
  telefone        text,
  comissao_pct    numeric(5,2),
  ativo           boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, codigo)
);

ALTER TABLE memberships
  ADD CONSTRAINT memberships_agency_fk FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL;

-- =============================================================================
-- CONFIGURAÇÃO VERSIONADA (formulário + regras)
-- =============================================================================

CREATE TABLE form_schemas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version         text NOT NULL,            -- ex.: '2024.06'  (rodapé da ficha FUJIARTE)
  definition      jsonb NOT NULL,           -- steps, fields, visible_when, export_map
  publicado_em    timestamptz,
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, version)
);

CREATE TABLE rulesets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version         int  NOT NULL,
  rules           jsonb NOT NULL,
  justificativa   text,                     -- por que a regra existe (defesa em auditoria)
  publicado_em    timestamptz,
  created_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, version)
);

-- Transições permitidas do funil, como dado (o cliente ajusta sem deploy)
CREATE TABLE pipeline_transitions (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  de              application_status NOT NULL,
  para            application_status NOT NULL,
  roles_permitidos user_role[] NOT NULL,
  sla_dias        int,                      -- alimenta alertas de atraso
  PRIMARY KEY (organization_id, de, para)
);

-- =============================================================================
-- CANDIDATOS
-- =============================================================================

CREATE TABLE candidates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  agency_id       uuid REFERENCES agencies(id) ON DELETE SET NULL,

  -- Campos normalizados: filtráveis, indexáveis, estáveis entre versões da ficha
  nome_completo   text NOT NULL,
  data_nascimento date,
  sexo            text,
  estado_civil    text,
  nacionalidade   text,
  geracao         geracao_nikkei,
  cpf             text,
  rg              text,
  passaporte      text,
  passaporte_validade date,
  visto_validade  date,
  reentry_validade date,
  koseki_validade date,

  email           citext,
  telefone        text,
  cidade          text,
  estado          text,
  cep             text,

  -- Bloco uniforme/EPI (altura, peso, cintura e pé existem na ficha para
  -- dimensionar uniforme e calçado de segurança da fábrica)
  altura_cm       int,
  peso_kg         numeric(5,2),
  cintura_cm      int,
  pe_cm           numeric(4,1),

  nivel_japones   text,
  foto_key        text,                     -- chave no R2
  foto_data       date,

  ja_esteve_japao boolean,
  tem_tatuagem    boolean,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  ultimo_contato_em timestamptz,            -- base do expurgo por retenção

  UNIQUE (organization_id, cpf)
);

-- Idade sempre derivada, nunca armazenada (a regra de 55 anos depende disso)
CREATE OR REPLACE FUNCTION candidate_idade(nasc date) RETURNS int
  LANGUAGE sql IMMUTABLE AS $$ SELECT extract(year from age(current_date, nasc))::int $$;

CREATE INDEX idx_candidates_org        ON candidates (organization_id);
CREATE INDEX idx_candidates_agency     ON candidates (organization_id, agency_id);
CREATE INDEX idx_candidates_nascimento ON candidates (organization_id, data_nascimento);
CREATE INDEX idx_candidates_nome_trgm  ON candidates USING gin (unaccent(nome_completo) gin_trgm_ops);

-- Histórico profissional 1:N (Japão e Brasil). A ficha limita a 4+2 por falta
-- de espaço físico na folha; o sistema não herda essa limitação — trunca só na exportação.
CREATE TABLE work_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id  uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  pais          text NOT NULL CHECK (pais IN ('JP','BR')),
  ordem         int  NOT NULL,              -- 0 = mais recente
  empresa       text,                       -- fábrica (JP) / empresa (BR)
  empreiteira   text,                       -- só JP
  tipo_servico  text,
  provincia_uf  text,
  cidade        text,
  periodo_inicio date,
  periodo_fim   date,
  motivo_saida  text,
  tipo_contrato text
);

CREATE TABLE family_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  parentesco   text NOT NULL,               -- pai, mae, conjuge, filho, irmao
  nome         text,
  idade        int,
  telefone     text,
  contato_emergencia_japao boolean NOT NULL DEFAULT false,
  provincia    text
);

-- -----------------------------------------------------------------------------
-- DADOS SENSÍVEIS DE SAÚDE — LGPD Art. 11
-- Tabela apartada, criptografada em nível de coluna, acesso auditado.
-- A chave NUNCA fica no banco: vem da aplicação (KMS/env) em cada chamada.
-- -----------------------------------------------------------------------------
CREATE TABLE candidate_health (
  candidate_id  uuid PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payload_enc   bytea NOT NULL,             -- AES-256-GCM: Q16–Q31 completas
  key_version   int NOT NULL DEFAULT 1,     -- permite rotação de chave
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  tipo            text NOT NULL,            -- 'geral_v1', 'saude_v1', 'comunicacao_v1'
  texto_versao    text NOT NULL,
  concedido       boolean NOT NULL,
  ip              inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- CANDIDATURAS E FUNIL
-- =============================================================================

CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  titulo          text NOT NULL,
  empresa_japonesa text,
  provincia       text,
  cidade          text,
  setor           setor_fabril,
  turnos          turno_trabalho[],
  horas_extras_dia int,
  salario_hora_jpy int,
  vagas_total     int NOT NULL DEFAULT 1,
  vagas_preenchidas int NOT NULL DEFAULT 0,
  requisitos      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- hard constraints + pesos do matching
  publicada       boolean NOT NULL DEFAULT false,
  fecha_em        date,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id          uuid REFERENCES jobs(id) ON DELETE SET NULL,   -- nulo = cadastro em banco de talentos
  form_schema_id  uuid NOT NULL REFERENCES form_schemas(id),
  status          application_status NOT NULL DEFAULT 'rascunho',
  origem          text,                     -- 'agencia' | 'direta' | 'indicacao'
  agency_id       uuid REFERENCES agencies(id) ON DELETE SET NULL,
  entrevistador_id uuid REFERENCES users(id),
  promotor        text,
  submetida_em    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_funil ON applications (organization_id, status, updated_at DESC);

-- Respostas do formulário: a cauda longa (enquete, Q1–Q32) validada pelo schema versionado
CREATE TABLE application_data (
  application_id uuid PRIMARY KEY REFERENCES applications(id) ON DELETE CASCADE,
  data           jsonb NOT NULL DEFAULT '{}'::jsonb,
  rascunho       jsonb NOT NULL DEFAULT '{}'::jsonb,   -- autosave a cada 3s
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_data_gin ON application_data USING gin (data jsonb_path_ops);

-- Toda decisão de triagem fica registrada com os fatos de entrada e a versão da regra.
-- É o que responde "por que foi reprovado?" e atende ao Art. 20 da LGPD.
CREATE TABLE screening_decisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  application_id  uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  ruleset_version int NOT NULL,
  facts           jsonb NOT NULL,           -- snapshot das entradas
  fired_rules     jsonb NOT NULL,           -- regras que dispararam
  outcome         screening_outcome NOT NULL,
  reason_code     text,
  revisado_por    uuid REFERENCES users(id),   -- revisão humana (LGPD Art. 20)
  revisado_em     timestamptz,
  revisao_resultado screening_outcome,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE match_scores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id         uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  score          int  NOT NULL CHECK (score BETWEEN 0 AND 100),
  hard_fail      text,                      -- motivo da eliminação, se houver
  breakdown      jsonb NOT NULL,            -- critério → pontos → explicação
  sugestoes      jsonb,                     -- "para chegar a 90+..." (produto premium)
  calculado_em   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);

CREATE TABLE pipeline_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  de_status      application_status,
  para_status    application_status NOT NULL,
  ator_id        uuid REFERENCES users(id),
  automatico     boolean NOT NULL DEFAULT false,
  nota           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pipeline_events_app ON pipeline_events (application_id, created_at DESC);

-- =============================================================================
-- DOCUMENTOS
-- =============================================================================

CREATE TABLE documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  tipo            text NOT NULL,            -- 'foto','passaporte','rg','carteira_residente','koseki','foto_tatuagem','coe','visto'
  status          document_status NOT NULL DEFAULT 'nao_solicitado',
  storage_key     text,                     -- chave no R2
  mime_type       text,
  tamanho_bytes   bigint,
  sensivel        boolean NOT NULL DEFAULT false,   -- fotos de tatuagem, documentos médicos
  metadados       jsonb DEFAULT '{}'::jsonb,        -- ex.: {"regiao_corpo":"braco_esquerdo"}, OCR extraído
  solicitado_em   timestamptz,
  solicitado_por  uuid REFERENCES users(id),
  enviado_em      timestamptz,
  conferido_em    timestamptz,
  conferido_por   uuid REFERENCES users(id),
  motivo_rejeicao text,
  expira_em       date,                     -- validade do documento → alimenta alertas
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_pendentes ON documents (organization_id, status)
  WHERE status IN ('solicitado','enviado');

-- Links públicos expiráveis para upload (o fluxo de foto de tatuagem via WhatsApp)
CREATE TABLE upload_links (
  token           text PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_ids    uuid[] NOT NULL,
  expira_em       timestamptz NOT NULL,
  usado_em        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- COMUNICAÇÃO
-- =============================================================================

CREATE TABLE message_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  chave           text NOT NULL,
  canal           text NOT NULL CHECK (canal IN ('whatsapp','email','sms')),
  meta_template_name text,                  -- nome homologado na Meta
  corpo           jsonb NOT NULL,           -- por locale
  ativo           boolean NOT NULL DEFAULT true,
  UNIQUE (organization_id, chave, canal)
);

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id    uuid REFERENCES candidates(id) ON DELETE CASCADE,
  canal           text NOT NULL,
  direcao         text NOT NULL CHECK (direcao IN ('saida','entrada')),
  template_id     uuid REFERENCES message_templates(id),
  corpo           text,
  provider_id     text,                     -- id da Meta/Resend
  status          text,                     -- enfileirada, enviada, entregue, lida, falhou
  respondida      boolean NOT NULL DEFAULT false,
  custo_centavos  int,                      -- para o repasse de custo variável
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_nao_respondidos ON messages (organization_id, candidate_id, created_at DESC)
  WHERE direcao = 'saida' AND respondida = false;

-- =============================================================================
-- AUDITORIA E FATURAMENTO
-- =============================================================================

-- Toda leitura de dado sensível e toda ação relevante ficam aqui. Append-only.
CREATE TABLE audit_log (
  id              bigserial PRIMARY KEY,
  organization_id uuid,
  actor_id        uuid,
  acao            text NOT NULL,            -- 'health.read', 'candidate.export', 'ruleset.publish'
  entidade        text,
  entidade_id     uuid,
  detalhes        jsonb,
  ip              inet,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org_data ON audit_log (organization_id, created_at DESC);

CREATE TABLE subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plano           text NOT NULL,
  valor_centavos  int NOT NULL,
  moeda           text NOT NULL DEFAULT 'BRL',
  provider        text,                     -- 'asaas' | 'stripe'
  provider_sub_id text,
  status          text NOT NULL,
  preco_congelado_ate date,                 -- cláusula do plano Fundador
  proxima_cobranca date
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Isolamento garantido no banco, não na aplicação: um bug de query
-- não vaza dados entre clientes.
-- =============================================================================

ALTER TABLE candidates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_health    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents            ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON candidates
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON applications
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON documents
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON agencies
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON jobs
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON screening_decisions
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON match_scores
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON pipeline_events
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON messages
  USING (organization_id = app_current_org());

CREATE POLICY tenant_isolation ON consents
  USING (organization_id = app_current_org());

-- Saúde: tenant correto E papel autorizado. Dupla barreira.
CREATE POLICY health_restrita ON candidate_health
  USING (
    organization_id = app_current_org()
    AND current_setting('app.current_role', true) IN ('super_admin','org_admin','entrevistador')
  );

-- Agência só enxerga os próprios candidatos.
CREATE POLICY agencia_escopo ON candidates
  FOR SELECT USING (
    organization_id = app_current_org()
    AND (
      current_setting('app.current_role', true) <> 'agencia'
      OR agency_id = (
        SELECT m.agency_id FROM memberships m
        WHERE m.user_id = app_current_user()
          AND m.organization_id = app_current_org()
      )
    )
  );

-- =============================================================================
-- RETENÇÃO — expurgo automático (agendado via pg-boss)
-- =============================================================================

CREATE OR REPLACE FUNCTION expurgar_candidatos_expirados() RETURNS int
LANGUAGE plpgsql AS $$
DECLARE removidos int;
BEGIN
  WITH alvos AS (
    SELECT c.id
    FROM candidates c
    JOIN organizations o ON o.id = c.organization_id
    WHERE coalesce(c.ultimo_contato_em, c.created_at)
          < now() - (o.retencao_meses || ' months')::interval
  ), del AS (
    DELETE FROM candidates WHERE id IN (SELECT id FROM alvos) RETURNING 1
  )
  SELECT count(*) INTO removidos FROM del;

  INSERT INTO audit_log (acao, detalhes)
  VALUES ('retencao.expurgo', jsonb_build_object('removidos', removidos));

  RETURN removidos;
END $$;
