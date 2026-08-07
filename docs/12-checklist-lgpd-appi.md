# 12 — Checklist de Segurança e Privacidade · LGPD (Brasil) + APPI (Japão)

### 個人情報保護チェックリスト — SelectSys Jobs
**Entregável da Fase 0 · validação de segunda-feira, 10/08/2026 (令和8年8月10日)**
**Controlador dos dados:** FUJIARTE Co., Ltd. — **Operador:** SelectSys Jobs

---

> **Para que serve este documento.** Ele existe para que a FUJIARTE possa levar a decisão à presidência com a resposta pronta para a pergunta que sempre vem: *"e se vazar?"*. Cada linha aponta o mecanismo técnico que sustenta a afirmação — não é declaração de intenção, é onde no sistema aquilo está implementado.

---

## 1. Sumário para a diretoria (3 parágrafos)

A ficha da FUJIARTE contém **dado pessoal sensível** nos termos do Art. 5º, II da LGPD. Não é opinião: perguntas 16 a 31 tratam de saúde (visão, dor crônica, saúde mental, medicação, alergias) e a pergunta de **descendência (geração nikkei) é dado de origem étnica**, igualmente sensível pelo mesmo artigo. Planilha em rede compartilhada, hoje, não atende a nenhum dos requisitos legais para esse tipo de dado.

O SelectSys Jobs trata os dois blocos com **base legal, consentimento específico e destacado, criptografia em nível de coluna, acesso restrito por papel e registro de auditoria de cada leitura**. A descendência tem tratamento próprio porque sua finalidade é legítima e documentável: ela define a elegibilidade ao status de residência 定住者 / 日本人の配偶者等 — sem ela não há visto.

O fluxo é **transfronteiriço** (Brasil → Japão). O Japão **não** consta de lista de adequação da ANPD, e o Brasil **não** consta da lista de países com proteção equivalente da PPC japonesa. Portanto a transferência se apoia em **consentimento específico e destacado do titular (LGPD Art. 33, VIII)** somado a **cláusulas contratuais específicas (Art. 33, II, "a")** no contrato entre as partes — e, do lado japonês, em consentimento informado com indicação do país de destino (APPI Art. 28). Ambos os instrumentos precisam estar assinados antes do go-live.

---

## 2. Achado que precisa de decisão antes da assinatura

> ### ⚠ A descendência nikkei é dado sensível e ainda não tinha consentimento próprio
>
> O escopo tratava apenas o Bloco B (saúde) como sensível. **Origem étnica também é sensível** (Art. 5º, II) e a ficha coleta geração (issei/nissei/sansei/yonsei) mais o 戸籍謄本, que é prova documental de ascendência.
>
> **Risco se ficar como está:** tratamento de dado sensível sem base legal específica. Multa de até 2% do faturamento, limitada a R$ 50 milhões por infração (Art. 52).
>
> **Correção proposta (custo: baixo, já modelado):** consentimento `descendencia_v1`, específico e destacado, com finalidade declarada — *"comprovar elegibilidade ao visto de descendente"*. Uma tela a mais no formulário, nenhuma mudança de arquitetura.
>
> **Decisão necessária da FUJIARTE:** aprovar o texto do consentimento. Sugestão pronta na seção 7.

---

## 3. Dados sensíveis — inventário

| Bloco | Campos | Artigo | Onde fica | Cifrado |
|---|---|---|---|:--:|
| Saúde (Q16–Q31) | Visão, daltonismo, acidente, sequela, dor crônica, mobilidade, saúde mental, alergia, fobia, tratamento, medicação | 5º II · 11 | `candidate_health` (tabela apartada) | ✅ AES-256-GCM |
| Origem étnica | Geração nikkei, koseki | 5º II · 11 | `candidates.geracao` | ⚠ ver §2 |
| Antecedentes (Q14) | Detenção policial | Súmula 443 TST · Lei 9.029/95 | `application_data` | flag por organização |
| Biometria de EPI | Altura, peso, cintura, pé | 5º I (comum) | `candidates` | — |
| Imagem | Foto do candidato, foto de tatuagem | 5º I (comum) | R2, URL assinada | acesso expirável |

