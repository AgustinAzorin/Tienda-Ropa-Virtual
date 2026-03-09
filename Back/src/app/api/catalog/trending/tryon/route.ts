import { type NextRequest } from 'next/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { products, tryonSessions } from '@/db/schema';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';

const DEFAULT_DAYS = 7;
const MIN_DAYS = 1;
const MAX_DAYS = 90;
const DEFAULT_LIMIT = 12;
const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`Parametro invalido: ${value}`);
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    enforceRateLimit(request, { keyPrefix: 'catalog-trending-tryon', limit: 90, windowMs: 60_000 });

    const rawDays = parsePositiveInt(request.nextUrl.searchParams.get('days'), DEFAULT_DAYS);
    const rawLimit = parsePositiveInt(request.nextUrl.searchParams.get('limit'), DEFAULT_LIMIT);
    const days = Math.min(Math.max(rawDays, MIN_DAYS), MAX_DAYS);
    const limit = Math.min(Math.max(rawLimit, MIN_LIMIT), MAX_LIMIT);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        has_3d_model: products.has_3d_model,
        tryon_count: sql<number>`count(${tryonSessions.id})`,
      })
      .from(tryonSessions)
      .innerJoin(products, eq(tryonSessions.product_id, products.id))
      .where(and(eq(products.is_active, true), gte(tryonSessions.created_at, since)))
      .groupBy(products.id)
      .orderBy(desc(sql`count(${tryonSessions.id})`))
      .limit(limit);

    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}
