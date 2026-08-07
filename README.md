# SelectSys Jobs 🇯🇵🇧🇷
> **A Primeira Plataforma SaaS Multi-Tenant de Elite para Gestão do Pipeline Dekassegui (Brasil → Japão)**  
> *Substitua planilhas manuais por um funil auditável com Inteligência Artificial, Kanban Drag-and-Drop, Conexão Direta com a Matriz no Japão (Cybozu Garoon) e Exportação 100% Fiel no Layout .XLS da FUJIARTE.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active Production](https://img.shields.io/badge/Status-Active%20Production-brightgreen.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2019-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%20Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20RLS-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![LGPD & APPI Compliant](https://img.shields.io/badge/LGPD%20%26%20APPI-Conforme-purple)]()

---

## 🚀 O que é o SelectSys Jobs?

O **SelectSys Jobs** é o SaaS B2B definitivo para empreiteiras, agências de recrutamento e empresas de seleção de mão de obra para o Japão. Diferente de plataformas ATS genéricas que não entendem a complexidade do fluxo nipo-brasileiro, o SelectSys Jobs digitaliza integralmente o **Funil Dekassegui** — desde o preenchimento mobile do candidato até a emissão do visto de residente (**在留資格認定証明書 - COE**) e a admissão na fábrica.

---

## ⚡ Nossos Diferenciais Exclusivos (Tudo o que Entregamos)

### 🏆 1. Exportador Excel .XLS 100% Pixel-Perfect (Case FUJIARTE)
- **Fidelidade de 100% Célula a Célula**: Digitalização total da Ficha Cadastral tradicional (`白紙 FUJIARTE ~130 campos`) com geração instantânea da planilha em layout nativo `.xls`.
- **Zero Digitação Manual**: Economia de 60-70% do tempo de preenchimento do candidato (de 25 min para 7-10 min) com auto-save offline e pré-preenchimento por IA.

### ⛩️ 2. Conector Cybozu Garoon (Cloud REST API & On-Premise SOAP)
- **Conexão Direta com a Matriz no Japão**: Sincronização automatizada dos registros dos candidatos aprovados com o sistema de gestão interno no Japão (`.cybozu.com`).
- **Eliminação de Retrabalho**: Transmissão segura de documentos, histórico fabril e dados familiares sem necessidade de troca de e-mails ou redigitação no Japão.

### 📋 3. Kanban Drag-and-Drop com Validação de SLAs
- **Pipeline Visual em 9 Etapas**: Movimentação fluida de candidatos respeitando as regras estritas da tabela `pipeline_transitions`.
- **Alertas de SLA de Imigração**: Destaque automático para processos de COE e visto parados há mais de 15 dias na imigração japonesa.

### 📊 4. Painel Executivo com 12 Indicadores Dekassegui
- **Dashboard Operacional e Financeiro**:
  1. Volume Total de Candidaturas
  2. Taxa de Aprovação na Triagem
  3. Tempo Médio de Emissão de COE (SLA)
  4. Volume de Vistos Emitidos
  5. Retenção por Agência Indicadora
  6. Central de Alertas de Gargalos
  7. Distribuição Étnica (Issei, Nissei, Sansei, Yonsei)
  8. Média de Idade & Curva Demográfica
  9. Match Score Médio das Vagas
  10. Previsão de Custos Logísticos & Embarques
  11. Economia de OpEx com IA DeepSeek
  12. Taxa de Retenção Fabril no Japão (1 ano+)

### 🎯 5. Motor de Matching de Compatibilidade (Match Score 0–100%)
- **Cálculo Ponderado em Tempo Real**: Avaliação do perfil do candidato contra as exigências da vaga:
  - Experiência prévia em fábrica no Japão (Peso 30%)
  - Nível de Idioma Japonês (Peso 25%)
  - Biometria & Calçado EPI em cm (Peso 20%)
  - Disponibilidade de Turnos & Horas Extras (Peso 15%)
  - Descendência Nikkei & Elegibilidade de Visto (Peso 10%)

### 🤖 6. AI Service Proxy em Edge Function (DeepSeek V3/R1)
- **Extração Inteligente na Periferia**: Upload de foto ou currículo em PDF com extração automatizada de 60-70% dos campos.
- **Proteção Absoluta de Dados**: Servidor proxy em Supabase Edge Function com mascaramento prévio de PII (CPF, RG) e chaves API seguras no servidor.

### 🌐 7. Internacionalização Completa (`ja-JP` & `pt-BR`)
- **Suporte Multilíngue Nativo**: Alternância de idioma instantânea para diretores japoneses e analistas brasileiros.

### 🔒 8. Segurança e Conformidade Total (LGPD Art. 20/18 + APPI Japão)
- **Criptografia de Dados de Saúde (`pgcrypto`)**: Dados de biometria e saúde gravados com criptografia AES-256.
- **Parecer Explicável (LGPD Art. 20)**: Registro detalhado em `screening_decisions` com justificativa legal para cada candidato.
- **Audit Log Inalterável**: Registro de quem visualizou ou alterou dados sensíveis com IP e motivo declarado.

---

## 🛠️ Stack Tecnológico de Classe Mundial

| Camada | Tecnologias Utilizadas |
|---|---|
| **Frontend SPA** | React 19, Vite, TypeScript Strict, React Router DOM, Lucide Icons |
| **Estilização** | Tailwind CSS v4, CSS Variables Tokens, Glassmorphism, Dark/Light Theme |
| **Banco de Dados** | PostgreSQL 16 (RLS Multi-Tenant, `pgcrypto`, `pg_trgm`, `unaccent`) |
| **Backend & ORM** | Node.js, Drizzle ORM, Supabase Edge Functions (Deno/TS) |
| **Geração de Planilhas** | ExcelJS, Python openpyxl (Exportador Híbrido com Fallback) |
| **Testes & Qualidade** | Suíte de Testes Integrados Automáticos, CI GitHub Actions para Cobertura |

---

## ⚡ Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm --prefix app run dev

# 3. Executar suíte de testes automatizados da Fase 2
npx tsx tests/phase2_suite.test.ts

# 4. Executar verificação de build e tipos
npm --prefix app run build
```

---

## 📜 Licença

Licenciado sob a **MIT License**. Desenvolvido com rigor de engenharia para o ecossistema nipo-brasileiro.