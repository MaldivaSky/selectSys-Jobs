import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, JapaneseYen, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../dados/supabase';
import { updatePageSeo, buildJobPostingSchema } from '../utils/seo';

export function VagasTenantHub() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [tenant, setTenant] = useState<any>(null);
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      if (!supabase || !tenantSlug) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', tenantSlug)
        .maybeSingle();

      if (orgData) {
        setTenant(orgData);
        updatePageSeo({
          title: `Vagas no Japão · ${orgData.nome}`,
          description: `Confira as vagas abertas no Japão pela agência ${orgData.nome}. Oportunidades para descendentes Nikkei nas províncias de Aichi, Shizuoka, Mie e Gunma.`,
          canonicalUrl: `https://selectsys.jobs/c/${tenantSlug}/vagas`,
        });

        const { data: vagasData } = await supabase
          .from('jobs')
          .select('*')
          .eq('organization_id', orgData.id)
          .eq('publicada', true)
          .order('created_at', { ascending: false });

        if (vagasData) {
          setVagas(vagasData);
        }
      }
      setLoading(false);
    }
    carregarDados();
  }, [tenantSlug]);

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0d1016', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando vagas da agência...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1016', color: '#e9ece8', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '960px', width: '100%' }}>
        {/* Cabecalho Tenant */}
        <div style={{ backgroundColor: '#161b24', border: '1px solid #29313c', borderRadius: '20px', padding: '32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Building2 size={32} color="#294b86" />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>
              Vagas Abertas no Japão · {tenant?.nome || 'Empreiteira Oficial'}
            </h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#4ade80" /> Agência autorizada para emissão de visto Dekassegui
            </p>
          </div>
        </div>

        {/* Lista de Vagas */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {vagas.length} {vagas.length === 1 ? 'Oportunidade Disponível' : 'Oportunidades Disponíveis'}
        </h2>

        {vagas.length === 0 ? (
          <div style={{ backgroundColor: '#161b24', border: '1px solid #29313c', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            Nenhuma vaga aberta no momento nesta agência. <Link to={`/c/${tenantSlug}`} style={{ color: '#7ba4de', fontWeight: 700 }}>Preencha sua ficha cadastral prévia</Link>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {vagas.map(vaga => {
              const schemaData = buildJobPostingSchema({ ...vaga, organizacaoNome: tenant?.nome });
              return (
                <article key={vaga.id} style={{ backgroundColor: '#161b24', border: '1px solid #29313c', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f3f4f6' }}>{vaga.titulo}</h3>
                    {vaga.empresa_japonesa && <span style={{ fontSize: '12px', color: '#7ba4de', fontWeight: 700 }}>{vaga.empresa_japonesa}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#7ba4de" /> {vaga.cidade || 'Aichi'}, {vaga.provincia || 'Japão'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <JapaneseYen size={16} color="#4ade80" /> <strong style={{ color: '#f3f4f6' }}>¥ {vaga.salario_hora_jpy || 1350}</strong> / hora
                    </div>
                  </div>

                  <Link
                    to={`/vagas/${vaga.id}`}
                    style={{
                      marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', borderRadius: '10px', backgroundColor: '#294b86', color: '#ffffff',
                      fontWeight: 700, textDecoration: 'none', fontSize: '14px'
                    }}
                  >
                    Ver Detalhes & Candidatar-se <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
