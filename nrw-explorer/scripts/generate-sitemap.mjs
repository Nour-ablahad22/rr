// Erzeugt dist/sitemap.xml aus dem Datensatz (läuft nach "vite build").
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = (process.env.VITE_SITE_URL ?? 'https://www.nrw-explorer.example').replace(/\/$/, '');
const slugs = (file) => [...readFileSync(join(root, 'shared/data', file), 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);
const cities = slugs('cities.ts');
const attractions = ['attractions-rheinland.ts', 'attractions-west.ts', 'attractions-ruhr.ts', 'attractions-westfalen.ts'].flatMap(slugs);
const paths = ['/', '/staedte', '/sehenswuerdigkeiten', '/historische-orte', '/karte', '/galerie', '/ueber-nrw', ...cities.map((s) => `/staedte/${s}`), ...attractions.map((s) => `/sehenswuerdigkeiten/${s}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n')}\n</urlset>\n`;
const out = join(root, 'dist');
if (existsSync(out)) {
  writeFileSync(join(out, 'sitemap.xml'), xml);
  console.log(`sitemap.xml mit ${paths.length} URLs erzeugt.`);
}
