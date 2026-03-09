import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const limitMock = vi.fn();
const orderByMock = vi.fn(() => ({ limit: limitMock }));
const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
const innerJoinMock = vi.fn(() => ({ where: whereMock }));
const fromMock = vi.fn(() => ({ innerJoin: innerJoinMock }));
const selectMock = vi.fn(() => ({ from: fromMock }));

vi.mock('@/db/client', () => ({
  db: {
    select: selectMock,
  },
}));

vi.mock('@/db/schema', () => ({
  postProductTags: {
    product_id: 'tags.product_id',
    post_id: 'tags.post_id',
  },
  posts: {
    id: 'posts.id',
    user_id: 'posts.user_id',
    caption: 'posts.caption',
    type: 'posts.type',
    visibility: 'posts.visibility',
    like_count: 'posts.like_count',
    comment_count: 'posts.comment_count',
    created_at: 'posts.created_at',
  },
}));

const { GET } = await import('@/app/api/social/posts/by-product/[productId]/route');

describe('GET /api/social/posts/by-product/[productId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna paginacion con hasMore=true y nextCursor', async () => {
    limitMock.mockResolvedValue([
      { id: 'a', created_at: new Date('2026-02-03T10:00:00.000Z') },
      { id: 'b', created_at: new Date('2026-02-02T10:00:00.000Z') },
      { id: 'c', created_at: new Date('2026-02-01T10:00:00.000Z') },
    ]);

    const req = new NextRequest('http://localhost/api/social/posts/by-product/p1?limit=2', {
      headers: { 'x-forwarded-for': '20.20.20.20' },
    });

    const res = await GET(req, { params: Promise.resolve({ productId: 'p1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.hasMore).toBe(true);
    expect(json.meta.nextCursor).toBe('2026-02-02T10:00:00.000Z');
    expect(limitMock).toHaveBeenCalledWith(3);
  });

  it('rechaza cursor invalido', async () => {
    const req = new NextRequest('http://localhost/api/social/posts/by-product/p1?cursor=invalid', {
      headers: { 'x-forwarded-for': '21.21.21.21' },
    });

    const res = await GET(req, { params: Promise.resolve({ productId: 'p1' }) });

    expect(res.status).toBe(422);
  });

  it('rechaza limit invalido', async () => {
    const req = new NextRequest('http://localhost/api/social/posts/by-product/p1?limit=500', {
      headers: { 'x-forwarded-for': '22.22.22.22' },
    });

    const res = await GET(req, { params: Promise.resolve({ productId: 'p1' }) });

    expect(res.status).toBe(422);
  });

  it('aplica rate limit', async () => {
    limitMock.mockResolvedValue([]);

    const ip = '23.23.23.23';
    for (let i = 0; i < 120; i += 1) {
      const req = new NextRequest('http://localhost/api/social/posts/by-product/p1', {
        headers: { 'x-forwarded-for': ip },
      });
      const res = await GET(req, { params: Promise.resolve({ productId: 'p1' }) });
      expect(res.status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost/api/social/posts/by-product/p1', {
      headers: { 'x-forwarded-for': ip },
    });
    const blockedRes = await GET(blockedReq, { params: Promise.resolve({ productId: 'p1' }) });

    expect(blockedRes.status).toBe(429);
  });
});
