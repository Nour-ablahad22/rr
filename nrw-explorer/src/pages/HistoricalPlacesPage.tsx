import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { HISTORICAL_CATEGORIES } from '@shared/labels';
import { AttractionBrowser } from '@/components/attractions/AttractionBrowser';
import { SEO } from '@/components/common/SEO';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';

const ERAS = [
  { period: 'Römerzeit', years: '1.–4. Jh.', text: 'Köln, Bonn und Xanten entstehen als Städte und Lager am Niedergermanischen Limes.', to: '/sehenswuerdigkeiten/lvr-archaeologischer-park-xanten' },
  { period: 'Karolinger', years: 'um 800', text: 'Karl der Große macht Aachen zum Zentrum seines Reiches und trifft 799 Papst Leo III. in Paderborn.', to: '/sehenswuerdigkeiten/aachener-dom' },
  { period: 'Mittelalter', years: '1248', text: 'Grundsteinlegung des Kölner Doms; Hansestädte wie Soest, Dortmund und Münster blühen auf.', to: '/sehenswuerdigkeiten/koelner-dom' },
  { period: 'Westfälischer Friede', years: '1648', text: 'In Münster und Osnabrück endet der Dreißigjährige Krieg.', to: '/sehenswuerdigkeiten/historisches-rathaus-muenster' },
  { period: 'Barock & Rokoko', years: '18. Jh.', text: 'Kurfürsten errichten Residenzen wie Augustusburg in Brühl und Benrath in Düsseldorf.', to: '/sehenswuerdigkeiten/schloss-augustusburg' },
  { period: 'Industriezeitalter', years: '19.–20. Jh.', text: 'Kohle und Stahl prägen das Ruhrgebiet – heute Welterbe wie die Zeche Zollverein.', to: '/sehenswuerdigkeiten/zeche-zollverein' },
];

export default function HistoricalPlacesPage() {
  return (
    <PageContainer>
      <SEO title="Historische Orte in NRW" description="Burgen, Schlösser, Kathedralen und historische Gebäude in Nordrhein-Westfalen – von der Römerzeit bis zum Industriezeitalter." />
      <PageHeader
        eyebrow="Historische Orte"
        title="2000 Jahre Geschichte erleben"
        text="Burgen und Schlösser, Kathedralen und historische Gebäude – Orte, an denen die Geschichte Nordrhein-Westfalens greifbar wird."
      />
      <section aria-labelledby="zeitleiste" className="mb-16">
        <h2 id="zeitleiste" className="sr-only">
          Zeitleiste
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ERAS.map((e, i) => (
            <li key={e.period}>
              <Link to={e.to} className="group flex h-full flex-col rounded-3xl border border-forest/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="text-xs font-semibold tabular-nums text-sand-dark">
                  {String(i + 1).padStart(2, '0')} · {e.years}
                </span>
                <h3 className="mt-2 font-display text-xl">{e.period}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{e.text}</p>
                <span className="mt-auto pt-4 text-sm font-medium text-forest group-hover:underline">Ort ansehen →</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Award className="h-4 w-4 text-sand-dark" /> Tipp: Mit dem Filter „UNESCO-Welterbe“ siehst du nur Welterbestätten.
        </p>
      </section>
      <AttractionBrowser baseCategories={HISTORICAL_CATEGORIES} />
    </PageContainer>
  );
}
