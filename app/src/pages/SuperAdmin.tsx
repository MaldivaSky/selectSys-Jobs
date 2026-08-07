import { useState } from 'react';
import { Shield, DollarSign } from 'lucide-react';
import type { Language } from '../translations';

export function SuperAdmin({ lang }: { lang: Language }) {
  console.log('Active lang:', lang);

  // State for ROI Calculator
  const [candidateCount, setCandidateCount] = useState<number>(150);
  const [agencyCount, setAgencyCount] = useState<number>(8);

  const hoursSavedPerMonth = Math.round(candidateCount * 0.35 + agencyCount * 4);
  const opexDeepSeekSavedYearly = Math.round(candidateCount * 12 * 0.85);

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-3.5 py-1.5 rounded-full">
          <Shield className="w-4 h-4" />
          SuperAdmin — Painel Global do Proprietário (Rafael Maldivas)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Visão Geral do SaaS & Métricas Globais
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Monitoramento global de MRR, retenção de tenants (empreiteiras), consumo de IA DeepSeek e infraestrutura.
        </p>
      </div>

      {/* SuperAdmin Grid */}
      <div className="clean-card p-6 sm:p-8 space-y-6 border-purple-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-lg text-white">Métricas Financeiras & Infraestrutura Global</h2>
          <span className="text-xs text-purple-300 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/40 font-semibold">
            Proprietário: Rafael Maldivas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">MRR Mensal</div>
            <div className="text-2xl font-extrabold text-purple-400">R$ 48.500</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Tenants Ativos</div>
            <div className="text-2xl font-extrabold text-white">6 Empreiteiras</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Economia DeepSeek</div>
            <div className="text-2xl font-extrabold text-emerald-400">R$ 14.200/mês</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Disparos WhatsApp API</div>
            <div className="text-2xl font-extrabold text-sky-400">18.420 msgs</div>
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="clean-card p-6 sm:p-8 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Simulador de ROI de Vendas B2B & OpEx DeepSeek
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Volume de Candidatos/Mês:</span>
                <span className="text-sky-400 font-bold">{candidateCount} candidatos</span>
              </div>
              <input 
                type="range" min="20" max="1000" step="10" value={candidateCount}
                onChange={e => setCandidateCount(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Agências Indicadoras Parceiras:</span>
                <span className="text-emerald-400 font-bold">{agencyCount} agências</span>
              </div>
              <input 
                type="range" min="1" max="50" value={agencyCount}
                onChange={e => setAgencyCount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Horas Economizadas/Mês</div>
              <div className="text-3xl font-extrabold text-sky-400">{hoursSavedPerMonth} hrs</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Economia Anual OpEx IA</div>
              <div className="text-3xl font-extrabold text-emerald-400">R$ {opexDeepSeekSavedYearly.toLocaleString('pt-BR')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
