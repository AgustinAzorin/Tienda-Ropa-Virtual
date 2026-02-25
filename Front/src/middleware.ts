import { type NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'auth_session';
const ONBOARDING_COOKIE = 'onboarding_done';

/**
 * Middleware del Front.
 * Usa la cookie `auth_session=1` (establecida por el cliente tras el login)
 * para proteger rutas. La verificación real del JWT ocurre en el Back.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === '1';
  const onboardingDone = request.cookies.get(ONBOARDING_COOKIE)?.value === '1';

  // Proteger rutas de onboarding — redirigir al login si no autenticado
  if (pathname.startsWith('/onboarding') && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Evitar volver al onboarding cuando ya fue completado
  if (pathname.startsWith('/onboarding') && isAuthenticated && onboardingDone) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Redirigir usuarios autenticados fuera de las páginas de auth
  if (pathname.startsWith('/auth') && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = onboardingDone ? '/' : '/onboarding/perfil';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

