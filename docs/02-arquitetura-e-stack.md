# 02 — Arquitetura, Stack e Custo de Infraestrutura

Produto: **SelectSys Jobs** — SaaS multi-tenant de recrutamento e gestão de processo dekassegui (Brasil → Japão).

---

## 1. Princípios de arquitetura

Cinco decisões que definem o resto:

1. **Multi-tenant desde a linha 1.** Você vende para o japonês, mas o produto é para as ~30 empreiteiras do mesmo mercado. Retrofit de multi-tenancy é o refactor mais caro que existe.
2. **Configuração > código.** Formulário, regras de triagem e pesos de matching são *dados*, não `if`. O cliente muda a regra de idade sozinho, você não faz deploy.
3. **Decisões auditáveis.** Toda triagem e todo score gravam entradas + versão da regra + resultado. Exigência da LGPD Art. 20 e, na prática, o que resolve discussão com o cliente.
4. **IA na periferia, nunca no veredito.** LLM traduz, resume, extrai e detecta inconsistência. Não aprova nem reprova ninguém.
5. **Monólito modular.** Um cliente. Microserviços aqui seriam autossabotagem. Módulos com fronteiras limpas dentro de um único deploy.

---

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript strict** | Server Actions eliminam metade da camada de API; SSR resolve SEO da página pública de vagas; um repo só |
| UI | **Tailwind CSS + shadcn/ui + Radix** | Você é dono do código dos componentes. Acessibilidade e i18n vêm de graça do Radix |
| Formulários | **react-hook-form + Zod**, com **renderer dirigido por schema** | O coração do produto. Ver §4 |
| Estado servidor | **TanStack Query + TanStack Table** | Cache, filtros e tabelas virtualizadas do painel |
| Banco | **PostgreSQL 16** (+ `pgcrypto`, `pg_trgm`, `unaccent`) | JSONB + RLS + full-text em português numa peça só. Zero necessidade de NoSQL |
| ORM | **Drizzle ORM** | SQL-first, migrations legíveis, tipagem real. Prisma seria mais lento e mais opaco aqui |
| Auth | **Auth.js v5** — magic link (candidato), e-mail+senha+TOTP (staff), OTP por WhatsApp (opcional) | Candidato brasileiro não guarda senha. Magic link elimina 90% do suporte |
| Filas / jobs | **pg-boss** (fila em cima do Postgres) | Zero infra extra. Redis + BullMQ só depois de ~50 jobs/min |
| Storage | **Cloudflare R2** (S3-compatible), upload direto por URL pré-assinada | 10 GB grátis e **sem custo de egress** — decisivo com fotos e documentos |
| E-mail | **Resend** + React Email | 3.000/mês grátis, DX excelente |
| WhatsApp | **Meta WhatsApp Cloud API** | Único caminho oficial. Nada de bibliotecas não oficiais — banem o número do cliente |
| IA | **Claude (`claude-sonnet-5`)** via Anthropic SDK | Tradução PT↔JA, resumo, OCR por visão, extração estruturada |
| Excel | **ExcelJS** preenchendo o **.xls original como template** | Preserva o layout exatamente. Gerar do zero jamais bate |
| PDF | **@react-pdf/renderer** | Sem headless Chrome, sem 300 MB de container |
| i18n | **next-intl** (pt-BR, ja-JP, es) | Roteamento por locale, formatação de data japonesa |
| Pagamentos | **Asaas** (BRL: PIX, boleto, assinatura) + **Stripe** (JPY/internacional) | Asaas é o melhor para recorrência em BRL e integra NF |
| Observabilidade | **Sentry** (free) + **Better Stack** (free) | Erro + log + uptime sem custo até escala real |
| CI/CD | **GitHub Actions → Docker → Coolify** | Deploy por push, rollback em um clique |

### Por que não

- **Vercel**: Hobby proíbe uso comercial; Pro são US$20/mês/membro. Estoura o orçamento.
- **Supabase Pro**: US$25/mês (~R$140) sozinho consome quase todo o teto. Ótimo produto, errado para *este* orçamento. (Free tier: 500 MB de banco — insuficiente com fotos e documentos.)
- **Firebase/Firestore**: modelo relacional forte + RLS + relatórios pedem SQL. Firestore vira dor em 3 meses.
- **Microserviços / Kubernetes**: over-engineering para 1 cliente.

---

## 3. Infraestrutura e custo

### Topologia

