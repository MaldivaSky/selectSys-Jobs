import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Building2, JapaneseYen, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../dados/supabase';
import type { Language } from '../translations';
import { useTheme } from '../theme/theme';

export function VagasHub({ lang: _lang }: { lang?: Language }) {
  const { escuro: isDark } = useTheme();
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroProvincia, setFiltroProvincia] = useState('Todas');
  
  const pageBg = isDark ? '#0d1016' : '#f4f5f2';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#7a827f';
  const cardBorder = isDark ? '#29313c' : '#e0e2dc';
  const accentIndigo = isDark ? '#7ba4de' : '#294b86';

  useEffect(() => {
    async function carregarVagas() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, titulo, descricao, provincia, cidade, salario_hora, tipo_contrato, horario,
          organizations ( nome )
        `)
        .eq('status', 'aberta')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVagas(data);
      }
      setLoading(false);
    }
    carregarVagas();
  }, []);

  const provincias = ['Todas', ...Array.from(new Set(vagas.map(v => v.provincia)))];
  const vagasFiltradas = filtroProvincia === 'Todas' ? vagas : vagas.filter(v => v.provincia === filtroProvincia);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* HEADER B2C */}
      <div style={{ maxWidth: '1000px', width: '100%', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Vagas de Trabalho no Japão
        </h1>
        <p style={{ fontSize: '1.2rem', color: textSecondary, maxWidth: '600px', margin: '0 auto' }}>
          Encontre oportunidades nas melhores empreiteiras, com suporte completo para o visto COE e passagens.
        </p>
      </div>

      {/* FILTROS */}
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', flex: 1, minWidth: '250px' }}>
          <Search size={18} color={textSecondary} />
          <input 
            type="text" 
            placeholder="Buscar por cargo (ex: Autopeças, Solda...)" 
            style={{ border: 'none', background: 'transparent', outline: 'none', color: textPrimary, width: '100%', fontSize: '15px' }}
          />
        </div>
        
        <select 
          value={filtroProvincia}
          onChange={e => setFiltroProvincia(e.target.value)}
          style={{ padding: '12px 24px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', color: textPrimary, fontSize: '15px', fontWeight: 600, outline: 'none', minWidth: '180px' }}
        >
          {provincias.map(p => (
            <option key={p} value={p}>{p === 'Todas' ? '📍 Todas as Províncias' : p}</option>
          ))}
        </select>
      </div>

      {/* LISTAGEM DE VAGAS */}
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: textSecondary }}>Carregando vagas...</div>
        ) : vagasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: cardBg, borderRadius: '16px', border: `1px dashed ${cardBorder}` }}>
            <h3 style={{ fontSize: '1.2rem', color: textSecondary }}>Nenhuma vaga encontrada no momento.</h3>
          </div>
        ) : (
          vagasFiltradas.map(vaga => (
            <Link 
              key={vaga.id} 
              to={`/vagas/${vaga.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{ 
                backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '24px',
                display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: textSecondary, fontSize: '13px', fontWeight: 600 }}>
                    <Building2 size={16} /> <span>{vaga.organizations?.nome || 'Empreiteira Oficial'}</span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: textPrimary, marginBottom: '12px' }}>
                    {vaga.titulo}
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '6px 12px', borderRadius: '8px' }}>
                      <MapPin size={14} color={accentIndigo} /> {vaga.cidade}, {vaga.provincia}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '6px 12px', borderRadius: '8px' }}>
                      <JapaneseYen size={14} color="#1f7a4d" /> ¥ {vaga.salario_hora}/hora
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '6px 12px', borderRadius: '8px' }}>
                      <Clock size={14} /> {vaga.tipo_contrato}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: accentIndigo, fontWeight: 700, fontSize: '14px' }}>Ver detalhes</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isDark ? '#1c222c' : '#f4f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={18} color={accentIndigo} />
                  </div>
                </div>

              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
