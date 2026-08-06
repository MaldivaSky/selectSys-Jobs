# SelectSys Jobs

## Sistema de Gestão de Processo Dekassegui (Brasil → Japão)  
## Dekassegui Process Management System (Brazil → Japan)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/yourusername/selectsys-jobs)

---

## ����� Visão Geral / Overview

**SelectSys Jobs** é um **SaaS multi-tenant** especializado na gestão completa do processo de exportação de mão de obra do Brasil para o Japão (dekassegui). Diferente de um ATS genérico, nosso sistema foi construido especificamente para atender às exigências únicas deste fluxo.

**SelectSys Jobs** is a **multi-tenant SaaS** specialized in the complete management of the labor export process from Brazil to Japan (dekassegui). Unlike a generic ATS, our system was specifically built to meet the unique requirements of this flow.

---

## ����� Principais Funcionalidades / Key Features

### ����� Formulário Inteligente / Smart Form
- Substitui a planilha Excel atual mantendo layout 100% idêntico na exportação
- Replaces current Excel sheet maintaining 100% identical layout in export
- Rascunho e autosave para formulário extenso (~130 campos)  
- Draft and autosave for extensive form (~130 fields)
- Totalmente configurável pelo cliente sem intervenção técnica
- Fully configurable by client without technical intervention
- Mobile-first (80% dos candidatos preenchem via celular)
- Mobile-first (80% of candidates fill via mobile)

### ����� Triagem Automática Explicável / Explainable Automated Screening
- Regras como dados versionados (não hardcoded)
- Rules as versioned data (not hardcoded)
- Resposta imediata a "por que esse candidato foi reprovado?"
- Immediate answer to "why was this candidate rejected?"
- Conformidade com LGPD Art. 20 (direito à revisão)
- LGPD Art. 20 compliance (right to review)
- Reprocessamento seguro quando regras mudam
- Safe reprocessing when rules change

### ����� Matching e Compatibilidade / Matching and Compatibility
- Estágio 1: Restrições rígidas (elimina imediatamente)
- Stage 1: Hard constraints (immediate elimination)
- Estágio 2: Score ponderado 0-100 (configurável por vaga)
- Stage 2: Weighted score 0-100 (configurable per vacancy)
- Saída sempre explicável com plano de ação
- Always explainable output with action plan

### ����� Dashboard de Métricas / Metrics Dashboard
- Visão geral do funil de processamento
- Processing funnel overview
- Taxas de conversão entre etapas críticas
- Conversion rates between critical steps
- Tempo médio por etapa com alertas de SLA
- Average time per step with SLA alerts
- Performance por agência indicadora
- Performance by referring agency
- Indicadores preditivos de sucesso
- Success predictive indicators

### ����� Importação de Currículo / Resume Import
- Pré-preenchimento inteligente via upload de PDF/DOCX
- Smart pre-filling via PDF/DOCX upload
- Suporte a currículos em português e japonês
- Support for Portuguese and Japanese resumes
- Validação em camadas e auditoria completa
- Layered validation and complete auditing
- Nenhum dado sensível pré-preenchido automaticamente
- No sensitive data auto-pre-filled

### �������� Segurança e Conformidade / Security and Compliance
- Criptografia em nível de coluna para dados de saúde sensíveis
- Column-level encryption for sensitive health data
- Log de acesso completo a cada leitura de dados sensíveis
- Complete access log for each sensitive data read
- Consentimento específico, versionado e com timestamp/IP
- Specific, versioned consent with timestamp/IP
- Isolamento multi-tenant via RLS no PostgreSQL
- Multi-tenant isolation via PostgreSQL RLS
- Backup diário com restore testado mensalmente
- Daily backup with monthly tested restore

---

## �������� Arquitetura e Tecnologia / Architecture and Technology

