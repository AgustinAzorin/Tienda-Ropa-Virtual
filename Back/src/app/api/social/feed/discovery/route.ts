import { type NextRequest } from 'next/server';
import { PostRepository } from '@/modules/social/posts/posts.repository';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new PostRepository();

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const feed   = await repo.getDiscoveryFeed({ cursor });
    return ok(feed);
  } catch (err) {
    return handleError(err);
  }
}
