import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../dados/supabase';

export function ProtectedRoute() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Listener para mudanças na autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    }
    
    checkAuth();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ssj-paper)', color: 'var(--ssj-text)' }}>Verificando credenciais...</div>;
  }

  if (!session) {
    // Redireciona para o login e salva a página que tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
