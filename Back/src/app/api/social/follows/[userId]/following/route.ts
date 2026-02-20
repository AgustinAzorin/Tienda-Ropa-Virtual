import { type NextRequest } from 'next/server';
import { FollowRepository } from '@/modules/social/follows/follows.repository';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new FollowRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const cursor     = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const list       = await repo.listFollowing(userId, { cursor });
    return ok(list);
  } catch (err) {
    return handleError(err);
  }
}
