import { BookOpen, ExternalLink } from 'lucide-react';
import type { SourceRef } from '@shared/types';

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <section aria-labelledby="quellen" className="rounded-3xl border border-forest/10 bg-white p-6">
      <h2 id="quellen" className="flex items-center gap-2 font-display text-xl">
        <BookOpen className="h-5 w-5 text-forest" /> Quellen und weiterführende Informationen
      </h2>
      <ul className="mt-4 space-y-2 text-sm">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-forest hover:underline">
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s.title}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Die Texte wurden redaktionell auf Grundlage der genannten Quellen verfasst. Daten wie Öffnungszeiten und Eintrittspreise ändern sich – bitte vor dem Besuch beim offiziellen Anbieter prüfen.
      </p>
    </section>
  );
}
