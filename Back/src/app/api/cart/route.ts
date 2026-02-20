import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { optionalUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId  = await optionalUserId(request);
    const cartId  = request.nextUrl.searchParams.get('cartId') ?? undefined;
    const cart    = await cartService.getOrCreate(userId ?? undefined, cartId);
    return ok(cart);
  } catch (err) {
    return handleError(err);
  }
}
