# PLANO MASTER SENIORES - SelectSys Jobs
## Versão 1.0 - 06/08/2026
### CTO Responsável: RAFAEL MALDIVAS
### Metodologia: Validação Semanal com Cliente Toda Segunda-feira

---

## EXECUTIVE SUMMARY
Este plano detalha a implementação de duas melhorias críticas solicitadas:
1. **Pré-preenchimento de formulário via importação de currículo** (utilizando IA existente)
2. **Dashboard de métricas e indicadores operacionais**

Ambas as iniciativas são construídas sobre a arquitetura existente (docs/02-arquitetura-e-stack.md) e seguem os princípios de:
- **Configuração > Código** (zero hardcoding de regras)
- **Decisões auditáveis** (conformidade LGPD Art. 20)
- **IA na periferia, nunca no veredito**
- **Multi-tenancy desde o dia 1**

O plano está estruturado para **validação client-facing toda segunda-feira**, com entregáveis verificáveis e marcos de segurança explícitos.

---

## FASE 0: PREPARAÇÃO E ALINHAMENTO (SEMANA 1)
**Objetivo:** Estabelecer baseline técnica e acordar métricas de sucesso com cliente
**Entregável para validação na Segunda-feira (10/08):**
- [ ] Documento de escopo técnico assinado para ambas as features
- [ ] Métricas de sucesso definidas (ex: redução de tempo de preenchimento, taxa de conclusão do formulário)
- [ ] Checklist de segurança revisado com foco em LGPD para dados de currículo
- [ ] Revisão da arquitetura de IA existente (packages/ai/) para confirmação de capacidades

**Atividades da Semana:**
- Segunda (10/08): Reunião de kickoff - alinhar expectativas e definir Definition of Done
- Terça-Quarta: Auditoría técnica do módulo de IA existente (extração de histórico, OCR)
- Quinta: Definir schema de dados para currículos importados (mapeamento para form_schemas)
- Sexta: Preparar apresentação de riscos e mitigações para validação de segunda

**Validação de Segunda-feira (10/08):**
> "Cliente confirma escopo, métricas de sucesso e aprova checklist de segurança inicial"

---

## FASE 1: PRÉ-PREENCHIMENTO DE CURRÍCULO (SEMANAS 2-4)
**Objetivo:** Implementar importação segura de currículo com validação contra schema de formulário versionado
**Base Técnica:** 
- Reutiliza módulo `packages/ai/` existente (Claude para extração estruturada)
- Integra com `packages/core/forms/` (renderer dirigido por schema)
- Utiliza tabela `application_data` (JSONB versionado) para armazenamento
- **NÃO** grava diretamente em campos sensíveis - passa por validação e consentimento

**Entregáveis Semanais para Validação de Segunda-feira:**

**Semana 2 (Entregável 19/08):**
- [ ] API endpoint `/api/candidate/resume-import` (POST, aceita PDF/DOCX)
- [ ] Serviço de extração usando Claude Vision + Text (prompt engineering específico para currículos dekassegui)
- [ ] Mapeamento inicial de campos: nome, data_nascimento, experiencia_japao, experiencia_brasil, habilidades
- [ ] **Checkpoint de Segurança:** Nenhum dado de currículo é salvo sem passar por validação do Zod gerado pelo schema
- [ ] Testes unitários cobrindo 80% dos casos de extração

**Semana 3 (Entregável 26/08):**
- [ ] Integração com formulário: botão "Importar Currículo" na etapa de identificação
- [ ] Visualização de campos pré-preenchidos com opção de edição antes de salvar
- [ ] Log de auditoria completo: quem importou, quando, hash do arquivo, campos modificados pós-importação
- [ ] **Checkpoint de Segurança:** Validação de MIME real (magic bytes), limite de 5MB, varredura básica de vírus (ClamAV em worker)
- [ ] Teste de carga: 10 importações simultâneas sem degradação de performance

**Semana 4 (Entregável 02/09):**
- [ ] Suporte a currículos em português e japonês (detecção automática de idioma)
- [ ] Mapeamento configurável por organização (via admin: quais campos do currículo vão para quais campos do formulário)
- [ ] Relatórios de qualidade: % de campos pré-preenchidos corretamente por fonte de currículo
- [ ] **Checkpoint de Segurança:** Revisão de consentimento - importação não substitui consentimento explícito para dados sensíveis (Bloco B permanece em branco até preenchimento manual)
- [ ] Documento de uso para candidatos (guia de como importar currículo)

