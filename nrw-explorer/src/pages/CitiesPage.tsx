import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building } from 'lucide-react';
import { CITY_TAGS, type CityTag } from '@shared/types';
import type { CitySort } from '@shared/query';
import { CityCard } from '@/components/cities/CityCard';
import { CityFilters } from '@/components/cities/CityFilters';
import { SEO } from '@/components/common/SEO';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/common/States';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { useAttractions, useCities } from '@/hooks/useData';
import { useDebounce } from '@/hooks/useUtils';

const PAGE = 9;

export default function CitiesPage() {
  const [params, setParams] = useSearchParams();
  const tags = (params.get('filter')?.split(',').filter((t): t is CityTag => (CITY_TAGS as readonly string[]).includes(t)) ?? []) as CityTag[];
  const sort = (params.get('sortierung') as CitySort) || 'beliebt';
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebounce(q, 200);
  const [visible, setVisible] = useState(PAGE);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };

  const { data: cities = [], isLoading, isError, refetch } = useCities({ q: debouncedQ, tags, sort });
  const { data: attractions = [] } = useAttractions();
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    attractions.forEach((a) => m.set(a.cityId, (m.get(a.cityId) ?? 0) + 1));
    return m;
  }, [attractions]);

  return (
    <PageContainer>
      <SEO title="Städte entdecken" description="20 Reiseziele in Nordrhein-Westfalen – von Köln, Aachen und Münster bis Monschau, Xanten und Winterberg. Mit Geschichte, Sehenswürdigkeiten und Karte." />
      <PageHeader eyebrow="Städte entdecken" title="20 Reiseziele zwischen Rhein und Weser" text="Großstädte mit Weltkultur, historische Kleinstädte und Naturorte – filtere nach deinen Interessen." />
      <CityFilters q={q} onQ={(v) => { setQ(v); setVisible(PAGE); }} tags={tags} onTags={(t) => update('filter', t.join(','))} sort={sort} onSort={(s) => update('sortierung', s === 'beliebt' ? null : s)} />
      <p className="mb-6 mt-8 text-sm text-ink-muted" aria-live="polite">
        {isLoading ? 'Städte werden geladen …' : `${cities.length} ${cities.length === 1 ? 'Reiseziel' : 'Reiseziele'} gefunden`}
      </p>
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <CardGridSkeleton />
      ) : cities.length === 0 ? (
        <EmptyState
          icon={<Building className="h-6 w-6" />}
          title="Keine passenden Reiseziele"
          text="Für diese Kombination aus Filtern gibt es keine Städte. Entferne einen Filter, um mehr zu sehen."
          action={<Button onClick={() => { setQ(''); setParams({}); }}>Filter zurücksetzen</Button>}
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.slice(0, visible).map((c, i) => (
              <CityCard key={c.id} city={c} attractionCount={counts.get(c.id)} priority={i < 3} />
            ))}
          </div>
          {visible < cities.length && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE)}>
                Weitere Reiseziele laden
              </Button>
              <p className="text-xs text-ink-muted">
                {Math.min(visible, cities.length)} von {cities.length} angezeigt
              </p>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
