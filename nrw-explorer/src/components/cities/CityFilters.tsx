import { Search, X } from 'lucide-react';
import { CITY_TAGS, type CityTag } from '@shared/types';
import { CITY_TAG_LABELS } from '@shared/labels';
import type { CitySort } from '@shared/query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const CITY_SORT_LABELS: Record<CitySort, string> = {
  beliebt: 'Beliebteste Reiseziele',
  alphabetisch: 'Alphabetisch',
  historisch: 'Historische Bedeutung',
  natur: 'Natur und Landschaft',
};

interface Props {
  q: string;
  onQ: (q: string) => void;
  tags: CityTag[];
  onTags: (t: CityTag[]) => void;
  sort: CitySort;
  onSort: (s: CitySort) => void;
}

export function CityFilters({ q, onQ, tags, onTags, sort, onSort }: Props) {
  const toggle = (t: CityTag) => onTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input value={q} onChange={(e) => onQ(e.target.value)} placeholder="Stadt oder Region suchen …" className="pl-11" aria-label="Städte durchsuchen" />
          {q && (
            <button onClick={() => onQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:text-forest" aria-label="Suche leeren">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="sm:w-64">
          <Select value={sort} onValueChange={(v) => onSort(v as CitySort)}>
            <SelectTrigger aria-label="Sortierung">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CITY_SORT_LABELS) as CitySort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {CITY_SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Nach Reisethema filtern">
        <button
          onClick={() => onTags([])}
          aria-pressed={tags.length === 0}
          className={cn('rounded-full border px-4 py-2 text-sm transition', tags.length === 0 ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white text-ink hover:border-forest')}
        >
          Alle
        </button>
        {CITY_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => toggle(t)}
            aria-pressed={tags.includes(t)}
            className={cn('rounded-full border px-4 py-2 text-sm transition', tags.includes(t) ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white text-ink hover:border-forest')}
          >
            {CITY_TAG_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
