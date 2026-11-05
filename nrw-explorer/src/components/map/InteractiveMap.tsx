import { lazy, Suspense } from 'react';
import { hasGoogleMaps } from '@/config/env';
import { cn } from '@/lib/utils';
import type { MapViewProps } from './types';

const GoogleMapView = lazy(() => import('./GoogleMapView'));
const LeafletMapView = lazy(() => import('./LeafletMapView'));

/**
 * Einheitliche Kartenkomponente. Mit VITE_GOOGLE_MAPS_API_KEY wird die Google Maps JavaScript API genutzt,
 * ohne Schlüssel eine OpenStreetMap-Karte (Leaflet) als klar gekennzeichneter Entwicklungs-Fallback.
 */
export function InteractiveMap(props: MapViewProps) {
  return (
    <div className={cn('relative overflow-hidden bg-[#e9e6dc]', props.className)}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-ink-muted" aria-busy="true">
            <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-forest/20 border-t-forest" /> Karte wird geladen …
          </div>
        }
      >
        {hasGoogleMaps ? <GoogleMapView {...props} className="h-full w-full" /> : <LeafletMapView {...props} className="h-full w-full" />}
      </Suspense>
      {!hasGoogleMaps && !props.compact && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[500] flex justify-center sm:right-auto">
          <p className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 text-[11px] text-ink-muted shadow-soft">
            Entwicklungsmodus: OpenStreetMap-Karte – kein Google-Maps-Schlüssel konfiguriert (<code>VITE_GOOGLE_MAPS_API_KEY</code>)
          </p>
        </div>
      )}
    </div>
  );
}
