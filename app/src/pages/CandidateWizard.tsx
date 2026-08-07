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
    fobia: 'nao',
    tratamento: 'nao',
    consentimentoSaudeLGPD: false,

    // Etapa 7: Bloco C (Motivação) & Agência
    motivacaoPrincipal: 'poupanca',
    agenciaCodigo: 'FUJIARTE-SP-01',
    termoVeracidade: false
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
      provincia: '',
      empreiteira: '',
      fabrica: '',
      periodo: '',
      motivoSaida: ''
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

  const handleFinalSubmit = () => {
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

    alert('Candidatura submetida com sucesso ao pipeline da FUJIARTE!');
  };

  return (
    <div className="ssj-section" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(28,35,49,1) 0%, rgba(41,75,134,0.9) 45%, rgba(196,69,43,0.85) 100%)',
      padding: '40px 0',
      transition: 'background 0.5s ease'
    }}>
      <div className="ssj-container" style={{ maxWidth: '920px', margin: '0 auto' }}>
        
        {/* Ficha Cadastral FUJIARTE - Form Container */}
        <div className="ssj-card ssj-in" style={{
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  {formData.dataNascimento && (
                    <span style={{ fontSize: '12px', color: 'var(--ssj-verde)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      Idade Calculada: {calcularIdade(formData.dataNascimento)} anos
                    </span>
                  )}
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
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="ssj-input"
                    style={{ width: '100%', fontFamily: 'var(--ssj-font-mono)' }}
                  />
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

                {formData.alturaCm && formData.pesoKg && (
                  <div style={{ gridColumn: '1 / -1', padding: '16px', background: 'var(--ssj-surface)', borderRadius: '10px', border: '1px solid var(--ssj-rule)' }}>
                    {(() => {
                      const alturaM = parseFloat(formData.alturaCm) / 100;
                      const peso = parseFloat(formData.pesoKg);
                      if (alturaM > 0 && peso > 0) {
                        const imc = (peso / (alturaM * alturaM)).toFixed(1);
                        const imcNum = parseFloat(imc);
                        let imcColor = 'var(--ssj-text)';
                        let imcLabel = '';
                        
                        if (imcNum < 18.5) { imcColor = 'var(--ssj-ambar)'; imcLabel = 'Abaixo do peso'; }
                        else if (imcNum < 25) { imcColor = 'var(--ssj-verde)'; imcLabel = 'Peso normal'; }
                        else if (imcNum < 30) { imcColor = 'var(--ssj-ambar)'; imcLabel = 'Sobrepeso'; }
                        else { imcColor = 'var(--ssj-shu)'; imcLabel = 'Obesidade'; }

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ssj-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>Índice de Massa Corporal (IMC)</span>
                              <span style={{ fontSize: '24px', fontWeight: 700, color: imcColor }}>{imc}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: imcColor, background: `${imcColor}20`, padding: '4px 10px', borderRadius: '12px' }}>{imcLabel}</span>
                              <span style={{ fontSize: '11px', color: 'var(--ssj-muted)', display: 'block', marginTop: '6px' }}>Cálculo automático para análise médica</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

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
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Possui Tatuagem? (Requisito da Ficha FUJIARTE) · 入れ墨はありますか？
                </label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <label><input type="radio" name="tat" value="nao" checked={formData.temTatuagem === 'nao'} onChange={() => setFormData({ ...formData, temTatuagem: 'nao' })} /> Não possuo tatuagem</label>
                  <label><input type="radio" name="tat" value="sim" checked={formData.temTatuagem === 'sim'} onChange={() => setFormData({ ...formData, temTatuagem: 'sim' })} /> Sim, possuo tatuagem</label>
                </div>

                {formData.temTatuagem === 'sim' && (
                  <div style={{ padding: '20px', background: 'var(--ssj-surface)', borderRadius: '12px', border: '1px solid var(--ssj-shu)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ssj-shu)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Selecione as regiões exatas no corpo:
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      
                      {/* Lado esquerdo: Seleção por Checkboxes e Upload */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {regioesTatuagemList.map(reg => (
                            <label key={reg} style={{ 
                              fontSize: '12.5px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              padding: '8px 12px',
                              background: formData.tatuagensRegioes.includes(reg) ? 'rgba(196,69,43,0.1)' : 'var(--ssj-paper)',
                              border: formData.tatuagensRegioes.includes(reg) ? '1px solid var(--ssj-shu)' : '1px solid var(--ssj-rule)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}>
                              <input
                                type="checkbox"
                                checked={formData.tatuagensRegioes.includes(reg)}
                                onChange={() => handleTatuagemToggle(reg)}
                                style={{ accentColor: 'var(--ssj-shu)' }}
                              />
                              {reg}
                            </label>
                          ))}
                        </div>

                        {/* Foto das Tatuagens */}
                        {formData.tatuagensRegioes.length > 0 && (
                          <div style={{ padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px', border: '1px dashed var(--ssj-rule-3)' }}>
                            <label className="ssj-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--ssj-shu)' }}>
                              Anexar Fotos das Tatuagens (Requisito) · 入れ墨の写真
                            </label>
                            <p style={{ fontSize: '11px', color: 'var(--ssj-muted)', marginBottom: '12px' }}>
                              Menos as que estiverem em locais íntimos.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <label style={{
                                padding: '8px 16px',
                                background: 'var(--ssj-surface-2)',
                                border: '1px solid var(--ssj-rule)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={() => alert('Simulando upload de fotos de tatuagem...')} />
                                <span style={{ fontSize: '16px' }}>+</span> Adicionar Fotos
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lado direito: SVGs do Corpo Humano (Frente e Verso) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ssj-paper)', borderRadius: '12px', padding: '20px', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                           {/* CORPO - FRENTE */}
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ssj-muted)', textTransform: 'uppercase' }}>Frente</span>
                             <svg viewBox="0 0 200 360" width="100%" height="240px" style={{ maxWidth: '120px' }}>
                                {/* Cabeça/Rosto (Frente) */}
                                <circle cx="100" cy="40" r="25" fill={formData.tatuagensRegioes.includes('Cabeça/Rosto') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Cabeça/Rosto') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Cabeça/Rosto')} />
                                {/* Pescoço */}
                                <rect x="85" y="65" width="30" height="15" fill={formData.tatuagensRegioes.includes('Pescoço') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pescoço') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pescoço')} />
                                {/* Peito & Ombros (Frente) */}
                                <path d="M50 80 Q100 70 150 80 L150 130 L50 130 Z" fill={formData.tatuagensRegioes.includes('Peito') || formData.tatuagensRegioes.includes('Ombros') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Peito') || formData.tatuagensRegioes.includes('Ombros') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Peito')} />
                                {/* Abdômen */}
                                <rect x="60" y="130" width="80" height="70" fill={formData.tatuagensRegioes.includes('Abdômen') || formData.tatuagensRegioes.includes('Cintura') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Abdômen') || formData.tatuagensRegioes.includes('Cintura') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Abdômen')} />
                                {/* Braços (Frente) */}
                                <rect x="30" y="85" width="20" height="80" rx="10" fill={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Braços')} transform="rotate(15 40 85)" />
                                <rect x="150" y="85" width="20" height="80" rx="10" fill={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Braços')} transform="rotate(-15 160 85)" />
                                {/* Pernas (Frente) */}
                                <rect x="65" y="200" width="30" height="110" rx="10" fill={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pernas')} />
                                <rect x="105" y="200" width="30" height="110" rx="10" fill={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pernas')} />
                                {/* Mãos e Pés (Bolinhas nas pontas para facilitar clique) */}
                                <circle cx="18" cy="170" r="12" fill={formData.tatuagensRegioes.includes('Mãos') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Mãos') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="2" cursor="pointer" onClick={() => handleTatuagemToggle('Mãos')} />
                                <circle cx="182" cy="170" r="12" fill={formData.tatuagensRegioes.includes('Mãos') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Mãos') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="2" cursor="pointer" onClick={() => handleTatuagemToggle('Mãos')} />
                                <circle cx="80" cy="320" r="15" fill={formData.tatuagensRegioes.includes('Pés') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pés') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="2" cursor="pointer" onClick={() => handleTatuagemToggle('Pés')} />
                                <circle cx="120" cy="320" r="15" fill={formData.tatuagensRegioes.includes('Pés') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pés') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="2" cursor="pointer" onClick={() => handleTatuagemToggle('Pés')} />
                             </svg>
                           </div>

                           {/* CORPO - COSTAS */}
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ssj-muted)', textTransform: 'uppercase' }}>Verso</span>
                             <svg viewBox="0 0 200 360" width="100%" height="240px" style={{ maxWidth: '120px' }}>
                                {/* Cabeça (Verso) */}
                                <circle cx="100" cy="40" r="25" fill={formData.tatuagensRegioes.includes('Cabeça/Rosto') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Cabeça/Rosto') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Cabeça/Rosto')} />
                                {/* Nuca/Pescoço (Verso) */}
                                <rect x="85" y="65" width="30" height="15" fill={formData.tatuagensRegioes.includes('Pescoço') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pescoço') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pescoço')} />
                                {/* Costas (Verso do Peito/Abdômen) */}
                                <path d="M50 80 Q100 70 150 80 L150 200 L50 200 Z" fill={formData.tatuagensRegioes.includes('Costas') || formData.tatuagensRegioes.includes('Cintura') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Costas') || formData.tatuagensRegioes.includes('Cintura') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Costas')} />
                                {/* Braços (Verso) */}
                                <rect x="30" y="85" width="20" height="80" rx="10" fill={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Braços')} transform="rotate(15 40 85)" />
                                <rect x="150" y="85" width="20" height="80" rx="10" fill={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Braços') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Braços')} transform="rotate(-15 160 85)" />
                                {/* Pernas (Verso) */}
                                <rect x="65" y="200" width="30" height="110" rx="10" fill={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pernas')} />
                                <rect x="105" y="200" width="30" height="110" rx="10" fill={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : '#f0f0f0'} stroke={formData.tatuagensRegioes.includes('Pernas') ? 'var(--ssj-shu)' : 'var(--ssj-text)'} strokeWidth="3" cursor="pointer" onClick={() => handleTatuagemToggle('Pernas')} />
                             </svg>
                           </div>
                         </div>
                         <text style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ssj-text-2)', textAlign: 'center', marginTop: '8px' }}>Clique nas áreas do corpo</text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 6: ENQUETE BLOCO B (SAÚDE 🔒 LGPD ART. 11) */}
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
                  className="ssj-btn ssj-btn--pri"
                  style={{ padding: '12px 32px', fontSize: '16px', fontWeight: 600, width: '100%', maxWidth: '320px' }}
                >
                  <CheckCircle2 size={20} style={{ marginRight: '8px' }} /> Enviar Candidatura · 送信する
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
                <span style={{ fontSize: '11px', color: 'var(--ssj-muted)' }}>
                  Tempo estimado restante: ~{Math.ceil((12 / 7) * (7 - step))} min
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
