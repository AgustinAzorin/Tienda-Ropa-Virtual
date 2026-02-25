import { type NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';
import { requireUserId } from '@/lib/auth-helpers';

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
      return created(result);
    }

    // Default: login
    const result = await authService.loginWithPassword({
      email:    body.email,
      password: body.password,
    });
    return ok(result);
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