**Validação de Segunda-feira a Cada Semana:**
> Cliente testa em ambiente de staging com currículos reais e confirma:
> - Precisão de extração (>85% de campos corretos para currículos padrão)
> - Experiência de edição pós-importação intuitiva
> - Nenhum dado sensível é pré-preenchido sem intervenção explícita
> - Logs de auditoria estão completos e acessíveis

**Benefícios Quantificados (Baseado em Doc 01):**
- **Redução de 60-70% no tempo de preenchimento inicial** (passando de ~25 min para 7-10 min)
- **Aumento estimado de 25% na taxa de conclusão do formulário** (reduz abbandono em etapas iniciais)
- **Melhoria na qualidade dos dados** (elimina erros de digitação em campos críticos como datas e números de documento)
- **Diferencial competitivo claro** vs ATS genéricos (nenhum oferece importação inteligente para formato dekassegui específico)

**Impacto no Custo e Tempo:**
- **Custo Variável:** +R$ 8/mês por 100 currículos importados (uso adicional de Claude API - já contratado no plano base)
- **Custo Fixo:** Zero (reutiliza infra de IA existente)
- **Tempo de Entrega:** 3 sprints (6 semanas) - **não atrasa o MVP** pois é construção sobre módulo existente
- **Risco:** Baixo (reutiliza 90% do código de extração já planejado para histórico em texto livre)

---

## FASE 2: DASHBOARD DE MÉTRICAS E INDICADORES (SEMANAS 5-8)
**Objetivo:** Fornecer visibilidade operacional e executiva baseada nos eventos de pipeline já existentes
**Base Técnica:**
- Aproveita tabela `pipeline_events` (já implementada para máquina de estados)
- Utiliza `screening_decisions` e `match_scores` para métricas de qualidade
- Construído com TanStack Table + TanStack Query (já no stack - doc 02, linha 26)
- **NÃO** requer novo banco de dados ou infraestrutura adicional

**Entregáveis Semanais para Validação de Segunda-feira:**

**Semana 5 (Entregável 07/09):**
- [ ] Visão geral do funil: contagem por estado (rascunho → admissão_concluida)
- [ ] Taxa de conversão entre etapas críticas (ex: entrevista → aprovado_entrevista)
- [ ] Tempo médio por etapa (com destaque para gargalos > SLA)
- [ ] **Checkpoint de Segurança:** Dados agregados nunca expõem PII sensível; acesso restrito a papéis `analista` e acima via RLS
- [ ] Filtros por organização, agência indicadora, mês de candidatura

**Semana 6 (Entregável 14/09):**
- [ ] Dashboard de triagem: % de aprovados/reprovados por motivo (reason_code do screening_decisions)
- [ ] Eficácia das regras de triagem (ex: quantos candidatos reprovados por idade_maxima tinham trabalhou_mesma_empresa=true)
- [ ] Métricas de matching: score médio por vaga, distribuição de acertos/erros nas predições de compatibilidade
- [ ] **Checkpoint de Segurança:** Nenhum dado de saúde sensível (Bloco B) aparece em nenhum relatório
- [ ] Exportação de relatórios em CSV/PDF (via @react-pdf/renderer existente)

**Semana 7 (Entregável 21/09):**
- [ ] Dashboard de agências indicadoras: desempenho por agência (quantos candidatos enviaram, taxa de aprovação na entrevista)
- [ ] Alertas automáticos: etapas com SLA violado (ex: vistos pendentes > 15 dias)
- [ ] Integração com sistema de notificações existente (pg-boss + WhatsApp/email)
- [ ] **Checkpoint de Segurança:** Logs de acesso ao dashboard registrados em audit_log (quem visualizou quais métricas)

**Semana 8 (Entregável 28/09):**
- [ ] Visão executiva: Custo por contratação bem-sucedida (estimado baseado em variáveis de WhatsApp/IA)
- [ ] Predictive indicator: probabilidade de sucesso baseado em histórico de matching e triagem
- [ ] Configuração de metas por organização (ex: meta de 80% de aprovados na entrevista)
- [ ] **Checkpoint de Segurança:** Revisão final de exposição de dados - zero campos de `candidate_health` ou `consents` em qualquer visualização
- [ ] Documento de interpretação de métricas para não-técnicos

