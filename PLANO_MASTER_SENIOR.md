<style>
  @media print {
    .page-break { page-break-before: always; }
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
    h1, h2, h3 { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background-color: #f1f5f9; }
  }
</style>

# 📄 PLANO MASTER SÊNIOR DE EXECUÇÃO E VALIDAÇÃO SEMANAL
### **Projeto:** SelectSys Jobs — Automação do Funil Dekassegui
### **Cliente Homologador / Parceiro Pioneiro:** FUJIARTE Co., Ltd. / FUJIARTE Brasil
### **CTO & Responsável Técnico:** Rafael Maldivas
### **Data do Termo:** 06 de Agosto de 2026 | **Versão:** 1.0 (Oficial para Assinatura)

---

## 🏛️ 1. SUMÁRIO EXECUTIVO E OBJETIVOS
Este documento estabelece o **Plano Master Sênior de Engenharia, Implementação e Validação Semanal** do sistema **SelectSys Jobs** para a operação da **FUJIARTE**. 

O objetivo principal desta iniciativa é modernizar e acelerar a exportação de mão de obra do Brasil para o Japão, substituindo o processo manual baseado em planilhas pela plataforma SaaS inteligente, mantendo **100% de compatibilidade** com o formato tradicional de exportação em Excel (`白紙 FUJIARTE Ficha Cadastral Jun2024`).

### **Pilares do Compromisso Técnico:**
1. **Fidelidade Operacional Total:** A exportação de dados continuará gerando o arquivo `.xls` no layout exato e idêntico ao utilizado pela FUJIARTE.
2. **Triagem Automática Explicável (LGPD Art. 20):** Sem regras ocultas; cada decisão gera parecer técnico auditável com direito à revisão humana.
3. **IA na Periferia:** Utilização da IA (Anthropic Claude) exclusivamente para parsing inteligente de currículos e tradução — **jamais no veredito automatizado de aprovação do candidato**.
4. **Validação Client-Facing Semanal (Toda Segunda-Feira):** Entregas incrementais e testáveis em ambiente de staging dedicado para aprovação da diretoria da FUJIARTE.

---

<div class="page-break"></div>

## 📊 2. METAS E BENEFÍCIOS QUANTIFICADOS (KPIs FUJIARTE)

| Indicador Operacional | Cenário Atual (Planilha Manual) | Meta com SelectSys Jobs | Impacto Estimado |
|---|---|---|---|
| **Tempo de Preenchimento da Ficha** | ~25 a 30 minutos | **7 a 10 minutos** | Redução de **60-70%** no tempo inicial |
| **Taxa de Conclusão de Cadastro** | ~55% (alto abandono) | **> 80%** | Aumento de **25%** na retenção de candidatos |
| **Tempo de Análise Gerencial** | 4 a 6 horas/dia | **1 a 2 horas/dia** | Redução de **50%** no esforço da equipe |
| **Fidelidade do Layout Excel (.xls)** | Manual / Sujeito a erro | **100% Automático & Fiel** | Erro zero de formatação ou digitação |
| **Conformidade LGPD (Dados de Saúde)** | Risco em planilhas soltas | **Criptografia Colunar `pgcrypto`** | Conformidade legal 100% auditável |

---

## 🗓️ 3. CRONOGRAMA DE ENTREGAS E MARCOS DE VALIDAÇÃO (10 SEMANAS)

O projeto está estruturado em **4 Fases Sequenciais**, com encontros semanais fixos toda **Segunda-Feira** para homologação do cliente.

```
Semana:    1    2    3    4    5    6    7    8    9    10
Fase 0     [===]
Fase 1          [===========]
Fase 2                       [===============]
Fase 3                                            [=====]
Go-Live                                                 [★]
```

### 🔹 FASE 0: PREPARAÇÃO, ALINHAMENTO E SETUP (SEMANA 1)
* **Período:** 06/08/2026 a 10/08/2026
* **Objetivo:** Baseline técnica, alinhamento de escopo e homologação do ambiente de testes.
* **Entregável para Validação na Segunda-Feira (10/08):**
  - [x] Termo de Escopo Técnico e Plano Master assinado.
  - [x] Definição exata dos campos da ficha `FUJIARTE (Jun2024)` no schema dinâmico.
  - [x] Checklist de segurança e privacidade (LGPD Art. 5º e 11) aprovado.

---

### 🔹 FASE 1: PRÉ-PREENCHIMENTO DE CURRÍCULO VIA IA & MODELO FUJIARTE (SEMANAS 2 A 4)
* **Período:** 11/08/2026 a 31/08/2026
* **Objetivo:** Leitura automática de currículos (PDF/DOCX) para preenchimento dos ~130 campos da Ficha Cadastral FUJIARTE.

#### **Entregáveis Semanais:**
- **Segunda-Feira (17/08) — Entregável 1.1:** Endpoint API `/api/candidate/resume-import` e motor Claude de extração estruturada de dados (Nome, Nascimento, Histórico Japão/Brasil).
- **Segunda-Feira (24/08) — Entregável 1.2:** Interface do Candidato com botão "Importar Currículo", visualização de dados extraídos e edição antes de confirmar. Log de auditoria completo.
- **Segunda-Feira (31/08) — Entregável 1.3:** Suporte bilíngue (Português e Japonês), relatórios de precisão da IA (>85% de acerto) e bloqueio estrito de preenchimento automático para dados sensíveis de saúde (Bloco B).

---

<div class="page-break"></div>

### 🔹 FASE 2: DASHBOARD DE MÉTRICAS OPERACIONAIS E FUNIL DE TRIAGEM (SEMANAS 5 A 8)
* **Período:** 01/09/2026 a 28/09/2026
* **Objetivo:** Visibilidade executiva em tempo real para a diretoria da FUJIARTE sobre todo o funil de recrutamento e status de candidatos.

#### **Entregáveis Semanais:**
- **Segunda-Feira (07/09) — Entregável 2.1:** Visão geral do funil (11 Etapas / 17 Estados), métricas de tempo médio por etapa e identificação de gargalos de SLA (ex: atrasos em vistos COE).
- **Segunda-Feira (14/09) — Entregável 2.2:** Dashboard de Triagem: motivos detalhados de reprovação/aprovação, score de matching (0-100) por vaga industrial e exportação de relatórios em PDF/CSV.
- **Segunda-Feira (21/09) — Entregável 2.3:** Dashboard de Agências Indicadoras: métricas de conversão por parceiro de captação e alertas automáticos via WhatsApp/E-mail.
- **Segunda-Feira (28/09) — Entregável 2.4:** Painel Executivo com indicadores preditivos de sucesso e custo estimado por contratação.

---

### 🔹 FASE 3: SEGURANÇA, HOMOLOGAÇÃO E PRONTIDÃO COMERCIAL (SEMANAS 9 E 10)
* **Período:** 29/09/2026 a 12/10/2026
* **Objetivo:** Testes de estresse, auditoria de penetração e transição oficial para o ambiente de produção.

#### **Entregáveis Semanais:**
- **Segunda-Feira (05/10) — Entregável 3.1:** Testes de penetração (Pentest), validação dos mecanismos de backup/restore e auditoria de conformidade LGPD.
- **Segunda-Feira (12/10) — Entregável 3.2 (GO-LIVE):** Treinamento concluído das equipes operacionais da FUJIARTE e assinatura do Termo de Aceite Definitivo do Sistema.

---

## 🔒 4. GARANTIAS RIGOROSAS DE SEGURANÇA E PRIVACIDADE (LGPD)

A SelectSys Jobs garante que a arquitetura do sistema atende aos mais exigentes padrões internacionais de proteção de dados:

1. **Criptografia Colunar de Dados de Saúde (`candidate_health`):** Os dados contidos no Bloco B da Ficha FUJIARTE (histórico de cirurgias, medicamentos, alergias) são criptografados individualmente com a extensão `pgcrypto` do PostgreSQL.
2. **Audit Trail Inalterável (`audit_log`):** Cada leitura, exportação ou modificação em fichas de candidatos gera um registro de auditoria contendo: ID do Usuário, Timestamp exato, IP de origem e justificativa de acesso.
3. **Isolamento de Dados via RLS (Row Level Security):** Garantia em nível de banco de dados de que nenhuma informação da FUJIARTE poderá ser acessada por terceiros ou outras organizações no sistema.

---

<div class="page-break"></div>

## 🤝 5. COMPROMISSOS DO CTO E METODOLOGIA DE TRABALHO

Como responsável técnico e líder de arquitetura do **SelectSys Jobs**, me comprometo com:

* **Transparência Radical:** Apresentação quinzenal/semanal de relatórios de código, cobertura de testes unitários (>80%) e status do backlog.
* **Comunicação Imediata de Riscos:** Caso surja qualquer impedimento técnico ou operacional, a diretoria da FUJIARTE será notificada no mesmo dia com o devido plano de mitigação.
* **Garantia de Evolução:** Suporte e refinamentos contínuos durante todo o período de homologação.

---

## ✒️ 6. TERMO DE HOMOLOGAÇÃO E ACEITE DO PLANO

Pelo presente instrumento, as partes declaram ciência e acordo com os escopos, cronogramas, entregáveis e termos de validação estabelecidos neste **Plano Master Sênior**.

<br/><br/>

____________________________________________________  
**FUJIARTE Co., Ltd. / FUJIARTE Brasil**  
*Representante Legal / Diretoria Operacional*  
**Data:** ____ / ____ / 2026  

<br/><br/>

____________________________________________________  
**SelectSys Jobs**  
**Rafael Maldivas** — *CTO & Responsável Técnico*  
**Data:** 06 / 08 / 2026  

<br/><br/>

---
<p align="center">
  <i>SelectSys Jobs — Tecnologia de Alta Performance para o Ecossistema Dekassegui.</i>
</p>