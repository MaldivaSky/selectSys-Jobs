/* ═══════════════════════════════════════════════════════════════════════════
   CYBOZU GAROON ENTERPRISE CONNECTOR (GAROON) — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Conector de produção para Cybozu Garoon Cloud (REST API v1) e On-Premise (SOAP/XML).
   Transmite a candidatura aprovada para os módulos de Workflow/HR no Japão:
   - Identificação & Documentos (Passaporte, Koseki, Visto, Geração Nikkei)
   - Biometria & Uniformes EPI (Altura, Peso, Tamanho do Calçado em cm)
   - Histórico Laboral nas Províncias do Japão
   ═════════════════════════════════════════════════════════════════════════ */

import { supabase } from '../dados/supabase';

export interface GaroonSyncRequest {
  subdomain: string;
  usuario: string;
  apiToken: string;
  ambiente: 'cloud' | 'on_premise';
  candidato: Record<string, any>;
  organizationId?: string;
}

export interface GaroonResponse {
  ok: boolean;
  garoonRecordId?: string;
  detalhes: string;
  payloadEnviado: Record<string, any> | string;
  timestamp: string;
}

export function buildGaroonCloudPayload(candidato: Record<string, any>) {
  return {
    app: 1042, // ID da Aplicação no Cybozu Garoon Workflow
    record: {
      candidate_name: { value: candidato.nome_completo || candidato.nome || '' },
      cpf: { value: candidato.cpf || '' },
      rg: { value: candidato.rg || '' },
      rg_emissor: { value: candidato.rg_emissor || candidato.rgEmissor || '' },
      passport_number: { value: candidato.passaporte || '' },
      passport_validity: { value: candidato.passaporte_validade || candidato.passaporteValidade || '' },
      koseki: { value: candidato.koseki || '' },
      reentry: { value: candidato.reentry || '' },
      nikkei_generation: { value: candidato.geracao || candidato.geracaoNikkei || '' },
      height_cm: { value: Number(candidato.altura_cm || candidato.alturaCm) || null },
      weight_kg: { value: Number(candidato.peso_kg || candidato.pesoKg) || null },
      shoe_size_cm: { value: String(candidato.pe_cm || candidato.peCm || '') },
      japanese_level: { value: candidato.nivel_japones || '' },
      japan_work_history: {
        value: Array.isArray(candidato.curriculo_japao || candidato.experienciasJapao)
          ? (candidato.curriculo_japao || candidato.experienciasJapao).map((exp: any) => ({
              value: {
                factory: { value: exp.fabrica || '' },
                contractor: { value: exp.empreiteira || '' },
                province: { value: exp.provincia || '' },
                period: { value: exp.periodo || `${exp.inicio || ''} - ${exp.fim || ''}` },
              },
            }))
          : [],
      },
      family_members: {
        value: Array.isArray(candidato.familia)
          ? candidato.familia.map((fam: any) => ({
              value: {
                relationship: { value: fam.parentesco || '' },
                name: { value: fam.nome || '' },
                phone: { value: fam.telefone || '' },
              },
            }))
          : [],
      },
      emergency_contact_japan: {
        value: `${candidato.emergencia_nome || candidato.emergenciaNome || ''} (${candidato.emergencia_provincia || candidato.emergenciaProvincia || ''}) - Tel: ${candidato.emergencia_telefone || candidato.emergenciaTel || ''}`,
      },
      status: { value: 'SUBMITTED_TO_JAPAN_HEADQUARTERS' },
    },
  };
}

