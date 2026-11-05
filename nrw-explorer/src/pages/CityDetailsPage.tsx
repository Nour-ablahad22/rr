import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, Bus, ExternalLink, Info, Map as MapIcon, MapPin } from 'lucide-react';
import { ATTRACTION_CATEGORIES, type AttractionCategory } from '@shared/types';
import { CATEGORY_LABELS, CITY_TAG_LABELS } from '@shared/labels';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { AttractionGallery } from '@/components/attractions/AttractionGallery';
import { CityCard } from '@/components/cities/CityCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Reveal, SectionHeading } from '@/components/common/Section';
import { breadcrumbLd, SEO } from '@/components/common/SEO';
import { SmartImage } from '@/components/common/SmartImage';
import { SourceList } from '@/components/common/SourceList';
import { CardGridSkeleton, ErrorState, PageLoader } from '@/components/common/States';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { toMapPoint } from '@/components/map/mapPoints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCities, useCity, useCityAttractions } from '@/hooks/useData';
import { cn, formatCoordinates } from '@/lib/utils';
import { NotFoundContent } from './NotFoundPage';

export default function CityDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: city, isLoading, isError, refetch } = useCity(slug);
  const { data: attractions = [], isLoading: attrLoading } = useCityAttractions(city?.id);
  const { data: allCities = [] } = useCities();
  const [category, setCategory] = useState<AttractionCategory | 'alle'>('alle');
  const [selected, setSelected] = useState<string | null>(null);

  const cityMap = useMemo(() => new Map(allCities.map((c) => [c.id, c])), [allCities]);
  const points = useMemo(() => (city ? attractions.map((a) => toMapPoint(a, [city])) : []), [attractions, city]);
  const filtered = category === 'alle' ? attractions : attractions.filter((a) => a.category === category || a.secondaryCategories?.includes(category));
  const availableCats = ATTRACTION_CATEGORIES.filter((c) => attractions.some((a) => a.category === c));

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="container pt-32"><ErrorState onRetry={() => refetch()} /></div>;
  if (!city) return <NotFoundContent title="Stadt nicht gefunden" text="Diese Stadt ist (noch) nicht in unserem Reiseführer enthalten." />;

  const related = city.nearby.map((id) => cityMap.get(id)).filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <>
      <SEO
        title={`${city.name} – ${city.tagline}`}
        description={city.description}
        type="place"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': ['City', 'TouristDestination'],
            name: city.name,
            description: city.description,
            geo: { '@type': 'GeoCoordinates', latitude: city.coordinates.lat, longitude: city.coordinates.lng },
            containedInPlace: { '@type': 'State', name: 'Nordrhein-Westfalen' },
            ...(city.officialWebsite ? { url: city.officialWebsite } : {}),
          },
          breadcrumbLd([
            { name: 'Städte', path: '/staedte' },
            { name: city.name, path: `/staedte/${city.slug}` },
          ]),
        ]}
      />
      {/* Hero */}
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-forest-900 pb-14 pt-32">
        <SmartImage wikiTitle={city.wikiTitle} alt={`Ansicht von ${city.name}`} width={1920} priority showCredit quietFallback className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/30" />
        <div className="container text-white">
          <Breadcrumbs light items={[{ label: 'Städte', to: '/staedte' }, { label: city.name }]} />
          <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
            <MapPin className="h-4 w-4 text-sand" /> {city.region} · {formatCoordinates(city.coordinates.lat, city.coordinates.lng)}
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium sm:text-7xl">{city.name}</h1>
          <p className="mt-3 text-xl text-sand-light sm:text-2xl">{city.tagline}</p>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/85">{city.description}</p>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {city.tags.map((t) => (
              <Badge key={t} variant="light">
                {CITY_TAG_LABELS[t]}
              </Badge>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="accent" asChild>
              <a href="#sehenswuerdigkeiten">
                Sehenswürdigkeiten erkunden <ArrowDown />
              </a>
            </Button>
            <Button size="lg" variant="glass" onClick={() => navigate(`/karte?stadt=${city.slug}`)}>
              <MapIcon /> Auf der Karte anzeigen
            </Button>
            <FavoriteButton id={`stadt:${city.id}`} name={city.name} variant="inline" className="h-12 border-white/40 bg-white/10 text-white backdrop-blur hover:border-white" />
          </div>
        </div>
      </section>

      {/* Geschichte + Info */}
      <section className="container grid gap-12 py-20 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="eyebrow mb-3">Historischer Hintergrund</p>
          <h2 className="font-display text-3xl sm:text-4xl">Die Geschichte von {city.name}</h2>
          <ol className="relative mt-10 space-y-10 border-l border-forest/15 pl-8">
            {city.history.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.05}>
                <li className="relative">
                  <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-sand bg-ivory" aria-hidden />
                  <h3 className="font-display text-xl text-forest">{h.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/85">{h.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <Info className="h-5 w-5 text-forest" /> Reiseinformationen
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              {city.transport && (
                <div>
                  <dt className="flex items-center gap-1.5 font-semibold text-ink">
                    <Bus className="h-4 w-4 text-sand-dark" /> Anreise & Nahverkehr
                  </dt>
                  <dd className="mt-1 leading-relaxed text-ink-muted">{city.transport}</dd>
                </div>
              )}
              {city.visitorInfo && (
                <div>
                  <dt className="font-semibold text-ink">Besucherinformation</dt>
                  <dd className="mt-1 text-ink-muted">{city.visitorInfo}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-ink">Lage</dt>
                <dd className="mt-1 text-ink-muted">
                  {city.region}, Nordrhein-Westfalen
                  <br />
                  {formatCoordinates(city.coordinates.lat, city.coordinates.lng)}
                </dd>
              </div>
            </dl>
            {city.officialWebsite && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={city.officialWebsite} target="_blank" rel="noopener noreferrer">
                  Offizielle Tourismus-Website <ExternalLink />
                </a>
              </Button>
            )}
          </div>
          {related.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="font-display text-xl">In der Nähe</h2>
              <ul className="mt-3 divide-y divide-forest/10">
                {related.map((c) => (
                  <li key={c.id}>
                    <Link to={`/staedte/${c.slug}`} className="flex items-center justify-between py-2.5 text-sm hover:text-forest">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-ink-muted">{c.region}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Sehenswürdigkeiten */}
      <section id="sehenswuerdigkeiten" className="scroll-mt-24 bg-white py-20">
        <div className="container">
          <SectionHeading eyebrow="Sehenswürdigkeiten" title={`Das solltest du in ${city.name} sehen`} text={`${attractions.length} ausgewählte Orte mit Geschichte, Bildern und Lageplan.`} />
          {availableCats.length > 1 && (
            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Nach Kategorie filtern">
              {(['alle', ...availableCats] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn('rounded-full border px-4 py-2 text-sm transition', category === c ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white hover:border-forest')}
                >
                  {c === 'alle' ? 'Alle' : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          )}
          {attrLoading ? (
            <CardGridSkeleton count={3} />
          ) : (
            <AttractionGrid className="2xl:grid-cols-3">
              {filtered.map((a) => (
                <AttractionCard key={a.id} attraction={a} cityName={city.name} />
              ))}
            </AttractionGrid>
          )}
        </div>
      </section>

      {/* Stadtkarte */}
      <section className="container py-20">
        <SectionHeading eyebrow="Stadtplan" title={`Sehenswürdigkeiten in ${city.name} auf der Karte`} />
        <div className="overflow-hidden rounded-3xl shadow-lift">
          <InteractiveMap
            points={points}
            selectedId={selected}
            onSelect={setSelected}
            fitKey={points.length ? city.id : undefined}
            initialCenter={city.coordinates}
            initialZoom={city.zoom}
            cluster={false}
            className="h-[480px] w-full"
          />
        </div>
      </section>

      {/* Galerie */}
      <section className="container pb-8">
        <SectionHeading eyebrow="Galerie" title={`Impressionen aus ${city.name}`} />
        <AttractionGallery wikiTitle={city.wikiTitle} name={city.name} />
      </section>

      {related.length > 0 && (
        <section className="container py-20">
          <SectionHeading eyebrow="Weitere Reiseziele" title="Das könnte dich auch interessieren" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((c) => (
              <CityCard key={c.id} city={c} />
            ))}
          </div>
        </section>
      )}

      <section className="container max-w-4xl">
        <SourceList sources={city.sources} />
      </section>
    </>
  );
}
