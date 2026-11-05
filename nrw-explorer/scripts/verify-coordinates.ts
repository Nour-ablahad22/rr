/**
 * Gleicht die hinterlegten Koordinaten mit den Koordinaten der Wikipedia-Artikel ab
 * und meldet Abweichungen > 300 m. Benötigt Internetzugang.
 *   npm run verify:coords
 */
import { attractions } from '../shared/data/index';
import { distanceKm } from '../shared/query';

const LIMIT_KM = 0.3;
(async () => {
  const issues: string[] = [];
  for (const a of attractions) {
    const res = await fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(a.wikiTitle.replace(/ /g, '_'))}`, {
      headers: { 'User-Agent': 'NRW-Explorer-Datenpruefung/1.0' },
    });
    if (!res.ok) {
      issues.push(`${a.id}: Artikel „${a.wikiTitle}“ nicht gefunden (${res.status})`);
      continue;
    }
    const data = (await res.json()) as { coordinates?: { lat: number; lon: number } };
    if (!data.coordinates) {
      issues.push(`${a.id}: Artikel ohne Koordinaten – manuell prüfen`);
      continue;
    }
    const d = distanceKm(a.coordinates, { lat: data.coordinates.lat, lng: data.coordinates.lon });
    if (d > LIMIT_KM) issues.push(`${a.id}: ${(d * 1000).toFixed(0)} m Abweichung → Wikipedia ${data.coordinates.lat}, ${data.coordinates.lon}`);
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(issues.length ? issues.join('\n') : 'Alle Koordinaten innerhalb der Toleranz.');
})();
