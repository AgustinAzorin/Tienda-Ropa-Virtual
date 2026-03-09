'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { InstallmentSelector } from '@/components/checkout/InstallmentSelector';
import { formatPrice } from '@/lib/utils';
import type { InstallmentQuote } from '@/lib/installments/calculator';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    total,
    isOpen,
    closeCart,
    markDrawerInteracted,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const [quote, setQuote] = useState<InstallmentQuote | null>(null);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-50 bg-black/55 transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={closeCart}
      />

      <aside
        className={[
          'fixed top-0 right-0 z-[51] h-dvh w-full max-w-[420px] border-l border-white/10 bg-[#0D0A08] p-4 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        onMouseEnter={markDrawerInteracted}
        onClick={markDrawerInteracted}
        role="dialog"
        aria-modal="true"
      >
        <header className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-3xl italic text-[#F5F0E8]">Tu carrito</h2>
            <p className="text-sm text-[#F5F0E8]/65">{itemCount} items</p>
          </div>
          <button type="button" onClick={closeCart} className="rounded-lg border border-white/15 p-2 text-[#F5F0E8]/75 hover:bg-white/5" aria-label="Cerrar carrito">
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[45dvh] space-y-2 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#F5F0E8]/70">Tu carrito esta vacio.</p>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            ))
          )}
        </div>

        <section className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-[#F5F0E8]/80">Cuotas disponibles</h3>
          <InstallmentSelector total={total} paymentMethod="credit_card" onChange={setQuote} />
        </section>

        <section className="mt-4 border-t border-white/10 pt-4">
          <p className="font-mono text-sm text-[#F5F0E8]/70">Subtotal {formatPrice(subtotal)}</p>
          <p className="font-mono text-2xl font-semibold text-[#F5F0E8]">Total {formatPrice(total)}</p>
          {quote ? <p className="mt-1 font-mono text-xs text-[#F5F0E8]/60">{quote.installments} cuotas de {formatPrice(quote.amountPerInstallment)} · CFT {quote.cft}%</p> : null}

          <Link href="/checkout" className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-[#0D0A08] transition hover:bg-[#B8942E]">Ir al checkout</Link>
          <Link href="/catalogo" className="mt-2 block text-center text-sm text-[#F5F0E8]/55 hover:text-[#F5F0E8]/80">Seguir comprando</Link>
        </section>
      </aside>
    </>
  );
}
