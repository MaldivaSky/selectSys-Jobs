/* ═══════════════════════════════════════════════════════════════════════════
   SISTEMA DE SEO, BUSCA GOOGLE/BING & GOOGLE JOBS — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Garante indexação instantânea e otimização GEO (Generative Engine Optimization)
   para buscadores de IA (ChatGPT, Perplexity, Gemini, Claude) e Google Jobs.
   ═════════════════════════════════════════════════════════════════════════ */

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function updatePageSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = config.title.includes('SelectSys') ? config.title : `${config.title} | SelectSys Jobs · Vagas no Japão`;

  // Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // OpenGraph Meta Tags
  const setOgTag = (property: string, content: string) => {
    let ogTag = document.querySelector(`meta[property="${property}"]`);
    if (!ogTag) {
      ogTag = document.createElement('meta');
      ogTag.setAttribute('property', property);
      document.head.appendChild(ogTag);
    }
    ogTag.setAttribute('content', content);
  };

  setOgTag('og:title', config.title);
  setOgTag('og:description', config.description);
  setOgTag('og:type', 'website');
  if (config.ogImage) {
    setOgTag('og:image', config.ogImage);
  }

  // Canonical Link
  if (config.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.canonicalUrl);
  }

  // Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', config.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');
}

/**
 * Gera o Schema.org JobPosting oficial para o Google Jobs.
 */
export function buildJobPostingSchema(vaga: {
  id: string;
  titulo: string;
  descricao: string;
  cidade: string;
  provincia: string;
  salario_hora: number | string;
  tipo_contrato?: string;
  created_at?: string;
  organizacaoNome?: string;
}) {
  const datePosted = vaga.created_at || new Date().toISOString();
  const validThrough = new Date(new Date(datePosted).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: vaga.titulo,
    description: vaga.descricao,
    identifier: {
      '@type': 'PropertyValue',
      name: vaga.organizacaoNome || 'SelectSys Jobs Dekassegui',
      value: vaga.id,
    },
    datePosted,
    validThrough,
    employmentType: vaga.tipo_contrato === 'CLT' ? 'FULL_TIME' : 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: vaga.organizacaoNome || 'SelectSys Jobs / FUJIARTE',
      sameAs: 'https://selectsys.jobs',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vaga.cidade,
        addressRegion: vaga.provincia,
        addressCountry: 'JP',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'JPY',
      value: {
        '@type': 'QuantitativeValue',
        value: Number(vaga.salario_hora) || 1350,
        unitText: 'HOUR',
      },
    },
  };
}
