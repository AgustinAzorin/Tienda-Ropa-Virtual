import { type NextRequest } from 'next/server';
import { PostRepository } from '@/modules/social/posts/posts.repository';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';

const repo = new PostRepository();

export async function GET(request: NextRequest) {
  try {
    enforceRateLimit(request, { keyPrefix: 'social-feed', limit: 60, windowMs: 60_000 });

    const userId = await requireUserId(request);
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const rawLimit = request.nextUrl.searchParams.get('limit');
    const limit = rawLimit ? Number(rawLimit) : 20;

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new ValidationError('limit debe ser un entero entre 1 y 50');
    }
    if (cursor && Number.isNaN(Date.parse(cursor))) {
      throw new ValidationError('cursor invalido');
    }

    const rows = await repo.getPersonalizedFeed(userId, { cursor, limit: limit + 1 });
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore
      ? (last?.created_at instanceof Date ? last.created_at.toISOString() : String(last?.created_at))
      : null;

    return ok(items, { hasMore, nextCursor, limit });
  } catch (err) {
    return handleError(err);
  }
}