**Validação de Segunda-feira a Cada Semana:**
> Cliente confirma em ambiente de staging:
> - Métricas estão alinhadas com suas perguntas de negócio (doc 01, linhas 155-165)
> - Dados são atualizados em near real-time (máximo 5min de atraso)
> - Interface é responsiva e mobile-first (80% dos gestores acessam via celular)
> - Nenhuma métrica revela informações sensíveis indevidamente
> - Alertas são acionáveis e não geram falsos positivos

**Benefícios Quantificados:**
- **Redução de 50% no tempo de análise gerencial** (elimina planilhas manuais de acompanhamento)
- **Detecção precoce de problemas** (ex: aumento súbito de reprovações por motivo específico)
- **Base para negociação com parceiro japonês** (dados objetivos sobre desempenho do pipeline)
- **Fundamento para cobrança de premium** (métricas de matching podem ser vendidas como serviço)

**Impacto no Custo e Tempo:**
- **Custo Variável:** Zero (reutiliza eventos já existentes)
- **Custo Fixo:** Zero (usa componentes frontend/backend já no stack)
- **Tempo de Entrega:** 4 sprints (8 semanas) - **entrega após o MVP core**, mas antes do lançamento comercial
- **Risco:** Muito baixo (construção sobre tabelas e eventos já implementados)

---

## FASE 3: INTEGRAÇÃO, SEGURANÇA E VALIDAÇÃO FINAL (SEMANAS 9-10)
**Objetivo:** Garantir robustez, segurança e readiness para lançamento comercial
**Entregáveis para Validação de Segunda-feira:**

**Semana 9 (Entregável 05/10):**
- [ ] Teste de penetração focado nas novas features (importação de currículo e dashboard)
- [ ] Revisão de logs de auditoria para garantir rastreabilidade completa de acesso a dados de currículo importado
- [ ] Teste de recuperação de desastre (backup/restore do R2 + Postgres)
- [ ] Validação de conformidade LGPD: direito à portabilidade e exclusão funcionando para dados de currículo
- [ ] **Checkpoint de Segurança:** Aprovação final do oficial de privacidade (simulado ou real)

**Semana 10 (Entregável 12/10):**
- [ ] Documento de lançamento técnico completo
- [ ] Plano de treinamento para equipe do cliente (vídeos + manuais)
- [ ] Métricas de baseline estabelecidas (para comparar pós-lançamento)
- [ ] Reunião de pré-go-live com todas as partes interessadas
- [ ] **Checkpoint de Segurança:** Certificado de que zero vulnerabilidades críticas ou altas existem no escopo das novas features

**Validação de Segunda-feira (12/10):**
> Cliente assina o Termo de Aceitação Técnica confirmando:
> - Todas as features funcionam conforme especificado
> - Checklist de segurança está 100% atendido
> - Produto está pronto para uso comercial com seus dados reais
> - Treinamento da equipe está agendado

---

## CRONOGRAMA RESUMENTE (VISÃO GANTT)
```
Semana:    1    2    3    4    5    6    7    8    9    10
Prep/Align [===]
Import CV  [===========]
Dashboard       [===============]
Segurança              [=====]
Lançamento                   [===]
```
**Marcos de Validação (Toda Segunda-feira):**
- 10/08: Escopo e métricas aprovadas
- 17/08: API de importação básica funcionando
- 24/08: Importação com edição e validação funcionando
- 31/08: Importação completa com relatórios de qualidade
- 07/09: Dashboard de funil operacional
- 14/09: Dashboard de triagem e matching
- 21/09: Dashboard de agências e alertas
- 28/09: Dashboard executivo e configurável
- 05/10: Segurança validada com testes de penetração
- 12/10: Produto aprovado para lançamento

---

## GARANTIAS DE SEGURANÇA E ROBUSTEZ
Este plano incorpora as lições aprendidas na análise inicial (doc 01, seção 4) e segue estes princípios não-negociáveis:

1. **Dados Sensíveis são Sagrados**
   - Nenhum campo de `candidate_health` (Bloco B do formulário) é pré-preenchido por importação de currículo
   - Importação de currículo só preenche campos não-sensíveis (identificação, experiência,etc.)
   - Consentimento explícito permanece obrigatório para qualquer uso de dados de saúde

2. **Auditoria Total**
   - Toda importação de currículo gera evento em `audit_log` com:
     - Hash do arquivo original
     - Quem importou (user_id + IP + user-agent)
     - Timestamp preciso
     - Lista de campos mapeados e valores extraídos
     - Diferença entre dados importados e dados finais após edição do candidato

3. **Validação em Camadas**
   - Cliente-side: validação Zod em tempo real
   - Server-side: validação Zod + regras de negócio do schema
   - Banco de dados: constraints de NOT NULL e tipos corretos
   - Camada de aplicação: verificação de que nenhum dado sensível foi injetado indevidamente

4. **Limites de Uso Claros**
   - Importação de currículo: máximo 5MB, apenas PDF/DOCX
   - Taxa de chamada à API de IA: limitado por organização para evitar abuso de custos
   - Dashboard: rate limiting por usuário + organização

5. **Testabilidade Comprovada**
   - 90%+ de cobertura de testes unitários no core de importação
   - Testes de propriedade (fast-check) garantindo que nenhum estado inválido é atingido
   - Teste de integração com Postgres Testcontainers validando RLS entre organizações
   - Teste E2E com Playwright cobrindo fluxo completo de importação → edição → submissão

---

## COMPROMISSOS DE ENTREGA
Como seu CTO/branco direito, me comprometo a:

1. **Transparência Radical:** Toda segunda-feira você receberá um relatório de progresso com:
   - O que foi entregue naquela semana
   - O que será entregue na próxima semana
   - Bloqueadores (se houver) com plano de mitigação
   - Métricas de qualidade (cobertura de testes, desempenho, etc.)

2. **Zero Surpresas Negativas:** Se houver risco de atraso ou problema de segurança, você será informado **imediatamente** - não esperar até a reunião de segunda.

3. **Qualidade sobre Velocidade:** Prefiro entregar uma feature 100% segura e testada na data prometida do que entregar algo frágil antes do prazo.

4. **Alinhamento com sua Metodologia:** Todas as entregas serão estruturadas para sua validação de segunda-feira, com ambientes de staging idênticos à produção para teste realista.

5. **Foco no Valor para o Cliente:** Cada feature será medida pelo impacto real nas métricas de negócio que você definiu na Fase 0.

---

## PRÓXIMO PASSO IMEDIATO
Para iniciar o Plano Master Sênior na próxima segunda-feira (12/08), preciso que você:
1. Confirme este documento como base de trabalho
2. Indique os stakeholders-chave que participarão das validações de segunda-feira
3. Forneça acesso ao ambiente de staging (se já existir) ou confirme que podemos usar o ambiente de desenvolvimento inicial
4. Defina o horário fixo das validações de segunda-feira (sugiro 10h horário de Brasília para overlap com sua agenda)

Estou pronto para começar a trabalhar assim que você der o sinal. Este plano não é apenas uma lista de tarefas - é um compromisso de entregar um produto que seja **profissional, seguro e verdadeiramente robusto**, exatamente como você pediu.

**Vamos construir algo que o seu cliente japonês vai querer copiar.** - Rafael Maldivas
CTO, SelectSys Jobs
06/08/2026

-- 

# MASTER SENIOR PLAN - SelectSys Jobs
## Version 1.0 - 08/06/2026
### CTO Responsible: RAFAEL MALDIVAS
### Methodology: Weekly Client Validation Every Monday

---

## EXECUTIVE SUMMARY
This plan details the implementation of two critical requested improvements:
1. **Form pre-filling via resume import** (using existing AI)
2. **Operational metrics and indicators dashboard**

Both initiatives are built upon the existing architecture (docs/02-arquitetura-e-stack.md) and follow these principles:
- **Configuration > Code** (zero hardcoding of rules)
- **Auditability** (LGPD Art. 20 compliance)
- **AI at the periphery, never in the verdict**
- **Multi-tenancy from day one**

The plan is structured for **client-facing validation every Monday**, with verifiable deliverables and explicit security milestones.

