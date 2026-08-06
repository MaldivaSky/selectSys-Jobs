# 06 — Plano Scrum: Backlog, Sprints e Cerimônias

> Você está saindo do papel de "dev que executa" para "dev que também gerencia". Este documento é o seu manual de operação. Ele existe para que **você não seja o único ponto de controle do projeto** — o cliente precisa ver progresso toda semana, e você precisa de um mecanismo que impeça o escopo de crescer sozinho.

---

## 1. Como o Scrum se adapta a um time de uma pessoa

Scrum foi desenhado para times de 5–9 pessoas. Com um dev, algumas cerimônias perdem sentido e outras ficam **mais** importantes. Aqui não vale fingir que é Scrum puro — é **Scrum adaptado, com honestidade sobre o que foi cortado**.

### Papéis

| Papel Scrum | Quem | O que faz de verdade |
|---|---|---|
| **Product Owner** | O cliente japonês (FUJIARTE) | Prioriza o backlog, aceita ou rejeita entregas na Review. **Se ele não participar, você vira PO por omissão — e é assim que projetos derrapam.** |
| **Scrum Master** | Rafael | Protege o escopo, remove impedimentos, mede velocidade, conduz as cerimônias |
| **Dev Team** | Rafael | Estima, constrói, testa, entrega |

**O conflito de interesse é real:** você é SM e Dev ao mesmo tempo. Isso significa que, quando uma sprint atrasar, a tentação será varrer para debaixo do tapete. O antídoto é a **Review semanal com o cliente presente** — atraso fica visível para outra pessoa, não só para você.

### Cerimônias

| Cerimônia | Quando | Duração | Participa | Formato adaptado |
|---|---|---|---|---|
| **Sprint Planning** | Segunda, 9h | 45 min | Rafael (+ cliente se possível) | Puxa histórias do backlog até 16 SP. Escreve o Sprint Goal em uma frase. |
| **Daily** | Todo dia, 9h | 10 min | Rafael | Escrito, não falado. Três linhas em `SPRINT-LOG.md`: fiz / farei / travado em. **Serve de registro de horas reais.** |
| **Sprint Review** | Sexta, 16h | 30 min | **Rafael + cliente — obrigatório** | Demo ao vivo do que ficou pronto. Cliente aceita ou rejeita história por história. **Não é apresentação de slides, é software rodando.** |
| **Retrospective** | Sexta, 16h30 | 15 min | Rafael | O que estimei errado? O que me travou? O que mudo na próxima? |
| **Backlog Refinement** | Quarta, 30 min | 30 min | Rafael | Detalha e estima as histórias da próxima sprint |

### Cadência

**Sprints de 1 semana**, não 2. Em um projeto de 6 semanas com um cliente que nunca usou software desse tipo, feedback semanal vale mais que a redução de overhead que sprints longas trazem. Seis sprints, seis demos, seis oportunidades de corrigir rota antes que fique caro.

### Capacidade e velocidade

- **Disponibilidade real:** 25 h/semana
- **Descontando cerimônias:** ~1,5 h/semana → **23,5 h de desenvolvimento**
- **Escala:** 1 Story Point ≈ 2 horas *(âncora de calibração — pontos são relativos, mas com time de uma pessoa a âncora evita autoengano)*
- **Velocidade planejada:** **16 SP/sprint**

> **Regra de calibração:** ao fim da Sprint 2, some os SP realmente concluídos nas duas primeiras sprints. Se a média ficar abaixo de 14 SP, **corte escopo imediatamente** (candidato: Épico E — agências, 7 SP → Fase 2). Não estique horas. Trabalhar 35h/semana por R$ 15/hora transforma um projeto ruim em um projeto péssimo.

---

## 2. Roadmap — calendário de 28 dias (M1 em D+21, M2 em D+28)

> Substitui o plano original de 6 sprints semanais (42 dias). Decisão registrada em [doc 09 §1](09-roteiro-de-ativacao.md).

**Sprints de 7 dias corridos. Três sprints de construção, uma semana de estabilização.**

