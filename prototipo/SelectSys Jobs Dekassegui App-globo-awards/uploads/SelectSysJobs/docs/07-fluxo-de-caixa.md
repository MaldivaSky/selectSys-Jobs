# 07 — Fluxo de Caixa Mês a Mês

Premissas: US$ 1 = R$ 5,50 · assinatura R$ 150/mês · implantação R$ 1.200 (50% na assinatura do contrato, 50% na entrega) · início em **Ago/2026** · entrega no **3º mês**.

---

## 1. Ano 1 — mês a mês

| Mês | Evento | Entradas | Saídas | Saldo do mês | Acumulado |
|---|---|---:|---:|---:|---:|
| **M1** Ago/26 | Contrato assinado · Sprints 0–2 · VPS + domínio contratados | R$ 600,00 | R$ 74,20 | **+R$ 525,80** | R$ 525,80 |
| **M2** Set/26 | Sprints 3–5 · UAT · go-live | — | R$ 34,20 | −R$ 34,20 | R$ 491,60 |
| **M3** Out/26 | **Entrega aceita** · 2ª parcela · 1ª mensalidade | R$ 750,00 | R$ 34,20 | **+R$ 715,80** | R$ 1.207,40 |
| **M4** Nov/26 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.323,20 |
| **M5** Dez/26 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.439,00 |
| **M6** Jan/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.554,80 |
| **M7** Fev/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.670,60 |
| **M8** Mar/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.786,40 |
| **M9** Abr/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 1.902,20 |
| **M10** Mai/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 2.018,00 |
| **M11** Jun/27 | Operação | R$ 150,00 | R$ 34,20 | +R$ 115,80 | R$ 2.133,80 |
| **M12** Jul/27 | Operação · renovação do domínio | R$ 150,00 | R$ 74,20 | +R$ 75,80 | **R$ 2.209,60** |
| | **Totais** | **R$ 2.550,00** | **R$ 490,40** | | **R$ 2.059,60** |

> **Você nunca fica no vermelho.** A entrada de R$ 600 na assinatura do contrato cobre a infraestrutura de todo o primeiro ano. Isso não é detalhe — é o que permite não usar dinheiro pessoal no projeto.

**Por que cobrar 50% adiantado é inegociável:** além do caixa, é o filtro de seriedade. Cliente que não paga R$ 600 para começar também não vai participar das Reviews semanais.

---

## 2. Anos 2 e 3 — regime permanente

| | Ano 2 | Ano 3 |
|---|---:|---:|
| Assinaturas (12 × R$ 150) | R$ 1.800,00 | R$ 1.800,00 |
| (−) Infraestrutura + domínio | R$ 450,40 | R$ 450,40 |
| **Lucro** | **R$ 1.349,60** | **R$ 1.349,60** |
| Horas de manutenção | 12 h | 12 h |
| **Valor por hora** | **R$ 112,47** | **R$ 112,47** |

**Acumulado em 3 anos:** R$ 4.758,80 de lucro sobre 164 horas → **R$ 29,02/hora**.

---

## 3. O cenário que muda tudo: mais clientes

O código e o VPS já estão pagos. Cada cliente adicional custa **R$ 0 de infraestrutura** e **~25 horas** de implantação (configurar a ficha dele, ajustar regras, trocar logo, treinar).

| Clientes | Receita ano | Custo infra | Lucro ano | Horas | **R$/hora** |
|---:|---:|---:|---:|---:|---:|
| 1 | R$ 2.550 | R$ 490 | R$ 2.060 | 140 | R$ 15 |
| 2 | R$ 5.550 | R$ 490 | R$ 5.060 | 165 | R$ 31 |
| 3 | R$ 8.550 | R$ 490 | R$ 8.060 | 190 | R$ 42 |
| **4** | **R$ 11.550** | **R$ 490** | **R$ 11.060** | **215** | **R$ 51** ✅ |
| 5 | R$ 14.550 | R$ 640 * | R$ 13.910 | 240 | R$ 58 |
| 8 | R$ 23.550 | R$ 1.100 * | R$ 22.450 | 315 | R$ 71 |

\* A partir do 5º cliente, upgrade do VPS para CPX21 (R$ 54/mês) e depois CPX31 (R$ 90/mês).

**Com 8 clientes você faturaria R$ 23.550/ano — ainda 29% do teto do MEI (R$ 81.000).** Só precisaria migrar para ME lá pelo 25º cliente. Isso valida a decisão de ficar no MEI por enquanto.