---

## PHASE 0: PREPARATION AND ALIGNMENT (WEEK 1)
**Objective:** Establish technical baseline and agree on success metrics with client
**Deliverable for validation on Monday (08/10):**
- [ ] Signed technical scope document for both features
- [ ] Success metrics defined (e.g., form completion time reduction, form completion rate)
- [ ] Security checklist reviewed with focus on LGPD for resume data
- [ ] Review of existing AI architecture (packages/ai/) for capability confirmation

**Weekly Activities:**
- Monday (08/10): Kickoff meeting - align expectations and define Definition of Done
- Tuesday-Wednesday: Technical audit of existing AI module (history extraction, OCR)
- Thursday: Define data schema for imported resumes (mapping to form_schemas)
- Friday: Prepare risk and mitigation presentation for Monday validation

**Monday Validation (08/10):**
> "Client confirms scope, success metrics, and approves initial security checklist"

---

## PHASE 1: RESUME IMPORT PRE-FILLING (WEEKS 2-4)
**Objective:** Implement secure resume import with validation against versioned form schema
**Technical Base:** 
- Reuses existing `packages/ai/` module (Claude for structured extraction)
- Integrates with `packages/core/forms/` (schema-driven renderer)
- Uses `application_data` table (versioned JSONB) for storage
- **DOES NOT** directly write to sensitive fields - passes through validation and consent

**Weekly Deliverables for Monday Validation:**

**Week 2 (Deliverable 08/19):**
- [ ] API endpoint `/api/candidate/resume-import` (POST, accepts PDF/DOCX)
- [ ] Extraction service using Claude Vision + Text (specific prompt engineering for dekassegui resumes)
- [ ] Initial field mapping: name, birth_date, japan_experience, brazil_experience, skills
- [ ] **Security Checkpoint:** No resume data is saved without passing Zod validation from schema
- [ ] Unit tests covering 80% of extraction cases

**Week 3 (Deliverable 08/26):**
- [ ] Form integration: "Import Resume" button on identification step
- [ ] Preview of pre-filled fields with edit option before saving
- [ ] Complete audit log: who imported, when, file hash, fields modified post-import
- [ ] **Security Checkpoint:** Real MIME validation (magic bytes), 5MB limit, basic virus scan (ClamAV in worker)
- [ ] Load test: 10 simultaneous imports without performance degradation

**Week 4 (Deliverable 09/02):**
- [ ] Support for Portuguese and Japanese resumes (automatic language detection)
- [ ] Configurable mapping by organization (via admin: which resume fields go to which form fields)
- [ ] Quality reports: % of fields correctly pre-filled by resume source
- [ ] **Security Checkpoint:** Consent review - import does not replace explicit consent for sensitive data (Block B remains blank until manual filling)
- [ ] Candidate user guide (how to import resume)

**Monday Validation Each Week:**
> Client tests in staging environment with real resumes and confirms:
> - Extraction accuracy (>85% correct fields for standard resumes)
> - Post-import editing experience is intuitive
> - No sensitive data is pre-filled without explicit intervention
> - Audit logs are complete and accessible

**Quantified Benefits (Based on Doc 01):**
- **60-70% reduction in initial form filling time** (from ~25 min to 7-10 min)
- **Estimated 25% increase in form completion rate** (reduces abandonment in early steps)
- **Improved data quality** (eliminates typos in critical fields like dates and document numbers)
- **Clear competitive differential** vs generic ATS (none offer intelligent import for dekassegui-specific format)

**Cost and Timeline Impact:**
- **Variable Cost:** +R$ 8/month per 100 imported resumes (additional Claude API usage - already in base plan)
- **Fixed Cost:** Zero (reuses existing AI infrastructure)
- **Delivery Timeline:** 3 sprints (6 weeks) - **does not delay MVP** as it's built on existing module
- **Risk:** Low (reuses 90% of extraction code already planned for free-text history)

---

## PHASE 2: METRICS AND INDICATORS DASHBOARD (WEEKS 5-8)
**Objective:** Provide operational and executive visibility based on existing pipeline events
**Technical Base:**
- Leverages `pipeline_events` table (already implemented for state machine)
- Uses `screening_decisions` and `match_scores` for quality metrics
- Built with TanStack Table + TanStack Query (already in stack - doc 02, line 26)
- **DOES NOT** require new database or additional infrastructure

