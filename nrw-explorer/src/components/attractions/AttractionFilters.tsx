import { Award, Search, X } from 'lucide-react';
import { ATTRACTION_CATEGORIES, type AttractionCategory, type City } from '@shared/types';
import { CATEGORY_LABELS } from '@shared/labels';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  q: string;
  onQ: (v: string) => void;
  cities: City[];
  cityId: string;
  onCity: (v: string) => void;
  categories: AttractionCategory[];
  onCategories: (v: AttractionCategory[]) => void;
  available?: AttractionCategory[];
  unesco?: boolean;
  onUnesco?: (v: boolean) => void;
}

export function AttractionFilters({ q, onQ, cities, cityId, onCity, categories, onCategories, available = [...ATTRACTION_CATEGORIES], unesco, onUnesco }: Props) {
  const toggle = (c: AttractionCategory) => onCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input value={q} onChange={(e) => onQ(e.target.value)} placeholder="Sehenswürdigkeit, Thema oder Epoche suchen …" className="pl-11" aria-label="Sehenswürdigkeiten durchsuchen" />
          {q && (
            <button onClick={() => onQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:text-forest" aria-label="Suche leeren">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="md:w-64">
          <Select value={cityId || 'alle'} onValueChange={(v) => onCity(v === 'alle' ? '' : v)}>
            <SelectTrigger aria-label="Stadt auswählen">
              <SelectValue placeholder="Stadt auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Städte</SelectItem>
              {[...cities]
                .sort((a, b) => a.name.localeCompare(b.name, 'de'))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {onUnesco && (
          <button
            onClick={() => onUnesco(!unesco)}
            aria-pressed={!!unesco}
            className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm transition', unesco ? 'border-sand bg-sand text-ink' : 'border-forest/15 bg-white hover:border-forest')}
          >
            <Award className="h-4 w-4" /> UNESCO-Welterbe
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Nach Kategorie filtern">
        <button
          onClick={() => onCategories([])}
          aria-pressed={!categories.length}
          className={cn('rounded-full border px-4 py-2 text-sm transition', !categories.length ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white hover:border-forest')}
        >
          Alle
        </button>
        {available.map((c) => {
          const Icon = CATEGORY_ICONS[c];
          const on = categories.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={cn('inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition', on ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-white hover:border-forest')}
            >
              <Icon className="h-3.5 w-3.5" /> {CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
