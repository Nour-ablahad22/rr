import { useQuery } from '@tanstack/react-query';
import { fetchImageCredit, fetchWikiGallery, fetchWikiImage } from '@/services/wikimedia';

const FOREVER = { staleTime: Infinity, gcTime: 1000 * 60 * 60, retry: 1 } as const;

export const useWikiImage = (title: string | undefined, width: number, alt: string, enabled = true) =>
  useQuery({
    queryKey: ['wiki-image', title, width],
    queryFn: () => fetchWikiImage(title!, width, alt),
    enabled: !!title && enabled,
    ...FOREVER,
  });

export const useWikiGallery = (title: string | undefined, limit = 12) =>
  useQuery({ queryKey: ['wiki-gallery', title, limit], queryFn: () => fetchWikiGallery(title!, limit), enabled: !!title, ...FOREVER });

export const useImageCredit = (fileName: string | undefined, sourceUrl: string | undefined) =>
  useQuery({
    queryKey: ['image-credit', fileName],
    queryFn: () => fetchImageCredit(fileName!, sourceUrl!),
    enabled: !!fileName && !!sourceUrl,
    ...FOREVER,
  });