---

## 4. Quando o VPS precisa crescer

| Gatilho | Ação | Novo custo/mês | Impacto na margem |
|---|---|---:|---|
| ≤ 4 organizações · ≤ 400 candidaturas/mês | CPX11 (atual) | R$ 34,20 | Base |
| 5–10 organizações · até 1.000 candidaturas | CPX21 (3 vCPU, 4 GB) | R$ 54,00 | −R$ 20/mês, diluído em 5+ assinaturas |
| 10–25 organizações | CPX31 (4 vCPU, 8 GB) | R$ 90,00 | Irrelevante frente à receita |
| Armazenamento > 10 GB no R2 | US$ 0,015/GB | ~R$ 0,08/GB | ~R$ 4/mês aos 50 GB |
| Banco > 20 GB | Migrar para Postgres gerenciado | ~R$ 140 | Só faz sentido acima de 15 clientes |

> **Restrição operacional do CPX11 (2 GB de RAM):** builds do Next.js **nunca** rodam no VPS — são feitos no GitHub Actions e o VPS só recebe a imagem Docker pronta. Em runtime: Postgres com `shared_buffers` em 512 MB, Next.js standalone (~200 MB), worker pg-boss (~150 MB), swap de 2 GB. Total ~1,5 GB. Cabe, mas sem folga para descuido. **Se você tentar buildar no servidor, ele morre por OOM.**

---

## 5. Custos variáveis da Fase 2 — quando entrarem

Não estão no MVP. Quando o WhatsApp e a IA forem contratados, entram como **repasse ao cliente**, com relatório mensal.

| Volume mensal | WhatsApp (utility) | IA (Haiku 4.5) | Total repassado |
|---|---:|---:|---:|
| 50 candidaturas · 200 msgs | R$ 8,80 | R$ 2,50 | **R$ 11,30** |
| 100 candidaturas · 400 msgs | R$ 17,60 | R$ 5,00 | **R$ 22,60** |
| 300 candidaturas · 1.200 msgs | R$ 52,80 | R$ 15,00 | **R$ 67,80** |

⚠️ **O risco está no WhatsApp de marketing.** Templates "utility" (confirmação, lembrete, status) custam ~US$ 0,008. Templates de **marketing** custam ~US$ 0,0625 — **quase 8× mais**. Uma campanha de 2.000 mensagens de marketing custaria ~R$ 690 em um mês.

**Duas proteções, ambas obrigatórias:**
1. Cláusula de repasse no contrato (texto no [doc 04 §3](04-modelo-comercial-e-fiscal.md))
2. **Limite técnico configurável no sistema** — teto mensal de mensagens por organização, que bloqueia envios acima do contratado e avisa o administrador

---

## 6. Comparativo: o teto que você definiu vs. o realizado

| | Teto definido | Realizado | Folga |
|---|---:|---:|---:|
| Infraestrutura mensal | R$ 150,00 | **R$ 34,20** | **77%** |
| % da assinatura consumida por custo | 100% | **23%** | — |
| Margem líquida | 0% | **75%** | — |

A folga de R$ 116/mês não é para gastar. É o que permite:
- absorver variação cambial sem renegociar,
- fazer upgrade de VPS quando chegar o 5º cliente sem apertar a conta,
- e manter margem positiva mesmo se o cliente atrasar um pagamento.

---

## 7. Checklist financeiro antes de assinar

- [ ] Contrato prevê **50% na assinatura** (R$ 600) e 50% na entrega aceita
- [ ] Contrato prevê **repasse de custos variáveis** (WhatsApp, IA, storage extra)
- [ ] Contrato prevê **escopo fechado** com o [doc 05](05-escopo-mvp.md) anexado
- [ ] Contrato prevê **propriedade intelectual sua**, licença de uso para o cliente
- [ ] Contrato prevê **sem exclusividade** de mercado
- [ ] Contrato prevê **reajuste por IPCA a partir do 25º mês**
- [ ] Cartão internacional habilitado para Hetzner e Cloudflare (cobrança em USD/EUR)
- [ ] Contador consultado sobre a emissão da NF sob CNAE 8219-9/99
- [ ] Faturamento do MiseOn somado ao do SelectSys, monitorando o teto de R$ 81.000/ano
- [ ] Conta PJ separada da pessoal
- [ ] Meta escrita e datada: **4 clientes até Jul/2027**
