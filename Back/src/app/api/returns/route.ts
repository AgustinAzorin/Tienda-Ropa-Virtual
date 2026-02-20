import { type NextRequest } from 'next/server';
import { returnService } from '@/modules/returns/returns.service';
import { requireUserId } from '@/lib/auth-helpers';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    const ret    = await returnService.requestReturn(userId, body);
    return created(ret);
  } catch (err) {
    return handleError(err);
  }
}
