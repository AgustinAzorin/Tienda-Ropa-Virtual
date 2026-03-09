'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingOptions } from '@/components/checkout/ShippingOptions';
import { useCartStore } from '@/lib/stores/cartStore';
import { listShippingOptionsAction, setShippingMethodAction } from '@/lib/medusa/cartHelpers';

export default function CheckoutEnvioPage() {
  const router = useRouter();
  const { cartId } = useCartStore();
  const [selectedId, setSelectedId] = useState<string | null>('ship-standard');
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => [
    { id: 'ship-standard', name: 'Envio estandar', amount: 0, eta: '3-5 dias habiles' },
    { id: 'ship-express', name: 'Envio express', amount: 3499, eta: '1-2 dias habiles' },
  ], []);

  const submit = async () => {
    if (!cartId || !selectedId) return;
    setLoading(true);
    try {
      await setShippingMethodAction(cartId, selectedId);
      router.push('/checkout/pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="space-y-3">
        <h1 className="font-display text-4xl italic">Metodo de envio</h1>
        <ShippingOptions options={options} selectedId={selectedId} onSelect={setSelectedId} />
        <p className="text-sm text-[#F5F0E8]/65">Llegara entre el martes y jueves.</p>
        <button type="button" className="rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-[#0D0A08]" onClick={submit} disabled={loading}>
          {loading ? 'Guardando...' : 'Continuar al pago'}
        </button>
      </section>
      <aside className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#F5F0E8]/70">
        El envio seleccionado se suma al total en el siguiente paso.
      </aside>
    </main>
  );
}
