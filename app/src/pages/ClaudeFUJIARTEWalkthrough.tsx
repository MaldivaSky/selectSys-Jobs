import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../theme/theme';
import { Hanko } from '../brand/Hanko';
import { AppDoCandidato } from './PrototipoApp';

export function ClaudeFUJIARTEWalkthrough() {
  const [activeStep, setActiveStep] = useState<number>(0);
  // Um prototipo, duas vistas: o painel de quem contrata e o app de quem viaja.
  const [vista, setVista] = useState<'ats' | 'app'>('ats');

  // Form states
  const [candidateName, setCandidateName] = useState<string>('MARINA TANAKA OLIVEIRA');
  const [birthDate, setBirthDate] = useState<string>('1996-11-14');
  const [nikkeiGen, setNikkeiGen] = useState<string>('Sansei');
  
  // Tattoo regions state (Step 2)
  const [tattooRegions, setTattooRegions] = useState<Record<string, boolean>>({
    'Braços': true,
    'Costas': true
  });

  // Health disclosure state (Step 6)
  const [healthDisclosed, setHealthDisclosed] = useState<boolean>(false);

  // Candidate Filter state (Step 5)
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Excel Exported state (Step 7)
  const [isExcelExported, setIsExcelExported] = useState<boolean>(false);

  const toggleTattooRegion = (reg: string) => {
    setTattooRegions(prev => ({ ...prev, [reg]: !prev[reg] }));
  };

  // Calculate age dynamically
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return 29;
    const parts = dateStr.split('-');
    if (parts.length < 3) return 29;
    const birth = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const currentAge = calculateAge(birthDate);

  const steps = [
    { n: '01', title: 'Link da Agência', ja: '代理店リンク', tag: 'Captação Brasil', desc: 'O candidato clica no link exclusivo da agência parceira no Brasil (`tenant_id`). O sistema identifica a origem para comissionamento.' },
    { n: '02', title: 'Identificação', ja: '本人確認', tag: 'Formulário Mobile', desc: 'Preenchimento rápido de RG, nascimento e ascendência Nikkei. Opcionalmente extraído por foto via IA DeepSeek V3 em 0.9s.' },
    { n: '03', title: 'Tatuagem', ja: '入れ墨', tag: 'Triagem Visual', desc: 'Mapeamento visual anatômico de tatuagens para triagem preliminar de elegibilidade em clientes fabris no Japão (Toyota, Subaru).' },
    { n: '04', title: 'Saúde & LGPD', ja: '健康・同意', tag: 'Compliance LGPD', desc: 'Consentimento explícito e armazenamento de dados de saúde criptografados colunarmente (`pgcrypto` PostgreSQL, LGPD Art. 11).' },
    { n: '05', title: 'Triagem Automática', ja: '自動選考', tag: 'Regras de Negócio', desc: 'O motor de regras processa a elegibilidade do candidato instantaneamente, emitindo alerta para a equipe de recrutamento.' },
    { n: '06', title: 'Painel de Gestão', ja: '応募者一覧', tag: 'Painel de gestão', desc: 'Visão unificada para o RH da FUJIARTE acompanhar o funil de recrutamento, agências indicadoras e visto COE.' },
    { n: '07', title: 'Ficha do Candidato', ja: '応募者カルテ', tag: 'Prontuário Auditado', desc: 'Visualização da ficha completa com revelação auditada de dados sensíveis de saúde mediante registro em Audit Log.' },
    { n: '08', title: 'Exportação Excel', ja: 'エクセル出力', tag: 'Modelo FUJIARTE .XLS', desc: 'Geração célula a célula da planilha oficial `白紙 FUJIARTE Ficha Cadastral (Jun2024).xls` mantendo 100% de precisão visual.' },
  ];

  const candidateList = [
    { n: "Marina Tanaka Oliveira", i: 29, uf: "SP", c: "Guarulhos", jp: "Intermediário", st: "aprovado", ag: "Nikkei Tour", d: "06/08" },
    { n: "Ricardo Sato Ferreira", i: 34, uf: "PR", c: "Londrina", jp: "Básico", st: "entrevista", ag: "Nikkei Tour", d: "06/08" },
    { n: "Camila Yoshida Souza", i: 41, uf: "SP", c: "Suzano", jp: "Avançado", st: "revisao", ag: "Direta", d: "05/08" },
    { n: "Anderson Kimura Lima", i: 57, uf: "MG", c: "Uberlândia", jp: "Nenhum", st: "reprovado", ag: "Brasil Nihon", d: "05/08" },
    { n: "Patrícia Nakamura Reis", i: 26, uf: "SC", c: "Joinville", jp: "Básico", st: "aprovado", ag: "Brasil Nihon", d: "04/08" },
    { n: "Fernando Ueda Barbosa", i: 38, uf: "SP", c: "Mogi das Cruzes", jp: "Intermediário", st: "coe", ag: "Nikkei Tour", d: "03/08" }
  ];

  const filteredCandidates = candidateList.filter(c => statusFilter === 'todos' || c.st === statusFilter);

  const { escuro: isDark } = useTheme();

  const cardBg = isDark ? '#161b24' : '#ffffff';
  const cardBorder = isDark ? '#29313c' : '#e0e2dc';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#7a827f';
  const subCardBg = isDark ? '#1c222c' : '#f7f8f5';

  return (
    <div style={{
      width: '100%',
      minHeight: 'auto',
      backgroundColor: isDark ? '#0d1016' : '#f4f5f2',
      color: textPrimary,
      fontFamily: 'var(--ssj-font-sans)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      <div className="ssj-container">
        <div className="ssj-pagehead">
          <div>
            <span className="ssj-pill ssj-pill--seal">Protótipo interativo · 試作版</span>
            <h1 style={{ marginTop: 10 }}>Percurso da demonstração</h1>
            <p className="ssj-lead" style={{ maxWidth: 620 }}>
              As 11 etapas do funil dekassegui, da captação no Brasil à admissão no Japão.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, padding: 4, border: '1px solid var(--ssj-rule)', borderRadius: 'var(--ssj-r-md)', background: 'var(--ssj-surface-2)' }}>
              <button onClick={() => setVista('ats')} className="ssj-btn ssj-btn--sm" style={{ border: 0, background: vista === 'ats' ? 'var(--ssj-surface)' : 'transparent', boxShadow: vista === 'ats' ? 'var(--ssj-shadow-sm)' : 'none' }}>
                Painel da empreiteira
              </button>
              <button onClick={() => setVista('app')} className="ssj-btn ssj-btn--sm" style={{ border: 0, background: vista === 'app' ? 'var(--ssj-surface)' : 'transparent', boxShadow: vista === 'app' ? 'var(--ssj-shadow-sm)' : 'none' }}>
                App do candidato
              </button>
            </div>
            <div style={{ fontWeight: 600 }}>FUJIARTE Co., Ltd.</div>
            <div className="ssj-mono ssj-muted" style={{ fontSize: 13 }}>Cliente piloto · 2026</div>
          </div>
        </div>
      </div>


      {vista === 'app' && <AppDoCandidato />}

      {vista === 'ats' && (
      <div style={{ flex: 1, display: 'flex', width: '100%', minHeight: 'calc(100vh - 70px)' }}>
        
        {/* Trilho de etapas: linha do tempo carimbada (design do prototipo) */}
        <nav
          style={{
            width: '292px',
            backgroundColor: cardBg,
            borderRight: `1px solid ${cardBorder}`,
            padding: '24px 18px',
            flexShrink: 0,
          }}
        >
          <div style={{ paddingBottom: '14px', marginBottom: '16px', borderBottom: `1px solid ${cardBorder}` }}>
            <div className="ssj-label">Percurso da demonstração</div>
            <div className="ssj-mono ssj-muted" style={{ fontSize: 12.5, marginTop: 3 }}>デモの流れ</div>

            <div className="ssj-track" style={{ marginTop: 14 }}>
              <i style={{ maxWidth: `${((activeStep + 1) / steps.length) * 100}%` }} />
            </div>
            <div className="ssj-mono ssj-muted" style={{ fontSize: 12.5, marginTop: 8 }}>
              {activeStep + 1} de {steps.length} · {steps.length - activeStep - 1} restantes
            </div>
          </div>

          <div className="ssj-timeline">
            {steps.map((step, idx) => {
              const estado = idx < activeStep ? 'aprovado' : idx === activeStep ? 'agora' : 'futuro';
              return (
                <button
                  key={step.n}
                  onClick={() => setActiveStep(idx)}
                  className="ssj-step"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: 'none',
                    border: 0,
                    padding: '7px 0',
                  }}
                >
                  <Hanko
                    estado={estado}
                    texto={estado === 'aprovado' ? '済' : step.n}
                    size={30}
                    delay={idx * 0.05}
                    title={`${step.title} — etapa ${step.n}`}
                  />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
                    <span
                      style={{
                        fontSize: 14.5,
                        fontWeight: estado === 'agora' ? 700 : 600,
                        lineHeight: 1.3,
                        color: estado === 'agora' ? 'var(--ssj-indigo)' : estado === 'futuro' ? 'var(--ssj-faint)' : 'var(--ssj-text)',
                      }}
                    >
                      {step.title}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'var(--ssj-muted)' }}>{step.ja}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Center Stage & Right Note Panel */}
        <main style={{
          flex: 1,
          padding: '40px 32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%'
        }}>
          
          {/* STAGE CONTAINER (SMARTPHONE FRAME OR DESKTOP WINDOW FRAME) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>

            {/* STEP 0: Link da agência */}
            {activeStep === 0 && (
              <div style={{
                width: '380px',
                backgroundColor: cardBg,
                border: `10px solid ${isDark ? '#232a33' : '#14181f'}`,
                borderRadius: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 20px', backgroundColor: subCardBg, borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)' }}>
                  <span>9:41</span>
                  <span>selectsys.com.br/c/NKT</span>
                  <span>100%</span>
                </div>
                <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: textPrimary }}>SelectSys<span style={{ color: '#294b86' }}>Jobs</span></div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: textSecondary, marginTop: '4px' }}>FUJIARTE · 登録フォーム</div>
                  </div>

                  <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Você foi indicado por</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: textPrimary, marginTop: '4px' }}>Agência Nikkei Tour SP</div>
                    <div style={{ fontSize: '11px', color: '#294b86', fontFamily: 'var(--ssj-font-mono)', marginTop: '2px' }}>tenant_id: NKT</div>
                  </div>

                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: textPrimary }}>Ficha de Candidatura</h3>
                    <p style={{ fontSize: '12px', color: textSecondary, lineHeight: 1.5 }}>
                      Preenchimento em micro-etapas. Salvamento automático offline habilitado.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveStep(1)}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: '#294b86',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Começar Cadastro ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Identificação */}
            {activeStep === 1 && (
              <div style={{
                width: '380px',
                backgroundColor: cardBg,
                border: `10px solid ${isDark ? '#232a33' : '#14181f'}`,
                borderRadius: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 20px', backgroundColor: subCardBg, borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)' }}>
                  <span>9:41</span>
                  <span>selectsys.com.br</span>
                  <span>Passo 1/7</span>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>Identificação · 本人確認</span>
                    <span style={{ fontSize: '10px', color: '#1f7a4d', fontWeight: 700, fontFamily: 'var(--ssj-font-mono)' }}>● Salvo</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Nome Completo (RG)</label>
                    <input 
                      type="text" 
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value.toUpperCase())}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${cardBorder}`, backgroundColor: subCardBg, color: textPrimary, fontSize: '13px', fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${cardBorder}`, backgroundColor: subCardBg, color: textPrimary, fontSize: '13px', fontWeight: 700 }}
                    />
                    <div style={{ fontSize: '11px', color: textSecondary }}>Idade: <b style={{ color: currentAge >= 55 ? '#c4452b' : textPrimary }}>{currentAge} anos</b></div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Descendência Nikkei</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Não', 'Nissei', 'Sansei', 'Yonsei'].map(g => (
                        <button
                          key={g}
                          onClick={() => setNikkeiGen(g)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: `1px solid ${nikkeiGen === g ? '#294b86' : cardBorder}`,
                            backgroundColor: nikkeiGen === g ? '#294b86' : subCardBg,
                            color: nikkeiGen === g ? '#ffffff' : textPrimary,
                            cursor: 'pointer'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', paddingTop: '12px' }}>
                    <button onClick={() => setActiveStep(0)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${cardBorder}`, backgroundColor: subCardBg, color: textPrimary, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Voltar</button>
                    <button onClick={() => setActiveStep(2)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#294b86', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Próximo ➔</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Tatuagem */}
            {activeStep === 2 && (
              <div style={{
                width: '380px',
                backgroundColor: cardBg,
                border: `10px solid ${isDark ? '#232a33' : '#14181f'}`,
                borderRadius: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 20px', backgroundColor: subCardBg, borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)' }}>
                  <span>9:41</span>
                  <span>selectsys.com.br</span>
                  <span>Passo 3/7</span>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: textPrimary }}>Tatuagem · 入れ墨</span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Marque as Regiões Corporais</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Cabeça', 'Pescoço', 'Peito', 'Costas', 'Ombros', 'Braços', 'Mãos', 'Cintura', 'Pernas'].map(r => (
                        <button
                          key={r}
                          onClick={() => toggleTattooRegion(r)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: `1px solid ${tattooRegions[r] ? '#c4452b' : cardBorder}`,
                            backgroundColor: tattooRegions[r] ? '#c4452b' : subCardBg,
                            color: tattooRegions[r] ? '#ffffff' : textPrimary,
                            cursor: 'pointer'
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f7e6e2', border: '1px solid #c4452b', color: '#c4452b', fontSize: '11px', lineHeight: 1.5 }}>
                    <b>Aviso:</b> Fotos das tatuagens serão solicitadas apenas no agendamento de entrevista.
                  </div>

                  <div style={{ display: 'flex', gap: '10px', paddingTop: '12px' }}>
                    <button onClick={() => setActiveStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${cardBorder}`, backgroundColor: subCardBg, color: textPrimary, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Voltar</button>
                    <button onClick={() => setActiveStep(3)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#294b86', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Próximo ➔</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Saúde & LGPD */}
            {activeStep === 3 && (
              <div style={{
                width: '380px',
                backgroundColor: cardBg,
                border: `10px solid ${isDark ? '#232a33' : '#14181f'}`,
                borderRadius: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 20px', backgroundColor: subCardBg, borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)' }}>
                  <span>9:41</span>
                  <span>selectsys.com.br</span>
                  <span>Passo 6/7</span>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#294b86' }} />
                      <span>Autorizo dados de saúde (LGPD Art. 11)</span>
                    </div>
                    <div style={{ fontSize: '11px', color: textSecondary }}>Armazenamento criptografado pgcrypto com log de auditoria.</div>
                  </div>

                  <button onClick={() => setActiveStep(4)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#294b86', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                    Enviar Candidatura Final ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Triagem Automática */}
            {activeStep === 4 && (
              <div style={{
                width: '380px',
                backgroundColor: cardBg,
                border: `10px solid ${isDark ? '#232a33' : '#14181f'}`,
                borderRadius: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #c4452b', color: '#c4452b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      受付
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: textPrimary }}>{candidateName}</div>
                      <div style={{ fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)' }}>06/08/2026 14:41</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#e2f0e9', border: '1px solid #1f7a4d', color: '#1f7a4d', fontSize: '12px', fontWeight: 700 }}>
                      ✓ Idade ({currentAge} anos): Elegível (Limite 55)
                    </div>
                    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#e2f0e9', border: '1px solid #1f7a4d', color: '#1f7a4d', fontSize: '12px', fontWeight: 700 }}>
                      ✓ Visto Nikkei ({nikkeiGen}): Elegível
                    </div>
                    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f7e6e2', border: '1px solid #c4452b', color: '#c4452b', fontSize: '12px', fontWeight: 700 }}>
                      ⚠ Tatuagem: Enviar foto pré-entrevista
                    </div>
                  </div>

                  <button onClick={() => setActiveStep(5)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#294b86', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                    Ir para o Painel de gestão ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Painel de Gestão (Desktop View) */}
            {activeStep === 5 && (
              <div style={{
                width: '100%',
                maxWidth: '900px',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: textPrimary }}>Painel de gestão FUJIARTE · Candidatos</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['todos', 'aprovado', 'entrevista', 'revisao'].map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: `1px solid ${statusFilter === f ? '#294b86' : cardBorder}`,
                          backgroundColor: statusFilter === f ? '#294b86' : subCardBg,
                          color: statusFilter === f ? '#ffffff' : textPrimary,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: subCardBg, borderBottom: `2px solid ${cardBorder}`, color: textSecondary, fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Candidato</th>
                        <th style={{ padding: '12px 16px' }}>Idade</th>
                        <th style={{ padding: '12px 16px' }}>Cidade/UF</th>
                        <th style={{ padding: '12px 16px' }}>Japonês</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Agência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((c, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: textPrimary }}>{c.n}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'var(--ssj-font-mono)' }}>{c.i}</td>
                          <td style={{ padding: '14px 16px' }}>{c.c}/{c.uf}</td>
                          <td style={{ padding: '14px 16px' }}>{c.jp}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', backgroundColor: '#e4eaf4', color: '#294b86', textTransform: 'uppercase' }}>
                              {c.st}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: textSecondary }}>{c.ag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 6: Ficha do Candidato (Desktop View) */}
            {activeStep === 6 && (
              <div style={{
                width: '100%',
                maxWidth: '900px',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ borderBottom: `1px solid ${cardBorder}`, paddingBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: textPrimary }}>{candidateName}</h2>
                  <div style={{ fontSize: '12px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)', marginTop: '4px' }}>
                    #1042 · Sansei · {currentAge} anos · Guarulhos/SP · Agência Nikkei Tour
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#c4452b' }}>Dados de Saúde Criptografados (LGPD Art. 11)</div>
                  {healthDisclosed ? (
                    <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, fontFamily: 'var(--ssj-font-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ color: '#1f7a4d', fontWeight: 700 }}>✓ AUDIT LOG EMITIDO: yamada@fujiarte.co.jp (06/08/2026)</div>
                      <div style={{ color: textPrimary, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px' }}>
                        <div>Acidente / Operação: Não</div>
                        <div>Dor Crônica: Nenhuma</div>
                        <div>Daltonismo: Não</div>
                        <div>Alergias: Frutos do Mar</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', borderRadius: '14px', backgroundColor: '#f7e6e2', border: '1px dashed #c4452b', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#c4452b' }}>Confirmação Auditada Requerida</div>
                      <button onClick={() => setHealthDisclosed(true)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: '#294b86', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                        Revelar Dados de Saúde (Emitir Audit Log)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: Exportação Excel (Desktop View) */}
            {activeStep === 7 && (
              <div style={{
                width: '100%',
                maxWidth: '900px',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: textPrimary }}>Exportador Planilha .XLS FUJIARTE</h2>
                    <div style={{ fontSize: '12px', color: textSecondary }}>Modelo 白紙 FUJIARTE Ficha Cadastral (Jun2024)</div>
                  </div>
                  <button onClick={() => setIsExcelExported(true)} style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, backgroundColor: '#c4452b', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                    {isExcelExported ? 'Gerado em 0.3s ✓' : '⚡ Exportar .XLS'}
                  </button>
                </div>

                <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: subCardBg, border: `1px solid ${cardBorder}`, fontFamily: 'var(--ssj-font-mono)' }}>
                  <div style={{ color: '#294b86', fontWeight: 700, fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
                    【 応募者カルテ 】 FUJIARTE Co., Ltd. — FICHA CADASTRAL
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px', border: `1px solid ${cardBorder}`, fontWeight: 700, color: textSecondary }}>NOME COMPLETO</td>
                        <td colSpan={3} style={{ padding: '10px', border: `1px solid ${cardBorder}`, fontWeight: 700, color: textPrimary }}>{candidateName}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: `1px solid ${cardBorder}`, fontWeight: 700, color: textSecondary }}>DATA NASC.</td>
                        <td style={{ padding: '10px', border: `1px solid ${cardBorder}` }}>{birthDate} ({currentAge} Anos)</td>
                        <td style={{ padding: '10px', border: `1px solid ${cardBorder}`, fontWeight: 700, color: textSecondary }}>GERAÇÃO</td>
                        <td style={{ padding: '10px', border: `1px solid ${cardBorder}`, fontWeight: 700, color: '#294b86' }}>{nikkeiGen.toUpperCase()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT EXPLANATION NOTE PANEL */}
          <aside style={{
            width: '340px',
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flexShrink: 0,
            position: 'sticky',
            top: '24px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#294b86', backgroundColor: '#e4eaf4', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', width: 'fit-content' }}>
              {steps[activeStep].tag}
            </span>

            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: textPrimary }}>
                {steps[activeStep].title}
              </h3>
              <div style={{ fontSize: '11px', color: textSecondary, fontFamily: 'var(--ssj-font-mono)', marginTop: '2px' }}>
                {steps[activeStep].ja}
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.6, color: textSecondary, fontWeight: 500 }}>
              {steps[activeStep].desc}
            </p>

            <div style={{ paddingTop: '12px', borderTop: `1px solid ${cardBorder}` }}>
              <button
                onClick={() => setActiveStep((activeStep + 1) % steps.length)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#294b86',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(41, 75, 134, 0.3)'
                }}
              >
                <span>Próxima Etapa</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </aside>
        </main>
      </div>
      )}
    </div>
  );
}
