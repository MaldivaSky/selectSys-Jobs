import { useState } from 'react';
import { 
  ArrowRight, Search, ShieldCheck, MapPin, 
  PlaneTakeoff, Briefcase, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';
import { BrandMark } from '../brand/BrandMark';

export function HomePage() {
  const { escuro: isDark } = useTheme();

  // Paleta Premium B2C
  const pageBg = isDark ? '#0d1016' : '#ffffff';
  const cardBg = isDark ? '#161b24' : '#f8f9fa';
  const cardBorder = isDark ? '#29313c' : '#e9ecef';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#6c757d';
  
  const accentPri = '#c4452b'; // Vermelho Japonês (Shu)
  const accentPriHover = '#a33620';
  const accentSec = isDark ? '#7ba4de' : '#294b86'; // Azul Anil (Indigo)

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: pageBg,
      color: textPrimary,
      fontFamily: 'var(--ssj-font-sans)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        width: '100%',
        padding: '120px 20px 80px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderBottom: `1px solid ${cardBorder}`
      }}>
        {/* Background Gradients */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '80%', background: `radial-gradient(circle, ${accentPri}15 0%, transparent 70%)`,
          zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '30px', backgroundColor: `${accentPri}15`, color: accentPri, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <ShieldCheck size={16} /> Portal Oficial e Verificado
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            A sua ponte segura para o <br />
            <span style={{ color: accentPri }}>trabalho no Japão.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', lineHeight: 1.6, color: textSecondary, maxWidth: '700px', fontWeight: 500 }}>
            Conectamos brasileiros descendentes diretamente com as maiores e mais seguras empreiteiras do Japão. Sem taxas ocultas, com suporte total de visto e embarque.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            <Link to="/vagas" style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 40px', borderRadius: '12px',
              backgroundColor: accentPri, color: '#fff', fontSize: '16px', fontWeight: 700, textDecoration: 'none',
              boxShadow: `0 8px 25px ${accentPri}40`, transition: 'all 0.2s ease'
            }}>
              <Search size={20} /> Explorar Vagas no Japão
            </Link>
            
            <Link to="/candidato" style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 40px', borderRadius: '12px',
              backgroundColor: cardBg, color: textPrimary, fontSize: '16px', fontWeight: 700, textDecoration: 'none',
              border: `1.5px solid ${cardBorder}`, transition: 'all 0.2s ease'
            }}>
              Já tenho cadastro
            </Link>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '48px', opacity: 0.8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: textSecondary }}>
              <CheckCircle2 size={18} color={accentPri} /> Vagas Validadas
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: textSecondary }}>
              <CheckCircle2 size={18} color={accentPri} /> Suporte Jurídico (COE)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: textSecondary }}>
              <CheckCircle2 size={18} color={accentPri} /> Zero Custo para Candidato
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 20px', backgroundColor: pageBg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Como Funciona?</h2>
            <p style={{ fontSize: '1.1rem', color: textSecondary, lineHeight: 1.6 }}>Nosso processo foi desenhado para ser transparente, rápido e totalmente digital.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            
            {/* Step 1 */}
            <div style={{ padding: '32px', backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${cardBorder}`, position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${accentPri}15`, color: accentPri, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>1. Escolha a Vaga Ideal</h3>
              <p style={{ color: textSecondary, lineHeight: 1.6 }}>Navegue pelo nosso portal e escolha a oportunidade que mais se adapta ao seu perfil. Vagas em Aichi, Shizuoka e mais.</p>
            </div>

            {/* Step 2 */}
            <div style={{ padding: '32px', backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${cardBorder}`, position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${accentSec}15`, color: accentSec, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Briefcase size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>2. Cadastro Facilitado com IA</h3>
              <p style={{ color: textSecondary, lineHeight: 1.6 }}>Faça upload do seu currículo em PDF. Nossa Inteligência Artificial preenche sua ficha automaticamente, poupando seu tempo.</p>
            </div>

            {/* Step 3 */}
            <div style={{ padding: '32px', backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${cardBorder}`, position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${accentPri}15`, color: accentPri, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <PlaneTakeoff size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>3. Emissão de Visto e Embarque</h3>
              <p style={{ color: textSecondary, lineHeight: 1.6 }}>A empreiteira cuida do COE e nós te ajudamos em todo o processo do visto. Tudo transparente pelo seu painel do candidato.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '100px 20px', backgroundColor: cardBg, borderTop: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Pronto para mudar o rumo da sua carreira?</h2>
          <p style={{ fontSize: '1.1rem', color: textSecondary, maxWidth: '600px', lineHeight: 1.6 }}>Junte-se a milhares de brasileiros que construíram uma vida segura e próspera no Japão através dos nossos parceiros oficiais.</p>
          <Link to="/vagas" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 48px', borderRadius: '12px',
            backgroundColor: accentPri, color: '#fff', fontSize: '16px', fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 8px 25px ${accentPri}40`
          }}>
            Ver as Vagas Disponíveis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
}
