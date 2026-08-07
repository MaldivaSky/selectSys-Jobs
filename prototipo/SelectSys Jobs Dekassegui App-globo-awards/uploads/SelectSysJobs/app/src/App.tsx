import { useState } from 'react';
import { 
  Globe, Shield, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  ArrowRight, UploadCloud, Cpu, Sparkles, Building2, 
  DollarSign, BarChart3, ChevronRight
} from 'lucide-react';
import { translations } from './translations';
import type { Language } from './translations';
import type { JobVacancy, CandidateFormState } from './types';

const mockVacancies: JobVacancy[] = [
  {
    id: 'v1',
    title: 'Operador de Prensa e Solda de Autopeças (Fornecedor Toyota)',
    titleJp: '自動車部品プレス・溶接オペレーター（トヨタ系）',
    province: 'aichi',
    provinceName: 'Aichi (愛知県)',
    city: 'Toyota-shi / Okazaki',
    industry: 'Autopeças (自動車部品)',
    salaryJpy: '¥ 1,450 ~ ¥ 1,700 / hora',
    salaryBrlEst: '~ R$ 16.500 / mês',
    nikkeiEligible: 'Nissei, Sansei, Yonsei ou Cônjuge',
    shift: 'Alternado (2 turnos 8h + Zangyo)',
    overtimeHours: '30 ~ 45 hrs/mês',
  },
  {
    id: 'v2',
    title: 'Montagem e Inspeção de Painéis Eletrônicos (Fornecedor Suzuki)',
    titleJp: '電子基板組み立て・検査（スズキ系）',
    province: 'shizuoka',
    provinceName: 'Shizuoka (静岡県)',
    city: 'Hamamatsu-shi',
    industry: 'Eletrônicos (電子機器)',
    salaryJpy: '¥ 1,350 ~ ¥ 1,550 / hora',
    salaryBrlEst: '~ R$ 14.800 / mês',
    nikkeiEligible: 'Nissei, Sansei, Yonsei',
    shift: 'Diurno / Alternado',
    overtimeHours: '20 ~ 30 hrs/mês',
  },
  {
    id: 'v3',
    title: 'Processamento e Embalagem Alimentícia Industrial',
    titleJp: '食品加工・包装ライン（三重工場）',
    province: 'mie',
    provinceName: 'Mie (三重県)',
    city: 'Yokkaichi / Suzuka',
    industry: 'Alimentício (食品)',
    salaryJpy: '¥ 1,300 ~ ¥ 1,450 / hora',
    salaryBrlEst: '~ R$ 13.900 / mês',
    nikkeiEligible: 'Nissei, Sansei, Yonsei ou Cônjuge',
    shift: '2 Turnos rotativos',
    overtimeHours: '15 ~ 25 hrs/mês',
  },
  {
    id: 'v4',
    title: 'Linha de Usinagem e Autopeças de Precisão (Subaru Supplier)',
    titleJp: '精密部品加工・マシニング（スバル系）',
    province: 'gunma',
    provinceName: 'Gunma (群馬県)',
    city: 'Ota-shi',
    industry: 'Autopeças (自動車部品)',
    salaryJpy: '¥ 1,400 ~ ¥ 1,650 / hora',
    salaryBrlEst: '~ R$ 15.600 / mês',
    nikkeiEligible: 'Nissei, Sansei, Yonsei',
    shift: 'Alternado com adicionais',
    overtimeHours: '30 ~ 40 hrs/mês',
  },
  {
    id: 'v5',
    title: 'Operação Logística de Moldes e Moldagem por Injeção Plastic',
    titleJp: 'プラスチック成形・物流オペレーター（神奈川）',
    province: 'kanagawa',
    provinceName: 'Kanagawa (神奈川県)',
    city: 'Atsugi / Sagamihara',
    industry: 'Plásticos & Logística',
    salaryJpy: '¥ 1,400 ~ ¥ 1,600 / hora',
    salaryBrlEst: '~ R$ 15.200 / mês',
    nikkeiEligible: 'Nissei, Sansei, Yonsei',
    shift: '2 Turnos',
    overtimeHours: '25 ~ 35 hrs/mês',
  }
];

