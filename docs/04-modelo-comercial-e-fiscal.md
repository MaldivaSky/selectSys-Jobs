# 04 — Modelo Comercial, Custos e Situação Fiscal

**Números fechados com o cliente:** implantação **R$ 1.200** (uma vez) + assinatura **R$ 150/mês**.
**Teto de infraestrutura definido pelo Rafael:** R$ 150/mês. **Realizado neste projeto: R$ 34/mês.**
**Regime:** MEI existente (CNPJ 63.310.253/0001-81), o mesmo do MiseOn.

> Premissas de câmbio usadas em todo o documento: **US$ 1 = R$ 5,50** · **€ 1 = R$ 6,30**. Se o câmbio variar 20%, o custo fixo varia ~R$ 7/mês. Não muda nenhuma decisão.

---

## 1. Onde entra cada real — o fluxo de custos

### 1.1 Custo fixo mensal (o que você paga todo mês, com ou sem uso)

| Item | Fornecedor | Cobrança | Custo/mês |
|---|---|---|---:|
| VPS CPX11 — 2 vCPU, 2 GB RAM, 40 GB SSD, Ashburn/US | Hetzner | Cartão, em USD (~$5,18) | R$ 28,50 |
| Backup automático diário (+20% do VPS) | Hetzner | Junto do VPS | R$ 5,70 |
| **Subtotal recorrente** | | | **R$ 34,20** |
| Domínio `.com.br` (R$ 40/ano) | Registro.br | Anual, boleto/PIX | R$ 3,33 |
| **Custo fixo total** | | | **≈ R$ 37,53** |

**Custo R$ 0,00** (free tier suficiente para 1 cliente e ~100 candidaturas/mês):

| Item | Limite grátis | Consumo estimado |
|---|---|---|
| Cloudflare — DNS, CDN, WAF, rate limit | Ilimitado no plano Free | — |
| Cloudflare R2 — armazenamento de fotos e documentos | 10 GB + egress zero | ~2 GB no ano 1 |
| Resend — e-mails transacionais | 3.000/mês | ~400/mês |
| GitHub Actions — build e deploy | 2.000 min/mês | ~200 min/mês |
| Sentry — monitoramento de erros | 5.000 eventos/mês | ~200/mês |
| Better Stack — uptime e logs | 10 monitores | 3 monitores |

### 1.2 Custo variável — **não entra no MVP e é repassado**

Estes serviços só existem na **Fase 2**. Quando entrarem, são **custo do cliente, repassado ao preço de custo**, com relatório mensal. Isso precisa estar escrito no contrato.

| Item | Preço unitário | Volume estimado | Custo/mês |
|---|---|---|---:|
| WhatsApp Cloud API — mensagem de template "utility" | ~US$ 0,008 / msg | 400 msgs | R$ 17,60 |
| IA (Claude Haiku 4.5) — tradução PT→JA + resumo do candidato | US$ 1 / US$ 5 por 1M tokens (in/out) | 100 candidaturas | R$ 5,00 |
| IA (Claude Sonnet 5) — se precisar de qualidade maior | US$ 3 / US$ 15 por 1M tokens | 100 candidaturas | R$ 13,00 |

> Custo por candidatura com IA: **R$ 0,05** no Haiku, **R$ 0,13** no Sonnet. É barato — mas **conversas de marketing no WhatsApp custam ~8× a mensagem utility.** Se o cliente disparar uma campanha, a conta pula. Por isso: repasse, não absorção.

### 1.3 Custos de operação do seu lado

| Item | Custo/mês | Observação |
|---|---:|---|
| DAS MEI | **R$ 0 incremental** | Já pago pelo MiseOn. O DAS é fixo, não cresce com faturamento |
| Contador | **R$ 0** | MEI não é obrigado a ter |
| ISS | **R$ 0 incremental** | Os R$ 5 de ISS já estão dentro do DAS |
| **Total** | **R$ 0** | |

**Esta é a maior vantagem de manter o MEI.** Como você já paga o DAS pelo MiseOn e ele é um valor fixo (não percentual), **o SelectSys entra com carga tributária incremental zero** — até o teto de R$ 81.000/ano. Uma migração para ME custaria R$ 150–300/mês de contador + ~6% de tributos, o que a esta receita seria um prejuízo. **Ficar no MEI agora está financeiramente correto** (a ressalva de CNAE está na §4).

---

## 2. Quanto você lucra — números exatos

### 2.1 Margem mensal em regime (após a entrega)

