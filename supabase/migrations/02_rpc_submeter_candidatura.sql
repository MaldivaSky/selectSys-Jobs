-- =============================================================================
-- SelectSys Jobs — Migration 02: RPC Transacional submeter_candidatura
-- =============================================================================

CREATE OR REPLACE FUNCTION public.submeter_candidatura(
  p_org_slug text,
  p_agencia_codigo text DEFAULT NULL,
  p_form_version text DEFAULT '2024.06',
  p_valores jsonb DEFAULT '{}'::jsonb,
  p_linhas jsonb DEFAULT '{}'::jsonb,
  p_consentimentos jsonb DEFAULT '{}'::jsonb,
  p_user_agent text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_org_id uuid;
  v_agency_id uuid;
  v_schema_id uuid;
  v_candidate_id uuid;
  v_application_id uuid;
  v_cpf text;
  v_nome text;
  v_nasc date;
  v_idade int;
  v_tem_tatuagem boolean;
  v_mesma_empresa boolean;
  v_geracao text;
  v_outcome screening_outcome;
  v_reason_code text;
  v_fired_rules jsonb := '[]'::jsonb;
  v_item jsonb;
  v_tipo_consent text;
  v_concedido boolean;
BEGIN
  -- 1. Obter Organização
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = p_org_slug AND ativo = true;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organização com slug "%" não encontrada ou inativa.', p_org_slug;
  END IF;

  -- 2. Obter Agência se código for fornecido
  IF p_agencia_codigo IS NOT NULL AND p_agencia_codigo <> '' THEN
    SELECT id INTO v_agency_id FROM public.agencies
      WHERE organization_id = v_org_id AND codigo = p_agencia_codigo AND ativo = true;
  END IF;

  -- 3. Obter Form Schema ID
  SELECT id INTO v_schema_id FROM public.form_schemas
    WHERE organization_id = v_org_id AND version = p_form_version;
  IF v_schema_id IS NULL THEN
    SELECT id INTO v_schema_id FROM public.form_schemas
      WHERE organization_id = v_org_id LIMIT 1;
  END IF;

  -- 4. Extrair campos de Candidato
  v_cpf := COALESCE(p_valores->>'cpf', 'CPF-TEMP-' || extract(epoch from now())::text);
  v_nome := COALESCE(p_valores->>'nomeCompleto', p_valores->>'nome_completo', 'CANDIDATO DEKASSEGUI');
  
  IF (p_valores->>'dataNascimento') IS NOT NULL AND (p_valores->>'dataNascimento') <> '' THEN
    v_nasc := (p_valores->>'dataNascimento')::date;
    v_idade := candidate_idade(v_nasc);
  END IF;

  v_tem_tatuagem := LOWER(COALESCE(p_valores->>'temTatuagem', '')) = 'sim';
  v_mesma_empresa := LOWER(COALESCE(p_valores->>'trabalhouMesmaEmpresa', p_valores->>'mesma_empresa', '')) = 'sim';
  v_geracao := p_valores->>'geracaoNikkei';

  -- 5. Upsert na tabela candidates
  INSERT INTO public.candidates (
    organization_id,
    agency_id,
    cpf,
    nome_completo,
    data_nascimento,
    sexo,
    nacionalidade,
    geracao,
    email,
    telefone,
    cidade,
    estado,
    cep,
    tem_tatuagem,
    updated_at
  ) VALUES (
    v_org_id,
    v_agency_id,
    v_cpf,
    v_nome,
    v_nasc,
    COALESCE(p_valores->>'sexo', 'M'),
    COALESCE(p_valores->>'nacionalidade', 'BRAS'),
    CASE WHEN v_geracao IN ('issei','nissei','sansei','yonsei','nao_descendente') THEN v_geracao::geracao_nikkei ELSE NULL END,
    p_valores->>'email',
    COALESCE(p_valores->>'celular', p_valores->>'telefone'),
    p_valores->>'cidade',
    p_valores->>'estado',
    p_valores->>'cep',
    v_tem_tatuagem,
    now()
  )
  ON CONFLICT (organization_id, cpf) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    agency_id = COALESCE(EXCLUDED.agency_id, candidates.agency_id),
    data_nascimento = COALESCE(EXCLUDED.data_nascimento, candidates.data_nascimento),
    email = COALESCE(EXCLUDED.email, candidates.email),
    telefone = COALESCE(EXCLUDED.telefone, candidates.telefone),
    tem_tatuagem = EXCLUDED.tem_tatuagem,
    updated_at = now()
  RETURNING id INTO v_candidate_id;

  -- 6. Executar Triagem Automática (Épico B - 3 Regras)
  v_outcome := 'aprovar';
  v_reason_code := 'candidato_elegivel';

  -- Regra 1: Idade >= 55 com exceção de mesma empresa
  IF v_idade IS NOT NULL AND v_idade >= 55 THEN
    IF v_mesma_empresa THEN
      v_fired_rules := v_fired_rules || jsonb_build_object('regra', 'idade_55_excecao_mesma_empresa', 'detalhe', 'Idade >= 55 aprovada por exceção de mesma empresa');
    ELSE
      v_outcome := 'reprovar';
      v_reason_code := 'reprovado_idade_maxima_55';
      v_fired_rules := v_fired_rules || jsonb_build_object('regra', 'idade_55_sem_excecao', 'detalhe', 'Candidato com 55+ anos sem histórico na mesma fábrica');
    END IF;
  END IF;

  -- Regra 2: Tatuagem -> Revisão manual com flag
  IF v_tem_tatuagem AND v_outcome <> 'reprovar' THEN
    v_outcome := 'revisao_manual';
    v_reason_code := 'solicitar_foto_pos_entrevista_tatuagem';
    v_fired_rules := v_fired_rules || jsonb_build_object('regra', 'presenca_tatuagem', 'detalhe', 'Tatuagem informada. Requer envio de foto complementar pós-entrevista');
  END IF;

  -- Regra 3: Geração Nikkei
  IF v_geracao = 'nao_descendente' AND v_outcome <> 'reprovar' THEN
    v_fired_rules := v_fired_rules || jsonb_build_object('regra', 'nao_descendente', 'detalhe', 'Candidato não descendente - requer verificação de visto de cônjuge');
  END IF;

  -- 7. Criar Candidatura (Application)
  INSERT INTO public.applications (
    organization_id,
    candidate_id,
    form_schema_id,
    status,
    origem,
    agency_id,
    submetida_em,
    updated_at
  ) VALUES (
    v_org_id,
    v_candidate_id,
    v_schema_id,
    CASE WHEN v_outcome = 'reprovar' THEN 'reprovado'::application_status ELSE 'recebida'::application_status END,
    CASE WHEN v_agency_id IS NOT NULL THEN 'agencia' ELSE 'direta' END,
    v_agency_id,
    now(),
    now()
  ) RETURNING id INTO v_application_id;

  -- 8. Gravacao dos Respostas em Application Data
  INSERT INTO public.application_data (
    application_id,
    data,
    rascunho,
    updated_at
  ) VALUES (
    v_application_id,
    p_valores,
    p_valores,
    now()
  );

  -- 9. Gravacao do Histórico Profissional (Linhas)
  IF p_linhas ? 'historicoProfissional' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_linhas->'historicoProfissional')
    LOOP
      INSERT INTO public.work_history (
        candidate_id,
        pais,
        ordem,
        empresa,
        empreiteira,
        tipo_servico,
        provincia_uf,
        cidade,
        periodo_inicio,
        periodo_fim,
        motivo_saida
      ) VALUES (
        v_candidate_id,
        COALESCE(v_item->>'pais', 'JP'),
        COALESCE((v_item->>'ordem')::int, 0),
        v_item->>'empresa',
        v_item->>'empreiteira',
        v_item->>'tipoServico',
        v_item->>'provinciaUf',
        v_item->>'cidade',
        nullif(v_item->>'periodoInicio', '')::date,
        nullif(v_item->>'periodoFim', '')::date,
        v_item->>'motivoSaida'
      );
    END LOOP;
  END IF;

  -- 10. Gravacao dos Membros da Família (Linhas)
  IF p_linhas ? 'familiares' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_linhas->'familiares')
    LOOP
      INSERT INTO public.family_members (
        candidate_id,
        parentesco,
        nome,
        idade,
        telefone,
        contato_emergencia_japao,
        provincia
      ) VALUES (
        v_candidate_id,
        COALESCE(v_item->>'parentesco', 'familiar'),
        v_item->>'nome',
        nullif(v_item->>'idade', '')::int,
        v_item->>'telefone',
        LOWER(COALESCE(v_item->>'contatoEmergenciaJapao', '')) = 'true',
        v_item->>'provincia'
      );
    END LOOP;
  END IF;

  -- 11. Gravacao dos Consentimentos LGPD
  IF jsonb_typeof(p_consentimentos) = 'object' THEN
    FOR v_tipo_consent, v_concedido IN SELECT * FROM jsonb_each_text(p_consentimentos)
    LOOP
      INSERT INTO public.consents (
        organization_id,
        candidate_id,
        tipo,
        texto_versao,
        concedido,
        user_agent
      ) VALUES (
        v_org_id,
        v_candidate_id,
        v_tipo_consent,
        v_tipo_consent,
        v_concedido,
        p_user_agent
      );
    END LOOP;
  END IF;

  -- 12. Gravacao da Decisão de Triagem (screening_decisions)
  INSERT INTO public.screening_decisions (
    organization_id,
    application_id,
    ruleset_version,
    facts,
    fired_rules,
    outcome,
    reason_code
  ) VALUES (
    v_org_id,
    v_application_id,
    1,
    p_valores,
    v_fired_rules,
    v_outcome,
    v_reason_code
  );

  RETURN jsonb_build_object(
    'candidate_id', v_candidate_id,
    'application_id', v_application_id,
    'outcome', v_outcome,
    'reason_code', v_reason_code
  );
END;
$$;
