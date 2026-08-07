-- =============================================================================
-- Seed de Dados para Homologação (Ambiente de Testes)
-- Cria a organização base e os usuários de teste solicitados pelo Product Owner.
-- =============================================================================

DO $$
DECLARE
  v_org_id uuid;
  v_user_fabricio uuid;
BEGIN
  -- 1. Criar a Organização (Tenant)
  INSERT INTO organizations (nome, slug, features)
  VALUES ('FUJIARTE do Brasil', 'fujiarte', '{"theme": "blue"}'::jsonb)
  ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id INTO v_org_id;

  -- 2. Criar o Usuário Fabricio na tabela auth.users (Tabela nativa do Supabase)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
    'fabricio_hashimoto@selectsys-jobs.com.br', 
    crypt('fujiarte123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"name": "Fabricio Hashimoto"}', 
    now(), now()
  )
  -- Se o email já existir, pegamos o ID dele
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO v_user_fabricio;

  -- 3. Inserir na nossa tabela pública de usuários (users)
  INSERT INTO users (id, email, nome)
  VALUES (v_user_fabricio, 'fabricio_hashimoto@selectsys-jobs.com.br', 'Fabricio Hashimoto')
  ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome;

  -- 4. Vincular o Fabricio à Organização FUJIARTE como Administrador (Role: org_admin)
  INSERT INTO memberships (user_id, organization_id, role)
  VALUES (v_user_fabricio, v_org_id, 'org_admin')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

END;
$$;
