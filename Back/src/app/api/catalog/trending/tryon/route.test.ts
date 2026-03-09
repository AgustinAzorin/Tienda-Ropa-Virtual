import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const limitMock = vi.fn();
const orderByMock = vi.fn(() => ({ limit: limitMock }));
const groupByMock = vi.fn(() => ({ orderBy: orderByMock }));
const whereMock = vi.fn(() => ({ groupBy: groupByMock }));
const innerJoinMock = vi.fn(() => ({ where: whereMock }));
const fromMock = vi.fn(() => ({ innerJoin: innerJoinMock }));
const selectMock = vi.fn(() => ({ from: fromMock }));

vi.mock('@/db/client', () => ({
  db: {
    select: selectMock,
  },
}));

vi.mock('@/db/schema', () => ({
  products: {
    id: 'products.id',
    slug: 'products.slug',
    name: 'products.name',
    has_3d_model: 'products.has_3d_model',
    is_active: 'products.is_active',
  },
  tryonSessions: {
    id: 'tryon.id',
    product_id: 'tryon.product_id',
    created_at: 'tryon.created_at',
  },
}));

const { GET } = await import('@/app/api/catalog/trending/tryon/route');

describe('GET /api/catalog/trending/tryon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitMock.mockResolvedValue([{ id: 'p1', tryon_count: 5 }]);
  });

  it('responde 200 con datos validos', async () => {
    const req = new NextRequest('http://localhost/api/catalog/trending/tryon?days=7&limit=12', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([{ id: 'p1', tryon_count: 5 }]);
    expect(limitMock).toHaveBeenCalledWith(12);
  });

  it('aplica clamp de limit maximo', async () => {
    const req = new NextRequest('http://localhost/api/catalog/trending/tryon?limit=999', {
      headers: { 'x-forwarded-for': '2.2.2.2' },
    });

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(limitMock).toHaveBeenCalledWith(50);
  });

  it('rechaza days no entero positivo', async () => {
    const req = new NextRequest('http://localhost/api/catalog/trending/tryon?days=abc', {
      headers: { 'x-forwarded-for': '3.3.3.3' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('aplica rate limit y devuelve 429', async () => {
    const ip = '4.4.4.4';

    for (let i = 0; i < 90; i += 1) {
      const req = new NextRequest('http://localhost/api/catalog/trending/tryon', {
        headers: { 'x-forwarded-for': ip },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost/api/catalog/trending/tryon', {
      headers: { 'x-forwarded-for': ip },
    });
    const blockedRes = await GET(blockedReq);

    expect(blockedRes.status).toBe(429);
  });
});