**Weekly Deliverables for Monday Validation:**

**Week 5 (Deliverable 09/07):**
- [ ] Funnel overview: count by state (draft → admission_completed)
- [ ] Conversion rate between critical steps (e.g., interview → approved_interview)
- [ ] Average time per step (highlighting bottlenecks > SLA)
- [ ] **Security Checkpoint:** Aggregated data never exposes sensitive PII; access restricted to `analyst` and above roles via RLS
- [ ] Filters by organization, referring agency, application month

**Week 6 (Deliverable 09/14):**
- [ ] Screening dashboard: % approved/rejected by reason (reason_code from screening_decisions)
- [ ] Triaging rule effectiveness (e.g., how many candidates rejected by age_maximum had worked_same_company=true)
- [ ] Matching metrics: average score per vacancy, distribution of hits/misses in compatibility predictions
- [ ] **Security Checkpoint:** No sensitive health data (Block B) appears in any report
- [ ] CSV/PDF report export (via existing @react-pdf/renderer)

**Week 7 (Deliverable 09/21):**
- [ ] Referring agency dashboard: performance by agency (how many candidates sent, interview approval rate)
- [ ] Automatic alerts: SLA-violated steps (e.g., visas pending > 15 days)
- [ ] Integration with existing notification system (pg-boss + WhatsApp/email)
- [ ] **Security Checkpoint:** Dashboard access logs recorded in audit_log (who viewed which metrics)

**Week 8 (Deliverable 09/28):**
- [ ] Executive view: Cost per successful hire (estimated based on WhatsApp/IA variables)
- [ ] Predictive indicator: success probability based on matching and triage history
- [ ] Organizational goal configuration (e.g., goal of 80% interview approval rate)
- [ ] **Security Checkpoint:** Final data exposure review - zero fields from `candidate_health` or `consents` in any visualization
- [ ] Metrics interpretation guide for non-technical stakeholders

**Monday Validation Each Week:**
> Client confirms in staging environment:
> - Metrics align with business questions (doc 01, lines 155-165)
> - Data updated in near real-time (max 5min delay)
> - Interface is responsive and mobile-first (80% of managers access via mobile)
> - No metric reveals sensitive information inappropriately
> - Alerts are actionable and don't generate false positives

**Quantified Benefits:**
- **50% reduction in managerial analysis time** (eliminates manual tracking spreadsheets)
- **Early problem detection** (e.g., sudden increase in rejections for specific reason)
- **Foundation for negotiation with Japanese partner** (objective pipeline performance data)
- **Basis for premium charging** (matching metrics can be sold as service)

**Cost and Timeline Impact:**
- **Variable Cost:** Zero (reuses existing events)
- **Fixed Cost:** Zero (uses existing frontend/backend components)
- **Delivery Timeline:** 4 sprints (8 weeks) - **delivery after core MVP**, but before commercial launch
- **Risk:** Very low (construction over already-implemented tables and events)

---

## PHASE 3: INTEGRATION, SECURITY AND FINAL VALIDATION (WEEKS 9-10)
**Objective:** Ensure robustness, security, and commercial readiness
**Deliverables for Monday Validation:**

**Week 9 (Deliverable 10/05):**
- [ ] Penetration test focused on new features (resume import and dashboard)
- [ ] Audit log review to ensure complete traceability of resume data access
- [ ] Disaster recovery test (backup/restore of R2 + Postgres)
- [ ] LGPD compliance validation: portability and deletion functioning for resume data
- [ ] **Security Checkpoint:** Final privacy officer approval (simulated or real)

**Week 10 (Deliverable 10/12):**
- [ ] Complete technical launch document
- [ ] Client team training plan (videos + manuals)
- [ ] Baseline metrics established (for post-launch comparison)
- [ ] Pre-go-live meeting with all stakeholders
- [ ] **Security Checkpoint:** Certificate that zero critical/high vulnerabilities exist in new features scope

**Monday Validation (10/12):**
> Client signs Technical Acceptance Term confirming:
> - All features function as specified
> - Security checklist is 100% met
> - Product is ready for commercial use with real data
> - Team training is scheduled