| Sprint | Dias | Sprint Goal (uma frase) | SP | Demo do último dia |
|---|---|---|---:|---|
| **1** | 1–7 | O ambiente está no ar e o formulário FUJIARTE existe como dado | 26 | Login + as 7 etapas renderizando a partir do JSON |
| **2** | 8–14 | Um candidato preenche pelo celular e a triagem decide sozinha | 26 | Preenchimento completo no celular do cliente + resultado da triagem |
| **3** | 15–21 | O administrador encontra, abre e exporta — **M1** | 25 | **Abrir o .xls exportado lado a lado com o original** |
| **4** | 22–28 | Dados históricos migrados e equipe treinada — **M2** | 19 | Go-live + treinamento gravado |
| | | **Total** | **96** | |

**Velocidade exigida: ~26 SP/sprint**, contra os 16 SP da linha de base. Isso é decisão sua e está registrada — mas ver o ajuste recomendado em [doc 09 §1](09-roteiro-de-ativacao.md): deslocar agências (7 SP) para a sprint 4 e a exportação PDF (5 SP) para a Fase 2 devolve o ritmo para ~22 SP/sprint.

**Sprint 4 não é folga.** Ela absorve: migração das planilhas históricas, treinamento, correções da UAT e o módulo de agências. Se a UAT trouxer mais de 3 itens fora do escopo, eles viram orçamento — não trabalho da semana 4.

---

## 3. Detalhamento por sprint

### Sprint 0 — Fundação · 16 SP · 20 h

**Goal:** *O ambiente está no ar e um usuário autenticado consegue entrar.*

| História | SP | h |
|---|---:|---:|
| F1 — Base multi-tenant (schema, RLS, criptografia de saúde, audit_log) | 6 | 8 |
| F2 — Deploy e operação (VPS, Coolify, Cloudflare, CI/CD, backup) | 5 | 6 |
| C1 — Login com 2FA | 4 | 5 |
| Setup do monorepo, Drizzle, design tokens | 1 | 1 |

**Feito antes de codar** (não é sprint, é pré-requisito — **bloqueia tudo**):
- [ ] Contrato + DPA assinados, com o doc 05 anexado como escopo
- [ ] Reunião de descoberta — as 8 perguntas do [doc 01 §6](01-analise-documentos.md)
- [ ] Cronometrar o processo atual acompanhando 1 candidatura de ponta a ponta
- [ ] Receber: ficha preenchida real (anonimizada), logo, cores, acesso ao Excel histórico
- [ ] Consulta avulsa com contador sobre a emissão da NF

**Risco da sprint:** ambiente de infra consumir mais que o previsto. Mitigação: usar Coolify (PaaS pronto), não configurar Nginx/systemd na mão.

---

### Sprint 1 — Motor de Formulário · 16 SP · 24 h

**Goal:** *O formulário FUJIARTE existe como dado e renderiza sozinho.*

| História | SP | h |
|---|---:|---:|
| Transcrever as ~130 perguntas da ficha para `form_schemas` v2024.06 | 4 | 8 |
| Renderer dirigido por schema + gerador de Zod em runtime | 6 | 10 |
| Campos condicionais (`visible_when`) + máscaras (CPF, CEP, telefone, data) | 4 | 5 |
| Seed da organização FUJIARTE, papéis e usuários | 2 | 1 |

> A transcrição das 130 perguntas é **trabalho braçal, não intelectual** — 8 horas de digitação cuidadosa. Não subestime e não deixe para a última hora. Faça na segunda, com a planilha aberta ao lado.

**Risco:** descobrir campos ambíguos na ficha (ex.: "Geração" — quais valores exatos?). Mitigação: lista de dúvidas enviada ao cliente na **segunda-feira**, resposta até quarta.

---

### Sprint 2 — Candidatura · 16 SP · 25 h

**Goal:** *Um candidato consegue preencher e enviar a ficha pelo celular.*

