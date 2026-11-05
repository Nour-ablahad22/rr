import { useState } from 'react';
import { Expand, ImageOff } from 'lucide-react';
import { Lightbox, type LightboxImage } from '@/components/common/Lightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useWikiGallery } from '@/hooks/useWikiImage';
import { cn } from '@/lib/utils';

/** Bildergalerie aus dem Wikipedia-Artikel (Wikimedia Commons) mit Lightbox */
export function AttractionGallery({ wikiTitle, name, limit = 9, className }: { wikiTitle: string; name: string; limit?: number; className?: string }) {
  const { data = [], isLoading } = useWikiGallery(wikiTitle, limit);
  const [index, setIndex] = useState<number | null>(null);
  const images: LightboxImage[] = data.map((d) => ({ ...d, context: d.caption ?? name }));

  if (isLoading)
    return (
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3]" />
        ))}
      </div>
    );

  if (!images.length)
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl border border-dashed border-forest/20 bg-white/60 p-6 text-sm text-ink-muted', className)}>
        <ImageOff className="h-5 w-5 shrink-0 text-forest/50" />
        Für diesen Ort sind derzeit keine weiteren frei lizenzierten Bilder verfügbar.
      </div>
    );

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setIndex(i)}
            className={cn('group relative overflow-hidden rounded-2xl bg-forest-50', i === 0 && images.length > 4 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto' : 'aspect-[4/3]')}
            aria-label={`Bild vergrößern: ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/25 group-hover:opacity-100">
              <Expand className="h-6 w-6 text-white" />
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted">Bilder: Wikimedia Commons – Urheber und Lizenz in der Großansicht.</p>
      <Lightbox images={images} index={index} onIndexChange={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