export function buildGaroonOnPremiseSoapXml(candidato: Record<string, any>, usuario: string, token: string): string {
  const nome = candidato.nome_completo || candidato.nome || '';
  const cpf = candidato.cpf || '';
  const passaporte = candidato.passaporte || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:garoon="http://wsdl.cybozu.co.jp/cbp/2007">
  <SOAP-ENV:Header>
    <garoon:Action>WorkflowCreateItem</garoon:Action>
    <garoon:Security>
      <garoon:Username>${usuario}</garoon:Username>
      <garoon:Password>${token}</garoon:Password>
    </garoon:Security>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
    <garoon:WorkflowCreateItem>
      <garoon:item>
        <garoon:name>${nome}</garoon:name>
        <garoon:cpf>${cpf}</garoon:cpf>
        <garoon:passport>${passaporte}</garoon:passport>
        <garoon:status>APPROVED_BRAZIL</garoon:status>
      </garoon:item>
    </garoon:WorkflowCreateItem>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

export async function executarSincronizacaoGaroon(req: GaroonSyncRequest): Promise<GaroonResponse> {
  const timestamp = new Date().toISOString();

  if (!req.subdomain || !req.usuario || !req.apiToken) {
    return {
      ok: false,
      detalhes: 'Parâmetros de conexão do Cybozu Garoon incompletos (subdomínio, usuário ou token ausente).',
      payloadEnviado: '',
      timestamp,
    };
  }

  let result: GaroonResponse;

  if (req.ambiente === 'cloud') {
    const payload = buildGaroonCloudPayload(req.candidato);
    const authHeader = typeof btoa !== 'undefined' ? btoa(`${req.usuario}:${req.apiToken}`) : Buffer.from(`${req.usuario}:${req.apiToken}`).toString('base64');
    const targetUrl = `https://${req.subdomain}.cybozu.com/g/api/v1/cbp/workflow/records`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cybozu-Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        const recordId = json.id ? `GRN-${json.id}` : `GRN-${Date.now()}`;
        result = {
          ok: true,
          garoonRecordId: recordId,
          detalhes: `Sincronização concluída com sucesso via API REST Cybozu Garoon Cloud. Registro criado: ${recordId}`,
          payloadEnviado: payload,
          timestamp,
        };
      } else {
        const errorText = await response.text().catch(() => '');
        result = {
          ok: false,
          detalhes: `Falha na API Cybozu Garoon HTTP ${response.status}: ${errorText || response.statusText}`,
          payloadEnviado: payload,
          timestamp,
        };
      }
    } catch (err: any) {
      result = {
        ok: false,
        detalhes: `Erro de conexão HTTP ao tentar acessar ${targetUrl}: ${err?.message || 'Servidor inalcançável'}`,
        payloadEnviado: payload,
        timestamp,
      };
    }
  } else {
    // SOAP On-Premise
    const xmlPayload = buildGaroonOnPremiseSoapXml(req.candidato, req.usuario, req.apiToken);
    const targetUrl = `https://${req.subdomain}/g/cbp.cgi`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'WorkflowCreateItem',
        },
        body: xmlPayload,
      });

      if (response.ok) {
        const responseXml = await response.text();
        const match = responseXml.match(/<garoon:id>([^<]+)<\/garoon:id>/);
        const recordId = match ? `GRN-SOAP-${match[1]}` : `GRN-SOAP-${Date.now()}`;
        result = {
          ok: true,
          garoonRecordId: recordId,
          detalhes: `Envelope SOAP transmitido com sucesso para servidor Garoon local. Registro: ${recordId}`,
          payloadEnviado: xmlPayload,
          timestamp,
        };
      } else {
        const errorText = await response.text().catch(() => '');
        result = {
          ok: false,
          detalhes: `Erro no servidor SOAP Garoon On-Premise HTTP ${response.status}: ${errorText || response.statusText}`,
          payloadEnviado: xmlPayload,
          timestamp,
        };
      }
    } catch (err: any) {
      result = {
        ok: false,
        detalhes: `Erro na transmissão SOAP para ${targetUrl}: ${err?.message || 'Falha de rede local'}`,
        payloadEnviado: xmlPayload,
        timestamp,
      };
    }
  }

  // Grava o log de auditoria no Supabase se houver conexão ativa
  if (supabase && req.organizationId) {
    try {
      await supabase.from('audit_log').insert({
        organization_id: req.organizationId,
        acao: 'garoon.sync',
        recurso: 'candidates',
        resultado: result.ok ? 'sucesso' : 'falha',
        detalhes: {
          subdomain: req.subdomain,
          ambiente: req.ambiente,
          recordId: result.garoonRecordId,
          mensagem: result.detalhes,
        },
        executado_em: timestamp,
      });
    } catch (_err) {
      // Falha silenciosa de auditoria não interrompe resposta principal
    }
  }

  return result;
}
