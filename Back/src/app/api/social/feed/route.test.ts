import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getPersonalizedFeedMock = vi.fn();
const requireUserIdMock = vi.fn();

vi.mock('@/modules/social/posts/posts.repository', () => ({
  PostRepository: vi.fn().mockImplementation(() => ({
    getPersonalizedFeed: getPersonalizedFeedMock,
  })),
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireUserId: requireUserIdMock,
}));

const { GET } = await import('@/app/api/social/feed/route');

describe('GET /api/social/feed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserIdMock.mockResolvedValue('user-1');
  });

  it('retorna items y meta con nextCursor cuando hay mas', async () => {
    getPersonalizedFeedMock.mockResolvedValue([
      { id: '1', created_at: new Date('2026-01-05T10:00:00.000Z') },
      { id: '2', created_at: new Date('2026-01-04T10:00:00.000Z') },
      { id: '3', created_at: new Date('2026-01-03T10:00:00.000Z') },
    ]);

    const req = new NextRequest('http://localhost/api/social/feed?limit=2', {
      headers: { 'x-forwarded-for': '11.11.11.11' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.hasMore).toBe(true);
    expect(json.meta.limit).toBe(2);
    expect(json.meta.nextCursor).toBe('2026-01-04T10:00:00.000Z');
    expect(getPersonalizedFeedMock).toHaveBeenCalledWith('user-1', { cursor: undefined, limit: 3 });
  });

  it('retorna nextCursor null cuando no hay mas', async () => {
    getPersonalizedFeedMock.mockResolvedValue([
      { id: '1', created_at: '2026-01-05T10:00:00.000Z' },
    ]);

    const req = new NextRequest('http://localhost/api/social/feed?limit=2', {
      headers: { 'x-forwarded-for': '12.12.12.12' },
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.meta.hasMore).toBe(false);
    expect(json.meta.nextCursor).toBeNull();
  });

  it('rechaza cursor invalido', async () => {
    const req = new NextRequest('http://localhost/api/social/feed?cursor=nope', {
      headers: { 'x-forwarded-for': '13.13.13.13' },
    });

    const res = await GET(req);

    expect(res.status).toBe(422);
  });

  it('rechaza limit fuera de rango', async () => {
    const req = new NextRequest('http://localhost/api/social/feed?limit=0', {
      headers: { 'x-forwarded-for': '14.14.14.14' },
    });

    const res = await GET(req);

    expect(res.status).toBe(422);
  });

  it('aplica rate limit 60/min por IP', async () => {
    getPersonalizedFeedMock.mockResolvedValue([]);
    const ip = '15.15.15.15';

    for (let i = 0; i < 60; i += 1) {
      const req = new NextRequest('http://localhost/api/social/feed', {
        headers: { 'x-forwarded-for': ip },
      });
      const res = await GET(req);
      expect(res.status).toBe(200);
    }

    const blockedReq = new NextRequest('http://localhost/api/social/feed', {
      headers: { 'x-forwarded-for': ip },
    });
    const blockedRes = await GET(blockedReq);

    expect(blockedRes.status).toBe(429);
  });
});
