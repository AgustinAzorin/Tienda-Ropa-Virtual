import Link from 'next/link';
import { OrderTimeline } from '@/components/checkout/OrderTimeline';

export default async function OrdenDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-sm text-[#F5F0E8]/65">Orden #{id}</p>
          <h1 className="font-display text-4xl italic">Estado de tu pedido</h1>
          <span className="mt-2 inline-block rounded-full bg-[#C9A84C]/15 px-3 py-1 text-xs text-[#C9A84C]">Pagado</span>
        </header>

        <OrderTimeline
          items={[
            { label: 'Pago confirmado', done: true },
            { label: 'Preparando tu pedido', done: false, current: true },
            { label: 'En camino', done: false },
            { label: 'Entregado', done: false },
          ]}
        />

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-[#F5F0E8]/70">Acciones</p>
          <div className="mt-2 flex gap-2">
            <Link href={`/devoluciones/${id}`} className="rounded-xl border border-[#D4614A]/55 px-4 py-2 text-sm text-[#D4614A]">Solicitar devolucion</Link>
            <Link href="/soporte" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-[#F5F0E8]/70">Necesito ayuda</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
