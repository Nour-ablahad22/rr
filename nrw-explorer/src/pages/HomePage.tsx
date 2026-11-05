import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Award, Castle, Factory, Landmark, Map as MapIcon, Mountain, Trees } from 'lucide-react';
import type { Attraction } from '@shared/types';
import { CATEGORY_LABELS } from '@shared/labels';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { CityCard } from '@/components/cities/CityCard';
import { Reveal, SectionHeading } from '@/components/common/Section';
import { SEO } from '@/components/common/SEO';
import { SmartImage } from '@/components/common/SmartImage';
import { CardGridSkeleton } from '@/components/common/States';
import { HeroSection } from '@/components/home/HeroSection';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { toMapPoint } from '@/components/map/mapPoints';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { useAttractions, useCities } from '@/hooks/useData';

const FEATURED = ['koelner-dom', 'zeche-zollverein', 'schloss-drachenburg', 'wuppertaler-schwebebahn', 'hermannsdenkmal', 'landschaftspark-duisburg-nord', 'schloss-benrath', 'beethoven-haus'];
const HISTORY = ['aachener-dom', 'schloss-augustusburg', 'historisches-rathaus-muenster', 'lvr-archaeologischer-park-xanten', 'kaiserpfalz-paderborn'];

const INSPIRATION = [
  { title: 'Industriekultur im Ruhrgebiet', text: 'Zechen, Hochöfen und Landmarken – wie aus Kohle und Stahl Kultur wurde.', to: '/sehenswuerdigkeiten?q=Industriekultur', wiki: 'Landschaftspark Duisburg-Nord', icon: Factory },
  { title: 'Romantische Fachwerkstädte', text: 'Monschau, Hattingen, Bad Münstereifel: Gassen wie aus dem Bilderbuch.', to: '/staedte?filter=romantisch', wiki: 'Monschau', icon: Landmark },
  { title: 'Auf den Spuren Karls des Großen', text: 'Von der Pfalzkapelle in Aachen bis zur Kaiserpfalz in Paderborn.', to: '/sehenswuerdigkeiten?q=Karl', wiki: 'Aachener Dom', icon: Award },
  { title: 'Rheinromantik am Siebengebirge', text: 'Drachenfels, Drachenburg und Weitblick über das Rheintal.', to: '/staedte/koenigswinter', wiki: 'Siebengebirge', icon: Mountain },
];