**A chave de criptografia nunca fica no banco.** Vem da aplicação a cada chamada, com `key_version` para permitir rotação sem reprocessar a base.

---

## 4. Checklist técnico — o que está pronto e o que falta

| # | Requisito legal | Artigo | Mecanismo no sistema | Estado |
|---|---|---|---|:--:|
| 1 | Consentimento específico e destacado para saúde | 11, I | `consents.tipo = 'saude_v1'`, bloco visualmente separado | ✅ modelado |
| 2 | Consentimento específico para origem étnica | 11, I | `descendencia_v1` | ⚠ §2 |
| 3 | Consentimento para transferência internacional | 33, VIII | `transferencia_internacional_v1` | ✅ modelado |
| 4 | Registro de versão, data, IP e user-agent do consentimento | 8º, §1º | `consents` (4 colunas) | ✅ modelado |
| 5 | Revogação do consentimento a qualquer tempo | 8º, §5º | endpoint + expurgo do bloco correspondente | ⬜ Fase 1 |
| 6 | Recusar saúde sem perder a candidatura | 9º, §3º | `exigeConsentimento` pula o bloco | ✅ no schema |
| 7 | Criptografia de dado sensível | 46 | `pgcrypto`, coluna, AES-256-GCM | ✅ modelado |
| 8 | Isolamento entre organizações | 46 | RLS no PostgreSQL, não filtro na query | ✅ modelado |
| 9 | Registro de acesso a dado sensível | 37 | `audit_log`: quem, quando, qual candidato, IP, motivo | ✅ modelado |
| 10 | Decisão automatizada explicável | 20 | `screening_decisions`: fatos + versão da regra + regras disparadas | ✅ modelado |
| 11 | Direito à revisão humana | 20, §1º | `revisado_por`, `revisado_em`, `revisao_resultado` | ✅ modelado |
| 12 | IA fora do veredito | 20 | Claude só extrai, traduz e resume. Nunca aprova nem reprova | ✅ arquitetural |
| 13 | Retenção limitada e expurgo | 15 · 16 | `retencao_meses` = 24 a partir do último contato | ⬜ Fase 2 |
| 14 | Portabilidade e acesso do titular | 18, II e V | exportação da própria ficha | ⬜ Fase 2 |
| 15 | Eliminação a pedido | 18, VI | expurgo com registro de auditoria | ⬜ Fase 2 |
| 16 | Cláusulas contratuais de transferência | 33, II "a" | anexo ao contrato FUJIARTE ↔ SelectSys | ⬜ **jurídico** |
| 17 | Encarregado (DPO) indicado | 41 | nome e canal públicos na página | ⬜ **FUJIARTE** |
| 18 | Comunicação de incidente | 48 | procedimento + prazo, Sentry + Better Stack | ⬜ Fase 3 |
| 19 | Backup testado | 46 | restore validado **antes** do go-live | ⬜ Fase 3 |
| 20 | Pentest | 46 | Fase 3, semana 9 | ⬜ Fase 3 |

**Legenda:** ✅ modelado no schema e no core · ⬜ programado para a fase indicada · ⚠ decisão pendente

Dos 20 itens, **11 já estão modelados** antes da primeira linha de tela ser escrita. É a diferença entre um sistema que nasce conforme e um que tenta virar conforme depois — o segundo custa cerca de 5× mais.

---

## 5. APPI · 個人情報保護法 (lado japonês)

