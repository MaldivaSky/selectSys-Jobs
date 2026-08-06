# 09 — Roteiro de Ativação: o que só você pode fazer

> Tudo aqui é tarefa **humana**. Nenhum agente (Claude, Gemini, Hermes) resolve — não por limitação técnica, mas porque exige assinatura jurídica, identidade verificada, meio de pagamento, relacionamento humano ou decisão com consequência financeira.

---

## 1. A decisão tomada: dois marcos, D+21 e D+28

Os 96 SP (140 h) não cabiam em 21 dias — daria 6,7 h/dia sem folga, ignorando as ~10 h que a burocracia deste documento consome do seu tempo e o MiseOn rodando em paralelo.

**Decisão: escopo integral mantido, entrega em dois marcos.**

| Marco | Quando | O que o cliente recebe | Ritmo |
|---|---|---|---|
| **M1 — Aceite funcional** | **D+21** | Sistema completo em produção, navegável, com dados de demonstração. Ele testa como se fosse real | 3,4 SP/dia (~5 h/dia) |
| **M2 — Go-live** | **D+28** | Planilhas históricas migradas, treinamento feito, candidatos reais entrando | 7 dias para migração, treinamento e ajustes da UAT |

### ⚠️ Correção: renegociar a data sozinha não fecha a conta

Quando apresentei as opções, descrevi a C como "mantém os 96 SP a 3,4 SP/dia". A aritmética de 140 h ÷ 28 dias está certa, mas ela esconde uma coisa: **a semana 4 é migração, treinamento e UAT — não é semana de construção.** O código precisa estar pronto em D+21, não em D+28.

O número real:

| | |
|---|---:|
| Escopo a construir até M1 (96 SP − go-live − agências) | ~84 SP ≈ 122 h |
| Dias até M1 | 21 |
| **Se trabalhar 7 dias por semana** | **5,8 h/dia, sem folga** |
| **Se trabalhar 5 dias por semana** | **8,1 h/dia** |

Contra a velocidade planejada no [doc 06](06-backlog-scrum.md) (16 SP/semana, ~23,5 h). Você precisa de ~28 SP/semana. **É 75% acima da linha de base, em paralelo ao MiseOn.**

**Não estou desfazendo sua decisão — os dois marcos continuam certos, pelos motivos abaixo.** Mas eles compram janela de validação, não horas de programação. Para o ritmo fechar, some uma destas:

| | Efeito |
|---|---|
| **Deslocar o módulo de agências (7 SP) para a semana 4** ✅ | Construção cai para ~77 SP. Ele não precisa do link de agência no dia 21 — precisa no go-live. **Custo zero para o cliente** |
| Deslocar também a exportação PDF (5 SP) para a Fase 2 | Construção cai para ~72 SP ≈ 5 h/dia. O PDF é conveniência; o Excel é o que trava a operação |
| Assumir ~8 h/dia em dias úteis | Sem corte, mas sem margem para imprevisto |

**Recomendo as duas primeiras.** Elas devolvem o ritmo para ~5 h/dia sem que o cliente perceba diferença em M1 — e o PDF vira item da proposta da Fase 2.

**Por que os dois marcos são a decisão certa mesmo assim:**

- **A semana extra não é folga — é a UAT.** Todo software entregue precisa de uma janela entre "funciona" e "está em produção com dados reais". Espremer os 21 dias eliminava essa janela, e ela apareceria de qualquer jeito, só que como atraso não combinado.
- **Reduz o risco jurídico.** Dado real de candidato só entra no dia 28, com o DPA assinado e o backup já testado. Nada de LGPD acontece antes da hora.
- **O cliente valida antes de comprometer a operação.** Ele passa uma semana clicando no sistema real antes de mandar candidato de verdade para lá. Se algo estiver errado, descobre-se com dado fictício.

### O que você precisa fazer com esta decisão — hoje

**Combine as duas datas na assinatura do contrato, por escrito.** Não no dia 20.

Texto para o contrato e para o e-mail ao cliente:

> **M1 — 〈data D+21〉:** entrega do sistema em ambiente de produção, funcional e navegável, para validação do cliente com dados de demonstração.
> **M2 — 〈data D+28〉:** migração dos dados históricos, treinamento da equipe e liberação para uso com candidatos reais. **O aceite formal e a 2ª parcela ocorrem em M2.**

