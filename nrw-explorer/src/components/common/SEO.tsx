import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { env } from '@/config/env';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'place';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

export function SEO({ title, description, image, type = 'website', jsonLd, noIndex }: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = title.includes('NRW Explorer') ? title : `${title} | NRW Explorer`;
  const url = `${env.siteUrl}${pathname}`;
  return (
    <Helmet>
      <html lang="de" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex" />}
      <meta property="og:site_name" content="NRW Explorer" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:type" content={type === 'place' ? 'website' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

export const breadcrumbLd = (items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${env.siteUrl}${it.path}` })),
});
