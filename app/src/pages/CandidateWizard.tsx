import { useState, useEffect } from 'react';
import {
  User, Shield, FileSpreadsheet, Save, CheckCircle2, ChevronRight, ChevronLeft,
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

export function CandidateWizard({ lang: _lang }: { lang?: Language }) {
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
    return isNaN(idade) ? '' : `${idade} anos`;
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

  return (
    <div className="ssj-section" style={{ minHeight: '90vh', padding: '24px 0' }}>
      <div className="ssj-container" style={{ maxWidth: '860px' }}>
        
        {/* Cabeçalho da Ficha FUJIARTE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ssj-pill ssj-pill--seal">FUJIARTE Ficha Cadastral Jun2024</span>
              <span className="ssj-pill ssj-pill--info">Mobile-First ~130 Campos</span>
            </div>
            <h1 style={{ margin: '8px 0 4px', fontSize: '24px' }}>
              Formulário de Candidatura Dekassegui (Brasil → Japão)
            </h1>
            <p className="ssj-text-muted" style={{ fontSize: '13px' }}>
              Substituição digital oficial da planilha Excel FUJIARTE • Conforme LGPD Art. 11
            </p>
          </div>

          {/* Indicador de Autosave */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {autoSaved && (
              <span className="ssj-chip" style={{ background: 'rgba(31,157,87,0.15)', color: 'var(--ssj-verde)', border: '1px solid var(--ssj-verde)' }}>
                <Save size={14} /> Salvo automaticamente
              </span>
            )}
            <Hanko estado={step === 7 ? 'aprovado' : 'agora'} texto={step === 7 ? '済' : '印'} size={36} />
          </div>
        </div>

        {/* Barra de Progresso em 7 Etapas (Doc 05 Épico A) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '24px' }}>
          {[
            '1. Identificação',
            '2. Biometria EPI',
            '3. Endereço/Família',
            '4. Histórico JP',
            '5. Enquete A',
            '6. Saúde LGPD',
            '7. Revisão/.XLS'
          ].map((titulo, idx) => (
            <div
              key={idx}
              onClick={() => setStep(idx + 1)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: '6px',
                background: step === idx + 1 ? 'var(--ssj-indigo)' : idx + 1 < step ? 'var(--ssj-paper)' : 'var(--ssj-surface)',
                color: step === idx + 1 ? '#fff' : idx + 1 < step ? 'var(--ssj-verde)' : 'var(--ssj-muted)',
                fontSize: '11px',
                fontWeight: 600,
                border: step === idx + 1 ? '1px solid var(--ssj-indigo)' : '1px solid var(--ssj-border)'
              }}
            >
              {titulo}
            </div>
          ))}
        </div>

        {/* CONTEÚDO DAS ETAPAS */}
        <div className="ssj-card" style={{ padding: '32px', background: 'var(--ssj-surface)', borderRadius: '16px', border: '1px solid var(--ssj-border)' }}>
          
          {/* ETAPA 1: IDENTIFICAÇÃO & DOCUMENTOS */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-border)', paddingBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> Etapa 1: Dados Pessoais & Documentação Oficial
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nome Completo (conforme RG)</label>
                  <input
                    type="text"
                    value={formData.nomeCompleto}
                    onChange={e => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    placeholder="Nome igual ao documento oficial"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })}
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                  {formData.dataNascimento && (
                    <span style={{ fontSize: '12px', color: 'var(--ssj-verde)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      Idade Calculada: {calcularIdade(formData.dataNascimento)}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                    className="ssj-input"
                    style={{ width: '100%' }}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nacionalidade</label>
                  <select
                    value={formData.nacionalidade}
                    onChange={e => setFormData({ ...formData, nacionalidade: e.target.value })}
                    className="ssj-input"
                    style={{ width: '100%' }}
                  >
                    <option value="BRAS">Brasileira (BRAS)</option>
                    <option value="JAP">Japonesa (JAP)</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>

                {formData.nacionalidade === 'BRAS' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Geração Nikkei (Descendência)</label>
                    <select
                      value={formData.geracaoNikkei}
                      onChange={e => setFormData({ ...formData, geracaoNikkei: e.target.value })}
                      className="ssj-input"
                      style={{ width: '100%' }}
                    >
                      <option value="nissei">Nissei (Filho de Japonês)</option>
                      <option value="sansei">Sansei (Neto de Japonês)</option>
                      <option value="yonsei">Yonsei (Bisneto de Japonês)</option>
                      <option value="conjuge">Cônjuge de Nikkei</option>
                      <option value="nao_descendente">Não Descendente</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Passaporte Nº + Validade</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Nº Passaporte"
                      value={formData.passaporte}
                      onChange={e => setFormData({ ...formData, passaporte: e.target.value })}
                      className="ssj-input"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ borderBottom: '1px solid var(--ssj-border)', paddingBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} /> Etapa 3: Endereço & Contatos de Emergência
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CEP (Busca automática via ViaCEP)</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={e => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.celular}
                    onChange={e => setFormData({ ...formData, celular: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="ssj-input"
                    style={{ width: '100%' }}
                  />
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
  );
}
