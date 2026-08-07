import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

async function seed() {
  console.log('🌱 Iniciando seed do SelectSys Jobs (Organização FUJIARTE)...');
  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // 1. Criar Organização FUJIARTE se não existir
    let [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.slug, 'fujiarte'));

    if (!org) {
      [org] = await db
        .insert(schema.organizations)
        .values({
          slug: 'fujiarte',
          nome: 'FUJIARTE Co., Ltd.',
          nomeJa: 'フジアルテ株式会社',
          corPrimaria: '#294b86',
          locale: 'ja-JP',
          plano: 'founder',
          features: { cor_primaria: '#294b86', garoon: true, whatsapp: true },
        })
        .returning();
      console.log('✅ Organização FUJIARTE criada com ID:', org.id);
    } else {
      console.log('ℹ️ Organização FUJIARTE já existe com ID:', org.id);
    }

    // 2. Criar Usuário Admin se não existir
    let [adminUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@fujiarte.co.jp'));

    if (!adminUser) {
      [adminUser] = await db
        .insert(schema.users)
        .values({
          email: 'admin@fujiarte.co.jp',
          nome: 'Administrador FUJIARTE',
          locale: 'pt-BR',
        })
        .returning();
      console.log('✅ Usuário Admin criado:', adminUser.email);
    }

    // 3. Criar Membership para o Admin
    const [membership] = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.userId, adminUser.id));

    if (!membership) {
      await db.insert(schema.memberships).values({
        organizationId: org.id,
        userId: adminUser.id,
        role: 'org_admin',
      });
      console.log('✅ Membership de org_admin associado.');
    }

    // 4. Criar Agência Demo se não existir
    let [agency] = await db
      .select()
      .from(schema.agencies)
      .where(eq(schema.agencies.codigo, 'demo'));

    if (!agency) {
      [agency] = await db
        .insert(schema.agencies)
        .values({
          organizationId: org.id,
          nome: 'Agência Demo Dekassegui',
          codigo: 'demo',
          responsavel: 'Agente Demo',
          email: 'contato@agenciademo.com.br',
          telefone: '+55 11 99999-8888',
          comissaoPct: '10.00',
        })
        .returning();
      console.log('✅ Agência Demo criada com código "demo".');
    }

    // 5. Criar Form Schema Padrão 2024.06 se não existir
    let [formSchema] = await db
      .select()
      .from(schema.formSchemas)
      .where(eq(schema.formSchemas.version, '2024.06'));

    if (!formSchema) {
      [formSchema] = await db
        .insert(schema.formSchemas)
        .values({
          organizationId: org.id,
          version: '2024.06',
          definition: {
            title: 'FUJIARTE Ficha Cadastral Jun2024',
            steps: ['dados_pessoais', 'historico_profissional', 'familia', 'saude', 'consentimentos'],
          },
          publicadoEm: new Date(),
          createdBy: adminUser.id,
        })
        .returning();
      console.log('✅ Form Schema 2024.06 cadastrado.');
    }

    console.log('🎉 Seed finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error);
  } finally {
    await pool.end();
  }
}

seed();
