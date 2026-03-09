import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const result = await cartService.addItem(body.cartId, body.variantId, body.quantity ?? 1);
    return created(result);
  } catch (err) {
    return handleError(err);
  }
}
