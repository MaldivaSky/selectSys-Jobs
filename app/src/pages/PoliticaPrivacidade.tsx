import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';

export function PoliticaPrivacidade() {
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
            <ShieldCheck size={32} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Política de Privacidade</h1>
          </div>
          <p style={{ color: textSecondary, fontSize: '1.1rem' }}>Última atualização: Outubro de 2026</p>
        </div>

        <div style={{ padding: '32px', border: `1px solid ${cardBorder}`, borderRadius: '16px', backgroundColor: isDark ? '#161b24' : '#f8f9fa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700 }}>
            <Lock size={20} color={accentPri} /> Conformidade com LGPD (Art. 20) e APPI
          </div>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            A SelectSys Jobs garante a proteção total dos seus dados pessoais e de saúde. Todos os dados sensíveis (como histórico médico e tamanhos de EPIs) são criptografados no banco de dados utilizando a extensão <strong>pgcrypto</strong>.
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '32px 0 16px' }}>1. Coleta de Dados e Inteligência Artificial</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            Ao utilizar nosso preenchimento via currículo, nosso motor de Inteligência Artificial (DeepSeek V3) processa seu documento estritamente para extração de dados. O arquivo original não é retido e os dados extraídos são utilizados exclusivamente para gerar a ficha oficial (Formato da Empreiteira ou parceiras).
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '32px 0 16px' }}>2. Compartilhamento de Informações</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            Seus dados só serão compartilhados com a Empreiteira Japonesa correspondente à vaga que você se candidatar. Não vendemos, alugamos ou repassamos seus dados a terceiros não envolvidos no processo de recrutamento e emissão de visto (COE).
          </p>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '32px 0 16px' }}>3. Seus Direitos</h3>
          <p style={{ lineHeight: 1.8, color: textSecondary, marginBottom: '24px' }}>
            Conforme a Lei Geral de Proteção de Dados, você tem o direito de solicitar a exclusão, portabilidade ou revisão de qualquer decisão automatizada gerada pelo nosso sistema de triagem. Para exercer seus direitos, acesse o painel do candidato.
          </p>
        </div>
      </div>
    </div>
  );
}
