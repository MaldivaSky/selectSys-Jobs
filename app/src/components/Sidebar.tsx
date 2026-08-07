import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Briefcase, FileSpreadsheet, 
  Settings, Sparkles
} from 'lucide-react';
import type { Language } from '../translations';
import { BrandMark } from '../brand/BrandMark';

interface SidebarProps {
  lang: Language;
}

export function Sidebar({ lang }: SidebarProps) {
  console.log('Sidebar lang:', lang);

  const menuItems = [
    { path: '/admin', label: 'Funil & Kanban', icon: LayoutDashboard, badge: '11 Etapas' },
    { path: '/candidato', label: 'Ficha & Stepper', icon: FileText, badge: 'Mobile-First' },
    { path: '/fujiarte', label: 'Exportador FUJIARTE', icon: FileSpreadsheet, badge: 'Excel .XLS' },
    { path: '/vagas', label: 'Vagas & Postos Japão', icon: Briefcase, badge: 'Geo-SEO' },
    { path: '/superadmin', label: 'SuperAdmin SaaS', icon: Settings, badge: 'Dono SaaS' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white shadow-md text-base">
            <BrandMark size={22} tone="light" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight font-display">
                SelectSys<span className="text-rose-500">Jobs</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Dekassegui SaaS V2</p>
          </div>
        </div>

        {/* Tenant Switcher Box */}
        <div className="p-3 m-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Organização Ativa</div>
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>FUJIARTE Co., Ltd. 🇯🇵</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all no-underline ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* DeepSeek AI Cost Card in Sidebar */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-950 to-purple-950/40 rounded-xl border border-purple-800/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Motor DeepSeek V3</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          OpEx de IA reduzido em 95% com extração inteligente e tradução PT ➔ JA.
        </p>
        <div className="text-[10px] text-emerald-400 font-mono font-semibold pt-1 border-t border-purple-900/40 flex items-center justify-between">
          <span>Economia Anual:</span>
          <span>R$ 14.200</span>
        </div>
      </div>
    </aside>
  );
}
