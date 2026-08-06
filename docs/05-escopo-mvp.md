# 05 — Escopo do MVP (Anexo Contratual)

> **Este documento é o anexo de escopo do contrato.** O que está em "ENTRA" é entregue nas 6 semanas pelos R$ 1.200. O que está em "NÃO ENTRA" é orçamento separado. Não existe zona cinzenta.

**Objetivo único do MVP:** *a FUJIARTE para de usar planilha Excel para captar e triar candidatos.*

Se no fim da semana 6 o cliente processar 10 candidaturas reais sem abrir o Excel — e a planilha exportada sair idêntica à atual — o MVP está entregue. Nada mais é critério de sucesso.

---

## 1. A linha de corte

### ✅ ENTRA no MVP (14 itens)

| # | Item | Por que é indispensável |
|---|---|---|
| 1 | Formulário público mobile, 7 etapas, com as ~130 perguntas da ficha FUJIARTE | É o que substitui a planilha |
| 2 | Autosave a cada 3s + retomada por link ("continuar depois") | Sem isso a taxa de conclusão de 130 campos despenca |
| 3 | Upload de foto do candidato (câmera do celular, recorte, compressão) | Campo obrigatório da ficha |
| 4 | Seletor de tatuagem — lista de 11 regiões do corpo (checkbox) | Regra de negócio crítica do cliente |
| 5 | Consentimento LGPD com bloco separado para dados de saúde | Exigência legal, não opcional |
| 6 | Triagem automática — 3 regras (idade, descendência, tatuagem) | Elimina a conferência manual |
| 7 | Login administrativo (e-mail + senha + 2FA) | Óbvio |
| 8 | Lista de candidatos com busca e filtros (nome, idade, cidade, status, agência) | Substitui o Ctrl+F na planilha |
| 9 | Ficha do candidato — visão consolidada + timeline de eventos | Onde o entrevistador trabalha |
| 10 | Mudança de status por dropdown + histórico | O funil, na forma mais simples |
| 11 | **Exportação .xls no layout exato da ficha atual** | **Bloqueador de adoção — sem isso não há venda** |
| 12 | Exportação PDF da ficha com foto | Pedido explícito no infográfico |
| 13 | Link por agência (`/c/{codigo}`) + vínculo automático do candidato | Modelo de captação do cliente |
| 14 | E-mail de confirmação ao candidato (Resend) | Reduz "recebeu minha ficha?" |

### ❌ NÃO ENTRA no MVP

| Item | Fase | Motivo do corte |
|---|---|---|
| WhatsApp automático | 2 | Homologação de templates na Meta leva 1–2 semanas fora do seu controle |
| Kanban com drag-and-drop | 2 | Dropdown de status resolve 90% do valor por 10% do esforço |
| Cadastro de vagas + matching/compatibilidade | 2 | Só faz sentido com base de candidatos já formada |
| Dashboard com gráficos | 2 | A lista com filtros já responde as perguntas do dia a dia |
| Integração Garoon | 2 | Depende de confirmar se é cloud ou on-premise |
| Alertas e lembretes automáticos | 2 | Precisa de dados históricos para calibrar prazos |
| Gestão de documentos além da foto | 2 | Máquina de estados completa é 15h sozinha |
| Portal do candidato | 3 | — |
| Compatibilidade Premium (B2C) | 3 | — |
| Gestão de vistos e COE | 3 | — |
| Editor visual de regras e de formulário | 3 | No MVP você edita o JSON pelo painel de super-admin |
| Painel em japonês | 2 | MVP em pt-BR + glossário de termos JP impresso |
| Mapa corporal SVG clicável para tatuagem | 2 | Lista de 11 checkboxes entrega o mesmo dado |
| Onboarding self-service de nova organização | 2 | Cliente #2 você cria manualmente no banco |

> **O schema multi-tenant (`organization_id` + RLS) entra no MVP mesmo assim.** Custa ~4 horas agora e economiza ~40 horas depois. É a única coisa "do futuro" que se paga imediatamente.

---

## 2. User Stories com critérios de aceite

