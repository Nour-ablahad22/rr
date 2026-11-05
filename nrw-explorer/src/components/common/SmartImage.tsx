import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { AttractionCategory } from '@shared/types';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useUtils';
import { useWikiImage } from '@/hooks/useWikiImage';
import { CATEGORY_ICONS } from './categoryIcons';

interface SmartImageProps {
  /** Titel des deutschsprachigen Wikipedia-Artikels, dessen Hauptbild (Wikimedia Commons) genutzt wird */
  wikiTitle: string;
  alt: string;
  width?: number;
  className?: string;
  imgClassName?: string;
  category?: AttractionCategory;
  priority?: boolean;
  /** Bildnachweis-Link einblenden */
  showCredit?: boolean;
  /** Bei fehlendem Bild nur Hintergrundfläche zeigen (für Hero-Hintergründe) */
  quietFallback?: boolean;
}

/**
 * Lädt das Artikelbild lazy, zeigt währenddessen einen Platzhalter und bei fehlendem
 * Bild einen gestalteten Ersatz (keine "kaputten" Bilder).
 */
export function SmartImage({ wikiTitle, alt, width = 960, className, imgClassName, category, priority, showCredit, quietFallback }: SmartImageProps) {
  const { ref, inView } = useInView<HTMLDivElement>('400px');
  const { data, isLoading, isError } = useWikiImage(wikiTitle, width, alt, priority || inView);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const Icon = category ? CATEGORY_ICONS[category] : ImageOff;
  const showFallback = isError || failed || (!isLoading && (priority || inView) && !data);

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-forest-50', className)}>
      {!loaded && !showFallback && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-forest-50 to-ivory-dark" aria-hidden />}
      {showFallback && !quietFallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-forest-50 text-forest/60" role="img" aria-label={alt}>
          <Icon className="h-10 w-10" strokeWidth={1.25} />
          <span className="px-4 text-center text-xs font-medium text-forest/70">{alt}</span>
        </div>
      )}
      {data && !failed && (
        <img
          src={data.src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority wird von React 18 noch nicht typisiert
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      )}
      {showCredit && data && loaded && (
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 rounded-full bg-ink/55 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur hover:bg-ink/75"
        >
          Foto: Wikimedia Commons · Lizenz & Urheber
        </a>
      )}
    </div>
  );
}
