import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BootSplash } from './components/BootSplash';
import { PageTransition } from './components/PageTransition';
import { HomePage } from './pages/HomePage';
import { FuncionalidadesView } from './pages/FuncionalidadesView';
import { CandidateWizard } from './pages/CandidateWizard';
import { FichaRenderer } from './components/ficha/FichaRenderer';
import { AuthPortal } from './pages/AuthPortal';
import { VagasHub } from './pages/VagasHub';
import { VagaDetalhe } from './pages/VagaDetalhe';
import { TenantDashboard } from './pages/TenantDashboard';
import { PlanoAcaoView } from './pages/PlanoAcaoView';
import { SuperAdmin } from './pages/SuperAdmin';
import { FujiarteCase } from './pages/FujiarteCase';
import PrototipoApp from './pages/PrototipoApp';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RegisterTenant } from './pages/RegisterTenant';
import { PoliticaPrivacidade } from './pages/PoliticaPrivacidade';
import { TermosUso } from './pages/TermosUso';
import type { Language } from './translations';

function AppLayout({ lang, setLang }: { lang: Language, setLang: (l: Language) => void }) {
  const location = useLocation();
  /* Rotas white-label: o ambiente pertence à agência (ou ao candidato dela),
     então a navbar e o rodapé institucionais do SelectSys não entram. O painel
     do tenant precisa disso: com a barra "Entrar / Proposta comercial" por cima,
     a marca do cliente vira um detalhe no meio da nossa. */
  const isWhiteLabelRoute =
    location.pathname.startsWith('/c/') ||
    location.pathname === '/candidato' ||
    location.pathname.startsWith('/admin');

  return (
    <div className="ssj-shell">
      {!isWhiteLabelRoute && <Navbar lang={lang} setLang={setLang} />}

      <main className="ssj-main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plano-acao" element={<PlanoAcaoView lang={lang} />} />
            <Route path="/fujiarte" element={<FujiarteCase lang={lang} />} />
            <Route path="/prototipo" element={<PrototipoApp />} />
            <Route path="/login" element={<AuthPortal />} />
            <Route path="/funcionalidades" element={<FuncionalidadesView lang={lang} />} />
            <Route path="/vagas" element={<VagasHub lang={lang} />} />
            <Route path="/vagas/:id" element={<VagaDetalhe lang={lang} />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<TenantDashboard />} />
              <Route path="/admin/:tenantSlug" element={<TenantDashboard />} />
              <Route path="/superadmin" element={<SuperAdmin lang={lang} />} />
            </Route>
            {/* Área do Candidato (B2C) - Roteamento Multi-Tenant */}
            <Route path="/c/:tenantSlug" element={<CandidateWizard lang={lang} />} />
            <Route path="/candidato" element={<Navigate to="/c/fujiarte" replace />} />
            
            <Route path="/ficha" element={<FichaRenderer />} />
            
            <Route path="/signup/admin" element={<RegisterTenant />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos" element={<TermosUso />} />
          </Routes>
        </PageTransition>
      </main>

      {!isWhiteLabelRoute && <Footer />}
    </div>
  );
}

export function App() {
  const [lang, setLang] = useState<Language>('pt-BR');

  return (
    <Router>
      <BootSplash />
      <AppLayout lang={lang} setLang={setLang} />
    </Router>
  );
}

export default App;
