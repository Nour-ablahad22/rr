import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Award, BookMarked, Clock, Compass, ExternalLink, Globe, Lightbulb, MapPin, Navigation, ScrollText, Sparkles } from 'lucide-react';
import { CATEGORY_LABELS } from '@shared/labels';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { AttractionGallery } from '@/components/attractions/AttractionGallery';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { SectionHeading } from '@/components/common/Section';
import { breadcrumbLd, SEO } from '@/components/common/SEO';
import { ShareButton } from '@/components/common/ShareButton';
import { SmartImage } from '@/components/common/SmartImage';
import { SourceList } from '@/components/common/SourceList';
import { ErrorState, PageLoader } from '@/components/common/States';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { MiniMap } from '@/components/map/MiniMap';
import { toMapPoint } from '@/components/map/mapPoints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { useAttraction, useCities, useNearby } from '@/hooks/useData';
import { useWikiImage } from '@/hooks/useWikiImage';
import { directionsUrl, formatCoordinates } from '@/lib/utils';
import { NotFoundContent } from './NotFoundPage';

function Block({ id, icon: Icon, title, children }: { id: string; icon: typeof ScrollText; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2 id={id} className="flex items-center gap-2.5 font-display text-2xl text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/5 text-forest">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {title}
      </h2>
      <div className="prose-nrw mt-4 text-[16px]">{children}</div>
    </section>
  );
}

