'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { lazy, Suspense } from 'react';

const CartDrawer = lazy(() => import('@/components/cart/CartDrawer').then((mod) => ({ default: mod.CartDrawer })));

interface AppShellProps {
  children: React.ReactNode;
}

function DesktopNavbar() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-[rgba(255,255,255,0.08)] bg-[#0D0A08]/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/home" className="font-display text-2xl italic">ANYA</Link>
        <nav className="flex items-center gap-6 text-sm text-[#F5F0E8]/80">
          <Link href="/explorar" className="hover:text-[#F5F0E8]">Explorar</Link>
          <Link href="/catalogo" className="hover:text-[#F5F0E8]">Catalogo</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/wishlist" className="text-[#F5F0E8]/75 hover:text-[#F5F0E8]">Wishlist</Link>
          <Link href="/carrito" className="text-[#F5F0E8]/75 hover:text-[#F5F0E8]">Carrito</Link>
          <Link href="/perfil" className="rounded-full border border-[rgba(255,255,255,0.16)] px-2 py-1 text-xs">Perfil</Link>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: '/home', label: 'Inicio', icon: '🏠' },
    { href: '/explorar', label: 'Explorar', icon: '🔍' },
    { href: '/probador', label: 'Probador', icon: '🧍', special: true },
    { href: '/guardarropas', label: 'Guardarropas', icon: '👗' },
    { href: '/perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(255,255,255,0.08)] bg-[#0D0A08]/96 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[10px]"
              >
                <span
                  className={item.special
                    ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C] text-[#0D0A08]'
                    : active
                      ? 'text-[#C9A84C]'
                      : 'text-[#F5F0E8]/70'}
                >
                  {item.icon}
                </span>
                <span className={active ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/70'}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith('/auth')
    || pathname.startsWith('/onboarding')
    || pathname.startsWith('/probador')
    || pathname.startsWith('/checkout')
    || pathname.includes('/confirmacion');

  if (hideNav) return <>{children}</>;

  return (
    <>
      <DesktopNavbar />
      {children}
      <Suspense fallback={null}>
        <CartDrawer />
      </Suspense>
      <MobileNav />
    </>
  );
}
