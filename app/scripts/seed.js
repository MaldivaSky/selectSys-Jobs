/**
 * seed.js — Seed via Supabase Admin API (sem dependência de conexão PG local)
 * Cria o tenant FUJIARTE e o usuário admin Fabricio no banco Supabase em nuvem.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Faltam VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

if (!adminPassword) {
  console.error('❌ ERRO: Falta ADMIN_PASSWORD no .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🌱 Iniciando Seed via Supabase Admin API...\n');

  // ─── 1. Criar Organização (Tenant) FUJIARTE ──────────────────────────────
  console.log('🏢 Criando organização FUJIARTE...');
  const { data: orgData, error: orgError } = await supabaseAdmin
    .from('organizations')
    .upsert(
      {
        nome: 'FUJIARTE do Brasil',
        slug: 'fujiarte',
        features: { theme: 'blue', cor_primaria: '#294b86' },
      },
      { onConflict: 'slug', ignoreDuplicates: false }
    )
    .select('id')
    .single();

  if (orgError) {
    console.error('❌ Erro ao criar organização:', orgError.message);
    process.exit(1);
  }
  const orgId = orgData.id;
  console.log(`✅ Tenant FUJIARTE criado/atualizado (ID: ${orgId})\n`);

  // ─── 2. Criar Usuário Admin (Fabricio) via Auth Admin API ────────────────
  const email = 'fabricio_hashimoto@selectsys-jobs.com.br';
  console.log(`👤 Verificando usuário admin: ${email}...`);

  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = listData?.users?.find((u) => u.email === email);

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    console.log('⚠️  Usuário já existe no Auth. Atualizando senha...');
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: adminPassword,
    });
    if (updateErr) {
      console.error('❌ Erro ao atualizar senha:', updateErr.message);
      process.exit(1);
    }
  } else {
    const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: 'Fabricio Hashimoto' },
    });
    if (authError) {
      console.error('❌ Erro ao criar usuário Auth:', authError.message);
      process.exit(1);
    }
    userId = userAuth.user.id;
  }
  console.log(`✅ Usuário Auth OK (ID: ${userId})\n`);

  // ─── 3. Inserir/Atualizar na tabela pública users ────────────────────────
  console.log('📋 Sincronizando tabela users...');
  const { error: usersError } = await supabaseAdmin.from('users').upsert(
    { id: userId, email, nome: 'Fabricio Hashimoto' },
    { onConflict: 'email' }
  );
  if (usersError) {
    console.error('❌ Erro na tabela users:', usersError.message);
    process.exit(1);
  }
  console.log('✅ Tabela users atualizada\n');

  // ─── 4. Vincular membership org_admin ────────────────────────────────────
  console.log('🔗 Criando membership (org_admin)...');
  const { error: memberError } = await supabaseAdmin.from('memberships').upsert(
    { user_id: userId, organization_id: orgId, role: 'org_admin' },
    { onConflict: 'organization_id,user_id' }
  );
  if (memberError) {
    console.error('❌ Erro na tabela memberships:', memberError.message);
    process.exit(1);
  }
  console.log('✅ Membership org_admin criado\n');

  console.log('🚀 Seed concluído! Banco pronto para homologação.');
  console.log(`   Login: ${email}`);
  console.log(`   Tenant slug: fujiarte → /c/fujiarte`);
}

main();
