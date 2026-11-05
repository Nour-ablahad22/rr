import { SEO } from '@/components/common/SEO';
import { AttractionBrowser } from '@/components/attractions/AttractionBrowser';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';

export default function AttractionsPage() {
  return (
    <PageContainer>
      <SEO title="Sehenswürdigkeiten in NRW" description="Kathedralen, Burgen, Schlösser, Museen, Parks und Naturziele in Nordrhein-Westfalen – mit Geschichte, Bildern und Lageplan." />
      <PageHeader
        eyebrow="Sehenswürdigkeiten"
        title="Die Sehenswürdigkeiten Nordrhein-Westfalens"
        text="Von gotischen Kathedralen über barocke Schlösser bis zur Industriekultur des Ruhrgebiets – filtere nach Stadt, Kategorie oder Thema."
      />
      <AttractionBrowser />
    </PageContainer>
  );
}
