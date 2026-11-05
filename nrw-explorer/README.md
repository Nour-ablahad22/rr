# NRW Explorer – Entdecke Nordrhein-Westfalen

> „Nordrhein-Westfalen entdecken – Geschichte, Kultur und Natur erleben."

Tourismus-Webanwendung für Nordrhein-Westfalen: 20 Reiseziele, 86 Sehenswürdigkeiten mit historischen Texten und Quellen, interaktive Karte, Galerie, Favoriten und globale Suche. Frontend in React/TypeScript, Backend als Azure Functions mit Cosmos DB, Deployment auf Azure Static Web Apps.

## Funktionsumfang

| Bereich | Route | Inhalt |
| --- | --- | --- |
| Startseite | `/` | Hero mit Suche, beliebte Reiseziele, Highlights, Geschichte, Natur, Kartenvorschau, Inspiration |
| Städte entdecken | `/staedte` | 20 Städte, Filter (7 Reisethemen), Sortierung (4 Arten), Suche, „Weitere laden“ |
| Stadtseite | `/staedte/:slug` | Hero, historische Zeitleiste, Reiseinfos, Sehenswürdigkeiten mit Filter, Stadtkarte, Galerie, Nachbarorte, Quellen |
| Sehenswürdigkeiten | `/sehenswuerdigkeiten` | Filter nach Kategorie, Stadt, UNESCO, Suche; Paginierung; Filter in der URL |
| Detailseite | `/sehenswuerdigkeiten/:slug` | Geschichte, Historischer Hintergrund, Architektur, Kulturelle Bedeutung, Merkmale, Fakten, Sagen (gekennzeichnet), Galerie mit Lightbox, Mini-Karte, Route, Teilen, Orte in der Nähe |
| Historische Orte | `/historische-orte` | Epochen-Zeitleiste + Burgen, Kirchen, historische Gebäude |
| Interaktive Karte | `/karte` | Sidebar (Suche, „Stadt auswählen“, Kategorien, Ergebnisliste) + Karte mit Kategorie-Markern, Clustering, Info-Fenstern, Routenplanung, „In meiner Nähe“, Adresssuche (Google Geocoding); mobil Umschalter Karte/Liste. Deep Links: `?stadt=koeln`, `?ort=koelner-dom`, `?kategorie=museen` |
| Galerie | `/galerie` | 8 Kategorien, Stadtfilter, Masonry-Raster, Lazy Loading, Lightbox mit Urheber & Lizenz |
| Favoriten | `/favoriten` | Merkliste (localStorage, optional API-Sync), leerer Zustand |
| Über NRW | `/ueber-nrw` | Landesporträt, Welterbe, Regionen, Quellen, Feedback-Formular (React Hook Form + Zod), Datenschutz/Impressum-Platzhalter |
| Suche | `/suche?q=` | Ergebnisseite; zusätzlich Such-Overlay (Strg/⌘ + K) mit Tastaturnavigation |

## Technik

- **Frontend:** React 18, TypeScript (strict), Vite, Tailwind CSS, shadcn/ui-Komponenten (Radix), Lucide, React Router, Framer Motion, TanStack Query, React Hook Form, Zod, react-helmet-async
- **Karten:** Google Maps JavaScript API über `@vis.gl/react-google-maps` (Advanced Markers, MarkerClusterer, InfoWindow, Geocoding). **Ohne API-Schlüssel** wird automatisch eine OpenStreetMap-Karte (Leaflet) als sichtbar gekennzeichneter Entwicklungs-Fallback verwendet – es wird nie vorgetäuscht, Google Maps sei verbunden.
- **Backend:** Azure Functions v4 (Node.js/TypeScript), Azure Cosmos DB, Application Insights, Konfiguration über App Settings / Key-Vault-Referenzen
- **Bilder:** Wikimedia Commons über die Wikipedia-REST-API (freie Lizenzen, Urheber/Lizenz werden abgerufen und angezeigt). Fehlt ein Bild, erscheint ein gestalteter Platzhalter statt eines kaputten Bildes.

```
nrw-explorer/
├── shared/            # Gemeinsam für Frontend & API: Typen, Labels, Such-/Filterlogik, Datensatz
│   └── data/          # cities.ts + attractions-*.ts (eine Quelle für Karten, Karten-Marker, Suche, API)
├── src/
│   ├── components/    # ui/, layout/, common/, home/, cities/, attractions/, map/, search/, favorites/
│   ├── pages/         # eine Datei je Route (lazy geladen)
│   ├── hooks/         # TanStack-Query-Hooks, Favoriten-Context, Utilities
│   ├── services/      # dataService (local|api), apiClient, wikimedia, googleMaps
│   └── config/        # Umgebungsvariablen
├── api/               # Azure Functions (src/functions, services, models, config) + Seed & Smoke-Test
├── scripts/           # Datenprüfung, Koordinatenabgleich, Sitemap
└── docs/API.md        # API-Dokumentation
```

