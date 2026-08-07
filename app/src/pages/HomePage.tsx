import { useState } from 'react';
import { 
  Users, 
  ArrowRight, DollarSign,
  UploadCloud, Lock, Building2, Globe, HelpCircle,
  X, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';
import { BrandMark } from '../brand/BrandMark';
import type { Language } from '../translations';

export function HomePage({ lang: _lang }: { lang: Language }) {


  // Modals state
  const [activeModal, setActiveModal] = useState<'help' | 'excel' | 'ai' | 'lgpd' | null>(null);

  // Live Stepper State inside Landing Page
  const [stepperStep, setStepperStep] = useState<number>(1);
  const [candidateName, setCandidateName] = useState<string>('ROBERTO KENJI SATO');
  const [birthDate, setBirthDate] = useState<string>('1992-05-14');
  const [nikkeiGen, setNikkeiGen] = useState<string>('Sansei');
  const [shoeSize, setShoeSize] = useState<string>('26.5 cm');
  const [waistSize, setWaistSize] = useState<string>('78 cm');
  const [isAiExtracted, setIsAiExtracted] = useState<boolean>(false);

  // ROI Sliders
  const [candidatesPerMonth, setCandidatesPerMonth] = useState<number>(150);
  const [agenciesCount, setAgenciesCount] = useState<number>(8);

  const hoursSavedPerMonth = Math.round(candidatesPerMonth * 0.35 + agenciesCount * 4);
  const yearlyDeepSeekSavedBrl = Math.round(candidatesPerMonth * 12 * 0.85);

  const handleSimulateAiExtraction = () => {
    setIsAiExtracted(true);
    setTimeout(() => {
      setCandidateName('MARINA TANAKA OLIVEIRA');
      setBirthDate('1996-11-14');
      setNikkeiGen('Sansei');
      setShoeSize('25.5 cm');
      setWaistSize('68 cm');
      setIsAiExtracted(false);
    }, 600);
  };

  const { escuro: isDark } = useTheme();

  // 🎨 PALETA EXCLUSIVA PREMIUM CLAUDE/FUJIARTE (INDIGO #294b86 & SHU #c4452b)
  const pageBg = isDark ? '#0d1016' : '#f4f5f2';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const cardBorder = isDark ? '#29313c' : '#e0e2dc';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#7a827f';
  const subCardBg = isDark ? '#1c222c' : '#f7f8f5';
  const inputBg = isDark ? '#161b24' : '#ffffff';
  
  const accentIndigo = isDark ? '#7ba4de' : '#294b86';
  // Preenchimento e rotulo andam em par: no escuro o azul clareia e o texto escurece.
  const fillPri = isDark ? '#7ba4de' : '#294b86';
  const onFillPri = isDark ? '#0b1220' : '#ffffff';
  const accentIndigoBg = isDark ? '#182338' : '#e4eaf4';
  const accentShu = isDark ? '#e8785d' : '#c4452b';
  const accentShuBg = isDark ? '#2c1a15' : '#f7e6e2';

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: pageBg,
      color: textPrimary,
      fontFamily: 'var(--ssj-font-sans)',
      padding: 'clamp(28px,5vw,56px) 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '64px'
    }}>

      {/* 🔴 1. HERO SECTION — PALETA INDIGO & SHU FIEL AO PROTÓTIPO */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '28px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '30px',
          backgroundColor: accentIndigoBg,
          border: `1px solid ${accentIndigo}33`,
          color: accentIndigo,
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          <BrandMark size={18} />
          <span>SelectSys Jobs · SaaS de Contratação & Vistos (Brasil ➔ Japão)</span>
        </div>

        <h1 style={{
          fontSize: '3.4rem',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '960px',
          color: textPrimary
        }}>
          Digitalize e automatize a contratação de Dekasseguis <span style={{ color: accentIndigo }}>em um único SaaS.</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          lineHeight: 1.6,
          maxWidth: '840px',
          color: textSecondary,
          fontWeight: 500
        }}>
          O <b style={{ color: textPrimary }}>SelectSys Jobs</b> conecta Empreiteiras no Japão (como a FUJIARTE), Agências Indicadoras no Brasil e Trabalhadores em uma plataforma integrada com IA DeepSeek V3, compliance LGPD e exportador oficial de planilhas de visto.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '8px' }}>
          <Link to="/prototipo" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            backgroundColor: fillPri,
            color: onFillPri,
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(41, 75, 134, 0.35)'
          }}>
            <span>Ver Protótipo do SaaS Interativo</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>

          <Link to="/fujiarte" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            backgroundColor: cardBg,
            color: textPrimary,
            border: `1.5px solid ${cardBorder}`,
            textDecoration: 'none'
          }}>
            <span>Ver Case Piloto: FUJIARTE</span>
          </Link>

          <button onClick={() => setActiveModal('help')} className="ssj-btn ssj-btn--ghost" style={{ color: textSecondary }}>
            <HelpCircle style={{ width: '17px', height: '17px', color: accentIndigo }} />
            <span>Glossário do nicho</span>
          </button>
        </div>
      </section>

      {/* 🔴 2. SEÇÃO MULTITENANT COM PALETA ELEGANTE */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: textPrimary }}>
            Um Ecossistema SaaS para 3 Pontas da Operação
          </h2>
          <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '700px', margin: '0 auto' }}>
            Clique nos cards abaixo para visualizar a especificação técnica de cada módulo.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Tenant Empreiteira */}
          <div 
            onClick={() => setActiveModal('excel')}
            style={{
              padding: '32px',
              borderRadius: '20px',
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: accentIndigoBg, color: accentIndigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 style={{ width: '22px', height: '22px' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary }}>1. Para Empreiteiras (Japão)</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: textSecondary }}>
              Painel de gestão de candidatos com regras configuráveis, exportação de planilhas oficiais .XLS em 1 clique (ex: modelo FUJIARTE) e acompanhamento do status do visto COE.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: accentIndigo }}>
              <span>Abrir Detalhes da Exportação .XLS</span>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </div>
          </div>

          {/* Tenant Agências */}
          <div 
            onClick={() => setActiveModal('ai')}
            style={{
              padding: '32px',
              borderRadius: '20px',
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: accentShuBg, color: accentShu, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe style={{ width: '22px', height: '22px' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary }}>2. Para Agências (Brasil)</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: textSecondary }}>
              Link de captação exclusivo por agência (`tenant_id`). Rastreamento automático dos candidatos indicados e transparência total no pagamento de comissões por embarque.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: accentShu }}>
              <span>Ver Especificação da IA DeepSeek</span>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </div>
          </div>

          {/* Portal Candidato */}
          <div 
            onClick={() => setActiveModal('lgpd')}
            style={{
              padding: '32px',
              borderRadius: '20px',
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: isDark ? '#12291e' : '#e2f0e9', color: isDark ? '#4fc287' : '#1f7a4d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '22px', height: '22px' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary }}>3. Para Trabalhadores (Mobile)</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: textSecondary }}>
              Wizard em micro-etapas gamificadas para preenchimento fácil pelo celular, com leitura de documentos por IA DeepSeek, biometria de equipamentos de proteção e auto-save.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: isDark ? '#4fc287' : '#1f7a4d' }}>
              <span>Ver Regras LGPD & Criptografia</span>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 3. INTERACTIVE LIVE STEPPER DEMO */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '36px',
        borderRadius: '24px',
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: accentShu, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Demonstração ao Vivo do Portal do Candidato
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: textPrimary }}>
              Formulário Mobile do SelectSys Jobs
            </h2>
          </div>

          <button
            onClick={handleSimulateAiExtraction}
            disabled={isAiExtracted}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: accentIndigoBg,
              border: `1px solid ${accentIndigo}44`,
              color: accentIndigo,
              cursor: 'pointer'
            }}
          >
            <UploadCloud style={{ width: '16px', height: '16px' }} />
            <span>{isAiExtracted ? 'Extraindo por IA DeepSeek...' : '⚡ Testar Preenchimento por IA'}</span>
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {[
            { n: 1, label: '1. Identificação' },
            { n: 2, label: '2. Descendência Nikkei' },
            { n: 3, label: '3. equipamentos de proteção & Calçado' },
            { n: 4, label: '4. Saúde & LGPD' }
          ].map(s => (
            <button
              key={s.n}
              onClick={() => setStepperStep(s.n)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: stepperStep === s.n ? accentIndigo : subCardBg,
                color: stepperStep === s.n ? '#ffffff' : textSecondary,
                transition: 'all 0.2s ease'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Stepper Step Content Box */}
        <div style={{ padding: '28px', borderRadius: '16px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}` }}>
          {stepperStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>
                  Nome Completo (Conforme RG/Passaporte)
                </label>
                <input 
                  type="text" 
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>
                  Data de Nascimento · 生年月日
                </label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
          )}

          {stepperStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>
                Grau de Descendência Japonesa · 日系人
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['Issei (1ª Gen)', 'Nissei (2ª Gen)', 'Sansei (3ª Gen)', 'Yonsei (4ª Gen)', 'Cônjuge Nikkei'].map(g => (
                  <button
                    key={g}
                    onClick={() => setNikkeiGen(g)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: `1px solid ${nikkeiGen.includes(g.split(' ')[0]) ? accentIndigo : cardBorder}`,
                      backgroundColor: nikkeiGen.includes(g.split(' ')[0]) ? accentIndigo : inputBg,
                      color: nikkeiGen.includes(g.split(' ')[0]) ? '#ffffff' : textPrimary,
                      cursor: 'pointer'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stepperStep === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>
                  Tamanho do Calçado de Segurança (cm)
                </label>
                <select 
                  value={shoeSize} 
                  onChange={e => setShoeSize(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                >
                  {['24.0 cm', '24.5 cm', '25.0 cm', '25.5 cm', '26.0 cm', '26.5 cm', '27.0 cm', '27.5 cm', '28.0 cm'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>
                  Cintura para Uniforme de Fábrica
                </label>
                <input 
                  type="text" 
                  value={waistSize}
                  onChange={e => setWaistSize(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: `1px solid ${cardBorder}`,
                    backgroundColor: inputBg,
                    color: textPrimary,
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
          )}

          {stepperStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: isDark ? '#161b24' : '#ffffff', border: `1px solid ${accentIndigo}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock style={{ width: '20px', height: '20px', color: accentIndigo }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>Dados de Saúde Protegidos via Criptografia pgcrypto</div>
                  <div style={{ fontSize: '11px', color: textSecondary }}>Artigo 11 da LGPD · Cada visualização exige autorização com registro em Audit Log.</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${cardBorder}` }}>
            <button 
              disabled={stepperStep === 1}
              onClick={() => setStepperStep(prev => prev - 1)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: `1px solid ${cardBorder}`,
                backgroundColor: inputBg,
                color: textPrimary,
                cursor: stepperStep === 1 ? 'not-allowed' : 'pointer',
                opacity: stepperStep === 1 ? 0.5 : 1
              }}
            >
              Anterior
            </button>

            <button 
              onClick={() => setStepperStep(prev => Math.min(4, prev + 1))}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                backgroundColor: accentIndigo,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {stepperStep === 4 ? 'Concluir Cadastro' : 'Próximo Passo ➔'}
            </button>
          </div>
        </div>
      </section>

      {/* 🔴 4. CALCULADORA DE ROI SIMULATOR */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        borderRadius: '24px',
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '6px', backgroundColor: accentIndigoBg, color: accentIndigo, fontSize: '12px', fontWeight: 700, margin: '0 auto' }}>
            <DollarSign style={{ width: '16px', height: '16px' }} />
            CALCULADORA DE RETORNO DO SAAS (ROI)
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: textPrimary }}>Simulador de Economia Operacional</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: textPrimary, marginBottom: '8px' }}>
                <span>Candidatos Processados por Mês:</span>
                <span style={{ color: accentIndigo, fontWeight: 700 }}>{candidatesPerMonth} candidatos</span>
              </div>
              <input
                type="range" min="20" max="1000" step="10" value={candidatesPerMonth}
                onChange={e => setCandidatesPerMonth(Number(e.target.value))}
                style={{ width: '100%', accentColor: accentIndigo }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: textPrimary, marginBottom: '8px' }}>
                <span>Agências Parceiras no Brasil:</span>
                <span style={{ color: accentIndigo, fontWeight: 700 }}>{agenciesCount} agências</span>
              </div>
              <input
                type="range" min="1" max="50" value={agenciesCount}
                onChange={e => setAgenciesCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: accentIndigo }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: textSecondary, fontWeight: 600 }}>Horas Economizadas/Mês</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: textPrimary }}>{hoursSavedPerMonth} hrs</div>
              <div style={{ fontSize: '11px', color: textSecondary }}>Zero digitação manual</div>
            </div>

            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: textSecondary, fontWeight: 600 }}>Economia Custo IA Anual</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: accentIndigo }}>R$ {yearlyDeepSeekSavedBrl.toLocaleString('pt-BR')}</div>
              <div style={{ fontSize: '11px', color: textSecondary }}>DeepSeek vs Claude</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 5. MODAL INTERATIVO DE GLOSSÁRIO E AJUDA DO NICHO DEKASSEGUI */}
      {activeModal === 'help' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 27, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '700px',
            backgroundColor: cardBg,
            borderRadius: '24px',
            padding: '36px',
            border: `1px solid ${cardBorder}`,
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X style={{ width: '20px', height: '20px', color: textSecondary }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HelpCircle style={{ width: '28px', height: '28px', color: accentIndigo }} />
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary }}>
                  Glossário & Termos Técnicos do Nicho Dekassegui
                </h3>
                <div style={{ fontSize: '12px', color: textSecondary }}>Guia operacional para empreiteiras e gestores</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { t: 'Koseki Touhon (戸籍)', d: 'Registro familiar oficial japonês necessário para comprovação inquestionável de descendência Nikkei junto à Imigração.' },
                { t: 'COE (Certificate of Eligibility)', d: 'Certificado de Elegibilidade emitido pela Imigração no Japão antes da solicitação do visto no Brasil.' },
                { t: 'Zairyū Card (在留カード)', d: 'Carteira de residente estrangeiro entregue no aeroporto na chegada ao Japão.' },
                { t: 'Nissei / Sansei / Yonsei', d: '2ª, 3ª e 4ª gerações de descendentes de japoneses elegíveis para visto de trabalho de longa permanência.' },
                { t: 'Biometria de equipamentos de proteção (Calçado cm)', d: 'Registro do tamanho exato em centímetros (ex: 26.5 cm) para reserva prévia do calçado de segurança na fábrica.' }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: accentIndigo }}>{item.t}</div>
                  <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px', lineHeight: 1.5 }}>{item.d}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                onClick={() => setActiveModal(null)}
                style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: accentIndigo, color: '#ffffff', border: 'none', cursor: 'pointer' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 6. MODAIS DE RECURSOS (EXCEL / IA / LGPD) */}
      {activeModal === 'excel' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 27, 42, 0.85)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{ width: '100%', maxWidth: '600px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: textSecondary }} />
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary }}>Exportador Planilha .XLS Fiel FUJIARTE</h3>
            <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.6 }}>
              Gera em 0.3 segundos a planilha oficial `白紙 FUJIARTE Ficha Cadastral (Jun2024)` preenchendo ~130 campos célula por célula, mantendo alinhamento de texto em japonês e fotos anexadas.
            </p>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: isDark ? '#12291e' : '#e2f0e9', border: `1px solid ${isDark ? '#175335' : '#cfe6da'}`, color: isDark ? '#4fc287' : '#1f7a4d', fontSize: '13px', fontWeight: 700 }}>
              ✓ Testado e homologado para exportação instantânea sem alterar o formato da matriz.
            </div>
            <button onClick={() => setActiveModal(null)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: accentIndigo, color: '#ffffff', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {activeModal === 'ai' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 27, 42, 0.85)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{ width: '100%', maxWidth: '600px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: textSecondary }} />
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary }}>Parsing por IA DeepSeek V3 (0.9s)</h3>
            <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.6 }}>
              Extração via visão computacional de fotos e PDFs de documentos pessoais (RG, Passaporte, CNH) com custo de $0.14 por 1M tokens (economia de 95% em relação ao Claude/GPT-4).
            </p>
            <button onClick={() => setActiveModal(null)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: accentIndigo, color: '#ffffff', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {activeModal === 'lgpd' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(19, 27, 42, 0.85)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{ width: '100%', maxWidth: '600px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: textSecondary }} />
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary }}>Compliance LGPD (Artigo 11 & 20)</h3>
            <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.6 }}>
              Criptografia `pgcrypto` em banco de dados PostgreSQL para informações sensíveis de saúde, gerando parecer explicável de triagem e registro auditado com nome, data e IP.
            </p>
            <button onClick={() => setActiveModal(null)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: accentIndigo, color: '#ffffff', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* CALL TO ACTION FINAL */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: cardBg,
        color: textPrimary,
        borderRadius: '24px',
        padding: '56px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: `1px solid ${cardBorder}`
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: accentIndigo, backgroundColor: accentIndigoBg, padding: '6px 16px', borderRadius: '20px', border: `1px solid ${accentIndigo}44` }}>
          SelectSys Jobs · SaaS Dekassegui
        </span>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>
          Leve o SelectSys Jobs para a sua Empreiteira
        </h2>

        <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '650px', lineHeight: 1.6 }}>
          Conheça a proposta comercial para licenciamento multitenant da plataforma.
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
            backgroundColor: accentIndigo,
            color: '#ffffff',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(41, 75, 134, 0.4)'
          }}>
            <span>Ver Proposta Comercial e Plano de Ação</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      </section>
    </div>
  );
}
