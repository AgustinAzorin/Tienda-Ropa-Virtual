import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const updateItemQuantityMock = vi.fn();
const removeItemMock = vi.fn();

vi.mock('@/modules/cart/cart.service', () => ({
  cartService: {
    updateItemQuantity: updateItemQuantityMock,
    removeItem: removeItemMock,
  },
}));

const { PUT, DELETE } = await import('@/app/api/cart/items/[id]/route');

describe('PUT /api/cart/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza item con payload valido', async () => {
    updateItemQuantityMock.mockResolvedValue({ id: 'cart-1', items: [] });

    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'PUT',
      body: JSON.stringify({ cartId: 'cart-1', quantity: 2 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'item-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({ id: 'cart-1', items: [] });
    expect(updateItemQuantityMock).toHaveBeenCalledWith('cart-1', 'item-1', 2);
  });

  it('rechaza si falta cartId', async () => {
    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 2 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(422);
  });

  it('rechaza quantity decimal', async () => {
    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'PUT',
      body: JSON.stringify({ cartId: 'cart-1', quantity: 2.5 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(422);
  });

  it('rechaza quantity negativa', async () => {
    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'PUT',
      body: JSON.stringify({ cartId: 'cart-1', quantity: -1 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(422);
  });

  it('propaga error de servicio como error de dominio', async () => {
    updateItemQuantityMock.mockRejectedValue(new Error('boom'));

    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'PUT',
      body: JSON.stringify({ cartId: 'cart-1', quantity: 2 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await PUT(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/cart/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('elimina item cuando cartId es valido', async () => {
    removeItemMock.mockResolvedValue({ id: 'cart-1', items: [] });

    const req = new NextRequest('http://localhost/api/cart/items/item-1?cartId=cart-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(204);
    expect(removeItemMock).toHaveBeenCalledWith('cart-1', 'item-1');
  });

  it('rechaza si falta cartId', async () => {
    const req = new NextRequest('http://localhost/api/cart/items/item-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(422);
  });

  it('propaga error del servicio', async () => {
    removeItemMock.mockRejectedValue(new Error('service-fail'));

    const req = new NextRequest('http://localhost/api/cart/items/item-1?cartId=cart-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: 'item-1' }) });

    expect(res.status).toBe(500);
  });
});
