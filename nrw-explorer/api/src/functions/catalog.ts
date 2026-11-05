import { app } from '@azure/functions';
import { nearbyAttractions, paginate, queryAttractions, queryCities, search } from '../../../shared/query';
import { config } from '../config';
import { attractionsQuery, citiesQuery, nearbyQuery, searchQuery, slugParam } from '../models/schemas';
import { handler, json, notFound, parseQuery } from '../services/http';
import { getRepository } from '../services/repository';
import { initTelemetry } from '../services/telemetry';

initTelemetry();
const repo = () => getRepository();
const ttl = config.cacheSeconds;

// GET /api/cities?q=&tags=historisch,natur&sort=beliebt&page=1&pageSize=24
app.http('listCities', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cities',
  handler: handler(async (req) => {
    const p = parseQuery(req, citiesQuery);
    const items = queryCities(await repo().listCities(), { q: p.q, tags: p.tags, sort: p.sort });
    return json(req, paginate(items, p.page, p.pageSize), 200, ttl);
  }),
});

// GET /api/cities/{id}
app.http('getCity', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cities/{id}',
  handler: handler(async (req) => {
    const id = slugParam.parse(req.params.id);
    const city = await repo().getCity(id);
    if (!city) throw notFound('Die Stadt');
    return json(req, city, 200, ttl);
  }),
});

// GET /api/cities/{id}/attractions
app.http('getCityAttractions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cities/{id}/attractions',
  handler: handler(async (req) => {
    const id = slugParam.parse(req.params.id);
    const city = await repo().getCity(id);
    if (!city) throw notFound('Die Stadt');
    const p = parseQuery(req, attractionsQuery);
    const items = queryAttractions(await repo().listAttractionsByCity(city.id), { categories: p.category, q: p.q });
    return json(req, paginate(items, p.page, p.pageSize), 200, ttl);
  }),
});

// GET /api/attractions/nearby?lat=&lng=&radiusKm=&limit=   (vor {id} registriert)
app.http('nearbyAttractions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'attractions/nearby',
  handler: handler(async (req) => {
    const p = parseQuery(req, nearbyQuery);
    const items = nearbyAttractions(await repo().listAttractions(), { lat: p.lat, lng: p.lng }, { radiusKm: p.radiusKm, limit: p.limit, excludeId: p.exclude });
    return json(req, items, 200, ttl);
  }),
});

// GET /api/attractions?q=&cityId=&category=museen,kirchen&unesco=true&page=&pageSize=
app.http('listAttractions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'attractions',
  handler: handler(async (req) => {
    const p = parseQuery(req, attractionsQuery);
    const items = queryAttractions(await repo().listAttractions(), { q: p.q, cityId: p.cityId, categories: p.category, unesco: p.unesco, sort: p.sort });
    return json(req, paginate(items, p.page, p.pageSize), 200, ttl);
  }),
});

// GET /api/attractions/{id}
app.http('getAttraction', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'attractions/{id}',
  handler: handler(async (req) => {
    const id = slugParam.parse(req.params.id);
    const a = await repo().getAttraction(id);
    if (!a) throw notFound('Die Sehenswürdigkeit');
    return json(req, a, 200, ttl);
  }),
});

// GET /api/search?q=
app.http('search', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'search',
  handler: handler(async (req) => {
    const p = parseQuery(req, searchQuery);
    const [cities, attractions] = await Promise.all([repo().listCities(), repo().listAttractions()]);
    return json(req, search(cities, attractions, p.q, p.limit), 200, 60);
  }),
});

// GET /api/health
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: handler(async (req) => json(req, { status: 'ok', provider: config.provider, time: new Date().toISOString() })),
});
