git add app/scripts/seed.js app/scripts/reset_db.js app/package.json
git commit -m "chore(db): implement robust seed and db reset scripts with pg and Supabase Admin" -m "Automates homologation setup with atomic Upserts and guarantees no hardcoded credentials by using process.env."

git add docs/schema/schema.sql
git commit -m "fix(schema): remove unaccent dependency from candidates index" -m "Ensures the schema applies cleanly across different Postgres environments without breaking immutable index rules."

git add app/src/pages/VagasHub.tsx app/src/pages/VagaDetalhe.tsx app/src/App.tsx
git commit -m "feat(b2c): create Vagas Hub and Job Detail pages with Geo-SEO" -m "Implements public job board filtered by province, and injects Schema.org JobPosting for Google Jobs organic indexing."

git add app/src/pages/TenantDashboard.tsx
git commit -m "feat(b2b): implement Tenant Dashboard with job creation" -m "Provides UI for agencies/contractors to publish new jobs directly to the Vagas Hub and manage the candidate pipeline."

git add app/src/dados/aiService.ts
git commit -m "feat(ai): integrate DeepSeek V3 adapter for resume parsing" -m "Replaces manual entry with automated data extraction using DeepSeek LLM for the candidate wizard."
