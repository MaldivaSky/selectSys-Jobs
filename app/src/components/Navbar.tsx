import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogIn } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';
import { BRAND } from '../brand/brand';
import { useTheme } from '../theme/contexto';
import type { Language } from '../translations';

interface NavbarProps {
  lang?: Language;
  setLang?: (l: Language) => void;
}



export function Navbar({ lang: _lang }: NavbarProps) {
  const { pathname } = useLocation();
  const { escuro, alternar } = useTheme();
  const [gaveta, setGaveta] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Navegou: fecha tudo.
  useEffect(() => {
    setGaveta(false);
    setMenu(false);
  }, [pathname]);

  // Clique fora / Esc fecham o menu suspenso.
  useEffect(() => {
    if (!menu) return;
    const fora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [menu]);



  return (
    <header className={`ssj-nav${gaveta ? ' ssj-nav--open' : ''}`}>
      <div className="ssj-container">
        <div className="ssj-nav__bar">
          <Link to="/" aria-label={`${BRAND.name} — início`} style={{ display: 'inline-flex', flex: 'none' }}>
            {/* Sem tagline no celular: o lockup completo come 257px dos 375px
                da tela e é o que empurrava a barra para fora do viewport. */}
            <BrandLockup size={44} withTagline className="ssj-nav__brand" />
          </Link>

          <nav className="ssj-nav__links" aria-label="Navegação principal">
            <NavLink to="/funcionalidades" className="ssj-nav__link">
              Plataforma
            </NavLink>



            <NavLink to="/vagas" className="ssj-nav__link">
              Ver Vagas
            </NavLink>
          </nav>

          <div className="ssj-nav__actions">
            <button
              className="ssj-icon-btn"
              onClick={alternar}
              aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={escuro ? 'Tema claro' : 'Tema escuro'}
            >
              {escuro ? <Sun size={17} style={{ color: 'var(--ssj-ambar)' }} /> : <Moon size={17} style={{ color: 'var(--ssj-indigo)' }} />}
            </button>

            <Link to="/login" className="ssj-nav-btn ssj-nav-btn--ghost">
              <LogIn size={15} /> Entrar 
            
            </Link>

            <Link to="/plano-acao" className="ssj-nav-btn ssj-nav-btn--primary ssj-btn--hide-sm">
              Proposta comercial
            </Link>

            <button
              className="ssj-nav__burger"
              onClick={() => setGaveta((v) => !v)}
              aria-expanded={gaveta}
              aria-label={gaveta ? 'Fechar menu' : 'Abrir menu'}
            >
              {gaveta ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {gaveta && (
          <nav className="ssj-drawer" aria-label="Navegação principal">
            <NavLink to="/funcionalidades" className="ssj-nav__link">
              Plataforma
            </NavLink>

            <NavLink to="/vagas" className="ssj-nav__link">
              Ver Vagas
            </NavLink>
            <Link to="/login" className="ssj-btn ssj-btn--ghost ssj-btn--block" style={{ marginTop: 8 }}>
              Entrar no Portal
            </Link>
            <Link to="/plano-acao" className="ssj-btn ssj-btn--pri ssj-btn--block" style={{ marginTop: 8 }}>
              Proposta comercial
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
