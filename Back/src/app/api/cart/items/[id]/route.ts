import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body   = await request.json();
    const item   = await cartService.updateItemQty(id, body.quantity);
    return ok(item);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await cartService.removeItem(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
