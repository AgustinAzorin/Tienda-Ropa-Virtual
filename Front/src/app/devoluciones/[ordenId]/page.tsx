'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReturnItemSelector } from '@/components/returns/ReturnItemSelector';
import { ReturnReasonSelector } from '@/components/returns/ReturnReasonSelector';
import { TryonFeedbackCard } from '@/components/returns/TryonFeedbackCard';
import type { CartItem } from '@/lib/cart/types';

const demoItems: CartItem[] = [
  {
    id: '1',
    productName: 'Blazer estructurado',
    variantId: 'v1',
    quantity: 1,
    unitPrice: 79999,
    total: 79999,
    currency: 'ARS',
    triedOn3D: true,
  },
  {
    id: '2',
    productName: 'Camisa fluida',
    variantId: 'v2',
    quantity: 1,
    unitPrice: 52999,
    total: 52999,
    currency: 'ARS',
    triedOn3D: false,
  },
];

export default function DevolucionPage({ params }: { params: { ordenId: string } }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [tryon, setTryon] = useState<'yes' | 'no' | 'unknown'>('unknown');

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="font-display text-4xl italic">Solicitud de devolucion</h1>

        <ReturnItemSelector
          items={demoItems}
          selectedIds={selected}
          onToggle={(itemId) => {
            setSelected((prev) =>
              prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
            );
          }}
        />

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-sm text-[#F5F0E8]/75">Motivo de devolucion</p>
          <ReturnReasonSelector value={reason} onChange={setReason} />
        </div>

        <TryonFeedbackCard value={tryon} onChange={setTryon} />

        {reason === 'size' && tryon !== 'yes' ? (
          <div className="rounded-xl border border-[#C9A84C]/35 bg-[#C9A84C]/10 p-3 text-sm text-[#F5F0E8]/80">
            La proxima podes usar nuestro probador virtual para validar el talle antes de comprar.
            <a href="/probador" target="_blank" className="ml-2 text-[#C9A84C]">Ver como funciona</a>
          </div>
        ) : null}

        <button
          type="button"
          disabled={selected.length === 0 || !reason}
          onClick={() => router.push(`/orden/${params.ordenId}`)}
          className="rounded-xl bg-[#D4614A] px-4 py-3 text-sm font-semibold text-[#F5F0E8] disabled:opacity-40"
        >
          Confirmar devolucion
        </button>
      </div>
    </main>
  );
}
