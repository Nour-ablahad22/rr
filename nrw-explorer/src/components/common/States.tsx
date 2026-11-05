import type { ReactNode } from 'react';
import { AlertTriangle, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest/20 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/5 text-forest">{icon ?? <SearchX className="h-6 w-6" />}</div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {text && <p className="mt-2 max-w-md text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-3xl border border-destructive/20 bg-white px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
      <h3 className="font-display text-xl">Daten konnten nicht geladen werden</h3>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{message ?? 'Bitte versuche es in einem Moment erneut.'}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Inhalte werden geladen">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
      <span className="sr-only">Seite wird geladen …</span>
    </div>
  );
}