```
                    Cloudflare (DNS + CDN + WAF + Rate limit)  — grátis
                                 │
                    ┌────────────┴────────────┐
                    │   VPS Hetzner CPX21     │   Coolify (PaaS self-hosted)
                    │   3 vCPU / 4 GB / 80 GB │
                    │   Região: Ashburn (US)  │
                    ├─────────────────────────┤
                    │  Next.js  (container)   │
                    │  Worker pg-boss (cont.) │
                    │  PostgreSQL 16 (cont.)  │
                    │  Caddy / TLS automático  │
                    └────────────┬────────────┘
                                 │
        ┌──────────────┬─────────┴────────┬──────────────┐
   Cloudflare R2    Resend          Meta WhatsApp    Anthropic API
   (docs/fotos)    (e-mail)          Cloud API        (IA)
```

**Região Ashburn (US-East)**: ~110 ms para São Paulo, ~150 ms para Tóquio. É o melhor compromisso para uma aplicação com usuários nos dois lados. Falkenstein (Alemanha) é mais barato mas fica em ~200 ms de ambos. A LGPD **não** exige hospedagem no Brasil — exige garantias contratuais de transferência internacional, que entram no DPA.

### Custo mensal — MVP e ano 1
*Premissas: US$ 1 = R$ 5,50 · € 1 = R$ 6,30 · 100 candidaturas/mês*

| Item | Custo |
|---|---:|
| VPS Hetzner CPX21 (3 vCPU / 4 GB / 80 GB) | R$ 48 |
| Backup automático Hetzner (20%) | R$ 10 |
| Cloudflare (DNS, CDN, WAF, R2 10 GB) | R$ 0 |
| Domínio `.com.br` (R$ 40/ano) | R$ 3 |
| Resend (até 3.000 e-mails/mês) | R$ 0 |
| Sentry + Better Stack (free tier) | R$ 0 |
| **Subtotal fixo** | **R$ 61** |
| WhatsApp Cloud API (~500 mensagens de template) | R$ 25 * |
| Claude API (~100 candidaturas: tradução + resumo + OCR) | R$ 18 * |
| **Total com variáveis** | **R$ 104** |

\* **Repassar ao cliente como custo variável.** São itens de consumo dele, não seus. Ver doc 04.

### Margem
Fixo R$ 61 contra assinatura de R$ 100 → **~39% de margem no primeiro cliente**, e essencialmente 100% de margem em cada cliente adicional (o mesmo VPS aguenta 8–10 organizações desse porte). É onde o modelo SaaS efetivamente ganha.

### Quando escalar
- **> 5 organizações ou > 300 candidatos/mês** → CPX31 (R$ 90/mês)
- **> 20 GB de arquivos** → R2 a US$ 0,015/GB (~R$ 0,08/GB) — irrisório
- **> 50 jobs/min** → separar worker em VPS próprio
- **Banco > 20 GB** → Postgres gerenciado (Neon/Supabase), aí sim justificado

---

## 4. O motor do produto: schema de formulário versionado

É isso que separa um formulário bonito de um SaaS vendável.

O formulário **não** é JSX escrito à mão. É um documento de definição, guardado no banco, versionado, por organização:

```jsonc
// form_schemas.definition — versão 2024.06 (FUJIARTE)
{
  "version": "2024.06",
  "locale_default": "pt-BR",
  "steps": [
    {
      "id": "identificacao",
      "title": { "pt-BR": "Identificação", "ja-JP": "本人確認" },
      "fields": [
        { "key": "nome_completo", "type": "text", "required": true,
          "transform": "uppercase", "hint": { "pt-BR": "Conforme RG" } },
        { "key": "data_nascimento", "type": "date", "required": true,
          "derives": [{ "key": "idade", "fn": "years_since" }] },
        { "key": "geracao", "type": "select", "required": true,
          "options": ["issei","nissei","sansei","yonsei","nao_descendente"],
          "visible_when": { "nacionalidade": "BRAS" } }
      ]
    },
    {
      "id": "saude",
      "sensitive": true,            // → tabela criptografada + log de acesso
      "consent_required": "saude_v1",
      "fields": [ /* Q16–Q31 */ ]
    }
  ],
  "export_map": {                    // ← liga campo → célula do .xls original
    "nome_completo": "Ficha cadastral!G6",
    "data_nascimento": "Ficha cadastral!G16",
    "geracao": "Ficha cadastral!AI18"
  }
}
```

O que isso entrega:

- **Um renderer só** desenha qualquer formulário — sem tela nova para campo novo.
- **Zod gerado em runtime** a partir do schema: mesma validação no cliente e no servidor.
- **Versionamento real**: a candidatura guarda `form_version`. Alterar o formulário nunca corrompe ficha antiga — exatamente o que o "Jun/2024" no rodapé da planilha tenta fazer no papel.
- **`export_map`** mantém o Excel fiel para sempre: mudou a planilha, muda o mapa, não o código.
- **`sensitive: true`** aciona automaticamente criptografia, consentimento e trilha de auditoria.
- Você vende para a próxima empreiteira **configurando**, não reescrevendo.

---

## 5. Motor de regras de triagem

