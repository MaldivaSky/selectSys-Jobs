import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './PrototipoApp.css';
import { BrandMark } from '../brand/BrandMark';
import { Hanko, HankoDocumento } from '../brand/Hanko';
import { Avatar } from '../components/Avatar';
import { ETAPAS_FUNIL, STATUS } from '@selectsys/core';

/* ─── Protótipo mobile do candidato (Claude Design: "SelectSys Jobs Prototipo") ───
   Abertura animada (logo: um ponto sai do Brasil, cruza a ponte e chega no sol
   vermelho do Japão) seguida do app navegável com 4 abas. Dados fictícios.       */

const INK = '#14181f';  // travado: a tela do celular e clara sempre
const SHU = '#c4452b';
const INDIGO = '#294b86';
const TAB_OFF = '#9aa2a8';
const RULE = '#e0e2dc';
const MUTED = '#8a8f8b';

const SPLASH_MS = 3000;

type StepState = 'done' | 'current' | 'todo';

type PassoTimeline = { label: string; ja: string; state: StepState; note?: string };

/* As etapas vêm do dicionário do domínio (@selectsys/core), com o termo
   japonês operacional — 内定, 在留資格認定証明書, 入社. Não é tradução:
   é o vocabulário que a contraparte usa no documento dela. */
const etapa = (n: number) => ETAPAS_FUNIL.find((e) => e.n === n)!;

const TIMELINE: PassoTimeline[] = [
  { label: etapa(1).pt, ja: etapa(1).ja, state: 'done' },
  { label: etapa(2).pt, ja: etapa(2).ja, state: 'done' },
  { label: etapa(3).pt, ja: etapa(3).ja, state: 'done' },
  { label: etapa(5).pt, ja: etapa(5).ja, state: 'done' },
  { label: etapa(7).pt, ja: etapa(7).ja, state: 'done' },
  {
    label: STATUS.coe_andamento.pt,
    ja: STATUS.coe_andamento.ja,
    state: 'current',
    note: STATUS.coe_andamento.descricao,
  },
  { label: etapa(9).pt, ja: etapa(9).ja, state: 'todo' },
  { label: etapa(10).pt, ja: etapa(10).ja, state: 'todo' },
  { label: etapa(11).pt, ja: etapa(11).ja, state: 'todo' },
];

const DOCS = [
  { title: 'Passaporte', meta: 'val. 2031/03', tag: 'Conferido', bg: '#e2f0e9', fg: '#1f7a4d', iconFont: '700 13px/1' },
  { title: 'Certidão de família', meta: 'Koseki · registro', tag: 'Enviado', bg: '#eef2fb', fg: INDIGO, iconFont: '700 12px/1' },
];

const MEDIDAS = [
  { valor: '23,5', unidade: ' cm', rotulo: 'calçado' },
  { valor: '70', unidade: ' cm', rotulo: 'cintura' },
  { valor: '162', unidade: ' cm', rotulo: 'altura' },
];

const TAB_ICONS: ReactNode[] = [
  <svg width="21" height="21" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="7" />
    <path d="M33 78 Q60 36 87 78" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
  </svg>,
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="6" r="2.4" fill="currentColor" />
    <circle cx="6" cy="18" r="2.4" fill="currentColor" />
    <path d="M11 6h8M11 18h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>,
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3" width="14" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="2" />
    <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>,
];

const TAB_LABELS = ['Início', 'Processo', 'Documentos', 'Perfil'];

const screen: CSSProperties = {
  width: '25%',
  height: '100%',
  overflowY: 'auto',
  padding: '52px 22px 28px',
};

const card: CSSProperties = {
  border: `1px solid ${RULE}`,
  background: '#fff',
  borderRadius: '16px',
};

const label: CSSProperties = {
  font: "500 10px/1 'IBM Plex Mono',monospace",
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: '#7a827f',
};

