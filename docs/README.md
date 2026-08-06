# SelectSys Jobs — Documentação do Projeto

SaaS de recrutamento e gestão de processo dekassegui (Brasil → Japão), substituindo o fluxo atual de planilhas Excel + papel da FUJIARTE.

**Acordo:** implantação **R$ 1.200** + assinatura **R$ 150/mês** · MVP em **6 semanas / 140 horas**.

---

## Os números

| | |
|---|---:|
| Custo de infraestrutura | **R$ 34,20/mês** (teto definido: R$ 150) |
| Lucro mensal em regime | **R$ 112,47** (margem 75%) |
| Lucro ano 1 | **R$ 2.099,60** |
| Valor da sua hora — 1 cliente | **R$ 15** |
| Valor da sua hora — 4 clientes | **R$ 51** |
| Imposto incremental | **R$ 0** (DAS do MEI já pago pelo MiseOn) |

---

## Documentos

| Doc | Conteúdo |
|---|---|
| [01 — Análise dos Documentos](01-analise-documentos.md) | Leitura do infográfico, dissecação da ficha FUJIARTE (130 campos), riscos LGPD, perguntas de descoberta |
| [02 — Arquitetura e Stack](02-arquitetura-e-stack.md) | Stack, topologia, schema de formulário versionado, motor de regras, matching, segurança |
| [03 — Roadmap de Fases](03-plano-implementacao.md) | Visão macro das 3 fases e marcos de aceite |
| [04 — Modelo Comercial e Fiscal](04-modelo-comercial-e-fiscal.md) | **Fluxo de custos detalhado, cálculo de lucro, contrato, situação MEI** |
| [05 — Escopo do MVP](05-escopo-mvp.md) | **Anexo contratual: 14 itens dentro, 14 fora, user stories com critérios de aceite** |
| [06 — Backlog Scrum](06-backlog-scrum.md) | **Sprints, cerimônias, velocidade, métricas, riscos, burndown** |
| [07 — Fluxo de Caixa](07-fluxo-de-caixa.md) | **Mês a mês do ano 1, escalada de custo, cenários com 2–8 clientes** |
| [08 — WhatsApp Tech Provider](08-whatsapp-tech-provider.md) | **O ativo Meta já construído: o que muda no prazo, no preço e na venda** |
| [09 — Roteiro de Ativação](09-roteiro-de-ativacao.md) | **Checklist do que só você pode fazer: contrato, contas, cartão, contador, insumos — com prazos de espera** |
| [10 — Onboarding do Nicho](10-onboarding-do-nicho.md) | **Leia antes da reunião: o mundo dekassegui, o vocabulário, as funcionalidades em linguagem de negócio e o roteiro da conversa** |
| [schema.sql](schema/schema.sql) | DDL: multi-tenant, RLS, criptografia de dados sensíveis, retenção |
| [protótipo/](../prototipo/index.html) | Protótipo navegável de 8 telas para demonstração ao cliente |

---

## O produto em 60 segundos

**Vertical, não genérico.** Não compete com Gupy — entende COE, Koseki, Reentry Permit, província, empreiteira e geração nikkei.

**O diferencial de arquitetura:** formulário, regras de triagem e transições do funil são **dados versionados no banco**, não código. O cliente muda a regra de idade sem deploy, e você vende para a próxima empreiteira **configurando em vez de reescrever** — 25 horas em vez de 140.

**Stack:** Next.js 15 · PostgreSQL 16 + RLS · Drizzle · Cloudflare R2 · pg-boss · VPS Hetzner CPX11 + Coolify.

**O item que decide a venda:** exportação `.xls` idêntica à planilha que ele usa hoje. Sem isso, nada mais importa.

---

## As três coisas que determinam se este projeto vale a pena

1. **Contrato com propriedade intelectual sua e escopo fechado em anexo.** A R$ 1.200 por 140 h, você não está vendendo horas — está construindo um produto para revender. Se o contrato entregar o código, você trabalhou por R$ 15/hora e não ficou com nada. — [doc 04 §3](04-modelo-comercial-e-fiscal.md)

2. **4 clientes até Jul/2027.** É o número que leva sua hora de R$ 15 para R$ 51. O cliente #2 custa 25 horas e gera R$ 3.000 — R$ 120/hora. — [doc 04 §2.5](04-modelo-comercial-e-fiscal.md)

3. **50% na assinatura do contrato.** R$ 600 adiantados cobrem a infraestrutura do ano inteiro e filtram cliente que não leva o projeto a sério. — [doc 07 §1](07-fluxo-de-caixa.md)

---

## Ressalva fiscal registrada

Manter o MEI é a decisão financeiramente correta agora (imposto incremental zero, receita muito abaixo do teto de R$ 81.000). Mas nenhum CNAE do seu MEI cobre desenvolvimento de software, e não há como incluir. Emita sob **8219-9/99** descrevendo como *serviço de apoio administrativo*, confirme com contador antes da primeira NF, e migre para ME quando chegar ao 3º cliente ou a ~R$ 30.000/ano de software. — [doc 04 §4](04-modelo-comercial-e-fiscal.md)
