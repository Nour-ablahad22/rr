import type { AttractionCategory } from '@shared/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/components/common/categoryIcons';

/** Kategorie-Marker als Pin mit Icon – wird von Google Maps (AdvancedMarker) und Leaflet (divIcon) genutzt. */
export function MarkerPin({ category, selected, label }: { category: AttractionCategory; selected?: boolean; label?: string }) {
  const Icon = CATEGORY_ICONS[category];
  const color = selected ? '#D7B46A' : CATEGORY_COLORS[category];
  const size = selected ? 46 : 38;
  return (
    <div
      aria-label={label}
      style={{
        width: size,
        height: size + 8,
        position: 'relative',
        transform: selected ? 'translateY(-2px)' : undefined,
        transition: 'all 200ms ease',
        filter: 'drop-shadow(0 6px 10px rgba(23,74,59,0.35))',
        cursor: 'pointer',
      }}
    >
      <svg width={size} height={size + 8} viewBox="0 0 40 48" style={{ position: 'absolute', inset: 0 }}>
        <path d="M20 47 C20 47 3 30 3 19 A17 17 0 1 1 37 19 C37 30 20 47 20 47 Z" fill={color} stroke="#fff" strokeWidth="2.5" />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon color={selected ? '#202B28' : '#fff'} size={selected ? 20 : 17} strokeWidth={2} />
      </div>
    </div>
  );
}

export function UserLocationDot() {
  return (
    <div style={{ width: 18, height: 18, borderRadius: 9999, background: '#2563eb', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(37,99,235,0.25)' }} aria-label="Dein Standort" />
  );
}
