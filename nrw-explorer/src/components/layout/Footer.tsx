import { Link } from 'react-router-dom';
import { ExternalLink, Mail } from 'lucide-react';
import { Logo } from './Navbar';

const columns = [
  {
    title: 'Entdecken',
    links: [
      { to: '/staedte', label: 'Städte entdecken' },
      { to: '/sehenswuerdigkeiten', label: 'Sehenswürdigkeiten' },
      { to: '/historische-orte', label: 'Historische Orte' },
      { to: '/karte', label: 'Interaktive Karte' },
      { to: '/galerie', label: 'Galerie' },
    ],
  },
  {
    title: 'Beliebte Ziele',
    links: [
      { to: '/sehenswuerdigkeiten/koelner-dom', label: 'Kölner Dom' },
      { to: '/sehenswuerdigkeiten/aachener-dom', label: 'Aachener Dom' },
      { to: '/sehenswuerdigkeiten/zeche-zollverein', label: 'Zeche Zollverein' },
      { to: '/staedte/monschau', label: 'Monschau' },
      { to: '/sehenswuerdigkeiten/hermannsdenkmal', label: 'Hermannsdenkmal' },
    ],
  },
  {
    title: 'Informationen',
    links: [
      { to: '/ueber-nrw', label: 'Über NRW' },
      { to: '/favoriten', label: 'Meine Favoriten' },
      { to: '/ueber-nrw#quellen', label: 'Quellen & Bildnachweise' },
      { to: '/ueber-nrw#datenschutz', label: 'Datenschutz' },
      { to: '/ueber-nrw#impressum', label: 'Impressum' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-forest-900 text-white/80">
      <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Nordrhein-Westfalen entdecken – Geschichte, Kultur und Natur erleben. Ein Reiseportal für Städte, Burgen, Museen und Landschaften zwischen Rhein, Ruhr und Weser.
          </p>
          <a href="mailto:kontakt@nrw-explorer.example" className="mt-6 inline-flex items-center gap-2 text-sm text-sand hover:text-white">
            <Mail className="h-4 w-4" /> kontakt@nrw-explorer.example
          </a>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sand">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NRW Explorer · Alle Angaben ohne Gewähr – bitte Öffnungszeiten bei den offiziellen Anbietern prüfen.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Fotos: Wikimedia Commons (freie Lizenzen, Urheber auf den Dateiseiten)</span>
            <a href="https://www.nrw-tourismus.de/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
              Tourismus NRW <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
