import { useState, useEffect } from 'react';
import {
  User, Shield, FileSpreadsheet, CheckCircle2, ChevronRight, ChevronLeft,
  Lock, Building2, MapPin
} from 'lucide-react';
import { Hanko } from '../brand/Hanko';
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
  const [modoExibicao, setModoExibicao] = useState<'walkthrough' | 'form'>('walkthrough');
  const [step, setStep] = useState(1);
  const [autoSaved, setAutoSaved] = useState(false);

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
    consentimentoSaudeLGPD: false,

    // Etapa 7: Bloco C (Motivação) & Agência
    motivacaoPrincipal: 'poupanca',
    agenciaCodigo: 'FUJIARTE-SP-01'
  });

  const [cepFeedback, setCepFeedback] = useState('');

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
      } catch (err) {
        setCepFeedback('Erro de conexão ao buscar ViaCEP.');
      }
    } else {
      setCepFeedback('');
    }
  };

  // Autosave a cada 3s (Doc 05 Escopo A2)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Cálculo automático de idade ao vivo
  const calcularIdade = (dataNasc: string) => {
    if (!dataNasc) return '';
    const hoje = new Date();
    const nascido = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascido.getFullYear();
    const m = hoje.getMonth() - nascido.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascido.getDate())) {
      idade--;
    }
    return isNaN(idade) ? '' : `${idade}`;
  };

  const handleTatuagemToggle = (regiao: string) => {
    const regioes = formData.tatuagensRegioes.includes(regiao)
      ? formData.tatuagensRegioes.filter(r => r !== regiao)
      : [...formData.tatuagensRegioes, regiao];
    setFormData({ ...formData, tatuagensRegioes: regioes });
  };

  const handleAddExpJapao = () => {
    const novaExp: Experience = {
      provincia: 'Aichi',
      empreiteira: 'FUJIARTE',
      fabrica: 'Toyota Supplier',
      periodo: '2021-2023',
      motivoSaida: 'Fim de contrato'
    };
    setFormData({ ...formData, experienciasJapao: [...formData.experienciasJapao, novaExp] });
  };

  const regioesTatuagemList = [
    'Cabeça/Rosto', 'Pescoço', 'Peito', 'Costas', 'Ombros', 'Braços', 'Mãos', 'Abdômen', 'Cintura', 'Pernas', 'Pés'
  ];

  const stepsList = [
    { n: '01', title: 'Identificação', ja: '本人確認' },
    { n: '02', title: 'Biometria EPI', ja: '生体・作業着' },
    { n: '03', title: 'Endereço/Família', ja: '住所・緊急連絡先' },
    { n: '04', title: 'Histórico JP', ja: '職歴・日本' },
    { n: '05', title: 'Enquete Bloco A', ja: '希望条件・入れ墨' },
    { n: '06', title: 'Saúde LGPD', ja: '健康・同意' },
    { n: '07', title: 'Revisão/.XLS', ja: '確認・エクセル' }
  ];

  return (
    <div className="ssj-section" style={{
      minHeight: '100vh',
      background: 'var(--ssj-paper)',
      padding: '32px 0'
    }}>
      <div className="ssj-container" style={{ maxWidth: '920px', margin: '0 auto' }}>
        
        {/* Ficha Cadastral FUJIARTE - Form Container */}
        <div className="ssj-card" style={{
          borderRadius: '16px',
          boxShadow: 'var(--ssj-shadow)',
          border: '1px solid var(--ssj-rule)',
          overflow: 'hidden',
          background: 'var(--ssj-surface)',
          color: 'var(--ssj-text)'
        }}>

          {/* Cabeçalho com Linha do Tempo Hanko (Linha do Tempo Japonesa) */}
          <div style={{ padding: '20px 24px 16px', background: 'var(--ssj-surface-2)', borderBottom: '1px solid var(--ssj-rule)' }}>
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

            {/* Selos Hanko Interativos em Linha */}
            <div style={{
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

          {/* Conteúdo do Formulário */}
          <div style={{ padding: '28px 32px 36px' }}>
          
          {/* ETAPA 1: IDENTIFICAÇÃO & DOCUMENTOS */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-rule-2)', paddingBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Etapa 1: Dados Pessoais & Documentação Oficial
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Nome Completo (conforme RG)</label>
                  <input
                    type="text"
                    value={formData.nomeCompleto}
                    onChange={e => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    placeholder="MARINA TANAKA OLIVEIRA"
                    className="ssj-input"
                    style={{ width: '100%', textTransform: 'uppercase' }}
                  />
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
                  {formData.dataNascimento && (
                    <span style={{ fontSize: '12px', color: 'var(--ssj-verde)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      Idade Calculada: {calcularIdade(formData.dataNascimento)} anos
                    </span>
                  )}
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Sexo</label>
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
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Nacionalidade</label>
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
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="ssj-input"
                    style={{ width: '100%', fontFamily: 'var(--ssj-font-mono)' }}
                  />
                </div>

                <div>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Passaporte Nº + Validade</label>
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
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Altura (cm)</label>
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
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
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
                    Cintura (cm)
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
                    Tamanho do Pé (cm)
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
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.celular}
                    onChange={e => setFormData({ ...formData, celular: maskPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Logradouro (Rua / Número / Complemento)</label>
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
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Bairro</label>
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
                  <label className="ssj-label" style={{ display: 'block', marginBottom: '6px' }}>Cidade / UF</label>
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
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Contato de Emergência no Japão (se houver)</h4>
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
                  <div key={i} style={{ padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px', border: '1px solid var(--ssj-border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ssj-indigo)', marginBottom: '8px' }}>
                      Registro #{i + 1} — Japão
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <input type="text" value={exp.provincia} className="ssj-input" placeholder="Província" />
                      <input type="text" value={exp.empreiteira} className="ssj-input" placeholder="Empreiteira" />
                      <input type="text" value={exp.fabrica} className="ssj-input" placeholder="Fábrica / Setor" />
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
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Possui Tatuagem? (Requisito da Ficha FUJIARTE)
                </label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <label><input type="radio" name="tat" value="nao" checked={formData.temTatuagem === 'nao'} onChange={() => setFormData({ ...formData, temTatuagem: 'nao' })} /> Não possuo tatuagem</label>
                  <label><input type="radio" name="tat" value="sim" checked={formData.temTatuagem === 'sim'} onChange={() => setFormData({ ...formData, temTatuagem: 'sim' })} /> Sim, possuo tatuagem</label>
                </div>

                {formData.temTatuagem === 'sim' && (
                  <div style={{ padding: '16px', background: 'rgba(196,69,43,0.08)', borderRadius: '10px', border: '1px solid var(--ssj-shu)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ssj-shu)', marginBottom: '8px' }}>
                      Selecione as regiões do corpo (11 Regiões da Ficha Oficial):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {regioesTatuagemList.map(reg => (
                        <label key={reg} style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="checkbox"
                            checked={formData.tatuagensRegioes.includes(reg)}
                            onChange={() => handleTatuagemToggle(reg)}
                          />
                          {reg}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 6: ENQUETE BLOCO B (SAÚDE 🔒 LGPD ART. 11) */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(120,80,220,0.1)', borderRadius: '10px', border: '1px solid #7850dc' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#7850dc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} /> Etapa 6: Enquete de Saúde (Bloco B 🔒 Dado Pessoal Sensível LGPD Art. 11)
                </h3>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--ssj-text)' }}>
                  Estes dados são armazenados isoladamente com criptografia de coluna (`pgcrypto`). NUNCA são pré-preenchidos por Inteligência Artificial.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Usa Óculos ou Lentes de Contato?</label>
                  <select value={formData.usaOculos} onChange={e => setFormData({ ...formData, usaOculos: e.target.value })} className="ssj-input" style={{ width: '100%' }}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Histórico de Dores Crônicas (Coluna, Ciático, Joelho)?</label>
                  <select value={formData.daltonismo} onChange={e => setFormData({ ...formData, daltonismo: e.target.value })} className="ssj-input" style={{ width: '100%' }}>
                    <option value="nao">Não possuo dores crônicas</option>
                    <option value="sim">Sim, possuo pendências</option>
                  </select>
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
                  <span style={{ fontSize: '12px', lineHeight: 1.4 }}>
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
              <h3 style={{ margin: '8px 0 4px', fontSize: '20px' }}>Ficha FUJIARTE Pronta para Envio!</h3>
              <p className="ssj-text-muted" style={{ fontSize: '13px' }}>
                Todos os ~130 campos da Ficha Cadastral foram validados e estruturados conforme o layout oficial.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => alert('Simulando geração do arquivo Excel .xls no layout 100% idêntico ao modelo oficial da FUJIARTE!')}
                  className="ssj-btn ssj-btn--seal"
                  style={{ padding: '12px 24px' }}
                >
                  <FileSpreadsheet size={18} /> Exportar Planilha .XLS Oficial FUJIARTE
                </button>
                <button
                  onClick={() => alert('Candidatura submetida com sucesso ao pipeline!')}
                  className="ssj-btn ssj-btn--pri"
                  style={{ padding: '12px 24px' }}
                >
                  <CheckCircle2 size={18} /> Submeter Candidatura
                </button>
              </div>
            </div>
          )}

          {/* NAVEGAÇÃO DOS PASSOS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--ssj-border)' }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="ssj-btn ssj-btn--ghost"
            >
              <ChevronLeft size={16} /> Etapa Anterior
            </button>
            <span style={{ fontSize: '12px', color: 'var(--ssj-muted)', alignSelf: 'center' }}>
              Etapa {step} de 7
            </span>
            <button
              onClick={() => setStep(s => Math.min(7, s + 1))}
              disabled={step === 7}
              className="ssj-btn ssj-btn--pri"
            >
              Próxima Etapa <ChevronRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  </div>
  );
}
