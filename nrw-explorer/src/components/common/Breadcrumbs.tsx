import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ items, light }: { items: Array<{ label: string; to?: string }>; light?: boolean }) {
  return (
    <nav aria-label="Brotkrümelnavigation">
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-[13px]', light ? 'text-white/80' : 'text-ink-muted')}>
        <li>
          <Link to="/" className={cn('flex items-center gap-1 hover:underline', light ? 'hover:text-white' : 'hover:text-forest')}>
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Startseite</span>
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            {it.to ? (
              <Link to={it.to} className={cn('hover:underline', light ? 'hover:text-white' : 'hover:text-forest')}>
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className={cn('font-medium', light ? 'text-white' : 'text-ink')}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
