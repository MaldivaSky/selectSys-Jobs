import { useState } from 'react';
import { 
  FileSpreadsheet, CheckCircle2, ArrowRight, UserCheck, ShieldCheck, 
  Smartphone, UploadCloud, Building2, Send, Search, Award, Clock, Database
} from 'lucide-react';
import type { Language } from '../translations';

export function MasterBlueprint({ lang }: { lang: Language }) {
  console.log('Language:', lang);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'fluxo' | 'form' | 'tatuagem' | 'agencias' | 'excel' | 'integracoes' | 'fases'>('fluxo');

  // Interactive Tattoo State (Section 6)
  const [selectedTattooParts, setSelectedTattooParts] = useState<string[]>([]);
  const [hasTattoo, setHasTattoo] = useState<boolean>(false);

  // Interactive Excel Export State (Section 10)
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDone, setExportDone] = useState<boolean>(false);

  // Interactive Search Filter State (Section 8)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  const toggleTattooPart = (part: string) => {
    setSelectedTattooParts(prev => 
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  const handleSimulateExcelExport = () => {
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
    }, 800);
  };

  const pipelineSteps = [
    { num: 1, title: 'Envio da Planilha', desc: 'Agência ou candidato envia dados iniciais', icon: FileSpreadsheet },
    { num: 2, title: 'Candidato Preenche & Retorna', desc: 'Formulário Web em 5 etapas no celular', icon: Smartphone },
    { num: 3, title: 'Entrevista', desc: 'Avaliação presencial ou online com gravador', icon: UserCheck },
    { num: 4, title: 'Registro no Garoon', desc: 'Apenas aprovados registrados na matriz', icon: Database },
    { num: 5, title: 'Envio Currículo ao Japão', desc: 'Sincronização bilíngue PT/JA', icon: Send },
    { num: 6, title: 'Seleção pela Empresa Japonesa', desc: 'Aprovação pelo supervisor de fábrica', icon: Building2 },
    { num: 7, title: 'Aprovação / Oferta', desc: 'Assinatura do contrato de trabalho', icon: Award },
    { num: 8, title: 'Solicitação do COE', desc: 'Certificado de Elegibilidade no Japão', icon: Clock },
    { num: 9, title: 'Solicitação do Visto', desc: 'Processamento junto ao consulado no Brasil', icon: ShieldCheck },
    { num: 10, title: 'Preparação da Viagem', desc: 'Emissão de passagens e orientation', icon: UploadCloud },
    { num: 11, title: 'Entrada no Japão & Admissão', desc: 'Recepção no aeroporto e entrada no alojamento', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* 🔴 BLUEPRINT SYSTEM HEADER (MATCHING "PLANO - APP.JPEG") */}
      <header className="bg-[#14181f] text-white p-6 shadow-lg border-b-4 border-rose-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-widest bg-slate-900/80 px-3 py-1 rounded-full w-fit mb-2 border border-slate-700">
              DOCUMENTO DE REQUISITOS & SISTEMA SaaS HOMOLOGADO
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white" style={{ color: '#ffffff' }}>
              SISTEMA DE GESTÃO DE CANDIDATURAS, CONTRATAÇÃO E VISTOS PARA DEKASSEGUI
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Objetivo: Gerenciar todo o processo desde a candidatura até a entrada e admissão no Japão de forma centralizada, automatizada e eficiente (FUJIARTE Co., Ltd.).
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-xs bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full shadow-xs">
              Fase 1 (MVP) Ativo
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              Cliente Homologado: FUJIARTE Brasil & Japão
            </span>
          </div>
        </div>

        {/* System Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('fluxo')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'fluxo' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📌 1. Visão Geral & Fluxo (11 Etapas)
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'form' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📱 2. Candidatura Web & Triagem IA
          </button>
          <button
            onClick={() => setActiveTab('tatuagem')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tatuagem' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🩺 3. Biometria & Tatuagem
          </button>
          <button
            onClick={() => setActiveTab('agencias')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'agencias' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🏢 4. Gestão de Agências
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'excel' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📊 5. Exportador Excel FUJIARTE (.XLS)
          </button>
          <button
            onClick={() => setActiveTab('integracoes')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'integracoes' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔌 6. Garoon & WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('fases')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'fases' ? 'bg-rose-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🗓️ 7. Fases de Desenvolvimento
          </button>
        </div>
      </header>

      {/* 🔴 TAB 1: VISÃO GERAL & FLUXO DE 11 ETAPAS (SEÇÃO 1 E 2 DO BLUEPRINT) */}
      {activeTab === 'fluxo' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Section 1: Objective */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">1</span>
              <h2 className="text-xl font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>1. OBJETIVO DO SISTEMA</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed max-w-4xl font-medium">
              Centralizar e automatizar todo o processo de candidatura, seleção, vistos, viagem e admissão no Japão, eliminando o uso de planilhas manuais e múltiplas ferramentas dispersas.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-slate-800">
              <span className="bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Planilha Excel
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-sky-600" /> Entrevista
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" /> Garoon Matriz
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Vistos / COE
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="bg-emerald-100 text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Entrada & Admissão Japão
              </span>
            </div>
          </div>

          {/* Section 2: 11-Stage Pipeline Flow Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">2</span>
              <h2 className="text-xl font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>2. FLUXO ATUAL DO PROCESSO (11 ETAPAS END-TO-END)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pipelineSteps.map((s) => {
                const StepIcon = s.icon;
                return (
                  <div key={s.num} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-rose-500 hover:bg-rose-50/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#14181f] text-white text-xs font-bold flex items-center justify-center">
                        {s.num}
                      </span>
                      <StepIcon className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug" style={{ color: '#14181f' }}>{s.title}</h3>
                    <p className="text-xs text-slate-600">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 2: CANDIDATURA WEB & TRIAGEM AUTOMÁTICA (SEÇÕES 3, 4, 5, 7, 8) */}
      {activeTab === 'form' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 3: Web Candidate Form Specs */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">3</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>3. FORMULÁRIO DE CANDIDATURA WEB</h2>
              </div>

              <div className="space-y-2.5 text-xs text-slate-800">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mesmo conteúdo da planilha atual (~130 campos)</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Compatível com celular (Mobile-First) e computador</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Salvar rascunho e salvamento automático local</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Exportação no mesmo layout da planilha atual FUJIARTE (.XLS)</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Exportação em PDF com foto anexada no currículo</span>
                </div>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="pt-2">
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white font-mono text-xs max-w-xs mx-auto space-y-3 shadow-md">
                  <div className="text-[10px] text-emerald-400 font-sans text-center border-b border-slate-800 pb-1 font-bold">
                    📱 VISÃO DO CANDIDATO NO CELULAR
                  </div>
                  <div className="space-y-2 font-sans text-[11px]">
                    <div>
                      <label className="text-slate-400">Nome Completo:</label>
                      <div className="bg-slate-800 p-2 rounded text-white font-bold mt-0.5">Roberto Kenji Sato</div>
                    </div>
                    <div>
                      <label className="text-slate-400">Data Nasc.:</label>
                      <div className="bg-slate-800 p-2 rounded text-white mt-0.5">14/05/1992 (Sansei)</div>
                    </div>
                    <button className="w-full bg-emerald-600 text-white font-bold py-2 rounded text-xs mt-2">
                      Salvar Rascunho
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Automated Screening Logic */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">4</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>4. TRIAGEM AUTOMÁTICA</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-900">REGRAS DE IDADE:</div>
                  <div className="text-emerald-700 font-bold">✓ Menor de 55 anos (regra geral aprovada)</div>
                  <div className="text-amber-700 font-bold">⚠️ Acima de 55 anos (apenas se já trabalhou na mesma empresa)</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-extrabold text-slate-900">DESCENDENTE DE JAPONÊS:</div>
                  <p className="text-slate-700 font-medium">Pergunta obrigatória: "Você é descendente de japonês?"</p>
                  <div className="text-rose-700 font-bold">❌ Não descendente: encerramento automático do fluxo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Data Management & 14 Status Badges */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">8</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>8. GESTÃO DE DADOS & CONTROLE DE STATUS (14 ESTADOS)</h2>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Busca por Nome, Cidade, Idade, Nível Japonês..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 border-none outline-none w-48 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Candidatura recebida', 'Verificação de documentos', 'Aguardando entrevista',
                'Entrevista realizada', 'Aprovado na entrevista', 'Currículo enviado ao Japão',
                'Seleção pela empresa japonesa', 'Entrevista na empresa japonesa', 'Aprovado / Oferta',
                'Preparação do COE', 'COE em andamento', 'COE emitido', 'Visto em andamento',
                'Preparação da viagem', 'Chegada no Japão', 'Admissão concluída'
              ].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedStatus === status 
                      ? 'bg-rose-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 3: CONFIRMAÇÃO DE TATUAGEM & BIOMETRIA (SEÇÃO 6 E 7) */}
      {activeTab === 'tatuagem' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 6: Tattoo Confirmation */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">6</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>6. CONFIRMAÇÃO DE TATUAGEM</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800">Possui Tatuagem?</label>
                  <button
                    onClick={() => setHasTattoo(!hasTattoo)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hasTattoo ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {hasTattoo ? 'Sim, possui tatuagem' : 'Opção: "Sem tatuagem"'}
                  </button>
                </div>

                {hasTattoo && (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-xs font-extrabold text-slate-900 block">
                      Selecione as Partes do Corpo com Tatuagem:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Cabeça', 'Rosto', 'Pescoço', 'Peito', 'Costas', 'Ombros',
                        'Braços', 'Mãos', 'Abdômen', 'Cintura', 'Pernas'
                      ].map(part => (
                        <button
                          key={part}
                          onClick={() => toggleTattooPart(part)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedTattooParts.includes(part)
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {part}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 7: Document Upload */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">7</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>7. DOCUMENTOS PARA UPLOAD</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-base">
                    📷
                  </div>
                  <div className="font-extrabold text-slate-900">Foto do Candidato</div>
                  <div className="text-[10px] text-slate-500">Upload direto pelo celular</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto text-base">
                    📄
                  </div>
                  <div className="font-extrabold text-slate-900">RG / Passaporte</div>
                  <div className="text-[10px] text-slate-500">Formatos: JPG, PNG, PDF</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 4: GESTÃO DE AGÊNCIAS INDICADORAS (SEÇÃO 9 DO BLUEPRINT) */}
      {activeTab === 'agencias' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">9</span>
              <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>9. GESTÃO DE AGÊNCIAS (INDICADORAS)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-sm text-slate-900">Link Exclusivo por Agência</div>
                <p className="text-xs text-slate-600">Cada agência parceira no Brasil recebe um link customizado que vincula os candidatos automaticamente.</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-sm text-slate-900">Dashboard de Acompanhamento</div>
                <p className="text-xs text-slate-600">Visualização em tempo real do progresso de candidatos, entrevistas, vistos COE e comissões.</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-sm text-slate-900">Relatórios em Excel</div>
                <p className="text-xs text-slate-600">Exportação periódica de relatórios por agência responsável e taxa de conversão de embarque.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 5: EXPORTADOR EXCEL FUJIARTE & DASHBOARD (SEÇÃO 10 E 14 DO BLUEPRINT) */}
      {activeTab === 'excel' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">10</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>10. EXPORTAÇÃO PARA EXCEL (.XLS)</h2>
              </div>

              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                Exportar os dados da candidatura no **mesmo layout da planilha atual da FUJIARTE (`白紙 FUJIARTE Ficha Cadastral.xls`)**, com foto anexada e exportação em PDF.
              </p>

              <div className="pt-2 space-y-3">
                <button
                  onClick={handleSimulateExcelExport}
                  disabled={isExporting}
                  className="btn-rose text-sm py-3.5 px-6 w-full justify-center shadow-md font-extrabold"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  {isExporting ? 'Gerando planilha no layout FUJIARTE...' : '⚡ Executar Exportação Simulada .XLS'}
                </button>

                {exportDone && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    Planilha exportada com sucesso em 0.3s (Template Fiel 白紙 FUJIARTE)!
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-lg bg-white">
              <img 
                src="/images/fujiarte_excel.png" 
                alt="Layout Planilha FUJIARTE .XLS" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 6: INTEGRAÇÃO GAROON & WHATSAPP (SEÇÕES 11 E 12 DO BLUEPRINT) */}
      {activeTab === 'integracoes' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 11: Garoon Integration */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">11</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>11. INTEGRAÇÃO COM GAROON (MATRIZ)</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Apenas candidatos aprovados na entrevista são enviados automaticamente para o Garoon na matriz japonesa, garantindo sincronização de status.
              </p>
            </div>

            {/* Section 12: WhatsApp Integration */}
            <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">12</span>
                <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>12. INTEGRAÇÃO COM WHATSAPP</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Envio automático de mensagens com alertas de prazos, lembretes de entrevistas e solicitação de documentos diretamente pelo WhatsApp.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* 🔴 TAB 7: FASES DE DESENVOLVIMENTO ROADMAP (SEÇÃO 15 DO BLUEPRINT) */}
      {activeTab === 'fases' && (
        <main className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#14181f] text-white font-bold flex items-center justify-center text-sm">15</span>
              <h2 className="text-lg font-extrabold text-[#14181f]" style={{ color: '#14181f' }}>15. FASES DE DESENVOLVIMENTO ROADMAP</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-2">
                <div className="text-xs font-bold text-rose-700 uppercase">Phase 1 (MVP) — Entregável Segunda</div>
                <ul className="text-xs text-slate-700 space-y-1 font-medium">
                  <li>✓ Formulário de Candidatura Web</li>
                  <li>✓ Exportação para Excel FUJIARTE</li>
                  <li>✓ Painel de Gestão e Status</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-800 uppercase">Phase 2 — Integrações</div>
                <ul className="text-xs text-slate-700 space-y-1 flagging-medium">
                  <li>• Integração com Garoon Matriz</li>
                  <li>• Integração com WhatsApp API</li>
                  <li>• Gestão de Agências Indicadoras</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase">Phase 3 — Avançado & IA</div>
                <ul className="text-xs text-slate-700 space-y-1 font-medium">
                  <li>• Dashboard Avançado com SLAs</li>
                  <li>• Análise por IA de Perfil & Match</li>
                  <li>• Assinatura Eletrônica de Documentos</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