### Stack Técnico / Technical Stack
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + Radix
- **Formulários:** react-hook-form + Zod com renderer dirigido por schema
- **Backend:** Node.js com Drizzle ORM
- **Banco de Dados:** PostgreSQL 16 (com pgcrypto, pg_trgm, unaccent)
- **Auth:** Auth.js v5 (magic link para candidatos, e-mail+senha+TOTP para staff)
- **Filas:** pg-boss (fila em cima do Postgres)
- **Storage:** Cloudflare R2 (S3-compatible) com upload direto por URL pré-assinada
- **E-mail:** Resend + React Email
- **WhatsApp:** Meta WhatsApp Cloud API
- **IA:** Claude (claude-sonnet-5) via Anthropic SDK
- **Excel:** ExcelJS (preenchendo o .xls original como template)
- **PDF:** @react-pdf/renderer
- **i18n:** next-intl (pt-BR, ja-JP, es)
- **Pagamentos:** Asaas (BRL) + Stripe (JPY/internacional)
- **Observabilidade:** Sentry + Better Stack
- **CI/CD:** GitHub Actions → Docker → Coolify

### Princípios de Arquitetura / Architecture Principles
1. **Multi-tenant desde a linha 1** - Pronto para múltiplas empreiteiras desde o início
2. **Configuração > código** - Formulário, regras e pesos são dados, não código
3. **Decisões auditáveis** - Toda triagem grava entradas + versão da regra + resultado
4. **IA na periferia, nunca no veredito** - IA apenas traduz, resume, extrai - nunca aprova/reprova
5. **Monólito modular** - Módulos com fronteiras limpas dentro de único deploy

---

## ����� Modelo de Dados / Data Model

```
organizations ──��── users ── memberships (role)
                ├── agencies ──── agency_links (código único)
                ├── form_schemas (versionadas)
                ├── rulesets (versionadas)
                ├── jobs (vagas) ── job_requirements
                └── candidates ──��── applications ──��── application_data (JSONB)
                                 │                  ├── screening_decisions
                                 │                  ├── pipeline_events
                                 │                  └── match_scores
                                 ├── work_history (1:N Japão/Brasil)
                                 ├── family_members
                                 ├── documents (state machine)
                                 ├── candidate_health  ����� criptografada
                                 └── consents (versionados)

audit_log · notifications · message_templates · subscriptions · billing_events
```

**Isolamento multi-tenant:** `organization_id` em toda tabela + RLS no Postgres  
**Multi-tenancy isolation:** `organization_id` in all tables + Postgres RLS

---

## ����� Telas Principais / Main Screens

### Para Candidatos / For Candidates
- Formulário de candidatura com importação de currículo
- Application form with resume import
- Portal do candidato com status em tempo real
- Candidate portal with real-time status
- Área de serviço premium (matching e compatibilidade)
- Premium service area (matching and compatibility)

### Para Staff Interno / For Internal Staff
- Painel administrativo com kanban do pipeline
- Admin panel with pipeline kanban
- Gestão de vagas e requisitos
- Job and requirements management
- Dashboard de métricas e indicadores
- Metrics and indicators dashboard
- Configuração de formulário, regras e matching
- Form, rules, and matching configuration
- Gestão de agências indicadoras
- Referring agency management

### Para Parceiros Japoneses / For Japanese Partners
- Perfil resumido do candidato em japonês
- Candidate summary profile in Japanese
- Histórico de trabalho estruturado
- Structured work history
- One-pager de apresentação gerado por IA
- IA-generated presentation one-pager

---

## ����� Segurança e LGPD / Security and LGPD

### Dados Sensíveis / Sensitive Data
- Bloco B do formulário (saúde) em tabela criptografada separados
- Form Block B (health) in separate encrypted table
- Log de acesso a cada leitura (quem, quando, qual candidato, qual campo)
- Access log for each read (who, when, which candidate, which field)
- Consentimento específico e destacado, versionado com timestamp/IP
- Specific and highlighted consent, versioned with timestamp/IP
- Política de retenção com expurgo automático (24 meses após último contato)
- Retention policy with automatic purging (24 months after last contact)

### Conformidade / Compliance
- LGPD Art. 20: Direito à revisão de decisões automatizadas
- LGPD Art. 20: Right to review of automated decisions
- Decisões de triagem são determinísticas, explicáveis e persistidas
- Screening decisions are deterministic, explainable, and persisted
- Nenhuma IA no caminho de aprovar/reprovar - apenas na periferia
- No AI in approve/reject path - only in periphery
- Direitos do titular: endpoints de exportação e exclusão de dados (self-service)
- Data subject rights: export and deletion endpoints (self-service)

---

## ����� Métricas de Sucesso / Success Metrics

