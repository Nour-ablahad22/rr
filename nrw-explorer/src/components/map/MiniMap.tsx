import { ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { directionsUrl, googleMapsSearchUrl } from '@/lib/utils';
import { InteractiveMap } from './InteractiveMap';
import type { MapPoint } from './types';

/** Lageplan einer einzelnen Sehenswürdigkeit inkl. Routenlink */
export function MiniMap({ point }: { point: MapPoint }) {
  return (
    <div>
      <InteractiveMap
        points={[point]}
        selectedId={point.id}
        compact
        cluster={false}
        initialCenter={point.coordinates}
        initialZoom={15}
        className="h-64 w-full rounded-2xl"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button asChild size="sm">
          <a href={directionsUrl(point.coordinates.lat, point.coordinates.lng)} target="_blank" rel="noopener noreferrer">
            <Navigation /> Route planen
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={googleMapsSearchUrl(point.coordinates.lat, point.coordinates.lng)} target="_blank" rel="noopener noreferrer">
            <ExternalLink /> In Google Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
