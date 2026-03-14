import { type NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_session';
const ONBOARDING_COOKIE = 'onboarding_done';

/**
 * Middleware del Front.
 *
 * Reglas:
 * 1. `/`                  → público para invitados; autenticados completos van a /home
 * 2. `/auth/*`            → accesible siempre (excepto si ya está autenticado + onboarding completo)
 * 3. `/onboarding/*`      → requiere estar autenticado, sino → /auth/login
 * 4. NUNCA redirige automáticamente a /onboarding/perfil desde el middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === '1';
  const onboardingDone  = request.cookies.get(ONBOARDING_COOKIE)?.value === '1';

  // 1. En `/`, invitados ven landing; autenticados completos van directo a inicio
  if (pathname === '/') {
    if (isAuthenticated && onboardingDone) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // 2. Si autenticado con onboarding completo intenta ir a /auth/* o /onboarding/* → /home
  if (isAuthenticated && onboardingDone && (
    pathname.startsWith('/auth') || pathname.startsWith('/onboarding')
  )) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 3. Proteger /onboarding/* — requiere auth
  if (pathname.startsWith('/onboarding') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

