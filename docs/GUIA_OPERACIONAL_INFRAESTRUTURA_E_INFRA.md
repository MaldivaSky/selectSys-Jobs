# Guia Operacional de Infraestrutura & Arquitetura — SelectSys Jobs

Este documento apresenta a **arquitetura de execução do SelectSys Jobs**, a justificativa técnica de cada decisão e o passo a passo para colocar o sistema em produção.

---

## 💡 1. Justificativa Arquitetural: Preciso de Docker para rodar o SelectSys Jobs?

### **Resposta Rápida: NÃO. O sistema RODA 100% SEM DOCKER.**

O SelectSys Jobs foi construído sobre uma arquitetura **Serverless Jamstack moderna**, projetada para custo zero de manutenção de servidores e máxima velocidade:

| Camada | Tecnologia | Onde Roda (Modo Recomendado) | Exige Docker? |
|---|---|---|:--:|
| **Frontend Web** | Vite + React 19 + TypeScript | Cloudflare Pages / Vercel / Netlify | ❌ **NÃO** (Arquivos Estáticos) |
| **Backend & APIs** | Edge Functions (Deno Runtime) | Supabase Serverless Edge | ❌ **NÃO** (Execução sob demanda) |
| **Banco de Dados** | PostgreSQL 16 (RLS + pgcrypto) | Supabase Cloud (sa-east-1 SP) | ❌ **NÃO** (Gerenciado) |
| **Arquivos & Fotos** | Cloudflare R2 / Supabase Storage | Cloudflare Global CDN | ❌ **NÃO** (Object Storage S3) |

---

## 🎯 2. Comparativo de Hospedagem

### Opção A: Serverless na Nuvem (RECOMENDADA — Zero Docker, Zero Manutenção)
- **Como funciona**: O frontend é publicado no **Vercel** ou **Cloudflare Pages** via Git Push. O banco de dados e as Edge Functions rodam no **Supabase**.
- **Custo**: Plano gratuito / pouquíssimos dólares por mês.
- **Manutenção**: Zero. O provedor cuida de SSL, atualizações de segurança e CDN global.

### Opção B: Servidor VPS Próprio (OPCIONAL — Apenas se a empresa exigir servidor local)
- **Como funciona**: Se a diretoria ou a matriz no Japão exigir rodar o sistema em uma máquina virtual própria com IP dedicado (ex: Hetzner / AWS EC2), utiliza-se um container Docker gerenciado pelo **Coolify**.

---

## 📋 3. Guia de Ativação do Cloudflare R2 (Armazenamento de Fotos e Documentos)

O Cloudflare R2 armazena os uploads de fotos de perfil, tatuagens, RG e Passaporte.

### Credenciais necessárias no arquivo `app/.env`:
```env
# Cloudflare R2 Storage (Opcional — Caso use R2 em vez do Supabase Storage)
R2_ACCOUNT_ID=sua_account_id_cloudflare
R2_ACCESS_KEY_ID=sua_access_key_id
R2_SECRET_ACCESS_KEY=sua_secret_access_key
R2_BUCKET_NAME=selectsys-candidatos-storage
R2_PUBLIC_DOMAIN=https://media.selectsys.jobs
```

---

## 🔐 4. Checklist Completo de Variáveis de Ambiente (`app/.env`)

```env
# ── BANCO POSTGRESQL & AUTH (SUPABASE) ──────────────────────────────
VITE_SUPABASE_URL=https://sua-instancia.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-supabase

# ── MATRIZ JAPÃO (CYBOZU GAROON) ────────────────────────────────────
VITE_GAROON_SUBDOMAIN=fujiarte-japan
VITE_GAROON_USER=admin_dekassegui
VITE_GAROON_TOKEN=token_autenticacao_garoon

# ── PROXY DE INTELIGÊNCIA ARTIFICIAL ────────────────────────────────
VITE_DEEPSEEK_API_KEY=sk-sua-chave-deepseek-real
```
