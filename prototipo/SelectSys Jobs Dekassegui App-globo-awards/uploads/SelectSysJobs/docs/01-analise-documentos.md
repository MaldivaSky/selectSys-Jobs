# 01 — Análise dos Documentos e do Processo Atual

> Base: infográfico de requisitos ("plano - app.jpeg"), planilha `白紙 FUJIARTE Ficha Cadastral Jun2024 (1).xls`, CCMEI CNPJ 63.310.253/0001-81.

---

## 1. O que o cliente realmente pediu (leitura do infográfico)

O infográfico **não** descreve um ATS genérico. Descreve um **pipeline de exportação de mão de obra Brasil → Japão (dekassegui)**, com 11 etapas e 17 estados de processo:

```
Candidatura → Triagem → Entrevista → Garoon → Envio currículo ao Japão →
Seleção pela empresa japonesa → Aprovação/Oferta → COE → Visto → Viagem → Admissão
```

Isso muda tudo no design. Os "must-have" tirados do documento:

| # | Requisito | Observação de engenharia |
|---|---|---|
| 1 | Formulário web substituindo a planilha | Precisa de rascunho + autosave — a ficha tem ~130 campos |
| 2 | **Exportação no layout 100% idêntico ao .xls atual** | Bloqueador de adoção. O parceiro japonês a jusante ainda espera aquela planilha |
| 3 | Triagem automática (idade < 55; > 55 só se já trabalhou na mesma empresa; descendência japonesa obrigatória) | Regras **mudam** — não podem estar hardcoded |
| 4 | Tatuagem: local no corpo + foto solicitada só depois da entrevista | Máquina de estados de documento, upload por link WhatsApp |
| 5 | Documentos com status: Não solicitado / Solicitado / Enviado / Conferido | Idem, state machine por documento |
| 6 | Agências indicadoras com link exclusivo + relatórios por agência | Multi-tenant de segundo nível (agência dentro da org) |
| 7 | Integração Garoon (só aprovados na entrevista) | Cybozu Garoon — verificar se é cloud (REST API) ou on-premise |
| 8 | WhatsApp automático com histórico e controle de não respondidos | Custo variável — ver doc 04 |
| 9 | Dashboard + lembretes (entrevista, prazo COE, prazo visto, viagem, admissão) | Jobs agendados |
| 10 | Mobile-first | ~80% dos candidatos preenchem no celular |

---

## 2. O que a planilha FUJIARTE revela (o ativo mais valioso do projeto)

Arquivo real, 1 aba, 147 linhas × 59 colunas, **2 páginas lógicas**. Não é uma tabela — é um formulário desenhado em células mescladas. Isso significa que a exportação precisa ser feita por **template preenchido**, não por geração de tabela.

### Página 1 — Ficha Cadastral (~60 campos)

| Bloco | Campos |
|---|---|
| Identificação | Nome completo (conforme RG), data de preenchimento, foto recente + data da foto |
| Origem | Como soube da FUJIARTE, nome de quem indicou, relação |
| Pessoais | Nascimento (Ano/Mês/Dia) + idade calculada, sexo, estado civil |
| Nacionalidade | BRAS / JAP / Outra, **Geração** (nissei, sansei, yonsei) |
| Documentos | Passaporte + validade, Visto + validade, **Koseki** + validade, **Reentry** + validade, CPF, RG + emissor |
| Biometria | Altura (cm), peso (kg), **cintura (cm)**, **pé (cm)** |
| Escolaridade | Fundamental / Médio (completo/incompleto + série que parou), Técnico, Faculdade, curso, instituição, ano de conclusão |
| Endereço | Logradouro, nº, complemento, bairro, cidade, estado, CEP, e-mail, celular, tel fixo |
| Família | Pai, mãe, cônjuge, filhos/irmãos — nome, idade, telefone |
| Emergência no Japão | Nome, relação, província, telefone |
| Histórico Japão | Já esteve? Retornou com ajuda do governo? |
| Currículo Japão | Até **4 entradas**: fábrica, empreiteira, tipo de serviço, província, cidade, período (ano/mês~ano/mês), motivo da saída, tipo de contrato |
| Currículo Brasil | Até **2 entradas**: empresa, cargo, UF, cidade, período, motivo da saída, tipo de contrato |

> **Cintura e pé em cm** não são curiosidade: são para uniforme e calçado de segurança da fábrica. Isso deve virar um bloco "Uniforme/EPI" no sistema, não ficar solto em "dados pessoais".

### Página 2 — Enquete (32 perguntas)

