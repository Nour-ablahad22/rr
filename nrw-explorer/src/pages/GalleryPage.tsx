import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Expand, ImageOff } from 'lucide-react';
import type { AttractionCategory, ResolvedImage } from '@shared/types';
import { Lightbox, type LightboxImage } from '@/components/common/Lightbox';
import { SEO } from '@/components/common/SEO';
import { CardGridSkeleton, EmptyState } from '@/components/common/States';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttractions, useCities } from '@/hooks/useData';
import { useInView } from '@/hooks/useUtils';
import { useWikiImage } from '@/hooks/useWikiImage';
import { cn } from '@/lib/utils';

type GalleryCategory = 'staedte' | 'burgen' | 'kirchen' | 'museen' | 'natur' | 'parks' | 'architektur' | 'landschaften';

const GALLERY_LABELS: Record<GalleryCategory, string> = {
  staedte: 'Städte',
  burgen: 'Burgen und Schlösser',
  kirchen: 'Kirchen',
  museen: 'Museen',
  natur: 'Natur',
  parks: 'Parks',
  architektur: 'Historische Architektur',
  landschaften: 'Landschaften',
};

const CAT_MAP: Record<AttractionCategory, GalleryCategory> = {
  'burgen-schloesser': 'burgen',
  kirchen: 'kirchen',
  museen: 'museen',
  natur: 'natur',
  'parks-gaerten': 'parks',
  'historische-gebaeude': 'architektur',
  architektur: 'architektur',
  freizeit: 'parks',
};

/** Landschaften Nordrhein-Westfalens (eigene Galerieeinträge) */
const LANDSCAPES = [
  { wiki: 'Nationalpark Eifel', title: 'Nationalpark Eifel', subtitle: 'Eifel' },
  { wiki: 'Rursee', title: 'Rursee', subtitle: 'Eifel' },
  { wiki: 'Rothaargebirge', title: 'Rothaargebirge', subtitle: 'Sauerland' },
  { wiki: 'Teutoburger Wald', title: 'Teutoburger Wald', subtitle: 'Ostwestfalen-Lippe' },
  { wiki: 'Baldeneysee', title: 'Baldeneysee', subtitle: 'Essen' },
  { wiki: 'Münsterland', title: 'Münsterland', subtitle: 'Westfalen' },
  { wiki: 'Bergisches Land', title: 'Bergisches Land', subtitle: 'Rheinland' },
  { wiki: 'Niederrhein', title: 'Niederrhein', subtitle: 'Rheinland' },
];

interface GalleryItem {
  key: string;
  wikiTitle: string;
  title: string;
  subtitle: string;
  category: GalleryCategory;
  cityId?: string;
}

const ASPECTS = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/11]'];