E ao cliente, em uma frase:

> *"Entrego o sistema funcionando no dia 21 para o senhor testar, e liberamos para candidatos reais no dia 28, depois de migrar o histórico e treinar a equipe. Assim o senhor valida antes de comprometer a operação."*

**Prazo combinado com antecedência é profissionalismo. Prazo anunciado no dia 20 é atraso.**

---

## 2. Por que a ordem importa: a burocracia é o caminho crítico

Em 21 dias, esperar aprovação de terceiro é o que mata o prazo — não a velocidade de código. Estas quatro correntes são **seriais** e precisam começar no **dia 1**:

```
CORRENTE 1 — infraestrutura   (a mais perigosa: 2 a 5 dias de espera externa)
  cartão internacional habilitado → conta Hetzner → verificação de identidade
    → VPS no ar → deploy de teste

CORRENTE 2 — domínio          (serial, ~1 a 2 dias)
  registrar domínio → apontar nameservers para Cloudflare → propagação DNS
    → TLS ativo → verificação de domínio no Resend → e-mails funcionando

CORRENTE 3 — jurídico         (depende do cliente; sem isto, não se escreve código)
  minuta → revisão do cliente → assinatura do contrato + DPA

CORRENTE 4 — insumos          (historicamente o mais lento)
  pedir ao cliente: ficha real anonimizada, planilhas históricas, logo, acessos
```

**A corrente 1 é a que surpreende.** Hetzner faz checagem antifraude em conta nova e pode pedir documento de identidade — 1 a 3 dias úteis. Se você criar a conta no dia 12, descobre o problema no dia 15 e não entrega.

---

## 3. D-0 — antes de escrever a primeira linha

| # | Tarefa | Por que só você | Espera | Custo |
|---|---|---|---|---:|
| 1 | **Escolher a opção A, B ou C** (§1) e comunicar ao cliente | Decisão comercial com consequência de prazo e reputação | — | — |
| 2 | **Contrato + DPA assinados**, com o [doc 05](05-escopo-mvp.md) anexado como escopo | Assinatura jurídica. Um agente redige a minuta; assinar é ato pessoal | 2–5 dias (cliente) | — |
| 3 | Confirmar as **cláusulas inegociáveis**: PI sua, escopo fechado, repasse de custos variáveis, sem exclusividade | Se cair a de propriedade intelectual, o projeto perde a razão de existir | — | — |
| 4 | **Receber os 50% adiantados (R$ 600)** | Movimentação financeira | 1–3 dias | +R$ 600 |
| 5 | **Reunião de descoberta** — as 8 perguntas do [doc 01 §6](01-analise-documentos.md) | Conversa humana, com fuso do Japão | 1 h | — |
| 6 | **Cronometrar o processo atual** acompanhando 1 candidatura ponta a ponta | Observação presencial. Vira o número de ROI da sua próxima proposta | 1–2 h | — |

> **Não comece a codar antes do item 2.** Sem contrato assinado, você está trabalhando de graça com risco de escopo infinito.

---

## 4. Dia 1 — disparar tudo que tem espera

Faça tudo isto no **mesmo dia**, em paralelo. São ~3 horas suas.

### Infraestrutura

| # | Tarefa | Detalhe que costuma travar | Custo |
|---|---|---|---:|
| 7 | **Habilitar compras internacionais no cartão** e conferir limite | Banco brasileiro bloqueia a primeira cobrança internacional por padrão. Ligue antes. IOF incide | — |
| 8 | **Criar conta na Hetzner** e cadastrar o cartão | ⚠️ Conta nova pode cair em verificação de identidade (1–3 dias úteis). **Faça hoje, não na semana 2** | — |
| 9 | **Subir o VPS CPX11** (Ashburn/US) e rodar um deploy de teste | Só para provar que a conta está liberada e o cartão passou | R$ 28,50/mês |
| 10 | **Registrar o domínio** no Registro.br — pague por **PIX**, não boleto | Boleto leva 1–3 dias para compensar e trava a corrente inteira | R$ 40/ano |
| 11 | **Criar conta na Cloudflare** e apontar os nameservers no Registro.br | Propagação leva de 1 h a 24 h | R$ 0 |
| 12 | **Ativar o R2** na Cloudflare | Exige cartão cadastrado mesmo no plano gratuito | R$ 0 |
| 13 | **Criar conta no Resend** e verificar o domínio | Depende do item 11 estar propagado | R$ 0 |

