import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body   = await request.json();
    const cartId = typeof body?.cartId === 'string' ? body.cartId : '';
    const quantity = Number(body?.quantity);

    if (!cartId) {
      throw new ValidationError('cartId es requerido');
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new ValidationError('quantity debe ser un entero mayor o igual a 0');
    }

    const item   = await cartService.updateItemQuantity(cartId, id, quantity);
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
    const cartId = request.nextUrl.searchParams.get('cartId');
    if (!cartId) {
      throw new ValidationError('cartId es requerido como query param');
    }
    await cartService.removeItem(cartId, id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
