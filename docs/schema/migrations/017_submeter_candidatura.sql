-- =============================================================================
-- Migration 017: Função RPC `submeter_candidatura` para Envio Atômico
-- =============================================================================

CREATE OR REPLACE FUNCTION public.submeter_candidatura(
  p_org_slug text,
  p_agencia_codigo text DEFAULT NULL,
  p_form_version text DEFAULT '2024.06',
  p_valores jsonb DEFAULT '{}'::jsonb,
  p_linhas jsonb DEFAULT '{}'::jsonb,
  p_consentimentos jsonb DEFAULT '{}'::jsonb,
  p_user_agent text DEFAULT NULL
)
RETURNS TABLE (
  candidate_id uuid,
  application_id uuid,
  screening_status text,
  mensagem text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_org_id uuid;
  v_agency_id uuid;
  v_form_schema_id uuid;
  v_candidate_id uuid;
  v_application_id uuid;
  v_cpf text;
  v_nome text;
  v_data_nasc date;
  v_geracao geracao_nikkei;
  v_idade int;
  v_tem_tatuagem boolean;
  v_outcome screening_outcome := 'aprovar';
  v_reason text := 'Aprovado para entrevista';
  v_fired_rules jsonb := '[]'::jsonb;
BEGIN
  -- 1. Resolver Organização pelo Slug
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = p_org_slug AND ativo = true;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organização com slug % não encontrada.', p_org_slug;
  END IF;

  -- 2. Resolver Agência se informada
  IF p_agencia_codigo IS NOT NULL AND p_agencia_codigo <> '' THEN
    SELECT id INTO v_agency_id FROM public.agencies WHERE organization_id = v_org_id AND codigo = p_agencia_codigo LIMIT 1;
  END IF;

  -- 3. Obter ou criar schema do formulário
  SELECT id INTO v_form_schema_id FROM public.form_schemas WHERE organization_id = v_org_id AND version = p_form_version LIMIT 1;
  IF v_form_schema_id IS NULL THEN
    INSERT INTO public.form_schemas (organization_id, version, definition)
    VALUES (v_org_id, p_form_version, '{}'::jsonb)
    RETURNING id INTO v_form_schema_id;
  END IF;

  -- Extrair campos fundamentais do JSON
  v_cpf := p_valores->>'cpf';
  v_nome := COALESCE(p_valores->>'nomeCompleto', p_valores->>'nome_completo', 'CANDIDATO');
  IF p_valores->>'dataNascimento' IS NOT NULL AND p_valores->>'dataNascimento' <> '' THEN
    v_data_nasc := (p_valores->>'dataNascimento')::date;
  ELSIF p_valores->>'data_nascimento' IS NOT NULL AND p_valores->>'data_nascimento' <> '' THEN
    v_data_nasc := (p_valores->>'data_nascimento')::date;
  END IF;

  IF p_valores->>'geracaoNikkei' = 'nao_descendente' OR p_valores->>'geracao' = 'nao_descendente' THEN
    v_geracao := 'nao_descendente';
  ELSIF p_valores->>'geracaoNikkei' IS NOT NULL THEN
    v_geracao := (p_valores->>'geracaoNikkei')::geracao_nikkei;
  END IF;

  v_tem_tatuagem := LOWER(COALESCE(p_valores->>'temTatuagem', p_valores->>'q15_tatuagem', '')) = 'sim';

  -- 4. Upsert Candidato idempotente por (organization_id, cpf)
  INSERT INTO public.candidates (
    organization_id, agency_id, nome_completo, cpf, data_nascimento,
    sexo, estado_civil, nacionalidade, geracao, email, telefone,
    cidade, estado, cep, altura_cm, peso_kg, cintura_cm, pe_cm,
    nivel_japones, tem_tatuagem, updated_at
  )
  VALUES (
    v_org_id, v_agency_id, v_nome, v_cpf, v_data_nasc,
    p_valores->>'sexo', p_valores->>'estadoCivil', p_valores->>'nacionalidade', v_geracao,
    p_valores->>'email', p_valores->>'celular', p_valores->>'cidade', p_valores->>'estado', p_valores->>'cep',
    NULLIF(p_valores->>'alturaCm', '')::int,
    NULLIF(p_valores->>'pesoKg', '')::numeric,
    NULLIF(p_valores->>'cinturaCm', '')::int,
    NULLIF(p_valores->>'peCm', '')::numeric,
    p_valores->>'nivel_japones', v_tem_tatuagem, now()
  )
  ON CONFLICT (organization_id, cpf) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    data_nascimento = COALESCE(EXCLUDED.data_nascimento, candidates.data_nascimento),
    email = COALESCE(EXCLUDED.email, candidates.email),
    telefone = COALESCE(EXCLUDED.telefone, candidates.telefone),
    updated_at = now()
  RETURNING id INTO v_candidate_id;

  -- 5. Executar Regras de Triagem Automática no Banco
  IF v_data_nasc IS NOT NULL THEN
    v_idade := candidate_idade(v_data_nasc);
  END IF;

  IF v_geracao = 'nao_descendente' THEN
    v_outcome := 'encerrar_fluxo';
    v_reason := 'Geração não descendente Nikkei';
    v_fired_rules := jsonb_build_array('REGRA_DESCENDENCIA');
  ELSIF v_idade IS NOT NULL AND v_idade >= 55 THEN
    v_outcome := 'reprovar';
    v_reason := 'Idade (55+ anos) acima do limite operacional';
    v_fired_rules := jsonb_build_array('REGRA_LIMITE_IDADE');
  ELSIF v_tem_tatuagem THEN
    v_outcome := 'revisao_manual';
    v_reason := 'Possui tatuagem - requer revisão manual';
    v_fired_rules := jsonb_build_array('REGRA_TATUAGEM');
  END IF;

  -- 6. Upsert Candidatura (Application)
  INSERT INTO public.applications (
    organization_id, candidate_id, form_schema_id, agency_id, status, submetida_em, updated_at
  )
  VALUES (
    v_org_id, v_candidate_id, v_form_schema_id, v_agency_id,
    CASE
      WHEN v_outcome = 'encerrar_fluxo' THEN 'inativo'::application_status
      WHEN v_outcome = 'reprovar' THEN 'reprovado'::application_status
      WHEN v_outcome = 'revisao_manual' THEN 'recebida'::application_status
      ELSE 'aguardando_entrevista'::application_status
    END,
    now(), now()
  )
  RETURNING id INTO v_application_id;

  -- 7. Gravar Dados do Formulário
  INSERT INTO public.application_data (application_id, data, rascunho, updated_at)
  VALUES (v_application_id, p_valores, p_valores, now())
  ON CONFLICT (application_id) DO UPDATE SET
    data = EXCLUDED.data,
    updated_at = now();

  -- 8. Gravar Decisão de Triagem
  INSERT INTO public.screening_decisions (
    organization_id, application_id, ruleset_version, facts, fired_rules, outcome, reason_code
  )
  VALUES (
    v_org_id, v_application_id, 1, p_valores, v_fired_rules, v_outcome, v_reason
  );

  -- 9. Registrar Consentimentos
  IF p_consentimentos IS NOT NULL AND jsonb_typeof(p_consentimentos) = 'object' THEN
    INSERT INTO public.consents (organization_id, candidate_id, tipo, texto_versao, concedido, user_agent)
    SELECT v_org_id, v_candidate_id, key, key, value::boolean, p_user_agent
    FROM jsonb_each_text(p_consentimentos);
  END IF;

  RETURN QUERY SELECT v_candidate_id, v_application_id, v_outcome::text, v_reason;
END;
$$;

-- Permitir execução por usuários anônimos (candidatos) e autenticados (staff)
GRANT EXECUTE ON FUNCTION public.submeter_candidatura TO anon, authenticated, service_role;
