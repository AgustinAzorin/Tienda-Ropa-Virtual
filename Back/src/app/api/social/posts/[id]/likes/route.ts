import { type NextRequest } from 'next/server';
import { interactionsService } from '@/modules/social/interactions/interactions.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    const result = await interactionsService.toggleLike(userId, id);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
