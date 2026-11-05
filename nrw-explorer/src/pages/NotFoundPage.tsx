import { Link, useRouteError } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export function NotFoundContent({ title = 'Seite nicht gefunden', text = 'Diese Seite gibt es leider nicht – vielleicht wurde sie verschoben.' }: { title?: string; text?: string }) {
  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <SEO title={title} description={text} noIndex />
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest/5 text-forest">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-ink-muted">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Zur Startseite</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/sehenswuerdigkeiten">Sehenswürdigkeiten entdecken</Link>
        </Button>
      </div>
    </PageContainer>
  );
}

export function RouteError() {
  const error = useRouteError() as Error | undefined;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-3xl">Etwas ist schiefgelaufen</h1>
      <p className="mt-3 max-w-md text-ink-muted">{error?.message ?? 'Unbekannter Fehler'}</p>
      <a href="/" className="mt-6 rounded-full bg-forest px-5 py-3 text-sm font-medium text-white">
        Zur Startseite
      </a>
    </div>
  );
}

export default function NotFoundPage() {
  return <NotFoundContent />;
}
