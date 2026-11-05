import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Standard-Seitenrahmen mit Abstand unter der fixierten Navigation */
export function PageContainer({ children, className, padTop = true }: { children: ReactNode; className?: string; padTop?: boolean }) {
  return <div className={cn('container', padTop && 'pt-28 sm:pt-32', className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, text, children }: { eyebrow?: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <header className="mb-10 max-w-3xl">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="font-display text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">{title}</h1>
      {text && <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{text}</p>}
      {children}
    </header>
  );
}
