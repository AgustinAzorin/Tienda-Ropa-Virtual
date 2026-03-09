import type { NextRequest } from 'next/server';
import { AppError } from './errors';

interface RateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowMs: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitState>();

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function enforceRateLimit(request: NextRequest, options: RateLimitOptions): void {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = `${options.keyPrefix}:${ip}`;

  const current = store.get(key);
  if (!current || now >= current.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.limit) {
    throw new AppError('RATE_LIMITED', 'Demasiadas solicitudes, intenta de nuevo en unos segundos', 429);
  }

  current.count += 1;
  store.set(key, current);
}

export function __resetRateLimitStoreForTests(): void {
  store.clear();
}
