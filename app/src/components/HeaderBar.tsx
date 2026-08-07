import { Link } from 'react-router-dom';
import { Search, Plus, Bell, Shield, User } from 'lucide-react';
import type { Language } from '../translations';

interface HeaderBarProps {
  lang: Language;
  setLang: (l: Language) => void;
}

export function HeaderBar({ lang, setLang }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 px-4 lg:px-6 py-3 backdrop-blur-md flex items-center justify-between gap-4">
      {/* Search Input Bar (ATS Search UX Pattern) */}
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar candidato por nome, visto COE, CPF, fábrica..." 
          className="bg-transparent text-xs text-white placeholder-slate-500 border-none outline-none w-full"
        />
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <Link to="/candidato" className="btn-rose text-xs py-1.5 px-3 flex items-center gap-1.5 no-underline">
          <Plus className="w-4 h-4" />
          <span>Novo Candidato</span>
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Language Selector Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px]">
          <button
            onClick={() => setLang('pt-BR')}
            className={`px-2 py-0.5 rounded font-semibold transition-all ${
              lang === 'pt-BR' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLang('ja-JP')}
            className={`px-2 py-0.5 rounded font-semibold transition-all ${
              lang === 'ja-JP' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => setLang('en-US')}
            className={`px-2 py-0.5 rounded font-semibold transition-all ${
              lang === 'en-US' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-none">Rafael Maldivas</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>CTO & Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
