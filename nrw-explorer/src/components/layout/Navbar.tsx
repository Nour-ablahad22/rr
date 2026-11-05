import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Heart, Menu, Search } from 'lucide-react';
import { ATTRACTION_CATEGORIES } from '@shared/types';
import { CATEGORY_LABELS } from '@shared/labels';
import { CATEGORY_ICONS } from '@/components/common/categoryIcons';
import { GlobalSearchDialog } from '@/components/search/GlobalSearch';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useCities } from '@/hooks/useData';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

export const NAV_ITEMS = [
  { to: '/', label: 'Startseite', end: true },
  { to: '/staedte', label: 'Städte entdecken', menu: 'cities' as const },
  { to: '/sehenswuerdigkeiten', label: 'Sehenswürdigkeiten', menu: 'categories' as const },
  { to: '/historische-orte', label: 'Historische Orte' },
  { to: '/karte', label: 'Interaktive Karte' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/favoriten', label: 'Favoriten' },
  { to: '/ueber-nrw', label: 'Über NRW' },
];

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="NRW Explorer – zur Startseite">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition', light ? 'bg-white/15 ring-1 ring-white/30' : 'bg-forest')}>
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M5 24 L12 10 L17 18 L20 14 L27 24 Z" fill="#D7B46A" />
          <circle cx="22" cy="8" r="2.6" fill="#F7F5EF" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cn('block font-display text-[19px] font-semibold tracking-tight', light ? 'text-white' : 'text-forest')}>NRW Explorer</span>
        <span className={cn('block text-[10px] font-medium uppercase tracking-[0.2em]', light ? 'text-white/70' : 'text-ink-muted')}>Nordrhein-Westfalen</span>
      </span>
    </Link>
  );
}

