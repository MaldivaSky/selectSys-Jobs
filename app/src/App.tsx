import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BootSplash } from './components/BootSplash';
import { PageTransition } from './components/PageTransition';
import { HomePage } from './pages/HomePage';
import { FuncionalidadesView } from './pages/FuncionalidadesView';
import { ClaudeFUJIARTEWalkthrough } from './pages/ClaudeFUJIARTEWalkthrough';
import { FujiarteCase } from './pages/FujiarteCase';
import { CandidateWizard } from './pages/CandidateWizard';
import { FichaRenderer } from './components/ficha/FichaRenderer';
import { AuthPortal } from './pages/AuthPortal';
import { VagasHub } from './pages/VagasHub';
import { TenantDashboard } from './pages/TenantDashboard';
import { PlanoAcaoView } from './pages/PlanoAcaoView';
import { SuperAdmin } from './pages/SuperAdmin';
import type { Language } from './translations';

export function App() {
  const [lang, setLang] = useState<Language>('pt-BR');

  return (
    <Router>
      {/* Abertura da marca — uma vez por sessão. */}
      <BootSplash />

      <div className="ssj-shell">
        <Navbar lang={lang} setLang={setLang} />

        <main className="ssj-main">
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage lang={lang} />} />
              <Route path="/login" element={<AuthPortal />} />
              <Route path="/funcionalidades" element={<FuncionalidadesView lang={lang} />} />
              <Route path="/prototipo" element={<ClaudeFUJIARTEWalkthrough />} />
              <Route path="/candidato" element={<CandidateWizard lang={lang} />} />
              {/* Ficha completa: 7 etapas geradas do schema versionado */}
              <Route path="/ficha" element={<FichaRenderer />} />
              <Route path="/vagas" element={<VagasHub lang={lang} />} />
              <Route path="/fujiarte" element={<FujiarteCase lang={lang} />} />
              <Route path="/plano-acao" element={<PlanoAcaoView lang={lang} />} />
              <Route path="/admin" element={<TenantDashboard lang={lang} />} />
              <Route path="/superadmin" element={<SuperAdmin lang={lang} />} />
            </Routes>
          </PageTransition>
        </main>

        <Footer lang={lang} />
      </div>
    </Router>
  );
}

export default App;
