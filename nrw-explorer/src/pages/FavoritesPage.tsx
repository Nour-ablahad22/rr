import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Map as MapIcon, Trash2 } from 'lucide-react';
import { AttractionCard, AttractionGrid } from '@/components/attractions/AttractionCard';
import { CityCard } from '@/components/cities/CityCard';
import { SEO } from '@/components/common/SEO';
import { CardGridSkeleton, EmptyState } from '@/components/common/States';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { useAttractions, useCities } from '@/hooks/useData';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const { ids, clear } = useFavorites();
  const { data: attractions = [], isLoading } = useAttractions();
  const { data: cities = [] } = useCities();
  const cityName = useMemo(() => new Map(cities.map((c) => [c.id, c.name])), [cities]);
  const favAttractions = attractions.filter((a) => ids.includes(a.id));
  const favCities = cities.filter((c) => ids.includes(`stadt:${c.id}`));
  const total = favAttractions.length + favCities.length;

  return (
    <PageContainer>
      <SEO title="Meine Favoriten" description="Deine gespeicherten Sehenswürdigkeiten und Reiseziele in Nordrhein-Westfalen." noIndex />
      <PageHeader eyebrow="Favoriten" title="Deine Merkliste" text="Gespeichert in deinem Browser – ganz ohne Registrierung." />
      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : total === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Du hast noch keine Favoriten gespeichert."
          text="Tippe auf das Herz-Symbol bei einer Sehenswürdigkeit oder Stadt, um sie hier zu sammeln."
          action={
            <Button size="lg" asChild>
              <Link to="/sehenswuerdigkeiten">Sehenswürdigkeiten entdecken</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {total} {total === 1 ? 'Eintrag' : 'Einträge'} gespeichert
            </p>
            <div className="flex gap-2">
              {favAttractions[0] && (
                <Button variant="outline" asChild>
                  <Link to={`/karte?ort=${favAttractions[0].slug}`}>
                    <MapIcon /> Auf der Karte
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm('Alle Favoriten entfernen?')) clear();
                }}
              >
                <Trash2 /> Alle entfernen
              </Button>
            </div>
          </div>
          {favAttractions.length > 0 && (
            <section aria-labelledby="fav-attr" className="mb-14">
              <h2 id="fav-attr" className="mb-5 font-display text-2xl">
                Sehenswürdigkeiten
              </h2>
              <AttractionGrid>
                {favAttractions.map((a) => (
                  <AttractionCard key={a.id} attraction={a} cityName={cityName.get(a.cityId)} />
                ))}
              </AttractionGrid>
            </section>
          )}
          {favCities.length > 0 && (
            <section aria-labelledby="fav-cities">
              <h2 id="fav-cities" className="mb-5 font-display text-2xl">
                Reiseziele
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favCities.map((c) => (
                  <CityCard key={c.id} city={c} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageContainer>
  );
}