function Dropdown({ kind, onNavigate }: { kind: 'cities' | 'categories'; onNavigate: () => void }) {
  const { data: cities = [] } = useCities({ sort: 'beliebt' });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn('absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 rounded-3xl border bg-white p-3 text-ink shadow-lift', kind === 'cities' ? 'w-[520px]' : 'w-[440px]')}
      role="menu"
    >
      {kind === 'cities' ? (
        <>
          <div className="grid grid-cols-2 gap-1">
            {cities.slice(0, 10).map((c) => (
              <Link key={c.id} to={`/staedte/${c.slug}`} onClick={onNavigate} role="menuitem" className="rounded-2xl px-3 py-2.5 transition hover:bg-forest/5">
                <span className="block text-sm font-medium">{c.name}</span>
                <span className="block truncate text-xs text-ink-muted">{c.tagline}</span>
              </Link>
            ))}
          </div>
          <Link to="/staedte" onClick={onNavigate} role="menuitem" className="mt-2 block rounded-2xl bg-forest/5 px-3 py-2.5 text-sm font-medium text-forest hover:bg-forest/10">
            Alle 20 Reiseziele ansehen →
          </Link>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {ATTRACTION_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Link key={cat} to={`/sehenswuerdigkeiten?kategorie=${cat}`} onClick={onNavigate} role="menuitem" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition hover:bg-forest/5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/5 text-forest">
                  <Icon className="h-4 w-4" />
                </span>
                {CATEGORY_LABELS[cat]}
              </Link>
            );
          })}
          <Link to="/sehenswuerdigkeiten" onClick={onNavigate} role="menuitem" className="col-span-2 mt-1 rounded-2xl bg-forest/5 px-3 py-2.5 text-sm font-medium text-forest hover:bg-forest/10">
            Alle Sehenswürdigkeiten ansehen →
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'cities' | 'categories' | null>(null);
  const { ids } = useFavorites();
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const transparent = pathname === '/' && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[1000] transition-all duration-300',
          transparent ? 'bg-gradient-to-b from-ink/50 to-transparent' : 'border-b border-forest/10 bg-ivory/90 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl',
        )}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-forest">
          Zum Inhalt springen
        </a>
        <div ref={navRef} className="container flex h-[72px] items-center justify-between gap-4">
          <Logo light={transparent} />

          <nav aria-label="Hauptnavigation" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.to}
                  className="relative"
                  onMouseEnter={() => {
                    if (!item.menu) return;
                    clearTimeout(closeTimer.current);
                    setOpenMenu(item.menu);
                  }}
                  onMouseLeave={() => {
                    if (!item.menu) return;
                    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
                  }}
                >
                  <div className="flex items-center">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'relative rounded-full px-3 py-2 text-[13.5px] font-medium transition',
                          transparent ? 'text-white/90 hover:text-white' : 'text-ink/80 hover:text-forest',
                          isActive && (transparent ? 'text-white' : 'text-forest'),
                          isActive &&
                            "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-sand after:content-['']",
                          item.menu && 'pr-1',
                        )
                      }
                    >
                      {item.label}
                      {item.to === '/favoriten' && ids.length > 0 && (
                        <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sand px-1 text-[10px] font-bold text-ink">{ids.length}</span>
                      )}
                    </NavLink>
                    {item.menu && (
                      <button
                        type="button"
                        aria-label={`Untermenü ${item.label}`}
                        aria-expanded={openMenu === item.menu}
                        aria-haspopup="menu"
                        onClick={() => setOpenMenu((m) => (m === item.menu ? null : item.menu!))}
                        className={cn('rounded-full p-1', transparent ? 'text-white/80' : 'text-ink/60')}
                      >
                        <ChevronDown className={cn('h-3.5 w-3.5 transition', openMenu === item.menu && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>{item.menu && openMenu === item.menu && <Dropdown kind={item.menu} onNavigate={() => setOpenMenu(null)} />}</AnimatePresence>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-full px-3 text-sm transition',
                transparent ? 'text-white hover:bg-white/10' : 'text-ink/80 hover:bg-forest/5 hover:text-forest',
              )}
              aria-label="Suche öffnen (Strg+K)"
            >
              <Search className="h-[18px] w-[18px]" />
              <span className="hidden 2xl:inline">Suchen</span>
            </button>
            <span
              className={cn('hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex', transparent ? 'text-white/90 ring-1 ring-white/30' : 'text-forest ring-1 ring-forest/15')}
              title="Sprache: Deutsch"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden /> DE <span className="sr-only">Sprache: Deutsch</span>
            </span>
            <Link to="/favoriten" className={cn('relative rounded-full p-2.5 xl:hidden', transparent ? 'text-white' : 'text-ink/80')} aria-label={`Favoriten (${ids.length})`}>
              <Heart className="h-[18px] w-[18px]" />
              {ids.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sand" />}
            </Link>
            <button
              className={cn('rounded-full p-2.5 xl:hidden', transparent ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-forest/5')}
              onClick={() => setMobileOpen(true)}
              aria-label="Menü öffnen"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="overflow-y-auto p-6">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Hauptmenü von NRW Explorer</SheetDescription>
          <Logo />
          <button
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
            className="mt-8 flex w-full items-center gap-3 rounded-full border border-forest/15 bg-white px-4 py-3 text-sm text-ink-muted"
          >
            <Search className="h-4 w-4" /> Stadt oder Sehenswürdigkeit suchen …
          </button>
          <nav aria-label="Mobile Navigation" className="mt-6">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn('flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition', isActive ? 'bg-forest text-white' : 'text-ink hover:bg-forest/5')
                    }
                  >
                    {item.label}
                    {item.to === '/favoriten' && ids.length > 0 && <span className="rounded-full bg-sand px-2 text-xs font-bold text-ink">{ids.length}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-8 flex items-center gap-2 text-xs text-ink-muted">
            <Globe className="h-3.5 w-3.5" /> Sprache: Deutsch
          </p>
        </SheetContent>
      </Sheet>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
