'use server';

import { cookies } from 'next/headers';

const CART_COOKIE = '_medusa_cart_id';

export async function mergeGuestCart(customerId: string) {
  const cookieStore = await cookies();
  const guestCartId = cookieStore.get(CART_COOKIE)?.value;

  if (!guestCartId || !customerId) {
    return { merged: false, reason: 'NO_GUEST_CART' as const };
  }

  // Placeholder merge hook. Detailed merge is resolved in Medusa/cart helpers.
  cookieStore.set(CART_COOKIE, guestCartId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });

  return { merged: true as const, cartId: guestCartId };
}
