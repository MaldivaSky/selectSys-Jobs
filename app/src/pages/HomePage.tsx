import { useState, useEffect } from 'react';
import { 
  ArrowRight, ShieldCheck, MapPin, 
  Globe, ChevronRight, UserCircle2, X, Info, Sparkles, FileSpreadsheet, Database,
  LayoutGrid, BarChart3, Cpu, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/contexto';

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

  const bg = isDark ? '#05070a' : '#f8f9fa';
  const textPri = isDark ? '#ffffff' : '#0f172a';
  const textSec = isDark ? '#94a3b8' : '#475569';
  
  const gradientPrimary = 'linear-gradient(135deg, #c4452b 0%, #ff6b4a 100%)';
  const gradientText = 'linear-gradient(to right, #ffffff, #cbd5e1)';
  const glassBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className="ssj-shell" style={{ backgroundColor: bg, color: textPri }}>
      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-title {
          background: ${isDark ? gradientText : 'linear-gradient(to right, #0f172a, #334155)'};
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
          transform: translateY(-6px);
          background: ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)'};
          border-color: rgba(196, 69, 43, 0.4);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .premium-btn {
          background: ${gradientPrimary};
          color: white;
          box-shadow: 0 10px 30px rgba(196, 69, 43, 0.35);
          transition: all 0.3s ease;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(196, 69, 43, 0.5);
        }
      `}</style>

      {/* DYNAMIC BACKGROUND ORBS */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'clip', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: `translate(-50%, ${scrollY * 0.2}px)`,
          width: '80vw', height: '80vw', maxWidth: '800px', maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(196, 69, 43, 0.18) 0%, transparent 60%)',
          animation: 'pulseGlow 8s infinite alternate', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', transform: `translateY(${-scrollY * 0.1}px)`,
          width: '60vw', height: '60vw', maxWidth: '600px', maxHeight: '600px',
          background: 'radial-gradient(circle, rgba(41, 75, 134, 0.15) 0%, transparent 60%)',
          animation: 'pulseGlow 10s infinite alternate-reverse', filter: 'blur(60px)'
        }} />
      </div>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(56px, 12vw, 140px)', paddingBottom: 'clamp(40px, 8vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingLeft: 'var(--ssj-gutter)', paddingRight: 'var(--ssj-gutter)' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '100px', background: glassBg, border: `1px solid ${glassBorder}`, marginBottom: '32px', backdropFilter: 'blur(10px)' }}>
          <ShieldCheck size={18} color="#c4452b" />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: textPri }}>Plataforma SaaS Dekassegui de Elite (Brasil ➔ Japão)</span>
        </div>

        <h1 className="hero-title ssj-display" style={{ maxWidth: '1050px', margin: '0 auto clamp(16px, 4vw, 32px)' }}>
          A plataforma inteligente para <br /> a gestão completa do <span style={{ background: gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fluxo Dekassegui.</span>
        </h1>

        <p className="ssj-lead" style={{ color: textSec, maxWidth: '750px', margin: '0 auto clamp(28px, 6vw, 48px)' }}>
          Elimine planilhas manuais e trocas de e-mails com o Japão. Reúna Kanban Drag-and-Drop, Conexão com Cybozu Garoon, IA DeepSeek, 12 KPIs Executivos e Exportação .XLS 100% Fiel em uma única solução auditável.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/vagas" className="premium-btn ssj-btn ssj-btn--lg" style={{ borderRadius: '100px', textDecoration: 'none' }}>
            Ver Vagas por Província <ArrowRight size={20} />
          </Link>
          <Link to="/candidato" className="glass-card ssj-btn ssj-btn--lg" style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', borderRadius: '100px', textDecoration: 'none' }}>
            <Sparkles size={20} /> Simular Ficha Digital
          </Link>
          <Link to="/login" className="glass-card ssj-btn ssj-btn--lg" style={{ color: textPri, borderRadius: '100px', textDecoration: 'none' }}>
            <UserCircle2 size={20} /> Entrar no Painel RH
          </Link>
        </div>

        {/* HERO STATS */}
        <div style={{ display: 'flex', gap: '48px', marginTop: '70px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="ssj-metric" style={{ color: textPri }}>100%</span>
            <span className="ssj-label" style={{ color: textSec }}>Fidelidade Excel .XLS</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="ssj-metric" style={{ color: textPri }}>9 Etapas</span>
            <span className="ssj-label" style={{ color: textSec }}>Kanban de Imigração</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="ssj-metric" style={{ color: textPri }}>12 KPIs</span>
            <span className="ssj-label" style={{ color: textSec }}>Dashboard Executivo</span>
          </div>
          <div style={{ width: '1px', background: glassBorder }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="ssj-metric" style={{ color: textPri }}>Garoon Sync</span>
            <span className="ssj-label" style={{ color: textSec }}>Conexão Matriz Japão</span>
          </div>
        </div>
      </section>

      {/* MARQUEE PROVÍNCIAS */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '24px 0', borderTop: `1px solid ${glassBorder}`, borderBottom: `1px solid ${glassBorder}`, background: glassBg, zIndex: 1 }}>
        <div style={{ display: 'flex', width: '200%', animation: 'scrollMarquee 30s linear infinite' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', width: '50%', justifyContent: 'space-around', alignItems: 'center' }}>
              {['愛知県 AICHI', '静岡県 SHIZUOKA', '三重県 MIE', '群馬県 GUNMA', '神奈川県 KANAGAWA'].map(prov => (
                <div key={prov} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: textSec, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.7 }}>
                  <MapPin size={24} color="#c4452b" /> {prov}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* GRID COMPLETO DE RECURSOS E FUNCIONALIDADES DA PLATAFORMA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '90px var(--ssj-gutter)', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '100px', background: glassBg, border: `1px solid ${glassBorder}`, marginBottom: '16px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#c4452b' }}>
            Recursos de Engenharia de Classe Mundial
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Tudo o que sua Agência precisa em um só lugar</h2>
          <p style={{ color: textSec, fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto' }}>
            Clique em qualquer funcionalidade abaixo para ver a solução técnica e o impacto operacional para sua empresa.
          </p>
        </div>

        <div className="ssj-grid ssj-grid--wide">
          
          {/* Card 1: Excel .XLS */}
          <div
            onClick={() => setModalCard({
              titulo: 'Exportador Excel .XLS 100% Pixel-Perfect',
              categoria: 'Automação & Documentos',
              dorDoCliente: 'Planilhas gigantes de 200+ células exigidas pelo Japão geram retrabalho e horas de digitação manual do RH.',
              nossaSolucao: 'O candidato preenche no celular e a plataforma gera em 1 clique a planilha .xls 100% idêntica ao modelo oficial da sua empreiteira.',
              resultadoPratico: 'Fim da digitação manual, zero erro de formatação e aceitação imediata pela diretoria no Japão.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FileSpreadsheet size={32} color="#10b981" />
              <span className="ssj-pill ssj-pill--ok">Padrão Oficial .XLS</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Planilha .XLS sem Digitação</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Exportação em 1 clique do layout original preservando bordas, fontes e células mescladas.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

          {/* Card 2: Cybozu Garoon */}
          <div
            onClick={() => setModalCard({
              titulo: 'Integração Cybozu Garoon (Cloud REST & On-Premise SOAP)',
              categoria: 'Conexão Internacional',
              dorDoCliente: 'Demora e risco de extravio ao enviar fichas por e-mail para a matriz japonesa cadastrar manualmente.',
              nossaSolucao: 'Conector nativo que sincroniza diretamente o candidato aprovado com o Garoon da matriz via API REST ou SOAP Envelope XML.',
              resultadoPratico: 'Antecipa em até 14 dias o processo de emissão do visto COE na imigração do Japão.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Database size={32} color="#c084fc" />
              <span className="ssj-pill ssj-pill--info">Cybozu Garoon Sync</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Sincronização com o Japão</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Transmissão automatizada de registros e anexos diretamente para o ERP da matriz japonesa.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

          {/* Card 3: Kanban Drag-and-Drop */}
          <div
            onClick={() => setModalCard({
              titulo: 'Kanban Interativo de Imigração com Controle de SLA',
              categoria: 'Gestão de Pipeline',
              dorDoCliente: 'Perda de controle sobre qual etapa do visto (COE, entrevista, certidões) o candidato se encontra.',
              nossaSolucao: 'Kanban drag-and-drop em 9 estágios com validação de regras de transição e contador visual de dias parado.',
              resultadoPratico: 'Visibilidade total do funil e alerta imediato de candidaturas estagnadas há mais de 15 dias.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <LayoutGrid size={32} color="#3b82f6" />
              <span className="ssj-pill ssj-pill--info">9 Etapas Dekassegui</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Kanban Drag-and-Drop</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Movimentação simples de cards com trava de segurança para transições de status inválidas.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

          {/* Card 4: Dashboard 12 KPIs */}
          <div
            onClick={() => setModalCard({
              titulo: 'Dashboard Executivo com 12 Indicadores Dekassegui',
              categoria: 'Analytics & Métricas',
              dorDoCliente: 'Falta de relatórios para a diretoria sobre tempo de COE, custo de IA, curva demográfica e retenção por agência.',
              nossaSolucao: 'Painel com 12 indicadores estratégicos atualizados em tempo real com gráficos e comparativos mensais.',
              resultadoPratico: 'Tomada de decisão baseada em dados reais e previsibilidade de embarques no Japão.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <BarChart3 size={32} color="#f59e0b" />
              <span className="ssj-pill ssj-pill--warn">12 KPIs Executivos</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Dashboard de Indicadores</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Visão completa de retenção, tempo de visto, curva demográfica Nikkei e custos de IA.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

          {/* Card 5: Match Score Engine */}
          <div
            onClick={() => setModalCard({
              titulo: 'Algoritmo de Match Score de Compatibilidade (0–100%)',
              categoria: 'Recrutamento de Precisão',
              dorDoCliente: 'Encaminhar trabalhadores sem perfil ideal para a fábrica gera trocas de uniforme e desistências precoces.',
              nossaSolucao: 'Motor de cálculo ponderado que analisa experiência no setor, nível de japonês, biometria EPI e visto.',
              resultadoPratico: 'Encaixe perfeito entre candidato e vaga com redução drástica da rotatividade nas fábricas.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Award size={32} color="#10b981" />
              <span className="ssj-pill ssj-pill--ok">Score Ponderado</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Match Score (0-100%)</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Pontuação de aderência técnica e física do candidato às exigências de cada posto de trabalho.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

          {/* Card 6: AI DeepSeek Edge Proxy */}
          <div
            onClick={() => setModalCard({
              titulo: 'AI Service Proxy em Edge Function (DeepSeek V3/R1)',
              categoria: 'Inteligência Artificial',
              dorDoCliente: 'Preenchimento manual demorado de currículos em PDF e exposição de dados sensíveis na nuvem.',
              nossaSolucao: 'Edge function segura no Supabase que sanitiza dados e extrai 70% dos campos de foto ou currículo em segundos.',
              resultadoPratico: 'Economia de 95% nos custos de IA (vs Claude/GPT-4) com proteção total de chaves e dados pessoais.'
            })}
            className="glass-card"
            style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Cpu size={32} color="#ec4899" />
              <span className="ssj-pill ssj-pill--seal">DeepSeek Edge AI</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Extração Inteligente de IA</h3>
            <p style={{ fontSize: '15px', color: textSec, lineHeight: 1.6, margin: 0 }}>
              Leitura automática de fotos e currículos com preenchimento instantâneo do formulário.
            </p>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '12px' }}>
              Ver detalhes técnicos <Info size={16} />
            </span>
          </div>

        </div>
      </section>

      {/* MODAL INTERATIVO DE DETALHES TÉCNICOS */}
      {modalCard && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 7, 10, 0.88)', backdropFilter: 'blur(10px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            width: '100%', maxWidth: '680px', backgroundColor: isDark ? '#111620' : '#ffffff', border: `1px solid ${glassBorder}`,
            borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)', color: textPri, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setModalCard(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: isDark ? '#1e293b' : '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: textSec
              }}
            >
              <X size={20} />
            </button>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#c4452b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {modalCard.categoria}
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '6px 0 0 0', lineHeight: 1.3 }}>
                {modalCard.titulo}
              </h3>
            </div>

            {/* A Dor Atual */}
            <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fff5f5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px' }}>
                🔴 A Dor Operacional (Sem o sistema)
              </div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: textPri }}>
                {modalCard.dorDoCliente}
              </p>
            </div>

            {/* A Nossa Solução */}
            <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#ebf8ff', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px' }}>
                🚀 A Engenharia SelectSys Jobs
              </div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: textPri }}>
                {modalCard.nossaSolucao}
              </p>
            </div>

            {/* Resultado Prático */}
            <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#f0fff4', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>
                💡 O Resultado no seu Balanço Financeiro
              </div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, lineHeight: 1.6, color: isDark ? '#34d399' : '#276749' }}>
                {modalCard.resultadoPratico}
              </p>
            </div>

            <button
              onClick={() => setModalCard(null)}
              className="ssj-btn ssj-btn--pri"
              style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '8px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ENTERPRISE CALLOUT CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px, 9vw, 90px) var(--ssj-gutter)', background: `linear-gradient(to right, ${glassBg}, transparent)` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'clamp(20px, 5vw, 40px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4452b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontSize: '13px' }}>
              <Globe size={20} /> Para Empreiteiras e Agências no Brasil e Japão
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px' }}>Pronto para modernizar seu RH?</h2>
            <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: textSec, maxWidth: '580px', lineHeight: 1.6 }}>
              Agende uma demonstração executiva sem compromisso e veja a exportação do seu arquivo .xls em tempo real.
            </p>
          </div>
          <Link to="/login" className="ssj-btn ssj-btn--pri ssj-btn--lg" style={{ borderRadius: '100px', textDecoration: 'none' }}>
            Agendar Demo B2B <ChevronRight size={22} />
          </Link>
        </div>
      </section>

    </div>
  );
}
