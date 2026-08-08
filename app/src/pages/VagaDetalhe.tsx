import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building2, JapaneseYen, Clock, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../dados/supabase';
import type { Language } from '../translations';
import { useTheme } from '../theme/contexto';

export function VagaDetalhe({ lang: _lang }: { lang?: Language }) {
  const { id } = useParams();
  const { escuro: isDark } = useTheme();
  const [vaga, setVaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const pageBg = isDark ? '#0d1016' : '#f4f5f2';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#7a827f';
  const cardBorder = isDark ? '#29313c' : '#e0e2dc';
  const accentIndigo = isDark ? '#7ba4de' : '#294b86';

  useEffect(() => {
    async function carregarVaga() {
      if (!supabase || !id) return;
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          organizations ( nome )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setVaga(data);
      }
      setLoading(false);
    }
    carregarVaga();
  }, [id]);

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando vaga...</div>;
  }

  if (!vaga) {
    return <div style={{ minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Vaga não encontrada.</div>;
  }

  // Google Jobs Schema
  const schemaMarkup = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": vaga.titulo,
    "description": vaga.descricao,
    "identifier": {
      "@type": "PropertyValue",
      "name": vaga.organizations?.nome || "SelectSys Jobs",
      "value": vaga.id
    },
    "datePosted": vaga.created_at,
    "validThrough": new Date(new Date(vaga.created_at).getTime() + 60*24*60*60*1000).toISOString(),
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": vaga.organizations?.nome || "SelectSys Jobs"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": vaga.cidade,
        "addressRegion": vaga.provincia,
        "addressCountry": "JP"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "JPY",
      "value": {
        "@type": "QuantitativeValue",
        "value": vaga.salario_hora,
        "unitText": "HOUR"
      }
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Injeção de Schema.org B2C para SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Link to="/vagas" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Voltar para lista de vagas
        </Link>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: accentIndigo, fontSize: '14px', fontWeight: 700 }}>
            <Building2 size={18} /> <span>{vaga.organizations?.nome || 'Empreiteira Oficial'}</span>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: textPrimary, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            {vaga.titulo}
          </h1>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px', paddingBottom: '32px', borderBottom: `1px solid ${cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: textPrimary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '10px 16px', borderRadius: '12px' }}>
              <MapPin size={18} color={accentIndigo} /> {vaga.cidade}, {vaga.provincia}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: textPrimary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '10px 16px', borderRadius: '12px' }}>
              <JapaneseYen size={18} color="#1f7a4d" /> <strong>¥ {vaga.salario_hora}</strong>/hora
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: textPrimary, backgroundColor: isDark ? '#1c222c' : '#f4f5f2', padding: '10px 16px', borderRadius: '12px' }}>
              <Clock size={18} /> {vaga.tipo_contrato}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: textPrimary }}>Descrição da Vaga</h3>
              <p style={{ fontSize: '15px', color: textSecondary, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {vaga.descricao}
              </p>
            </section>

            <section style={{ backgroundColor: isDark ? '#12291e' : '#e2f0e9', padding: '24px', borderRadius: '16px', border: `1px solid ${isDark ? '#175335' : '#cfe6da'}` }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: isDark ? '#4fc287' : '#1f7a4d' }}>Requisitos</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: isDark ? '#4fc287' : '#1f7a4d', fontSize: '15px', paddingLeft: '20px' }}>
                <li>Descendência Nikkei (Nissei, Sansei, Yonsei) ou Cônjuge</li>
                <li>Passaporte Brasileiro válido</li>
                <li>Disponibilidade para turnos alternados</li>
              </ul>
            </section>
          </div>

          <div style={{ marginTop: '48px' }}>
            <Link to={`/candidato?vaga=${vaga.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              width: '100%', padding: '20px', borderRadius: '16px',
              backgroundColor: accentIndigo, color: '#ffffff',
              fontSize: '18px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(41, 75, 134, 0.3)'
            }}>
              <Send size={22} />
              Candidatar-se Rapidamente com IA
            </Link>
            <p style={{ textAlign: 'center', fontSize: '13px', color: textSecondary, marginTop: '16px' }}>
              Nosso sistema AI DeepSeek preencherá a ficha para você a partir do seu currículo. Sem fricção.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
