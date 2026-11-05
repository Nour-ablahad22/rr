import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Map as MapIcon, MapPin } from 'lucide-react';
import type { Attraction } from '@shared/types';
import { CATEGORY_LABELS } from '@shared/labels';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { SmartImage } from '@/components/common/SmartImage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  attraction: Attraction;
  cityName?: string;
  distanceKm?: number;
  className?: string;
  priority?: boolean;
}

export function AttractionCard({ attraction: a, cityName, distanceKm, className, priority }: Props) {
  const navigate = useNavigate();
  const Icon = CATEGORY_ICONS[a.category];
  const href = `/sehenswuerdigkeiten/${a.slug}`;
  return (
    <motion.article
      layout="position"
      className={cn('group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift', className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          wikiTitle={a.wikiTitle}
          alt={`${a.name} in ${cityName ?? ''}`.trim()}
          width={500}
          category={a.category}
          priority={priority}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="light">
            <Icon className="h-3 w-3" /> {CATEGORY_LABELS[a.category]}
          </Badge>
          {a.unesco && (
            <Badge variant="sand" className="bg-sand text-ink">
              <Award className="h-3 w-3" /> UNESCO
            </Badge>
          )}
        </div>
        <FavoriteButton id={a.id} name={a.name} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <MapPin className="h-3.5 w-3.5 text-sand-dark" aria-hidden />
          {cityName}
          {distanceKm !== undefined && <span className="text-ink-muted/80">· {distanceKm.toFixed(1).replace('.', ',')} km entfernt</span>}
        </p>
        <h3 className="font-display text-xl font-medium leading-snug text-ink">
          <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {a.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{a.shortDescription}</p>
        <div className="relative z-10 mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Button size="sm" asChild className="group/btn">
            <Link to={href}>
              Mehr erfahren <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/karte?ort=${a.slug}`)} className="text-forest group-hover:bg-forest/5">
            <MapIcon /> Auf Karte anzeigen
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function AttractionGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4', className)}>{children}</div>;
}
