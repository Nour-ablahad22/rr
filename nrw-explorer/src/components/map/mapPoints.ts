import type { Attraction, City } from '@shared/types';
import type { MapPoint } from './types';

export function toMapPoint(a: Attraction, cities: Map<string, City> | City[]): MapPoint {
  const cityName = Array.isArray(cities) ? cities.find((c) => c.id === a.cityId)?.name : cities.get(a.cityId)?.name;
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    cityName: cityName ?? '',
    category: a.category,
    coordinates: a.coordinates,
    shortDescription: a.shortDescription,
    wikiTitle: a.wikiTitle,
  };
}
