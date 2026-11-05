import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Coordinates } from '@shared/types';
import { dataService, type AttractionQuery, type CityQuery } from '@/services/dataService';

const STATIC = { staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60 } as const;

export const useCities = (query: CityQuery = {}) =>
  useQuery({ queryKey: ['cities', query], queryFn: () => dataService.getCities(query), placeholderData: keepPreviousData, ...STATIC });

export const useCity = (slug: string | undefined) =>
  useQuery({ queryKey: ['city', slug], queryFn: () => dataService.getCity(slug!), enabled: !!slug, ...STATIC });

export const useAttractions = (query: AttractionQuery = {}) =>
  useQuery({
    queryKey: ['attractions', query],
    queryFn: () => dataService.getAttractions(query),
    placeholderData: keepPreviousData,
    ...STATIC,
  });

export const useAttraction = (slug: string | undefined) =>
  useQuery({ queryKey: ['attraction', slug], queryFn: () => dataService.getAttraction(slug!), enabled: !!slug, ...STATIC });

export const useCityAttractions = (cityId: string | undefined) =>
  useQuery({ queryKey: ['city-attractions', cityId], queryFn: () => dataService.getCityAttractions(cityId!), enabled: !!cityId, ...STATIC });

export const useSearch = (q: string) =>
  useQuery({ queryKey: ['search', q], queryFn: () => dataService.search(q), enabled: q.trim().length >= 2, placeholderData: keepPreviousData, ...STATIC });

export const useNearby = (origin: Coordinates | undefined, opts: { radiusKm?: number; limit?: number; excludeId?: string } = {}) =>
  useQuery({
    queryKey: ['nearby', origin?.lat, origin?.lng, opts],
    queryFn: () => dataService.getNearby(origin!, opts),
    enabled: !!origin,
    ...STATIC,
  });
