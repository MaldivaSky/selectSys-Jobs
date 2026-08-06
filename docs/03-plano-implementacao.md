# 03 — Roadmap de Fases

> Visão macro. O detalhamento operacional do MVP está em [`05-escopo-mvp.md`](05-escopo-mvp.md) (escopo e critérios de aceite) e [`06-backlog-scrum.md`](06-backlog-scrum.md) (sprints, cerimônias, riscos).

---

## Fase 1 — MVP · 6 semanas · 140 h · R$ 1.200

**Critério de sucesso, único:** a FUJIARTE processa 10 candidaturas reais sem abrir o Excel, e a planilha exportada sai idêntica à atual.

| Sprint | Semana | Entrega |
|---|---|---|
| 0 | 1 | Ambiente no ar, login com 2FA, isolamento multi-tenant testado |
| 1 | 2 | Ficha FUJIARTE transcrita para schema; renderer dirigido por dados |
| 2 | 3 | Candidato preenche e envia pelo celular, com foto e consentimento |
| 3 | 4 | Painel: busca, ficha completa, mudança de status |
| 4 | 5 | **Exportação .xls fiel** + PDF + triagem automática |
| 5 | 6 | Agências, migração histórica, treinamento, go-live |

**Escopo fechado.** 14 itens dentro, 14 itens explicitamente fora — ver [doc 05 §1](05-escopo-mvp.md).

---

## Fase 2 — Automação · 127 h · ~R$ 5.100 *(orçamento separado)*

Só é proposta **depois** do MVP rodando em produção, quando o cliente já viu valor.

| Módulo | h | Preço | R$/hora |
|---|---:|---:|---:|
| **WhatsApp Cloud API** — aproveitando o Tech Provider já construído | **22** | **R$ 1.200** | **R$ 55** |
| Kanban drag-and-drop + dashboard com os 12 indicadores | 20 | R$ 700 | R$ 35 |
| Vagas + matching de compatibilidade explicável | 30 | R$ 1.200 | R$ 40 |
| Alertas automáticos (entrevista, COE, visto, viagem) | 15 | R$ 500 | R$ 33 |
| Integração Garoon (REST API) | 25 | R$ 1.000 | R$ 40 |
| Painel em japonês (i18n completo) | 15 | R$ 500 | R$ 33 |

**A Fase 2 paga R$ 40/hora contra os R$ 15 do MVP.** Ela não é um extra — é a correção de rota do projeto. O módulo WhatsApp encolheu de 43 h para 22 h porque o app na Meta e o Embedded Signup já existem: ver [doc 08](08-whatsapp-tech-provider.md).

Nesta fase entram os **custos variáveis repassados** (WhatsApp e IA) — ver [doc 07 §5](07-fluxo-de-caixa.md).

---

## Fase 3 — Escala e produto B2C · a definir

Só faz sentido a partir do 3º cliente.

- Portal do candidato (acompanhamento do próprio processo)
- **Compatibilidade Premium (B2C)** — relatório de aderência às vagas abertas + plano de ação, com checkout PIX
- Gestão de vistos e COE com prazos e checklists
- Editor visual de regras e de formulário (o cliente configura sozinho)
- Assinatura eletrônica de documentos
- Onboarding self-service de nova organização

---

## Marcos e aceite

| Marco | Quando | Critério objetivo |
|---|---|---|
| M0 — Fundação | Fim S0 | Staging no ar; teste de isolamento entre tenants passando |
| **M1 — MVP** | **Fim S5** | **10 candidaturas reais processadas sem Excel; exportação bate célula a célula com o gabarito** |
| M2 — Fase 2 | +8 semanas | WhatsApp operando; 2ª organização criada sem deploy |
| M3 — Escala | — | 4 clientes ativos (meta comercial do ano 1) |

---

## Riscos de programa

Riscos por sprint estão em [doc 06 §6](06-backlog-scrum.md). No nível de programa, três importam:

| Risco | Impacto | Mitigação |
|---|---|---|
| **Escopo crescer sem revisão de preço** | A R$ 1.200 por 140 h, cada 10 h extras derruba a hora de R$ 15 para R$ 14 | Escopo em anexo contratual. Pedido novo = orçamento novo. Sem exceção |
| **Parar no cliente #1** | 140 h por R$ 15/h e um produto sem mercado | Meta escrita: 4 clientes até Jul/2027 |
| **Exportação .xls não ficar fiel** | Cliente não adota; o projeto inteiro perde sentido | Atacar na Sprint 4 com teste de snapshot; Plano B (.xlsx) decidido na quarta |