function Tile({ item, index, onOpen, onResolved }: { item: GalleryItem; index: number; onOpen: () => void; onResolved: (key: string, img: ResolvedImage | null) => void }) {
  const { ref, inView } = useInView<HTMLButtonElement>('300px');
  const { data, isLoading, isFetched } = useWikiImage(item.wikiTitle, 500, item.title, inView);
  useEffect(() => {
    if (isFetched) onResolved(item.key, data ?? null);
  }, [isFetched, data, item.key, onResolved]);
  const missing = isFetched && !data;
  return (
    <button
      ref={ref}
      onClick={onOpen}
      disabled={missing}
      className={cn('group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-forest-50 text-left', ASPECTS[index % ASPECTS.length])}
      aria-label={`${item.title} vergrößern`}
    >
      {data && <img src={data.src} alt={`${item.title} – ${item.subtitle}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
      {(isLoading || !isFetched) && <div className="absolute inset-0 animate-pulse bg-ivory-dark" />}
      {missing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-forest/60">
          <ImageOff className="h-8 w-8" strokeWidth={1.25} />
          <span className="text-xs">Kein freies Bild verfügbar</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12 text-white">
        <p className="font-display text-lg leading-tight">{item.title}</p>
        <p className="text-xs text-white/80">{item.subtitle}</p>
      </div>
      {data && (
        <span className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-forest opacity-0 transition group-hover:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}

export default function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const active = (params.get('kategorie') as GalleryCategory | null) ?? null;
  const cityId = params.get('stadt') ?? '';
  const { data: cities = [], isLoading: cl } = useCities({ sort: 'alphabetisch' });
  const { data: attractions = [], isLoading: al } = useAttractions();
  const [resolved, setResolved] = useState<Record<string, ResolvedImage | null>>({});
  const [index, setIndex] = useState<number | null>(null);

  const cityName = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);
  const allItems = useMemo<GalleryItem[]>(
    () => [
      ...cities.map((c) => ({ key: `c-${c.id}`, wikiTitle: c.wikiTitle, title: c.name, subtitle: c.region, category: 'staedte' as const, cityId: c.id })),
      ...attractions.map((a) => ({ key: `a-${a.id}`, wikiTitle: a.wikiTitle, title: a.name, subtitle: cityName.get(a.cityId) ?? '', category: CAT_MAP[a.category], cityId: a.cityId })),
      ...LANDSCAPES.map((l) => ({ key: `l-${l.wiki}`, wikiTitle: l.wiki, title: l.title, subtitle: l.subtitle, category: 'landschaften' as const })),
    ],
    [cities, attractions, cityName],
  );
  // Doppelte Artikelbilder (z. B. Stadt und Altstadt) nur einmal zeigen
  const items = useMemo(() => {
    const seen = new Set<string>();
    return allItems.filter((it) => {
      if ((active && it.category !== active) || (cityId && it.cityId !== cityId)) return false;
      if (seen.has(it.wikiTitle)) return false;
      seen.add(it.wikiTitle);
      return true;
    });
  }, [allItems, active, cityId]);

  const onResolved = useCallback((key: string, img: ResolvedImage | null) => {
    setResolved((prev) => (key in prev ? prev : { ...prev, [key]: img }));
  }, []);

  const lightboxItems = items.filter((it) => resolved[it.key]);
  const lightboxImages: LightboxImage[] = lightboxItems.map((it) => ({ ...resolved[it.key]!, alt: `${it.title} – ${it.subtitle}`, caption: `${it.title} · ${it.subtitle}` }));

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <PageContainer>
      <SEO title="Galerie" description="Bilder aus Nordrhein-Westfalen: Städte, Burgen und Schlösser, Kirchen, Museen, Parks und Landschaften – frei lizenziert über Wikimedia Commons." />
      <PageHeader eyebrow="Galerie" title="Nordrhein-Westfalen in Bildern" text="Frei lizenzierte Fotografien von Wikimedia Commons. Urheber und Lizenz findest du in der Großansicht jedes Bildes." />

      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bildkategorien">
          <button onClick={() => set('kategorie', null)} aria-pressed={!active} className={cn('rounded-full border px-4 py-2 text-sm transition', !active ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white hover:border-forest')}>
            Alle
          </button>
          {(Object.keys(GALLERY_LABELS) as GalleryCategory[]).map((c) => (
            <button key={c} onClick={() => set('kategorie', c)} aria-pressed={active === c} className={cn('rounded-full border px-4 py-2 text-sm transition', active === c ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white hover:border-forest')}>
              {GALLERY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="lg:w-60">
          <Select value={cityId || 'alle'} onValueChange={(v) => set('stadt', v === 'alle' ? null : v)}>
            <SelectTrigger aria-label="Nach Stadt filtern">
              <SelectValue placeholder="Stadt auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Städte</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-5 text-sm text-ink-muted" aria-live="polite">
        {items.length} Motive
      </p>

      {cl || al ? (
        <CardGridSkeleton />
      ) : !items.length ? (
        <EmptyState title="Keine Bilder in dieser Auswahl" text="Wähle eine andere Kategorie oder Stadt." />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {items.map((it, i) => (
            <Tile
              key={it.key}
              item={it}
              index={i}
              onResolved={onResolved}
              onOpen={() => {
                const idx = lightboxItems.findIndex((l) => l.key === it.key);
                if (idx >= 0) setIndex(idx);
              }}
            />
          ))}
        </div>
      )}
      <Lightbox images={lightboxImages} index={index} onIndexChange={setIndex} onClose={() => setIndex(null)} />
    </PageContainer>
  );
}