**Bloco A — aptidão e disponibilidade (Q1–Q15)**
Setor aceito (Eletrônica / Autopeças / Alimentício), preferência de região, horas extras (quantas/dia), turnos (diurno/noturno/alternado), sábados/domingos/feriados, trabalhar na folga, já trabalhou em pé (h/dia), dívidas no Brasil, pendências no Japão (imposto), dependentes (juntos ou depois), pet, data pretendida de embarque, tempo pretendido de permanência (anos), já foi detido pela polícia (onde/quando/motivo), **tatuagem (onde + anexar fotos, exceto locais íntimos)**.

**Bloco B — saúde e ergonomia (Q16–Q31)**
Visão / óculos / lentes (OD/OE), daltonismo, dividir apartamento, habilitação (BR/JP), andar de bicicleta, mão dominante, cigarro (quantos/dia), acidente/doença grave/operação (qual/quando), sequela, dor crônica (lombar, coluna, mão, joelho, escoliose, hérnia, nervo ciático), dificuldade de movimento, **depressão/esquizofrenia ou outra questão mental**, alergias (alimento/medicamento/químico), fobia, tratamento em curso, medicação (qual/quanto/dia).

**Bloco C — motivação (Q32)**
Salário baixo / Desemprego / Família no Japão / Comprar imóvel / Poupança / Dívida / Outros.

**Rodapé** — declaração de veracidade + autorização de contato, assinatura, e três campos preenchidos **pela agência**: Agência, Entrevistador, Promotor (nome/agência).

### Conclusões técnicas diretas da planilha

1. **Modelagem híbrida obrigatória.** ~35 campos precisam ser colunas normalizadas (indexáveis: nascimento, sexo, geração, província, nível, status, altura/peso/pé). Os ~95 restantes (enquete) vão em **JSONB versionado por schema**, porque cada empreiteira vai querer perguntas diferentes.
2. **Currículo é 1:N**, não campos fixos. A planilha limita a 4+2 por falta de espaço físico — o sistema não deve herdar essa limitação, só truncar na exportação.
3. **Datas em formato japonês (Ano/Mês/Dia)** em toda a ficha. Armazenar ISO, renderizar por locale.
4. **A ficha é bilíngue de fato**: `白紙` (papel em branco), `～` (til japonês nos períodos), rodapé "Jun/2024" = versionamento manual do formulário. O sistema precisa de **versão de formulário** de primeira classe.
5. **Bloco B inteiro é dado pessoal sensível** (saúde). Ver seção 4.

---

## 3. Lacuna entre o seu pedido e o do cliente

Você descreveu um produto genérico (currículos, vagas, compatibilidade premium). O cliente descreveu um funil dekassegui. **Os dois cabem no mesmo produto**, com este mapeamento:

| Seu conceito | No domínio do cliente |
|---|---|
| Currículo | Ficha Cadastral (versão digital do .xls) |
| Vaga | Posto na fábrica: empresa japonesa + província + setor + turno + requisitos |
| Publicar vaga | Abrir posição e liberar para agências indicadoras |
| Analisar perfil | Triagem automática + score de compatibilidade explicável |
| Compatibilidade premium (B2C) | Candidato paga para ver quais vagas abertas ele atende e **o que falta** |

Recomendação: **construir o vertical (dekassegui) primeiro**. Um ATS genérico compete com Gupy e Solides; um sistema que fala COE, Koseki, Reentry, província e empreiteira não tem concorrente e vende sozinho para as outras empreiteiras do mesmo mercado.

---

## 4. Riscos que precisam entrar na arquitetura (não são detalhe jurídico)

### 4.1 LGPD — dados sensíveis (Art. 5º, II e Art. 11)
Depressão/esquizofrenia, dor crônica, medicação, alergias, sequelas, daltonismo, deficiência visual → **dado pessoal sensível de saúde**. Consequências obrigatórias de arquitetura:

- Tabela separada com **criptografia em nível de coluna** (não só disco).
- RLS restringindo leitura a papéis `entrevistador` e acima.
- **Log de acesso** a cada leitura (quem, quando, qual candidato).
- **Consentimento específico e destacado**, com finalidade explícita, versionado e com timestamp/IP guardados.
- Política de retenção com expurgo automático (sugestão: 24 meses após último contato).

### 4.2 Antecedentes criminais (Q14) — Súmula 443 do TST / Lei 9.029/95
Pergunta sobre detenção policial em processo seletivo é fonte recorrente de dano moral no Brasil. Recomendação: tornar o campo **desabilitável por organização** (feature flag) e, quando ativo, exigir justificativa registrada de exigência da vaga.