| | Valor |
|---|---:|
| Receita — assinatura | R$ 150,00 |
| (−) Infraestrutura | R$ 34,20 |
| (−) Domínio (rateio mensal) | R$ 3,33 |
| (−) Tributos incrementais | R$ 0,00 |
| **= Lucro líquido mensal** | **R$ 112,47** |
| **Margem** | **75,0%** |

### 2.2 Ano 1 — resultado consolidado

| | Valor |
|---|---:|
| Implantação (50% na assinatura + 50% na entrega) | R$ 1.200,00 |
| Assinaturas (9 meses × R$ 150 — entrega no 3º mês) | R$ 1.350,00 |
| **Receita bruta** | **R$ 2.550,00** |
| (−) Infraestrutura (12 × R$ 34,20) | R$ 410,40 |
| (−) Domínio (1 ano) | R$ 40,00 |
| **= Lucro ano 1** | **R$ 2.099,60** |

### 2.3 O número que importa: **R$ 15,00 por hora**

O MVP são **140 horas** de engenharia (detalhamento em [`06-backlog-scrum.md`](06-backlog-scrum.md)).

```
R$ 2.099,60 de lucro ÷ 140 horas = R$ 15,00/hora
```

Preciso ser direto: **R$ 15/hora está abaixo de um piso profissional.** Um desenvolvedor pleno freelance no Brasil cobra R$ 80–150/hora; um sênior, R$ 150–300. R$ 1.200 por 140 horas é o que se paga por um site institucional de 5 páginas, não por um SaaS multi-tenant com motor de regras, exportação fiel de Excel e conformidade LGPD.

**Isso não significa que seja errado fechar.** Significa que só faz sentido sob uma condição: **você não está vendendo horas, está construindo um produto.** Veja §2.5.

### 2.4 Ano 2 em diante — onde a conta vira

Depois da entrega, o esforço cai para **~1 hora/mês** de manutenção.

| | Ano 2 |
|---|---:|
| Receita (12 × R$ 150) | R$ 1.800,00 |
| (−) Custos | R$ 450,40 |
| **= Lucro** | **R$ 1.349,60** |
| Horas gastas | 12 h |
| **Valor/hora** | **R$ 112,47** |

**Acumulado 3 anos:** R$ 4.798,80 de lucro para 164 horas totais → **R$ 29,26/hora**.

### 2.5 O cliente #2 é onde o projeto se paga

O código já existe. Para a segunda empreiteira, a implantação é **configuração, não desenvolvimento**: transcrever a ficha dela para o `form_schemas`, ajustar as regras de triagem, trocar o logo, treinar. **~25 horas.** E o custo de infraestrutura é **R$ 0** — o mesmo VPS aguenta 8–10 organizações.

| | Cliente #1 | Cliente #2 |
|---|---:|---:|
| Horas de implantação | 140 h | **25 h** |
| Receita ano 1 | R$ 2.550 | R$ 3.000 |
| Custo incremental de infra | R$ 410 | **R$ 0** |
| Lucro ano 1 | R$ 2.140 | **R$ 3.000** |
| **Valor/hora** | **R$ 15** | **R$ 120** |

**Quantos clientes para a hora valer a pena:**

| Clientes no ano 1 | Horas totais | Lucro ano 1 | Valor/hora |
|---:|---:|---:|---:|
| 1 | 140 h | R$ 2.100 | R$ 15 |
| 2 | 165 h | R$ 5.100 | R$ 31 |
| 3 | 190 h | R$ 8.100 | R$ 43 |
| **4** | **215 h** | **R$ 11.100** | **R$ 52** ✅ |
| 5 | 240 h | R$ 14.100 | R$ 59 |

**Meta: 4 clientes no primeiro ano.** Aí a hora passa de R$ 50 e o projeto se justifica. Com 5 clientes você chega a R$ 14.100 — ainda 17% do teto do MEI, sem precisar migrar para ME.

> **Conclusão honesta:** a R$ 1.200 + R$ 150/mês, o cliente FUJIARTE **não paga o seu trabalho — ele paga o seu portfólio, o caso de uso real e as indicações.** Isso é uma estratégia legítima de entrada em mercado. Mas ela só funciona se você **efetivamente for atrás dos clientes 2, 3 e 4.** Se parar no FUJIARTE, você trabalhou 140 horas por R$ 15/hora e ficou com um sistema que só uma pessoa usa.

---

## 3. Contrato — o que precisa estar escrito

Com valores baixos, o contrato deixa de ser formalidade e vira a sua única proteção. Cinco cláusulas inegociáveis:

