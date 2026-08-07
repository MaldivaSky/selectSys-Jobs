# 14 — Roteiro da Demonstração

**Reunião:** segunda-feira, 10/08/2026 · 令和8年8月10日
**Entregável da Fase 0** ([plano master](../PLANO_MASTER_SENIOR.md)):

- [x] Termo de Escopo Técnico e Plano Master assinado
- [x] **Definição exata dos campos da ficha FUJIARTE (Jun2024) no schema dinâmico**
- [x] Checklist de segurança e privacidade (LGPD Art. 5º e 11) aprovado

> **Quem está na sala.** A apresentação não é para o presidente — é para quem
> vai ter que convencer o presidente depois, sem você junto. Tudo abaixo existe
> para essa pessoa conseguir repetir o argumento sozinha.

---

## Abertura — 3 minutos, sem tela

Comece pelo achado jurídico, não pelo produto.

> "Revisando a ficha contra a LGPD encontrei um ponto que não estava mapeado: a
> pergunta de geração — nissei, sansei, yonsei — é **origem étnica**, dado
> sensível pelo Art. 5º, II, no mesmo nível dos dados de saúde. Hoje ela é
> coletada sem consentimento específico. Já corrigi no sistema; a FUJIARTE
> precisa aprovar o texto do consentimento antes de assinar."

Por que abrir assim: fornecedor que encontra risco **depois** da assinatura é
custo. Encontrar **antes**, com a correção pronta, é sócio. Documento completo
em [12-checklist-lgpd-appi.md](12-checklist-lgpd-appi.md), seção 2.

---

## 1. A ficha, campo a campo — 5 min

**Mostre:** `packages/core/src/form/ficha-fujiarte-2024-06.ts`

```
python packages/exportador/verificar_cobertura.py
```

```
221 células distintas          0 colisões
32 de 32 perguntas da enquete  presentes
identificação 7/7 · documentos 6/6 · endereço 8/8
biometria EPI 4/4 · escolaridade 6/6 · emergência Japão 4/4 · agência 3/3
196 células escritas → arquivo reaberto → 196 conferem
RESULTADO: PASSOU
```

**A frase:** *"Cada campo do papel tem a célula dele registrada. O teste
preenche todos, gera o .xls e reabre o arquivo para conferir um por um. Se
alguém mudar uma célula sem querer, o teste quebra antes de chegar no Japão."*

Esse é o entregável contratual da Fase 0.

---

## 2. O formulário — 6 min · `/ficha`

Preencha **pelo celular**, não pelo projetor. 80% dos candidatos usam celular.

| Mostre | Diga |
|---|---|
| Digite o CEP | "Endereço se preenche sozinho." |
| Data de nascimento | "Idade calculada ao vivo — nunca a que o candidato digitou. A regra dos 55 anos depende disso." |
| Calçado, cintura, altura | "Toque, sem teclado. É medida para encomendar o EPI da fábrica." |
| Marque "Indicação" | Dois campos aparecem. "Só pergunta o que a resposta anterior pede." |
| Etapa 7, saúde | Bloqueada. "Consentimento específico e destacado, Art. 11." |
| Toque em "Prefiro não informar" | Segue em frente. "Recusar **não** encerra a candidatura." |
| Aguarde 3s | Selo "Salvo". "Autosave. Conexão caiu, nada se perde." |

---

## 3. A planilha idêntica — 4 min

```
python packages/exportador/exportar_ficha.py
```

Abra o `.xls` gerado **ao lado** do original da FUJIARTE.

**A frase:** *"É o arquivo de vocês, preenchido. Não é uma planilha nova que
parece com a de vocês — é o template original, célula a célula. Quem recebe no
Japão não vai notar diferença nenhuma, e é isso que queremos."*

---

## 4. O painel — 5 min · `/admin`

Entre como analista. Mostre primeiro a tela **antes** do login.

**A frase:** *"Sem sessão, o banco devolve zero. Não é a tela que esconde — é o
PostgreSQL que não entrega. Um bug de programação não vaza dado de candidato."*

Depois do login:

- 11 etapas com o termo japonês: 応募 → 内定 → 在留資格認定証明書 → 査証 → 入社
- lista com busca e filtros
- mova alguém no funil: só aparecem as transições que a organização permitiu
- o parecer da triagem em texto: *"Idade 58: a partir de 55 anos sem passagem anterior pela mesma empresa"*

**A frase:** *"Toda reprovação tem parecer escrito, com os dados de entrada e a
versão da regra. É o Art. 20 da LGPD, e na prática é o que encerra discussão
sobre por que alguém foi cortado."*

---

## 5. Configuração, não código — 2 min

Abra `rulesets` no banco.

**A frase:** *"O limite de 55 anos é uma linha de dado, não uma linha de
programa. Se a diretoria decidir 58 amanhã, muda aqui e vale na hora. Não
depende de mim, não tem deploy, não tem espera."*

Mesma coisa para `pipeline_transitions`: o fluxo das 11 etapas é dado.

---

## 6. Fechamento — o que precisa de decisão

| Pendência | Quem decide | Trava a assinatura? |
|---|---|---|
| Texto do consentimento de descendência | FUJIARTE | **Sim** |
| Cláusulas de transferência internacional no contrato | Jurídico das duas partes | **Sim** |
| Confirmar que Jun/2024 é a versão vigente da ficha | FUJIARTE | **Sim** |
| Indicar o Encarregado (DPO) | FUJIARTE | Até o go-live |
| Manter ou remover a Q14 (detenção policial) | FUJIARTE | Não — é flag por organização |

Sobre a Q14, vale dizer em voz alta: *"Pergunta sobre detenção em processo
seletivo é fonte recorrente de ação por dano moral no Brasil, Súmula 443 do
TST. Deixei desligada por padrão. Se vocês quiserem manter, ela liga — mas com
justificativa registrada."*

---

## Números para levar de cabeça

| | |
|---|---|
| Campos da ficha mapeados | **221 células**, 0 colisões |
| Perguntas da enquete | **32 de 32** |
| Tabelas no banco | **24**, todas com RLS, 0 sem |
| Avisos do auditor de segurança | **0** |
| Prazo somado das etapas | **119 dias** do recebimento à admissão |
| Tempo da ficha | de ~25 min no papel para **7–10 min** no celular |

---

## Antes de sair de casa

- [ ] `npm run build` limpo
- [ ] Produção no ar: <https://selectsys-jobs.vercel.app>
- [ ] Testar em **4G do celular**, não no wi-fi do escritório
- [ ] Abrir o `.xls` gerado uma vez, para não descobrir problema na sala
- [ ] Levar o [checklist LGPD](12-checklist-lgpd-appi.md) impresso — é o que fica com eles