### 4.3 Idade e descendência
- **Descendência japonesa**: exigência legítima — define elegibilidade ao visto de longa permanência para nikkei. Sem risco.
- **Idade < 55**: critério de corte etário. É defensável quando ligado a requisito físico/visto documentado, mas precisa ficar **registrado como regra de negócio auditável com justificativa**, não como um `if` escondido no código. O motor de regras (doc 02) resolve isso.

### 4.4 Decisão automatizada — LGPD Art. 20
O candidato tem direito à revisão de decisões tomadas exclusivamente por tratamento automatizado. Por isso a triagem precisa ser **determinística, explicável e persistida com snapshot das entradas e da versão da regra** — e é por isso que **IA não pode estar no caminho de aprovar/reprovar**. IA entra em tradução, resumo e extração; nunca no veredito.

### 4.5 Recrutamento para trabalho no exterior
Lei 7.064/82 rege trabalhadores contratados no Brasil para prestar serviços no exterior. Vale confirmar com o cliente se ele opera como agência de recrutamento registrada — impacta quais documentos o sistema precisa arquivar.

> **Posição**: nada disso é motivo para não construir. É o cliente quem decide o conteúdo do formulário — ele é o controlador dos dados, você é o operador. Mas o sistema precisa nascer com criptografia, consentimento versionado e trilha de auditoria, porque adicionar isso depois custa 5× mais.

---

## 5. Análise do CCMEI — bloqueador fiscal real

CNPJ 63.310.253/0001-81, MEI, aberto em 22/10/2025, ATIVA. Guarulhos/SP.

**CNAE principal:** 4751-2/01 — Comércio varejista de equipamentos e suprimentos de informática.
**CNAEs secundários relevantes:** 8219-9/99 (preparação de documentos e serviços de apoio administrativo), 8599-6/03 (treinamento em informática).

### O problema

**Nenhum CNAE do seu MEI cobre desenvolvimento ou licenciamento de software.** E não adianta tentar incluir: **desenvolvimento de software não consta na lista de ocupações permitidas ao MEI** (Anexo XI da Resolução CGSN 140/2018). Você não consegue enquadrar 6201-5/01 nem 6202-3/00 como MEI.

Some-se: teto MEI de R$ 81.000/ano.

### Caminhos

| Opção | Como fica | Quando faz sentido |
|---|---|---|
| **A. Emitir sob 8219-9/99** | NF de "serviços de apoio administrativo / processamento de documentos" | Risco de reclassificação fiscal. Só como paliativo dos primeiros meses, e com o aval do seu contador |
| **B. Migrar para ME no Simples Nacional** ✅ | CNAE 6201-5/01 (software sob encomenda) + 6202-3/00 (licenciamento customizável) + 6209-1/00. Anexo III ou V conforme fator R | **Recomendado.** Custo: contador R$ 150–300/mês + tributos ~6% a 15,5% |
| **C. Sócio/parceiro com empresa aberta** | Fatura por terceiro | Gambiarra contratual, não recomendo |

### Sobre o certificado A1
Para NFS-e você provavelmente **não precisa** — MEI e ME emitem NFS-e Nacional pelo portal/app sem certificado na maioria dos municípios. Confirme na prefeitura de Guarulhos antes de gastar. Ele passa a importar quando você automatizar emissão via API.

### Ação imediata
Antes de assinar contrato com o japonês, alinhe com um contador: **(1)** migração MEI → ME, **(2)** CNAEs 6201/6202, **(3)** se a cobrança será em BRL ou JPY — se for JPY, é **exportação de serviço**, com regime tributário e obrigações cambiais diferentes (e geralmente mais favoráveis: ISS pode não incidir sobre exportação de serviço).

---

## 6. Perguntas que precisam ser respondidas na descoberta

Levar para a primeira reunião com o cliente:

1. Garoon é **cloud** (`*.cybozu.com`, tem REST API) ou **on-premise**? Define se a integração da Fase 2 é viável.
2. Volume: quantas candidaturas/mês? Quantos candidatos ativos no funil? (Dimensiona infra e custo de WhatsApp.)
3. Quantas agências indicadoras? Quantos usuários internos?
4. Quem gera o COE hoje e em qual sistema? O sistema só acompanha status ou precisa emitir documento?
5. A planilha exportada vai para **quem**? (Se é sistema, talvez dê para trocar por API e eliminar o Excel.)
6. Cobrança em **BRL ou JPY**? Quem é o contratante jurídico — a matriz japonesa ou uma filial brasileira?
7. Ele quer **exclusividade** do sistema no mercado dele? (Se sim, isso tem preço — e não é R$ 100/mês.)
8. A versão "Jun/2024" da ficha é a atual? Existe versão mais nova?
