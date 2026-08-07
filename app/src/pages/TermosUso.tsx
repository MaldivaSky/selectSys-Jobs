import { ArrowLeft, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';

export function TermosUso() {
  const { escuro: isDark } = useTheme();
  const pageBg = isDark ? '#0d1016' : '#ffffff';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#6c757d';
  const cardBorder = isDark ? '#29313c' : '#e9ecef';
  const accentPri = '#c4452b';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Voltar para Home
        </Link>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: accentPri }}>
            <Scale size={32} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Termos de Uso</h1>
          </div>
          <p style={{ color: textSecondary, fontSize: '1.1rem' }}>Validade a partir de Janeiro de 2026</p>
        </div>

        <div style={{ padding: '32px', border: `1px solid ${cardBorder}`, borderRadius: '16px', backgroundColor: isDark ? '#161b24' : '#f8f9fa' }}>
          
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 16px' }}>1. Plataforma Totalmente Gratuita (Para Candidatos)</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            A SelectSys Jobs atua como uma ponte tecnológica. <strong>NUNCA</strong> cobraremos taxas dos candidatos para acesso a vagas, cadastro ou utilização do assistente virtual. Os custos operacionais são inteiramente cobertos pelas Empreiteiras Parceiras (B2B).
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '32px 0 16px' }}>2. Veracidade das Informações</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            Ao submeter seu currículo ou preencher a Ficha Cadastral (via IA ou manualmente), você declara que todas as informações (incluindo histórico criminal e restrições de imigração) são verdadeiras. A falsificação de documentos para obtenção do visto COE é crime no Japão e no Brasil.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '32px 0 16px' }}>3. Emissão de Visto (COE)</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            A SelectSys automatiza o processo de preenchimento, porém a decisão final de aprovação da vaga e emissão do visto de trabalho (COE - Certificate of Eligibility) cabe exclusivamente ao Governo Japonês e à Diretoria da Empreiteira Parceira. A plataforma não garante a obtenção do visto.
          </p>

          <div style={{ marginTop: '40px', padding: '16px', backgroundColor: `${accentPri}15`, borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={24} color={accentPri} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: textPrimary, margin: 0, lineHeight: 1.6 }}>
              Ao continuar e criar sua conta na SelectSys Jobs, você atesta que leu e concorda integralmente com estes Termos de Uso e com a nossa Política de Privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
