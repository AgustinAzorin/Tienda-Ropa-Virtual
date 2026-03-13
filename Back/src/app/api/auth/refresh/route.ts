import { type NextRequest } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** POST /api/auth/refresh  { refreshToken: string } → new tokens */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_TOKEN', message: 'refreshToken requerido' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const tokens = await authService.refreshSession(refreshToken);
    const response = ok(tokens);
    response.cookies.set('auth_session', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (err) {
    return handleError(err);
  }
}
