-- =============================================================================
-- Migration: 016_configurar_seguranca_e_cron
-- Descrição: Configura a criptografia de dados de saúde no banco (LGPD Art. 11)
--            e cria a rotina de expurgo automático de candidatos inativos.
-- =============================================================================

-- 1. Habilitar extensões necessárias (Executar como superuser/postgres)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- A extensão supabase_vault geralmente já vem no Supabase, mas para garantir:
-- CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- =============================================================================
-- 2. Chave Mestra e Helpers
-- Em produção, a chave deve ser inserida no vault, mas como fallback podemos
-- usar uma chave definida nas configurações do banco.
-- Aqui usaremos `current_setting('app.health_key', true)` que permite configurar
-- no dashboard do Supabase (Database -> Variables) ou via API.
-- =============================================================================

-- Função Helper para obter a chave de forma segura
CREATE OR REPLACE FUNCTION private.get_health_key()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_key text;
BEGIN
  -- Tenta pegar do config da role/banco
  v_key := current_setting('app.health_key', true);
  
  -- Se não existir (ambiente local/testes), usa uma de fallback 
  -- (NÃO USE EM PRODUÇÃO SEM CONFIGURAR)
  IF v_key IS NULL OR v_key = '' THEN
    v_key := 'chave-de-desenvolvimento-insegura-32bytes-minimo';
  END IF;
  
  RETURN v_key;
END;
$$;


-- =============================================================================
-- 3. Procedure: Salvar Dados de Saúde (Criptografando)
-- =============================================================================
CREATE OR REPLACE FUNCTION private.salvar_dados_saude(p_candidate_id uuid, p_dados jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_key text;
  v_dados_str text;
  v_payload_enc bytea;
BEGIN
  -- Obter a organização do candidato
  SELECT organization_id INTO v_org_id 
  FROM candidates 
  WHERE id = p_candidate_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Candidato não encontrado.';
  END IF;

  -- Obter chave e converter o JSON para string
  v_key := private.get_health_key();
  v_dados_str := p_dados::text;

  -- Criptografar usando AES-256 (via pgp_sym_encrypt_bytea)
  v_payload_enc := pgp_sym_encrypt_bytea(
    convert_to(v_dados_str, 'UTF8'),
    v_key,
    'cipher-algo=aes256'
  );

  -- Realizar Upsert na tabela candidate_health
  INSERT INTO candidate_health (candidate_id, organization_id, payload_enc, key_version)
  VALUES (p_candidate_id, v_org_id, v_payload_enc, 1)
  ON CONFLICT (candidate_id) DO UPDATE 
    SET payload_enc = EXCLUDED.payload_enc,
        updated_at = now();

END;
$$;


-- =============================================================================
-- 4. Procedure: Obter Dados de Saúde (Descriptografando + Auditoria)
-- =============================================================================
CREATE OR REPLACE FUNCTION private.obter_dados_saude(p_candidate_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_payload_enc bytea;
  v_key text;
  v_dados_dec text;
  v_result jsonb;
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  -- Obter ID do usuário autenticado no momento
  v_user_id := auth.uid();
  
  -- Buscar o payload encriptado
  SELECT payload_enc, organization_id INTO v_payload_enc, v_org_id
  FROM candidate_health
  WHERE candidate_id = p_candidate_id;

  IF v_payload_enc IS NULL THEN
    RETURN NULL; -- Não há dados de saúde salvos
  END IF;

  -- Descriptografar
  v_key := private.get_health_key();
  
  BEGIN
    v_dados_dec := convert_from(
      pgp_sym_decrypt_bytea(v_payload_enc, v_key), 
      'UTF8'
    );
    v_result := v_dados_dec::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao descriptografar dados de saúde. A chave pode estar incorreta.';
  END;

  -- Gravar log de auditoria automático
  -- Como estamos acessando um dado altamente sensível (LGPD), precisamos auditar o READ.
  IF v_user_id IS NOT NULL THEN
    INSERT INTO audit_log (organization_id, user_id, action, resource, resource_id, metadata)
    VALUES (
      v_org_id,
      v_user_id,
      'health.read',
      'candidate_health',
      p_candidate_id,
      jsonb_build_object(
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        'reason', 'Acesso autorizado ao painel de saúde'
      )
    );
  END IF;

  RETURN v_result;
END;
$$;


-- =============================================================================
-- 5. Agendamento do Expurgo (pg_cron)
-- Requer que a extensão pg_cron esteja habilitada no banco de dados.
-- Supabase habilita por padrão se configurado.
-- =============================================================================

-- Executa a rotina de expurgo todo dia 1º do mês às 03:00 da manhã
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'expurgo-mensal-candidatos',
      '0 3 1 * *', -- Minuto 0, Hora 3, Dia 1 de cada mês
      'SELECT expurgar_candidatos_expirados();'
    );
  ELSE
    RAISE NOTICE 'A extensão pg_cron não está ativa. O agendamento não foi criado.';
  END IF;
END
$$;
