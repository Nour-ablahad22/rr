/**
 * Gemeinsames Datenmodell für Frontend (React) und Backend (Azure Functions).
 * Eine einzige Quelle für Städte und Sehenswürdigkeiten – Karten, Karten-Marker,
 * Detailseiten, Suche und API nutzen exakt dieselben Datensätze.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Genauigkeit der hinterlegten Koordinaten. "approx" = vor Veröffentlichung redaktionell prüfen. */
export type CoordinatePrecision = 'exact' | 'approx';

export const ATTRACTION_CATEGORIES = [
  'burgen-schloesser',
  'museen',
  'kirchen',
  'historische-gebaeude',
  'parks-gaerten',
  'natur',
  'architektur',
  'freizeit',
] as const;
export type AttractionCategory = (typeof ATTRACTION_CATEGORIES)[number];

export const CITY_TAGS = ['historisch', 'kultur', 'natur', 'architektur', 'familie', 'romantisch', 'aktiv'] as const;
export type CityTag = (typeof CITY_TAGS)[number];

export interface SourceRef {
  title: string;
  url: string;
}

export interface HistorySection {
  title: string;
  text: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  /** Region bzw. Landschaft, z. B. "Rheinland", "Ruhrgebiet", "Eifel" */
  region: string;
  tagline: string;
  description: string;
  /** Strukturierte historische Einführung (Gründung, Epochen, Kultur, Architektur, Ereignisse) */
  history: HistorySection[];
  /** Titel des deutschsprachigen Wikipedia-Artikels – dient als Bildquelle (Wikimedia Commons) und Referenz */
  wikiTitle: string;
  coordinates: Coordinates;
  zoom: number;
  tags: CityTag[];
  /** 1–10, redaktionelle Gewichtung für Sortierung */
  popularity: number;
  historicalSignificance: number;
  natureScore: number;
  transport?: string;
  visitorInfo?: string;
  officialWebsite?: string;
  nearby: string[];
  sources: SourceRef[];
}

export interface Attraction {
  id: string;
  slug: string;
  cityId: string;
  name: string;
  category: AttractionCategory;
  secondaryCategories?: AttractionCategory[];
  shortDescription: string;
  description: string;
  /** Geschichte */
  history: string;
  /** Historischer Hintergrund (Einordnung in Epochen) */
  historicalBackground: string;
  architecture: string;
  culturalImportance: string;
  /** Besondere Merkmale */
  features: string[];
  /** Interessante Fakten (belegt) */
  facts: string[];
  /** Sagen & Legenden – ausdrücklich von belegter Geschichte getrennt */
  legend?: string;
  recommendations: string[];
  wikiTitle: string;
  address: string;
  coordinates: Coordinates;
  coordinatePrecision: CoordinatePrecision;
  officialWebsite?: string;
  /** Nur gesetzt, wenn verifiziert – sonst bewusst leer */
  openingHours?: string;
  unesco?: boolean;
  era?: string;
  keywords?: string[];
  sources: SourceRef[];
}

export interface ImageCredit {
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export interface ResolvedImage {
  src: string;
  width?: number;
  height?: number;
  fullSrc?: string;
  alt: string;
  fileName?: string;
  sourceUrl: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchResult {
  type: 'city' | 'attraction';
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category?: AttractionCategory;
  wikiTitle: string;
  score: number;
}

export interface FavoritesDoc {
  id: string;
  userId: string;
  attractionIds: string[];
  updatedAt: string;
}
