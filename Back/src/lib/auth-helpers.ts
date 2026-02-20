import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { UnauthorizedError } from '@/lib/errors';

function buildSupabaseFromToken(token: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Throws UnauthorizedError if the token is missing or invalid.
 */
export async function requireUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) throw new UnauthorizedError('Token no proporcionado');

  const token = authHeader.slice(7);
  const supabase = buildSupabaseFromToken(token);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new UnauthorizedError('Token inválido o expirado');
  return user.id;
}

/**
 * Like requireUserId but returns null instead of throwing for guest requests.
 */
export async function optionalUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const supabase = buildSupabaseFromToken(token);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