| # | Requisito | Artigo APPI | Como é atendido |
|---|---|---|---|
| 1 | Finalidade de uso especificada e informada | 17 · 21 | Declarada no consentimento, em português e japonês |
| 2 | Consentimento para dado de cuidado especial (要配慮個人情報) | 20-2 | Saúde e origem étnica têm consentimento próprio |
| 3 | Transferência a terceiro | 27 | FUJIARTE Japão é a controladora; SelectSys é operadora |
| 4 | Transferência internacional com indicação do país | 28 | O termo informa que os dados vão ao Japão e sob qual regime |
| 5 | Medidas de segurança | 23 | Criptografia, RLS, auditoria, TLS, WAF |
| 6 | Supervisão do operador | 25 | Contrato de operação com obrigações espelhadas |
| 7 | Registro de fornecimento a terceiro | 29 · 30 | `audit_log` cumpre o papel de 記録 |

> **Nota:** o Brasil não integra a lista de países com nível de proteção equivalente reconhecida pela 個人情報保護委員会 (PPC). Por isso a via é consentimento informado do titular com indicação do destino — que é o que o termo `transferencia_internacional_v1` faz.

---

## 6. O que muda para quem hoje usa a planilha

| Situação | Planilha em uso hoje | SelectSys Jobs |
|---|---|---|
| Onde está o dado de saúde | Célula aberta, visível a quem abrir o arquivo | Tabela apartada, cifrada, oculta por padrão |
| Quem já leu a ficha | Não há como saber | `audit_log`: nome, hora, IP, motivo |
| Cópias do arquivo | Incontáveis, em e-mail e pen drive | Uma base, acesso por papel |
| Consentimento | Assinatura em papel, sem versão | Versionado, com data, IP e user-agent |
| Por que o candidato foi reprovado | Depende da memória de quem triou | Parecer com os fatos e a versão da regra |
| Se um candidato pedir seus dados | Busca manual em vários arquivos | Exportação da própria ficha |
| Retenção | Indefinida | Expurgo em 24 meses do último contato |

---

## 7. Textos de consentimento propostos (para aprovação)

**Geral — `geral_v1`**
> Declaro que as informações desta ficha são verdadeiras e autorizo a empresa a entrar em contato pelos dados fornecidos sobre o resultado da entrevista, promoções e comunicados.

**Saúde — `saude_v1`** *(destacado, recusável)*
> Autorizo o tratamento dos meus dados de saúde (perguntas 16 a 31) com a finalidade exclusiva de adequação da função na fábrica. Estes dados são armazenados criptografados, com acesso restrito e registrado. Posso recusar — minha candidatura continua sem eles.

**Descendência — `descendencia_v1`** *(destacado, novo — §2)*
> Autorizo o tratamento da informação sobre minha ascendência japonesa (geração e certidão 戸籍謄本) com a finalidade exclusiva de comprovar minha elegibilidade ao visto de descendente perante as autoridades japonesas.

**Transferência internacional — `transferencia_internacional_v1`** *(destacado)*
> Autorizo o envio dos meus dados para a FUJIARTE Co., Ltd., no Japão, para fins de seleção e emissão de visto. Estou ciente de que o Japão possui legislação própria de proteção de dados (APPI) e que a transferência é regida por cláusulas contratuais específicas.

---

## 8. Pendências para segunda-feira

| Pendência | Responsável | Bloqueia assinatura? |
|---|---|---|
| Aprovar o consentimento de descendência (§2) | FUJIARTE | **Sim** |
| Indicar o Encarregado (DPO) da FUJIARTE | FUJIARTE | Não — até o go-live |
| Anexar cláusulas de transferência ao contrato | Jurídico das duas partes | **Sim** |
| Decidir se a pergunta Q14 (detenção) permanece ativa | FUJIARTE | Não — é flag por organização |
| Confirmar se a versão Jun/2024 da ficha é a vigente | FUJIARTE | **Sim** — define a versão do schema |

---

<p align="center">
<b>SelectSys Jobs</b> — 個人情報保護チェックリスト · 令和8年8月10日<br/>
<i>Conformidade não é etapa final do projeto. É a fundação dele.</i>
</p>
