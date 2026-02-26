import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
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
        const response = NextResponse.json(result, { status: 201 });
        // AÑADE ESTA LÍNEA AQUÍ
        response.cookies.set('auth_session', '1', {
          httpOnly: true, // Crucial: impide que JS lea la cookie (seguridad)
          secure: process.env.NODE_ENV === 'production', // true en producción
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 24 horas
        });
        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
    }

    // Default: login
      const result = await authService.loginWithPassword({
        email:    body.email,
        password: body.password,
      });
      const response = NextResponse.json(result);
      // AÑADE ESTA LÍNEA AQUÍ
      response.cookies.set('auth_session', '1', {
        httpOnly: true, // Crucial: impide que JS lea la cookie (seguridad)
        secure: process.env.NODE_ENV === 'production', // true en producción
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas
      });
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
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
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
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
      const response = NextResponse.redirect(url);
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }
    const response = NextResponse.json({ error: 'provider no soportado' }, { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (err) {
    return handleError(err);
  }
}

