import L from 'leaflet';

// leaflet.markercluster erwartet ein globales "L"
(globalThis as unknown as { L: typeof L }).L = L;

export default L;
