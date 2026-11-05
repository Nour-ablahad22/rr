import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Landmark, Map as MapIcon, MapPin } from 'lucide-react';
import type { City } from '@shared/types';
import { CITY_TAG_LABELS } from '@shared/labels';
import { SmartImage } from '@/components/common/SmartImage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCoordinates } from '@/lib/utils';

export function CityCard({ city, attractionCount, className, priority }: { city: City; attractionCount?: number; className?: string; priority?: boolean }) {
  const navigate = useNavigate();
  const href = `/staedte/${city.slug}`;
  return (
    <article className={cn('group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift', className)}>
      <div className="relative aspect-[16/11] overflow-hidden">
        <SmartImage
          wikiTitle={city.wikiTitle}
          alt={`Stadtansicht von ${city.name}`}
          width={960}
          priority={priority}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/80">
            <MapPin className="h-3.5 w-3.5" /> {city.region}
          </p>
          <h3 className="font-display text-[28px] font-medium leading-tight">
            <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {city.name}
            </Link>
          </h3>
        </div>
        {attractionCount !== undefined && attractionCount > 0 && (
          <Badge variant="light" className="absolute left-3 top-3">
            <Landmark className="h-3 w-3" /> {attractionCount} {attractionCount === 1 ? 'Sehenswürdigkeit' : 'Sehenswürdigkeiten'}
          </Badge>
        )}
        <FavoriteButton id={`stadt:${city.id}`} name={city.name} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-medium text-ink">{city.tagline}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{city.history[0]?.text}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {city.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline">
              {CITY_TAG_LABELS[t]}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink-muted/80">{formatCoordinates(city.coordinates.lat, city.coordinates.lng)}</p>
        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" asChild>
            <Link to={href}>
              Stadt entdecken <ArrowRight />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-forest" onClick={() => navigate(`/karte?stadt=${city.slug}`)}>
            <MapIcon /> Auf der Karte anzeigen
          </Button>
        </div>
      </div>
    </article>
  );
}
