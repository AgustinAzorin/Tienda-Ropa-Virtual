import { type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';
import { outfitsService } from '@/modules/outfits/outfits.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId(request);
    const { id } = await params;
    const body = await request.json();

    const outfit = await outfitsService.update(id, userId, {
      name: body.name,
      is_public: body.is_public,
      items: body.items,
    });

    return ok(outfit);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId(request);
    const { id } = await params;
    await outfitsService.remove(id, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
