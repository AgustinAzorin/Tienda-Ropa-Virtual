import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { AppError } from '@/lib/errors';
import { __resetRateLimitStoreForTests, enforceRateLimit } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    __resetRateLimitStoreForTests();
  });

  it('permite requests dentro de la ventana', () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });

    expect(() => enforceRateLimit(req, { keyPrefix: 'k', limit: 2, windowMs: 1_000 })).not.toThrow();
    expect(() => enforceRateLimit(req, { keyPrefix: 'k', limit: 2, windowMs: 1_000 })).not.toThrow();
  });

  it('bloquea al superar el limite con 429', () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });

    enforceRateLimit(req, { keyPrefix: 'k', limit: 1, windowMs: 1_000 });

    try {
      enforceRateLimit(req, { keyPrefix: 'k', limit: 1, windowMs: 1_000 });
      throw new Error('expected rate-limit error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('RATE_LIMITED');
      expect((error as AppError).statusCode).toBe(429);
    }
  });

  it('resetea contador al cambiar de ventana temporal', () => {
    vi.useFakeTimers();

    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '8.8.8.8' },
    });

    enforceRateLimit(req, { keyPrefix: 'k', limit: 1, windowMs: 500 });
    vi.advanceTimersByTime(501);

    expect(() => enforceRateLimit(req, { keyPrefix: 'k', limit: 1, windowMs: 500 })).not.toThrow();

    vi.useRealTimers();
  });

  it('aísla bucket por endpoint keyPrefix', () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '9.9.9.9' },
    });

    enforceRateLimit(req, { keyPrefix: 'a', limit: 1, windowMs: 1_000 });
    expect(() => enforceRateLimit(req, { keyPrefix: 'b', limit: 1, windowMs: 1_000 })).not.toThrow();
  });

  it('aísla bucket por IP', () => {
    const reqA = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });
    const reqB = new NextRequest('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });

    enforceRateLimit(reqA, { keyPrefix: 'k', limit: 1, windowMs: 1_000 });
    expect(() => enforceRateLimit(reqB, { keyPrefix: 'k', limit: 1, windowMs: 1_000 })).not.toThrow();
  });
});