### Operacionais / Operational
- Redução de 60-70% no tempo de preenchimento inicial do formulário
- 60-70% reduction in initial form filling time
- Aumento estimado de 25% na taxa de conclusão do formulário
- Estimated 25% increase in form completion rate
- Redução de 50% no tempo de análise gerencial
- 50% reduction in managerial analysis time

### de Qualidade / Quality
- Melhoria na qualidade dos dados (elimina erros de digitação em campos críticos)
- Improved data quality (eliminates typos in critical fields)
- Taxa de aceitação pelo parceiro japonês > 95%
- Japanese partner acceptance rate > 95%
- Redução de retrabalho por informações incorretas ou faltantes
- Reduction in rework due to incorrect or missing information

### de Negócio / Business
- Diferencial claro vs ATS genéricos (nenhum fala COE, Koseki, Reentry, província)
- Clear differential vs generic ATS (none speak COE, Koseki, Reentry, province)
- Base para cobrança de serviço premium (matching explicável)
- Basis for premium service charging (explainable matching)
- Escalabilidade: mesma infraestrutura suporta 8-10 organizações do porte inicial
- Scalability: same infrastructure supports 8-10 organizations of initial size

---

## �������� Roadmap

### Fase 1: MVP Core (Concluído)
- Formulário versionado e exportação Excel idêntica
- Versioned form and identical Excel export
- Motor de regras de triagem explicável
- Explainable screening rules engine
- Máquina de estados do pipeline dekassegui (17 estados)
- Dekassegui pipeline state machine (17 states)
- Integração básica WhatsApp e e-mail
- Basic WhatsApp and email integration

### Fase 2: Melhorias Solicitadas (Este Plano)
- Pré-preenchimento de formulário via importação de currículo
- Form pre-filling via resume import
- Dashboard de métricas e indicadores operacionais
- Operational metrics and indicators dashboard

### Fase 3: Expansão e Otimização
- Integração completa Garoon (cloud ou on-premise)
- Full Garoon integration (cloud or on-premise)
- Sistema de indicadores preditivos avançados
- Advanced predictive indicators system
- Otimização de custos baseado em uso real
- Cost optimization based on real usage
- Expansão para outras empreiteiras do mercado dekassegui
- Expansion to other dekassegui market staffing agencies

---

## ����� Equipe / Team

- **CTO / Líder Técnico:** Rafael Maldivas
- **Arquiteto de Soluções:** [A definir]
- **Lead Frontend:** [A definir]
- **Lead Backend:** [A definir]
- **Especialista em IA/ML:** [A definir]
- **Especialista em Segurança/LGPD:** [A definir]

---

## ����� Documentação Relacionada / Related Documentation

- [`docs/01-analise-documentos.md`](docs/01-analise-documentos.md) - Análise dos documentos e processo atual
- [`docs/02-arquitetura-e-stack.md`](docs/02-arquitetura-e-stack.md) - Arquitetura, stack e custo de infraestrutura
- [`docs/03-plano-implementacao.md`](docs/03-plano-implementacao.md) - Plano de implementação
- [`docs/04-modelo-comercial-e-fiscal.md`](docs/04-modelo-comercial-e-fiscal.md) - Modelo comercial e fiscal
- [`docs/05-escopo-mvp.md`](docs/05-escopo-mvp.md) - Escopo do MVP
- [`docs/06-backlog-scrum.md`](docs/06-backlog-scrum.md) - Backlog Scrum
- [`docs/07-fluxo-de-caixa.md`](docs/07-fluxo-de-caixa.md) - Fluxo de caixa
- [`docs/08-whatsapp-tech-provider.md`](docs/08-whatsapp-tech-provider.md) - WhatsApp tech provider
- [`docs/09-roteiro-de-ativacao.md`](docs/09-roteiro-de-ativacao.md) - Roteiro de ativação

---

## �������� Licença / License

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ����� Agradecimentos / Acknowledgements

Agradecemos à nossa equipe pelo comprometimento e à nossa primeira parceira japonesa pela confiança em construir uma solução específica para o mercado dekassegui.  
We thank our team for their commitment and our first Japanese partner for trusting us to build a specific solution for the dekassegui market.

---

**SelectSys Jobs - Transformando o processo dekassegui com tecnologia segura e inteligente**  
**SelectSys Jobs - Transforming the dekassegui process with secure and intelligent technology**

*Versão 1.0 - Agosto/2026*  
*Version 1.0 - August/2026*