Regras como dados, versionadas, avaliadas no servidor:

```jsonc
{
  "ruleset_version": 3,
  "rules": [
    {
      "id": "idade_maxima",
      "priority": 10,
      "when":   { "all": [ { "fact": "idade", "op": ">=", "value": 55 } ] },
      "unless": { "any": [ { "fact": "trabalhou_mesma_empresa", "op": "==", "value": true } ] },
      "then":   { "outcome": "reprovar",
                  "reason_code": "IDADE_ACIMA_LIMITE",
                  "message": { "pt-BR": "Idade acima de 55 anos sem histórico na mesma empresa." } }
    },
    {
      "id": "descendencia_obrigatoria",
      "priority": 20,
      "when": { "all": [ { "fact": "geracao", "op": "==", "value": "nao_descendente" } ] },
      "then": { "outcome": "encerrar_fluxo", "reason_code": "SEM_DESCENDENCIA" }
    },
    {
      "id": "tatuagem_revisao",
      "priority": 30,
      "when": { "all": [ { "fact": "tem_tatuagem", "op": "==", "value": true } ] },
      "then": { "outcome": "revisao_manual",
                "solicitar_documento": "foto_tatuagem",
                "quando": "pos_entrevista" }
    }
  ]
}
```

Resultados possíveis: `aprovar` · `reprovar` · `revisao_manual` · `encerrar_fluxo`.

Cada avaliação grava em `screening_decisions`: snapshot dos fatos de entrada, `ruleset_version`, regras disparadas, resultado e timestamp. Isso dá:
- resposta imediata a "por que esse candidato foi reprovado?";
- conformidade com o Art. 20 da LGPD (direito à revisão);
- possibilidade de **reprocessar** todo o banco quando a regra mudar, e comparar os dois resultados antes de aplicar.

Editor visual dessas regras entra na Fase 3 — no MVP, você edita o JSON pelo painel de super-admin.

---

## 6. Matching / compatibilidade (o serviço premium)

Dois estágios, **totalmente determinístico**:

**Estágio 1 — Hard constraints (elimina).** Descendência, idade, visto válido, disponibilidade de turno, restrição de saúde incompatível com o posto (ex.: daltonismo × inspeção visual de componentes eletrônicos; hérnia × posto de carga). Falhou uma → score 0, com o motivo.

**Estágio 2 — Score ponderado 0–100.** Pesos configuráveis por vaga:

| Critério | Peso sugerido |
|---|---:|
| Experiência no mesmo setor (eletrônica/autopeças/alimentício) | 25 |
| Experiência prévia no Japão / na mesma empreiteira | 20 |
| Compatibilidade de turno e horas extras | 15 |
| Preferência de província × província da vaga | 10 |
| Nível de japonês | 10 |
| Aptidão física para o posto (em pé, peso, ergonomia) | 10 |
| Disponibilidade de embarque × prazo da vaga | 10 |

**Saída sempre explicável** — nunca só um número:

```
Compatibilidade 78/100 — Fábrica Aichi / Autopeças / turno alternado
  ✓ 3 anos em autopeças (Toyota Boshoku)         +25
  ✓ Aceita turno alternado                        +15
  ✓ Já trabalhou no Japão (Aichi)                 +20
  ✗ Nível de japonês: básico (vaga pede intermediário)   0 / 10
  ⚠ Embarque pretendido em 6 meses; vaga fecha em 60 dias  +4 / 10

  Para chegar a 90+: comprovar N4 e antecipar disponibilidade.
```

**Esse "para chegar a 90+" é o produto premium.** O candidato não paga por um número — paga por saber o que fazer. Ranking de vagas abertas + plano de ação, R$ 29–49 avulso ou R$ 19/mês.

**Onde a IA entra (e só aí):**
- traduzir o perfil PT→JA para o staff japonês ler em 30 segundos em vez de 10 minutos;
- transformar histórico em texto livre ("trabalhei na Nissin em Shizuoka de 2019 a 2021") em registros estruturados;
- OCR de passaporte / RG / carteira de residente por visão;
- apontar inconsistências ("declarou nunca ter ido ao Japão, mas informou Reentry Permit");
- gerar o one-pager de apresentação do candidato à empresa japonesa.

**Onde a IA nunca entra:** aprovar, reprovar ou calcular o score.

---

## 7. Modelo de dados (núcleo)

```
organizations ──┬── users ── memberships (role)
                ├── agencies ──── agency_links (código único)
                ├── form_schemas (versionadas)
                ├── rulesets (versionadas)
                ├── jobs (vagas) ── job_requirements
                └── candidates ──┬── applications ──┬── application_data (JSONB)
                                 │                  ├── screening_decisions
                                 │                  ├── pipeline_events
                                 │                  └── match_scores
                                 ├── work_history (1:N Japão/Brasil)
                                 ├── family_members
                                 ├── documents (state machine)
                                 ├── candidate_health  🔒 criptografada
                                 └── consents (versionados)

audit_log · notifications · message_templates · subscriptions · billing_events
```

