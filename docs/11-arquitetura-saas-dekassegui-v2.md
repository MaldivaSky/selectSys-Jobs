# 🚀 SELETSYS JOBS V2 — PLANO ARQUITETÔNICO & ESTRATÉGICO DE ELITE
## Master Blueprint SaaS Multi-Tenant para o Mercado Dekassegui (Brasil ➔ Japão)
**Autor:** Especialista em SaaS & Arquitetura de Sistemas Dekassegui  
**Data:** 06 de Agosto de 2026 | **Versão:** 2.0 Final  

---

## 📌 SUMÁRIO EXECUTIVO

O **SelectSys Jobs** é posicionado para ser a **plataforma líder incontestável de tecnologia para exportação de mão de obra nipo-brasileira**. Este documento redefine a fundação técnica e estratégica do produto, integrando:

1. **Redução Drástica de OpEx de IA (Até 95% de economia):** Migração do Claude 3.5 Sonnet para **DeepSeek V3 / DeepSeek R1** com arquitetura de fallback inteligente.
2. **UX de Fricção Zero (Mobile-First Stepper):** Redesenho da jornada de candidatura em micro-etapas gamificadas, autocomplete de províncias japonesas e seletor visual de EPIs/uniforme.
3. **Segurança & Compliance Avançado (LGPD + APPI Japão):** Criptografia colunar PostgreSQL `pgcrypto` para o Bloco B (saúde), auditoria inalterável e consentimento bilíngue com transferência internacional de dados.
4. **Mapeamento SEO & Geo-SEO com Google Jobs:** Sistema de Landing Pages dinâmicas indexadas regionalmente para captação B2C de candidatos e portal B2B para prospecção de novas empreiteiras.
5. **Internacionalização Trilíngue (PT / JA / EN):** Sistema com `next-intl` e tradução automática de currículos/histórico via DeepSeek para geração de One-Pagers japoneses.
6. **Métricas Duplas (SuperAdmin SaaS + Tenant Executive):** Dashboard do Dono do SaaS (gestão de MRR, consumo de IA, orgs) e Dashboard do Cliente (funil dekassegui, conversão de agências e métricas de SLA).

---

## 💰 1. OTIMIZAÇÃO DE CUSTOS DE IA: DEEPSEEK VS CLAUDE

### **Análise Financeira e Técnica**
Atualmente, o uso de IA na plataforma é restrito à **periferia**: parsing estruturado de currículos (PDF/DOCX), tradução de histórico laboral (PT ➔ JA) e sumarização para parceiros japoneses. Nenhuma IA decide aprovação ou reprovação (garantindo conformidade com o Art. 20 da LGPD).

#### **Comparativo Direto de Custos por 1 Milhão de Tokens:**

| Provedor de IA | Input (Entrada / 1M) | Output (Saída / 1M) | Custo Médio por Currículo Extraído | Economia Relativa |
|---|---|---|---|---|
| **Anthropic Claude 3.5 Sonnet** | $3.00 USD | $15.00 USD | ~R$ 0.12 a R$ 0.18 | Baseline (100%) |
| **DeepSeek V3 / R1 (OpenRouter / Direct)** | **$0.14 USD** | **$0.28 USD** | **~R$ 0.008 a R$ 0.01** | **📉 Economia de ~94%** |

### **Arquitetura Proposta: AI Provider Adapter Pattern**

```
┌─────────────────────────────────────────────────────────┐
│                 Candidate Resume / Input                │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
           ┌─────────────────────────────────┐
           │      AIServiceAdapter (Core)    │
           └────────────────┬────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼ (Primary - 95% chamadas)      ▼ (Fallback - OCR complexo)
┌───────────────────────┐       ┌───────────────────────┐
│     DeepSeek V3/R1    │       │   Claude 3.5 Sonnet   │
│ (Extração & Tradução) │       │ (Casos Especiais PDF) │
└───────────────────────┘       └───────────────────────┘
```

* **DeepSeek V3 / R1 como Provedor Primário:** Manipula 95%+ das extrações de dados, tradução de histórico fabril e estruturação em JSON.
* **Claude 3.5 Sonnet como Fallback:** Ativado automaticamente apenas quando o PDF contiver layouts visuais altamente fragmentados ou digitalizações em baixa resolução.
* **Resultado:** Redução de custo fixo/variável permitindo margens de lucro de **>85% no SaaS**.

---

## 🎨 2. UX ULTRA-SMOOTH: FRICÇÃO ZERO NO PREENCHIMENTO MOBILE

Dado que **80% dos candidatos dekassegui preenchem o formulário pelo smartphone**, o formulário clássico de 130 campos foi dividido em um **Wizard Stepper de 5 Micro-Etapas**:

```
[Etapa 1: Quem é Você?] ➔ [Etapa 2: Experiência Japão] ➔ [Etapa 3: Uniforme & Saúde] ➔ [Etapa 4: Vagas & Desejos] ➔ [Etapa 5: Revisão]
```

### **Melhorias de Redução de Fricção:**
1. **Preenchimento Automático por IA em 3 Segundos:** O candidato faz o upload do currículo ou foto e o DeepSeek preenche 60-70% dos campos de identificação e histórico.
2. **Seletor Visual de EPIs e Uniforme:** Em vez de digitar números, seletores visuais em formato de pílulas interativas (Chips) para tamanho de calçado (ex: 25cm, 26cm, 27cm) e cintura/camisa.
3. **Autocomplete de Províncias Japonesas com Kanji + Romaji:** Sistema de busca inteligente para províncias (`Aichi / 愛知県`, `Shizuoka / 静岡県`, `Mie / 三重県`, `Gunma / 群馬県`) e cidades industriais.
4. **Salva-Vidas de Conexão (Offline Autosave):** Dados salvos localmente no `localStorage` a cada tecla digitada; se a conexão cair no celular, nada é perdido.

