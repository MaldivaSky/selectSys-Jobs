import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const connectionString = process.env.DATABASE_URL;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERRO: Faltam as variáveis VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no arquivo .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const pool = new pg.Pool({ connectionString });

async function main() {
  console.log("🌱 Iniciando Seed Profissional do Banco de Dados...");
  const client = await pool.connect();

  try {
    // 1. Criar a Organização FUJIARTE via PG
    console.log("🏢 Criando organização (Tenant)...");
    const orgRes = await client.query(`
      INSERT INTO organizations (nome, slug, features)
      VALUES ('FUJIARTE do Brasil', 'fujiarte', '{"theme": "blue"}')
      ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id
    `);
    const orgId = orgRes.rows[0].id;
    console.log(`✅ Tenant criado: FUJIARTE (ID: ${orgId})`);

    // 2. Criar o Usuário Fabricio via Admin Auth API (Para lidar com senhas corretamente)
    console.log("👤 Criando usuário admin...");
    let userId;
    const email = 'fabricio_hashimoto@selectsys-jobs.com.br';
    
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("❌ ERRO: Faltou a variável ADMIN_PASSWORD no .env");
    }

    if (existingUser) {
      userId = existingUser.id;
      console.log("⚠️ Usuário já existe no Auth. Atualizando senha...");
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: adminPassword });
    } else {
      const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'Fabricio Hashimoto' }
      });
      if (authError) throw authError;
      userId = userAuth.user.id;
    }
    console.log(`✅ Usuário criado no Auth: ${userId}`);

    // 3. Inserir na tabela pública Users via PG
    await client.query(`
      INSERT INTO users (id, email, nome)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
    `, [userId, email, 'Fabricio Hashimoto']);
    console.log("✅ Usuário inserido na tabela 'users'.");

    // 4. Vincular na tabela Memberships via PG
    await client.query(`
      INSERT INTO memberships (user_id, organization_id, role)
      VALUES ($1, $2, 'org_admin')
      ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `, [userId, orgId]);
    console.log("✅ Vínculo (Membership) de org_admin criado com sucesso.");

    console.log("🚀 Seed concluído com sucesso! Ambiente pronto para homologação.");
  } catch (err) {
    console.error("❌ Erro fatal no seed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
