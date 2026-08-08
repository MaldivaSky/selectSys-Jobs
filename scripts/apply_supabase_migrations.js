import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env da raiz
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.argv[2] || process.env.DATABASE_URL;

async function applyMigrations() {
  if (!connectionString) {
    console.log("⚠️  DATABASE_URL não configurada no .env.");
    console.log("ℹ️  Para aplicar no banco remoto do Supabase, execute:");
    console.log("    node scripts/apply_supabase_migrations.js \"postgresql://postgres.[ref]:[senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres\"");
    process.exit(0);
  }

  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  try {
    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    console.log(`🚀 Aplicando ${files.length} migrations em supabase/migrations/...\n`);

    for (const file of files) {
      console.log(`   ► Aplicando: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`     ✓ Sucesso: ${file}`);
    }

    console.log('\n✅ Todas as migrations Supabase (01 a 04) foram aplicadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro na execução da migration:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigrations();
