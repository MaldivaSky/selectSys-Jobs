import { executarSincronizacaoGaroon, type GaroonSyncRequest } from './garoonSync';
import { env } from '../env';

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
  subdomain: env.VITE_GAROON_SUBDOMAIN || 'fujiarte-japan',
  usuario: env.VITE_GAROON_USER || 'admin_dekassegui',
  apiToken: env.VITE_GAROON_TOKEN || '',
  ambiente: 'cloud',
  sincronizacaoAutomatica: true,
};

export async function sincronizarCandidatoComGaroon(
  candidato: Record<string, any>,
  config: Partial<GaroonConfig> = {},
  organizationId?: string
): Promise<GaroonSyncResult> {
  const finalConfig: GaroonConfig = {
    subdomain: config.subdomain || CONFIG_GAROON_PADRAO.subdomain,
    usuario: config.usuario || CONFIG_GAROON_PADRAO.usuario,
    apiToken: config.apiToken || CONFIG_GAROON_PADRAO.apiToken,
    ambiente: config.ambiente || CONFIG_GAROON_PADRAO.ambiente,
    sincronizacaoAutomatica: config.sincronizacaoAutomatica ?? CONFIG_GAROON_PADRAO.sincronizacaoAutomatica,
  };

  const req: GaroonSyncRequest = {
    subdomain: finalConfig.subdomain,
    usuario: finalConfig.usuario,
    apiToken: finalConfig.apiToken,
    ambiente: finalConfig.ambiente,
    candidato,
    organizationId,
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
