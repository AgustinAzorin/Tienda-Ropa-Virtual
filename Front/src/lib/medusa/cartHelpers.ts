import type { CartItem, CartSnapshot } from '@/lib/cart/types';
import { getAccessToken } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const CART_STORAGE_KEY = 'anya_cart_id_v1';
const VARIANT_META_KEY = 'anya_cart_variant_meta_v1';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type VariantMeta = {
  productName: string;
  thumbnail?: string;
  variantTitle?: string;
  color?: string;
  size?: string;
  triedOn3D?: boolean;
};

type ApiCart = {
  id: string;
  currency?: string;
  items?: Array<{
    id: string;
    variant_id: string;
    quantity: number;
    unit_price: string | number;
    tried_on_3d?: boolean;
  }>;
};

class CartRequestError extends Error {
  status: number;
  bodyText: string;

  constructor(status: number, bodyText: string) {
    super(`Cart request failed: ${status}${bodyText ? ` - ${bodyText}` : ''}`);
    this.name = 'CartRequestError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

function readCartId() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return null;
  if (!isUuid(raw)) {
    localStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
  return raw;
}

function writeCartId(cartId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, cartId);
}

function readVariantMeta(): Record<string, VariantMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VARIANT_META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, VariantMeta>) : {};
  } catch {
    return {};
  }
}

function writeVariantMeta(allMeta: Record<string, VariantMeta>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VARIANT_META_KEY, JSON.stringify(allMeta));
}

function upsertVariantMeta(variantId: string, meta: VariantMeta) {
  const current = readVariantMeta();
  current[variantId] = { ...(current[variantId] ?? {}), ...meta };
  writeVariantMeta(current);
}

function emptySnapshot(cartId: string): CartSnapshot {
  return {
    cartId,
    localCartId: readCartId(),
    items: [],
    subtotal: 0,
    total: 0,
    currency: 'ARS',
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new CartRequestError(response.status, bodyText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return (json?.data ?? json) as T;
}

function mapItem(item: NonNullable<ApiCart['items']>[number], metaMap: Record<string, VariantMeta>): CartItem {
  const meta = metaMap[item.variant_id] ?? {};
  const unitPrice = Number(item.unit_price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  return {
    id: item.id,
    productName: meta.productName ?? 'Producto',
    thumbnail: meta.thumbnail,
    variantId: item.variant_id,
    variantTitle: meta.variantTitle,
    color: meta.color,
    size: meta.size,
    quantity,
    unitPrice,
    total: unitPrice * quantity,
    currency: 'ARS',
    triedOn3D: Boolean(item.tried_on_3d ?? meta.triedOn3D),
    maxStock: 99,
    outOfStock: false,
  };
}

function mapCartToSnapshot(cart: ApiCart): CartSnapshot {
  const metaMap = readVariantMeta();
  const items = (cart.items ?? []).map((item) => mapItem(item, metaMap));
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  return {
    cartId: cart.id,
    localCartId: readCartId(),
    items,
    subtotal,
    total: subtotal,
    currency: cart.currency ?? 'ARS',
  };
}

export async function initOrRetrieveCartAction() {
  const localCartId = readCartId();
  const query = localCartId ? `?cartId=${encodeURIComponent(localCartId)}` : '';
  const cart = await request<ApiCart>(`/api/cart${query}`, { method: 'GET' });
  writeCartId(cart.id);
  return mapCartToSnapshot(cart);
}

export async function addItemAction(
  variantId: string,
  quantity: number,
  triedOn3D: boolean,
  cartId?: string,
  meta?: VariantMeta,
) {
  if (meta) {
    upsertVariantMeta(variantId, { ...meta, triedOn3D });
  }

  const resolveCartId = async () => {
    if (cartId && isUuid(cartId)) return cartId;
    const local = readCartId();
    if (local) return local;
    return (await initOrRetrieveCartAction()).cartId;
  };

  const postAddItem = async (targetCartId: string) => {
    const cart = await request<ApiCart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ cartId: targetCartId, variantId, quantity }),
    });
    writeCartId(cart.id);
    return mapCartToSnapshot(cart);
  };

  const initialCartId = await resolveCartId();

  try {
    return await postAddItem(initialCartId);
  } catch (error) {
    // Recover when cart id is stale/invalid or cart was removed server-side.
    if (error instanceof CartRequestError && [400, 404, 409, 422, 500].includes(error.status)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      const recovered = await initOrRetrieveCartAction();
      return postAddItem(recovered.cartId);
    }
    throw error;
  }
}

export async function updateQuantityAction(cartId: string, itemId: string, quantity: number) {
  const cart = await request<ApiCart>(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ cartId, quantity }),
  });
  writeCartId(cart.id);
  return mapCartToSnapshot(cart);
}

export async function removeItemAction(cartId: string, itemId: string) {
  await request(`/api/cart/items/${itemId}?cartId=${encodeURIComponent(cartId)}`, {
    method: 'DELETE',
  });
  const refreshed = await request<ApiCart>(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
    method: 'GET',
  });
  writeCartId(refreshed.id);
  return mapCartToSnapshot(refreshed);
}

export async function clearCartAction(cartId: string) {
  const current = await request<ApiCart>(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
    method: 'GET',
  });
  const ids = (current.items ?? []).map((item) => item.id);
  await Promise.all(ids.map((id) =>
    request(`/api/cart/items/${id}?cartId=${encodeURIComponent(cartId)}`, { method: 'DELETE' })
  ));
  const refreshed = await request<ApiCart>(`/api/cart?cartId=${encodeURIComponent(cartId)}`, {
    method: 'GET',
  });
  writeCartId(refreshed.id);
  return mapCartToSnapshot(refreshed);
}

export async function mergeGuestCartAction(_customerId: string) {
  const guestCartId = readCartId();
  if (!guestCartId) return { merged: false, cartId: null };
  const cart = await request<ApiCart>('/api/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ guestCartId }),
  });
  writeCartId(cart.id);
  return { merged: true, cartId: cart.id };
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
