import { Link } from 'react-router-dom';
import { ArrowRight, Navigation, X } from 'lucide-react';
import { CATEGORY_LABELS } from '@shared/labels';
import { SmartImage } from '@/components/common/SmartImage';
import { directionsUrl } from '@/lib/utils';
import type { MapPoint } from './types';

export function MapInfoWindow({ point, onClose }: { point: MapPoint; onClose?: () => void }) {
  return (
    <div className="w-[280px] bg-white font-sans text-ink">
      <div className="relative">
        <SmartImage wikiTitle={point.wikiTitle} alt={point.name} width={500} category={point.category} className="h-32 w-full" priority />
        {onClose && (
          <button onClick={onClose} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink shadow hover:bg-white" aria-label="Info-Fenster schließen">
            <X className="h-4 w-4" />
          </button>
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-forest">{CATEGORY_LABELS[point.category]}</span>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{point.cityName}</p>
        <h3 className="mt-0.5 font-display text-lg font-medium leading-snug">{point.name}</h3>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-muted">{point.shortDescription}</p>
        <div className="mt-3 flex gap-2">
          <Link
            to={`/sehenswuerdigkeiten/${point.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-forest px-3 py-2 text-xs font-medium !text-white hover:bg-forest-800"
          >
            Details ansehen <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href={directionsUrl(point.coordinates.lat, point.coordinates.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-forest/25 px-3 py-2 text-xs font-medium !text-forest hover:border-forest"
          >
            <Navigation className="h-3.5 w-3.5" /> Route planen
          </a>
        </div>
      </div>
    </div>
  );
}
