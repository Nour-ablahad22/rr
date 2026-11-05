import { z } from 'zod';
import { ATTRACTION_CATEGORIES, CITY_TAGS } from '../../../shared/types';

const csv = <T extends string>(values: readonly T[]) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []))
    .pipe(z.array(z.enum(values as unknown as [T, ...T[]])));

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
};

export const citiesQuery = z.object({
  q: z.string().max(100).optional(),
  tags: csv(CITY_TAGS),
  sort: z.enum(['beliebt', 'alphabetisch', 'historisch', 'natur']).default('beliebt'),
  ...pagination,
});

export const attractionsQuery = z.object({
  q: z.string().max(100).optional(),
  cityId: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: csv(ATTRACTION_CATEGORIES),
  unesco: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  sort: z.enum(['alphabetisch', 'stadt']).optional(),
  ...pagination,
});

export const searchQuery = z.object({ q: z.string().trim().min(2, 'Mindestens 2 Zeichen').max(100), limit: z.coerce.number().int().min(1).max(50).default(12) });

export const nearbyQuery = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(200).default(25),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  exclude: z.string().optional(),
});

export const slugParam = z.string().regex(/^[a-z0-9-]{1,80}$/, 'Ungültige ID');

export const favoriteBody = z.object({
  userId: z.string().uuid('userId muss eine UUID sein'),
  attractionId: z.string().regex(/^(stadt:)?[a-z0-9-]{1,80}$/),
});

export const feedbackBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  topic: z.enum(['korrektur', 'vorschlag', 'sonstiges']),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
});
