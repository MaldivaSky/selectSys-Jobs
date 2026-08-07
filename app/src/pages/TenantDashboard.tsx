import { BarChart3, AlertTriangle, Building2 } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';

export function TenantDashboard({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto space-y-12 bg-slate-50">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full">
          <Building2 className="w-4 h-4" />
          Painel Executivo da Empreiteira (FUJIARTE)
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
          Gestão do Pipeline Dekassegui
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Acompanhamento em tempo real das 11 etapas do processo de exportação de mão de obra (Candidatura ➔ Triagem ➔ COE ➔ Visto ➔ Embarque).
        </p>
      </div>

      {/* Generated ATS Dashboard Visual Showcase */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
        <img 
          src="/images/ats_dashboard.png" 
          alt="Dashboard Kanban ATS Dekassegui FUJIARTE" 
          className="w-full h-auto object-cover max-h-[500px]"
        />
      </div>

      {/* Tenant Metrics Grid */}
      <div className="clean-card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            Visão Geral do Funil de Candidatos
          </h2>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-bold">
            Organização: FUJIARTE Co., Ltd.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Total no Funil</div>
            <div className="text-3xl font-extrabold text-slate-900">428</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Vistos COE em Emissão</div>
            <div className="text-3xl font-extrabold text-amber-600">64</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Tempo Médio Form</div>
            <div className="text-3xl font-extrabold text-sky-600">7.8 min</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Agências Ativas</div>
            <div className="text-3xl font-extrabold text-emerald-600">12</div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {t.dashboards.slaAlert}
          </span>
          <span className="font-extrabold text-amber-800">5 Candidatos em Alerta</span>
        </div>
      </div>
    </div>
  );
}
