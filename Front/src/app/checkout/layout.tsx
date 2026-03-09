import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import Link from 'next/link';

const STEPS = ['Direccion', 'Envio', 'Pago', 'Confirmacion'];

function stepFromPath(pathname: string) {
  if (pathname.includes('/checkout/direccion')) return 1;
  if (pathname.includes('/checkout/envio')) return 2;
  if (pathname.includes('/checkout/pago')) return 3;
  return 4;
}

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  // Layout simplificado: logo + seguridad.
  const fallbackStep = 1;
  return (
    <div className="min-h-dvh bg-[#0D0A08]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0A08]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/home" className="font-display text-2xl italic">ANYA</Link>
          <p className="text-sm text-[#F5F0E8]/75">Compra segura</p>
          <Link href="/carrito" className="text-sm text-[#F5F0E8]/65">Salir</Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-4">
        <CheckoutProgress currentStep={fallbackStep} steps={STEPS} />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
