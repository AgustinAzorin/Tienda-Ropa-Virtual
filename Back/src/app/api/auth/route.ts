import { type NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { handleError } from '@/lib/errors';
import { requireUserId } from '@/lib/auth-helpers';

/** Helper: set auth_session cookie on response */
function withAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set('auth_session', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}

/** POST /api/auth?action=register  → registro */
/** POST /api/auth                  → login con contraseña */
export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  try {
    const body = await request.json();

    if (url.searchParams.get('action') === 'register') {
      const result = await authService.register({
        email:    body.email,
        password: body.password,
      });
      return withAuthCookie(NextResponse.json(result, { status: 201 }));
    }

    // Default: login
    const result = await authService.loginWithPassword({
      email:    body.email,
      password: body.password,
    });
    return withAuthCookie(NextResponse.json(result));
  } catch (err) {
    return handleError(err);
  }
}

/** DELETE /api/auth → logout (revoca el refresh token enviado) */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json().catch(() => ({}));
    await authService.logout(userId, body?.refreshToken);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}

/** GET /api/auth?action=oauth&provider=google → redirige a OAuth */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') as 'google' | null;
  try {
    if (provider === 'google') {
      const { url } = await authService.loginWithOAuth('google');
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: 'provider no soportado' }, { status: 400 });
  } catch (err) {
    return handleError(err);
  }
}

