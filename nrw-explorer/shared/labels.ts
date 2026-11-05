import type { AttractionCategory, CityTag } from './types';

export const CATEGORY_LABELS: Record<AttractionCategory, string> = {
  'burgen-schloesser': 'Burgen und Schlösser',
  museen: 'Museen',
  kirchen: 'Kirchen und Kathedralen',
  'historische-gebaeude': 'Historische Gebäude',
  'parks-gaerten': 'Parks und Gärten',
  natur: 'Natur und Landschaft',
  architektur: 'Architektur',
  freizeit: 'Freizeit und Unterhaltung',
};

export const CITY_TAG_LABELS: Record<CityTag, string> = {
  historisch: 'Historische Städte',
  kultur: 'Kultur und Museen',
  natur: 'Natur und Landschaft',
  architektur: 'Architektur',
  familie: 'Familienausflüge',
  romantisch: 'Romantische Reiseziele',
  aktiv: 'Aktivurlaub',
};

/** Kategorien, die als "historische Orte" gelten */
export const HISTORICAL_CATEGORIES: AttractionCategory[] = ['burgen-schloesser', 'kirchen', 'historische-gebaeude'];

export function wikipediaUrl(title: string): string {
  return `https://de.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
