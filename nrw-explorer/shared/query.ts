import type { Attraction, AttractionCategory, City, CityTag, Coordinates, Paginated, SearchResult } from './types';
import { CATEGORY_LABELS } from './labels';

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function paginate<T>(items: T[], page = 1, pageSize = 24): Paginated<T> {
  const safeSize = Math.min(Math.max(pageSize, 1), 100);
  const totalPages = Math.max(1, Math.ceil(items.length / safeSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safeSize;
  return { items: items.slice(start, start + safeSize), total: items.length, page: safePage, pageSize: safeSize, totalPages };
}

/** Großkreisentfernung in Kilometern */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type CitySort = 'beliebt' | 'alphabetisch' | 'historisch' | 'natur';

export interface CityQuery {
  q?: string;
  tags?: CityTag[];
  sort?: CitySort;
}

export function queryCities(cities: City[], query: CityQuery = {}): City[] {
  const q = query.q ? normalize(query.q) : '';
  let result = cities.filter((c) => {
    if (query.tags?.length && !query.tags.every((t) => c.tags.includes(t))) return false;
    if (q && !normalize(`${c.name} ${c.region} ${c.tagline} ${c.description}`).includes(q)) return false;
    return true;
  });
  const sort = query.sort ?? 'beliebt';
  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'alphabetisch':
        return a.name.localeCompare(b.name, 'de');
      case 'historisch':
        return b.historicalSignificance - a.historicalSignificance || a.name.localeCompare(b.name, 'de');
      case 'natur':
        return b.natureScore - a.natureScore || a.name.localeCompare(b.name, 'de');
      default:
        return b.popularity - a.popularity || a.name.localeCompare(b.name, 'de');
    }
  });
  return result;
}

export interface AttractionQuery {
  q?: string;
  cityId?: string;
  categories?: AttractionCategory[];
  unesco?: boolean;
  sort?: 'alphabetisch' | 'stadt';
}

export function matchesCategory(a: Attraction, categories: AttractionCategory[]): boolean {
  if (!categories.length) return true;
  return categories.some((c) => a.category === c || a.secondaryCategories?.includes(c));
}

export function queryAttractions(attractions: Attraction[], query: AttractionQuery = {}): Attraction[] {
  const q = query.q ? normalize(query.q) : '';
  const result = attractions.filter((a) => {
    if (query.cityId && a.cityId !== query.cityId) return false;
    if (query.categories?.length && !matchesCategory(a, query.categories)) return false;
    if (query.unesco && !a.unesco) return false;
    if (q && !normalize(`${a.name} ${a.shortDescription} ${(a.keywords ?? []).join(' ')} ${CATEGORY_LABELS[a.category]}`).includes(q))
      return false;
    return true;
  });
  if (query.sort === 'alphabetisch') return [...result].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return result;
}

export function nearbyAttractions(
  attractions: Attraction[],
  origin: Coordinates,
  options: { radiusKm?: number; limit?: number; excludeId?: string } = {},
): Array<Attraction & { distanceKm: number }> {
  const radius = options.radiusKm ?? 25;
  return attractions
    .filter((a) => a.id !== options.excludeId)
    .map((a) => ({ ...a, distanceKm: distanceKm(origin, a.coordinates) }))
    .filter((a) => a.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, options.limit ?? 6);
}

/** Gewichtete Volltextsuche über Städte und Sehenswürdigkeiten */
export function search(cities: City[], attractions: Attraction[], rawQuery: string, limit = 12): SearchResult[] {
  const q = normalize(rawQuery);
  if (q.length < 2) return [];
  const terms = q.split(' ').filter(Boolean);
  const cityName = new Map(cities.map((c) => [c.id, c.name]));

  const score = (name: string, extra: string): number => {
    const n = normalize(name);
    const e = normalize(extra);
    if (!terms.every((t) => n.includes(t) || e.includes(t))) return 0;
    let s = 1;
    if (n === q) s += 100;
    else if (n.startsWith(q)) s += 60;
    else if (n.includes(q)) s += 40;
    for (const t of terms) if (n.split(' ').some((w) => w.startsWith(t))) s += 10;
    return s;
  };

  const results: SearchResult[] = [];
  for (const c of cities) {
    const s = score(c.name, `${c.region} ${c.tagline} ${c.tags.join(' ')}`);
    if (s > 0)
      results.push({ type: 'city', id: c.id, slug: c.slug, name: c.name, subtitle: `Stadt · ${c.region}`, wikiTitle: c.wikiTitle, score: s + 5 });
  }
  for (const a of attractions) {
    const s = score(
      a.name,
      `${cityName.get(a.cityId) ?? ''} ${CATEGORY_LABELS[a.category]} ${(a.secondaryCategories ?? []).map((c) => CATEGORY_LABELS[c]).join(' ')} ${(a.keywords ?? []).join(' ')} ${a.era ?? ''}`,
    );
    if (s > 0)
      results.push({
        type: 'attraction',
        id: a.id,
        slug: a.slug,
        name: a.name,
        subtitle: `${cityName.get(a.cityId) ?? ''} · ${CATEGORY_LABELS[a.category]}`,
        category: a.category,
        wikiTitle: a.wikiTitle,
        score: s,
      });
  }
  return results.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name, 'de')).slice(0, limit);
}
