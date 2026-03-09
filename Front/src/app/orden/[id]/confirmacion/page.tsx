import Link from 'next/link';
import { ConfirmationHero } from '@/components/checkout/ConfirmationHero';
import { OrderTimeline } from '@/components/checkout/OrderTimeline';

export default async function OrdenConfirmacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <ConfirmationHero orderId={id} email="cliente@correo.com" />
        <OrderTimeline
          items={[
            { label: 'Pago confirmado', done: true, current: true },
            { label: 'Preparando tu pedido', done: false },
            { label: 'En camino', done: false },
            { label: 'Entregado', done: false },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Link href={`/orden/${id}`} className="rounded-xl border border-[#C9A84C] px-4 py-2 text-sm text-[#C9A84C]">Ver mi pedido</Link>
          <Link href="/catalogo" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-[#F5F0E8]/70">Seguir comprando</Link>
          <button className="rounded-xl border border-white/20 px-4 py-2 text-sm text-[#F5F0E8]/70">Compartir mi compra</button>
        </div>
      </div>
    </main>
  );
}
