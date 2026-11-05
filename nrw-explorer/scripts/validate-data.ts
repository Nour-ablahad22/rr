/**
 * Prüft den Datensatz auf Konsistenz: eindeutige IDs, gültige Stadt-Referenzen,
 * Koordinaten innerhalb von NRW, Pflichtfelder und Quellen.
 * Ausführen: npm run lint:data
 */
import { attractions, cities, cityById } from '../shared/data/index';
import { ATTRACTION_CATEGORIES } from '../shared/types';

const NRW = { minLat: 50.3, maxLat: 52.6, minLng: 5.8, maxLng: 9.5 };
const errors: string[] = [];
const ids = new Set<string>();

for (const c of cities) {
  if (ids.has(c.id)) errors.push(`Doppelte ID: ${c.id}`);
  ids.add(c.id);
  for (const n of c.nearby) if (!cityById.has(n)) errors.push(`${c.id}: unbekannte Nachbarstadt ${n}`);
  if (!attractions.some((a) => a.cityId === c.id)) errors.push(`${c.id}: keine Sehenswürdigkeiten`);
  if (!c.sources.length) errors.push(`${c.id}: keine Quellen`);
}
const aIds = new Set<string>();
for (const a of attractions) {
  if (aIds.has(a.id)) errors.push(`Doppelte Sehenswürdigkeit: ${a.id}`);
  aIds.add(a.id);
  if (!cityById.has(a.cityId)) errors.push(`${a.id}: unbekannte Stadt ${a.cityId}`);
  if (!ATTRACTION_CATEGORIES.includes(a.category)) errors.push(`${a.id}: ungültige Kategorie`);
  const { lat, lng } = a.coordinates;
  if (lat < NRW.minLat || lat > NRW.maxLat || lng < NRW.minLng || lng > NRW.maxLng) errors.push(`${a.id}: Koordinaten außerhalb NRW`);
  const city = cityById.get(a.cityId);
  if (city) {
    const d = Math.hypot((lat - city.coordinates.lat) * 111, (lng - city.coordinates.lng) * 70);
    if (d > 20) errors.push(`${a.id}: ${d.toFixed(1)} km vom Stadtzentrum ${city.name} entfernt – bitte prüfen`);
  }
  if (!/^[a-z0-9-]+$/.test(a.slug)) errors.push(`${a.id}: ungültiger Slug`);
  for (const f of ['shortDescription', 'description', 'history', 'historicalBackground', 'architecture', 'culturalImportance'] as const)
    if (!a[f] || a[f].length < 20) errors.push(`${a.id}: Feld ${f} zu kurz`);
}
const approx = attractions.filter((a) => a.coordinatePrecision === 'approx').length;
console.log(`${cities.length} Städte, ${attractions.length} Sehenswürdigkeiten, ${approx} mit ungefähren Koordinaten.`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Datensatz OK.');
