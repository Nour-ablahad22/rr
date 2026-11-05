import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, CheckCircle2, ExternalLink, Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/common/Section';
import { SEO } from '@/components/common/SEO';
import { SmartImage } from '@/components/common/SmartImage';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/config/env';
import { apiFetch } from '@/services/apiClient';

const FACTS = [
  { value: 'rund 18 Mio.', label: 'Einwohner – bevölkerungsreichstes Bundesland' },
  { value: 'ca. 34.100 km²', label: 'Fläche' },
  { value: '1946', label: 'Gründung durch die britische Militärregierung' },
  { value: 'Düsseldorf', label: 'Landeshauptstadt' },
];

const REGIONS = [
  { name: 'Rheinland', text: 'Rheinmetropolen wie Köln, Düsseldorf und Bonn, das Siebengebirge und die Kaiserstadt Aachen.', wiki: 'Rheinland', to: '/staedte?filter=kultur' },
  { name: 'Ruhrgebiet', text: 'Größter Ballungsraum Deutschlands – geprägt von Industriekultur, Strukturwandel und Fußball.', wiki: 'Ruhrgebiet', to: '/staedte/essen' },
  { name: 'Westfalen & Münsterland', text: 'Wasserschlösser, Hansestädte und die Friedensstadt Münster.', wiki: 'Münsterland', to: '/staedte/muenster' },
  { name: 'Ostwestfalen-Lippe', text: 'Teutoburger Wald, Hermannsdenkmal und die Kaiserpfalz Paderborn.', wiki: 'Teutoburger Wald', to: '/staedte/detmold' },
  { name: 'Sauerland & Siegerland', text: 'Mittelgebirge mit Wintersport, Talsperren und dem Rothaarsteig.', wiki: 'Sauerland', to: '/staedte/winterberg' },
  { name: 'Eifel', text: 'Nationalpark Eifel, Rursee und Fachwerkstädte wie Monschau.', wiki: 'Nordeifel', to: '/staedte/monschau' },
];

const WORLD_HERITAGE = [
  { name: 'Aachener Dom', year: 1978, to: '/sehenswuerdigkeiten/aachener-dom' },
  { name: 'Schlösser Augustusburg und Falkenlust in Brühl', year: 1984, to: '/sehenswuerdigkeiten/schloss-augustusburg' },
  { name: 'Kölner Dom', year: 1996, to: '/sehenswuerdigkeiten/koelner-dom' },
  { name: 'Zeche Zollverein in Essen', year: 2001, to: '/sehenswuerdigkeiten/zeche-zollverein' },
  { name: 'Karolingisches Westwerk und Civitas Corvey (Höxter)', year: 2014 },
  { name: 'Niedergermanischer Limes (u. a. Xanten)', year: 2021, to: '/sehenswuerdigkeiten/lvr-archaeologischer-park-xanten' },
];

const schema = z.object({
  name: z.string().trim().min(2, 'Bitte gib deinen Namen an.').max(80),
  email: z.string().trim().email('Bitte gib eine gültige E-Mail-Adresse an.'),
  topic: z.enum(['korrektur', 'vorschlag', 'sonstiges'], { errorMap: () => ({ message: 'Bitte wähle ein Thema.' }) }),
  message: z.string().trim().min(10, 'Die Nachricht sollte mindestens 10 Zeichen haben.').max(2000, 'Maximal 2000 Zeichen.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Bitte stimme der Verarbeitung deiner Angaben zu.' }) }),
});
type FormValues = z.infer<typeof schema>;

