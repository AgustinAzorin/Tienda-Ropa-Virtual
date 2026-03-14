import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { ValidationError } from '@/lib/errors';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cartId = typeof body?.cartId === 'string' ? body.cartId : '';
    const variantId = typeof body?.variantId === 'string' ? body.variantId : '';
    const quantity = Number(body?.quantity ?? 1);

    if (!cartId) {
      throw new ValidationError('cartId es requerido');
    }
    if (!variantId) {
      throw new ValidationError('variantId es requerido');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('quantity debe ser un entero mayor que 0');
    }

    const result = await cartService.addItem(cartId, variantId, quantity);
    return created(result);
  } catch (err) {
    return handleError(err);
  }
}
