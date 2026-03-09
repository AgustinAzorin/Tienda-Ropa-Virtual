import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const listUserOrdersMock = vi.fn();
const initCheckoutMock = vi.fn();
const requireUserIdMock = vi.fn();

vi.mock('@/modules/orders/orders.service', () => ({
  orderService: {
    listUserOrders: listUserOrdersMock,
    initCheckout: initCheckoutMock,
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireUserId: requireUserIdMock,
}));

const { GET, POST } = await import('@/app/api/orders/route');

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
  });

  it('lista ordenes del usuario autenticado', async () => {
    listUserOrdersMock.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);

    const req = new NextRequest('http://localhost/api/orders');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([{ id: 'o1' }, { id: 'o2' }]);
    expect(listUserOrdersMock).toHaveBeenCalledWith('user-1');
  });

  it('retorna error si auth falla', async () => {
    requireUserIdMock.mockRejectedValue(new Error('unauthorized'));

    const req = new NextRequest('http://localhost/api/orders');
    const res = await GET(req);

    expect(res.status).toBe(500);
  });
});

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
  });

  it('inicia checkout con payload valido', async () => {
    initCheckoutMock.mockResolvedValue({ id: 'o1', status: 'pending' });

    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ cartId: 'c1', shippingAddressId: 'a1' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data).toEqual({ id: 'o1', status: 'pending' });
    expect(initCheckoutMock).toHaveBeenCalledWith('user-1', 'c1', 'a1');
  });

  it('rechaza cuando falta cartId', async () => {
    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddressId: 'a1' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it('rechaza cuando falta shippingAddressId', async () => {
    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ cartId: 'c1' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
  });

  it('propaga errores del servicio', async () => {
    initCheckoutMock.mockRejectedValue(new Error('checkout-fail'));

    const req = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({ cartId: 'c1', shippingAddressId: 'a1' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
