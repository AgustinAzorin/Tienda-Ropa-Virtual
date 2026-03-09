'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CreditCardForm } from '@/components/checkout/CreditCardForm';
import { InstallmentSelector } from '@/components/checkout/InstallmentSelector';
import { useCartStore } from '@/lib/stores/cartStore';
import { completeCartAction, createPaymentSessionsAction, setPaymentSessionAction } from '@/lib/medusa/cartHelpers';
import type { InstallmentQuote } from '@/lib/installments/calculator';
import { formatPrice } from '@/lib/utils';

function humanizePaymentError(_error: unknown) {
  return 'Hubo un problema al procesar el pago. Espera unos segundos y volve a intentarlo.';
}

export default function CheckoutPagoPage() {
  const router = useRouter();
  const { cartId, total } = useCartStore();
  const [method, setMethod] = useState('mercado_pago');
  const [quote, setQuote] = useState<InstallmentQuote | null>(null);
  const [card, setCard] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useMemo(() => [
    { id: 'mercado_pago', label: 'Mercado Pago', description: 'Checkout externo seguro', badge: 'Hasta 12 cuotas sin interes' },
    { id: 'modo', label: 'MODO', description: 'Pago con QR o link' },
    { id: 'credit_card', label: 'Tarjeta de credito', description: 'Visa, Mastercard, Amex' },
    { id: 'debit_card', label: 'Tarjeta de debito', description: 'Pago en 1 cuota' },
    { id: 'bnpl', label: 'Compra ahora paga despues', description: 'Planes disponibles con CFT claro' },
  ], []);

  const confirm = async () => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    try {
      await createPaymentSessionsAction(cartId);
      await setPaymentSessionAction(cartId, method);
      const result = await completeCartAction(cartId);
      if (result?.type === 'order' && result.order?.id) {
        router.replace(`/orden/${result.order.id}/confirmacion`);
        return;
      }
      setError('Hubo un problema al procesar el pago. Espera unos segundos y volve a intentarlo.');
    } catch (err) {
      setError(humanizePaymentError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="space-y-3">
        <h1 className="font-display text-4xl italic">Pago</h1>
        <PaymentMethodSelector methods={methods} selectedId={method} onChange={setMethod} />

        {(method === 'credit_card' || method === 'debit_card') ? (
          <CreditCardForm values={card} onChange={setCard} disabled={loading} />
        ) : null}

        {method === 'credit_card' ? (
          <InstallmentSelector total={total} paymentMethod="credit_card" onChange={setQuote} />
        ) : null}

        {error ? <p className="rounded-xl border border-[#D4614A]/50 bg-[#D4614A]/15 p-3 text-sm text-[#F5F0E8]">{error}</p> : null}

        <button type="button" className="w-full rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-[#0D0A08]" onClick={confirm} disabled={loading}>
          {loading ? 'Procesando tu pago...' : `Confirmar y pagar ${formatPrice(total)}`}
        </button>
      </section>

      <aside className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="font-mono text-sm text-[#F5F0E8]/70">Subtotal: {formatPrice(total)}</p>
        <p className="font-mono text-sm text-[#F5F0E8]/70">Envio: {formatPrice(0)}</p>
        <p className="mt-2 font-mono text-2xl text-[#F5F0E8]">Total: {formatPrice(total)}</p>
        {quote ? <p className="mt-1 font-mono text-sm text-[#C9A84C]">{quote.installments} cuotas de {formatPrice(quote.amountPerInstallment)}</p> : null}
        <p className="font-mono text-xs text-[#F5F0E8]/60">CFT: {quote?.cft ?? 0}%</p>
      </aside>
    </main>
  );
}