Formato: `Como <papel>, quero <ação>, para <valor>`. Critérios verificáveis — se não dá para testar, não é critério.

---

### ÉPICO A — Candidatura

**A1 · Preencher a ficha pelo celular** — 8 SP
> Como **candidato**, quero preencher minha ficha pelo celular, para não depender de computador.

- [ ] Formulário abre em 7 etapas com barra de progresso visível
- [ ] Todos os ~130 campos da ficha FUJIARTE Jun/2024 estão presentes
- [ ] Campos com máscara: CPF, CEP, telefone, passaporte, datas
- [ ] CEP preenche endereço automaticamente (ViaCEP)
- [ ] Idade é calculada e exibida ao vivo ao informar a data de nascimento
- [ ] Campos condicionais funcionam (ex.: "Geração" só aparece se nacionalidade = BRAS)
- [ ] Validação impede avançar de etapa com campo obrigatório vazio, com mensagem clara
- [ ] Lighthouse mobile ≥ 90 em Performance e Accessibility

**A2 · Salvar e continuar depois** — 6 SP
> Como **candidato**, quero salvar e voltar depois, para não perder o preenchido.

- [ ] Rascunho salvo automaticamente a cada 3 segundos, sem clique
- [ ] Indicador visual "Salvo" após cada gravação
- [ ] Botão "Continuar depois" envia link mágico ao e-mail informado
- [ ] O link restaura o rascunho exatamente na etapa onde parou
- [ ] Link expira em 30 dias
- [ ] Fechar o navegador e reabrir pelo mesmo dispositivo restaura o rascunho

**A3 · Anexar foto** — 5 SP
> Como **candidato**, quero anexar minha foto direto pela câmera, para não precisar transferir arquivo.

- [ ] Botão abre a câmera do celular diretamente
- [ ] Aceita também upload da galeria (JPG, PNG)
- [ ] Recorte quadrado com preview antes de confirmar
- [ ] Compressão client-side para ≤ 500 KB
- [ ] Upload direto ao Cloudflare R2 por URL pré-assinada (não passa pelo servidor)
- [ ] Rejeita arquivo cujo conteúdo real não seja imagem (validação por magic bytes, não por extensão)

**A4 · Informar tatuagem** — 3 SP
> Como **candidato**, quero indicar onde tenho tatuagem, para o processo seguir corretamente.

- [ ] Pergunta "Tem tatuagem? Sim/Não"
- [ ] Se Sim: lista com as 11 regiões da ficha (cabeça, rosto, pescoço, peito, costas, ombros, braços, mãos, abdômen, cintura, pernas) — múltipla escolha
- [ ] Opção "Sem tatuagem" explícita
- [ ] **Nenhuma foto é solicitada nesta etapa** (regra do cliente)

**A5 · Consentir com o tratamento dos dados** — 4 SP
> Como **candidato**, quero saber o que é feito com meus dados, para consentir de forma informada.

- [ ] Consentimento geral obrigatório antes de enviar
- [ ] **Consentimento separado e destacado** para os dados de saúde (perguntas 16 a 31)
- [ ] Texto do consentimento versionado (`geral_v1`, `saude_v1`)
- [ ] Registro persiste: versão do texto, timestamp, IP e user-agent
- [ ] Sem consentimento de saúde, o bloco de perguntas 16–31 é pulado e a candidatura segue

---

### ÉPICO B — Triagem

**B1 · Triar automaticamente na submissão** — 6 SP
> Como **administrador**, quero que o sistema aplique as regras sozinho, para não conferir 130 campos manualmente.

- [ ] Ao enviar, as 3 regras rodam no servidor: idade, descendência, tatuagem
- [ ] `idade ≥ 55` **e** não trabalhou na mesma empresa → **Reprovado**
- [ ] `geração = não descendente` → **Fluxo encerrado**
- [ ] `tem tatuagem = sim` → **Revisão manual** + marca "solicitar foto pós-entrevista"
- [ ] Nenhuma regra disparou → **Aprovado para entrevista**
- [ ] Resultado gravado com snapshot dos dados de entrada, versão do ruleset, regras disparadas e timestamp
- [ ] Motivo da decisão visível em texto na ficha do candidato
- [ ] Regras vivem em JSON no banco — mudar o limite de idade **não exige deploy**

