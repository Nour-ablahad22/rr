/**
 * Bilder aus Wikimedia Commons über die öffentliche Wikipedia-REST-API (CORS-fähig).
 * So werden nur frei lizenzierte Bilder verwendet, und Urheber/Lizenz lassen sich
 * zu jedem Bild abrufen und anzeigen. Ergebnisse werden durch TanStack Query zwischengespeichert.
 */
import type { ImageCredit, ResolvedImage } from '@shared/types';

const WIKI_REST = 'https://de.wikipedia.org/api/rest_v1';
/** Wikimedia liefert Vorschaubilder nur in Standardbreiten effizient aus */
const BUCKETS = [330, 500, 960, 1280, 1920] as const;

function bucket(width: number): number {
  return BUCKETS.find((b) => b >= width) ?? BUCKETS[BUCKETS.length - 1]!;
}

function thumbUrl(src: string, width: number, originalWidth?: number): string {
  if (originalWidth && width >= originalWidth) return src;
  if (/\/thumb\//.test(src)) return src.replace(/\/(\d+)px-([^/]+)$/, `/${width}px-$2`);
  // Original-URL → Thumbnail-URL konstruieren
  const m = src.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/);
  if (!m) return src;
  const [, base, hash, file] = m;
  const suffix = /\.(svg|tif|tiff)$/i.test(file!) ? '.png' : /\.pdf$/i.test(file!) ? '.jpg' : '';
  return `${base}/thumb/${hash}/${file}/${width}px-${file}${suffix}`;
}

function fileInfoFromUrl(src: string): { fileName: string; project: string } | null {
  const m = src.match(/upload\.wikimedia\.org\/wikipedia\/([^/]+)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/);
  if (!m) return null;
  return { project: m[1]!, fileName: decodeURIComponent(m[2]!) };
}

function filePageUrl(project: string, fileName: string): string {
  const host = project === 'commons' ? 'commons.wikimedia.org' : `${project}.wikipedia.org`;
  return `https://${host}/wiki/File:${encodeURIComponent(fileName.replace(/ /g, '_'))}`;
}

interface SummaryResponse {
  title: string;
  extract?: string;
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string; width: number; height: number };
  coordinates?: { lat: number; lon: number };
}

export async function fetchWikiImage(title: string, width: number, alt: string): Promise<ResolvedImage | null> {
  const res = await fetch(`${WIKI_REST}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as SummaryResponse;
  const original = data.originalimage ?? data.thumbnail;
  if (!original) return null;
  const w = bucket(width);
  const info = fileInfoFromUrl(original.source);
  return {
    src: thumbUrl(original.source, w, data.originalimage?.width),
    fullSrc: thumbUrl(original.source, 1920, data.originalimage?.width),
    width: original.width,
    height: original.height,
    alt,
    fileName: info?.fileName,
    sourceUrl: info ? filePageUrl(info.project, info.fileName) : `https://de.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

interface MediaListResponse {
  items: Array<{
    title: string;
    type: string;
    showInGallery?: boolean;
    caption?: { text: string };
    srcset?: Array<{ src: string; scale: string }>;
  }>;
}

/** Bildergalerie eines Wikipedia-Artikels (nur Fotos, keine Karten/Icons) */
export async function fetchWikiGallery(title: string, limit = 12): Promise<Array<ResolvedImage & { caption?: string }>> {
  const res = await fetch(`${WIKI_REST}/page/media-list/${encodeURIComponent(title.replace(/ /g, '_'))}`);
  if (!res.ok) return [];
  const data = (await res.json()) as MediaListResponse;
  const out: Array<ResolvedImage & { caption?: string }> = [];
  for (const item of data.items) {
    if (item.type !== 'image' || item.showInGallery === false) continue;
    if (/\.(svg|gif|png)$/i.test(item.title) && !/foto|photo/i.test(item.title)) continue;
    const src = item.srcset?.[0]?.src;
    if (!src) continue;
    const abs = src.startsWith('//') ? `https:${src}` : src;
    const info = fileInfoFromUrl(abs);
    out.push({
      src: thumbUrl(abs, 500),
      fullSrc: thumbUrl(abs, 1920),
      alt: item.caption?.text ?? item.title.replace(/^(Datei|File):/, '').replace(/\.[a-z]+$/i, ''),
      caption: item.caption?.text,
      fileName: info?.fileName,
      sourceUrl: info ? filePageUrl(info.project, info.fileName) : abs,
    });
    if (out.length >= limit) break;
  }
  return out;
}

const stripHtml = (html: string) => {
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]+>/g, '');
  return (new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '').trim();
};

/** Urheber und Lizenz eines Bildes von der Commons-Dateiseite */
export async function fetchImageCredit(fileName: string, sourceUrl: string): Promise<ImageCredit | null> {
  const isCommons = sourceUrl.includes('commons.wikimedia.org');
  const host = isCommons ? 'commons.wikimedia.org' : 'de.wikipedia.org';
  const url = `https://${host}/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&titles=${encodeURIComponent(`File:${fileName}`)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ extmetadata?: Record<string, { value: string }> }> }> };
  };
  const page = Object.values(data.query?.pages ?? {})[0];
  const meta = page?.imageinfo?.[0]?.extmetadata;
  if (!meta) return null;
  return {
    author: stripHtml(meta.Artist?.value ?? 'Unbekannt'),
    license: meta.LicenseShortName?.value ?? 'Siehe Dateiseite',
    licenseUrl: meta.LicenseUrl?.value,
    sourceUrl,
  };
}
