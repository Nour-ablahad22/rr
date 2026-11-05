import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { FavoritesProvider } from '@/hooks/useFavorites';
import { RouteError } from '@/pages/NotFoundPage';

// Routenbasiertes Code-Splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const CitiesPage = lazy(() => import('@/pages/CitiesPage'));
const CityDetailsPage = lazy(() => import('@/pages/CityDetailsPage'));
const AttractionsPage = lazy(() => import('@/pages/AttractionsPage'));
const AttractionDetailsPage = lazy(() => import('@/pages/AttractionDetailsPage'));
const HistoricalPlacesPage = lazy(() => import('@/pages/HistoricalPlacesPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/staedte', element: <CitiesPage /> },
      { path: '/staedte/:slug', element: <CityDetailsPage /> },
      { path: '/sehenswuerdigkeiten', element: <AttractionsPage /> },
      { path: '/sehenswuerdigkeiten/:slug', element: <AttractionDetailsPage /> },
      { path: '/historische-orte', element: <HistoricalPlacesPage /> },
      { path: '/karte', element: <MapPage /> },
      { path: '/galerie', element: <GalleryPage /> },
      { path: '/favoriten', element: <FavoritesPage /> },
      { path: '/ueber-nrw', element: <AboutPage /> },
      { path: '/suche', element: <SearchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
          </MotionConfig>
        </FavoritesProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
