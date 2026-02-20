import { type NextRequest } from 'next/server';
import { tryonService } from '@/modules/tryon/tryon.service';
import { optionalUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId  = await optionalUserId(request);
    const sessions = await tryonService.listByUser(userId!);
    return ok(sessions);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body    = await request.json();
    const userId  = await optionalUserId(request);
    const session = await tryonService.startSession({ ...body, userId: userId ?? undefined });
    return created(session);
  } catch (err) {
    return handleError(err);
  }
}
