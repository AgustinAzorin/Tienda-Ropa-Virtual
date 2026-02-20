import { type NextRequest } from 'next/server';
import { tryonService } from '@/modules/tryon/tryon.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body   = await request.json();
    const session = await tryonService.endSession(id, body);
    return ok(session);
  } catch (err) {
    return handleError(err);
  }
}
