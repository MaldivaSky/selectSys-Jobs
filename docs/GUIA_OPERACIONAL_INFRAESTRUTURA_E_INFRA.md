# Guia Operacional de Infraestrutura & Ativação de Nuvem — SelectSys Jobs

Este documento é o **Manual de Infraestrutura de Produção** do **SelectSys Jobs**, contendo a arquitetura de nuvem, passo a passo para configuração de credenciais, Cloudflare R2, Supabase Storage, Coolify PaaS e deploy em servidores dedicados.

---

## 🏛️ Topologia da Nuvem & Infraestrutura

```
[ Usuário / Candidato (Mobile) ]
               │
               ▼
   [ Cloudflare WAF / SSL ]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ App SPA Frontend ]    [ Cloudflare R2 / Supabase Storage ]
(Vite / React 19)       (Fotos EPI, RG, Passaporte, Koseki)
   │                       │
   ▼                       │
[ PostgreSQL 16 ] ◄────────┘
(RLS Multi-Tenant + pgcrypto)
```

---

## 📋 1. Configuração do Cloudflare R2 (Storage de Imagens & Documentos)

O Cloudflare R2 é utilizado para o armazenamento dos uploads de fotos de candidatos, fotos de tatuagens e cópias de documentos (Passaporte, Koseki).

### Passo a Passo de Ativação no Painel da Cloudflare:
1. Acesse o **Cloudflare Dashboard** ➔ **R2 Object Storage**.
2. Clique em **Create Bucket** e nomeie como: `selectsys-candidatos-storage`.
3. Em **Bucket Settings**, selecione **Public Access** ou ative um **Custom Domain** (ex: `media.selectsys.jobs`).
4. Acesse **Manage R2 API Tokens** ➔ **Create API Token**:
   - **Permissions**: `Edit` (Read & Write).
   - **Bucket**: `selectsys-candidatos-storage`.
5. Copie as chaves geradas para o seu arquivo `.env`:

```env
# Cloudflare R2 Storage Credentials
R2_ACCOUNT_ID=sua_account_id_cloudflare
R2_ACCESS_KEY_ID=sua_access_key_id
R2_SECRET_ACCESS_KEY=sua_secret_access_key
R2_BUCKET_NAME=selectsys-candidatos-storage
R2_PUBLIC_DOMAIN=https://media.selectsys.jobs
```

---

## 🗄️ 2. Configuração do Supabase Storage & PostgreSQL RLS

Se você estiver utilizando a infraestrutura gerenciada do Supabase ou PostgreSQL próprio:

### Criando os Buckets de Armazenamento:
No painel do Supabase ➔ **Storage** ➔ **Buckets**:
1. Criar bucket público: `candidatos-fotos` (para fotos de perfil).
2. Criar bucket privado com RLS: `documentos-sensiveis` (para cópias de passaporte e exames).

### Políticas de Segurança (Storage RLS):
```sql
-- Permitir upload público no bucket de fotos
CREATE POLICY "Permitir upload de fotos de candidatos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'candidatos-fotos');

-- Permitir leitura pública apenas de fotos
CREATE POLICY "Leitura publica de fotos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'candidatos-fotos');
```

---

## 🐳 3. Implantação de Produção via Coolify PaaS / Docker VPS

O deployment em servidor dedicado (ex: Hetzner / AWS EC2) utiliza o **Coolify PaaS** para automação de CI/CD via Git Push:

### Configuração no Coolify:
1. Conecte o repositório GitHub `MaldivaSky/selectSys-Jobs`.
2. Selecione o build pack: **Nixpacks / Dockerfile**.
3. Adicione as variáveis de ambiente em **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_GAROON_SUBDOMAIN`
   - `VITE_GAROON_USER`
   - `VITE_GAROON_TOKEN`
   - `DEEPSEEK_API_KEY`
4. Clique em **Deploy**. O Coolify gerará o certificado SSL automático via Let's Encrypt.

---

## 📝 4. Checklist Completo de Variáveis de Ambiente (`.env`)

```env
# ===================================================================
# SELECTSYS JOBS — CONFIGURAÇÃO DE AMBIENTE DE PRODUÇÃO
# ===================================================================

# ── SUPABASE / POSTGRESQL (BANCO & AUTH) ───────────────────────────
VITE_SUPABASE_URL=https://sua-instancia.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-supabase

# ── CYBOZU GAROON (MATRIZ NO JAPÃO) ─────────────────────────────────
VITE_GAROON_SUBDOMAIN=fujiarte-japan
VITE_GAROON_USER=admin_dekassegui
VITE_GAROON_TOKEN=token_autenticacao_garoon

# ── DEEPSEEK AI (PROXIED EDGE FUNCTION) ─────────────────────────────
DEEPSEEK_API_KEY=sk-sua-chave-deepseek-real

# ── CLOUDFLARE R2 OBJECT STORAGE ────────────────────────────────────
R2_ACCOUNT_ID=sua_account_id_cloudflare
R2_ACCESS_KEY_ID=sua_access_key_id
R2_SECRET_ACCESS_KEY=sua_secret_access_key
R2_BUCKET_NAME=selectsys-candidatos-storage
R2_PUBLIC_DOMAIN=https://media.selectsys.jobs
```