export function App() {
  const [lang, setLang] = useState<Language>('pt-BR');
  const t = translations[lang];

  // State for Geo-SEO Province Filter
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  // State for FUJIARTE Excel Exporter Simulation
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDone, setExportDone] = useState<boolean>(false);

  // State for Wizard Form Stepper Demo
  const [activeStep, setActiveStep] = useState<number>(1);
  const [formState, setFormState] = useState<CandidateFormState>({
    fullName: 'Roberto Kenji Sato',
    birthDate: '1992-05-14',
    generation: 'sansei',
    phone: '+55 11 98765-4321',
    japanExperience: true,
    japanYears: 4,
    lastProvince: 'Aichi (愛知県)',
    lastFactoryType: 'Autopeças / Toyota',
    footSizeCm: 26.5,
    waistSizeCm: 84,
    hasTattoo: false,
    healthConsent: true,
  });
  const [isAiParsing, setIsAiParsing] = useState<boolean>(false);
  const [aiSuccess, setAiSuccess] = useState<boolean>(false);

  // State for ROI Calculator
  const [candidateCount, setCandidateCount] = useState<number>(150);
  const [agencyCount, setAgencyCount] = useState<number>(8);

  // State for Dashboard Dual Tab
  const [dashTab, setDashTab] = useState<'superadmin' | 'tenant'>('tenant');

  // Filter vacancies based on province
  const filteredVacancies = selectedProvince === 'all' 
    ? mockVacancies 
    : mockVacancies.filter(v => v.province === selectedProvince);

  // Handle simulated AI Upload Parsing
  const handleSimulateAiUpload = () => {
    setIsAiParsing(true);
    setAiSuccess(false);
    setTimeout(() => {
      setIsAiParsing(false);
      setAiSuccess(true);
      setFormState(prev => ({
        ...prev,
        fullName: 'Roberto Kenji Sato (Extraído via DeepSeek)',
        japanYears: 5,
        lastProvince: 'Shizuoka (静岡県)',
        lastFactoryType: 'Eletrônicos / Suzuki'
      }));
    }, 1200);
  };

  // Handle simulated FUJIARTE Excel Export
  const handleSimulateExcelExport = () => {
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
    }, 1000);
  };

  // Calculations for ROI
  const hoursSavedPerMonth = Math.round(candidateCount * 0.35 + agencyCount * 4);
  const opexDeepSeekSavedYearly = Math.round(candidateCount * 12 * 0.85); // Estimated R$ savings

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🟢 TOP BAR & HEADER */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center shadow-lg shadow-red-500/20 font-bold text-white text-lg">
              🇯🇵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  SelectSys<span className="text-red-500">Jobs</span>
                </span>
                <span className="badge-jp">V2 Dekassegui</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                SaaS Multi-Tenant de Alta Performance (Brasil ➔ Japão)
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#vagas" className="hover:text-red-400 transition-colors">{t.nav.vagas}</a>
            <a href="#fujiarte" className="hover:text-cyan-400 transition-colors">{t.nav.fujiarte}</a>
            <a href="#stepper" className="hover:text-purple-400 transition-colors">{t.nav.stepper}</a>
            <a href="#roi" className="hover:text-emerald-400 transition-colors">{t.nav.roi}</a>
            <a href="#dashboards" className="hover:text-blue-400 transition-colors">{t.nav.dashboards}</a>
          </nav>

          {/* Actions & Lang Switcher */}
          <div className="flex items-center gap-3">
            {/* Lang Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
              <button 
                onClick={() => setLang('pt-BR')} 
                className={`px-2 py-1 rounded font-medium transition-all ${lang === 'pt-BR' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                🇧🇷 PT
              </button>
              <button 
                onClick={() => setLang('ja-JP')} 
                className={`px-2 py-1 rounded font-medium transition-all ${lang === 'ja-JP' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                🇯🇵 日本語
              </button>
              <button 
                onClick={() => setLang('en-US')} 
                className={`px-2 py-1 rounded font-medium transition-all ${lang === 'en-US' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                🇺🇸 EN
              </button>
            </div>

            <a href="#fujiarte" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
              {t.nav.demoBtn}
            </a>
          </div>
        </div>
      </header>

      {/* 🔴 HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 glass-pill text-red-300 border-red-500/30 bg-red-950/20 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            {t.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            {t.hero.title1}{' '}
            <span className="gradient-text-jp block sm:inline">{t.hero.titleHighlight}</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="#fujiarte" className="btn-primary text-base py-3 px-6 shadow-xl shadow-red-600/30">
              <FileSpreadsheet className="w-5 h-5" />
              {t.hero.btnDemo}
            </a>
            <a href="#vagas" className="btn-secondary text-base py-3 px-6">
              <Globe className="w-5 h-5 text-cyan-400" />
              {t.hero.btnVagas}
            </a>
          </div>

          {/* Hero Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-10 text-left">
            <div className="glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-xs text-slate-400 font-medium">{t.hero.stat1}</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">{t.hero.stat1Val}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">DeepSeek V3 vs Claude</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-xs text-slate-400 font-medium">{t.hero.stat2}</div>
              <div className="text-xl font-extrabold text-cyan-400 mt-1">{t.hero.stat2Val}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Wizard Stepper Mobile</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-xs text-slate-400 font-medium">{t.hero.stat3}</div>
              <div className="text-xl font-extrabold text-rose-400 mt-1">{t.hero.stat3Val}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Template白紙 FUJIARTE</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border-slate-800">
              <div className="text-xs text-slate-400 font-medium">{t.hero.stat4}</div>
              <div className="text-xl font-extrabold text-purple-400 mt-1">{t.hero.stat4Val}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">LGPD Art. 5, 11 & 20</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌐 SECTION 1: GEO-SEO VAGAS DEKASSEGUI HUB */}
      <section id="vagas" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="space-y-4 text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 badge-cyan">
            <Globe className="w-3.5 h-3.5" />
            {t.geoSeo.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t.geoSeo.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
            {t.geoSeo.subtitle}
          </p>

          {/* Interactive Province Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-4">
            {[
              { id: 'all', label: t.geoSeo.provinces.all },
              { id: 'aichi', label: t.geoSeo.provinces.aichi },
              { id: 'shizuoka', label: t.geoSeo.provinces.shizuoka },
              { id: 'mie', label: t.geoSeo.provinces.mie },
              { id: 'gunma', label: t.geoSeo.provinces.gunma },
              { id: 'kanagawa', label: t.geoSeo.provinces.kanagawa },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProvince(p.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedProvince === p.id 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' 
                    : 'glass-panel text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vacancy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacancies.map(job => (
            <div key={job.id} className="glass-panel p-6 flex flex-col justify-between border-slate-800 space-y-4 hover:border-cyan-500/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="badge-jp">{job.provinceName}</span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    {t.geoSeo.googleJobsBadge}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-white leading-snug">{job.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{job.titleJp}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salário / 𡈽給:</span>
                    <span className="font-bold text-cyan-300">{job.salaryJpy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimativa BRL:</span>
                    <span className="font-semibold text-emerald-400">{job.salaryBrlEst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Elegibilidade:</span>
                    <span className="text-slate-200">{job.nikkeiEligible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Horas Extras:</span>
                    <span className="text-amber-300">{job.overtimeHours}</span>
                  </div>
                </div>
              </div>

              <a href="#stepper" className="btn-cyan text-xs text-center justify-center py-2.5 w-full">
                {t.geoSeo.applyBtn}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 🏆 SECTION 2: CASE FUJIARTE & EXCEL EXPORTER SIMULATOR */}
      <section id="fujiarte" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="glass-panel p-8 sm:p-12 border-red-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl font-black font-mono">
            白紙
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 badge-jp">
                <Building2 className="w-3.5 h-3.5" />
                {t.fujiarte.tag}
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {t.fujiarte.title}
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {t.fujiarte.subtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-lg font-bold text-red-400">{t.fujiarte.fieldCount}</div>
                  <p className="text-xs text-slate-400">{t.fujiarte.fieldDesc}</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-lg font-bold text-emerald-400">{t.fujiarte.timeSaved}</div>
                  <p className="text-xs text-slate-400">{t.fujiarte.timeDesc}</p>
                </div>
              </div>

              {/* Action Simulator Button */}
              <div className="pt-2">
                <button 
                  onClick={handleSimulateExcelExport}
                  disabled={isExporting}
                  className="btn-primary text-sm py-3 px-6 w-full sm:w-auto justify-center"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  {isExporting ? t.fujiarte.simulating : t.fujiarte.btnExportDemo}
                </button>

                {exportDone && (
                  <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.fujiarte.successMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Mockup View of FUJIARTE Excel Sheet */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  白紙 FUJIARTE Ficha Cadastral (Jun2024).xls
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Fidelidade 100%</span>
              </div>

              {/* Excel Preview Lines */}
              <div className="space-y-2 font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] font-bold text-red-400 border-b border-slate-800 pb-1">
                  PÁGINA 1 — DADOS PESSOAIS & BIOMETRIA EPI
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Nome:</span> Sato Roberto Kenji</div>
                  <div><span className="text-slate-500">Nascimento:</span> 1992/05/14 (34 anos)</div>
                  <div><span className="text-slate-500">Geração:</span> Sansei (日系三世)</div>
                  <div><span className="text-slate-500">Koseki Touhon:</span> Válido / Emitido</div>
                  <div className="text-cyan-300 font-semibold"><span className="text-slate-500">Calçado EPI:</span> 26.5 cm</div>
                  <div className="text-cyan-300 font-semibold"><span className="text-slate-500">Cintura EPI:</span> 84 cm</div>
                </div>
              </div>

              <div className="space-y-2 font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[11px] font-bold text-amber-400 border-b border-slate-800 pb-1">
                  PÁGINA 2 — ENQUETE A/B/C (APTIDÃO, SAÚDE & MOTIVAÇÃO)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Horas Extras:</span> Aceita 30h+/mês</div>
                  <div><span className="text-slate-500">Turnos:</span> Alternado / Diurno</div>
                  <div><span className="text-slate-500">Tatuagem:</span> Não possui</div>
                  <div className="text-purple-300 font-semibold"><span className="text-slate-500">Saúde Bloco B:</span> 🔒 pgcrypto encrypted</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-right pt-1">
                Motor ExcelJS · Ready for Direct Download or Garoon Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📱 SECTION 3: FORM WIZARD STEPPER INTERACTIVE DEMO */}
      <section id="stepper" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="space-y-4 text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 badge-jp">
            <Cpu className="w-3.5 h-3.5" />
            {t.stepper.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t.stepper.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
            {t.stepper.subtitle}
          </p>
        </div>

        {/* Wizard Stepper Interactive Widget */}
        <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-6">
          {/* Steps Progress Header */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-4 border-b border-slate-800 text-xs font-semibold">
            {[
              { num: 1, label: t.stepper.step1 },
              { num: 2, label: t.stepper.step2 },
              { num: 3, label: t.stepper.step3 },
              { num: 4, label: t.stepper.step4 },
              { num: 5, label: t.stepper.step5 },
            ].map(s => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-3 rounded-xl text-left transition-all ${
                  activeStep === s.num
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : activeStep > s.num
                    ? 'bg-slate-900 text-emerald-400 border border-emerald-800/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] opacity-75">PASSO {s.num}</div>
                <div className="truncate mt-0.5">{s.label}</div>
              </button>
            ))}
          </div>

          {/* AI CV Upload Simulation Trigger */}
          <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t.stepper.aiUploadTitle}</h4>
                <p className="text-xs text-slate-400">{t.stepper.aiUploadSub}</p>
              </div>
            </div>

            <button 
              onClick={handleSimulateAiUpload}
              disabled={isAiParsing}
              className="btn-cyan text-xs py-2 px-4 whitespace-nowrap"
            >
              {isAiParsing ? 'Lendo com DeepSeek IA...' : '⚡ Testar Extração IA'}
            </button>
          </div>

          {aiSuccess && (
            <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-xl text-xs text-purple-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
              Currículo analisado pelo DeepSeek V3! Campos preenchidos automaticamente.
            </div>
          )}

          {/* Step Active Form Display */}
          <div className="space-y-4 pt-2">
            {activeStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Nome Completo (RG):</label>
                  <input 
                    type="text" 
                    value={formState.fullName}
                    onChange={e => setFormState({...formState, fullName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white mt-1 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Data de Nascimento:</label>
                  <input 
                    type="date" 
                    value={formState.birthDate}
                    onChange={e => setFormState({...formState, birthDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white mt-1 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs text-cyan-300 font-semibold block mb-2">{t.stepper.footSizeLabel}</label>
                  <div className="flex flex-wrap gap-2">
                    {[24.5, 25.0, 25.5, 26.0, 26.5, 27.0, 27.5, 28.0].map(size => (
                      <button
                        key={size}
                        onClick={() => setFormState({...formState, footSizeCm: size})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          formState.footSizeCm === size 
                            ? 'bg-cyan-500 text-slate-950 shadow' 
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {size} cm
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-cyan-300 font-semibold block mb-2">{t.stepper.waistSizeLabel}</label>
                  <input 
                    type="number" 
                    value={formState.waistSizeCm}
                    onChange={e => setFormState({...formState, waistSizeCm: Number(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    {t.stepper.screeningBadge}
                  </div>
                  <p>
                    Resultado da Pré-Triagem: <strong>APROVADO (Score 92/100)</strong>. Cumpre idade (&lt;55 anos), certidões Koseki válidas e experiência prévia na província de Aichi. Parecer mantido em histórico imutável (Art. 20 LGPD).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button 
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="btn-secondary text-xs py-2 px-4 disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
              disabled={activeStep === 5}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
            >
              Próximo Passo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 💰 SECTION 4: ROI & DEEPSEEK COST CALCULATOR */}
      <section id="roi" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="space-y-4 text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 badge-cyan">
            <DollarSign className="w-3.5 h-3.5" />
            {t.roi.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t.roi.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
            {t.roi.subtitle}
          </p>
        </div>

        <div className="glass-panel p-8 border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Sliders Control */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>{t.roi.candidatesLabel}</span>
                <span className="text-cyan-400 text-sm font-bold">{candidateCount} candidatos</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="1000" 
                step="10"
                value={candidateCount}
                onChange={e => setCandidateCount(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>{t.roi.agenciesLabel}</span>
                <span className="text-emerald-400 text-sm font-bold">{agencyCount} agências</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={agencyCount}
                onChange={e => setAgencyCount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">{t.roi.hoursSavedTitle}</div>
              <div className="text-3xl font-extrabold text-cyan-400">{hoursSavedPerMonth} hrs</div>
              <p className="text-[11px] text-slate-500">Eliminação de digitação manual</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">{t.roi.opexSavedTitle}</div>
              <div className="text-3xl font-extrabold text-emerald-400">R$ {opexDeepSeekSavedYearly.toLocaleString('pt-BR')}</div>
              <p className="text-[11px] text-slate-500">DeepSeek V3 vs Claude 3.5</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 SECTION 5: DUAL DASHBOARD INTERACTIVE PREVIEW */}
      <section id="dashboards" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="space-y-4 text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 badge-jp">
            <BarChart3 className="w-3.5 h-3.5" />
            {t.dashboards.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t.dashboards.title}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setDashTab('tenant')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              dashTab === 'tenant'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {t.dashboards.tabTenant}
          </button>
          <button
            onClick={() => setDashTab('superadmin')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              dashTab === 'superadmin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {t.dashboards.tabSuperAdmin}
          </button>
        </div>

        {/* Dashboard Content Mock */}
        {dashTab === 'tenant' ? (
          <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white">{t.dashboards.tenantTitle}</h3>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800/40">
                Organização: FUJIARTE Co., Ltd.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total no Funil</div>
                <div className="text-2xl font-bold text-white mt-1">428</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Vistos COE em Emissão</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">64</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Tempo Médio Form</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">7.8 min</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Agências Ativas</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">12</div>
              </div>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {t.dashboards.slaAlert}
              </span>
              <span className="font-bold text-amber-200">5 Candidatos</span>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 border-purple-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white">{t.dashboards.superAdminTitle}</h3>
              <span className="text-xs text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40">
                Dono do SaaS: Rafael Maldivas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">{t.dashboards.mrrLabel}</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">R$ 48.500 /mês</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Tenants (Empreiteiras)</div>
                <div className="text-2xl font-bold text-white mt-1">6 Ativos</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">{t.dashboards.deepseekSavings}</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">R$ 14.200 /mês</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Disparos WhatsApp API</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">18.420 msgs</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 🔴 FOOTER */}
      <footer className="mt-auto py-10 px-4 lg:px-8 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">SelectSys Jobs V2</span>
            <span>—</span>
            <span>{t.footer.rights}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>{t.footer.compliance}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
