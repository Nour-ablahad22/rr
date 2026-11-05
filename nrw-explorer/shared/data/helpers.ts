import type { Attraction, SourceRef } from '../types';
import { wikipediaUrl } from '../labels';

export const wp = (title: string): SourceRef => ({ title: `Wikipedia: ${title}`, url: wikipediaUrl(title) });
export const unesco = (id: number, title: string): SourceRef => ({
  title: `UNESCO-Welterbezentrum: ${title}`,
  url: `https://whc.unesco.org/en/list/${id}`,
});
export const official = (title: string, url: string): SourceRef => ({ title, url });

type AttractionInput = Omit<Attraction, 'id' | 'sources' | 'coordinatePrecision'> & {
  sources?: SourceRef[];
  coordinatePrecision?: Attraction['coordinatePrecision'];
};

/** Ergänzt ID, Standard-Präzision und die Wikipedia-Quelle. */
export function defineAttraction(input: AttractionInput): Attraction {
  const sources: SourceRef[] = [wp(input.wikiTitle), ...(input.sources ?? [])];
  if (input.officialWebsite && !sources.some((s) => s.url === input.officialWebsite)) {
    sources.push(official('Offizielle Website', input.officialWebsite));
  }
  return {
    ...input,
    id: input.slug,
    coordinatePrecision: input.coordinatePrecision ?? 'exact',
    sources,
  };
}
