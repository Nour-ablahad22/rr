import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  const btn = 'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm transition';
  return (
    <nav aria-label="Seitennavigation" className="mt-12 flex items-center justify-center gap-1.5">
      <button className={cn(btn, 'border border-forest/15 bg-white hover:border-forest disabled:opacity-40')} disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Vorherige Seite">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1]! > 1 && <span className="px-1 text-ink-muted">…</span>}
          <button
            className={cn(btn, p === page ? 'bg-forest text-white' : 'border border-forest/15 bg-white hover:border-forest')}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Seite ${p}`}
          >
            {p}
          </button>
        </span>
      ))}
      <button className={cn(btn, 'border border-forest/15 bg-white hover:border-forest disabled:opacity-40')} disabled={page === totalPages} onClick={() => onPage(page + 1)} aria-label="Nächste Seite">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
