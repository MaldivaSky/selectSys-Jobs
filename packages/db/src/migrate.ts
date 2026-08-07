import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

async function runMigrate() {
  console.log('🔄 Executando migrations Drizzle...');
  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations concluídas com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante as migrations:', err);
  } finally {
    await pool.end();
  }
}

runMigrate();
