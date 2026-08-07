# Procedimento de Backup Automatizado e Restore Testado

**Sistema:** SelectSys Jobs (FUJIARTE Dekassegui SaaS)  
**Requisito de Go-Live:** Item 12 do Backlog Master — Validação antes do uso com dados reais.

---

## 1. Política de Backup

1. **Backups Diários Automatizados**:
   - Ferramenta: `pg_dump` agendado via Cron / Supabase Point-in-Time Recovery (PITR).
   - Destino: Bucket S3 / Cloudflare R2 criptografado (`AES-256`).
   - Retenção: 30 dias de snapshots diários + 12 backups mensais.

2. **Formato do Backup**:
   - Arquivo `.sql` ou `.tar` contendo o esquema completo (24 tabelas), extensões (`pgcrypto`, `pg_trgm`, `unaccent`), tabelas e dados sensíveis criptografados.

---

## 2. Roteiro Passo a Passo de Restore

Em caso de incidente ou teste de auditoria, siga o procedimento abaixo:

### Passo 1: Obter o Dump de Backup
```powershell
# Baixar o último backup do R2 / Supabase Storage
aws s3 cp s3://selectsys-backups/selectsys_jobs_backup_latest.sql ./backups/
```

### Passo 2: Restaurar em Instância PostgreSQL Limpa
```powershell
# Criar um banco de dados descartável para validação
createdb -h localhost -U postgres selectsys_restore_test

# Restaurar o backup SQL
psql -h localhost -U postgres -d selectsys_restore_test -f ./backups/selectsys_jobs_backup_latest.sql
```

### Passo 3: Executar Validação Automatizada da Candidata Marina Tanaka
```powershell
# Executar o script de teste de integridade
powershell -ExecutionPolicy Bypass -File ./scripts/backup_restore_test.ps1 -DbUrl "postgresql://postgres:postgres@localhost:54322/selectsys_restore_test"
```

---

## 3. Critério de Aceite e Evidência de Teste

- **Busca da Candidata**: O registro de `MARINA TANAKA OLIVEIRA` deve estar presente.
- **Relacionamentos**:
  - `applications`: candidatura vinculada com status `recebida`.
  - `work_history`: experiências na fábrica DENSO / FUJIARTE intactas.
  - `consents`: 4 consentimentos LGPD/APPI registrados com timestamp, IP e User-Agent.
  - `screening_decisions`: parecer explicável gravado.

---

<p align="center">
  <b>SelectSys Jobs</b> — Procedimento de Backup & Restore Testado · 2026<br/>
  <i>Garantia total de resiliência e conformidade antes do go-live com dados reais.</i>
</p>