---

### ÉPICO C — Painel Administrativo

**C1 · Entrar no sistema com segurança** — 4 SP
> Como **administrador**, quero login protegido, para os dados dos candidatos não vazarem.

- [ ] Login com e-mail + senha
- [ ] 2FA por app autenticador (TOTP) obrigatório para papéis internos
- [ ] Sessão expira em 8 horas
- [ ] Rate limit: 5 tentativas por IP a cada 15 minutos
- [ ] Recuperação de senha por e-mail

**C2 · Encontrar candidatos rapidamente** — 7 SP
> Como **administrador**, quero buscar e filtrar candidatos, para achar quem eu preciso em segundos.

- [ ] Tabela com: foto, nome, idade, cidade/UF, nível de japonês, status, agência, data
- [ ] Busca por nome tolerante a acento e a erro de digitação
- [ ] Filtros combináveis: faixa etária, UF, status, agência, período
- [ ] Ordenação por qualquer coluna
- [ ] Paginação server-side, 50 por página
- [ ] Resposta < 500 ms com 1.000 candidatos na base

**C3 · Ver a ficha completa** — 7 SP
> Como **entrevistador**, quero ver tudo do candidato em uma tela, para conduzir a entrevista.

- [ ] Todos os blocos da ficha, agrupados como no papel
- [ ] Foto em destaque
- [ ] Idade calculada, não a informada
- [ ] Currículo Japão e Brasil em ordem cronológica
- [ ] **Bloco de saúde vem oculto**, com botão "Revelar dados de saúde"
- [ ] Revelar registra em `audit_log`: quem, quando, qual candidato
- [ ] Campo de notas internas (invisível ao candidato)
- [ ] Timeline com todos os eventos do processo

**C4 · Mover o candidato no funil** — 6 SP
> Como **administrador**, quero mudar o status, para acompanhar onde cada um está.

- [ ] Dropdown com os 17 status do processo
- [ ] Apenas transições permitidas aparecem (tabela de transições no banco)
- [ ] Cada mudança grava evento com autor, timestamp e nota opcional
- [ ] Histórico completo visível na timeline
- [ ] Mudança em massa: selecionar vários e mover juntos

---

### ÉPICO D — Exportação *(maior risco técnico do projeto)*

**D1 · Exportar no layout exato da planilha atual** — 12 SP
> Como **administrador**, quero exportar a ficha no formato de hoje, para não quebrar o que já funciona com o Japão.

- [ ] Botão "Exportar Excel" na ficha e na lista (seleção múltipla)
- [ ] Gera a partir do arquivo `.xls` **original como template**, preenchendo células
- [ ] Mapeamento campo → célula vive no `export_map` do schema (não em código)
- [ ] Layout, mesclagens, bordas e fontes **idênticos** ao original
- [ ] Foto do candidato inserida na posição correta
- [ ] Datas no formato japonês (Ano/Mês/Dia)
- [ ] Currículo truncado em 4 entradas Japão + 2 Brasil (limite físico da folha)
- [ ] **Teste automatizado compara célula a célula com o gabarito e falha no CI se divergir**

**D2 · Exportar em PDF** — 5 SP
> Como **administrador**, quero um PDF da ficha, para imprimir ou anexar em e-mail.

- [ ] PDF A4, 2 páginas, com foto
- [ ] Legível impresso em preto e branco
- [ ] Nome do arquivo: `{nome-do-candidato}-{AAAAMMDD}.pdf`

---

### ÉPICO E — Agências

**E1 · Captar por link exclusivo** — 4 SP
> Como **administrador**, quero dar um link a cada agência, para saber quem indicou cada candidato.

