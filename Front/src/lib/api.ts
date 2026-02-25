/**
 * api.ts — Cliente fetch para comunicarse con el Back (http://localhost:3001).
 * Incluye el token Authorization e intenta refrescar automáticamente en 401.
 */

import { getAccessToken, refreshAccessToken, clearSession } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Intentar refrescar el token si recibimos 401
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    } else {
      clearSession();
      throw new ApiError(401, 'UNAUTHORIZED', 'Sesión expirada');
    }
  }

  if (!res.ok) {
    let errBody: { error?: { code?: string; message?: string } } = {};
    try { errBody = await res.json(); } catch { /* ignore */ }
    throw new ApiError(
      res.status,
      errBody.error?.code ?? 'API_ERROR',
      errBody.error?.message ?? `HTTP ${res.status}`,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  // El Back envuelve las respuestas en { data: ... }
  return (json?.data !== undefined ? json.data : json) as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code:   string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