function FeedbackForm() {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { topic: 'korrektur' } });

  const onSubmit = async (values: FormValues) => {
    if (env.dataSource === 'api') {
      try {
        await apiFetch('/feedback', { method: 'POST', body: JSON.stringify(values) });
        setStatus('sent');
        reset();
      } catch {
        setStatus('error');
      }
      return;
    }
    // Ohne Backend: Nachricht im E-Mail-Programm vorbereiten (kein stilles Verwerfen)
    const body = `${values.message}\n\n– ${values.name} (${values.email})`;
    window.location.href = `mailto:kontakt@nrw-explorer.example?subject=${encodeURIComponent(`NRW Explorer: ${values.topic}`)}&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  };

  const field = 'mt-1.5 rounded-2xl';
  const err = (m?: string) => m && <p className="mt-1 text-xs text-destructive">{m}</p>;

  if (status === 'sent')
    return (
      <div role="status" className="flex items-start gap-3 rounded-3xl bg-forest/5 p-6 text-forest">
        <CheckCircle2 className="mt-0.5 h-5 w-5" />
        <div>
          <p className="font-medium">Vielen Dank für deinen Hinweis!</p>
          <p className="mt-1 text-sm text-ink-muted">
            {env.dataSource === 'api' ? 'Deine Nachricht wurde übermittelt.' : 'Dein E-Mail-Programm wurde mit der vorbereiteten Nachricht geöffnet.'}
          </p>
          <Button variant="link" className="mt-2" onClick={() => setStatus('idle')}>
            Weitere Nachricht senden
          </Button>
        </div>
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-2 sm:p-8">
      <div>
        <label htmlFor="fb-name" className="text-sm font-medium">
          Name
        </label>
        <Input id="fb-name" className={field} aria-invalid={!!errors.name} {...register('name')} autoComplete="name" />
        {err(errors.name?.message)}
      </div>
      <div>
        <label htmlFor="fb-email" className="text-sm font-medium">
          E-Mail
        </label>
        <Input id="fb-email" type="email" className={field} aria-invalid={!!errors.email} {...register('email')} autoComplete="email" />
        {err(errors.email?.message)}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="fb-topic" className="text-sm font-medium">
          Thema
        </label>
        <select id="fb-topic" {...register('topic')} className="mt-1.5 h-11 w-full rounded-2xl border border-input bg-white px-4 text-sm focus-visible:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20">
          <option value="korrektur">Korrektur einer Angabe</option>
          <option value="vorschlag">Vorschlag für einen neuen Ort</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        {err(errors.topic?.message)}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="fb-message" className="text-sm font-medium">
          Nachricht
        </label>
        <textarea
          id="fb-message"
          rows={5}
          aria-invalid={!!errors.message}
          {...register('message')}
          className="mt-1.5 w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm focus-visible:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
        />
        {err(errors.message?.message)}
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-ink-muted">
          <input type="checkbox" {...register('consent')} className="mt-1 h-4 w-4 accent-forest" />
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung meines Hinweises verarbeitet werden.
        </label>
        {err(errors.consent?.message)}
      </div>
      {status === 'error' && <p className="text-sm text-destructive sm:col-span-2">Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.</p>}
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Hinweis senden
        </Button>
      </div>
    </form>
  );
}

export default function AboutPage() {
  return (
    <PageContainer>
      <SEO title="Über NRW" description="Nordrhein-Westfalen im Überblick: Geschichte, Regionen, UNESCO-Welterbe – und Informationen zu Quellen und Bildnachweisen von NRW Explorer." />
      <PageHeader
        eyebrow="Über NRW"
        title="Nordrhein-Westfalen – Land der Vielfalt"
        text="Zwischen Rhein und Weser verbinden sich römisches Erbe, mittelalterliche Kathedralen, barocke Residenzen, Industriekultur und weite Naturlandschaften."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="rounded-3xl bg-white p-6 shadow-soft">
            <p className="font-display text-3xl text-forest">{f.value}</p>
            <p className="mt-1 text-sm text-ink-muted">{f.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-2">
        <div className="prose-nrw">
          <h2 className="mb-4 font-display text-3xl">Ein junges Land mit alter Geschichte</h2>
          <p>
            Das Land Nordrhein-Westfalen wurde am 23. August 1946 von der britischen Militärregierung aus dem nördlichen Teil der preußischen Rheinprovinz und der Provinz Westfalen gebildet. 1947 kam das Land Lippe hinzu.
          </p>
          <p>
            Die Geschichte der Region reicht jedoch weit zurück: Römer gründeten am Rhein Städte wie Köln und Xanten, Karl der Große regierte von Aachen aus, und im Mittelalter machten Kathedralen und Hansestädte die Region reich. Mit der Industrialisierung wurde das Ruhrgebiet zum größten Industrierevier Europas.
          </p>
          <p>Heute ist NRW ein Land der Kultur: mit Hunderten Museen, Theatern, Burgen und Schlössern sowie mehreren UNESCO-Welterbestätten.</p>
        </div>
        <div className="rounded-3xl bg-forest p-7 text-white sm:p-9">
          <h2 className="flex items-center gap-2 font-display text-2xl">
            <Award className="h-6 w-6 text-sand" /> UNESCO-Welterbe in NRW
          </h2>
          <ul className="mt-5 divide-y divide-white/10">
            {WORLD_HERITAGE.map((w) => (
              <li key={w.name} className="flex items-center justify-between gap-4 py-3">
                {w.to ? (
                  <Link to={w.to} className="hover:text-sand-light hover:underline">
                    {w.name}
                  </Link>
                ) : (
                  <span>{w.name}</span>
                )}
                <span className="shrink-0 text-sm tabular-nums text-sand">{w.year}</span>
              </li>
            ))}
          </ul>
          <a href="https://www.unesco.de/kultur-und-natur/welterbe/welterbe-deutschland" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-white/75 hover:text-white">
            Deutsche UNESCO-Kommission <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section className="mt-24">
        <SectionHeading eyebrow="Regionen" title="Die Landschaften Nordrhein-Westfalens" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <Reveal key={r.name} delay={(i % 3) * 0.06}>
              <Link to={r.to} className="group block overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <SmartImage wikiTitle={r.wiki} alt={`Landschaft: ${r.name}`} width={500} className="aspect-[16/10] w-full" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                <div className="p-5">
                  <h3 className="font-display text-xl">{r.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{r.text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="quellen" className="mt-24 scroll-mt-28 grid gap-10 lg:grid-cols-2">
        <div className="prose-nrw">
          <h2 className="mb-4 flex items-center gap-2 font-display text-3xl">
            <ImageIcon className="h-7 w-7 text-forest" /> Quellen & Bildnachweise
          </h2>
          <p>
            Die historischen Texte wurden redaktionell verfasst und bei jedem Ort mit Quellen versehen – bevorzugt offizielle Websites der Einrichtungen, das UNESCO-Welterbezentrum und die Wikipedia als Einstieg zur weiterführenden Literatur. Sagen und Legenden sind ausdrücklich als solche gekennzeichnet.
          </p>
          <p>
            Alle Fotos stammen von <a className="text-forest underline" href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> und stehen unter freien Lizenzen (z. B. CC BY-SA). Urheber und Lizenz werden in der Großansicht angezeigt und sind auf der jeweiligen Dateiseite verlinkt.
          </p>
          <p>
            Kartendaten: Google Maps bzw. im Entwicklungsmodus <a className="text-forest underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap-Mitwirkende</a>. Öffnungszeiten und Preise werden nur angezeigt, wenn sie verifiziert sind.
          </p>
        </div>
        <div>
          <h2 className="mb-4 font-display text-3xl">Fehler entdeckt?</h2>
          <p className="mb-6 text-ink-muted">Hilf uns, die Angaben aktuell und korrekt zu halten.</p>
          <FeedbackForm />
        </div>
      </section>

      <section id="datenschutz" className="prose-nrw mt-24 max-w-3xl scroll-mt-28">
        <h2 className="mb-4 font-display text-2xl">Datenschutz</h2>
        <p>
          NRW Explorer benötigt keine Registrierung. Favoriten werden ausschließlich im lokalen Speicher deines Browsers (localStorage) abgelegt. Für Bilder werden Inhalte von Wikimedia-Servern geladen; bei der Kartenanzeige werden Daten von Google Maps bzw. OpenStreetMap abgerufen. Dabei wird deine IP-Adresse an den jeweiligen Anbieter übermittelt.
        </p>
        <p className="text-sm text-ink-muted">Hinweis für Betreiber: Vollständige Datenschutzerklärung (inkl. Verantwortlichem und Rechtsgrundlagen) vor Veröffentlichung ergänzen.</p>
      </section>
      <section id="impressum" className="prose-nrw mt-12 max-w-3xl scroll-mt-28">
        <h2 className="mb-4 font-display text-2xl">Impressum</h2>
        <p className="text-sm text-ink-muted">Angaben gemäß § 5 DDG sind vom Betreiber der Website vor der Veröffentlichung einzutragen.</p>
      </section>
    </PageContainer>
  );
}
