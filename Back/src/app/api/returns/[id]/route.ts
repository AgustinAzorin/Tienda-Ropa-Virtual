import { type NextRequest } from 'next/server';
import { returnService } from '@/modules/returns/returns.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireUserId(request);
    const ret    = await returnService.getReturn(id);
    return ok(ret);
  } catch (err) {
    return handleError(err);
  }
}
