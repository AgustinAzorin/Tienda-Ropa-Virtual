import { type NextRequest } from 'next/server';
import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from '@/db/client';
import { postProductTags, posts } from '@/db/schema';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    enforceRateLimit(request, { keyPrefix: 'ugc-by-product', limit: 120, windowMs: 60_000 });

    const { productId } = await params;
    const cursor = request.nextUrl.searchParams.get('cursor');
    const rawLimit = request.nextUrl.searchParams.get('limit');
    const limit = rawLimit ? Number(rawLimit) : 20;

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new ValidationError('limit debe ser un entero entre 1 y 50');
    }
    if (cursor && Number.isNaN(Date.parse(cursor))) {
      throw new ValidationError('cursor invalido');
    }

    const conditions = [
      eq(postProductTags.product_id, productId),
      eq(posts.visibility, 'public'),
    ];

    if (cursor) {
      conditions.push(lt(posts.created_at, new Date(cursor)));
    }

    const rows = await db
      .select({
        id: posts.id,
        user_id: posts.user_id,
        caption: posts.caption,
        type: posts.type,
        visibility: posts.visibility,
        like_count: posts.like_count,
        comment_count: posts.comment_count,
        created_at: posts.created_at,
      })
      .from(postProductTags)
      .innerJoin(posts, eq(postProductTags.post_id, posts.id))
      .where(and(...conditions))
      .orderBy(desc(posts.created_at))
      .limit(limit + 1);

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
