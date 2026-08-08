import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Shield, CheckCircle2, ChevronRight, ChevronLeft,
  Lock, Building2, MapPin
} from 'lucide-react';
import { Hanko } from '../brand/Hanko';
import { AutoPreenchimento } from '../components/ficha/AutoPreenchimento';
import { normalizarHex } from '../theme/marcaTenant';
import {
  calcularIdade as idadeDe,
  progressoTotal,
  validarCelular,
  validarCpf,
  validarNascimento,
  validarValidadeDocumento,
} from '../dados/validacao';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../dados/supabase';
import { enviarCandidatura } from '../dados/candidaturas';
import { executarTriagem, type ResultadoTriagem } from '../dados/triagemEngine';
import type { Language } from '../translations';

interface Experience {
  provincia: string;
  empreiteira: string;
  fabrica: string;
  periodo: string;
  motivoSaida: string;
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function CandidateWizard({ lang: _lang }: { lang?: Language }) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submetidoResultado, setSubmetidoResultado] = useState<{ enviado: boolean; triagem: ResultadoTriagem } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Faixa de aviso da ficha (extração aplicada, erro de validação, etc.). */
  const [avisoFicha, setAvisoFicha] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  /** Rascunho lido do localStorage, aguardando o candidato decidir se retoma. */
  const [rascunhoPendente, setRascunhoPendente] = useState<{ dados: Record<string, unknown>; etapa: number } | null>(null);
  
  // Tenant Context
  const [tenantInfo, setTenantInfo] = useState<{
    id: string;
    nome: string;
    cor_primaria: string;
    logo_url: string;
  } | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);

  useEffect(() => {
    async function fetchTenant() {
      if (!tenantSlug || !supabase) {
        setLoadingTenant(false);
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        // Só a vitrine. `features` carrega configuração de plano e deixou de
        // ser legível sem login — portal público não lê config de tenant.
        .select('id, nome, logo_url, cor_primaria')
        .eq('slug', tenantSlug)
        .maybeSingle();

      if (error || !data) {
        alert('Agência não encontrada ou link inválido.');
        navigate('/login');
      } else {
        const cor = normalizarHex(data.cor_primaria);
        const logo = data.logo_url ?? '';
        setTenantInfo({ id: data.id, nome: data.nome, cor_primaria: cor, logo_url: logo });
        setFormData(prev => ({ ...prev, agenciaCodigo: data.id }));
      }
      setLoadingTenant(false);
    }
    fetchTenant();
  }, [tenantSlug, navigate]);

  // FORM DATA — ~130 CAMPOS OFICIAIS DA PLANILHA FUJIARTE
  const [formData, setFormData] = useState({
    // Etapa 1: Identificação & Documentos
    nomeCompleto: '',
    dataNascimento: '',
    sexo: 'M',
    estadoCivil: 'solteiro',
    nacionalidade: 'BRAS',
    geracaoNikkei: 'nissei',
    cpf: '',
    rg: '',
    rgEmissor: '',
    passaporte: '',
    passaporteValidade: '',
    visto: '',
    vistoValidade: '',
    koseki: '',
    kosekiValidade: '',
    reentry: '',
    reentryValidade: '',
    fotoUrl: '',

    // Etapa 2: Biometria para EPIs
    alturaCm: '',
    pesoKg: '',
    cinturaCm: '',
    peCm: '', // Pé em cm para bota de segurança nas fábricas

    // Etapa 3: Escolaridade & Endereço
    escolaridade: 'medio_completo',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    email: '',
    celular: '',
    emergenciaNome: '',
    emergenciaRelacao: '',
    emergenciaProvincia: '',
    emergenciaTel: '',

    // Etapa 4: Histórico Laboral no Japão (1:N)
    jaEstveJapao: 'nao',
    retornouAjudaGoverno: 'nao',
    experienciasJapao: [] as Experience[],

    // Etapa 5: Enquete Bloco A (15 Perguntas + Tatuagens)
    setoresAceitos: ['autopeças', 'eletronicos'],
    turnosAceitos: 'diurno_noturno',
    horasExtrasDia: '2h_3h',
    trabalhaEmPe: 'sim',
    temTatuagem: 'nao',
    tatuagensRegioes: [] as string[],
    dataEmbarquePretendida: '',
    permanenciaPretendidaAnos: '2',

    // Etapa 6: Enquete Bloco B (Saúde 🔒 LGPD Art. 11)
    usaOculos: 'nao',
    daltonismo: 'nao',
    fuma: 'nao',
    cirurgiasPrevias: '',
    doresCronicas: [] as string[],
    questaoMentalPsiquiatrica: 'nao',
    medicacaoDiaria: '',
    alergias: '',
    fobia: 'nao',
    tratamento: 'nao',
    consentimentoSaudeLGPD: false,

    // Etapa 7: Bloco C (Motivação) & Agência
    motivacaoPrincipal: 'poupanca',
    agenciaCodigo: '',
    termoVeracidade: false
  });

  const [cepFeedback, setCepFeedback] = useState('');
  // Indicador "Salvo" do autosave (Escopo A2). Estava sendo usado sem existir.
  const [autoSaved, setAutoSaved] = useState(false);

  const buscarViaCep = async (cepInput: string) => {
    setFormData(prev => ({ ...prev, cep: cepInput }));
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        setCepFeedback('Buscando endereço via ViaCEP...');
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            cep: cepInput,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
          setCepFeedback(`✓ ${data.logradouro} — ${data.bairro}, ${data.localidade}/${data.uf}`);
        } else {
          setCepFeedback('CEP não encontrado na base ViaCEP.');
        }
      } catch {
        setCepFeedback('Erro de conexão ao buscar ViaCEP.');
      }
    } else {
      setCepFeedback('');
    }
  };

  /* ── AUTOPREENCHIMENTO ────────────────────────────────────────────────
     A IA devolve só os campos que o candidato marcou na revisão, já com os
     nomes do formData. `experienciasJapao` recebe tratamento à parte porque
     o wizard guarda a experiência num formato próprio (Experience). */
  const aplicarExtracao = useCallback((campos: Record<string, unknown>) => {
    setFormData(prev => {
      const proximo: Record<string, unknown> = { ...prev };
      let aplicados = 0;

      for (const [chave, valor] of Object.entries(campos)) {
        if (chave === 'experienciasJapao') {
          const lista = (valor as Record<string, string>[]).map(e => ({
            provincia: e.provincia || '',
            empreiteira: e.empreiteira || '',
            fabrica: e.empresa || '',
            periodo: [e.periodoInicio, e.periodoFim].filter(Boolean).join(' a '),
            motivoSaida: ''
          }));
          if (lista.length) {
            proximo.experienciasJapao = [...(prev.experienciasJapao as Experience[]), ...lista];
            aplicados++;
          }
          continue;
        }
        // Só escreve em campo que o formulário realmente tem: uma chave nova
        // vinda da IA não pode criar estado fantasma.
        if (chave in prev) {
          proximo[chave] = valor;
          aplicados++;
        }
      }

      setAvisoFicha({ tipo: 'ok', texto: `${aplicados} ${aplicados === 1 ? 'campo preenchido' : 'campos preenchidos'} pela leitura do documento. Confira antes de avançar.` });
      return proximo as typeof prev;
    });
  }, []);

  /* ── AUTOSAVE REAL ────────────────────────────────────────────────────
     Antes o badge "Salvo" só piscava num setInterval, sem gravar nada: o
     candidato que fechasse a aba na etapa 6 perdia as 6 etapas. Agora o
     rascunho vai para o localStorage, com chave por tenant, e a ficha é
     retomada de onde parou. */
  const chaveRascunho = tenantSlug ? `ssj:ficha:${tenantSlug}` : null;
  const jaRestaurou = useRef(false);
  const [rascunhoEncontrado, setRascunhoEncontrado] = useState<{ etapa: number; quando: string } | null>(null);

  useEffect(() => {
    if (!chaveRascunho || jaRestaurou.current) return;
    jaRestaurou.current = true;
    try {
      const cru = localStorage.getItem(chaveRascunho);
      if (!cru) return;
      const salvo = JSON.parse(cru) as { dados: Record<string, unknown>; etapa: number; quando: number };
      // Rascunho velho demais é mais atrapalho que ajuda.
      if (Date.now() - salvo.quando > 30 * 24 * 3600 * 1000) {
        localStorage.removeItem(chaveRascunho);
        return;
      }
      setRascunhoPendente(salvo);
      setRascunhoEncontrado({
        etapa: salvo.etapa,
        quando: new Date(salvo.quando).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      });
    } catch {
      localStorage.removeItem(chaveRascunho);
    }
  }, [chaveRascunho]);

  useEffect(() => {
    if (!chaveRascunho || rascunhoEncontrado) return; // não sobrescreve antes da decisão
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(chaveRascunho, JSON.stringify({ dados: formData, etapa: step, quando: Date.now() }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 1600);
      } catch {
        /* cota cheia ou modo privativo: seguir sem autosave é melhor que travar */
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [formData, step, chaveRascunho, rascunhoEncontrado]);

  // Cálculo automático de idade ao vivo
  const calcularIdade = (dataNasc: string) => {
    if (!dataNasc) return '';
    const idade = idadeDe(dataNasc);
    return isNaN(idade) ? '' : `${idade}`;
  };

  /** Quanto da ficha já está preenchido — alimenta a barra do topo. */
  const progresso = progressoTotal(formData as unknown as Record<string, unknown>);

  const handleTatuagemToggle = (regiao: string) => {
    const regioes = formData.tatuagensRegioes.includes(regiao)
      ? formData.tatuagensRegioes.filter(r => r !== regiao)
      : [...formData.tatuagensRegioes, regiao];
    setFormData({ ...formData, tatuagensRegioes: regioes });
  };

  const handleAddExpJapao = () => {
    const novaExp: Experience = {
      provincia: '',
      empreiteira: '',
      fabrica: '',
      periodo: '',
      motivoSaida: ''
    };
    setFormData({ ...formData, experienciasJapao: [...formData.experienciasJapao, novaExp] });
  };



  const stepsList = [
    { n: '01', title: 'Identificação', ja: '本人確認' },
    { n: '02', title: 'Biometria EPI', ja: '生体・作業着' },
    { n: '03', title: 'Endereço/Família', ja: '住所・緊急連絡先' },
    { n: '04', title: 'Histórico JP', ja: '職歴・日本' },
    { n: '05', title: 'Enquete Bloco A', ja: '希望条件・入れ墨' },
    { n: '06', title: 'Saúde LGPD', ja: '健康・同意' },
    { n: '07', title: 'Revisão/.XLS', ja: '確認・エクセル' }
  ];

  const handleFinalSubmit = async () => {
    // Validação da Etapa 1
    if (!formData.nomeCompleto.trim()) { alert("Por favor, preencha o Nome Completo."); setStep(1); return; }
    if (!formData.cpf.trim()) { alert("Por favor, preencha o CPF."); setStep(1); return; }
    
    // Validação da Etapa 2
    if (!formData.alturaCm.trim() || !formData.pesoKg.trim() || !formData.peCm.trim()) { 
      alert("Por favor, preencha os dados de biometria (Altura, Peso, Tamanho do pé) para o uniforme."); setStep(2); return; 
    }
    
    // Validação da Etapa 3
    if (!formData.celular.trim()) { alert("Por favor, preencha o Celular para contato."); setStep(3); return; }
    if (!formData.logradouro.trim()) { alert("Por favor, preencha o Endereço atual."); setStep(3); return; }
    
    // Validação da Etapa 5
    if (formData.temTatuagem === 'sim' && formData.tatuagensRegioes.length === 0) { 
      alert("Você informou que possui tatuagem. Por favor, marque as regiões exatas no corpo."); setStep(5); return; 
    }
    
    // Validação da Etapa 6
    if (!formData.consentimentoSaudeLGPD) { 
      alert("É obrigatório concordar com o Termo de Consentimento LGPD sobre seus dados de saúde."); setStep(6); return; 
    }

    setIsSubmitting(true);

    // Executar Motor de Triagem
    const resultadoTriagem = executarTriagem(
      formData as unknown as Record<string, unknown>,
      { curriculo_japao: formData.experienciasJapao }
    );

    // Persistir no Supabase
    const rascunho = {
      valores: formData as unknown as Record<string, unknown>,
      linhas: { curriculo_japao: formData.experienciasJapao as unknown as Record<string, unknown>[] },
      consentimentos: {
        geral_v1: true,
        saude_v1: formData.consentimentoSaudeLGPD,
        descendencia_v1: formData.nacionalidade === 'BRAS',
      },
      etapa: 7,
    };

    const res = await enviarCandidatura(rascunho, {
      orgSlug: tenantSlug || 'fujiarte',
      agenciaCodigo: formData.agenciaCodigo,
    });

    setIsSubmitting(false);

    if (res.ok) {
      if (chaveRascunho) localStorage.removeItem(chaveRascunho);
      setSubmetidoResultado({ enviado: true, triagem: resultadoTriagem });
    } else {
      alert(`Ocorreu um erro ao submeter sua candidatura: ${res.motivo || 'Erro desconhecido'}`);
    }
  };

  if (loadingTenant) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1016', color: '#fff' }}>Carregando ficha...</div>;
  }

  const primaryColor = tenantInfo?.cor_primaria || '#294b86';

  if (submetidoResultado) {
    const t = submetidoResultado.triagem;
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d1016', color: '#e9ece8', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '640px', width: '100%', backgroundColor: '#161b24', borderRadius: '24px', border: '1px solid #29313c', padding: '40px', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Hanko estado="aprovado" texto="済" size={72} title="Ficha Recebida" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f3f4f6', margin: '0 0 8px 0' }}>
            Ficha Submetida com Sucesso!
          </h2>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>
            Sua candidatura foi gravada na base da <strong>{tenantInfo?.nome || 'FUJIARTE'}</strong>.
          </p>

          <div style={{ backgroundColor: '#1c222c', borderRadius: '16px', padding: '24px', textAlign: 'left', border: '1px solid #29313c', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield size={20} color="#7ba4de" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f3f4f6' }}>{t.titulo}</span>
            </div>
            <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 12px 0', lineHeight: 1.6 }}>
              {t.razao}
            </p>
            {t.detalhes.length > 0 && (
              <div style={{ borderTop: '1px solid #29313c', paddingTop: '12px', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Fatos Avaliados na Triagem Automática (LGPD Art. 20)
                </span>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#9ca3af' }}>
                  {t.detalhes.map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/vagas')}
            style={{ padding: '14px 28px', borderRadius: '12px', backgroundColor: primaryColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}
          >
            Ver Mais Vagas Disponíveis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ssj-section" style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, rgba(28,35,49,1) 0%, ${primaryColor} 45%, rgba(196,69,43,0.85) 100%)`,
      padding: '40px 0',
      transition: 'background 0.5s ease'
    }}>
      <div className="ssj-container" style={{ maxWidth: '920px', margin: '0 auto' }}>
        
        {/* Ficha Cadastral FUJIARTE - Form Container */}
        <div className="ssj-card ssj-in ssj-ficha-card" style={{
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          background: 'var(--ssj-surface)',
          color: 'var(--ssj-text)'
        }}>

          {/* Cabeçalho do Tenant & Linha do Tempo Hanko (Linha do Tempo Japonesa) */}
          <div className="ssj-ficha-cabecalho" style={{ background: 'var(--ssj-surface-2)', borderBottom: '1px solid var(--ssj-rule)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Placa clara: a maioria dos logos de agência é escura e
                    sumiria contra a superfície do card no tema escuro. */}
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '14px',
                    background: tenantInfo?.logo_url ? '#ffffff' : primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: tenantInfo?.logo_url ? '8px' : 0,
                    flexShrink: 0,
                    boxShadow: `0 10px 24px -12px ${primaryColor}`,
                  }}
                >
                  {tenantInfo?.logo_url ? (
                    <img
                      src={tenantInfo.logo_url}
                      alt={tenantInfo.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Building2 size={28} color="#fff" />
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                    {tenantInfo?.nome || 'Ficha Cadastral'}
                  </h2>
                  <span style={{ fontSize: '13px', color: 'var(--ssj-muted)' }}>Ficha cadastral oficial</span>
                </div>
              </div>
              {/* Atribuição discreta: no ambiente do candidato quem assina é a agência. */}
              <span style={{ fontSize: '10px', color: 'var(--ssj-muted)', opacity: 0.7, letterSpacing: '0.04em' }}>
                operado com SelectSys Jobs
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: '5px',
                    borderRadius: '3px',
                    background: s <= step ? 'linear-gradient(90deg, #1f9d57 0%, #c99a2e 50%, #c4452b 100%)' : 'var(--ssj-rule-2)',
                    boxShadow: s <= step ? '0 2px 8px rgba(196, 69, 43, 0.3)' : 'none',
                    transition: 'all 0.35s ease'
                  }}
                />
              ))}
            </div>

            {/* Resumo compacto: no celular os 7 selos viram uma linha só, com
                barra de progresso. Sete rótulos em 375px não são legíveis por
                ninguém — e é nesse aparelho que a maioria preenche a ficha. */}
            <div className="ssj-ficha-passo-mobile">
              <div className="ssj-ficha-passo-topo">
                <strong>
                  Etapa {step} de 7 · {stepsList[step - 1]?.title}
                </strong>
                <span>{Math.round(progresso * 100)}%</span>
              </div>
              <div className="ssj-ficha-progresso">
                <div
                  className="ssj-ficha-progresso-fill"
                  style={{ width: `${Math.max(3, progresso * 100)}%`, background: primaryColor }}
                />
              </div>
            </div>

            {/* Selos Hanko Interativos em Linha */}
            <div className="ssj-ficha-trilha" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
              alignItems: 'start'
            }}>
              {stepsList.map((sItem, idx) => {
                const sNum = idx + 1;
                const estado = sNum < step ? 'aprovado' : sNum === step ? 'agora' : 'futuro';
                return (
                  <button
                    key={sItem.n}
                    type="button"
                    onClick={() => setStep(sNum)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: sNum > step ? 0.65 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <Hanko
                      estado={estado}
                      texto={estado === 'aprovado' ? '済' : sItem.n}
                      size={28}
                      title={`Ir para etapa ${sItem.n}: ${sItem.title}`}
                    />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: sNum === step ? 700 : 500,
                      color: sNum === step ? 'var(--ssj-shu)' : 'var(--ssj-text)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      {sItem.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--ssj-muted)', fontFamily: 'var(--ssj-font-mono)' }}>
                      {sItem.ja}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicador de autosave — critério A2 do escopo: o candidato precisa
              ver que não vai perder os 130 campos se a conexão cair. */}
          <div
            aria-live="polite"
            style={{
              position: 'sticky',
              top: 78,
              zIndex: 5,
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0 32px',
              height: 0,
            }}
          >
            <span
              className="ssj-pill ssj-pill--ok"
              style={{
                opacity: autoSaved ? 1 : 0,
                transform: autoSaved ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'opacity .25s ease, transform .25s ease',
                pointerEvents: 'none',
                boxShadow: 'var(--ssj-shadow-sm)',
              }}
            >
              ✓ Salvo
            </span>
          </div>

          {/* Retomada de rascunho: quem voltou depois não recomeça do zero. */}
          {rascunhoEncontrado && rascunhoPendente && (
            <div className="ssj-ficha-retomar" style={{ borderColor: primaryColor }}>
              <div>
                <strong>Você tem uma ficha começada.</strong>
                <span>
                  Salva em {rascunhoEncontrado.quando}, na etapa {rascunhoEncontrado.etapa} de 7.
                </span>
              </div>
              <div className="ssj-ficha-retomar-acoes">
                <button
                  type="button"
                  onClick={() => {
                    if (chaveRascunho) localStorage.removeItem(chaveRascunho);
                    setRascunhoEncontrado(null);
                    setRascunhoPendente(null);
                  }}
                  className="ssj-ia-btn-3"
                >
                  Começar do zero
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, ...(rascunhoPendente.dados as typeof prev) }));
                    setStep(rascunhoPendente.etapa);
                    setRascunhoEncontrado(null);
                    setRascunhoPendente(null);
                  }}
                  className="ssj-ia-btn"
                  style={{ background: primaryColor }}
                >
                  Continuar de onde parei
                </button>
              </div>
            </div>
          )}

          {/* Conteúdo do Formulário */}
          <div className="ssj-ficha-conteudo">

          {avisoFicha && (
            <div
              className={`ssj-ficha-aviso ${avisoFicha.tipo === 'erro' ? 'e-erro' : ''}`}
              role="status"
              style={avisoFicha.tipo === 'ok' ? { borderColor: primaryColor, color: primaryColor } : undefined}
            >
              <CheckCircle2 size={16} />
              <span>{avisoFicha.texto}</span>
              <button type="button" onClick={() => setAvisoFicha(null)} aria-label="Fechar aviso">✕</button>
            </div>
          )}

          
          {/* ETAPA 1: IDENTIFICAÇÃO & DOCUMENTOS */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-rule-2)', paddingBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Etapa 1: Dados Pessoais & Documentação Oficial
              </h3>

              <AutoPreenchimento
                tenantSlug={tenantSlug ?? ''}
                cor={primaryColor}
                valoresAtuais={formData as unknown as Record<string, unknown>}
                onAplicar={aplicarExtracao}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                    <div>
                      <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Nome Completo (conforme RG) · 氏名</label>
                      <input
                        type="text"
                        value={formData.nomeCompleto}
                        onChange={e => setFormData({ ...formData, nomeCompleto: e.target.value })}
                        placeholder="MARINA TANAKA OLIVEIRA"
                        className="ssj-input"
                        style={{ width: '100%', textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ width: '160px', flexShrink: 0 }}>
                    <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Foto Recente · 写真</label>
                    <div style={{
                      width: '100%',
                      height: '180px',
                      borderRadius: '8px',
                      border: '2px dashed var(--ssj-rule-3)',
                      background: 'var(--ssj-surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}>
                      {formData.fotoUrl ? (
                        <img src={formData.fotoUrl} alt="Foto Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px' }}>
                          <User size={32} color="var(--ssj-muted)" style={{ marginBottom: '8px' }} />
                          <span style={{ fontSize: '12px', color: 'var(--ssj-muted)', display: 'block', lineHeight: 1.2 }}>Clique para<br/>fazer upload</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormData({ ...formData, fotoUrl: url });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Data de Nascimento · 生年月日</label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })}
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                  {formData.dataNascimento && !validarNascimento(formData.dataNascimento) && (
                    <span style={{ fontSize: '12px', color: 'var(--ssj-verde)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      Idade Calculada: {calcularIdade(formData.dataNascimento)} anos
                    </span>
                  )}
                  <MsgCampo erro={validarNascimento(formData.dataNascimento)} />
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Sexo · 性別</label>
                  <div className="ssj-opts" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="ssj-opt"
                      aria-pressed={formData.sexo === 'M'}
                      onClick={() => setFormData({ ...formData, sexo: 'M' })}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      className="ssj-opt"
                      aria-pressed={formData.sexo === 'F'}
                      onClick={() => setFormData({ ...formData, sexo: 'F' })}
                    >
                      Feminino
                    </button>
                  </div>
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Nacionalidade · 国籍</label>
                  <div className="ssj-opts" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="ssj-opt"
                      aria-pressed={formData.nacionalidade === 'BRAS'}
                      onClick={() => setFormData({ ...formData, nacionalidade: 'BRAS' })}
                    >
                      Brasileira (BRAS)
                    </button>
                    <button
                      type="button"
                      className="ssj-opt"
                      aria-pressed={formData.nacionalidade === 'JAP'}
                      onClick={() => setFormData({ ...formData, nacionalidade: 'JAP' })}
                    >
                      Japonesa (JAP)
                    </button>
                    <button
                      type="button"
                      className="ssj-opt"
                      aria-pressed={formData.nacionalidade === 'Outra'}
                      onClick={() => setFormData({ ...formData, nacionalidade: 'Outra' })}
                    >
                      Outra
                    </button>
                  </div>
                </div>

                {formData.nacionalidade === 'BRAS' && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>É descendente de japonês? · 日系人ですか</label>
                    <div className="ssj-opts" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { val: 'nao_descendente', label: 'Não' },
                        { val: 'nissei', label: 'Nissei (2ª Ger.)' },
                        { val: 'sansei', label: 'Sansei (3ª Ger.)' },
                        { val: 'yonsei', label: 'Yonsei (4ª Ger.)' },
                        { val: 'conjuge', label: 'Cônjuge de Nikkei' }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          className="ssj-opt"
                          aria-pressed={formData.geracaoNikkei === opt.val}
                          onClick={() => setFormData({ ...formData, geracaoNikkei: opt.val })}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--ssj-muted)', marginTop: '6px', display: 'block' }}>
                      Pergunta obrigatória — define a elegibilidade do tipo de visto para o Japão.
                    </span>
                  </div>
                )}

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>CPF</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="ssj-input"
                    aria-invalid={!!validarCpf(formData.cpf)}
                    style={{ width: '100%', fontFamily: 'var(--ssj-font-mono)' }}
                  />
                  <MsgCampo erro={validarCpf(formData.cpf)} />
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Passaporte Nº + Validade · パスポート</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="FK884213"
                      value={formData.passaporte}
                      onChange={e => setFormData({ ...formData, passaporte: e.target.value })}
                      className="ssj-input"
                      style={{ fontFamily: 'var(--ssj-font-mono)' }}
                    />
                    <input
                      type="date"
                      value={formData.passaporteValidade}
                      onChange={e => setFormData({ ...formData, passaporteValidade: e.target.value })}
                      className="ssj-input"
                    />
                  </div>
                  <MsgCampo erro={validarValidadeDocumento(formData.passaporteValidade, 'Passaporte')} tom="aviso" />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '20px', background: 'var(--ssj-paper)', borderRadius: '12px', border: '1px dashed var(--ssj-rule)' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="var(--ssj-indigo)" />
                    Upload de Documentos (Opcional agora, obrigatório na contratação) · 書類アップロード
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* RG/CPF */}
                    <div>
                      <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>RG / CPF (Frente e Verso)</label>
                      <label style={{
                        padding: '10px 16px', background: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-rule)',
                        borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        justifyContent: 'center', transition: 'all 0.2s'
                      }}>
                        <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={() => alert('Upload de RG/CPF...')} />
                        <span style={{ fontSize: '16px' }}>+</span> Anexar Arquivo
                      </label>
                    </div>

                    {/* Passaporte */}
                    <div>
                      <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Página do Passaporte</label>
                      <label style={{
                        padding: '10px 16px', background: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-rule)',
                        borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        justifyContent: 'center', transition: 'all 0.2s'
                      }}>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={() => alert('Upload de Passaporte...')} />
                        <span style={{ fontSize: '16px' }}>+</span> Anexar Arquivo
                      </label>
                    </div>

                    {/* Currículo/Histórico */}
                    <div>
                      <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Outros Docs (Koseki, etc)</label>
                      <label style={{
                        padding: '10px 16px', background: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-rule)',
                        borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        justifyContent: 'center', transition: 'all 0.2s'
                      }}>
                        <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={() => alert('Upload de outros documentos...')} />
                        <span style={{ fontSize: '16px' }}>+</span> Anexar Arquivos
                      </label>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--ssj-muted)', marginTop: '12px', textAlign: 'center' }}>
                    Tamanho máximo 5MB por arquivo. Aceitamos JPG, PNG ou PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: BIOMETRIA PARA EPIS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-border)', paddingBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} /> Etapa 2: Biometria para EPIs & Uniformes de Fábrica no Japão
              </h3>
              <p className="ssj-text-muted" style={{ fontSize: '13px' }}>
                Essenciais na planilha FUJIARTE para encomenda antecipada do calçado de segurança e macacão industrial.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Altura (cm) · 身長</label>
                  <input
                    type="number"
                    value={formData.alturaCm}
                    onChange={e => setFormData({ ...formData, alturaCm: e.target.value })}
                    placeholder="Ex: 175"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Peso (kg) · 体重</label>
                  <input
                    type="number"
                    value={formData.pesoKg}
                    onChange={e => setFormData({ ...formData, pesoKg: e.target.value })}
                    placeholder="Ex: 72"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>


                <div style={{ padding: '16px', background: 'rgba(232,176,74,0.1)', borderRadius: '10px', border: '1px solid var(--ssj-ambar)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--ssj-ambar)' }}>
                    Cintura (cm) · ウエスト
                  </label>
                  <input
                    type="number"
                    value={formData.cinturaCm}
                    onChange={e => setFormData({ ...formData, cinturaCm: e.target.value })}
                    placeholder="Ex: 85"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--ssj-muted)', marginTop: '4px', display: 'block' }}>Para confecção de calça/uniforme industrial</span>
                </div>

                <div style={{ padding: '16px', background: 'rgba(31,157,87,0.1)', borderRadius: '10px', border: '1px solid var(--ssj-verde)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--ssj-verde)' }}>
                    Tamanho do Pé (cm) · 靴のサイズ
                  </label>
                  <input
                    type="number"
                    value={formData.peCm}
                    onChange={e => setFormData({ ...formData, peCm: e.target.value })}
                    placeholder="Ex: 26.5"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--ssj-muted)', marginTop: '4px', display: 'block' }}>Padrão japonês em centímetros para bota de segurança</span>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: ENDEREÇO & FAMÍLIA */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-rule-2)', paddingBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} /> Etapa 3: Endereço & Contatos de Emergência
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>CEP (Busca automática via ViaCEP)</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={e => buscarViaCep(maskCEP(e.target.value))}
                    placeholder="07064-020"
                    maxLength={9}
                    className="ssj-input"
                    style={{ width: '100%', fontFamily: 'var(--ssj-font-mono)' }}
                  />
                  {cepFeedback && (
                    <span style={{
                      fontSize: '12px',
                      color: cepFeedback.startsWith('✓') ? 'var(--ssj-verde)' : 'var(--ssj-muted)',
                      fontWeight: 600,
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {cepFeedback}
                    </span>
                  )}
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Celular / WhatsApp · 携帯電話</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={formData.celular}
                    onChange={e => setFormData({ ...formData, celular: maskPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="ssj-input"
                    aria-invalid={!!validarCelular(formData.celular)}
                    style={{ width: '100%' }}
                  />
                  <MsgCampo erro={validarCelular(formData.celular)} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Endereço Atual no Brasil (Rua / Número / Complemento) · 現住所</label>
                  <input
                    type="text"
                    value={formData.logradouro}
                    onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                    placeholder="Rua Gabriel Vasconcelos, 265"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Bairro · 地区</label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Vila Rosália"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Cidade / UF · 都市 / 州</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Guarulhos"
                      value={formData.cidade}
                      onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                      className="ssj-input"
                    />
                    <input
                      type="text"
                      placeholder="SP"
                      value={formData.estado}
                      onChange={e => setFormData({ ...formData, estado: e.target.value })}
                      className="ssj-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Contato de Emergência no Japão (se houver) · 日本の緊急連絡先</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Nome do Parente"
                      value={formData.emergenciaNome}
                      onChange={e => setFormData({ ...formData, emergenciaNome: e.target.value })}
                      className="ssj-input"
                    />
                    <input
                      type="text"
                      placeholder="Província (ex: Aichi-ken)"
                      value={formData.emergenciaProvincia}
                      onChange={e => setFormData({ ...formData, emergenciaProvincia: e.target.value })}
                      className="ssj-input"
                    />
                    <input
                      type="text"
                      placeholder="Telefone no Japão"
                      value={formData.emergenciaTel}
                      onChange={e => setFormData({ ...formData, emergenciaTel: e.target.value })}
                      className="ssj-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: HISTÓRICO LABORAL NO JAPÃO (1:N) */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} /> Etapa 4: Histórico Laboral no Japão (1:N entradas)
                </h3>
                <button onClick={handleAddExpJapao} className="ssj-btn ssj-btn--pri ssj-btn--sm">
                  + Adicionar Experiência Japão
                </button>
              </div>

              {formData.experienciasJapao.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--ssj-paper)', borderRadius: '10px', border: '1px dashed var(--ssj-border)' }}>
                  <p className="ssj-text-muted" style={{ fontSize: '13px' }}>Nenhuma experiência cadastrada no Japão. Clique acima para adicionar.</p>
                </div>
              ) : (
                formData.experienciasJapao.map((exp, i) => (
                  <div key={i} className="ssj-in" style={{ padding: '20px', background: 'var(--ssj-surface)', borderRadius: '12px', border: '1px solid var(--ssj-rule)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ssj-indigo)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Experiência {i + 1}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Nome da Fábrica · 工場名</label>
                        <input type="text" value={exp.fabrica} onChange={(e) => { const newExp = [...formData.experienciasJapao]; newExp[i].fabrica = e.target.value; setFormData({...formData, experienciasJapao: newExp}) }} className="ssj-input" placeholder="Ex: Toyota Supplier" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Empreiteira · 派遣会社</label>
                        <input type="text" value={exp.empreiteira} onChange={(e) => { const newExp = [...formData.experienciasJapao]; newExp[i].empreiteira = e.target.value; setFormData({...formData, experienciasJapao: newExp}) }} className="ssj-input" placeholder="Ex: FUJIARTE" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Província / Cidade · 県 / 市</label>
                        <input type="text" value={exp.provincia} onChange={(e) => { const newExp = [...formData.experienciasJapao]; newExp[i].provincia = e.target.value; setFormData({...formData, experienciasJapao: newExp}) }} className="ssj-input" placeholder="Ex: Aichi-ken, Toyota-shi" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Período Trabalhado (Ano/Mês) · 期間</label>
                        <input type="text" value={exp.periodo} onChange={(e) => { const newExp = [...formData.experienciasJapao]; newExp[i].periodo = e.target.value; setFormData({...formData, experienciasJapao: newExp}) }} className="ssj-input" placeholder="Ex: 2021/04 - 2023/10" style={{ width: '100%' }} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Motivo da Saída / Tipo de Contrato · 退社理由</label>
                        <input type="text" value={exp.motivoSaida} onChange={(e) => { const newExp = [...formData.experienciasJapao]; newExp[i].motivoSaida = e.target.value; setFormData({...formData, experienciasJapao: newExp}) }} className="ssj-input" placeholder="Ex: Fim de contrato" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ETAPA 5: ENQUETE BLOCO A & TATUAGENS */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-border)', paddingBottom: '10px', fontSize: '18px' }}>
                Etapa 5: Enquete Bloco A — Aptidão & Tatuagens (11 Regiões)
              </h3>

              <div>
                <label style={{ fontSize: '15px', fontWeight: 700, display: 'block', marginBottom: '14px', color: 'var(--ssj-text)' }}>
                  Possui Tatuagem? · 入れ墨はありますか？
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer', padding: '12px 20px', background: formData.temTatuagem === 'nao' ? 'rgba(0,0,0,0.06)' : 'var(--ssj-surface)', border: formData.temTatuagem === 'nao' ? '2px solid var(--ssj-text)' : '2px solid var(--ssj-rule)', borderRadius: '10px', transition: 'all 0.15s' }}>
                    <input type="radio" name="tat" value="nao" checked={formData.temTatuagem === 'nao'} onChange={() => setFormData({ ...formData, temTatuagem: 'nao' })} style={{ width: '18px', height: '18px', accentColor: 'var(--ssj-shu)' }} />
                    Não possuo tatuagem
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer', padding: '12px 20px', background: formData.temTatuagem === 'sim' ? 'rgba(196,69,43,0.08)' : 'var(--ssj-surface)', border: formData.temTatuagem === 'sim' ? '2px solid var(--ssj-shu)' : '2px solid var(--ssj-rule)', borderRadius: '10px', transition: 'all 0.15s' }}>
                    <input type="radio" name="tat" value="sim" checked={formData.temTatuagem === 'sim'} onChange={() => setFormData({ ...formData, temTatuagem: 'sim' })} style={{ width: '18px', height: '18px', accentColor: 'var(--ssj-shu)' }} />
                    Sim, possuo tatuagem
                  </label>
                </div>

                {formData.temTatuagem === 'sim' && (
                  <div style={{ borderRadius: '12px', border: '1px solid var(--ssj-shu)', overflow: 'hidden' }}>
                    
                    {/* Header */}
                    <div style={{ padding: '14px 20px', background: 'rgba(196,69,43,0.08)', borderBottom: '1px solid rgba(196,69,43,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ssj-shu)' }}>
                        Localização das Tatuagens · 入れ墨の位置
                      </span>
                      {formData.tatuagensRegioes.length > 0 && (
                        <span style={{ fontSize: '13px', background: 'var(--ssj-shu)', color: '#fff', borderRadius: '20px', padding: '4px 12px', fontWeight: 700 }}>
                          {formData.tatuagensRegioes.length} região(ões)
                        </span>
                      )}
                    </div>

                    {/* Avatar + Pills */}
                    <div style={{ padding: '20px', background: 'var(--ssj-surface)' }}>
                      
                      {/* ===== AVATARES ===== */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        
                        {/* FRENTE */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ssj-muted)' }}>前面 · Frente</span>
                          <svg viewBox="0 0 100 260" width="160" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}>
                            <defs>
                              <linearGradient id="skinF" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f5cba7" />
                                <stop offset="100%" stopColor="#e8a87c" />
                              </linearGradient>
                              <linearGradient id="skinRed" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#e74c3c" />
                                <stop offset="100%" stopColor="#c0392b" />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                            </defs>

                            {/* Cabeça */}
                            <ellipse cx="50" cy="22" rx="16" ry="19"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Rosto')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Rosto')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Rosto')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Rosto/Frente')}>
                              <title>Rosto / Cabeça</title>
                            </ellipse>
                            {/* Face detail */}
                            <ellipse cx="44" cy="20" rx="2.5" ry="3" fill="rgba(0,0,0,0.1)" />
                            <ellipse cx="56" cy="20" rx="2.5" ry="3" fill="rgba(0,0,0,0.1)" />
                            <path d="M44 27 Q50 31 56 27" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />

                            {/* Pescoço */}
                            <rect x="44" y="40" width="12" height="10" rx="3"
                              fill={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Nuca/Pescoço')}>
                              <title>Pescoço</title>
                            </rect>

                            {/* Ombro Esq */}
                            <ellipse cx="24" cy="58" rx="10" ry="7"
                              fill={formData.tatuagensRegioes.includes('Ombro Esq.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Ombro Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Ombro Esq.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Ombro Esq.')}>
                              <title>Ombro Esquerdo</title>
                            </ellipse>
                            {/* Ombro Dir */}
                            <ellipse cx="76" cy="58" rx="10" ry="7"
                              fill={formData.tatuagensRegioes.includes('Ombro Dir.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Ombro Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Ombro Dir.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Ombro Dir.')}>
                              <title>Ombro Direito</title>
                            </ellipse>

                            {/* Peito */}
                            <path d="M34 50 Q50 45 66 50 L68 95 Q50 100 32 95 Z"
                              fill={formData.tatuagensRegioes.includes('Peito (Frontal)') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Peito (Frontal)') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Peito (Frontal)') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Peito (Frontal)')}>
                              <title>Peito Frontal</title>
                            </path>

                            {/* Abdômen */}
                            <path d="M32 95 Q50 100 68 95 L66 132 Q50 136 34 132 Z"
                              fill={formData.tatuagensRegioes.includes('Abdômen') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Abdômen') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Abdômen') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Abdômen')}>
                              <title>Abdômen</title>
                            </path>
                            {/* Linha umbigo */}
                            <line x1="50" y1="100" x2="50" y2="130" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

                            {/* Braço Esq */}
                            <path d="M24 65 L14 65 L10 118 L20 120 L28 68 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Frontal')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Frontal')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Frontal')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Braço Esq. Frontal')}>
                              <title>Braço Esq. Frontal</title>
                            </path>
                            {/* Braço Dir */}
                            <path d="M76 65 L86 65 L90 118 L80 120 L72 68 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Frontal')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Frontal')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Frontal')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Braço Dir. Frontal')}>
                              <title>Braço Dir. Frontal</title>
                            </path>

                            {/* Mão Esq */}
                            <ellipse cx="8" cy="126" rx="6" ry="9"
                              fill={formData.tatuagensRegioes.includes('Mão Esq.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Mão Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Mão Esq.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Mão Esq.')}>
                              <title>Mão Esquerda</title>
                            </ellipse>
                            {/* Mão Dir */}
                            <ellipse cx="92" cy="126" rx="6" ry="9"
                              fill={formData.tatuagensRegioes.includes('Mão Dir.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Mão Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Mão Dir.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Mão Dir.')}>
                              <title>Mão Direita</title>
                            </ellipse>

                            {/* Coxa Esq */}
                            <path d="M34 134 L48 134 L50 182 L33 180 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Coxa Esq.')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Coxa Esq.')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Coxa Esq.')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Coxa Esq. Frontal')}>
                              <title>Coxa Esq. Frontal</title>
                            </path>
                            {/* Coxa Dir */}
                            <path d="M66 134 L52 134 L50 182 L67 180 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Coxa Dir.')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Coxa Dir.')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Coxa Dir.')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Coxa Dir. Frontal')}>
                              <title>Coxa Dir. Frontal</title>
                            </path>

                            {/* Perna Esq */}
                            <path d="M33 182 L50 183 L48 228 L33 226 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Frontal')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Frontal')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Frontal')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Perna Esq. Frontal')}>
                              <title>Perna Esq. Frontal</title>
                            </path>
                            {/* Perna Dir */}
                            <path d="M67 182 L50 183 L52 228 L67 226 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Frontal')) ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Frontal')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Frontal')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Perna Dir. Frontal')}>
                              <title>Perna Dir. Frontal</title>
                            </path>

                            {/* Pé Esq */}
                            <ellipse cx="40" cy="240" rx="10" ry="6"
                              fill={formData.tatuagensRegioes.includes('Pé Esq.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Pé Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Pé Esq.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Pé Esq.')}>
                              <title>Pé Esquerdo</title>
                            </ellipse>
                            {/* Pé Dir */}
                            <ellipse cx="60" cy="240" rx="10" ry="6"
                              fill={formData.tatuagensRegioes.includes('Pé Dir.') ? 'url(#skinRed)' : 'url(#skinF)'}
                              stroke={formData.tatuagensRegioes.includes('Pé Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Pé Dir.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Pé Dir.')}>
                              <title>Pé Direito</title>
                            </ellipse>
                          </svg>
                        </div>

                        {/* VERSO */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ssj-muted)' }}>背面 · Verso</span>
                          <svg viewBox="0 0 100 260" width="160" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}>
                            <defs>
                              <linearGradient id="skinB" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#e8a87c" />
                                <stop offset="100%" stopColor="#d4956a" />
                              </linearGradient>
                            </defs>
                            {/* Cabeça verso */}
                            <ellipse cx="50" cy="22" rx="16" ry="19"
                              fill={formData.tatuagensRegioes.includes('Cabeça/Topo') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Cabeça/Topo') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Cabeça/Topo') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Cabeça/Topo')}>
                              <title>Cabeça / Topo</title>
                            </ellipse>
                            {/* Nuca */}
                            <rect x="44" y="40" width="12" height="10" rx="3"
                              fill={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Nuca/Pescoço') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Nuca/Pescoço')}>
                              <title>Nuca / Pescoço</title>
                            </rect>
                            {/* Ombros verso */}
                            <ellipse cx="24" cy="58" rx="10" ry="7"
                              fill={formData.tatuagensRegioes.includes('Ombro Esq.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Ombro Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Ombro Esq.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Ombro Esq.')}>
                              <title>Ombro Esq. (Verso)</title>
                            </ellipse>
                            <ellipse cx="76" cy="58" rx="10" ry="7"
                              fill={formData.tatuagensRegioes.includes('Ombro Dir.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Ombro Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Ombro Dir.') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Ombro Dir.')}>
                              <title>Ombro Dir. (Verso)</title>
                            </ellipse>
                            {/* Costas */}
                            <path d="M34 50 Q50 45 66 50 L68 132 Q50 136 32 132 Z"
                              fill={formData.tatuagensRegioes.includes('Costas (Posterior)') || formData.tatuagensRegioes.includes('Cintura/Lombar') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Costas (Posterior)') || formData.tatuagensRegioes.includes('Cintura/Lombar') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Costas (Posterior)') || formData.tatuagensRegioes.includes('Cintura/Lombar') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Costas (Posterior)')}>
                              <title>Costas / Lombar</title>
                            </path>
                            {/* Coluna detail */}
                            <line x1="50" y1="52" x2="50" y2="130" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
                            {/* Braço Esq Posterior */}
                            <path d="M24 65 L14 65 L10 118 L20 120 L28 68 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Posterior')) ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Posterior')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Braço Esq.') && r.includes('Posterior')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Braço Esq. Posterior')}>
                              <title>Braço Esq. Posterior</title>
                            </path>
                            <path d="M76 65 L86 65 L90 118 L80 120 L72 68 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Posterior')) ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Posterior')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Braço Dir.') && r.includes('Posterior')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Braço Dir. Posterior')}>
                              <title>Braço Dir. Posterior</title>
                            </path>
                            <ellipse cx="8" cy="126" rx="6" ry="9"
                              fill={formData.tatuagensRegioes.includes('Mão Esq.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Mão Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Mão Esq.')}>
                              <title>Mão Esq.</title>
                            </ellipse>
                            <ellipse cx="92" cy="126" rx="6" ry="9"
                              fill={formData.tatuagensRegioes.includes('Mão Dir.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Mão Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Mão Dir.')}>
                              <title>Mão Dir.</title>
                            </ellipse>
                            {/* Coxa Posterior */}
                            <path d="M34 134 L48 134 L50 182 L33 180 Z"
                              fill={formData.tatuagensRegioes.includes('Coxa Esq. Posterior') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Coxa Esq. Posterior') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Coxa Esq. Posterior') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Coxa Esq. Posterior')}>
                              <title>Coxa Esq. Posterior</title>
                            </path>
                            <path d="M66 134 L52 134 L50 182 L67 180 Z"
                              fill={formData.tatuagensRegioes.includes('Coxa Dir. Posterior') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Coxa Dir. Posterior') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.includes('Coxa Dir. Posterior') ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Coxa Dir. Posterior')}>
                              <title>Coxa Dir. Posterior</title>
                            </path>
                            {/* Perna Posterior */}
                            <path d="M33 182 L50 183 L48 228 L33 226 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Posterior')) ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Posterior')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Perna Esq.') && r.includes('Posterior')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Perna Esq. Posterior')}>
                              <title>Perna Esq. Posterior</title>
                            </path>
                            <path d="M67 182 L50 183 L52 228 L67 226 Z"
                              fill={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Posterior')) ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Posterior')) ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" filter={formData.tatuagensRegioes.some(r => r.includes('Perna Dir.') && r.includes('Posterior')) ? 'url(#glow)' : 'none'}
                              style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Perna Dir. Posterior')}>
                              <title>Perna Dir. Posterior</title>
                            </path>
                            <ellipse cx="40" cy="240" rx="10" ry="6"
                              fill={formData.tatuagensRegioes.includes('Pé Esq.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Pé Esq.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Pé Esq.')}>
                              <title>Pé Esq.</title>
                            </ellipse>
                            <ellipse cx="60" cy="240" rx="10" ry="6"
                              fill={formData.tatuagensRegioes.includes('Pé Dir.') ? 'url(#skinRed)' : 'url(#skinB)'}
                              stroke={formData.tatuagensRegioes.includes('Pé Dir.') ? '#c0392b' : '#d4956a'} strokeWidth="1"
                              cursor="pointer" style={{ transition: 'all 0.25s' }} onClick={() => handleTatuagemToggle('Pé Dir.')}>
                              <title>Pé Dir.</title>
                            </ellipse>
                          </svg>
                        </div>
                      </div>

                      {/* Resumo das regiões selecionadas */}
                      {formData.tatuagensRegioes.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ssj-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
                          Clique nas regiões do avatar acima para marcar onde há tatuagem
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'rgba(196,69,43,0.04)', borderRadius: '8px', border: '1px solid rgba(196,69,43,0.15)' }}>
                          {formData.tatuagensRegioes.map(op => (
                            <span key={op} onClick={() => handleTatuagemToggle(op)} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '6px 14px', background: '#c4452b', color: '#fff',
                              borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer', userSelect: 'none', transition: 'opacity 0.15s'
                            }}>
                              {op} <span style={{ opacity: 0.7, fontSize: '11px' }}>✕</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Upload */}
                      {formData.tatuagensRegioes.length > 0 && (
                        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(196,69,43,0.06)', borderRadius: '8px', border: '1px dashed #c4452b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#c4452b' }}>
                            📎 Fotos das Tatuagens · 入れ墨の写真 <span style={{ fontWeight: 400, color: 'var(--ssj-muted)', fontSize: '11px' }}>(não inclua locais íntimos)</span>
                          </span>
                          <label style={{ padding: '7px 16px', background: '#c4452b', color: '#fff', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                            <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={() => alert('Upload...')} />
                            + Adicionar Fotos
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="ssj-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '16px', background: 'rgba(120,80,220,0.1)', borderRadius: '10px', border: '1px solid #7850dc' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#7850dc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} /> Etapa 6: Enquete de Saúde (Bloco B 🔒 Dado Pessoal Sensível LGPD Art. 11)
                </h3>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--ssj-text)' }}>
                  Estes dados são armazenados isoladamente com criptografia de coluna (`pgcrypto`). NUNCA são pré-preenchidos por Inteligência Artificial.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                
                <div style={{ background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Tem problema de visão? (Usa óculos ou lentes?) · 視力に問題はありますか？(メガネやコンタクトレンズを使用していますか？)</label>
                  <div className="ssj-opts">
                    <button type="button" className="ssj-opt" aria-pressed={formData.usaOculos === 'nao'} onClick={() => setFormData({ ...formData, usaOculos: 'nao' })}>Não</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.usaOculos === 'sim'} onClick={() => setFormData({ ...formData, usaOculos: 'sim' })}>Sim</button>
                  </div>
                </div>

                <div style={{ background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Tem daltonismo? · 色覚異常はありますか？</label>
                  <div className="ssj-opts">
                    <button type="button" className="ssj-opt" aria-pressed={formData.daltonismo === 'nao'} onClick={() => setFormData({ ...formData, daltonismo: 'nao' })}>Não</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.daltonismo === 'sim'} onClick={() => setFormData({ ...formData, daltonismo: 'sim' })}>Sim</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.daltonismo === 'nao_sei'} onClick={() => setFormData({ ...formData, daltonismo: 'nao_sei' })}>Não sei</button>
                  </div>
                </div>

                <div style={{ background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Fuma cigarro? · タバコを吸いますか？</label>
                  <div className="ssj-opts">
                    <button type="button" className="ssj-opt" aria-pressed={formData.fuma === 'nao'} onClick={() => setFormData({ ...formData, fuma: 'nao' })}>Não</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.fuma === 'sim'} onClick={() => setFormData({ ...formData, fuma: 'sim' })}>Sim</button>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Sofreu algum acidente ou teve alguma doença grave ou operação? · 過去に大きな病気・手術・ケガはありますか？</label>
                  <div className="ssj-opts" style={{ marginBottom: '12px' }}>
                    <button type="button" className="ssj-opt" aria-pressed={formData.cirurgiasPrevias === 'nao'} onClick={() => setFormData({ ...formData, cirurgiasPrevias: 'nao' })}>Não</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.cirurgiasPrevias !== 'nao' && formData.cirurgiasPrevias !== ''} onClick={() => setFormData({ ...formData, cirurgiasPrevias: 'sim_especificar' })}>Sim</button>
                  </div>
                  {formData.cirurgiasPrevias !== 'nao' && formData.cirurgiasPrevias !== '' && (
                    <input type="text" className="ssj-input ssj-in" placeholder="Especifique: Qual? Quando? Deixou sequela?" value={formData.cirurgiasPrevias === 'sim_especificar' ? '' : formData.cirurgiasPrevias} onChange={e => setFormData({ ...formData, cirurgiasPrevias: e.target.value })} style={{ width: '100%' }} />
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1', background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Sofre de alguma dor crônica? · 慢性的な痛みはありますか？</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {['Dor lombar/coluna', 'Mão', 'Joelho', 'Escoliose', 'Hérnia', 'Nervo ciático', 'Outros'].map(dor => (
                      <label key={dor} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" checked={formData.doresCronicas.includes(dor)} onChange={() => {
                          const novasDores = formData.doresCronicas.includes(dor) ? formData.doresCronicas.filter(d => d !== dor) : [...formData.doresCronicas, dor];
                          setFormData({ ...formData, doresCronicas: novasDores });
                        }} />
                        {dor}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / -1', background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Tem ou já teve depressão, esquizofrenia ou outra questão mental? · うつ病、統合失調症などの精神疾患にかかったことがありますか？</label>
                  <div className="ssj-opts">
                    <button type="button" className="ssj-opt" aria-pressed={formData.questaoMentalPsiquiatrica === 'nao'} onClick={() => setFormData({ ...formData, questaoMentalPsiquiatrica: 'nao' })}>Não</button>
                    <button type="button" className="ssj-opt" aria-pressed={formData.questaoMentalPsiquiatrica === 'sim'} onClick={() => setFormData({ ...formData, questaoMentalPsiquiatrica: 'sim' })}>Sim</button>
                  </div>
                </div>

                <div style={{ background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Está tomando algum medicamento? · 薬を飲んでいますか？</label>
                  <input type="text" className="ssj-input" placeholder="Se sim, qual?" value={formData.medicacaoDiaria} onChange={e => setFormData({ ...formData, medicacaoDiaria: e.target.value })} style={{ width: '100%' }} />
                </div>

                <div style={{ background: 'var(--ssj-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ssj-rule)' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '10px' }}>Alergia (alimento, medicamento, produtos)? · アレルギー（食品、薬、製品など）はありますか？</label>
                  <input type="text" className="ssj-input" placeholder="Se sim, qual?" value={formData.alergias} onChange={e => setFormData({ ...formData, alergias: e.target.value })} style={{ width: '100%' }} />
                </div>

              </div>

              {/* Consentimento LGPD Destacado */}
              <div style={{ padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.consentimentoSaudeLGPD}
                    onChange={e => setFormData({ ...formData, consentimentoSaudeLGPD: e.target.checked })}
                    style={{ marginTop: '3px' }}
                  />
                  <span style={{ fontSize: '13px', lineHeight: 1.4 }}>
                    <strong>Termo de Consentimento LGPD Art. 11 (Saúde):</strong> Autorizo a FUJIARTE e o SelectSys Jobs a processarem exclusivamente para fins de aptidão ocupacional e medicina do trabalho os meus dados de saúde informados nesta etapa.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ETAPA 7: REVISÃO & EXPORTAÇÃO EXCEL FUJIARTE */}
          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Hanko estado="aprovado" texto="済" size={64} title="Ficha Validada" />
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: '20px' }}>Sua Ficha de Cadastro está Pronta! · 登録フォームが完了しました</h3>
              <p className="ssj-text-muted" style={{ fontSize: '13px' }}>
                Todos os dados foram preenchidos e validados. Clique abaixo para enviar sua candidatura para análise da nossa equipe.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="ssj-btn ssj-btn--pri"
                  style={{ padding: '12px 32px', fontSize: '16px', fontWeight: 600, width: '100%', maxWidth: '320px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  <CheckCircle2 size={20} style={{ marginRight: '8px' }} /> {isSubmitting ? 'Submetendo...' : 'Enviar Candidatura · 送信する'}
                </button>
              </div>
            </div>
          )}

          {/* NAVEGAÇÃO DOS PASSOS E PROGRESSO */}
          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--ssj-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="ssj-btn ssj-btn--ghost"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--ssj-text)', fontWeight: 600, display: 'block' }}>
                  Etapa {step} de 7
                </span>
              </div>

              <button
                onClick={() => setStep(s => Math.min(7, s + 1))}
                disabled={step === 7}
                className="ssj-btn ssj-btn--pri"
              >
                Próxima <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Barra de Progresso Final */}
            <div style={{ width: '100%', height: '4px', background: 'var(--ssj-rule-2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(step / 7) * 100}%`, 
                height: '100%', 
                background: 'var(--ssj-pri)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
  );
}
/* ═══════════════════════════════════════════════════════════════════════════
   MENSAGEM DE CAMPO
   ---------------------------------------------------------------------------
   Um erro de CPF precisa aparecer colado no CPF, não num alert() no fim da
   ficha — a essa altura o candidato já não sabe qual dos 130 campos falhou.

   `tom="aviso"` é para o que não impede o envio mas o candidato precisa saber
   (passaporte vencendo, por exemplo).
   ═════════════════════════════════════════════════════════════════════════ */
function MsgCampo({ erro, tom = 'erro' }: { erro: string | null; tom?: 'erro' | 'aviso' }) {
  if (!erro) return null;
  return (
    <span className={`ssj-campo-msg ${tom === 'aviso' ? 'e-aviso' : ''}`} role="alert">
      {erro}
    </span>
  );
}
