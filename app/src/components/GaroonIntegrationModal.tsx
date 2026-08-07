import { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, X, Server, Key, Globe, ShieldCheck } from 'lucide-react';
import { sincronizarCandidatoComGaroon, CONFIG_GAROON_PADRAO, type GaroonConfig, type GaroonSyncResult } from '../services/garoonService';

interface GaroonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidato?: Record<string, any> | null;
}

export function GaroonIntegrationModal({ isOpen, onClose, candidato }: GaroonModalProps) {
  const [config, setConfig] = useState<GaroonConfig>(CONFIG_GAROON_PADRAO);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<GaroonSyncResult | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'sync' | 'config'>('sync');

  if (!isOpen) return null;

  const handleSync = async () => {
    setLoading(true);
    setResultado(null);
    const candidatoAlvo = candidato || {
      nome_completo: 'MARINA TANAKA OLIVEIRA',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      passaporte: 'FT654321',
      geracao: 'Sansei',
      nivel_japones: 'Intermediário',
      agencia: 'FUJIARTE São Paulo',
    };
    const res = await sincronizarCandidatoComGaroon(candidatoAlvo, config);
    setResultado(res);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 14, 22, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#161b24', color: '#e9ece8', borderRadius: '24px',
        border: '1px solid #29313c', maxWidth: '640px', width: '100%',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid #29313c',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #1c222c 0%, #161b24 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(147, 51, 234, 0.15)', padding: '10px', borderRadius: '12px', color: '#c084fc' }}>
              <Database size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
                Integração Cybozu Garoon (Japão)
              </h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '2px' }}>
                Sincronização direta com o sistema da matriz sem redigitação
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #29313c', backgroundColor: '#1c222c' }}>
          <button
            onClick={() => setAbaAtiva('sync')}
            style={{
              flex: 1, padding: '14px', border: 'none', backgroundColor: abaAtiva === 'sync' ? '#161b24' : 'transparent',
              color: abaAtiva === 'sync' ? '#c084fc' : '#9ca3af', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              borderBottom: abaAtiva === 'sync' ? '2px solid #c084fc' : 'none'
            }}
          >
            Disparar Sincronização
          </button>
          <button
            onClick={() => setAbaAtiva('config')}
            style={{
              flex: 1, padding: '14px', border: 'none', backgroundColor: abaAtiva === 'config' ? '#161b24' : 'transparent',
              color: abaAtiva === 'config' ? '#c084fc' : '#9ca3af', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              borderBottom: abaAtiva === 'config' ? '2px solid #c084fc' : 'none'
            }}
          >
            Configurações da API
          </button>
        </div>

        {/* Corpo do Modal */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {abaAtiva === 'sync' ? (
            <>
              <div style={{ backgroundColor: '#1c222c', borderRadius: '16px', padding: '20px', border: '1px solid #29313c' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Candidato Selecionado
                </h4>
                <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#f3f4f6' }}>
                  {candidato?.nome_completo || candidato?.nome || 'MARINA TANAKA OLIVEIRA'}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#9ca3af' }}>
                  <span>CPF: {candidato?.cpf || '123.456.789-00'}</span>
                  <span>•</span>
                  <span>Visto: Nikkei {candidato?.geracao || 'Sansei'}</span>
                </div>
              </div>

              {resultado && (
                <div style={{
                  backgroundColor: resultado.sucesso ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${resultado.sucesso ? '#22c55e' : '#ef4444'}`,
                  borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px'
                }}>
                  {resultado.sucesso ? <CheckCircle2 size={24} color="#22c55e" /> : <AlertCircle size={24} color="#ef4444" />}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: resultado.sucesso ? '#4ade80' : '#f87171' }}>
                      {resultado.sucesso ? 'Enviado para o Garoon Japão' : 'Falha na Sincronização'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#e5e7eb', lineHeight: 1.5 }}>
                      {resultado.mensagem}
                    </p>
                    {resultado.garoonRecordId && (
                      <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', backgroundColor: '#1c222c', padding: '4px 10px', borderRadius: '6px', color: '#c084fc', fontWeight: 700 }}>
                        Ref: {resultado.garoonRecordId}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleSync}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '16px', borderRadius: '14px', backgroundColor: '#9333ea', color: '#ffffff',
                  fontWeight: 700, fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)'
                }}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                {loading ? 'Transmitindo para Cybozu Garoon...' : 'Enviar Registro Agora'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                  <Globe size={14} /> Subdomínio Cybozu (.cybozu.com)
                </label>
                <input
                  type="text"
                  value={config.subdomain}
                  onChange={e => setConfig({ ...config, subdomain: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1c222c', border: '1px solid #29313c', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                  <Server size={14} /> Usuário da API
                </label>
                <input
                  type="text"
                  value={config.usuario}
                  onChange={e => setConfig({ ...config, usuario: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1c222c', border: '1px solid #29313c', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                  <Key size={14} /> Chave Token API / Segredo Garoon
                </label>
                <input
                  type="password"
                  value={config.apiToken}
                  onChange={e => setConfig({ ...config, apiToken: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1c222c', border: '1px solid #29313c', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '14px', backgroundColor: '#1c222c', borderRadius: '12px' }}>
                <ShieldCheck size={20} color="#c084fc" />
                <span style={{ fontSize: '13px', color: '#d1d5db' }}>
                  Conexão segura SSL/TLS 1.3 ativa com o servidor Cybozu Garoon da matriz japonesa.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
