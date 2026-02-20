import { type NextRequest } from 'next/server';
import { PostRepository } from '@/modules/social/posts/posts.repository';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new PostRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const feed   = await repo.getPersonalizedFeed(userId, { cursor });
    return ok(feed);
  } catch (err) {
    return handleError(err);
  }
}