---

## 🔒 3. SEGURANÇA BANCÁRIA E LGPD + APPI (JAPÃO)

### **Camadas de Proteção de Dados:**
1. **Criptografia Colunar PostgreSQL (`pgcrypto`):**
   - Dados de saúde (Bloco B: histórico cirúrgico, medicamentos, alergias) são criptografados no banco utilizando chaves assimétricas `pgp_sym_encrypt(data, key)`.
2. **Rastreabilidade Inalterável (`audit_log`):**
   - Registra qualquer visualização de PII sensível com IP, User-Agent, Timestamp e User_ID.
3. **Multi-Tenancy RLS (Row Level Security):**
   - `ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;`
   - Política `CREATE POLICY tenant_isolation ON candidates USING (organization_id = current_setting('app.current_organization_id'));`
4. **Consentimento Bilíngue Internacional (Brasil LGPD + Japão APPI):**
   - O termo de consentimento abrange a Lei Geral de Proteção de Dados do Brasil e a **APPI (Act on the Protection of Personal Information)** do Japão para transferência internacional segura de dados.

---

## 🌐 4. ARQUITETURA LANDING PAGES B2C (SEO / GEO-SEO) E PORTAL B2B

### **Estrutura de Páginas de Captação:**

```
selectsysjobs.com/
├── /                                   (Landing Page B2B SaaS para Empreiteiras)
├── /vagas-japao                        (Hub B2C de Carreiras no Japão)
│   ├── /aichi                          (Geo-SEO: Vagas de Trabalho em Aichi-ken)
│   │   └── /automecanica-toyota        (Vaga Específica + Schema Google Jobs)
│   ├── /shizuoka                       (Geo-SEO: Vagas de Trabalho em Shizuoka)
│   └── /nikkei-nissei                  (Página Temática: Elegibilidade Nikkei)
```

* **Google Jobs Schema (`JobPosting` JSON-LD):** Cada vaga publicada pela FUJIARTE ou outras empreiteiras gera automaticamente dados estruturados indexados pelo Google Jobs, atraindo milhares de candidatos orgânicos sem custo de anúncios.
* **Página Institucional B2B para Empreiteiras:** Apresenta o software como a solução definitiva contra planilhas Excel, destacando a exportação fiel e o compliance LGPD.

---

## 🌐 5. INTERNACIONALIZAÇÃO TRILÍNGUE (PT / JA / EN)

* **Integração com `next-intl`:**
  - Suporte completo aos locales `pt-BR`, `ja-JP` e `en-US`.
* **Tradução Automática de Histórico com DeepSeek:**
  - Candidato digita no Brasil: *"Trabalhei 3 anos na fábrica da Honda em Hamamatsu operando prensa."*
  - O sistema gera automaticamente no One-Pager para o Japão: *"浜松市のホンダ工場にてプレス機オペレーターとして3年間勤務。"*

---

## 📊 6. PAINEL DE MÉTRICAS DUPLO: SUPERADMIN (SAAS) vs ADMIN (CLIENTE FUJIARTE)

### **A. Painel SuperAdmin (Dono do SaaS - Visão Rafael Maldivas)**
- **Métricas Financeiras & Negócio:**
  - MRR (Receita Recorrente Mensal) e Churn de Organizações.
  - Total de Candidaturas processadas em toda a rede.
- **Gestão de Custos de Infraestrutura:**
  - Consumo diário/mensal de Tokens DeepSeek (R$ economizado vs Claude).
  - Volume de envios de WhatsApp via Meta Cloud API.
- **Controle de Feature Flags:**
  - Ativar/Desativar módulos por Tenant (ex: Módulo Garoon, Importação IA, WhatsApp).

### **B. Painel Admin da Empreiteira (Visão FUJIARTE)**
- **Funil Dekassegui Operacional (11 Etapas):**
  - Contagem de candidatos em cada fase (Candidatura ➔ Triagem ➔ Entrevista ➔ COE ➔ Visto ➔ Embarque).
- **Métricas de Fricção & Conversão:**
  - Tempo médio de preenchimento do formulário (ex: 8.2 min).
  - Taxa de conversão por Agência Indicadora parceira.
- **Alertas de SLA:**
  - Candidatos retidos em processo de COE há mais de 15 dias.

---

## 🗺️ 7. ROADMAP ATUALIZADO DE IMPLEMENTAÇÃO

```
Semana 1-2: Setup DeepSeek Adapter + Schema RLS Multi-Tenant + Landing Pages SEO Base
Semana 3-4: Formulário Wizard Stepper (Mobile-First) + Importação de Currículo via IA DeepSeek
Semana 5-6: Motor de Triagem Auditável + Exportador Excel FUJIARTE 100% Fiel
Semana 7-8: Dashboards Operacionais (FUJIARTE) + Painel SuperAdmin (SaaS Owner)
Semana 9-10: Testes Pentest + Homologação Final FUJIARTE + Go-Live Comercial
```

---

<p align="center">
  <b>SelectSys Jobs V2</b> — <i>A Fundação de Elite para o Mercado Dekassegui.</i>
</p>
