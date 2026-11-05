import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { ATTRACTION_CATEGORIES, type AttractionCategory } from '@shared/types';
import { paginate } from '@shared/query';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { AttractionFilters } from '@/components/attractions/AttractionFilters';
import { Pagination } from '@/components/common/Pagination';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/common/States';
import { Button } from '@/components/ui/button';
import { useAttractions, useCities } from '@/hooks/useData';
import { useDebounce } from '@/hooks/useUtils';

const PAGE_SIZE = 12;

/** Filterbare, paginierte Liste – genutzt von "Sehenswürdigkeiten" und "Historische Orte". Filter stehen in der URL. */
export function AttractionBrowser({ baseCategories, showUnesco = true }: { baseCategories?: AttractionCategory[]; showUnesco?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebounce(q, 200);
  const cityId = params.get('stadt') ?? '';
  const unesco = params.get('unesco') === '1';
  const page = Number(params.get('seite') ?? '1') || 1;
  const selected = (params.get('kategorie')?.split(',').filter((c): c is AttractionCategory => (ATTRACTION_CATEGORIES as readonly string[]).includes(c)) ?? []) as AttractionCategory[];

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('seite' in patch)) next.delete('seite');
    setParams(next, { replace: true });
  };

  const categories = selected.length ? selected : (baseCategories ?? []);
  const { data: cities = [] } = useCities();
  const { data: items = [], isLoading, isError, refetch } = useAttractions({ q: debouncedQ, cityId: cityId || undefined, categories, unesco, sort: 'alphabetisch' });
  const cityName = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);
  const paged = paginate(items, page, PAGE_SIZE);

  return (
    <>
      <AttractionFilters
        q={q}
        onQ={(v) => {
          setQ(v);
          set({ q: v || null });
        }}
        cities={cities}
        cityId={cityId}
        onCity={(v) => set({ stadt: v || null })}
        categories={selected}
        onCategories={(v) => set({ kategorie: v.length ? v.join(',') : null })}
        available={baseCategories ?? [...ATTRACTION_CATEGORIES]}
        unesco={unesco}
        onUnesco={showUnesco ? (v) => set({ unesco: v ? '1' : null }) : undefined}
      />
      <p className="mb-6 mt-8 text-sm text-ink-muted" aria-live="polite">
        {isLoading ? 'Wird geladen …' : `${items.length} ${items.length === 1 ? 'Sehenswürdigkeit' : 'Sehenswürdigkeiten'} gefunden`}
        {cityId && cityName.get(cityId) ? ` in ${cityName.get(cityId)}` : ''}
      </p>
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <CardGridSkeleton />
      ) : !items.length ? (
        <EmptyState
          icon={<Landmark className="h-6 w-6" />}
          title="Keine Sehenswürdigkeiten gefunden"
          text="Passe die Suche oder die Filter an."
          action={
            <Button
              onClick={() => {
                setQ('');
                setParams({}, { replace: true });
              }}
            >
              Filter zurücksetzen
            </Button>
          }
        />
      ) : (
        <>
          <AttractionGrid>
            {paged.items.map((a, i) => (
              <AttractionCard key={a.id} attraction={a} cityName={cityName.get(a.cityId)} priority={i < 4} />
            ))}
          </AttractionGrid>
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            onPage={(p) => {
              set({ seite: p > 1 ? String(p) : null });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </>
  );
}
