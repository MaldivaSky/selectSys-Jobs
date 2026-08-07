import { useState, useEffect } from 'react';
import { 
  ArrowRight, ShieldCheck, MapPin, 
  Globe, ChevronRight, UserCircle2, X, Info, Sparkles, HeartPulse, FileSpreadsheet, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';

interface ShowcaseModal {
  titulo: string;
  categoria: string;
  dorDoCliente: string;
  nossaSolucao: string;
  resultadoPratico: string;
}

export function HomePage() {
  const { escuro: isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [modalCard, setModalCard] = useState<ShowcaseModal | null>(null);

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
      {/* GLOBAL CSS ANIMATIONS */}
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
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Portal Oficial de Recrutamento Dekassegui</span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'var(--ssj-t-display)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: '1000px', margin: '0 auto clamp(16px, 4vw, 32px)' }}>
          O caminho mais simples <br /> para trabalhar no <span style={{ background: gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Japão.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: textSec, maxWidth: '650px', lineHeight: 1.6, marginBottom: 'clamp(24px, 6vw, 48px)', fontWeight: 400 }}>
          Formulários leves no celular, preenchimento inteligente sem papelada e acompanhamento de visto em tempo real. Isenção total de taxas para candidatos.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/vagas" className="premium-btn" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 36px', borderRadius: '100px',
            fontSize: '17px', fontWeight: 700, textDecoration: 'none'
          }}>
            Ver Vagas Abertas <ArrowRight size={20} />
          </Link>
          <Link to="/c/fujiarte" className="glass-card" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 36px', borderRadius: '100px',
            color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', fontSize: '17px', fontWeight: 700, textDecoration: 'none'
          }}>
            <Sparkles size={20} /> Testar Formulário sem Fricção
          </Link>
          <Link to="/candidato" className="glass-card" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 36px', borderRadius: '100px',
            color: textPri, fontSize: '17px', fontWeight: 600, textDecoration: 'none'
          }}>
            <UserCircle2 size={20} /> Portal Candidato
          </Link>
        </div>

        {/* HERO STATS */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>+500</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Vagas Ativas</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>100%</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Gratuito B2C</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: textPri }}>1 Clique</span>
            <span style={{ fontSize: '14px', color: textSec, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Gerador de Planilha</span>
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

      {/* ENTERPRISE SHOWCASE SECTION WITH INTERACTIVE MODALS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px var(--ssj-gutter)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: glassBg, border: `1px solid ${glassBorder}`, marginBottom: '16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c4452b' }}>
            Soluções de Alto Impacto para Agências
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px' }}>Resolvemos a dor da sua operação</h2>
          <p style={{ color: textSec, fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            Clique em qualquer card abaixo para ver como transformamos a rotina do seu RH e aceleramos a contratação.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          
          {/* Card 1 */}
          <div
            onClick={() => setModalCard({
              titulo: 'Gerador de Planilhas em 1 Clique (Layout Exato da Matriz)',
              categoria: 'Automação de Fichas',
              dorDoCliente: 'A matriz no Japão exige planilhas gigantes de 200+ células, mas enviar PDFs faz candidatos desistirem e seu RH gasta horas digitando dados manualmente.',
              nossaSolucao: 'O candidato preenche uma experiência simples no celular em minutos. O sistema baixa a planilha .xlsx idêntica ao modelo exigido pela sua matriz no Japão em 1 clique.',
              resultadoPratico: 'Fim da digitação manual do RH, zero abandono de candidatos e entrega imediata da planilha perfeita para o Japão.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FileSpreadsheet size={28} color="#10b981" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Padrão Oficial</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Planilhas Exatas sem Digitação</h3>
            <p style={{ fontSize: '14px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Formulário leve no celular que gera a planilha `.xlsx` exata da sua empresa pronta para envio em 1 clique.
            </p>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver como resolve a dor do RH <Info size={15} />
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setModalCard({
              titulo: 'Sincronização Direta com o Sistema da Matriz no Japão',
              categoria: 'Conexão Internacional',
              dorDoCliente: 'Após aprovar o candidato no Brasil, o RH perde dias trocando e-mails com a matriz no Japão para cadastrar dados de passaporte, visto e histórico familiar.',
              nossaSolucao: 'Conectamos a plataforma diretamente ao sistema da matriz (Cybozu Garoon). Ao aprovar o candidato no painel, todos os dados são transmitidos instantaneamente com segurança.',
              resultadoPratico: 'Elimina o retrabalho de digitação no Japão e antecipa em até 14 dias a emissão do visto de trabalho (COE).'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Database size={28} color="#c084fc" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc', background: 'rgba(192,132,252,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Conexão Japão</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Conexão Direta com a Matriz</h3>
            <p style={{ fontSize: '14px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Envio instantâneo do candidato aprovado para o sistema corporativo no Japão sem depender de troca de e-mails.
            </p>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver como resolve a dor do RH <Info size={15} />
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setModalCard({
              titulo: 'Painel de Seleção Biométrica & Ergonomia Fabril',
              categoria: 'Recrutamento B2B',
              dorDoCliente: 'Enviar um trabalhador com calçado ou altura incompatível com a linha de montagem da fábrica gera trocas de uniforme e desistências na primeira semana.',
              nossaSolucao: 'Capturamos as medidas de altura, peso, calçado e cintura do trabalhador e permitimos ao recrutador filtrar candidatos ideais para cada fábrica. O IMC é visível só para o recrutador.',
              resultadoPratico: 'Garante o encaixe ergonômico perfeito na fábrica e evita custos com trocas de calçados de segurança e uniformes.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <HeartPulse size={28} color="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Ergonomia Fabril</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Filtros Biométricos do RH</h3>
            <p style={{ fontSize: '14px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Filtragem por altura, calçado em cm e IMC do recrutador para garantir o perfil físico perfeito em cada fábrica.
            </p>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver como resolve a dor do RH <Info size={15} />
            </span>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setModalCard({
              titulo: 'Triagem Inteligente sem Perda de Candidatos',
              categoria: 'Segurança Jurídica',
              dorDoCliente: 'Risco de perda de tempo com candidatos inelegíveis para o visto ou expor a agência a problemas jurídicos ao coletar dados sem proteção.',
              nossaSolucao: 'Análise automática de requisitos (idade, descendência e tatuagens) com parecer explicado ao candidato e criptografia médica dos dados de saúde no banco.',
              resultadoPratico: 'Proteção jurídica total perante a LGPD e o regulamento de imigração do Japão (APPI).'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ShieldCheck size={28} color="#3b82f6" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', background: 'rgba(59,130,246,0.15)', padding: '4px 10px', borderRadius: '12px' }}>LGPD & APPI</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Triagem Explicável e Segura</h3>
            <p style={{ fontSize: '14px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Parecer claro com justificativa legal para o candidato e criptografia de saúde no banco de dados.
            </p>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver como resolve a dor do RH <Info size={15} />
            </span>
          </div>

        </div>
      </section>

      {/* MODAL DE EXPLICAÇÃO DA DOR DO CLIENTE */}
      {modalCard && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            width: '100%', maxWidth: '640px', backgroundColor: isDark ? '#141820' : '#ffffff', border: `1px solid ${glassBorder}`,
            borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', color: textPri, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setModalCard(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: isDark ? '#222936' : '#edf2f7', border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: textSec
              }}
            >
              <X size={20} />
            </button>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#c4452b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {modalCard.categoria}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0 0', lineHeight: 1.3 }}>
                {modalCard.titulo}
              </h3>
            </div>

            {/* A Dor Atual */}
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fff5f5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px' }}>
                🔴 A Dor Atual (Sem o sistema)
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: textPri }}>
                {modalCard.dorDoCliente}
              </p>
            </div>

            {/* A Nossa Solução */}
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#ebf8ff', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px' }}>
                🚀 A Nossa Solução (Com a SelectSys Jobs)
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: textPri }}>
                {modalCard.nossaSolucao}
              </p>
            </div>

            {/* Resultado Prático */}
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#f0fff4', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>
                💡 O Resultado Prático para sua Agência
              </div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, lineHeight: 1.6, color: isDark ? '#34d399' : '#276749' }}>
                {modalCard.resultadoPratico}
              </p>
            </div>

            <button
              onClick={() => setModalCard(null)}
              className="premium-btn"
              style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '8px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ENTERPRISE CALLOUT */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px, 9vw, 80px) var(--ssj-gutter)', background: `linear-gradient(to right, ${glassBg}, transparent)` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(20px, 5vw, 40px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSec, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Globe size={18} /> Para Empreiteiras e Agências
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>Portal B2B & Gestão de Talentos</h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: textSec, maxWidth: '500px', lineHeight: 1.6 }}>
              Acesse nosso dashboard avançado para gerenciar candidatos, acompanhar SLAs de COE, sincronizar com Garoon e exportar planilhas em Excel.
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