### Contas de trabalho

| # | Tarefa | Observação |
|---|---|---|
| 14 | Repositório privado no GitHub | Um agente escreve o código; criar conta e definir visibilidade é seu |
| 15 | **Gerenciador de senhas** + **app autenticador (TOTP)** no celular | Você vai gerar credenciais de produção. Não guarde em arquivo de texto |
| 16 | Contas Sentry e Better Stack | Free tier |

### Fiscal e insumos

| # | Tarefa | Espera |
|---|---|---|
| 17 | **Agendar consulta avulsa com contador** — emissão de NF sob CNAE 8219-9/99 e teto do MEI somando MiseOn | Agenda: até 1 semana. Agende hoje |
| 18 | **Pedir ao cliente, por escrito**: 1 ficha real preenchida (anonimizada), planilhas históricas, logo em alta, cores da marca | Historicamente o mais lento. Peça no dia 1 e cobre no dia 4 |
| 19 | **Perguntar se o Garoon é cloud ou on-premise** | Não bloqueia o MVP, mas define o que você promete na Fase 2 |

---

## 5. Durante o desenvolvimento

| # | Quando | Tarefa | Por que só você |
|---|---|---|---|
| 20 | Toda sexta, 30 min | **Sprint Review com o cliente presente** | É o mecanismo que impede o atraso de ficar invisível. Não substitua por e-mail |
| 21 | A cada pedido novo | **Dizer não ao escopo extra** — *"registro no backlog da Fase 2 e orço"* | Nenhum agente protege sua margem. Só você |
| 22 | Dia 4 | Cobrar os insumos do item 18 se não chegaram | Relacionamento |
| 23 | Semana 2 | **Testar a restauração do backup** — não só conferir que ele existe | Backup não testado não é backup |
| 24 | Quando surgir | **Decidir o Plano B da exportação .xls** ([doc 06](06-backlog-scrum.md), sprint 4) | Decisão técnica com impacto no prazo |
| 25 | Contínuo | **Não usar dado real de candidato** antes do DPA assinado | Responsabilidade legal sua |

---

## 6. M1 — Aceite funcional (D+21)

| # | Tarefa | Por que só você |
|---|---|---|
| 26 | **Demonstração ao vivo do sistema em produção** — o roteiro é o mesmo do protótipo, agora com o software real | Presença humana. É o momento em que ele vê a exportação `.xls` saindo idêntica |
| 27 | **Entregar acesso de teste ao cliente** e pedir que ele use durante a semana | Relacionamento — e ele precisa sentir que está no controle |
| 28 | **Registrar por escrito** o que ele apontar na semana de UAT | Vira o backlog dos dias 22–27. **Separe correção de pedido novo:** correção é sua, pedido novo é Fase 2 |
| 29 | ⚠️ **Não migrar dado real ainda** | Dado real só entra em M2, com DPA assinado e backup testado |

## 7. Dias 22 a 27 — janela de UAT

| # | Tarefa | Por que só você |
|---|---|---|
| 30 | **Triar o que voltou da UAT**: bug ou escopo novo? | Decisão comercial. Cada item aceito fora do doc 05 derruba sua hora |
| 31 | **Testar a restauração do backup** com o banco já no formato final | Backup não testado não é backup |
| 32 | **Preparar as planilhas históricas** — conferir se estão na versão Jun/2024 | Se houver ficha em versão antiga, o mapeamento muda |

## 8. M2 — Go-live (D+28)

