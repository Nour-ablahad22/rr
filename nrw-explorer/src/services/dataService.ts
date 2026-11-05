/**
 * Datenzugriffsschicht. Je nach VITE_DATA_SOURCE werden die Daten
 * - "local": aus dem eingebauten Datensatz (shared/data) geladen – sofort lauffähig, kein Backend nötig
 * - "api":   über die Azure-Functions-REST-API (Cosmos DB) abgerufen.
 * Beide Wege liefern identische Typen; Filter- und Suchlogik ist in shared/query.ts geteilt.
 */
import { env } from '@/config/env';
import type { Attraction, City, Coordinates, Paginated, SearchResult } from '@shared/types';
import {
  nearbyAttractions,
  paginate,
  queryAttractions,
  queryCities,
  search as searchLocal,
  type AttractionQuery,
  type CityQuery,
} from '@shared/query';
import { apiFetch } from './apiClient';

type Dataset = typeof import('@shared/data/index');
let datasetPromise: Promise<Dataset> | null = null;
const loadDataset = () => (datasetPromise ??= import('@shared/data/index'));

const toParams = (obj: Record<string, unknown>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === '' || v === null) continue;
    p.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const dataService = {
  async getCities(query: CityQuery = {}): Promise<City[]> {
    if (env.dataSource === 'api') {
      const res = await apiFetch<Paginated<City>>(`/cities${toParams({ q: query.q, tags: query.tags, sort: query.sort, pageSize: 100 })}`);
      return res.items;
    }
    const { cities } = await loadDataset();
    return queryCities(cities, query);
  },

  async getCity(idOrSlug: string): Promise<City | null> {
    if (env.dataSource === 'api') {
      try {
        return await apiFetch<City>(`/cities/${encodeURIComponent(idOrSlug)}`);
      } catch (e) {
        if ((e as { status?: number }).status === 404) return null;
        throw e;
      }
    }
    const { cities } = await loadDataset();
    return cities.find((c) => c.slug === idOrSlug || c.id === idOrSlug) ?? null;
  },

  async getAttractions(query: AttractionQuery = {}): Promise<Attraction[]> {
    if (env.dataSource === 'api') {
      const res = await apiFetch<Paginated<Attraction>>(
        `/attractions${toParams({ q: query.q, cityId: query.cityId, category: query.categories, unesco: query.unesco || undefined, sort: query.sort, pageSize: 100 })}`,
      );
      return res.items;
    }
    const { attractions } = await loadDataset();
    return queryAttractions(attractions, query);
  },

  async getAttraction(idOrSlug: string): Promise<Attraction | null> {
    if (env.dataSource === 'api') {
      try {
        return await apiFetch<Attraction>(`/attractions/${encodeURIComponent(idOrSlug)}`);
      } catch (e) {
        if ((e as { status?: number }).status === 404) return null;
        throw e;
      }
    }
    const { attractions } = await loadDataset();
    return attractions.find((a) => a.slug === idOrSlug || a.id === idOrSlug) ?? null;
  },

  async getCityAttractions(cityId: string): Promise<Attraction[]> {
    if (env.dataSource === 'api') {
      const res = await apiFetch<Paginated<Attraction>>(`/cities/${encodeURIComponent(cityId)}/attractions?pageSize=100`);
      return res.items;
    }
    const { attractions } = await loadDataset();
    return attractions.filter((a) => a.cityId === cityId);
  },

  async search(q: string): Promise<SearchResult[]> {
    if (q.trim().length < 2) return [];
    if (env.dataSource === 'api') return apiFetch<SearchResult[]>(`/search${toParams({ q })}`);
    const { cities, attractions } = await loadDataset();
    return searchLocal(cities, attractions, q);
  },

  async getNearby(origin: Coordinates, opts: { radiusKm?: number; limit?: number; excludeId?: string } = {}) {
    if (env.dataSource === 'api') {
      return apiFetch<Array<Attraction & { distanceKm: number }>>(
        `/attractions/nearby${toParams({ lat: origin.lat, lng: origin.lng, radiusKm: opts.radiusKm, limit: opts.limit, exclude: opts.excludeId })}`,
      );
    }
    const { attractions } = await loadDataset();
    return nearbyAttractions(attractions, origin, opts);
  },

  paginate,
};

export type { AttractionQuery, CityQuery };
