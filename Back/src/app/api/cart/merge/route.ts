import { type NextRequest } from 'next/server';
import { cartService } from '@/modules/cart/cart.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId     = await requireUserId(request);
    const body       = await request.json();
    const userCart   = await cartService.mergeOnLogin(userId, body.guestCartId);
    return ok(userCart);
  } catch (err) {
    return handleError(err);
  }
}
