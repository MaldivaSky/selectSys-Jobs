import { useState, useEffect } from 'react';
import { 
  ArrowRight, Search, ShieldCheck, MapPin, 
  PlaneTakeoff, Briefcase,
  Globe, ChevronRight, UserCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';

export function HomePage() {
  const { escuro: isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Premium B2C Colors
  const bg = isDark ? '#05070a' : '#f8f9fa';
  const textPri = isDark ? '#ffffff' : '#000000';
  const textSec = isDark ? '#8d96a0' : '#6c757d';
  
  // Brand Gradients
  const gradientPrimary = 'linear-gradient(135deg, #c4452b 0%, #ff6b4a 100%)';
  const gradientText = 'linear-gradient(to right, #ffffff, #a0aab5)';
  const glassBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: bg,
      color: textPri,
      fontFamily: 'var(--ssj-font-sans)',
      overflowX: 'hidden'
    }}>
      {/* GLOBAL CSS ANIMATIONS (Injetadas inline) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-title {
          background: ${isDark ? gradientText : 'linear-gradient(to right, #1a1a1a, #4a4a4a)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-card {
          background: ${glassBg};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${glassBorder};
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          transform: translateY(-5px);
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
          border: 1px solid rgba(196, 69, 43, 0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .premium-btn {
          position: relative;
          overflow: hidden;
          background: ${gradientPrimary};
          color: white;
          box-shadow: 0 10px 30px rgba(196, 69, 43, 0.3);
          transition: all 0.3s ease;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(196, 69, 43, 0.4);
        }
        .premium-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg);
          animation: shine 6s infinite;
        }
      `}</style>

      {/* DYNAMIC BACKGROUND ORBS */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'clip', pointerEvents: 'none', zIndex: 0, contain: 'strict' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: `translate(-50%, ${scrollY * 0.2}px)`,
          width: '80vw', height: '80vw', maxWidth: '800px', maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(196, 69, 43, 0.15) 0%, transparent 60%)',
          animation: 'pulseGlow 8s infinite alternate', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', transform: `translateY(${-scrollY * 0.1}px)`,
          width: '60vw', height: '60vw', maxWidth: '600px', maxHeight: '600px',
          background: 'radial-gradient(circle, rgba(41, 75, 134, 0.1) 0%, transparent 60%)',
          animation: 'pulseGlow 10s infinite alternate-reverse', filter: 'blur(60px)'
        }} />
      </div>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(56px, 14vw, 160px)', paddingBottom: 'clamp(40px, 10vw, 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingLeft: 'var(--ssj-gutter)', paddingRight: 'var(--ssj-gutter)' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '100px', background: glassBg, border: `1px solid ${glassBorder}`, marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
          <ShieldCheck size={16} color="#c4452b" />
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Portal Oficial de Recrutamento</span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'var(--ssj-t-display)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: '1000px', margin: '0 auto clamp(16px, 4vw, 32px)' }}>
          O caminho mais rápido <br /> para o <span style={{ background: gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Japão.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: textSec, maxWidth: '650px', lineHeight: 1.6, marginBottom: 'clamp(24px, 6vw, 48px)', fontWeight: 400 }}>
          Descubra oportunidades verificadas nas melhores empreiteiras, com suporte completo para visto e embarque. Sem taxas ocultas.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/vagas" className="premium-btn" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 40px', borderRadius: '100px',
            fontSize: '17px', fontWeight: 700, textDecoration: 'none'
          }}>
            Ver Vagas Disponíveis <ArrowRight size={20} />
          </Link>
          <Link to="/candidato" className="glass-card" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 40px', borderRadius: '100px',
            color: textPri, fontSize: '17px', fontWeight: 600, textDecoration: 'none'
          }}>
            <UserCircle2 size={20} /> Portal do Candidato
          </Link>
        </div>

        {/* HERO STATS */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>+500</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Vagas Abertas</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>100%</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Processo Gratuito</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>24h</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Retorno Médio</span>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '30px 0', borderTop: `1px solid ${glassBorder}`, borderBottom: `1px solid ${glassBorder}`, background: glassBg, zIndex: 1 }}>
        <div style={{ display: 'flex', width: '200%', animation: 'scrollMarquee 30s linear infinite' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', width: '50%', justifyContent: 'space-around', alignItems: 'center' }}>
              {['AICHI', 'SHIZUOKA', 'MIE', 'GUNMA', 'KANAGAWA'].map(prov => (
                <div key={prov} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: textSec, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>
                  <MapPin size={24} /> {prov}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES / HOW IT WORKS */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(48px, 12vw, 120px) var(--ssj-gutter)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Simples. Rápido. <span style={{ color: '#c4452b' }}>Seguro.</span>
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: textSec, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Nossa plataforma utiliza tecnologia de ponta para garantir que sua jornada até o Japão seja livre de complicações.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 'clamp(16px, 4vw, 32px)' }}>
          
          <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(196, 69, 43, 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(196, 69, 43, 0.1)', color: '#c4452b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(16px, 4vw, 32px)' }}>
              <Search size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Encontre a Vaga Ideal</h3>
            <p style={{ color: textSec, lineHeight: 1.7, fontSize: '1.1rem' }}>
              Acesso exclusivo a centenas de vagas verificadas nas maiores indústrias automotivas e eletrônicas do Japão.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(41, 75, 134, 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(41, 75, 134, 0.1)', color: '#294b86', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(16px, 4vw, 32px)' }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Cadastro por IA</h3>
            <p style={{ color: textSec, lineHeight: 1.7, fontSize: '1.1rem' }}>
              Basta enviar seu currículo atual. Nossa Inteligência Artificial preenche toda a papelada complexa exigida pelas empreiteiras automaticamente.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(31, 122, 77, 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(31, 122, 77, 0.1)', color: '#1f7a4d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(16px, 4vw, 32px)' }}>
              <PlaneTakeoff size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Suporte COE & Visto</h3>
            <p style={{ color: textSec, lineHeight: 1.7, fontSize: '1.1rem' }}>
              Acompanhe o status do seu Certificado de Elegibilidade (COE) em tempo real. Auxílio jurídico completo até o dia do embarque.
            </p>
          </div>

        </div>
      </section>

      {/* ENTERPRISE CALLOUT */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px, 9vw, 80px) var(--ssj-gutter)', background: `linear-gradient(to right, ${glassBg}, transparent)` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(20px, 5vw, 40px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSec, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Globe size={18} /> Para Empreiteiras e Agências
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>Portal B2B & Gestão de Talentos</h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: textSec, maxWidth: '500px', lineHeight: 1.6 }}>
              Acesse nosso dashboard avançado para gerenciar candidatos, acompanhar SLAs de COE e exportar fichas diretamente no padrão Excel.
            </p>
          </div>
          <Link to="/login" className="glass-card" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 40px', borderRadius: '16px',
            color: textPri, fontSize: '16px', fontWeight: 600, textDecoration: 'none'
          }}>
            Acessar Área Empresarial <ChevronRight size={20} color="#c4452b" />
          </Link>
        </div>
      </section>

    </div>
  );
}
