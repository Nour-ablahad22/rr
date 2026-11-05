import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, MapPin, Search, X } from 'lucide-react';
import type { SearchResult } from '@shared/types';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { SmartImage } from '@/components/common/SmartImage';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/sheet';
import { useSearch } from '@/hooks/useData';
import { useDebounce } from '@/hooks/useUtils';
import { cn } from '@/lib/utils';

export const resultPath = (r: SearchResult) => (r.type === 'city' ? `/staedte/${r.slug}` : `/sehenswuerdigkeiten/${r.slug}`);

const SUGGESTIONS = ['Kölner Dom', 'Zeche Zollverein', 'Schloss', 'Monschau', 'Museum', 'Hermannsdenkmal'];

/**
 * Suchfeld mit Vorschlägen und Tastatursteuerung (↑ ↓ Enter Esc) – als Combobox nach WAI-ARIA.
 */
export function SearchCombobox({ autoFocus, onNavigate, variant = 'overlay', initialQuery = '' }: { autoFocus?: boolean; onNavigate?: () => void; variant?: 'overlay' | 'hero'; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(variant === 'overlay');
  const debounced = useDebounce(query, 150);
  const { data = [], isFetching } = useSearch(debounced);
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = debounced.trim().length >= 2 ? data : [];
  // Die Gruppe mit dem relevantesten Treffer steht oben (Enter öffnet den besten Treffer)
  const grouped = useMemo(() => {
    const groups = [
      { label: 'Städte', items: results.filter((r) => r.type === 'city') },
      { label: 'Sehenswürdigkeiten', items: results.filter((r) => r.type === 'attraction') },
    ];
    return groups.sort((a, b) => (b.items[0]?.score ?? 0) - (a.items[0]?.score ?? 0));
  }, [results]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => setActive(0), [debounced]);

  const go = (r: SearchResult) => {
    navigate(resultPath(r));
    setOpen(false);
    onNavigate?.();
  };
  const submitAll = () => {
    if (query.trim().length < 2) return;
    navigate(`/suche?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    onNavigate?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = flat[active];
      if (r && open) go(r);
      else submitAll();
    } else if (e.key === 'Escape' && variant === 'hero') {
      setOpen(false);
    }
  };

  const showPanel = open && (variant === 'overlay' || query.trim().length >= 2);
  let idx = -1;

  return (
    <div className="relative w-full">
      <div className={cn('relative flex items-center', variant === 'hero' ? 'rounded-full bg-white p-1.5 shadow-lift' : 'border-b border-border pb-1')}>
        <Search className={cn('pointer-events-none absolute h-5 w-5 text-ink-muted', variant === 'hero' ? 'left-5' : 'left-1')} aria-hidden />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => variant === 'hero' && setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat[active] ? `${listId}-${active}` : undefined}
          aria-label="Suche nach Stadt, Sehenswürdigkeit oder Region"
          placeholder="Wonach suchst du? Stadt, Sehenswürdigkeit oder Region …"
          className={cn(
            'w-full bg-transparent text-ink placeholder:text-ink-muted/80 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            variant === 'hero' ? 'h-12 pl-12 pr-28 text-[15px]' : 'h-14 pl-9 pr-10 text-lg',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className={cn('absolute rounded-full p-1.5 text-ink-muted hover:bg-forest/5 hover:text-forest', variant === 'hero' ? 'right-[6.5rem]' : 'right-1')}
            aria-label="Suche leeren"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {variant === 'hero' && (
          <button type="button" onClick={submitAll} className="absolute right-1.5 h-12 rounded-full bg-forest px-5 text-sm font-medium text-white transition hover:bg-forest-800">
            Suchen
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suchergebnisse"
          className={cn(
            'z-50 overflow-y-auto',
            variant === 'hero' ? 'absolute left-0 right-0 top-full mt-2 max-h-[60vh] rounded-3xl bg-white p-2 text-left shadow-lift' : 'mt-4 max-h-[60vh]',
          )}
        >
          {query.trim().length < 2 ? (
            <div className="p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Beliebte Suchen</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-sm text-forest transition hover:border-forest hover:bg-forest hover:text-white">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : isFetching && !results.length ? (
            <div className="flex items-center gap-2 p-4 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Suche läuft …
            </div>
          ) : !results.length ? (
            <div className="p-6 text-center">
              <p className="font-medium text-ink">Keine Treffer für „{query}“</p>
              <p className="mt-1 text-sm text-ink-muted">Versuche einen anderen Begriff, z. B. eine Stadt oder „Burg“.</p>
            </div>
          ) : (
            <>
              {grouped.map(
                (g) =>
                  g.items.length > 0 && (
                    <div key={g.label} className="mb-2" role="group" aria-label={g.label}>
                      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{g.label}</p>
                      {g.items.map((r) => {
                        idx += 1;
                        const i = idx;
                        const Icon = r.category ? CATEGORY_ICONS[r.category] : MapPin;
                        return (
                          <div
                            key={`${r.type}-${r.id}`}
                            id={`${listId}-${i}`}
                            role="option"
                            aria-selected={i === active}
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => go(r)}
                            className={cn('flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition', i === active ? 'bg-forest/5' : 'hover:bg-forest/5')}
                          >
                            <SmartImage wikiTitle={r.wikiTitle} alt={r.name} width={330} className="h-12 w-16 shrink-0 rounded-xl" category={r.category} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-ink">{r.name}</p>
                              <p className="flex items-center gap-1 truncate text-xs text-ink-muted">
                                <Icon className="h-3 w-3" /> {r.subtitle}
                              </p>
                            </div>
                            <ArrowRight className={cn('h-4 w-4 text-forest transition', i === active ? 'opacity-100' : 'opacity-0')} />
                          </div>
                        );
                      })}
                    </div>
                  ),
              )}
              <button onMouseDown={(e) => e.preventDefault()} onClick={submitAll} className="w-full rounded-2xl p-3 text-left text-sm font-medium text-forest hover:bg-forest/5">
                Alle Ergebnisse für „{query}“ anzeigen →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function GlobalSearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-x-0 top-0 mx-auto w-full max-w-2xl px-4 pt-4 sm:pt-20">
        <div className="relative rounded-3xl bg-ivory p-5 shadow-lift sm:p-7">
          <DialogTitle className="font-display text-2xl">Suche</DialogTitle>
          <DialogDescription className="mb-2 text-sm text-ink-muted">Städte, Sehenswürdigkeiten, Burgen, Museen und Naturziele in NRW.</DialogDescription>
          <SearchCombobox autoFocus onNavigate={() => onOpenChange(false)} />
          <p className="mt-4 hidden text-xs text-ink-muted sm:block">
            <kbd className="rounded border bg-white px-1.5">↑</kbd> <kbd className="rounded border bg-white px-1.5">↓</kbd> navigieren ·{' '}
            <kbd className="rounded border bg-white px-1.5">Enter</kbd> öffnen · <kbd className="rounded border bg-white px-1.5">Esc</kbd> schließen
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
