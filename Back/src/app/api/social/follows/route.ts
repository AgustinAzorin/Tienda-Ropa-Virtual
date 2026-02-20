import { type NextRequest } from 'next/server';
import { FollowRepository } from '@/modules/social/follows/follows.repository';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new FollowRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    await repo.follow(userId, body.targetUserId);
    return ok({ following: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const target = request.nextUrl.searchParams.get('targetUserId')!;
    await repo.unfollow(userId, target);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
