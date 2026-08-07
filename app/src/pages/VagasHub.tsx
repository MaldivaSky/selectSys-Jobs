import { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';
import type { JobVacancy } from '../types';

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

export function VagasHub({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const filteredVacancies = selectedProvince === 'all' 
    ? mockVacancies 
    : mockVacancies.filter(v => v.province === selectedProvince);

  return (
    <div className="py-10 px-4 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300 bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-full">
          <Globe className="w-3.5 h-3.5" />
          {t.geoSeo.tag}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          {t.geoSeo.title}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          {t.geoSeo.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
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
                ? 'bg-sky-500 text-slate-950 shadow-lg' 
                : 'clean-card text-slate-300 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVacancies.map(job => (
          <div key={job.id} className="clean-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-jp">{job.provinceName}</span>
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  Google Jobs
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-snug">{job.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{job.titleJp}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Salário / 𡈽給:</span>
                  <span className="font-bold text-sky-300">{job.salaryJpy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BRL Est.:</span>
                  <span className="font-semibold text-emerald-400">{job.salaryBrlEst}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Elegibilidade:</span>
                  <span className="text-slate-200">{job.nikkeiEligible}</span>
                </div>
              </div>
            </div>
            <a href="/candidato" className="btn-cyan text-xs text-center justify-center py-2.5 w-full no-underline">
              Candidatar-se via Form Stepper
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
