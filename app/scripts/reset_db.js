import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ ERRO: Faltou a variável DATABASE_URL no .env");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString });

async function reset() {
  const client = await pool.connect();
  try {
    console.log("🧹 Limpando o banco de dados (DROP SCHEMA CASCADE)...");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres, public;");
    
    console.log("🔧 Habilitando extensões (citext, pgcrypto, etc)...");
    await client.query('CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA public;');
    
    console.log("🏗️ Aplicando schema.sql (Criando tabelas)...");
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../../docs/schema/schema.sql'), 'utf8');
    await client.query(schemaSql);
    
    console.log("🚀 Aplicando migrações...");
    const migrationPath = path.resolve(__dirname, '../../docs/schema/migrations/016_configurar_seguranca_e_cron.sql');
    if (fs.existsSync(migrationPath)) {
      await client.query(fs.readFileSync(migrationPath, 'utf8'));
    }

    console.log("🔐 Configurando permissões do PostgREST (Grants)...");
    await client.query(`
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
      ALTER ROLE authenticator SET statement_timeout = '15s';
      NOTIFY pgrst, 'reload schema';
    `);
    console.log("✅ Banco resetado e pronto para o Seed!");
  } catch (e) {
    console.error("❌ ERRO NO RESET:", e);
  } finally {
    client.release();
    pool.end();
  }
}

reset();
