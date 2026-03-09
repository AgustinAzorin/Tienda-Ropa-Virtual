import { type NextRequest } from 'next/server';
import { interactionsService } from '@/modules/social/interactions/interactions.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const collection = request.nextUrl.searchParams.get('collection') ?? undefined;
    const saves  = await interactionsService.listSaves(userId, collection);
    return ok(saves);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    await interactionsService.saveItem(userId, body.referenceId, body.referenceType);
    return created({ saved: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId      = await requireUserId(request);
    const saveId = request.nextUrl.searchParams.get('saveId')!;
    await interactionsService.unsaveItem(saveId, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
