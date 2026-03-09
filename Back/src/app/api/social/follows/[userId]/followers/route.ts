import { type NextRequest } from 'next/server';
import { FollowRepository } from '@/modules/social/follows/follows.repository';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new FollowRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const list       = await repo.listFollowers(userId);
    return ok(list);
  } catch (err) {
    return handleError(err);
  }
}
