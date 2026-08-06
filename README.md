# SelectSys Jobs 🇯🇵🇧🇷

> **SaaS Multi-Tenant de Alta Performance para Gestão do Pipeline de Exportação de Mão de Obra (Brasil → Japão)**  
> *Transformando o recrutamento e seleção de trabalhadores dekassegui com tecnologia explicável, inteligência aplicada e conformidade LGPD.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active%20Production-brightgreen.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20RLS-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![LGPD Compliant](https://img.shields.io/badge/LGPD-Art._20_&_11-purple)]()

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [🏆 Cliente Pioneiro & Case de Sucesso: FUJIARTE](#-cliente-pioneiro--case-de-sucesso-fujiarte)
- [⚙️ Regras de Negócio e Domínio Dekassegui](#️-regras-de-negócio-e-domínio-dekassegui)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏗️ Arquitetura e Princípios de Engenharia](#️-arquitetura-e-princípios-de-engenharia)
- [🔒 Segurança, Privacidade e LGPD](#-segurança-privacidade-e-lgpd)
- [📊 Modelo de Dados & Multi-Tenancy](#-modelo-de-dados--multi-tenancy)
- [🚀 Funcionalidades Principais](#-funcionalidades-principais)
- [🗺️ Roadmap & Metodologia](#️-roadmap--metodologia)
- [📑 Documentação do Projeto](#-documentação-do-projeto)
- [📜 Licença](#-licença)

---

## 🌐 Visão Geral

O **SelectSys Jobs** é uma plataforma SaaS especializada no ecossistema **Dekassegui** (exportação de trabalhadores do Brasil para o Japão). Diferente de sistemas ATS (Applicant Tracking System) genéricos como Gupy ou Solides, o SelectSys Jobs foi concebido de raiz para resolver a complexidade única do mercado nipo-brasileiro: gestão de vistos COE (*Certificate of Eligibility*), tradução de histórico laboral por províncias japonesas, controle de documentos (Koseki Touhon, Reentry, Passaporte) e rigoroso cumprimento de privacidade e regras sanitárias.

### 🔄 O Funil Dekassegui (11 Etapas / 17 Estados)
```mermaid
graph LR
    A[1. Candidatura] --> B[2. Triagem Automática]
    B --> C[3. Entrevista]
    C --> D[4. Integração Garoon]
    D --> E[5. Envio ao Japão]
    E --> F[6. Seleção Fábrica]
    F --> G[7. Oferta/Aprovação]
    G --> H[8. Processo COE]
    H --> I[9. Emissão Visto]
    I --> J[10. Viagem/Embarque]
    J --> K[11. Admissão no Japão]
```

---

## 🏆 Cliente Pioneiro & Case de Sucesso: FUJIARTE

A **FUJIARTE**, uma das maiores e mais respeitadas empresas de recursos humanos e terceirização de mão de obra no Japão, é o **primeiro cliente parceiro e caso de validação operacional** do SelectSys Jobs.

### 🎯 Desafio & Solução FUJIARTE
- **Desafio:** A operação dependia do preenchimento de fichas cadastrais em planilhas Excel altamente complexas (`白紙 FUJIARTE Ficha Cadastral`), contendo cerca de 130 campos detalhados (identificação, biometria para EPIs, histórico fabril no Japão, enquetes de saúde e antecedentes). O preenchimento manual gerava inconsistências, retrabalho e morosidade na triagem.
- **Solução:** O SelectSys Jobs digitalizou 100% desse fluxo através de um **Formulário Web Inteligente Mobile-First**, integrando extração automática de currículos via IA (Anthropic Claude), motor de triagem auditável e **exportação idêntica (pixel-perfect) no layout nativo `.xls` da FUJIARTE**.

### 💎 Benefícios Validados na Operação FUJIARTE:
* **Fidelidade de Exportação (100% layout .xls):** Garante que os analistas no Japão continuem recebendo a ficha exatamente no padrão histórico esperado pela diretoria.
* **Redução de 60-70% no tempo de candidatura:** Redução de ~25 minutos para 7-10 minutos com suporte a auto-save e pré-preenchimento inteligente.
* **Zero atrito de adoção:** Transição transparente do papel/planilha para o fluxo digital com gestão de status por agência indicadora parceira.

---

## ⚙️ Regras de Negócio e Domínio Dekassegui

O SelectSys Jobs traduz regras operacionais complexas em um motor automatizado, flexível e auditável:

### 1. Formulário Inteligente Dinâmico (~130 Campos)
* **Página Cadastral (Bloco Identificação & Biometria):** Coleta de dados precisos como tamanho de pé e cintura em centímetros para encomenda imediata de EPIs/uniformes industriais no Japão.
* **Histórico Laboral Flexível (1:N):** Suporte ilimitado para registros de trabalho no Japão (província, fábrica, empreiteira, período) e no Brasil.
* **Enquetes de Aptidão & Saúde (Blocos A, B e C):** Coleta estruturada de restrições físicas, disponibilidade de turnos/horas extras, tatuagens (local e foto) e motivações familiares.

### 2. Motor de Triagem Automática & Explicável
* **Sem Hardcoding:** As regras de negócio (ex: idade máxima < 55 anos, exceções para ex-colaboradores da mesma fábrica, descendência nikkei nissei/sansei/yonsei) são versionadas no banco como dados e avaliadas dinamicamente.
* **Conformidade LGPD Art. 20:** Toda reprovação gera um parecer técnico detalhado e explicável ("Por que este candidato foi reprovado?"), garantindo o direito à revisão humana.

### 3. Matching e Compatibilidade em 2 Estágios
1. **Estágio 1 (Hard Constraints):** Filtro eliminatório imediato para requisitos mandatórios (ex: elegibilidade de visto, certidões).
2. **Estágio 2 (Weighted Score 0-100):** Cálculo ponderado de aderência à vaga (experiência no setor de autopeças/eletrônicos, domínio do idioma japonês, disponibilidade de embarque).

---

## 🛠️ Stack Tecnológico

Desenvolvido com uma arquitetura moderna, robusta e escalável preparada para alta concorrência:

| Camada | Tecnologias Utilizadas |
|---|---|
| **Frontend Framework** | **Next.js 15** (App Router), **React 19**, **TypeScript** (Strict Type Safety) |
| **Estilização & UI** | **Tailwind CSS**, **shadcn/ui**, **Radix UI** primitives, Lucide Icons |
| **Formulários & Schemas** | **react-hook-form**, **Zod** (validação end-to-end com renderer guiado por schema) |
| **Backend & ORM** | **Node.js**, **Drizzle ORM** (queries type-safe e performáticas) |
| **Banco de Dados** | **PostgreSQL 16** (Extensions: `pgcrypto` para criptografia, `pg_trgm`, `unaccent`) |
| **Autenticação & Sessões** | **Auth.js v5** (Magic Links para candidatos, E-mail/Senha + TOTP MFA para staff) |
| **IA & Processamento** | **Anthropic Claude SDK** (`claude-3-5-sonnet`) para parsing de currículos (periferia) |
| **Filas & Tarefas Assíncronas** | **pg-boss** (gestão de filas resiliente baseada no PostgreSQL) |
| **Storage & Documentos** | **Cloudflare R2** (S3-Compatible) com presigned URLs para upload direto e seguro |
| **Geração de Arquivos** | **ExcelJS** (preenchimento do template `.xls` da FUJIARTE), **@react-pdf/renderer** |
| **Comunicação & Notificação** | **Meta WhatsApp Cloud API**, **Resend** + **React Email** |
| **Internacionalização (i18n)** | **next-intl** (Suporte a Português `pt-BR`, Japonês `ja-JP` e Espanhol `es`) |
| **Observabilidade & Infra** | **Sentry**, **Better Stack**, **Docker**, **Coolify** CI/CD em servidor dedicado |

---

## 🏗️ Arquitetura e Princípios de Engenharia

1. **Multi-Tenancy Nativo com RLS (Row Level Security):** Isolamento total de dados por organização (`organization_id`) garantido diretamente na camada de banco de dados PostgreSQL.
2. **Configuração > Código:** Formulários, perguntas da enquete e regras de triagem são dados JSONB versionados. Nenhuma regra de negócio é embutida em código rígido.
3. **Decisões Auditáveis:** Toda avaliação de candidato gera um snapshot imutável (`screening_decisions`) com as entradas do candidato, a versão da regra aplicada e o resultado obtido.
4. **Inteligência Artificial na Periferia:** A IA atua na extração de currículos, tradução e sumarização de perfis para o parceiro japonês — **nunca** no veredito automatizado de aprovação/reprovação.
5. **Monólito Modular:** Código estruturado em módulos com fronteiras limpas (packages/core, packages/ai, etc.) facilitando manutenção e deploy único simplificado.

---

## 🔒 Segurança, Privacidade e LGPD

Tratando dados no fluxo Brasil-Japão, a segurança e a conformidade legal são pilares fundamentais:

* **Proteção a Dados Pessoais Sensíveis (LGPD Art. 5º II e Art. 11):** Os dados de saúde do candidato (Bloco B) são armazenados em tabelas dedicadas com **criptografia em nível de coluna** (`pgcrypto`).
* **Trilha de Auditoria Inalterável (`audit_log`):** Todo acesso ou leitura de dados sensíveis de candidatos registra o usuário responsável, timestamp, IP e motivo do acesso.
* **Gestão de Consentimento Versionado:** Consentimento explícito exigido do candidato com registro de Timestamp, IP e versão do termo aceito.
* **Política de Purga Automática:** Expurgo programado de documentos e dados após 24 meses do encerramento do processo seletivo.

---

## 📊 Modelo de Dados & Multi-Tenancy

```
organizations ──┬── users ── memberships (roles: admin, analista, entrevistador)
                ├── agencies ──── agency_links (código único de indicação)
                ├── form_schemas (versionamento dinâmico)
                ├── rulesets (regras de triagem versionadas)
                ├── jobs (vagas/postos nas fábricas) ── job_requirements
                └── candidates ──┬── applications ──┬── application_data (JSONB)
                                 │                  ├── screening_decisions
                                 │                  ├── pipeline_events
                                 │                  └── match_scores
                                 ├── work_history (Experiência Japão / Brasil)
                                 ├── family_members (Familiar em emergência)
                                 ├── documents (State Machine de certidões/visto)
                                 ├── candidate_health 🔒 (Criptografada)
                                 └── consents (Gestão de termos LGPD)

audit_log · notifications · message_templates · subscriptions · billing_events
```

---

## 🚀 Funcionalidades Principais

### 📱 Para Candidatos Dekassegui
- **Portal Mobile-First:** Preenchimento simples e responsivo em smartphones (~80% dos acessos).
- **Importação Inteligente de Currículo:** Upload de PDF/DOCX em Português ou Japonês com pré-preenchimento automático via IA.
- **Rascunho & Autosave:** Progresso salvo automaticamente sem perda de informações.
- **Acompanhamento do Pipeline:** Status em tempo real (Triagem, Entrevista, Visto COE, Embarque).

### 🖥️ Para Equipe Interna / Empreiteiras
- **Kanban do Pipeline Dekassegui:** Visualização intuitiva das 11 etapas operacionais.
- **Exportador Excel FUJIARTE:** Emissão com 1 clique do arquivo `.xls` 100% idêntico ao modelo oficial.
- **Motor de Triagem & Justificativas:** Visualização imediata dos motivos de pontuação e aprovação.
- **Gestão de Agências Indicadoras:** Relatórios detalhados e controle de performance de parceiros de captação.

### 🏯 Para Parceiros no Japão (Empreiteiras / Fábricas)
- **One-Pager de Apresentação:** Perfil resumido e padronizado do candidato traduzido em Japonês.
- **Histórico Estruturado:** Exibição clara de turnos, províncias trabalhadas e competências operacionais.

---

## 🗺️ Roadmap & Metodologia

O desenvolvimento segue o **Plano Master Sênior** com validação semanal com os clientes:

- [x] **Fase 1 — MVP Core (Concluído):** Formulário dinâmico, exportação idêntica Excel FUJIARTE, máquina de 17 estados e motor de triagem.
- [x] **Fase 2 — IA & Analytics (Em Execução):** Importação de currículo via Claude IA, Dashboard de Métricas operacionais e funil de conversão.
- [ ] **Fase 3 — Integração & Expansão:** Conexão nativa com Cybozu Garoon Cloud/On-Premise e automação avançada de WhatsApp.

---

## 📑 Documentação do Projeto

Para mais detalhes sobre arquitetura, negócios e implementação, consulte a pasta [`docs/`](docs/):

- [`docs/01-analise-documentos.md`](docs/01-analise-documentos.md) — Análise dos processos dekassegui e modelo FUJIARTE.
- [`docs/02-arquitetura-e-stack.md`](docs/02-arquitetura-e-stack.md) — Detalhamento técnico de infraestrutura e estimativa de custos.
- [`docs/03-plano-implementacao.md`](docs/03-plano-implementacao.md) — Plano de execução das fases do sistema.
- [`docs/04-modelo-comercial-e-fiscal.md`](docs/04-modelo-comercial-e-fiscal.md) — Estrutura comercial, pricing e enquadramento fiscal MEI/ME.
- [`PLANO_MASTER_SENIOR.md`](PLANO_MASTER_SENIOR.md) — Cronograma de entregas e metodologia de validação.

---

## 📜 Licença

Este projeto é um software licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<p align="center">
  <b>SelectSys Jobs</b> — <i>Transformando o recrutamento Dekassegui com tecnologia segura, auditável e inteligente.</i>
</p>