export default function AttractionDetailsPage() {
  const { slug } = useParams();
  const { data: a, isLoading, isError, refetch } = useAttraction(slug);
  const { data: cities = [] } = useCities();
  const { data: nearby = [] } = useNearby(a?.coordinates, { radiusKm: 30, limit: 4, excludeId: a?.id });
  const { data: heroImg } = useWikiImage(a?.wikiTitle, 1280, a?.name ?? '');
  const city = useMemo(() => cities.find((c) => c.id === a?.cityId), [cities, a]);
  const cityName = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="container pt-32"><ErrorState onRetry={() => refetch()} /></div>;
  if (!a) return <NotFoundContent title="Sehenswürdigkeit nicht gefunden" text="Dieser Ort ist (noch) nicht in unserem Reiseführer enthalten." />;

  const Icon = CATEGORY_ICONS[a.category];
  const point = toMapPoint(a, cities);

  return (
    <>
      <SEO
        title={`${a.name}${city ? ` in ${city.name}` : ''}`}
        description={a.shortDescription}
        image={heroImg?.src}
        type="place"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'TouristAttraction',
            name: a.name,
            description: a.description,
            image: heroImg?.src,
            url: `${env.siteUrl}/sehenswuerdigkeiten/${a.slug}`,
            address: { '@type': 'PostalAddress', streetAddress: a.address, addressRegion: 'Nordrhein-Westfalen', addressCountry: 'DE' },
            geo: { '@type': 'GeoCoordinates', latitude: a.coordinates.lat, longitude: a.coordinates.lng },
            ...(a.officialWebsite ? { sameAs: a.officialWebsite } : {}),
            isAccessibleForFree: undefined,
          },
          breadcrumbLd([
            { name: 'Sehenswürdigkeiten', path: '/sehenswuerdigkeiten' },
            ...(city ? [{ name: city.name, path: `/staedte/${city.slug}` }] : []),
            { name: a.name, path: `/sehenswuerdigkeiten/${a.slug}` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="container pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: 'Sehenswürdigkeiten', to: '/sehenswuerdigkeiten' }, ...(city ? [{ label: city.name, to: `/staedte/${city.slug}` }] : []), { label: a.name }]} />
        <div className="relative mt-6 overflow-hidden rounded-3xl shadow-lift">
          <SmartImage wikiTitle={a.wikiTitle} alt={`${a.name}${city ? `, ${city.name}` : ''}`} width={1920} priority showCredit category={a.category} className="aspect-[4/3] w-full sm:aspect-[21/9]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
            <div className="flex flex-wrap gap-2">
              <Badge variant="light">
                <Icon className="h-3 w-3" /> {CATEGORY_LABELS[a.category]}
              </Badge>
              {a.unesco && (
                <Badge className="bg-sand text-ink">
                  <Award className="h-3 w-3" /> UNESCO-Welterbe
                </Badge>
              )}
              {a.era && <Badge variant="light">{a.era}</Badge>}
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-6xl">{a.name}</h1>
            {city && (
              <Link to={`/staedte/${city.slug}`} className="mt-2 inline-flex items-center gap-1.5 text-white/85 hover:text-white">
                <MapPin className="h-4 w-4 text-sand" /> {city.name}, {city.region}
              </Link>
            )}
          </div>
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <FavoriteButton id={a.id} name={a.name} />
          </div>
        </div>
      </section>

      {/* Inhalt */}
      <div className="container mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0 space-y-12">
          <p className="font-display text-xl leading-relaxed text-ink sm:text-2xl">{a.description}</p>

          <nav aria-label="Inhalt" className="flex flex-wrap gap-2 text-sm">
            {[
              ['geschichte', 'Geschichte'],
              ['hintergrund', 'Historischer Hintergrund'],
              ['architektur', 'Architektur'],
              ['bedeutung', 'Kulturelle Bedeutung'],
              ['merkmale', 'Besondere Merkmale'],
              ['fakten', 'Interessante Fakten'],
              ['galerie', 'Galerie'],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-forest hover:border-forest">
                {label}
              </a>
            ))}
          </nav>

          <Block id="geschichte" icon={ScrollText} title="Geschichte">
            <p>{a.history}</p>
          </Block>
          <Block id="hintergrund" icon={BookMarked} title="Historischer Hintergrund">
            <p>{a.historicalBackground}</p>
          </Block>
          <Block id="architektur" icon={Icon} title="Architektur">
            <p>{a.architecture}</p>
          </Block>
          <Block id="bedeutung" icon={Globe} title="Kulturelle Bedeutung">
            <p>{a.culturalImportance}</p>
          </Block>
          <Block id="merkmale" icon={Sparkles} title="Besondere Merkmale">
            <ul className="grid gap-3 sm:grid-cols-2">
              {a.features.map((f) => (
                <li key={f} className="flex gap-3 rounded-2xl bg-white p-4 text-[15px] shadow-soft">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sand" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Block>
          <Block id="fakten" icon={Lightbulb} title="Interessante Fakten">
            <ul className="space-y-3">
              {a.facts.map((f) => (
                <li key={f} className="border-l-2 border-sand pl-4 text-ink/85">
                  {f}
                </li>
              ))}
            </ul>
          </Block>
          {a.legend && (
            <aside className="rounded-3xl border border-sand/50 bg-sand/10 p-6" aria-labelledby="sage">
              <h2 id="sage" className="flex items-center gap-2 font-display text-xl text-[#6b5320]">
                <AlertCircle className="h-5 w-5" /> Sage & Überlieferung
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#6b5320]/80">Legende – keine belegte historische Tatsache</p>
              <p className="mt-3 leading-relaxed text-ink/85">{a.legend}</p>
            </aside>
          )}

          <section id="galerie" aria-labelledby="galerie-titel" className="scroll-mt-28">
            <h2 id="galerie-titel" className="mb-5 font-display text-2xl">
              Bildergalerie
            </h2>
            <AttractionGallery wikiTitle={a.wikiTitle} name={a.name} />
          </section>

          <section aria-labelledby="tipps" className="rounded-3xl bg-forest p-7 text-white">
            <h2 id="tipps" className="flex items-center gap-2 font-display text-2xl">
              <Compass className="h-5 w-5 text-sand" /> Tipps für deinen Besuch
            </h2>
            <ul className="mt-4 space-y-2.5 text-white/90">
              {a.recommendations.map((r) => (
                <li key={r} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" aria-hidden /> {r}
                </li>
              ))}
            </ul>
          </section>

          <SourceList sources={a.sources} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <MapPin className="h-5 w-5 text-forest" /> Lage & Anfahrt
            </h2>
            <MiniMap point={point} />
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">Adresse</dt>
                <dd className="mt-0.5 text-ink-muted">{a.address}</dd>
              </div>
              <div>
                <dt className="font-semibold">Koordinaten</dt>
                <dd className="mt-0.5 tabular-nums text-ink-muted">
                  {formatCoordinates(a.coordinates.lat, a.coordinates.lng)}
                  {a.coordinatePrecision === 'approx' && <span className="mt-1 block text-xs text-ink-muted/80">Ungefähre Position – vor Ort der Beschilderung folgen.</span>}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold">
                  <Clock className="h-4 w-4 text-sand-dark" /> Öffnungszeiten
                </dt>
                <dd className="mt-0.5 text-ink-muted">{a.openingHours ?? 'Keine verifizierten Angaben – bitte aktuelle Zeiten beim Anbieter prüfen.'}</dd>
              </div>
            </dl>
            <div className="mt-5 grid gap-2">
              <Button asChild>
                <a href={directionsUrl(a.coordinates.lat, a.coordinates.lng)} target="_blank" rel="noopener noreferrer">
                  <Navigation /> Route mit Google Maps planen
                </a>
              </Button>
              {a.officialWebsite && (
                <Button asChild variant="outline">
                  <a href={a.officialWebsite} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Offizielle Website
                  </a>
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <ShareButton title={a.name} text={a.shortDescription} />
                <FavoriteButton id={a.id} name={a.name} variant="inline" className="w-full justify-center" />
              </div>
              <Button asChild variant="ghost" className="text-forest">
                <Link to={`/karte?ort=${a.slug}`}>Auf der großen Karte anzeigen</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="container mt-20">
          <SectionHeading eyebrow="In der Nähe" title="Sehenswürdigkeiten in der Umgebung" text="Weitere Ziele im Umkreis von 30 Kilometern." />
          <AttractionGrid>
            {nearby.map((n) => (
              <AttractionCard key={n.id} attraction={n} cityName={cityName.get(n.cityId)} distanceKm={n.distanceKm} />
            ))}
          </AttractionGrid>
        </section>
      )}
    </>
  );
}
