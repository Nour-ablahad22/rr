import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  InfoWindow,
  Map,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Renderer } from '@googlemaps/markerclusterer';
import { env } from '@/config/env';
import { MapInfoWindow } from './MapInfoWindow';
import { MarkerPin, UserLocationDot } from './MapMarker';
import { NRW_CENTER, NRW_ZOOM, type MapViewProps } from './types';

/** Cluster-Darstellung im Farbschema von NRW Explorer */
const clusterRenderer: Renderer = {
  render: ({ count, position }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:42px;height:42px;border-radius:9999px;background:#174A3B;color:#fff;display:flex;align-items:center;justify-content:center;font:600 14px Inter,sans-serif;box-shadow:0 0 0 6px rgba(215,180,106,.45)';
    el.textContent = String(count);
    return new google.maps.marker.AdvancedMarkerElement({ position, content: el, zIndex: 1000 + count });
  },
};

function Markers({ points, selectedId, onSelect, cluster, compact }: Pick<MapViewProps, 'points' | 'selectedId' | 'onSelect' | 'cluster' | 'compact'>) {
  const map = useMap();
  const [markers, setMarkers] = useState<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const clusterer = useMemo(() => (map && cluster ? new MarkerClusterer({ map, renderer: clusterRenderer }) : null), [map, cluster]);

  useEffect(() => {
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  useEffect(() => () => clusterer?.setMap(null), [clusterer]);

  const setMarkerRef = useCallback((marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => {
    setMarkers((prev) => {
      if ((marker && prev[key] === marker) || (!marker && !prev[key])) return prev;
      if (marker) return { ...prev, [key]: marker };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const selected = points.find((p) => p.id === selectedId);

  return (
    <>
      {points.map((p) => (
        <AdvancedMarker
          key={p.id}
          position={p.coordinates}
          title={p.name}
          ref={(m) => setMarkerRef(m, p.id)}
          zIndex={p.id === selectedId ? 999 : undefined}
          onClick={() => onSelect?.(p.id)}
        >
          <MarkerPin category={p.category} selected={p.id === selectedId} label={p.name} />
        </AdvancedMarker>
      ))}
      {selected && !compact && (
        <InfoWindow position={selected.coordinates} pixelOffset={[0, -50]} headerDisabled onCloseClick={() => onSelect?.(null)} maxWidth={300}>
          <MapInfoWindow point={selected} onClose={() => onSelect?.(null)} />
        </InfoWindow>
      )}
    </>
  );
}

function Controller({ points, selectedId, focus, fitKey }: Pick<MapViewProps, 'points' | 'selectedId' | 'focus' | 'fitKey'>) {
  const map = useMap();
  const lastFit = useRef<string | undefined>();

  useEffect(() => {
    if (!map || !focus) return;
    map.panTo(focus.center);
    map.setZoom(focus.zoom);
  }, [map, focus?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map || fitKey === undefined || lastFit.current === fitKey || points.length === 0) return;
    lastFit.current = fitKey;
    if (selectedId && points.some((p) => p.id === selectedId)) return;
    if (points.length === 1) {
      map.panTo(points[0]!.coordinates);
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p.coordinates));
    map.fitBounds(bounds, 60);
  }, [map, fitKey, points]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!map || !selectedId) return;
    const p = points.find((x) => x.id === selectedId);
    if (!p) return;
    map.panTo({ lat: p.coordinates.lat + 0.0025, lng: p.coordinates.lng });
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15);
  }, [map, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function LoadStatus() {
  const status = useApiLoadingStatus();
  if (status !== APILoadingStatus.FAILED && status !== APILoadingStatus.AUTH_FAILURE) return null;
  return (
    <div role="alert" className="absolute inset-0 z-10 flex items-center justify-center bg-ivory/95 p-6 text-center">
      <div>
        <p className="font-display text-xl">Google Maps konnte nicht geladen werden</p>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          Bitte prüfe den API-Schlüssel, die HTTP-Referrer-Beschränkung und ob die Maps JavaScript API im Google-Cloud-Projekt aktiviert ist.
        </p>
      </div>
    </div>
  );
}

export default function GoogleMapView({ points, selectedId, onSelect, focus, fitKey, className, cluster = true, compact, initialCenter, initialZoom, userLocation }: MapViewProps) {
  return (
    <APIProvider apiKey={env.googleMapsApiKey} language="de" region="DE" libraries={['marker', 'geocoding']}>
      <div className={className} style={{ position: 'relative' }}>
        <Map
          mapId={env.googleMapsMapId}
          defaultCenter={initialCenter ?? NRW_CENTER}
          defaultZoom={initialZoom ?? NRW_ZOOM}
          gestureHandling={compact ? 'cooperative' : 'greedy'}
          mapTypeControl={!compact}
          fullscreenControl
          zoomControl
          streetViewControl={false}
          clickableIcons={false}
          onClick={() => onSelect?.(null)}
          style={{ width: '100%', height: '100%' }}
        >
          <Markers points={points} selectedId={selectedId} onSelect={onSelect} cluster={cluster && !compact} compact={compact} />
          <Controller points={points} selectedId={selectedId} focus={focus} fitKey={fitKey} />
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Dein Standort">
              <UserLocationDot />
            </AdvancedMarker>
          )}
        </Map>
        <LoadStatus />
      </div>
    </APIProvider>
  );
}
