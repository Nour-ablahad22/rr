/**
 * Ruft alle Endpunkte im Speichermodus direkt auf (ohne Functions-Host) und prüft die Antworten.
 */
import { app, HttpRequest, InvocationContext, type HttpHandler } from '@azure/functions';
import assert from 'node:assert/strict';

const handlers: Record<string, HttpHandler> = {};
(app as unknown as { http: (name: string, o: { handler: HttpHandler }) => void }).http = (name, o) => {
  handlers[name] = o.handler;
};
process.env.DATA_PROVIDER = 'memory';
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../src/functions/catalog');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../src/functions/favorites');

async function call(name: string, init: { query?: Record<string, string>; params?: Record<string, string>; method?: string; body?: unknown }) {
  const url = `http://localhost/api/x?${new URLSearchParams(init.query ?? {}).toString()}`;
  const req = new HttpRequest({ url, method: init.method ?? 'GET', params: init.params ?? {}, body: init.body ? { string: JSON.stringify(init.body) } : undefined, headers: { 'content-type': 'application/json' } });
  const res = await handlers[name]!(req, new InvocationContext({ functionName: name }));
  return res as { status?: number; jsonBody?: any };
}

(async () => {
  let r = await call('listCities', { query: { pageSize: '100' } });
  assert.equal(r.status, 200);
  assert.equal(r.jsonBody.total, 20);
  r = await call('listCities', { query: { tags: 'unbekannt' } });
  assert.equal(r.status, 400, 'ungültiger Filter → 400');
  r = await call('getCity', { params: { id: 'koeln' } });
  assert.equal(r.jsonBody.name, 'Köln');
  r = await call('getCity', { params: { id: 'atlantis' } });
  assert.equal(r.status, 404);
  r = await call('getCityAttractions', { params: { id: 'aachen' } });
  assert.ok(r.jsonBody.items.length >= 6);
  r = await call('listAttractions', { query: { category: 'museen', pageSize: '5', page: '2' } });
  assert.equal(r.jsonBody.page, 2);
  assert.ok(r.jsonBody.items.every((a: any) => a.category === 'museen' || a.secondaryCategories?.includes('museen')));
  r = await call('listAttractions', { query: { unesco: 'true', pageSize: '100' } });
  assert.ok(r.jsonBody.items.every((a: any) => a.unesco));
  r = await call('getAttraction', { params: { id: 'koelner-dom' } });
  assert.equal(r.jsonBody.cityId, 'koeln');
  r = await call('search', { query: { q: 'Kölner Dom' } });
  assert.equal(r.jsonBody[0].id, 'koelner-dom');
  r = await call('search', { query: { q: 'x' } });
  assert.equal(r.status, 400);
  r = await call('nearbyAttractions', { query: { lat: '50.9413', lng: '6.9581', radiusKm: '2' } });
  assert.equal(r.jsonBody[0].id, 'koelner-dom');
  const userId = '3f1c2a8e-5b6d-4e7f-8a9b-0c1d2e3f4a5b';
  r = await call('addFavorite', { method: 'POST', body: { userId, attractionId: 'aachener-dom' } });
  assert.equal(r.status, 201);
  assert.deepEqual(r.jsonBody.attractionIds, ['aachener-dom']);
  r = await call('addFavorite', { method: 'POST', body: { userId, attractionId: 'gibt-es-nicht' } });
  assert.equal(r.status, 404);
  r = await call('removeFavorite', { method: 'DELETE', params: { id: 'aachener-dom' }, query: { userId } });
  assert.equal(r.status, 204);
  r = await call('getFavorites', { query: { userId } });
  assert.deepEqual(r.jsonBody.attractionIds, []);
  r = await call('feedback', { method: 'POST', body: { name: 'Test', email: 'test@example.org', topic: 'korrektur', message: 'Eine Testnachricht.', consent: true } });
  assert.equal(r.status, 201);
  console.log(`API-Smoke-Test bestanden (${Object.keys(handlers).length} Funktionen).`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
