/* ═══════════════════════════════════════════════════════════════════════════
   GERADOR DE SITEMAP XML DINÂMICO — SELECTSYS JOBS
   ---------------------------------------------------------------------------
   Gera o arquivo sitemap.xml com todas as URLs públicas indexáveis:
   - Páginas Institucionais (Home, Vagas, Funcionalidades, Preços, Privacidade)
   - Portais de Vagas por Agência (/c/:tenantSlug/vagas)
   - Vagas Individuais para o Google Jobs (/vagas/:id)
   ═════════════════════════════════════════════════════════════════════════ */

export interface SitemapItem {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
}

export function generateSitemapXml(items: SitemapItem[]): string {
  const baseUrls: SitemapItem[] = [
    { loc: 'https://selectsys.jobs/', priority: 1.0, changefreq: 'daily' },
    { loc: 'https://selectsys.jobs/vagas', priority: 0.9, changefreq: 'hourly' },
    { loc: 'https://selectsys.jobs/funcionalidades', priority: 0.8, changefreq: 'weekly' },
    { loc: 'https://selectsys.jobs/plano-acao', priority: 0.8, changefreq: 'weekly' },
    { loc: 'https://selectsys.jobs/fujiarte', priority: 0.9, changefreq: 'weekly' },
    { loc: 'https://selectsys.jobs/c/fujiarte', priority: 0.95, changefreq: 'daily' },
    { loc: 'https://selectsys.jobs/c/fujiarte/vagas', priority: 0.9, changefreq: 'daily' },
    { loc: 'https://selectsys.jobs/privacidade', priority: 0.3, changefreq: 'monthly' },
    { loc: 'https://selectsys.jobs/termos', priority: 0.3, changefreq: 'monthly' },
  ];

  const allItems = [...baseUrls, ...items];
  const now = new Date().toISOString().split('T')[0];

  const xmlUrls = allItems
    .map(
      (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod || now}</lastmod>
    <changefreq>${item.changefreq || 'weekly'}</changefreq>
    <priority>${item.priority || 0.5}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}
