import { useState } from 'react';
import { 
  CheckCircle2, ArrowRight, 
  Download, Eye, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../translations';

export function FujiarteCase({ lang }: { lang: Language }) {
  console.log('Language active:', lang);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [showAuditLog, setShowAuditLog] = useState<boolean>(false);

  const handleSimulateExport = () => {
    setIsExporting(true);
    setExportComplete(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 750);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f4f5f2',
      color: '#14181f',
      fontFamily: 'var(--ssj-font-sans)',
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '56px'
    }}>

      {/* 🔴 1. HERO CASE HEADER */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '30px',
          backgroundColor: '#f7e6e2',
          border: '1px solid #c4452b',
          color: '#c4452b',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          <Award style={{ width: '16px', height: '16px', color: '#c4452b' }} />
          <span>Cliente Pioneiro & Parceiro de Homologação</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '960px',
          color: '#14181f'
        }}>
          Case FUJIARTE — Exportador Excel .XLS <span style={{ color: '#294b86' }}>Pixel-Perfect</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          lineHeight: 1.6,
          maxWidth: '840px',
          color: '#7a827f',
          fontWeight: 500
        }}>
          Digitalização completa da Ficha Cadastral tradicional (白紙 FUJIARTE ~130 campos) mantendo 100% de fidelidade ao arquivo Excel oficial exigido pela diretoria no Japão.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '8px' }}>
          <button
            onClick={handleSimulateExport}
            disabled={isExporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              backgroundColor: '#c4452b',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(196, 69, 43, 0.35)'
            }}
          >
            <Download style={{ width: '18px', height: '18px' }} />
            <span>{isExporting ? 'Gerando Planilha .XLS em 0.3s...' : '⚡ Testar Gerador Excel Fiel'}</span>
          </button>

          <Link to="/prototipo" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            backgroundColor: '#ffffff',
            color: '#14181f',
            border: '1.5px solid #e0e2dc',
            textDecoration: 'none'
          }}>
            <span>Ver Protótipo Navegável (8 Etapas)</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>

        {exportComplete && (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '16px 24px',
            borderRadius: '14px',
            backgroundColor: '#e2f0e9',
            border: '1px solid #1f7a4d',
            color: '#1f7a4d',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#1f7a4d' }} />
            <span>Planilha oficial 白紙 FUJIARTE Ficha Cadastral.xls gerada em 0.3 segundos com 100% de precisão!</span>
          </div>
        )}
      </section>

      {/* 🔴 2. MÉTRICAS HOMOLOGADAS GRID */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#ffffff', border: '1px solid #e0e2dc', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a827f', textTransform: 'uppercase' }}>Ficha FUJIARTE</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#294b86' }}>130 Campos</div>
          <div style={{ fontSize: '13px', color: '#7a827f' }}>Identificação, equipamentos de proteção e Biometria de Tatuagem.</div>
        </div>

        <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#ffffff', border: '1px solid #e0e2dc', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a827f', textTransform: 'uppercase' }}>Redução de Tempo</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1f7a4d' }}>7 a 10 min</div>
          <div style={{ fontSize: '13px', color: '#7a827f' }}>Preenchimento fácil direto no celular.</div>
        </div>

        <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#ffffff', border: '1px solid #e0e2dc', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a827f', textTransform: 'uppercase' }}>Exportador Excel</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#c4452b' }}>0.3 Segundos</div>
          <div style={{ fontSize: '13px', color: '#7a827f' }}>Geração célula a célula no modelo oficial.</div>
        </div>

        <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#ffffff', border: '1px solid #e0e2dc', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a827f', textTransform: 'uppercase' }}>Compliance LGPD</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#294b86' }}>100% Auditado</div>
          <div style={{ fontSize: '13px', color: '#7a827f' }}>Criptografia colunar pgcrypto PostgreSQL.</div>
        </div>
      </section>

      {/* 🔴 3. INTERACTIVE EXCEL TEMPLATE PREVIEW */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e2dc',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#294b86', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Modelo Oficial Homologado
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14181f', marginTop: '4px' }}>
              Planilha FUJIARTE Ficha Cadastral (Jun2024).xls
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1f7a4d', backgroundColor: '#e2f0e9', border: '1px solid #1f7a4d', padding: '6px 14px', borderRadius: '20px' }}>
              ✓ Layout 100% Preservado
            </span>
          </div>
        </div>

        {/* Excel Table Mockup */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0e2dc', backgroundColor: '#ffffff', fontFamily: 'var(--ssj-font-mono)' }}>
          <div style={{ padding: '12px 20px', backgroundColor: '#294b86', color: '#ffffff', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>
            【 応募者カルテ 】 FUJIARTE Co., Ltd. — FICHA CADASTRAL DE CANDIDATO
          </div>

          <div style={{ padding: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e2dc', fontSize: '13px' }}>
              <tbody>
                <tr style={{ backgroundColor: '#f4f5f2' }}>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f', width: '25%' }}>NOME COMPLETO</td>
                  <td colSpan={3} style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#14181f', fontSize: '15px' }}>
                    MARINA TANAKA OLIVEIRA (マリナ タナカ)
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>DATA NASCIMENTO</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#14181f' }}>14/11/1996 (29 Anos)</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>DESCENDÊNCIA (日系)</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#294b86', fontWeight: 700 }}>SANSEI (3ª GERAÇÃO)</td>
                </tr>
                <tr style={{ backgroundColor: '#f4f5f2' }}>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>CALÇADO EPI (cm)</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#14181f', fontWeight: 700 }}>25.5 cm</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>TATUAGEM (入れ墨)</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#c4452b', fontWeight: 700 }}>SIM (BRAÇOS, COSTAS)</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>AGÊNCIA INDICADORA</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#14181f' }}>Nikkei Tour SP (tenant_id: NKT)</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', fontWeight: 700, color: '#7a827f' }}>NÍVEL DE JAPONÊS</td>
                  <td style={{ padding: '12px 16px', border: '1px solid #e0e2dc', color: '#14181f' }}>Intermediário (N3)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 🔴 4. DEMO INTERATIVA DE AUDIT LOG LGPD */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e2dc',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#c4452b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Segurança & Auditoria LGPD
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14181f', marginTop: '4px' }}>
              Controle Auditado de Acesso a Dados de Saúde
            </h2>
          </div>

          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: showAuditLog ? '#e4eaf4' : '#294b86',
              color: showAuditLog ? '#294b86' : '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Eye style={{ width: '16px', height: '16px' }} />
            <span>{showAuditLog ? 'Ocultar Audit Log' : 'Simular Revelação de Dados Auditados'}</span>
          </button>
        </div>

        {showAuditLog ? (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f7f8f5', border: '1px solid #e0e2dc', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--ssj-font-mono)', fontSize: '13px' }}>
            <div style={{ color: '#1f7a4d', fontWeight: 700 }}>
              ✓ AUDIT LOG EMITIDO EM TEMPO REAL:
            </div>
            <div style={{ color: '#14181f', fontWeight: 700 }}>
              Usuário: yamada@fujiarte.co.jp | IP: 200.189.42.12 | Data: 06/08/2026 18:58:12
            </div>
            <div style={{ color: '#7a827f', borderTop: '1px solid #e0e2dc', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>Cirurgia / Fratura: Não registrada</div>
              <div>Dor Crônica: Nenhuma</div>
              <div>Daltonismo: Não</div>
              <div>Alergias: Frutos do Mar</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f7e6e2', border: '1px dashed #c4452b', textAlign: 'center', color: '#c4452b', fontSize: '13px', fontWeight: 700 }}>
            Clique no botão acima para simular a revelação dos dados restritos de saúde com carimbo de Audit Log.
          </div>
        )}
      </section>

      {/* 🔴 5. CALL TO ACTION & ROADMAP */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#14181f',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '56px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#e4eaf4', backgroundColor: '#294b86', padding: '6px 16px', borderRadius: '20px' }}>
          FUJIARTE Co., Ltd. · Homologação Técnica
        </span>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Homologação Aprovada pela Matriz no Japão
        </h2>

        <p style={{ fontSize: '15px', color: '#8d968f', maxWidth: '650px', lineHeight: 1.6 }}>
          Acesse a minuta da proposta comercial e o cronograma detalhado de entrada em produção.
        </p>

        <div style={{ paddingTop: '8px' }}>
          <Link to="/plano-acao" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            backgroundColor: '#c4452b',
            color: '#ffffff',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(196, 69, 43, 0.4)'
          }}>
            <span>Ver Proposta Comercial e Roadmap</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      </section>
    </div>
  );
}