---

## SUMMARY GANTT CHART
```
Week:      1    2    3    4    5    6    7    8    9    10
Prep/Align [===]
Resume CV  [===========]
Dashboard       [===============]
Security              [=====]
Launch                   [===]
```
**Validation Milestones (Every Monday):**
- 08/10: Scope and metrics approved
- 08/17: Basic resume import API working
- 08/24: Import with editing and validation working
- 08/31: Complete import with quality reports
- 09/07: Funnel dashboard operational
- 09/14: Triaging and matching dashboard
- 09/21: Agency dashboard and alerts
- 09/28: Executive dashboard and configurable
- 10/05: Security validated with penetration tests
- 10/12: Product approved for launch

---

## SECURITY AND ROBUSTNESS GUARANTEES
This plan incorporates lessons learned from initial analysis (doc 01, section 4) and follows these non-negotiable principles:

1. **Sensitive Data is Sacred**
   - No `candidate_health` field (Form Block B) is pre-filled by resume import
   - Resume import only populates non-sensitive fields (identification, experience, etc.)
   - Explicit consent remains mandatory for any health data usage

2. **Total Auditing**
   - Every resume import generates an `audit_log` event with:
     - Original file hash
     - Who imported (user_id + IP + user-agent)
     - Precise timestamp
     - List of mapped fields and extracted values
     - Difference between imported data and final data after candidate editing

3. **Layered Validation**
   - Client-side: real-time Zod validation
   - Server-side: Zod validation + schema business rules
   - Database: NOT NULL constraints and correct types
   - Application layer: verification no sensitive data was improperly injected

4. **Clear Usage Limits**
   - Resume import: max 5MB, only PDF/DOCX
   - IA API call rate: limited per organization to prevent cost abuse
   - Dashboard: rate limiting per user + organization

5. **Proven Testability**
   - 90%+ unit test coverage on import core
   - Property-based tests (fast-check) ensuring no invalid state is reached
   - Integration test with Postgres Testcontainers validating RLS between organizations
   - E2E test with Playwright covering full import → edit → submission flow

---

## DELIVERY COMMITMENTS
As your CTO/right hand, I commit to:

1. **Radical Transparency:** Every Monday you'll receive a progress report with:
   - What was delivered that week
   - What will be delivered next week
   - Blockers (if any) with mitigation plan
   - Quality metrics (test coverage, performance, etc.)

2. **No Negative Surprises:** If there's risk of delay or security issue, you'll be informed **immediately** - not waiting until Monday meeting.

3. **Quality Over Speed:** I prefer delivering a 100% secure and tested feature on the promised date over delivering something fragile earlier.

4. **Alignment with Your Methodology:** All deliveries will be structured for your Monday validation, with staging environments identical to production for realistic testing.

5. **Client Value Focus:** Each feature will be measured by real impact on the business metrics you defined in Phase 0.

---

## IMMEDIATE NEXT STEPS
To initiate the Master Senior Plan next Monday (08/12), I need you to:
1. Confirm this document as the working base
2. Indicate key stakeholders participating in Monday validations
3. Provide staging environment access (if exists) or confirm we can use initial development environment
4. Define fixed time for Monday validations (suggest 10am Brasília time for overlap with your schedule)

I'm ready to start working as soon as you give the signal. This plan is not just a task list - it's a commitment to deliver a product that is **professional, secure, and truly robust**, exactly as requested.

**Let's build something your Japanese client will want to copy.** - Rafael Maldivas
CTO, SelectSys Jobs
08/06/2026

-- 

## CLIENT ACCEPTANCE

By signing below, the undersigned declares having read, understood, and agreed to all terms, scopes, schedules, and commitments established in this Master Senior Plan for the SelectSys Jobs project.

_________________________________
[Client Name]
[Title]

_________________________________
[Date]

_________________________________
[Signature]

-- 

## ACEITE DO CLIENTE

Pelo presente, o abaixo assinado declara ter lido, compreendido e concordado com todos os termos, escopos, cronogramas e compromissos estabelecidos neste Plano Master Sênior para o projeto SelectSys Jobs.

_________________________________
[Nome do Cliente]
[Cargo]

_________________________________
[Data]

_________________________________
[Assinatura]