- [ ] CRUD de agências: nome, código, responsável, e-mail, telefone
- [ ] Link exclusivo `selectsys.com.br/c/{codigo}`
- [ ] Candidato que entra pelo link fica vinculado automaticamente à agência
- [ ] Nome da agência aparece na lista e na ficha
- [ ] Filtro por agência na lista de candidatos

**E2 · Ver só os próprios candidatos** — 3 SP
> Como **agência**, quero acessar apenas meus candidatos, para acompanhar meu trabalho.

- [ ] Login de agência
- [ ] Vê exclusivamente candidatos vinculados ao seu código — **garantido por RLS no banco, não por filtro na query**
- [ ] Vê nome, status e data — **não vê dados de saúde nem notas internas**
- [ ] Contadores: total indicado, em entrevista, aprovados

---

### ÉPICO F — Fundação *(invisível ao cliente, indispensável)*

**F1 · Base multi-tenant** — 6 SP
- [ ] Schema completo com `organization_id` em todas as tabelas
- [ ] RLS ativa no PostgreSQL
- [ ] **Teste de integração prova que a organização A não enxerga dados da B** — é o teste mais importante do sistema
- [ ] Tabela de saúde apartada e criptografada em nível de coluna (AES-256-GCM)
- [ ] `audit_log` gravando acessos a dado sensível

**F2 · Deploy e operação** — 5 SP
- [ ] VPS + Coolify + Docker provisionados
- [ ] Cloudflare com DNS, TLS, WAF e rate limit
- [ ] CI/CD por push no GitHub Actions
- [ ] Backup diário automático + dump para R2
- [ ] **Restore testado uma vez antes do go-live** — backup não testado não é backup
- [ ] Sentry e Better Stack ativos

**F3 · Go-live** — 5 SP
- [ ] Migração dos dados históricos das planilhas existentes
- [ ] Treinamento de 2h com o cliente, gravado
- [ ] Manual em PDF (português) + glossário de termos em japonês
- [ ] Checklist de aceite assinado pelo cliente

---

## 3. Total do MVP

| Épico | SP | Horas |
|---|---:|---:|
| A — Candidatura | 26 | 52 |
| B — Triagem | 6 | 12 |
| C — Painel | 24 | 48 |
| D — Exportação | 17 | 34 |
| E — Agências | 7 | 14 |
| F — Fundação | 16 | 32 |
| **Total** | **96 SP** | **192 h** |

> **Ajuste de calibração:** 96 SP a 2h/SP daria 192h. O plano de sprints ([doc 06](06-backlog-scrum.md)) trabalha com **140 horas** porque histórias do mesmo épico compartilham setup e contexto — o ganho de agrupamento é real e está refletido na velocidade planejada de 16 SP/sprint em 23h. **Se a velocidade real das duas primeiras sprints ficar abaixo de 14 SP, o escopo precisa ser cortado, não as horas esticadas.** O candidato natural ao corte é o Épico E (agências, 7 SP) — vai para a Fase 2.

---

## 4. Definição de Pronto (DoD)

Uma história só é "Pronta" quando **todos** os itens abaixo são verdadeiros:

- [ ] Todos os critérios de aceite marcados
- [ ] Testes automatizados escritos e passando
- [ ] Zero erro de TypeScript, zero `any`, zero `console.log`
- [ ] Funciona em Chrome Android e Safari iOS (telas do candidato)
- [ ] Estados de carregamento, erro e vazio implementados
- [ ] Se toca dado sensível: gera registro de auditoria
- [ ] Migration reversível
- [ ] Deployado em staging e validado
- [ ] Registrado no changelog do cliente

---

## 5. Fora de escopo — declaração explícita

Para evitar interpretação, o contrato deve afirmar que **não** estão incluídos no MVP:

- Qualquer integração com sistema de terceiros (Garoon, ERP, contabilidade)
- Aplicativo nativo iOS ou Android
- Migração de dados além das planilhas Excel existentes
- Suporte fora do horário comercial brasileiro
- Treinamento além das 2 horas previstas
- Customizações visuais além de logo e cores
- Qualquer idioma além de português no painel administrativo
- SLA de disponibilidade superior a 99%
