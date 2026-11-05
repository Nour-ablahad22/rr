import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { CityCard } from '@/components/cities/CityCard';
import { SEO } from '@/components/common/SEO';
import { CardGridSkeleton, EmptyState } from '@/components/common/States';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { SearchCombobox } from '@/components/search/GlobalSearch';
import { useAttractions, useCities, useSearch } from '@/hooks/useData';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { data: results = [], isLoading } = useSearch(q);
  const { data: cities = [] } = useCities();
  const { data: attractions = [] } = useAttractions();
  const cityMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);
  const attrMap = useMemo(() => new Map(attractions.map((a) => [a.id, a])), [attractions]);
  const foundCities = results.filter((r) => r.type === 'city').map((r) => cityMap.get(r.id)).filter((c): c is NonNullable<typeof c> => !!c);
  const foundAttr = results.filter((r) => r.type === 'attraction').map((r) => attrMap.get(r.id)).filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <PageContainer>
      <SEO title={q ? `Suche: ${q}` : 'Suche'} description="Durchsuche Städte und Sehenswürdigkeiten in Nordrhein-Westfalen." noIndex />
      <PageHeader eyebrow="Suche" title={q ? `Ergebnisse für „${q}“` : 'Suche'} />
      <div className="mb-10 max-w-2xl">
        <SearchCombobox variant="hero" key={q} initialQuery={q} />
      </div>
      {q.trim().length < 2 ? (
        <EmptyState title="Gib einen Suchbegriff ein" text="Mindestens zwei Zeichen, z. B. „Dom“, „Burg“ oder eine Stadt." />
      ) : isLoading ? (
        <CardGridSkeleton />
      ) : !results.length ? (
        <EmptyState title={`Keine Treffer für „${q}“`} text="Prüfe die Schreibweise oder versuche einen allgemeineren Begriff." />
      ) : (
        <div className="space-y-14">
          {foundCities.length > 0 && (
            <section>
              <h2 className="mb-5 font-display text-2xl">Städte ({foundCities.length})</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {foundCities.map((c) => (
                  <CityCard key={c.id} city={c} />
                ))}
              </div>
            </section>
          )}
          {foundAttr.length > 0 && (
            <section>
              <h2 className="mb-5 font-display text-2xl">Sehenswürdigkeiten ({foundAttr.length})</h2>
              <AttractionGrid>
                {foundAttr.map((a) => (
                  <AttractionCard key={a.id} attraction={a} cityName={cityMap.get(a.cityId)?.name} />
                ))}
              </AttractionGrid>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
