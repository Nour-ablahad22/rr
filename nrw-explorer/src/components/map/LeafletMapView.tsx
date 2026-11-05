import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import L from './leafletSetup';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { AttractionCategory } from '@shared/types';
import { MapInfoWindow } from './MapInfoWindow';
import { MarkerPin, UserLocationDot } from './MapMarker';
import { NRW_CENTER, NRW_ZOOM, type MapViewProps } from './types';

const iconCache = new Map<string, L.DivIcon>();
function pinIcon(category: AttractionCategory, selected: boolean): L.DivIcon {
  const key = `${category}-${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const size = selected ? 46 : 38;
    icon = L.divIcon({
      className: 'nrw-marker',
      html: renderToStaticMarkup(<MarkerPin category={category} selected={selected} />),
      iconSize: [size, size + 8],
      iconAnchor: [size / 2, size + 8],
      popupAnchor: [0, -(size + 4)],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

/** Vollbild-Schalter (Leaflet bringt keinen eigenen mit) */
const FullscreenControl = L.Control.extend({
  onAdd(map: L.Map) {
    const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control') as HTMLAnchorElement;
    btn.href = '#';
    btn.title = 'Vollbild';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Vollbildmodus umschalten');
    btn.style.cssText = 'width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:#fff;color:#174A3B';
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
    L.DomEvent.on(btn, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      const el = map.getContainer().parentElement ?? map.getContainer();
      if (document.fullscreenElement) void document.exitFullscreen();
      else void el.requestFullscreen?.();
    });
    return btn;
  },
});

export default function LeafletMapView({ points, selectedId, onSelect, focus, fitKey, className, cluster = true, compact, initialCenter, initialZoom, userLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const popupRef = useRef<L.Popup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lastFit = useRef<string | undefined>();
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [popupEl] = useState(() => document.createElement('div'));
  const [ready, setReady] = useState(false);

  // Karte initialisieren
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: initialCenter ?? NRW_CENTER,
      zoom: initialZoom ?? NRW_ZOOM,
      scrollWheelZoom: !compact,
      zoomControl: true,
    });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    }).addTo(map);
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Karte: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA), Daten: &copy; OpenStreetMap',
    });
    if (!compact) {
      L.control.layers({ Karte: osm, Gelände: topo }, undefined, { position: 'topright' }).addTo(map);
    }
    new FullscreenControl({ position: 'topleft' }).addTo(map);
    map.on('click', () => onSelectRef.current?.(null));
    mapRef.current = map;
    setReady(true);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Marker synchronisieren
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current?.remove();
    markersRef.current.clear();
    const layer: L.LayerGroup =
      cluster && !compact ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, spiderfyOnMaxZoom: true }) : L.layerGroup();
    for (const p of points) {
      const m = L.marker([p.coordinates.lat, p.coordinates.lng], {
        icon: pinIcon(p.category, p.id === selectedId),
        title: p.name,
        alt: p.name,
        keyboard: true,
        riseOnHover: true,
      });
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current?.(p.id);
      });
      markersRef.current.set(p.id, m);
      layer.addLayer(m);
    }
    layer.addTo(map);
    layerRef.current = layer;
  }, [points, cluster, compact, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auswahl: Marker hervorheben, Popup öffnen, hinzoomen
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m, id) => {
      const p = points.find((x) => x.id === id);
      if (p) m.setIcon(pinIcon(p.category, id === selectedId));
      m.setZIndexOffset(id === selectedId ? 1000 : 0);
    });
    const previous = popupRef.current;
    popupRef.current = null;
    previous?.remove();
    if (!selectedId) return;
    const p = points.find((x) => x.id === selectedId);
    const marker = markersRef.current.get(selectedId);
    if (!p || !marker) return;
    const target = L.latLng(p.coordinates.lat, p.coordinates.lng);
    const zoom = Math.max(map.getZoom(), 15);
    const layer = layerRef.current;
    const open = () => {
      if (compact) return;
      const popup = L.popup({ closeButton: false, autoPan: true, offset: [0, -48], maxWidth: 300, minWidth: 280 })
        .setLatLng(target)
        .setContent(popupEl)
        .openOn(map);
      popup.on('remove', () => {
        if (popupRef.current === popup) onSelectRef.current?.(null);
      });
      popupRef.current = popup;
    };
    if (layer && 'zoomToShowLayer' in layer) {
      (layer as L.MarkerClusterGroup).zoomToShowLayer(marker, () => {
        map.flyTo(target, zoom, { duration: 0.6 });
        map.once('moveend', open);
      });
    } else {
      map.flyTo(target, zoom, { duration: 0.6 });
      map.once('moveend', open);
    }
  }, [selectedId, points]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fokus (z. B. Stadtwahl)
  useEffect(() => {
    if (!mapRef.current || !focus) return;
    mapRef.current.flyTo([focus.center.lat, focus.center.lng], focus.zoom, { duration: 0.8 });
  }, [focus?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ausschnitt an Punkte anpassen
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitKey === undefined || lastFit.current === fitKey || !points.length) return;
    lastFit.current = fitKey;
    // Eine aktive Auswahl hat Vorrang vor dem Gesamtausschnitt
    if (selectedId && points.some((p) => p.id === selectedId)) return;
    if (points.length === 1) map.setView([points[0]!.coordinates.lat, points[0]!.coordinates.lng], 15);
    else map.fitBounds(L.latLngBounds(points.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number])), { padding: [50, 50], maxZoom: 15 });
  }, [fitKey, points, ready]);

  // Eigener Standort
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    userMarkerRef.current?.remove();
    if (!userLocation) return;
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({ className: 'nrw-marker', html: renderToStaticMarkup(<UserLocationDot />), iconSize: [18, 18], iconAnchor: [9, 9] }),
      title: 'Dein Standort',
    }).addTo(map);
  }, [userLocation, ready]);

  const selected = points.find((p) => p.id === selectedId);

  return (
    <>
      <div ref={containerRef} className={className} role="region" aria-label="Interaktive Karte" />
      {selected && !compact && createPortal(<MapInfoWindow point={selected} onClose={() => onSelect?.(null)} />, popupEl)}
    </>
  );
}
