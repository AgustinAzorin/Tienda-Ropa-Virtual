'use server';

import { cookies } from 'next/headers';
import type { CartSnapshot } from '@/lib/cart/types';

const CART_COOKIE = '_medusa_cart_id';

function emptySnapshot(cartId: string): CartSnapshot {
  return {
    cartId,
    localCartId: null,
    items: [],
    subtotal: 0,
    total: 0,
    currency: 'ARS',
  };
}

export async function initOrRetrieveCartAction() {
  const cookieStore = await cookies();
  const current = cookieStore.get(CART_COOKIE)?.value;
  const cartId = current ?? crypto.randomUUID();

  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });

  return emptySnapshot(cartId);
}

export async function addItemAction(_variantId: string, _quantity: number, _triedOn3D: boolean, cartId?: string) {
  const base = cartId ? emptySnapshot(cartId) : await initOrRetrieveCartAction();
  return base;
}

export async function updateQuantityAction(cartId: string, _itemId: string, _quantity: number) {
  return emptySnapshot(cartId);
}

export async function removeItemAction(cartId: string, _itemId: string) {
  return emptySnapshot(cartId);
}

export async function clearCartAction(cartId: string) {
  return emptySnapshot(cartId);
}

export async function mergeGuestCartAction(_customerId: string) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;
  return { merged: Boolean(cartId), cartId: cartId ?? null };
}

export async function listShippingOptionsAction(_cartId: string) {
  return [
    { id: 'ship-standard', name: 'Envio estandar', amount: 0, metadata: { eta_days: '3-5' } },
    { id: 'ship-express', name: 'Envio express', amount: 3499, metadata: { eta_days: '1-2' } },
  ];
}

export async function setShippingAddressAction(cartId: string, _shippingAddress: Record<string, unknown>) {
  return emptySnapshot(cartId);
}

export async function setShippingMethodAction(cartId: string, _optionId: string) {
  return emptySnapshot(cartId);
}

export async function createPaymentSessionsAction(_cartId: string) {
  return { payment_sessions: [] };
}

export async function setPaymentSessionAction(_cartId: string, _providerId: string) {
  return { ok: true };
}

export async function completeCartAction(_cartId: string) {
  return {
    type: 'order',
    order: {
      id: crypto.randomUUID(),
    },
  };
}
