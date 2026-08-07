# 13 — Banco de Dados

**Projeto:** `selectSys-Jobs` · Supabase · PostgreSQL 17 · região `sa-east-1` (São Paulo)
**Referência do projeto:** `cpucbenejecedextdltn`

> São Paulo e não Virgínia: ~15 ms para o candidato brasileiro, que é quem
> preenche 130 campos no celular. O analista japonês faz poucas consultas
> pesadas por dia — a latência dele importa menos que a taxa de conclusão dele.

---

## 1. Por que Supabase e não o Postgres em VPS

O [doc 02](02-arquitetura-e-stack.md) escolheu PostgreSQL 16 próprio em Hetzner + Coolify e
descartou Supabase por custo (US$ 25/mês contra assinatura de R$ 100). Essa
decisão foi tomada **antes** de existir o prazo da Fase 0.

O que mudou: o plano gratuito atende o MVP (500 MB, RLS nativa, Auth pronto,
`pgcrypto` disponível), e a Fase 1 começa em 11/08 precisando de banco no ar.
Provisionar VPS, Coolify, TLS, backup e restore testado antes disso consumiria
os dias que sobraram.

**O que isso custa:** o projeto pausa após uma semana sem uso e o limite de 500 MB
chega quando as fotos crescerem. **Quando reavaliar:** ao passar de ~300
candidatos ou quando entrar o segundo cliente pagante. A migração é um `pg_dump`
— nada no schema depende de recurso exclusivo do Supabase além de `auth.users`.

---

## 2. Migrations aplicadas

| # | Nome | O que faz |
|---|---|---|
| 001 | `extensoes_enums_contexto` | `pgcrypto`, `pg_trgm`, `unaccent`, `citext`; 7 enums |
| 002 | `tenants_perfis_membros_agencias` | `organizations`, `profiles`, `memberships`, `agencies` |
| 003 | `configuracao_versionada` | `form_schemas`, `rulesets`, `pipeline_transitions` |
| 004 | `candidatos_saude_consentimentos` | `candidates`, `work_history`, `family_members`, `candidate_health`, `consents` |
| 005 | `vagas_candidaturas_funil` | `jobs`, `applications`, `application_data`, `screening_decisions`, `match_scores`, `pipeline_events` |
| 006 | `documentos_comunicacao_auditoria` | `documents`, `upload_links`, `messages`, `audit_log`, `subscriptions` |
| 007 | `row_level_security` | RLS em todas as tabelas + políticas |
| 008 | `seed_fujiarte_regras_transicoes` | FUJIARTE, 2 agências, 3 regras, 34 transições |
| 009 | `endurece_helpers_e_search_path` | Helpers para o schema `private`; `search_path` fixo |
| 010 | `revoga_execute_rls_auto_enable` | Tira do alcance da API |
| 011–014 | `submeter_candidatura` | Submissão atômica e idempotente |
| 015 | `audit_log_bloqueia_truncate` | Trilha imune também a `TRUNCATE` |

**Estado atual:** 24 tabelas, 24 com RLS, 0 sem, 25 políticas, **zero avisos** no
auditor de segurança do Supabase.

---

## 3. Isolamento — como funciona

O schema de referência resolvia o tenant por `current_setting('app.current_org')`,
o que pressupõe `SET LOCAL` a cada transação. No Supabase quem chega é o
PostgREST com o JWT do usuário, então a origem da verdade é `auth.uid()` e o
vínculo vem de `memberships`.

É mais seguro: **não depende de a aplicação lembrar de setar a variável**. Se
alguém esquecer, a consulta não vaza — ela não retorna nada.

Os helpers vivem no schema `private`, que o PostgREST não expõe. Em `public` eles
viravam endpoint (`/rest/v1/rpc/app_current_org`). Não dá para só revogar
`EXECUTE`: a política é avaliada com os privilégios de quem consulta, então
revogar quebraria a própria RLS.

### Dado de saúde — dupla barreira

`candidate_health` exige organização correta **e** papel autorizado
(`super_admin`, `org_admin`, `entrevistador`). Recrutador e agência não leem o
Bloco B. LGPD Art. 11.

---

## 4. Atomicidade e idempotência

Enviar a ficha toca sete tabelas. Se fossem sete chamadas do navegador, uma falha
no meio deixaria candidato sem consentimento registrado — o que é **infração, não
registro parcial**. Por isso o envio é uma função só, `submeter_candidatura`,
dentro de uma transação.

**Idempotência** pela chave natural `(organization_id, cpf)`:

- candidato: `upsert` — reenviar atualiza, nunca cria um segundo;
- blocos 1:N: substituídos, não acumulados;
- consentimentos: um registro vigente por tipo;
- parecer de triagem: substituído, **exceto** se já revisado por humano — a
  máquina não apaga decisão de pessoa (Art. 20);
- candidatura: reaproveitada enquanto for do mesmo formulário, **inclusive
  quando reprovada**. Abrir processo novo para reprovado é decisão humana no
  painel, não efeito de duplo clique.

### Resultados medidos

```
IDEMPOTÊNCIA   6 submissões (3× de 2 fichas)
               → 2 candidatos · 2 candidaturas · 1 histórico · 1 familiar · 2 decisões

ATOMICIDADE    falha forçada depois do upsert do candidato
               → 0 candidato órfão · 0 consentimento órfão

ISOLAMENTO     FUJIARTE org_admin ......... 2 candidatos (só os próprios)
               World Intec org_admin ...... 1 candidato (não vê a concorrente)
               Anônimo (chave publicável) . 0 candidatos

TRIAGEM        58 anos, sem passagem prévia → reprovar
               não descendente ............ encerrar_fluxo
               tatuagem declarada ......... revisao_manual
               29 anos, yonsei, sem tatuagem → aprovar
```

---

## 5. Auditoria append-only

`audit_log` bloqueia `UPDATE`, `DELETE` **e** `TRUNCATE` por gatilho. O primeiro
teste tentou apagar a própria trilha e foi barrado — que é exatamente o
comportamento esperado. Uma trilha que pode ser editada não é trilha.

---

## 6. Variáveis de ambiente

| Variável | Onde |
|---|---|
| `VITE_SUPABASE_URL` | Vercel (production, preview, development) + `app/.env.local` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | idem |

A chave publicável **é pública por desenho** — todo `VITE_*` entra no pacote
enviado ao navegador. Quem protege os dados é a RLS, não o sigilo da chave.
A `service_role` key nunca entra no cliente: ela ignora RLS.

---

## 7. Pendente

- [ ] Criptografia efetiva de `candidate_health` (a coluna existe; falta a chave da aplicação)
- [ ] Magic link para o candidato retomar o rascunho de outro aparelho
- [ ] Expurgo automático em 24 meses (função escrita, falta agendar)
- [ ] Backup e **restore testado** antes do go-live — backup não testado não é backup
- [ ] Rotacionar a senha do banco: ela trafegou por chat
