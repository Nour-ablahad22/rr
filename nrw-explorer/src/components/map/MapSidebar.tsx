import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crosshair, Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import { ATTRACTION_CATEGORIES, type Attraction, type AttractionCategory, type City } from '@shared/types';
import { CATEGORY_LABELS } from '@shared/labels';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { SmartImage } from '@/components/common/SmartImage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, directionsUrl } from '@/lib/utils';

interface Props {
  cities: City[];
  cityId: string;
  onCity: (id: string) => void;
  category: AttractionCategory | 'alle';
  onCategory: (c: AttractionCategory | 'alle') => void;
  q: string;
  onQ: (q: string) => void;
  items: Array<Attraction & { distanceKm?: number }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLocate: () => void;
  locating: boolean;
  locateError?: string | null;
  geocode?: { available: boolean; loading: boolean; onSearch: () => void; label?: string | null; onClear: () => void };
  className?: string;
}

export const MapSidebar = forwardRef<HTMLDivElement, Props>(function MapSidebar(
  { cities, cityId, onCity, category, onCategory, q, onQ, items, selectedId, onSelect, onLocate, locating, locateError, geocode, className },
  listRef,
) {
  const city = cities.find((c) => c.id === cityId);
  const selected = items.find((a) => a.id === selectedId);
  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? '';

  return (
    <div className={cn('flex min-h-0 flex-col bg-ivory', className)}>
      <div className="space-y-3 border-b border-forest/10 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode?.available && items.length === 0 && geocode.onSearch()}
            placeholder={geocode?.available ? 'Ort, Sehenswürdigkeit oder Adresse …' : 'Sehenswürdigkeit suchen …'}
            className="pl-11 pr-9"
            aria-label="Karte durchsuchen"
          />
          {q && (
            <button onClick={() => onQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted" aria-label="Suche leeren">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={cityId || 'alle'} onValueChange={(v) => onCity(v === 'alle' ? '' : v)}>
            <SelectTrigger aria-label="Stadt auswählen" className="flex-1">
              <SelectValue placeholder="Stadt auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Städte (ganz NRW)</SelectItem>
              {[...cities]
                .sort((a, b) => a.name.localeCompare(b.name, 'de'))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={onLocate} aria-label="Orte in meiner Nähe anzeigen" title="In meiner Nähe">
            {locating ? <Loader2 className="animate-spin" /> : <Crosshair />}
          </Button>
        </div>
        {locateError && <p className="text-xs text-destructive">{locateError}</p>}
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Kategorien">
          {(['alle', ...ATTRACTION_CATEGORIES] as const).map((c) => {
            const Icon = c === 'alle' ? MapPin : CATEGORY_ICONS[c];
            return (
              <button
                key={c}
                onClick={() => onCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  category === c ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white text-ink hover:border-forest',
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {c === 'alle' ? 'Alle' : CATEGORY_LABELS[c]}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {city && (
          <div className="mb-4 rounded-2xl bg-forest p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sand">Ausgewählte Stadt</p>
            <p className="mt-1 font-display text-2xl">{city.name}</p>
            <p className="mt-1 text-sm text-white/80">{city.tagline}</p>
            <Link to={`/staedte/${city.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sand-light hover:text-white">
              Stadtporträt lesen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
        {geocode?.label && (
          <div className="mb-4 flex items-start justify-between gap-2 rounded-2xl border border-forest/15 bg-white p-3 text-sm">
            <span>
              <span className="block text-xs text-ink-muted">Orte in der Nähe von</span>
              {geocode.label}
            </span>
            <button onClick={geocode.onClear} aria-label="Adresssuche zurücksetzen" className="p-1 text-ink-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {selected && (
          <div className="mb-4 overflow-hidden rounded-2xl bg-white shadow-soft">
            <SmartImage wikiTitle={selected.wikiTitle} alt={selected.name} width={500} category={selected.category} className="h-36 w-full" />
            <div className="p-4">
              <p className="text-xs text-ink-muted">
                {cityName(selected.cityId)} · {CATEGORY_LABELS[selected.category]}
              </p>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-xl leading-snug">{selected.name}</h2>
                <FavoriteButton id={selected.id} name={selected.name} className="h-9 w-9 shrink-0 shadow-none ring-1 ring-forest/10" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{selected.shortDescription}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild size="sm">
                  <Link to={`/sehenswuerdigkeiten/${selected.slug}`}>Details ansehen</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={directionsUrl(selected.coordinates.lat, selected.coordinates.lng)} target="_blank" rel="noopener noreferrer">
                    <Navigation /> Route planen
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted" aria-live="polite">
          {items.length} {items.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
          {city ? ` in ${city.name}` : ''}
        </p>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-forest/20 p-5 text-center text-sm text-ink-muted">
            Keine Sehenswürdigkeiten für diese Auswahl.
            {geocode?.available && q.trim().length > 2 && (
              <Button size="sm" variant="outline" className="mt-3" onClick={geocode.onSearch} disabled={geocode.loading}>
                {geocode.loading ? <Loader2 className="animate-spin" /> : <Search />} „{q}“ als Adresse suchen
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((a) => {
              const Icon = CATEGORY_ICONS[a.category];
              const active = a.id === selectedId;
              return (
                <li key={a.id}>
                  <button
                    data-id={a.id}
                    onClick={() => onSelect(a.id)}
                    aria-current={active}
                    className={cn('flex w-full items-center gap-3 rounded-2xl p-2 text-left transition', active ? 'bg-white shadow-soft ring-2 ring-sand' : 'hover:bg-white')}
                  >
                    <SmartImage wikiTitle={a.wikiTitle} alt="" width={330} category={a.category} className="h-14 w-16 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                      <span className="flex items-center gap-1 truncate text-xs text-ink-muted">
                        <Icon className="h-3 w-3 shrink-0" /> {cityName(a.cityId)}
                        {a.distanceKm !== undefined && ` · ${a.distanceKm.toFixed(1).replace('.', ',')} km`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
});