export default function HomePage() {
  const { data: cities = [], isLoading: citiesLoading } = useCities({ sort: 'beliebt' });
  const { data: attractions = [], isLoading } = useAttractions();
  const cityMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);
  const byId = useMemo(() => new Map(attractions.map((a) => [a.id, a])), [attractions]);
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((a): a is Attraction => !!a);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    attractions.forEach((a) => m.set(a.cityId, (m.get(a.cityId) ?? 0) + 1));
    return m;
  }, [attractions]);
  const nature = attractions.filter((a) => a.category === 'natur' || a.category === 'parks-gaerten').slice(0, 8);
  const points = useMemo(() => attractions.map((a) => toMapPoint(a, cityMap)), [attractions, cityMap]);
  const history = pick(HISTORY);
  const [lead, ...rest] = history;

  return (
    <>
      <SEO
        title="NRW Explorer – Entdecke Nordrhein-Westfalen"
        description="Die schönsten Städte, Burgen, Museen, Parks und Landschaften in Nordrhein-Westfalen – mit Geschichte, Bildern und interaktiver Karte."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'NRW Explorer',
          url: env.siteUrl,
          inLanguage: 'de-DE',
          potentialAction: { '@type': 'SearchAction', target: `${env.siteUrl}/suche?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
        }}
      />
      <HeroSection />

      {/* Kennzahlen */}
      <section id="entdecken" className="scroll-mt-20 border-b border-forest/10 bg-white">
        <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { n: cities.length || 20, l: 'Reiseziele' },
            { n: attractions.length || '—', l: 'Sehenswürdigkeiten' },
            { n: attractions.filter((a) => a.unesco).length || '—', l: 'Orte mit UNESCO-Welterbe' },
            { n: 8, l: 'Kategorien' },
          ].map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <p className="font-display text-3xl text-forest sm:text-4xl">{s.n}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* A. Beliebte Reiseziele */}
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow="Beliebte Reiseziele"
          title="Städte, die Geschichten erzählen"
          text="Vom Domkloster in Köln bis zur Fachwerkidylle in Monschau – die meistbesuchten Ziele Nordrhein-Westfalens."
          action={
            <Button variant="outline" asChild>
              <Link to="/staedte">
                Alle Städte <ArrowRight />
              </Link>
            </Button>
          }
        />
        {citiesLoading ? (
          <CardGridSkeleton count={3} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.slice(0, 6).map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.08}>
                <CityCard city={c} attractionCount={counts.get(c.id)} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* B. Die schönsten Sehenswürdigkeiten */}
      <section className="bg-white py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Highlights"
            title="Die schönsten Sehenswürdigkeiten"
            text="Kathedralen, Schlösser, Industriedenkmäler und Museen – eine Auswahl, die man gesehen haben sollte."
            action={
              <Button variant="outline" asChild>
                <Link to="/sehenswuerdigkeiten">
                  Alle Sehenswürdigkeiten <ArrowRight />
                </Link>
              </Button>
            }
          />
          {isLoading ? (
            <CardGridSkeleton count={4} />
          ) : (
            <AttractionGrid>
              {pick(FEATURED).map((a, i) => (
                <Reveal key={a.id} delay={(i % 4) * 0.06}>
                  <AttractionCard attraction={a} cityName={cityMap.get(a.cityId)?.name} />
                </Reveal>
              ))}
            </AttractionGrid>
          )}
        </div>
      </section>

      {/* C. Geschichte erleben */}
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow="Geschichte erleben"
          title="Burgen, Kathedralen und Welterbe"
          text="Römer, Karolinger, Kurfürsten und Industriepioniere haben in NRW Spuren hinterlassen, die bis heute faszinieren."
          action={
            <Button variant="outline" asChild>
              <Link to="/historische-orte">
                Historische Orte <ArrowRight />
              </Link>
            </Button>
          }
        />
        {lead && (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <Reveal>
              <Link to={`/sehenswuerdigkeiten/${lead.slug}`} className="group relative block h-full min-h-[420px] overflow-hidden rounded-3xl shadow-soft">
                <SmartImage wikiTitle={lead.wikiTitle} alt={lead.name} width={1280} className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" category={lead.category} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 p-7 text-white sm:p-9">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
                    <Award className="h-3.5 w-3.5" /> UNESCO-Welterbe seit 1978
                  </span>
                  <h3 className="mt-4 font-display text-3xl sm:text-4xl">{lead.name}</h3>
                  <p className="mt-3 max-w-lg text-white/85">{lead.shortDescription}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sand-light">
                    Geschichte lesen <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
            <div className="grid gap-4">
              {rest.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.06}>
                  <Link to={`/sehenswuerdigkeiten/${a.slug}`} className="group flex gap-4 rounded-3xl bg-white p-3 shadow-soft transition hover:shadow-lift">
                    <SmartImage wikiTitle={a.wikiTitle} alt={a.name} width={330} className="h-24 w-28 shrink-0 rounded-2xl sm:w-36" imgClassName="transition-transform duration-500 group-hover:scale-105" category={a.category} />
                    <div className="min-w-0 py-1">
                      <p className="text-xs font-medium text-sand-dark">{a.era}</p>
                      <h3 className="font-display text-lg leading-snug">{a.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{a.shortDescription}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* D. Natur entdecken */}
      <section className="bg-forest py-20 text-white sm:py-24">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sand">Natur entdecken</p>
              <h2 className="font-display text-3xl font-medium sm:text-4xl">Seen, Wälder und weite Ausblicke</h2>
              <p className="mt-3 text-white/75">Vom Kahlen Asten im Sauerland bis zu den Externsteinen im Teutoburger Wald – Naturerlebnisse für jede Jahreszeit.</p>
            </div>
            <Button variant="light" asChild>
              <Link to="/sehenswuerdigkeiten?kategorie=natur">
                <Trees /> Naturziele ansehen
              </Link>
            </Button>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">
            {nature.map((a) => (
              <Link key={a.id} to={`/sehenswuerdigkeiten/${a.slug}`} className="group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[340px]">
                <SmartImage wikiTitle={a.wikiTitle} alt={a.name} width={500} className="aspect-[3/4] w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" category={a.category} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <p className="text-xs font-medium text-sand-light">
                    {cityMap.get(a.cityId)?.name} · {CATEGORY_LABELS[a.category]}
                  </p>
                  <h3 className="mt-1 font-display text-2xl">{a.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* E. Karte */}
      <section className="container py-20 sm:py-24">
        <SectionHeading eyebrow="Interaktive Karte" title="Entdecke NRW auf der Karte" text="Alle Sehenswürdigkeiten auf einen Blick – klicke auf einen Marker für Details und Routenplanung." />
        <div className="overflow-hidden rounded-3xl shadow-lift">
          <InteractiveMap points={points} className="h-[460px] w-full sm:h-[540px]" fitKey={points.length ? 'home' : undefined} />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">{points.length} Orte in 20 Städten – gefiltert nach Kategorie und Stadt in der Vollansicht.</p>
          <Button asChild>
            <Link to="/karte">
              <MapIcon /> Vollständige Karte öffnen
            </Link>
          </Button>
        </div>
      </section>

      {/* F. Inspiration */}
      <section className="bg-white py-20 sm:py-24">
        <div className="container">
          <SectionHeading eyebrow="Inspiration" title="Ideen für deinen nächsten Ausflug" text="Kuratierte Themenrouten durch Nordrhein-Westfalen." />
          <div className="grid gap-6 md:grid-cols-2">
            {INSPIRATION.map((it, i) => (
              <Reveal key={it.title} delay={(i % 2) * 0.08}>
                <Link to={it.to} className="group relative block overflow-hidden rounded-3xl">
                  <SmartImage wikiTitle={it.wiki} alt={it.title} width={960} className="aspect-[16/9] w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white sm:p-8">
                    <it.icon className="mb-3 h-6 w-6 text-sand" />
                    <h3 className="font-display text-2xl sm:text-3xl">{it.title}</h3>
                    <p className="mt-2 max-w-sm text-sm text-white/80">{it.text}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sand-light">
                      Jetzt entdecken <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 rounded-3xl bg-ivory p-8 sm:p-12">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <Castle className="mb-3 h-7 w-7 text-forest" />
                <h3 className="font-display text-2xl sm:text-3xl">Deine persönliche Merkliste</h3>
                <p className="mt-2 max-w-xl text-ink-muted">Speichere Orte mit dem Herz-Symbol – ganz ohne Registrierung. Deine Favoriten bleiben auf diesem Gerät erhalten.</p>
              </div>
              <Button size="lg" asChild>
                <Link to="/favoriten">Zu meinen Favoriten</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
