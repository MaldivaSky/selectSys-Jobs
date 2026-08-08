import { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search, RefreshCw, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../dados/supabase';
import { exportarDadosCandidatoLgpd, revogarConsentimentoLgpd, executarExpurgoProgramado24Meses } from '../services/lgpdService';

interface AuditEntry {
  id: string;
  acao: string;
  recurso: string;
  resultado: string;
  detalhes: Record<string, any>;
  executado_em: string;
}

export function DpoAuditLogView() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  const [candidatoIdPortabilidade, setCandidatoIdPortabilidade] = useState<string>('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarLogs = async () => {
    setCarregando(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_log')
          .select('*')
          .order('executado_em', { ascending: false })
          .limit(50);

        if (!error && data) {
          setLogs(data as AuditEntry[]);
        }
      } catch {
        // Fallback de logs em modo offline
      }
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarLogs();
  }, []);

  const handleExportarPortabilidade = async () => {
    if (!candidatoIdPortabilidade) return;
    const res = await exportarDadosCandidatoLgpd(candidatoIdPortabilidade);
    if (res.sucesso && res.dadosJson) {
      const blob = new Blob([JSON.stringify(res.dadosJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portabilidade_lgpd_${candidatoIdPortabilidade}.json`;
      a.click();
      setMensagemSucesso('Arquivo de Portabilidade JSON baixado com sucesso!');
    }
  };

  const handleExecutarExpurgo = async () => {
    const res = await executarExpurgoProgramado24Meses();
    setMensagemSucesso(res.mensagem);
    carregarLogs();
  };

  const handleRevogarConsentimento = async () => {
    if (!candidatoIdPortabilidade) return;
    const res = await revogarConsentimentoLgpd(candidatoIdPortabilidade);
    setMensagemSucesso(res.mensagem);
    carregarLogs();
  };

  const logsFiltrados = logs.filter(
    l => l.acao.toLowerCase().includes(filtroBusca.toLowerCase()) || l.recurso.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ssj-paper)', color: 'var(--ssj-text)', padding: '40px 24px', fontFamily: 'var(--ssj-font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* CABEÇALHO DPO */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--ssj-rule)', paddingBottom: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--ssj-indigo)', backgroundColor: 'var(--ssj-indigo-wash)', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <ShieldCheck size={16} /> Painel de Governança & DPO (LGPD Art. 18 / APPI Japão)
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Central de Auditoria e Portabilidade de Dados</h1>
          </div>
          <button
            onClick={carregarLogs}
            className="ssj-btn ssj-btn--sm"
            style={{ borderRadius: '10px' }}
          >
            <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} /> Atualizar Logs
          </button>
        </div>

        {mensagemSucesso && (
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--ssj-verde-wash)', border: '1px solid var(--ssj-verde-line)', color: 'var(--ssj-verde-ink)', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {mensagemSucesso}
          </div>
        )}

        {/* FERRAMENTAS DO DPO */}
        <div className="ssj-grid ssj-grid--wide">
          
          {/* Card 1: Portabilidade JSON */}
          <div className="ssj-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Download size={24} color="#3b82f6" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Portabilidade de Dados (Art. 18, V)</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--ssj-muted)', margin: 0, lineHeight: 1.5 }}>
              Exporte todos os dados pessoais e históricos do candidato em formato JSON estruturado conforme exigido pela LGPD e APPI Japão.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <input
                type="text"
                placeholder="ID ou CPF do Candidato"
                value={candidatoIdPortabilidade}
                onChange={e => setCandidatoIdPortabilidade(e.target.value)}
                className="ssj-input"
                style={{ fontSize: '14px', padding: '8px 12px', minHeight: '40px' }}
              />
              <button onClick={handleExportarPortabilidade} className="ssj-btn ssj-btn--pri ssj-btn--sm">
                Baixar JSON
              </button>
            </div>
          </div>

          {/* Card 2: Revogação & Expurgo */}
          <div className="ssj-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={24} color="#c4452b" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Revogação & Expurgo 24 Meses</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--ssj-muted)', margin: 0, lineHeight: 1.5 }}>
              Execute a revogação formal de consentimento ou rode a rotina automatizada de expurgo de candidaturas inativas há mais de 24 meses.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button onClick={handleRevogarConsentimento} className="ssj-btn ssj-btn--seal ssj-btn--sm">
                Revogar Consentimento
              </button>
              <button onClick={handleExecutarExpurgo} className="ssj-btn ssj-btn--ghost ssj-btn--sm" style={{ border: '1px solid var(--ssj-rule)' }}>
                Rodar Expurgo 24m
              </button>
            </div>
          </div>

        </div>

        {/* TABELA DE AUDIT LOG */}
        <div className="ssj-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#6366f1" /> Logs de Auditoria do Sistema ({logsFiltrados.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--ssj-surface-2)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--ssj-rule)' }}>
              <Search size={16} color="var(--ssj-muted)" />
              <input
                type="text"
                placeholder="Filtrar por ação ou recurso..."
                value={filtroBusca}
                onChange={e => setFiltroBusca(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--ssj-text)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--ssj-surface-2)', borderBottom: '2px solid var(--ssj-rule-2)', color: 'var(--ssj-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Data / Hora</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Ação Executada</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Recurso</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Resultado</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Detalhes do Evento</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--ssj-faint)' }}>
                      Nenhum registro de auditoria encontrado.
                    </td>
                  </tr>
                ) : (
                  logsFiltrados.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--ssj-rule)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--ssj-font-mono)', fontSize: '12px', color: 'var(--ssj-muted)' }}>
                        {new Date(item.executado_em || Date.now()).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ssj-indigo)' }}>
                        {item.acao}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--ssj-text)' }}>
                        {item.recurso}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`ssj-pill ${item.resultado === 'sucesso' ? 'ssj-pill--ok' : 'ssj-pill--seal'}`}>
                          {item.resultado || 'sucesso'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--ssj-font-mono)', fontSize: '11.5px', color: 'var(--ssj-faint)' }}>
                        {JSON.stringify(item.detalhes || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