## Lokale Entwicklung

```bash
cd nrw-explorer
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Die App läuft unter http://localhost:5173 und nutzt standardmäßig den eingebauten Datensatz (`VITE_DATA_SOURCE=local`).

### Mit lokalem Backend

Voraussetzung: [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local).

```bash
cd api && npm install && cp local.settings.example.json local.settings.json && npm start
```

Dann in `.env.local` `VITE_DATA_SOURCE=api` setzen – Vite leitet `/api` an `localhost:7071` weiter. Ohne `COSMOS_ENDPOINT` arbeitet die API mit dem In-Memory-Datensatz.

### Prüfungen

```bash
npm run typecheck && npm run lint:data && npm run build
```

```bash
cd api && npm test
```

```bash
npm run verify:coords
```

`verify:coords` vergleicht alle Koordinaten mit den Wikipedia-Artikeldaten (benötigt Internetzugang) und listet Abweichungen über 300 m.

## Google Maps einrichten

1. In der Google Cloud Console ein Projekt anlegen und **Maps JavaScript API**, **Places API (New)**, **Geocoding API** und **Routes API** aktivieren.
2. Einen API-Schlüssel erstellen und einschränken:
   - Anwendungsbeschränkung **HTTP-Referrer**: `https://<ihre-domain>/*`, `https://<name>.azurestaticapps.net/*`, `http://localhost:5173/*`
   - API-Beschränkung auf die oben genannten APIs
3. Optional eine **Map-ID** (für Advanced Markers und Cloud-Styling) anlegen.
4. `VITE_GOOGLE_MAPS_API_KEY` und `VITE_GOOGLE_MAPS_MAP_ID` setzen (lokal in `.env.local`, im CI als Secret/Variable).

Der Browser-Schlüssel ist bauartbedingt öffentlich; die Sicherheit entsteht durch die Referrer- und API-Beschränkung. Server-Geheimnisse (Cosmos-Schlüssel usw.) gelangen nie ins Frontend. Die Routenplanung öffnet Google Maps mit dem Ziel als Routenziel.

## Deployment auf Azure

1. **Cosmos DB** (NoSQL, Serverless empfohlen) anlegen.
2. **Static Web App** anlegen (Plan „Standard“, falls verwaltete Identität / eigene Function App gewünscht).
3. App Settings der Static Web App setzen: `DATA_PROVIDER=cosmos`, `COSMOS_ENDPOINT`, `COSMOS_DATABASE=nrw-explorer`, `COSMOS_KEY` (als Key-Vault-Referenz) oder verwaltete Identität mit der Rolle „Cosmos DB Built-in Data Contributor“, `APPLICATIONINSIGHTS_CONNECTION_STRING`.
4. Daten einspielen:
   ```bash
   cd api && COSMOS_ENDPOINT=https://<konto>.documents.azure.com:443/ COSMOS_KEY=<schlüssel> npm run seed
   ```
5. Im GitHub-Repository das Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` (Deployment-Token) und optional `VITE_GOOGLE_MAPS_API_KEY` sowie die Variablen `VITE_GOOGLE_MAPS_MAP_ID` und `VITE_SITE_URL` hinterlegen.
6. Workflow `.github/workflows/nrw-explorer-azure-swa.yml` läuft bei Push auf `main` (Änderungen unter `nrw-explorer/`) oder manuell. Er prüft den Datensatz, baut Frontend und API, führt den API-Smoke-Test aus und deployt.

`public/staticwebapp.config.json` enthält SPA-Fallback, Cache-Header für Assets, Sicherheitsheader (inkl. Content-Security-Policy) und die Node-20-Laufzeit für die API.

## Inhalte und Datenqualität

- Alle Texte sind auf Deutsch und redaktionell verfasst; jede Stadt und jede Sehenswürdigkeit verweist auf Quellen (Wikipedia-Artikel, UNESCO-Welterbezentrum, offizielle Websites).
- Sagen und Legenden stehen in einem eigenen, gekennzeichneten Feld (`legend`) und werden von belegter Geschichte getrennt dargestellt.
- **Öffnungszeiten und Eintrittspreise sind bewusst nicht hinterlegt**, da sie nicht verifiziert wurden; die Oberfläche weist darauf hin.
- Koordinaten mit `coordinatePrecision: 'approx'` sind als ungefähr markiert und sollten vor dem Livegang mit `npm run verify:coords` geprüft werden.
- Neue Orte: Eintrag mit `defineAttraction({...})` in der passenden `shared/data/attractions-*.ts` ergänzen, `npm run lint:data` ausführen, ggf. `npm run seed`.
