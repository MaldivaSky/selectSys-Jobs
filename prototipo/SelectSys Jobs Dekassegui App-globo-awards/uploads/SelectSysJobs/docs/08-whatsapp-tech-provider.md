# 08 — O ativo WhatsApp: Tech Provider na Meta

> Contexto: o Rafael já construiu uma integração como **Tech Provider** na Meta, pelo MiseOn. Status em 2026-08-06: **aguardando App Review**.

Isso não é um detalhe técnico. É o ativo mais valioso que ele traz para este projeto — e muda o plano em três frentes.

---

## 1. O que muda no produto

Sem Tech Provider, integrar WhatsApp em um SaaS multi-cliente é doloroso: **cada cliente** precisaria criar o próprio app na Meta, passar por review próprio, e você não teria acesso programático à conta dele.

Com Tech Provider + **Embedded Signup**, o fluxo vira:

```
Cliente clica "Conectar WhatsApp"  →  popup da Meta  →  ele autoriza com o Facebook Business dele
   →  o WABA aparece na sua plataforma, gerenciável por API
```

Onboarding de minutos, não de semanas. **Isso é o que torna o SelectSys vendável para o cliente #2, #3 e #4 sem trabalho manual seu.**

E há a proteção óbvia: API oficial. Concorrente que usa biblioteca não oficial (Baileys, whatsapp-web.js) tem o número do cliente banido mais cedo ou mais tarde — e quando isso acontece, é o número comercial da empreiteira que morre.

## 2. O que muda no cronograma

O trabalho pesado — app na Meta, App Review, fluxo de Embedded Signup — **já está feito**. O que falta para o SelectSys é integração de produto, não de plataforma:

| Tarefa | Sem Tech Provider | Com o ativo do MiseOn |
|---|---:|---:|
| App Meta + App Review | 15 h + espera fora do controle | **0 h** (feito) |
| Fluxo de Embedded Signup | 8 h | **2 h** (adaptar) |
| Registro e homologação de templates | 5 h | 5 h |
| Envio por transição de status + fila | 6 h | 6 h |
| Webhook de recebimento + histórico na ficha | 6 h | 6 h |
| Detector de não respondidos | 3 h | 3 h |
| **Total do módulo** | **~43 h** | **~22 h** |

**Verificar antes de prometer prazo:**

- [ ] O App da Meta do MiseOn pode servir ao SelectSys, ou o SelectSys precisa de app próprio? (Permissões `whatsapp_business_management`, `whatsapp_business_messaging` e `business_management` são por app — adicionar um novo caso de uso pode exigir novo review.)
- [ ] O App Review pendente cobre os escopos que o SelectSys precisa, ou só os do MiseOn?
- [ ] O faturamento das conversas cai na sua conta ou na linha de crédito do cliente? Isso decide se o WhatsApp é **repasse** ou **margem** (§4).
- [ ] Qual o volume de templates que você consegue manter aprovados por WABA?

## 3. Onde isso entra — e onde não entra

**Não entra no MVP.** A aprovação do App Review está fora do seu controle, e a homologação de cada template leva de horas a dias. Colocar isso no caminho crítico de um MVP de 6 semanas é apostar o prazo em algo que a Meta decide.

**Entra na venda, desde a primeira reunião.** É o diferencial mais concreto que você tem:

> *"A comunicação por WhatsApp vai na Fase 2, mas eu já tenho a integração oficial com a Meta pronta, aprovada como Tech Provider. Não vou usar gambiarra que derruba o número de vocês — e o senhor conecta a conta da FUJIARTE em dois minutos, sem precisar criar nada na Meta."*

**Entra como âncora da Fase 2.** É o módulo de maior valor percebido e agora o de melhor relação esforço/preço:

| Módulo Fase 2 | Horas | Preço sugerido | R$/hora |
|---|---:|---:|---:|
| **WhatsApp (com o ativo pronto)** | **22** | **R$ 1.200** | **R$ 55** |
| Kanban + dashboard | 20 | R$ 700 | R$ 35 |
| Vagas + matching | 30 | R$ 1.200 | R$ 40 |
| Alertas automáticos | 15 | R$ 500 | R$ 33 |
| Integração Garoon | 25 | R$ 1.000 | R$ 40 |
| Painel em japonês | 15 | R$ 500 | R$ 33 |
| **Fase 2 completa** | **127 h** | **R$ 5.100** | **R$ 40** |

**Reparou?** A Fase 2 paga R$ 40/hora contra os R$ 15 do MVP. **A Fase 2 não é um extra — é a correção de rota do projeto.** Feche o MVP sabendo disso.

## 4. Onde isso pode virar receita

Como Tech Provider, dependendo de como o faturamento das conversas está configurado, existem duas posições:

| Modelo | Quem paga a Meta | Sua posição |
|---|---|---|
| **Faturamento direto no cliente** | A linha de crédito do WABA do cliente | Você repassa; margem zero, risco zero |
| **Faturamento agregado na sua conta** | Você paga a Meta e cobra do cliente | Você pode aplicar markup — mas assume o risco de inadimplência |

Com o volume atual (~400 mensagens/mês, ~R$ 18), markup é irrelevante. **Isso só vira receita real a partir de 5–6 clientes**, quando o volume agregado justifica. Guarde a ideia; não gaste tempo com ela agora.

**O que importa hoje:** a proteção contra a conta de marketing. Template *utility* custa ~US$ 0,008; template de *marketing*, ~US$ 0,0625 — quase 8×. Duas defesas, ambas obrigatórias:

1. Cláusula de repasse no contrato ([doc 04 §3](04-modelo-comercial-e-fiscal.md))
2. **Teto mensal de mensagens por organização, configurável no sistema**, que bloqueia envios acima do contratado e avisa o administrador

## 5. O ponto que vale mais que este projeto

O Tech Provider não é um ativo do SelectSys. É um ativo **seu**, que já serve o MiseOn e agora serve o SelectSys — e servirá qualquer produto B2B que você fizer daqui em diante.

Isso significa duas coisas práticas:

- **Não custeie essas 25 horas no orçamento da FUJIARTE.** Elas já foram gastas e se distribuem por vários produtos. Cobrar o módulo por R$ 1.200 com 22 h de integração é justo para os dois lados.
- **Quando falar com o segundo e o terceiro cliente, lidere por aqui.** "Integração oficial com a Meta, aprovada, com onboarding em dois minutos" é uma frase que nenhum freelancer concorrente consegue dizer. Vale mais na venda do que qualquer detalhe de arquitetura.
