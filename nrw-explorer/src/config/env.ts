/**
 * Zentrale Laufzeit-Konfiguration. Nur VITE_-Variablen sind im Browser sichtbar –
 * hier dürfen ausschließlich öffentliche, eingeschränkte Schlüssel stehen.
 * Server-Geheimnisse (Cosmos DB, Storage) gehören in die Azure-Functions-Konfiguration / Key Vault.
 */
const raw = import.meta.env;

export const env = {
  googleMapsApiKey: (raw.VITE_GOOGLE_MAPS_API_KEY ?? '').trim(),
  googleMapsMapId: (raw.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID').trim() || 'DEMO_MAP_ID',
  dataSource: (raw.VITE_DATA_SOURCE === 'api' ? 'api' : 'local') as 'api' | 'local',
  apiBaseUrl: (raw.VITE_API_BASE_URL ?? '/api').replace(/\/$/, ''),
  siteUrl: (raw.VITE_SITE_URL ?? 'https://www.nrw-explorer.example').replace(/\/$/, ''),
} as const;

export const hasGoogleMaps = env.googleMapsApiKey.length > 0;