| # | Tarefa | Por que só você |
|---|---|---|
| 33 | **Migrar as planilhas históricas** — conferir uma amostra manualmente | O agente importa; validar que os dados chegaram certos é julgamento humano |
| 34 | **Treinamento de 2 h com o cliente, gravado** | Presença humana. Grave: vira material para o cliente #2 |
| 35 | **Checklist de aceite assinado** | Formaliza a entrega e libera a 2ª parcela |
| 36 | **Emitir a NF e receber os R$ 600 restantes** | — |
| 37 | **Cobrar as contrapartidas do preço Fundador**: autorização de uso da marca, 3 indicações por escrito, depoimento em vídeo | É o que transforma R$ 1.200 em investimento. Se não cobrar agora, não cobra mais |

---

## 9. Depois do go-live — o que decide se o projeto valeu

| # | Prazo | Tarefa |
|---|---|---|
| 38 | Semana 1 pós-go-live | **Cobrar as 3 indicações** e agendar as conversas |
| 39 | Mês 1 | Propor a **Fase 2** ([doc 08](08-whatsapp-tech-provider.md)) — R$ 5.100, R$ 40/h contra os R$ 15 do MVP |
| 40 | Contínuo | **Meta escrita: 4 clientes até Jul/2027.** Sem isso, foram 140 h por R$ 15/hora |
| 41 | Quando a Meta aprovar | Verificar se o App Review cobre os escopos do SelectSys ou exige review adicional |

---

## 10. O que os agentes fazem por você — delegue isto

Para você gastar suas horas apenas nos itens acima:

| Delegue | Não delegue |
|---|---|
| Todo o código, testes, migrations | Rodar comando destrutivo em produção sem ler |
| **Minuta** do contrato e do DPA | Assinar, negociar, aceitar alteração |
| Transcrever as ~130 perguntas da ficha para JSON | Conferir se a transcrição bate com o papel |
| Configuração do Coolify, Docker, CI/CD | Criar contas, cadastrar cartão, resolver verificação de identidade |
| Roteiro do treinamento e manual em PDF | Dar o treinamento |
| Script de migração das planilhas | Validar a amostra migrada |
| Redigir o e-mail de cobrança de insumos | Enviar e cobrar |
| Análise de qual plano de VPS cabe | Decidir gastar |

**A regra:** se exige assinatura, senha, cartão, identidade, presença ou a palavra "eu aceito" — é sua. Todo o resto, delegue.

---

## 11. O que mata os dois marcos

| Risco | Sinal de alerta | O que fazer |
|---|---|---|
| **Conta Hetzner em verificação** | Sem VPS no ar até o dia 3 | Plano B: Contabo ou DigitalOcean com cartão já aprovado |
| **Boleto do domínio não compensou** | DNS não propaga até o dia 3 | Pague por PIX no dia 1 |
| **Cliente não manda a ficha real** | Nada recebido até o dia 4 | Trabalhe a partir do `.xls` em branco que você já tem e valide depois |
| **Contrato não assinado** | Passou o dia 5 | **Pare.** Não codifique sem contrato |
| **Escopo cresce na Review** | Qualquer pedido fora do doc 05 | *"Fase 2, orço à parte"* — sem exceção |
| **Exportação .xls não fica fiel** | Dia 15 sem funcionar | Plano B: converter o template para `.xlsx` |
| **UAT vira lista de pedidos novos** | Mais de 3 itens fora do doc 05 nos dias 22–27 | Aceite as correções, orce o resto. **A semana de UAT não é semana de escopo grátis** |
| **Cliente some na semana de UAT** | Sem retorno até o dia 25 | Vá para o go-live no dia 28 com o que foi validado em M1 e registre por e-mail |
| **Você adoece** | 2 dias parado | Comunique na hora e replaneje. Não compense em fim de semana |

---

## 12. Resumo de uma tela

**Hoje:** combine **M1 = D+21** e **M2 = D+28** por escrito · mande a minuta do contrato · peça os insumos ao cliente.

**Dia 1, em paralelo:** cartão internacional → Hetzner → VPS · domínio por PIX → Cloudflare → Resend · agendar contador.

**Regra do dia 1:** *tudo que depende de terceiro começa hoje, mesmo que você só vá usar na semana 3.*

**Não codifique antes do contrato assinado.**

**Dado real de candidato só no dia 28** — não antes, e só com DPA assinado e backup testado.

**No go-live, cobre as 3 indicações.** É o que decide se este projeto foi um investimento ou 140 horas por R$ 15.