| História | SP | h |
|---|---:|---:|
| A1 — Wizard de 7 etapas mobile com progresso | 8 | 9 |
| A2 — Autosave a cada 3s + retomada por magic link | 6 | 7 |
| A3 — Upload de foto (câmera, recorte, compressão, R2) | 5 | 6 |
| A4 — Seletor de tatuagem (11 regiões) | 3 | 2 |
| A5 — Consentimento LGPD versionado | 4 | 1 |

**Demo obrigatória:** preencher **no celular do cliente**, não no seu. É o momento em que ele entende o produto.

**Risco:** iOS Safari com upload de câmera é notoriamente chato. Mitigação: testar no dia 1 da sprint, não no dia 5.

---

### Sprint 3 — Painel · 17 SP · 25 h

**Goal:** *O administrador encontra, abre e move candidatos.*

| História | SP | h |
|---|---:|---:|
| C2 — Lista com busca, filtros e paginação server-side | 7 | 9 |
| C3 — Ficha completa + timeline + bloco de saúde com auditoria | 7 | 10 |
| C4 — Mudança de status + histórico | 6 | 6 |

*(Nota: 20 SP planejados, ajustados para 17 movendo parte de C4 para a Sprint 4 se necessário.)*

**Risco:** o cliente ver a lista e pedir Kanban. **Resposta pronta:** *"Kanban está na Fase 2, orçado à parte. O dropdown entrega a mesma informação e libera 8 horas para a exportação do Excel, que é o que trava a sua operação hoje."*

---

### Sprint 4 — Exportação · 17 SP · 25 h ⚠️ **SPRINT DE MAIOR RISCO**

**Goal:** *A exportação sai idêntica à planilha atual.*

| História | SP | h |
|---|---:|---:|
| D1 — Exportação .xls a partir do template original + `export_map` | 12 | 14 |
| D2 — Exportação PDF | 5 | 6 |
| B1 — Triagem automática (3 regras) + persistência da decisão | 6 | 5 |

**Por que é a sprint de maior risco:** o arquivo `.xls` da FUJIARTE é BIFF (Excel 97-2003), com 147 linhas × 59 colunas de células mescladas. Preencher um template preservando mesclagens, bordas e fontes é onde bibliotecas costumam falhar.

**Plano B, decidido na terça:** se o ExcelJS não preservar o layout do `.xls`, converter o template para `.xlsx` uma vez (o Excel faz isso sem perda visual) e trabalhar sobre ele. O cliente abre `.xlsx` normalmente.
**Plano C:** gerar via LibreOffice headless em modo conversão. Mais lento, mas preserva tudo.

**Regra:** se até **quarta-feira** o Plano A não estiver funcionando, migre para o Plano B sem discutir. Não queime a sexta-feira debugando formatação.

---

### Sprint 5 — Fechamento · 14 SP · 21 h

**Goal:** *O sistema está em produção e o cliente sabe usar.*

| História | SP | h |
|---|---:|---:|
| E1 + E2 — Agências: CRUD, link exclusivo, painel restrito | 7 | 8 |
| E-mails transacionais (Resend) | 2 | 2 |
| F3 — Migração histórica, treinamento gravado, manual | 5 | 6 |
| Buffer para correções de UAT | — | 5 |

> **As 5 horas de buffer não são folga — são o seguro do projeto.** Toda sprint anterior deixa pendências pequenas. Se você não reservar, elas viram trabalho não pago na semana 7.

---

## 4. Definição de Pronto — ver [doc 05 §4](05-escopo-mvp.md)

Uma sprint só está encerrada quando **todas** as histórias dela atendem à DoD. História parcialmente pronta **não conta pontos** e volta para o backlog da próxima sprint. Contabilizar meio ponto é como você perde a capacidade de prever prazo.

---

## 5. Métricas que você acompanha

| Métrica | Como medir | Meta | O que fazer se sair da meta |
|---|---|---|---|
| **Velocidade** | SP concluídos por sprint | 16 ± 2 | < 14 por 2 sprints → cortar Épico E |
| **Precisão de estimativa** | horas reais ÷ horas estimadas | 0,9–1,2 | > 1,3 → aumentar a âncora de 2h para 2,5h/SP |
| **Retrabalho** | histórias rejeitadas na Review | 0 | ≥ 1 → critérios de aceite estão vagos |
| **Escopo adicionado** | SP novos entrando fora do planejado | 0 | > 0 → aciona a cláusula de escopo do contrato |
| **Dívida técnica** | itens no `TECH-DEBT.md` | < 10 | ≥ 10 → sprint de limpeza na Fase 2 |

