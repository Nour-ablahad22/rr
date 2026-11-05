import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { List, Map as MapIcon } from 'lucide-react';
import { ATTRACTION_CATEGORIES, type AttractionCategory, type Coordinates } from '@shared/types';
import { matchesCategory, nearbyAttractions, normalize } from '@shared/query';
import { SEO } from '@/components/common/SEO';
import { ErrorState } from '@/components/common/States';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { MapSidebar } from '@/components/map/MapSidebar';
import { toMapPoint } from '@/components/map/mapPoints';
import type { MapFocus } from '@/components/map/types';
import { hasGoogleMaps } from '@/config/env';
import { useAttractions, useCities } from '@/hooks/useData';
import { useDebounce, useMediaQuery } from '@/hooks/useUtils';
import { cn } from '@/lib/utils';
import { geocodeAddress, isGoogleReady } from '@/services/googleMaps';

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileView, setMobileView] = useState<'karte' | 'liste'>('karte');
  const { data: cities = [] } = useCities();
  const { data: all = [], isLoading, isError, refetch } = useAttractions();

  const cityId = params.get('stadt') ?? '';
  const selectedId = params.get('ort');
  const catParam = params.get('kategorie');
  const category: AttractionCategory | 'alle' = catParam && (ATTRACTION_CATEGORIES as readonly string[]).includes(catParam) ? (catParam as AttractionCategory) : 'alle';
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 150);
  const [origin, setOrigin] = useState<(Coordinates & { label?: string }) | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const setParam = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };

  const cityMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);
  const city = cityMap.get(cityId);

  // Gefilterte Liste – identische Datenquelle für Sidebar und Marker
  const items = useMemo(() => {
    const nq = normalize(debouncedQ);
    let list = all.filter((a) => (!cityId || a.cityId === cityId) && (category === 'alle' || matchesCategory(a, [category])));
    if (nq) list = list.filter((a) => normalize(`${a.name} ${cityMap.get(a.cityId)?.name ?? ''} ${(a.keywords ?? []).join(' ')}`).includes(nq));
    if (origin) {
      const ids = new Set(list.map((a) => a.id));
      return nearbyAttractions(all, origin, { radiusKm: 60, limit: 40 }).filter((a) => ids.has(a.id));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [all, cityId, category, debouncedQ, origin, cityMap]);

  const points = useMemo(() => items.map((a) => toMapPoint(a, cityMap)), [items, cityMap]);

  // Ausgewählter Ort aus URL (z. B. /karte?ort=koelner-dom): Stadt mitsetzen
  const initialSync = useRef(false);
  useEffect(() => {
    if (initialSync.current || !all.length || !selectedId) return;
    initialSync.current = true;
    if (!all.some((a) => a.id === selectedId)) setParam({ ort: null });
  }, [all, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Kartenausschnitt: bei Stadt- oder Filterwechsel an Punkte anpassen
  const fitKey = points.length ? `${cityId}|${category}|${debouncedQ}|${origin?.lat ?? ''}` : undefined;
  const focus: MapFocus | null = origin ? { center: origin, zoom: 11, key: `${origin.lat},${origin.lng}` } : null;

  // Liste zum ausgewählten Eintrag scrollen
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${CSS.escape(selectedId)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const select = (id: string | null) => {
    setParam({ ort: id });
    if (id && !isDesktop) setMobileView('karte');
  };

  const locate = () => {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError('Dein Browser unterstützt keine Standortbestimmung.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Deinem Standort' });
        setParam({ stadt: null, ort: null });
      },
      () => {
        setLocating(false);
        setLocateError('Standort konnte nicht ermittelt werden. Bitte Freigabe im Browser prüfen.');
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const searchAddress = async () => {
    if (!isGoogleReady() || q.trim().length < 3) return;
    setGeocoding(true);
    try {
      const res = await geocodeAddress(q.trim());
      if (res) {
        setOrigin(res);
        setQ('');
        setParam({ stadt: null, ort: null });
      } else setLocateError('Adresse nicht gefunden.');
    } catch {
      setLocateError('Die Adresssuche ist derzeit nicht verfügbar.');
    } finally {
      setGeocoding(false);
    }
  };

  const sidebar = (
    <MapSidebar
      ref={listRef}
      cities={cities}
      cityId={cityId}
      onCity={(id) => {
        setOrigin(null);
        setParam({ stadt: id || null, ort: null });
      }}
      category={category}
      onCategory={(c) => setParam({ kategorie: c === 'alle' ? null : c })}
      q={q}
      onQ={setQ}
      items={items}
      selectedId={selectedId}
      onSelect={(id) => select(id)}
      onLocate={locate}
      locating={locating}
      locateError={locateError}
      geocode={{
        available: hasGoogleMaps,
        loading: geocoding,
        onSearch: searchAddress,
        label: origin?.label ?? null,
        onClear: () => setOrigin(null),
      }}
      className="h-full"
    />
  );

  return (
    <div className="flex h-[100svh] flex-col pt-[72px]">
      <SEO
        title={city ? `Karte: Sehenswürdigkeiten in ${city.name}` : 'Interaktive Karte'}
        description="Interaktive Karte aller Sehenswürdigkeiten in Nordrhein-Westfalen – nach Stadt und Kategorie filtern, Details ansehen und Route planen."
      />
      <h1 className="sr-only">Interaktive Karte von Nordrhein-Westfalen</h1>

      {/* Mobile Umschalter */}
      <div className="flex border-b border-forest/10 bg-ivory p-2 lg:hidden" role="tablist" aria-label="Ansicht wählen">
        {(['karte', 'liste'] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={mobileView === v}
            onClick={() => setMobileView(v)}
            className={cn('flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition', mobileView === v ? 'bg-forest text-white' : 'text-ink')}
          >
            {v === 'karte' ? <MapIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {v === 'karte' ? 'Karte' : `Liste (${items.length})`}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside aria-label="Filter und Ergebnisliste" className={cn('min-h-0 w-full border-r border-forest/10 lg:block lg:w-[360px] lg:shrink-0', mobileView === 'liste' ? 'block' : 'hidden')}>
          {sidebar}
        </aside>
        <div className={cn('relative min-h-0 flex-1', mobileView === 'karte' || isDesktop ? 'block' : 'hidden')}>
          {isError ? (
            <div className="p-6">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : (
            <InteractiveMap
              points={points}
              selectedId={selectedId}
              onSelect={select}
              fitKey={isLoading ? undefined : fitKey}
              focus={focus}
              userLocation={origin}
              className="h-full w-full"
            />
          )}
          {!isDesktop && city && (
            <div className="pointer-events-none absolute left-3 top-3 z-[500]">
              <span className="rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-white shadow-soft">{city.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
