import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sun, Moon, LogIn } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';
import { BRAND } from '../brand/brand';
import { useTheme } from '../theme/theme';
import type { Language } from '../translations';

interface NavbarProps {
  lang?: Language;
  setLang?: (l: Language) => void;
}

const DEMOS = [
  {
    path: '/prototipo',
    label: 'Protótipo interativo',
    desc: 'O processo inteiro, do lado de quem contrata e do lado de quem viaja',
  },
  {
    path: '/candidato',
    label: 'Ficha FUJIARTE (~130 campos)',
    desc: 'Formulário oficial da FUJIARTE com biometria e LGPD em 7 etapas',
  },
  {
    path: '/admin',
    label: 'Kanban do Pipeline',
    desc: 'Visão do analista e empreiteira com os 17 estados do funil',
  },
];

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

  const emDemo = DEMOS.some((d) => d.path === pathname);

  return (
    <header className={`ssj-nav${gaveta ? ' ssj-nav--open' : ''}`}>
      <div className="ssj-container">
        <div className="ssj-nav__bar">
          <Link to="/" aria-label={`${BRAND.name} — início`} style={{ display: 'inline-flex', flex: 'none' }}>
            <BrandLockup size={44} withTagline />
          </Link>

          <nav className="ssj-nav__links" aria-label="Navegação principal">
            <NavLink to="/funcionalidades" className="ssj-nav__link">
              Plataforma
            </NavLink>

            <div className="ssj-menu" ref={menuRef}>
              <button
                className="ssj-nav__link"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                aria-haspopup="true"
                style={{
                  gap: 6,
                  cursor: 'pointer',
                  color: emDemo ? 'var(--ssj-text)' : undefined,
                  fontWeight: emDemo ? 600 : undefined,
                  background: emDemo ? 'var(--ssj-surface-2)' : undefined,
                }}
              >
                Demonstrações
                <ChevronDown size={15} style={{ transform: menu ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }} />
              </button>

              {menu && (
                <div className="ssj-menu__panel" role="menu">
                  {DEMOS.map((d) => (
                    <Link key={d.path} to={d.path} className="ssj-menu__item" role="menuitem">
                      <strong>{d.label}</strong>
                      <span>{d.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/fujiarte" className="ssj-nav__link">
              Case FUJIARTE
            </NavLink>
          </nav>

          <div className="ssj-nav__actions">
            <button
              className="ssj-icon-btn"
              onClick={alternar}
              aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={escuro ? 'Tema claro' : 'Tema escuro'}
              style={{ width: 40, height: 40, borderRadius: 20 }}
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
              style={{ width: 40, height: 40, borderRadius: 20 }}
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
            <span className="ssj-label" style={{ padding: '14px 14px 6px' }}>
              Demonstrações
            </span>
            {DEMOS.map((d) => (
              <NavLink key={d.path} to={d.path} className="ssj-nav__link">
                {d.label}
              </NavLink>
            ))}
            <NavLink to="/fujiarte" className="ssj-nav__link">
              Case FUJIARTE
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
