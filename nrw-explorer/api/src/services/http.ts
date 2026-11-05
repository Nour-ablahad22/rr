import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ZodError, type ZodTypeAny, type z } from 'zod';
import { config } from '../config';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

function corsHeaders(req: HttpRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  if (origin && config.corsOrigins.includes(origin)) return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
  return {};
}

export function json(req: HttpRequest, body: unknown, status = 200, cacheSeconds = 0): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}` : 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(req),
    },
  };
}

export function parseQuery<S extends ZodTypeAny>(req: HttpRequest, schema: S): z.infer<S> {
  return schema.parse(Object.fromEntries(req.query.entries()));
}

/** Einheitliche Fehlerbehandlung: { error: { code, message, details? } } */
export function handler(fn: (req: HttpRequest, ctx: InvocationContext) => Promise<HttpResponseInit>) {
  return async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return json(req, { error: { code: 'VALIDATION_ERROR', message: 'Ungültige Anfrageparameter', details: err.flatten() } }, 400);
      }
      if (err instanceof HttpError) return json(req, { error: { code: err.code, message: err.message, details: err.details } }, err.status);
      ctx.error('Unerwarteter Fehler', err);
      return json(req, { error: { code: 'INTERNAL_ERROR', message: 'Interner Serverfehler' } }, 500);
    }
  };
}

export const notFound = (what: string) => new HttpError(404, 'NOT_FOUND', `${what} wurde nicht gefunden`);