### Burndown

Uma planilha simples (ou o Projects do GitHub). Atualize na Daily.

```
SP restantes
96 ┤●
   │ ╲
80 ┤  ●╌╌╌╌ ideal
   │   ╲
64 ┤    ●
   │     ╲
48 ┤      ●
   │       ╲
32 ┤        ●
   │         ╲
16 ┤          ●
   │           ╲
 0 ┼────────────●
   S0  S1  S2  S3  S4  S5
```

**Se a linha real ficar acima da ideal por 2 sprints seguidas, o escopo está errado — não a sua produtividade.** Corte, não acelere.

---

## 6. Gestão de risco por sprint

| Risco | Sprint | Prob. | Impacto | Gatilho de ação | Plano B |
|---|---|---|---|---|---|
| Exportação .xls não fica idêntica | S4 | Média | **Crítico** | Quarta sem funcionar | Converter template para .xlsx |
| Cliente pede escopo novo na Review | Todas | **Alta** | Alto | Qualquer pedido fora do doc 05 | *"Registro no backlog da Fase 2 e orço."* Nunca "eu vejo isso" |
| Ficha tem campos ambíguos | S1 | Alta | Médio | Dúvida ao transcrever | Lista de perguntas na segunda, resposta até quarta |
| Cliente falta à Review | Todas | Média | Alto | 2 faltas seguidas | Gravar vídeo de 5 min e exigir aceite por e-mail |
| Safari iOS quebra o upload | S2 | Média | Médio | Teste no dia 1 falha | Fallback para upload de galeria |
| Velocidade abaixo de 14 SP | S2 | Média | Alto | Média das 2 primeiras | Cortar Épico E para a Fase 2 |
| Você adoece / imprevisto pessoal | Todas | Baixa | Alto | 3+ dias parado | Comunicar na hora e replanejar; **não compensar em fim de semana** |

---

## 7. Artefatos que você mantém

| Arquivo | Atualiza | Serve para |
|---|---|---|
| `SPRINT-LOG.md` | Diário, 10 min | Registro de horas reais e impedimentos |
| `BACKLOG.md` | Na Planning e no Refinement | Fonte única do que falta |
| `CHANGELOG-CLIENTE.md` | Toda sexta | O que o cliente ganhou nesta semana |
| `TECH-DEBT.md` | Quando fizer um atalho consciente | Não esquecer o que foi adiado |
| `DECISOES.md` | Quando decidir algo arquitetural | Lembrar *por que* seis meses depois |

---

## 8. Sprint 6+ — o que vem depois (Fase 2, orçada à parte)

Não prometa nada disto no contrato do MVP. É o material da sua **segunda proposta**, quando o cliente já estiver usando o sistema e a conversa for muito mais fácil:

| Módulo | Estimativa | Sugestão de preço |
|---|---:|---:|
| WhatsApp automático + templates + histórico | 25 h | R$ 900 |
| Kanban drag-and-drop + dashboard com gráficos | 20 h | R$ 700 |
| Vagas + matching de compatibilidade | 30 h | R$ 1.200 |
| Alertas e lembretes automáticos | 15 h | R$ 500 |
| Integração Garoon | 25 h | R$ 1.000 |
| Painel em japonês (i18n completo) | 15 h | R$ 500 |
| **Fase 2 completa** | **130 h** | **R$ 4.800** |

> Se ele fechar a Fase 2 por R$ 4.800, o valor da sua hora no projeto **sobe de R$ 15 para R$ 25** — e a assinatura pode ser renegociada de R$ 150 para R$ 250/mês, porque o produto passa a fazer coisas que não existiam no acordo original. **A Fase 2 é a sua correção de rota, não um extra.**
