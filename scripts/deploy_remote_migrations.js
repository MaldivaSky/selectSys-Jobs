import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = 'cpucbenejecedextdltn';

if (!token) {
  console.error('❌ ERRO: SUPABASE_ACCESS_TOKEN não encontrado no .env');
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;

async function deployMigrations() {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`🚀 Executando ${files.length} migrations remotas no Supabase (${ref})...\n`);

  for (const file of files) {
    console.log(`   ► Aplicando: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    const status = res.status;
    const bodyText = await res.text();

    if (status === 200 || status === 201) {
      console.log(`     ✓ Sucesso (${status})`);
    } else {
      console.error(`     ❌ Erro (${status}):`, bodyText.slice(0, 300));
    }
  }

  console.log('\n✅ Todas as migrations Supabase foram aplicadas com sucesso no banco de produção!');
}

deployMigrations();
