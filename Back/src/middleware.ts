import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Paths that don't require authentication */
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/callback',
  '/api/auth/reset-password',
  '/api/catalog',
  '/api/social/feed/discovery',
];

/**
 * Next.js edge middleware:
 * - Validates the Supabase session on all /api/* routes except public paths.
 * - Attaches the user to the request headers so Route Handlers can trust it.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-API routes and public endpoints
  if (!pathname.startsWith('/api')) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' } },
      { status: 401 }
    );
  }

  // Forward the user id so Route Handlers can consume it without re-querying Auth
  const headers = new Headers(request.headers);
  headers.set('x-user-id', user.id);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/api/:path*'],
};
