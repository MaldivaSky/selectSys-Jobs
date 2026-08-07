import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, FileSpreadsheet, Cpu, ShieldCheck, 
  CheckCircle2, ArrowRight, Building2, DollarSign
} from 'lucide-react';
import type { Language } from '../translations';

export function Home({ lang }: { lang: Language }) {
  console.log('Language active:', lang);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportDone, setExportDone] = useState<boolean>(false);

  // ROI Calculator Sliders
  const [candidatesPerMonth, setCandidatesPerMonth] = useState<number>(150);
  const [agenciesCount, setAgenciesCount] = useState<number>(8);

  const hoursSavedPerMonth = Math.round(candidatesPerMonth * 0.35 + agenciesCount * 4);
  const yearlyDeepSeekSavedBrl = Math.round(candidatesPerMonth * 12 * 0.85);

  const handleSimulateExcelExport = () => {
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
    }, 800);
  };

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto space-y-20 bg-slate-50">
      {/* 🔴 1. HERO SECTION (CRISP LIGHT PITCH) */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-4 h-4 text-rose-600" />
          Plataforma SaaS Homologada para a Operação Dekassegui (Brasil ➔ Japão)
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Transforme semanas de digitação em <span className="text-rose-600">7 minutos digitais.</span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
          Digitalize 130 campos da Ficha FUJIARTE com inteligência IA DeepSeek V3, exporte planilhas .XLS com 100% de fidelidade e garanta total compliance LGPD.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/fujiarte" className="btn-rose text-sm py-3.5 px-7 shadow-md">
            Ver Case FUJIARTE & Simulador .XLS
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/candidato" className="btn-secondary text-sm py-3.5 px-7">
            Portal do Candidato (Form Stepper)
          </Link>
        </div>

        {/* Hero Visual Mockup Image */}
        <div className="pt-6">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
            <img 
              src="/images/ats_dashboard.png" 
              alt="Painel de gestão SelectSys Jobs V2" 
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* 🔴 2. THREE ENTERPRISE PILLARS WITH GENERATED UI IMAGES */}
      <section className="space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Desenvolvido sob Medida para as Exigências do Japão
          </h2>
          <p className="text-slate-600 text-sm">
            Uma arquitetura robusta pensada para a operação da FUJIARTE e agências parceiras no Brasil.
          </p>
        </div>

        {/* Pillar 1: Case FUJIARTE Excel Exporter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-md">
              <Building2 className="w-4 h-4" />
              CASE FUJIARTE — REQUISITO HOMOLOGADO
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Gerador Fiel de Planilhas <span className="text-rose-600">.XLS</span>
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Exportação instantânea dos 130 campos da Ficha Cadastral tradicional (<span className="font-mono text-slate-900 font-bold">白紙 FUJIARTE</span>) respeitando mesclagens, fontes e fórmulas de biometria exigidas no Japão.
            </p>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleSimulateExcelExport}
                disabled={isExporting}
                className="btn-rose text-xs py-3 px-6"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isExporting ? 'Gerando planilha no layout FUJIARTE...' : '⚡ Executar Exportação Simulada .XLS'}
              </button>

              {exportDone && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Planilha exportada com sucesso em 0.3s (Template Fiel 白紙 FUJIARTE)!
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
            <img 
              src="/images/fujiarte_excel.png" 
              alt="Planilha Ficha Cadastral FUJIARTE .XLS" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Pillar 2: Candidate Wizard & AI DeepSeek */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
            <img 
              src="/images/mobile_stepper.png" 
              alt="Portal do Candidato Mobile Stepper" 
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-md">
              <Cpu className="w-4 h-4" />
              TECNOLOGIA DE IA DEEPSEEK V3 / R1
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Preenchimento Automático em 5 Passos
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              O candidato envia a foto do documento e a IA faz a leitura de 60-70% das informações pessoais, acelerando a triagem de biometria de equipamentos de proteção e enquetes de saúde.
            </p>

            <div className="pt-2">
              <Link to="/candidato" className="btn-primary text-xs py-3 px-6">
                Testar Portal do Candidato
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 3. FINANCIAL ROI CALCULATOR SECTION */}
      <section className="clean-card p-8 sm:p-12 space-y-8 bg-white border-slate-200 shadow-sm">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
            <DollarSign className="w-4 h-4" />
            CALCULADORA DE RETORNO SOBRE INVESTIMENTO
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Simulador de Retorno Financeiro
          </h2>
          <p className="text-slate-600 text-sm">
            Calcule as horas de digitação economizadas e a redução de custos OpEx na sua operação.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Volume de Candidatos por Mês:</span>
                <span className="text-rose-600 font-extrabold">{candidatesPerMonth} candidatos</span>
              </div>
              <input
                type="range" min="20" max="1000" step="10" value={candidatesPerMonth}
                onChange={e => setCandidatesPerMonth(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
                <span>Agências Parceiras Indicadoras:</span>
                <span className="text-rose-600 font-extrabold">{agenciesCount} agências</span>
              </div>
              <input
                type="range" min="1" max="50" value={agenciesCount}
                onChange={e => setAgenciesCount(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Horas Economizadas/Mês</div>
              <div className="text-3xl font-extrabold text-slate-900">{hoursSavedPerMonth} hrs</div>
              <div className="text-[11px] text-slate-500">Menos retrabalho em Excel</div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Economia Custo IA Anual</div>
              <div className="text-3xl font-extrabold text-rose-600">R$ {yearlyDeepSeekSavedBrl.toLocaleString('pt-BR')}</div>
              <div className="text-[11px] text-slate-500">DeepSeek vs Claude</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔴 4. CALL TO ACTION SECTION */}
      <section className="bg-slate-900 text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-300 bg-rose-950 px-4 py-1.5 rounded-full border border-rose-800">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          Proposta Comercial Vencedora para Segunda-Feira
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Pronto para revolucionar o recrutamento da FUJIARTE?
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Entre em contato conosco para agendar a demonstração técnica ao vivo do protótipo e assinar o plano master.
        </p>

        <div className="pt-2">
          <Link to="/fujiarte" className="btn-rose text-sm py-4 px-8 shadow-lg">
            Acessar Demonstração do Case FUJIARTE
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
