import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { ResolvedImage } from '@shared/types';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useImageCredit } from '@/hooks/useWikiImage';

export interface LightboxImage extends ResolvedImage {
  caption?: string;
  context?: string;
}

export function Lightbox({ images, index, onIndexChange, onClose }: { images: LightboxImage[]; index: number | null; onIndexChange: (i: number) => void; onClose: () => void }) {
  const open = index !== null && images.length > 0;
  const current = open ? images[index] : undefined;
  const { data: credit, isLoading } = useImageCredit(current?.fileName, current?.sourceUrl);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndexChange((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="inset-0 flex flex-col bg-ink/95 p-4 sm:p-8" overlayClassName="bg-ink/90">
        <DialogTitle className="sr-only">{current?.alt ?? 'Bild'}</DialogTitle>
        <DialogDescription className="sr-only">Großansicht. Mit den Pfeiltasten blättern, mit Escape schließen.</DialogDescription>
        <div className="flex items-center justify-between text-white/80">
          <span className="text-sm tabular-nums">
            {index !== null ? index + 1 : 0} / {images.length}
          </span>
          <DialogClose className="rounded-full p-2 hover:bg-white/10" aria-label="Großansicht schließen">
            <X className="h-6 w-6" />
          </DialogClose>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
          {current && <img src={current.fullSrc ?? current.src} alt={current.alt} className="max-h-full max-w-full rounded-lg object-contain" />}
          {images.length > 1 && (
            <>
              <button onClick={() => go(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-2" aria-label="Vorheriges Bild">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={() => go(1)} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-2" aria-label="Nächstes Bild">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
        {current && (
          <div className="mx-auto w-full max-w-3xl text-center text-sm text-white/85">
            {(current.caption || current.context) && <p className="font-medium text-white">{current.caption ?? current.context}</p>}
            <p className="mt-1 text-xs text-white/65">
              {isLoading ? 'Bildnachweis wird geladen …' : credit ? `Foto: ${credit.author} · Lizenz: ${credit.license}` : 'Bildnachweis siehe Dateiseite'}
              {' · '}
              <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
                Wikimedia Commons <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
