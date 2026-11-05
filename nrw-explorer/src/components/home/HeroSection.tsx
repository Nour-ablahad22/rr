import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, Building, Map as MapIcon } from 'lucide-react';
import { SmartImage } from '@/components/common/SmartImage';
import { SearchCombobox } from '@/components/search/GlobalSearch';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-900 pb-16 pt-32 sm:items-center sm:pb-24">
      <SmartImage
        wikiTitle="Kölner Dom"
        alt="Der Kölner Dom am Rhein – Wahrzeichen Nordrhein-Westfalens"
        width={1920}
        priority
        className="absolute inset-0 -z-10 h-full w-full bg-forest-900"
        imgClassName="scale-105 object-cover object-center"
        showCredit
        quietFallback
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/35" aria-hidden />

      <div className="container">
        <div className="max-w-3xl text-white">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-sand">
            Nordrhein-Westfalen entdecken – Geschichte, Kultur und Natur erleben.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[42px] font-medium leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Entdecke die schönsten Orte in <em className="font-normal italic text-sand-light">Nordrhein-Westfalen</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Von historischen Städten und beeindruckenden Burgen bis zu faszinierenden Landschaften – entdecke die Vielfalt von NRW.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-8 max-w-2xl">
            <SearchCombobox variant="hero" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" variant="accent" asChild>
              <a href="#entdecken">
                Entdecken <ArrowDown />
              </a>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link to="/staedte">
                <Building /> Städte erkunden
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link to="/karte">
                <MapIcon /> Karte öffnen
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
