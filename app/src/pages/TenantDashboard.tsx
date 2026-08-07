import { useState, useEffect } from 'react';
import { supabase } from '../dados/supabase';
import { Plus, Briefcase, Users, LayoutDashboard, Building2, Calendar, FileText } from 'lucide-react';
import type { Language } from '../translations';
import { useTheme } from '../theme/theme';

export function TenantDashboard({ lang }: { lang: Language }) {
  const { escuro: isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'vagas' | 'candidatos' | 'configuracoes'>('vagas');
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [novaVaga, setNovaVaga] = useState({
    titulo: '',
    descricao: '',
    provincia: '',
    cidade: '',
    salario_hora: '',
    tipo_contrato: 'Haken (Temporário)'
  });
  const [modalNovaVaga, setModalNovaVaga] = useState(false);

  // PALETA DO DASHBOARD (B2B)
  const pageBg = isDark ? '#0d1016' : '#f0f2f5';
  const sidebarBg = isDark ? '#161b24' : '#ffffff';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#7a827f';
  const cardBorder = isDark ? '#29313c' : '#e0e2dc';
  const accentPri = isDark ? '#7ba4de' : '#294b86';

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    // Aqui buscaríamos pelo ID da organização da sessão atual.
    // Como estamos homologando, vamos puxar da FUJIARTE criada no seed.
    const { data: orgData } = await supabase.from('organizations').select('id').eq('slug', 'fujiarte').single();
    
    if (orgData) {
      const { data: vagasData } = await supabase
        .from('jobs')
        .select('*')
        .eq('organization_id', orgData.id)
        .order('created_at', { ascending: false });
      
      if (vagasData) setVagas(vagasData);
    }
    setLoading(false);
  }

  async function handleCriarVaga(e: React.FormEvent) {
    e.preventDefault();
    const { data: orgData } = await supabase.from('organizations').select('id').eq('slug', 'fujiarte').single();
    if (!orgData) return alert("Erro: Organização não encontrada.");

    const payload = {
      ...novaVaga,
      organization_id: orgData.id,
      salario_hora: parseFloat(novaVaga.salario_hora),
      status: 'aberta'
    };

    const { error } = await supabase.from('jobs').insert(payload);
    
    if (error) {
      alert("Erro ao criar vaga: " + error.message);
    } else {
      setModalNovaVaga(false);
      setNovaVaga({ titulo: '', descricao: '', provincia: '', cidade: '', salario_hora: '', tipo_contrato: 'Haken' });
      carregarDados(); // Recarrega a lista
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: pageBg, color: textPrimary }}>
      
      {/* SIDEBAR B2B */}
      <aside style={{ width: '280px', backgroundColor: sidebarBg, borderRight: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: accentPri, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>FUJIARTE</div>
        </div>
        
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'vagas', icon: <Briefcase size={20} />, label: 'Gestão de Vagas' },
            { id: 'candidatos', icon: <Users size={20} />, label: 'Funil de Candidatos' },
            { id: 'configuracoes', icon: <LayoutDashboard size={20} />, label: 'Configurações' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                border: 'none', backgroundColor: activeTab === item.id ? (isDark ? '#202836' : '#f0f4f9') : 'transparent',
                color: activeTab === item.id ? accentPri : textSecondary,
                fontWeight: activeTab === item.id ? 700 : 600,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === 'vagas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Mural de Vagas (B2C)</h1>
                <p style={{ color: textSecondary, marginTop: '4px' }}>Crie vagas para publicar automaticamente no Vagas Hub e indexar no Google Jobs.</p>
              </div>
              <button 
                onClick={() => setModalNovaVaga(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px',
                  backgroundColor: accentPri, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Plus size={18} /> Publicar Nova Vaga
              </button>
            </div>

            {loading ? (
              <div>Carregando vagas...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {vagas.map(v => (
                  <div key={v.id} style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${cardBorder}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{v.titulo}</h3>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', backgroundColor: isDark ? '#12291e' : '#e2f0e9', color: isDark ? '#4fc287' : '#1f7a4d' }}>
                        ATIVA
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: textSecondary }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16}/> ¥ {v.salario_hora}/hora</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16}/> {new Date(v.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {vagas.length === 0 && <div style={{ color: textSecondary }}>Nenhuma vaga cadastrada.</div>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'candidatos' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Funil de Candidatos</h1>
            <p style={{ color: textSecondary, marginTop: '8px' }}>O Kanban de Triagem aparecerá aqui conectando os currículos recebidos pelo DeepSeek.</p>
          </div>
        )}

      </main>

      {/* MODAL DE CRIAÇÃO DE VAGA */}
      {modalNovaVaga && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleCriarVaga} style={{ backgroundColor: cardBg, padding: '32px', borderRadius: '24px', border: `1px solid ${cardBorder}`, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, borderBottom: `1px solid ${cardBorder}`, paddingBottom: '16px' }}>Criar Nova Vaga</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <input required placeholder="Título da Vaga (ex: Operador de AutoPeças)" value={novaVaga.titulo} onChange={e => setNovaVaga({...novaVaga, titulo: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary }} />
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <input required placeholder="Província (ex: Aichi)" value={novaVaga.provincia} onChange={e => setNovaVaga({...novaVaga, provincia: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary }} />
                <input required placeholder="Cidade (ex: Nagoya)" value={novaVaga.cidade} onChange={e => setNovaVaga({...novaVaga, cidade: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <input required type="number" step="50" placeholder="Salário/hora (¥)" value={novaVaga.salario_hora} onChange={e => setNovaVaga({...novaVaga, salario_hora: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary }} />
                <select value={novaVaga.tipo_contrato} onChange={e => setNovaVaga({...novaVaga, tipo_contrato: e.target.value})} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary }}>
                  <option>Haken (Temporário)</option>
                  <option>Seishain (Efetivo)</option>
                </select>
              </div>

              <textarea required placeholder="Descrição completa da vaga e benefícios..." value={novaVaga.descricao} onChange={e => setNovaVaga({...novaVaga, descricao: e.target.value})} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${cardBorder}`, backgroundColor: pageBg, color: textPrimary, minHeight: '120px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={() => setModalNovaVaga(false)} style={{ padding: '12px 24px', borderRadius: '10px', backgroundColor: 'transparent', color: textSecondary, border: `1px solid ${cardBorder}`, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '12px 24px', borderRadius: '10px', backgroundColor: accentPri, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Publicar Vaga</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
