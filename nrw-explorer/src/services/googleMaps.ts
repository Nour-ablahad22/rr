/**
 * Zugriff auf Google-Maps-Dienste (Geocoding) über die bereits geladene Maps JavaScript API.
 * Es wird bewusst der JS-Geocoder statt des Web-Service genutzt, damit der per HTTP-Referrer
 * eingeschränkte Browser-Schlüssel ausreicht und kein Server-Schlüssel im Frontend landet.
 */
import { hasGoogleMaps } from '@/config/env';
import type { Coordinates } from '@shared/types';

interface GoogleNs {
  maps?: { importLibrary?: (name: string) => Promise<unknown> };
}

export function isGoogleReady(): boolean {
  return hasGoogleMaps && !!(globalThis as unknown as { google?: GoogleNs }).google?.maps?.importLibrary;
}

export async function geocodeAddress(address: string): Promise<(Coordinates & { label: string }) | null> {
  const g = (globalThis as unknown as { google?: GoogleNs }).google;
  if (!g?.maps?.importLibrary) return null;
  const { Geocoder } = (await g.maps.importLibrary('geocoding')) as { Geocoder: new () => google.maps.Geocoder };
  const res = await new Geocoder().geocode({ address, region: 'de', componentRestrictions: { country: 'DE' } });
  const first = res.results[0];
  if (!first) return null;
  const loc = first.geometry.location;
  return { lat: loc.lat(), lng: loc.lng(), label: first.formatted_address };
}
