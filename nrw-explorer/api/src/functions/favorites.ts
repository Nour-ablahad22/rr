import { randomUUID } from 'node:crypto';
import { app } from '@azure/functions';
import { z } from 'zod';
import { favoriteBody, feedbackBody } from '../models/schemas';
import { handler, HttpError, json } from '../services/http';
import { getRepository } from '../services/repository';

async function readJson(req: { json(): Promise<unknown> }): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'Der Anfrageinhalt ist kein gültiges JSON');
  }
}

// GET /api/favorites?userId=
app.http('getFavorites', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'favorites',
  handler: handler(async (req) => {
    const userId = z.string().uuid().parse(req.query.get('userId'));
    return json(req, await getRepository().getFavorites(userId));
  }),
});

// POST /api/favorites   { userId, attractionId }
app.http('addFavorite', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'favorites',
  handler: handler(async (req) => {
    const body = favoriteBody.parse(await readJson(req));
    const repo = getRepository();
    const plainId = body.attractionId.replace(/^stadt:/, '');
    const exists = body.attractionId.startsWith('stadt:') ? await repo.getCity(plainId) : await repo.getAttraction(plainId);
    if (!exists) throw new HttpError(404, 'NOT_FOUND', 'Unbekannte Sehenswürdigkeit oder Stadt');
    return json(req, await repo.addFavorite(body.userId, body.attractionId), 201);
  }),
});

// DELETE /api/favorites/{id}?userId=
app.http('removeFavorite', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'favorites/{id}',
  handler: handler(async (req) => {
    const { userId, attractionId } = favoriteBody.parse({ userId: req.query.get('userId'), attractionId: req.params.id });
    await getRepository().removeFavorite(userId, attractionId);
    return { status: 204 };
  }),
});

// POST /api/feedback
app.http('feedback', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'feedback',
  handler: handler(async (req) => {
    const body = feedbackBody.parse(await readJson(req));
    await getRepository().saveFeedback({ id: randomUUID(), topic: body.topic, name: body.name, email: body.email, message: body.message, createdAt: new Date().toISOString() });
    return json(req, { ok: true }, 201);
  }),
});
