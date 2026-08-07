import { executarSincronizacaoGaroon, type GaroonSyncRequest } from './garoonSync';

export interface GaroonConfig {
  subdomain: string;
  usuario: string;
  apiToken: string;
  ambiente: 'cloud' | 'on_premise';
  sincronizacaoAutomatica: boolean;
}

export interface GaroonSyncResult {
  sucesso: boolean;
  garoonRecordId?: string;
  mensagem: string;
  timestamp: string;
  detalhesPayload?: Record<string, unknown> | string;
}

export const CONFIG_GAROON_PADRAO: GaroonConfig = {
  subdomain: 'fujiarte-japan',
  usuario: 'admin_dekassegui',
  apiToken: 'garoon_sec_tok_2026_fuji',
  ambiente: 'cloud',
  sincronizacaoAutomatica: true,
};

export async function sincronizarCandidatoComGaroon(
  candidato: Record<string, any>,
  config: GaroonConfig = CONFIG_GAROON_PADRAO,
): Promise<GaroonSyncResult> {
  const req: GaroonSyncRequest = {
    subdomain: config.subdomain || 'fujiarte-japan',
    usuario: config.usuario || 'admin_dekassegui',
    apiToken: config.apiToken || 'garoon_sec_tok_2026_fuji',
    ambiente: config.ambiente || 'cloud',
    candidato,
  };

  const res = await executarSincronizacaoGaroon(req);

  return {
    sucesso: res.ok,
    garoonRecordId: res.garoonRecordId,
    mensagem: res.detalhes,
    timestamp: res.timestamp,
    detalhesPayload: res.payloadEnviado,
  };
}