export function AppDoCandidato() {
  const [phase, setPhase] = useState<'splash' | 'app'>('splash');
  const [tab, setTab] = useState(0);
  const [run, setRun] = useState(0);

  // A abertura avança sozinha; `run` reinicia o timer quando o usuário pede replay.
  useEffect(() => {
    if (phase !== 'splash') return;
    const t = setTimeout(() => setPhase('app'), SPLASH_MS);
    return () => clearTimeout(t);
  }, [phase, run]);

  const replay = () => {
    setTab(0);
    setPhase('splash');
    setRun((r) => r + 1);
  };

  return (
    <div className="ssj-proto">

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BrandMark size={26} tone="ink" />
        <span style={{ font: "600 13px/1 'IBM Plex Mono',monospace", letterSpacing: '.06em', color: '#5f6b6a' }}>
          Protótipo navegável · toque nas abas · dados fictícios
        </span>
      </div>

      {/* Moldura do aparelho */}
      <div
        style={{
          width: '372px',
          height: '764px',
          background: '#0d1016',
          borderRadius: '52px',
          padding: '11px',
          boxShadow: '0 40px 90px -40px rgba(13,16,22,.7),0 0 0 1px rgba(255,255,255,.04) inset',
          flex: 'none',
        }}
      >
        <div className="ssj-device__screen" style={{ borderRadius: '42px' }}>
          {/* Barra de status */}
          <div
            style={{
              position: 'absolute',
              zIndex: 5,
              left: 0,
              right: 0,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 26px 6px',
              font: "600 12px/1 'IBM Plex Mono',monospace",
              color: INK,
              pointerEvents: 'none',
            }}
          >
            <span>9:41</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: INK }} />
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: INK }} />
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: SHU }} />
            </span>
          </div>

          {phase === 'app' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'ssj-appIn .5s ease both' }}>
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    display: 'flex',
                    width: '400%',
                    height: '100%',
                    transition: 'transform .42s cubic-bezier(.4,0,.15,1)',
                    transform: `translateX(-${tab * 25}%)`,
                  }}
                >
                  {/* ── Aba 0 · Início ─────────────────────────────────── */}
                  <div style={screen}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', animation: 'ssj-fadeUp .5s both' }}>
                      <BrandMark size={26} tone="ink" />
                      <span style={{ font: "700 14px/1 var(--ssj-font-display)", letterSpacing: '-.02em' }}>SelectSys Jobs</span>
                    </div>

                    <div style={{ marginTop: '22px', animation: 'ssj-fadeUp .55s .05s both' }}>
                      <div style={{ font: "400 13px/1 'IBM Plex Mono',monospace", color: '#7a827f' }}>Olá, Marina</div>
                      <div
                        className="ssj-balance"
                        style={{ font: "700 25px/1.15 var(--ssj-font-display)", letterSpacing: '-.025em', marginTop: '6px' }}
                      >
                        Você está a caminho do Japão.
                      </div>
                    </div>

                    {/* Etapa atual */}
                    <div
                      style={{
                        marginTop: '20px',
                        borderRadius: '20px',
                        background: INK,
                        color: '#fff',
                        padding: '22px',
                        display: 'flex',
                        gap: '18px',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: 'ssj-fadeUp .6s .1s both',
                      }}
                    >
                      <div style={{ position: 'relative', width: '78px', height: '78px', flex: 'none' }}>
                        <svg width="78" height="78" viewBox="0 0 120 120" fill="none" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.16)" strokeWidth="10" />
                          <circle
                            cx="60"
                            cy="60"
                            r="52"
                            stroke={SHU}
                            strokeWidth="10"
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray="1"
                            style={{ strokeDashoffset: 1, animation: 'ssj-ring66 1.1s .5s ease forwards' }}
                          />
                        </svg>
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ font: "700 20px/1 var(--ssj-font-display)" }}>8</span>
                          <span style={{ font: "400 9px/1 'IBM Plex Mono',monospace", color: '#9aa6bd' }}>de 11</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ ...label, letterSpacing: '.14em', color: '#8fa6cf' }}>Etapa atual</div>
                        <div style={{ font: "700 18px/1.15 var(--ssj-font-display)", marginTop: '7px' }}>
                          COE em
                          <br />
                          andamento
                        </div>
                        <div
                          style={{
                            marginTop: '9px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255,255,255,.12)',
                            padding: '5px 10px',
                            borderRadius: '7px',
                            font: "500 10.5px/1 'IBM Plex Mono',monospace",
                          }}
                        >
                          ⏱ ~12 dias
                        </div>
                      </div>
                    </div>

                    {/* Atalhos */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '11px', animation: 'ssj-fadeUp .6s .15s both' }}>
                      <button
                        onClick={() => setTab(1)}
                        style={{
                          flex: 1,
                          border: `1px solid ${RULE}`,
                          background: '#fff',
                          borderRadius: '15px',
                          padding: '15px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: '#eef2fb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', border: `2px solid ${INDIGO}` }} />
                        </div>
                        <div style={{ font: "600 12.5px/1.2 'IBM Plex Sans',sans-serif" }}>Meu processo</div>
                        <div style={{ font: '400 10.5px/1.3', color: MUTED, marginTop: '2px' }}>ver as 11 etapas</div>
                      </button>
                      <button
                        onClick={() => setTab(2)}
                        style={{
                          flex: 1,
                          border: `1px solid ${RULE}`,
                          background: '#fff',
                          borderRadius: '15px',
                          padding: '15px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: '#fbf1ee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          <span style={{ width: '11px', height: '9px', border: `2px solid ${SHU}`, borderRadius: '2px' }} />
                        </div>
                        <div style={{ font: "600 12.5px/1.2 'IBM Plex Sans',sans-serif" }}>Documentos</div>
                        <div style={{ font: '400 10.5px/1.3', color: MUTED, marginTop: '2px' }}>1 pendência</div>
                      </button>
                    </div>

                    {/* Próximo compromisso */}
                    <div style={{ ...card, marginTop: '16px', padding: '16px 17px', animation: 'ssj-fadeUp .6s .2s both' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: SHU }} />
                        <span style={{ ...label, letterSpacing: '.12em' }}>Próximo</span>
                      </div>
                      <div style={{ font: '600 14px/1.3' }}>Entrevista confirmada</div>
                      <div style={{ font: '400 12px/1.4', color: MUTED, marginTop: '3px' }}>12/08 às 10h · online (Garoon)</div>
                    </div>
                  </div>

                  {/* ── Aba 1 · Processo ───────────────────────────────── */}
                  <div style={screen}>
                    <div style={{ font: "700 22px/1.1 var(--ssj-font-display)", letterSpacing: '-.02em', animation: 'ssj-fadeUp .5s both' }}>
                      Meu processo
                    </div>
                    <div
                      style={{
                        font: "400 12px/1 'IBM Plex Mono',monospace",
                        color: MUTED,
                        marginTop: '6px',
                        animation: 'ssj-fadeUp .5s both',
                      }}
                    >
                      7 concluídas · 4 restantes
                    </div>
                    <div style={{ marginTop: '14px', height: '6px', borderRadius: '4px', background: '#e2e5df', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: '100%',
                          maxWidth: '66%',
                          background: SHU,
                          transformOrigin: 'left',
                          transform: 'scaleX(.66)',
                          animation: 'ssj-barload 1.1s .2s ease both',
                        }}
                      />
                    </div>

                    <div style={{ position: 'relative', marginTop: '20px', paddingLeft: '2px' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '14px', bottom: '14px', width: '2px', background: '#e2e5df' }} />
                      {TIMELINE.map((step, i) => (
                        <div
                          key={step.label}
                          style={{
                            display: 'flex',
                            gap: '14px',
                            padding: '6px 0',
                            animation: 'ssj-stampIn .4s both',
                            animationDelay: `${(0.1 + i * 0.08).toFixed(2)}s`,
                          }}
                        >
                          <Hanko
                            estado={step.state === 'done' ? 'aprovado' : step.state === 'current' ? 'agora' : 'futuro'}
                            texto="済"
                            size={26}
                            delay={0.1 + i * 0.08}
                            title={step.label}
                          />
                          <div style={{ paddingTop: step.state === 'current' ? '1px' : '2px' }}>
                            <div
                              style={
                                step.state === 'current'
                                  ? { font: '700 14px/1.2', color: INDIGO }
                                  : step.state === 'todo'
                                    ? { font: '500 13.5px/1.2', color: '#9aa09b' }
                                    : { font: '600 13.5px/1.2' }
                              }
                            >
                              {step.label}
                            </div>
                            <div className="ssj-mono" style={{ fontSize: 11.5, color: 'var(--ssj-faint)', marginTop: 2 }}>{step.ja}</div>
                            {step.note && <div style={{ font: '400 11.5px/1.4', color: MUTED, marginTop: '3px' }}>{step.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Aba 2 · Documentos ─────────────────────────────── */}
                  <div style={screen}>
                    <div style={{ font: "700 22px/1.1 var(--ssj-font-display)", letterSpacing: '-.02em', animation: 'ssj-fadeUp .5s both' }}>
                      Documentos
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <HankoDocumento acao="conferido" size={62} data={new Date(2026, 7, 3)} />
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      {DOCS.map((doc, i) => (
                        <div
                          key={doc.title}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: `1px solid ${RULE}`,
                            borderRadius: '13px',
                            padding: '13px 14px',
                            background: '#fff',
                            animation: `ssj-fadeUp .5s ${0.05 + i * 0.05}s both`,
                          }}
                        >
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: doc.bg,
                              color: doc.fg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              font: doc.iconFont,
                            }}
                          >
                            ✓
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ font: '600 13.5px/1.2' }}>{doc.title}</div>
                            <div style={{ font: "400 10.5px/1 'IBM Plex Mono',monospace", color: '#9aa09b', marginTop: '3px' }}>{doc.meta}</div>
                          </div>
                          <span
                            style={{
                              padding: '4px 9px',
                              borderRadius: '999px',
                              font: "500 9px/1 'IBM Plex Mono',monospace",
                              textTransform: 'uppercase',
                              letterSpacing: '.06em',
                              background: doc.bg,
                              color: doc.fg,
                            }}
                          >
                            {doc.tag}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pendência de tatuagem — regra do nicho dekassegui */}
                    <div
                      style={{
                        marginTop: '16px',
                        border: '1px solid #f0d9d3',
                        borderLeft: `3px solid ${SHU}`,
                        borderRadius: '15px',
                        background: '#fbf1ee',
                        padding: '16px 17px',
                        animation: 'ssj-fadeUp .5s .15s both',
                      }}
                    >
                      <div style={{ ...label, letterSpacing: '.12em', color: SHU }}>Pendente · foto de tatuagem</div>
                      <div style={{ font: '400 12px/1.5', color: '#3a4048', marginTop: '8px' }}>
                        Envie as fotos das regiões declaradas — <b>exceto locais íntimos</b>. Pedido após a entrevista.
                      </div>
                      <div style={{ display: 'flex', gap: '6px', margin: '11px 0 12px' }}>
                        {['Braços', 'Costas'].map((reg) => (
                          <span key={reg} style={{ padding: '5px 11px', borderRadius: '8px', background: '#f7e6e2', color: SHU, font: '500 11px/1' }}>
                            {reg}
                          </span>
                        ))}
                      </div>
                      <button
                        style={{
                          width: '100%',
                          border: '1.5px dashed #d9b4aa',
                          borderRadius: '12px',
                          padding: '16px',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ font: '600 13px/1.2', color: SHU }}>＋ Enviar fotos</div>
                        <div style={{ font: '400 10px/1.3', color: '#b08a80', marginTop: '4px' }}>recebido por link no WhatsApp</div>
                      </button>
                    </div>
                  </div>

                  {/* ── Aba 3 · Perfil ─────────────────────────────────── */}
                  <div style={{ ...screen, padding: '0 0 28px' }}>
                    <div style={{ padding: '52px 22px 22px', background: INK, color: '#fff', animation: 'ssj-fadeIn .5s both' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Avatar src="/images/avatar-exemplo.svg" nome="Marina Tanaka" size={58} tone="light" />

                        <div>
                          <div style={{ font: "700 18px/1.1 var(--ssj-font-display)" }}>Marina Tanaka</div>
                          <div style={{ font: "400 11px/1.3 'IBM Plex Mono',monospace", color: '#a9b4c9', marginTop: '3px' }}>
                            Sansei · 29 · Guarulhos/SP
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          background: 'rgba(255,255,255,.12)',
                          padding: '6px 11px',
                          borderRadius: '8px',
                          font: "500 10.5px/1 'IBM Plex Mono',monospace",
                        }}
                      >
                        ↗ Agência Nikkei Tour
                      </div>
                    </div>

                    <div style={{ padding: '20px 22px 0' }}>
                      <div style={{ ...label, marginBottom: '11px', animation: 'ssj-fadeUp .5s .05s both' }}>Uniforme &amp; EPI</div>
                      <div style={{ display: 'flex', gap: '9px', animation: 'ssj-fadeUp .5s .1s both' }}>
                        {MEDIDAS.map((m) => (
                          <div key={m.rotulo} style={{ flex: 1, border: `1px solid ${RULE}`, borderRadius: '13px', padding: '12px 13px', background: '#fff' }}>
                            <div style={{ font: "700 18px/1 var(--ssj-font-display)" }}>
                              {m.valor}
                              <span style={{ fontSize: '10px', color: MUTED }}>{m.unidade}</span>
                            </div>
                            <div style={{ font: '400 10.5px/1.2', color: MUTED, marginTop: '3px' }}>{m.rotulo}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ ...label, marginTop: '18px', marginBottom: '11px', animation: 'ssj-fadeUp .5s .15s both' }}>Setor aceito</div>
                      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', animation: 'ssj-fadeUp .5s .2s both' }}>
                        {['Eletrônica', 'Alimentício'].map((setor) => (
                          <span key={setor} style={{ padding: '8px 14px', border: `1px solid ${RULE}`, borderRadius: '10px', background: '#fff', font: '500 12.5px/1' }}>
                            {setor}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={replay}
                        style={{
                          marginTop: '22px',
                          width: '100%',
                          border: `1px solid ${RULE}`,
                          background: '#fff',
                          borderRadius: '13px',
                          padding: '14px',
                          font: '600 13px/1',
                          color: INDIGO,
                          cursor: 'pointer',
                          animation: 'ssj-fadeUp .5s .25s both',
                        }}
                      >
                        ↺ Rever abertura
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de abas */}
              <div style={{ position: 'relative', flex: 'none', background: '#fff', borderTop: '1px solid #e6e8e2', padding: '10px 14px 24px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '25%',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'transform .42s cubic-bezier(.4,0,.15,1)',
                    transform: `translateX(${tab * 100}%)`,
                  }}
                >
                  <span style={{ width: '30px', height: '3px', borderRadius: '2px', background: SHU }} />
                </div>
                <div style={{ display: 'flex' }}>
                  {TAB_LABELS.map((tabLabel, i) => (
                    <button
                      key={tabLabel}
                      onClick={() => setTab(i)}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        color: tab === i ? INDIGO : TAB_OFF,
                      }}
                    >
                      {TAB_ICONS[i]}
                      <span style={{ font: "600 9.5px/1 'IBM Plex Sans',sans-serif" }}>{tabLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Abertura: o ponto sai do Brasil, cruza a ponte e chega no sol vermelho */}
          {phase === 'splash' && (
            <div
              key={run}
              onClick={() => setPhase('app')}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                background: 'radial-gradient(120% 100% at 50% 30%,#1c2331 0%,#0d1016 75%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="150" height="150" viewBox="0 0 120 120" fill="none">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="#3a4560"
                  strokeWidth="2"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{ strokeDashoffset: 1, animation: 'ssj-draw 1s .1s ease forwards' }}
                />
                <line
                  x1="31"
                  y1="78"
                  x2="89"
                  y2="78"
                  stroke="#f4f2ec"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{ strokeDashoffset: 1, animation: 'ssj-draw .7s .35s ease forwards' }}
                />
                <path
                  d="M31 78 Q60 34 89 78"
                  stroke="#f4f2ec"
                  strokeWidth="4.4"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{ strokeDashoffset: 1, animation: 'ssj-draw 1s .3s ease forwards' }}
                />
                <circle cx="31" cy="78" r="6" fill="#1f9d57" style={{ opacity: 0, animation: 'ssj-pop .4s .35s ease forwards' }} />
                <circle
                  cx="89"
                  cy="78"
                  r="7"
                  fill={SHU}
                  style={{ opacity: 0, transformOrigin: '89px 78px', animation: 'ssj-pop .5s 1.25s cubic-bezier(.3,1.4,.5,1) forwards' }}
                />
                <circle className="ssj-travel" r="5.5" fill="#1f9d57" />
              </svg>

              <div style={{ marginTop: '14px', textAlign: 'center', opacity: 0, animation: 'ssj-fadeUp .7s 1.35s ease forwards' }}>
                <div style={{ font: "700 27px/1 var(--ssj-font-display)", letterSpacing: '-.02em', color: '#f4f2ec' }}>SelectSys</div>
                <div
                  style={{
                    marginTop: '9px',
                    font: "500 12px/1 'IBM Plex Mono',monospace",
                    letterSpacing: '.5em',
                    textTransform: 'uppercase',
                    color: '#c98a7d',
                    paddingLeft: '.5em',
                  }}
                >
                  Jobs
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  font: "400 11px/1 'IBM Plex Mono',monospace",
                  letterSpacing: '.14em',
                  color: '#6d7890',
                  opacity: 0,
                  animation: 'ssj-fadeIn .8s 1.7s ease forwards',
                }}
              >
                Brasil <span style={{ color: SHU }}>→</span> Japão
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '64px',
                  width: '140px',
                  height: '3px',
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: '100%', background: SHU, transformOrigin: 'left', animation: 'ssj-barload 2.6s .2s cubic-bezier(.6,0,.3,1) forwards' }} />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  font: "400 9.5px/1 'IBM Plex Mono',monospace",
                  color: '#4b5670',
                  opacity: 0,
                  animation: 'ssj-fadeIn 1s 2s ease forwards',
                }}
              >
                toque para pular
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ssj-proto__legenda">
        A logo: um ponto sai do Brasil, cruza a ponte e chega no sol vermelho — o Japão. É isso que a abertura mostra. Toque nas abas para navegar;
        “Rever abertura” no Perfil repete a animação.
      </div>
    </div>
  );
}

export default AppDoCandidato;
