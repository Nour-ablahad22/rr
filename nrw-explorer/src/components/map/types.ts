import type { AttractionCategory, Coordinates } from '@shared/types';

export interface MapPoint {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  category: AttractionCategory;
  coordinates: Coordinates;
  shortDescription: string;
  wikiTitle: string;
}

export interface MapFocus {
  center: Coordinates;
  zoom: number;
  /** Ändert sich der Schlüssel, fliegt die Karte erneut zum Ziel */
  key: string | number;
}

export interface MapViewProps {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  focus?: MapFocus | null;
  /** Ändert sich der Wert, wird der Ausschnitt an alle Punkte angepasst */
  fitKey?: string;
  className?: string;
  cluster?: boolean;
  compact?: boolean;
  initialCenter?: Coordinates;
  initialZoom?: number;
  /** Zusätzlicher Marker, z. B. eigener Standort */
  userLocation?: Coordinates | null;
}

/** Mittelpunkt von NRW für die Übersichtskarte */
export const NRW_CENTER: Coordinates = { lat: 51.43, lng: 7.66 };
export const NRW_ZOOM = 8;