1. **Propriedade intelectual — o código é seu.** O cliente recebe **licença de uso**, não o software. Sem isso, R$ 1.200 compra o sistema inteiro e você não tem produto para revender. **É a cláusula que decide se este projeto vale a pena.**

2. **Escopo fechado por fase, em anexo.** Lista exata do que entra no MVP (o doc [05](05-escopo-mvp.md) serve como anexo). Pedido fora da lista = orçamento novo. Sem isso, "só mais um campinho" vira 20 h/mês eternas e a hora cai de R$ 15 para R$ 4.

3. **Custos variáveis repassados.** Texto sugerido:
   > *A assinatura de R$ 150/mês cobre licença de uso, hospedagem, backup, suporte em horário comercial e atualizações corretivas. Serviços de consumo de terceiros — mensagens WhatsApp Business API, processamento de IA e armazenamento acima de 10 GB — são repassados ao custo, mediante relatório mensal.*

4. **Sem exclusividade — explícito.** Você pode e vai vender para outras empreiteiras. Se ele quiser exclusividade de mercado, o preço não é R$ 150/mês.

5. **DPA (LGPD).** Ele é controlador, você é operador. Subprocessadores nomeados (Hetzner, Cloudflare, Resend). Notificação de incidente em 72 h. Retenção e expurgo definidos.

**Contrapartidas do preço "Fundador"** — negocie-as agora, é o que transforma R$ 1.200 em investimento:

- Autorização de uso do **nome e logo** como caso de sucesso
- **3 indicações qualificadas** para outras empresas do setor, por escrito
- **Depoimento em vídeo** (2 min) após 60 dias de uso
- Preço congelado por 24 meses (reajuste IPCA a partir do 25º mês)

---

## 4. Fiscal — a ressalva que fica registrada

Você decidiu manter o MEI atual. **Financeiramente é a decisão certa** (§1.3) e a receita projetada (R$ 2.550 no ano 1) está muito longe do teto de R$ 81.000.

**A ressalva:** os CNAEs do seu MEI são 4751-2/01 (comércio varejista de informática), 8219-9/99 (preparação de documentos e serviços de apoio administrativo), 8599-6/03 (treinamento em informática) e outros. **Nenhum cobre desenvolvimento ou licenciamento de software**, e não há como incluir — desenvolvimento de software não está na lista de ocupações permitidas ao MEI (Anexo XI, Resolução CGSN 140/2018).

**Como operar dentro disso:**

- Emitir a NF sob **8219-9/99**, descrevendo o serviço como *"serviço de apoio administrativo — implantação e manutenção de sistema de gestão de cadastros"*, não como *"desenvolvimento de software"*. É a leitura mais defensável dos CNAEs que você tem.
- Somar com o faturamento do MiseOn e **monitorar o teto de R$ 81.000/ano** (o teto é do CNPJ, não da atividade).
- **Confirmar com um contador** antes da primeira NF. Vale a consulta avulsa (~R$ 150) mesmo sem contratar mensalidade.

**Quando migrar para ME:** quando qualquer um destes acontecer —
- receita anual de software passar de ~R$ 30.000, ou
- chegar ao 3º cliente, ou
- algum cliente exigir CNAE 6201/6202 na NF.

Aí a conta muda: contador R$ 150–300/mês + ~6% de tributos passa a caber, e você ganha CNAEs corretos (6201-5/01 desenvolvimento sob encomenda, 6202-3/00 licenciamento customizável).

**Certificado A1:** confirme antes de comprar. NFS-e Nacional costuma ser emitida por portal/app sem certificado. Ele só importa quando você automatizar emissão via API.

---

## 5. Resumo em uma tela

| Pergunta | Resposta |
|---|---|
| Quanto custa rodar? | **R$ 37,53/mês** (teto era R$ 150 — sobra 75%) |
| Quanto sobra por mês? | **R$ 112,47** — margem de 75% |
| Quanto lucro no ano 1? | **R$ 2.099,60** |
| Quanto vale minha hora? | **R$ 15** com 1 cliente · **R$ 52** com 4 clientes |
| Quando o cliente #2 se paga? | **Imediatamente** — R$ 3.000 de lucro por 25 h de trabalho |
| Pago mais imposto? | **Não.** DAS do MEI já está pago pelo MiseOn |
| Qual o risco #1? | **Escopo crescer sem contrato.** Ver §3, item 2 |
| O que valida o projeto? | **4 clientes no ano 1** |
