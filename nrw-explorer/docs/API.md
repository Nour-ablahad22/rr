# NRW Explorer – REST-API

Basis-URL: `/api` (bei Azure Static Web Apps automatisch mit dem Frontend verknüpft, lokal `http://localhost:7071/api`).
Alle Antworten sind JSON (UTF-8). Fehler haben immer die Form:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Ungültige Anfrageparameter", "details": { } } }
```

| Code | Bedeutung |
| --- | --- |
| 400 `VALIDATION_ERROR` / `INVALID_JSON` | Parameter oder Body ungültig (serverseitige Validierung mit Zod) |
| 404 `NOT_FOUND` | Stadt / Sehenswürdigkeit existiert nicht |
| 500 `INTERNAL_ERROR` | Unerwarteter Fehler (wird in Application Insights protokolliert) |

Listen-Endpunkte sind paginiert: `page` (ab 1), `pageSize` (1–100, Standard 24). Antwort:
`{ "items": [...], "total": 86, "page": 1, "pageSize": 24, "totalPages": 4 }`.
Katalogantworten tragen `Cache-Control: public, max-age=300` (konfigurierbar über `CACHE_SECONDS`).

## Städte

### `GET /api/cities`
| Parameter | Beschreibung |
| --- | --- |
| `q` | Freitext (Name, Region, Beschreibung) |
| `tags` | Kommagetrennt: `historisch,kultur,natur,architektur,familie,romantisch,aktiv` (UND-Verknüpfung) |
| `sort` | `beliebt` (Standard), `alphabetisch`, `historisch`, `natur` |

### `GET /api/cities/{id}`
`id` = ID oder Slug, z. B. `koeln`. Liefert ein `City`-Objekt (siehe `shared/types.ts`).

### `GET /api/cities/{id}/attractions`
Alle Sehenswürdigkeiten einer Stadt (Cosmos-Abfrage innerhalb der Partition `cityId`). Optional `category`, `q`, Paginierung.

## Sehenswürdigkeiten

### `GET /api/attractions`
| Parameter | Beschreibung |
| --- | --- |
| `q` | Freitext (Name, Kurzbeschreibung, Schlagwörter) |
| `cityId` | Stadt-ID, z. B. `aachen` |
| `category` | Kommagetrennt: `burgen-schloesser, museen, kirchen, historische-gebaeude, parks-gaerten, natur, architektur, freizeit` (ODER-Verknüpfung, inkl. Nebenkategorien) |
| `unesco` | `true` = nur UNESCO-Welterbe |
| `sort` | `alphabetisch` |

### `GET /api/attractions/{id}`
Eine Sehenswürdigkeit inkl. Geschichte, Architektur, Fakten, Koordinaten und Quellen.

### `GET /api/attractions/nearby?lat={lat}&lng={lng}`
Optional `radiusKm` (Standard 25, max. 200), `limit` (Standard 6, max. 50), `exclude` (ID). Sortiert nach Entfernung; jedes Element enthält `distanceKm`.

## Suche

### `GET /api/search?q={query}`
Gewichtete Suche über Städte und Sehenswürdigkeiten (exakter Treffer > Präfix > enthalten; Umlaute werden normalisiert). Optional `limit` (Standard 12).
Antwort: `[{ "type": "attraction", "id": "koelner-dom", "slug": "koelner-dom", "name": "Kölner Dom", "subtitle": "Köln · Kirchen und Kathedralen", "category": "kirchen", "wikiTitle": "Kölner Dom", "score": 141 }]`

## Favoriten (Gäste ohne Registrierung)

Gäste werden über eine im Browser erzeugte UUID identifiziert. Städte werden mit dem Präfix `stadt:` gespeichert.

| Methode | Route | Body / Parameter | Antwort |
| --- | --- | --- | --- |
| `GET` | `/api/favorites?userId={uuid}` | – | `FavoritesDoc` |
| `POST` | `/api/favorites` | `{ "userId": "<uuid>", "attractionId": "koelner-dom" }` | `201` + `FavoritesDoc` |
| `DELETE` | `/api/favorites/{id}?userId={uuid}` | – | `204` |

## Sonstiges

- `POST /api/feedback` – `{ name, email, topic: "korrektur"|"vorschlag"|"sonstiges", message, consent: true }` → `201`
- `GET /api/health` – Status und aktiver Datenanbieter (`memory` oder `cosmos`)

## Cosmos-DB-Modell

| Container | Partitionsschlüssel | Begründung |
| --- | --- | --- |
| `cities` | `/id` | kleiner, statischer Katalog |
| `attractions` | `/cityId` | häufigste Abfrage „alle Orte einer Stadt“ bleibt partitionslokal |
| `favorites` | `/userId` | Punktlesezugriff (`id` = `userId`) |
| `feedback` | `/topic` | Schreiblast gering; TTL 1 Jahr |