DDL completo, com RLS e criptografia: [`docs/schema/schema.sql`](schema/schema.sql).

**Isolamento multi-tenant**: `organization_id` em toda tabela + **RLS no Postgres** com `current_setting('app.current_org')`. Segurança no banco, não na aplicação — um bug de query não vaza dados entre clientes.

---

## 8. Máquinas de estado

**Documento:** `nao_solicitado → solicitado → enviado → conferido` (e `→ rejeitado → solicitado`). Toda transição gera evento com autor e timestamp.

**Candidatura (17 estados do infográfico):**
```
rascunho → recebida → verificacao_documentos → aguardando_entrevista →
entrevista_realizada → aprovado_entrevista → curriculo_enviado_japao →
selecao_empresa_japonesa → entrevista_empresa_japonesa → aprovado_oferta →
preparacao_coe → coe_andamento → coe_emitido → visto_andamento →
visto_emitido → preparacao_viagem → chegada_japao → admissao_concluida
```
Terminais: `reprovado`, `desistente`, `inativo`.

Transições permitidas declaradas em tabela (não em código) — o cliente ajusta o funil sem deploy. Cada transição vira `pipeline_events`, que alimentam dashboard, alertas e SLA por etapa.

---

## 9. Segurança e conformidade

| Controle | Implementação |
|---|---|
| Isolamento entre clientes | RLS no Postgres, `organization_id` obrigatório |
| Dados sensíveis de saúde | Tabela apartada, AES-256-GCM em nível de coluna, chave em KMS/env fora do banco |
| Acesso a dados sensíveis | Registrado em `audit_log` — quem, quando, qual candidato, qual campo |
| Consentimento | `consents` versionado: texto, versão, timestamp, IP, user-agent |
| Uploads | URL pré-assinada, validação de MIME real (magic bytes, não extensão), limite de tamanho, varredura antivírus na Fase 2 |
| Autenticação | Magic link (candidato), senha + TOTP obrigatório (staff), sessão 8 h para staff |
| Rate limiting | Cloudflare + rate limit por IP e por conta na aplicação |
| Backup | Snapshot diário Hetzner + `pg_dump` diário para R2, retenção 30 dias, **restore testado mensalmente** |
| Retenção | Expurgo automático 24 meses após último contato, configurável por organização |
| Direitos do titular | Endpoints de exportação (portabilidade) e exclusão de dados, self-service |
| Segredos | Nunca no repo; env criptografado no Coolify; rotação semestral |

---

## 10. Estrutura do repositório

```
selectsys/
├─ apps/web/                  # Next.js 15
│  ├─ app/[locale]/(public)/       # landing, vagas públicas, link da agência
│  ├─ app/[locale]/(candidato)/    # formulário, portal, premium
│  ├─ app/[locale]/(admin)/        # painel, kanban, vagas, relatórios
│  └─ app/api/webhooks/            # whatsapp, asaas, stripe
├─ packages/
│  ├─ db/            # Drizzle: schema, migrations, seeds, políticas RLS
│  ├─ core/          # domínio puro, sem I/O — testável a seco
│  │  ├─ screening/  # motor de regras
│  │  ├─ matching/   # scoring
│  │  ├─ pipeline/   # máquina de estados
│  │  └─ forms/      # schema → Zod, avaliação de visible_when
│  ├─ export/        # ExcelJS (template .xls) + PDF
│  ├─ ai/            # wrappers Claude: tradução, extração, OCR
│  ├─ messaging/     # WhatsApp Cloud API + Resend
│  └─ ui/            # design system compartilhado
├─ workers/          # consumidores pg-boss
└─ docs/
```

`packages/core` sem nenhuma dependência de I/O é o que permite testar as regras de negócio de verdade — motor de regras e scoring cobertos por testes de unidade e property-based, sem banco, sem rede.

---

## 11. Testes

| Nível | Ferramenta | Alvo |
|---|---|---|
| Unidade | Vitest | `packages/core` — regras, scoring, transições. **Meta: 90%** |
| Property-based | fast-check | Motor de regras: nenhuma combinação de entrada produz estado inválido |
| Integração | Vitest + Testcontainers (Postgres) | **RLS: provar que a org A não enxerga dados da org B.** Teste mais importante do sistema |
| E2E | Playwright | Candidatura completa mobile, triagem, exportação do Excel |
| Snapshot de exportação | Vitest | .xls gerado bate célula a célula com o gabarito |
| Carga | k6 | 100 candidaturas simultâneas no VPS-alvo |
