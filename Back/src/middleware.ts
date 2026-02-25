import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/** Orígenes permitidos (Front local + producción) */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.NEXT_PUBLIC_FRONT_URL ?? '',
].filter(Boolean);

/** Paths que no requieren autenticación */
const PUBLIC_PATHS = [
  '/api/auth',          // login, register, OAuth y todos los sub-endpoints
  '/api/catalog',
  '/api/social/feed/discovery',
];

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? '');
}

/** Agrega los headers CORS a una respuesta */
function withCors(response: NextResponse, origin: string): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * Next.js middleware:
 * - Maneja preflight CORS (OPTIONS) para todos los endpoints /api/*
 * - Verifica el JWT propio en rutas protegidas.
 * - Agrega x-user-id al header para que los Route Handlers lo consuman.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api')) return NextResponse.next();

  // Determinar el origen de la petición
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  const corsOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];

  // ── Preflight CORS ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }), corsOrigin);
  }

  // ── Rutas públicas (no requieren JWT) ────────────────────────────────────
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();
    return withCors(res, corsOrigin);
  }

  // ── Verificar JWT ─────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return withCors(
      NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' } },
        { status: 401 },
      ),
      corsOrigin,
    );
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub as string;

    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('x-user-id', userId);
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    return withCors(res, corsOrigin);
  } catch {
    return withCors(
      NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' } },
        { status: 401 },
      ),
      corsOrigin,
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};

