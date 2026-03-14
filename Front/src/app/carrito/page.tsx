'use client';

import { useEffect, useState } from 'react';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { UpsellCarousel } from '@/components/cart/UpsellCarousel';
import { useCartStore } from '@/lib/stores/cartStore';

export default function CarritoPage() {
  const { items, itemCount, subtotal, total, initCart, updateQuantity, removeItem } = useCartStore();
  const [checkoutPressed, setCheckoutPressed] = useState(false);

  useEffect(() => {
    void initCart();
  }, [initCart]);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h1 className="mb-3 font-display text-4xl italic">Tu carrito ({itemCount} prendas)</h1>
          <div className="space-y-2">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                variant="page"
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {items.length <= 4 ? (
            <UpsellCarousel
              items={[
                { id: 'demo-1', name: 'Blazer estructurado', price: 79999 },
                { id: 'demo-2', name: 'Pantalon sastrero', price: 64999 },
                { id: 'demo-3', name: 'Camisa fluida', price: 52999 },
                { id: 'demo-4', name: 'Trench midi', price: 109999 },
              ]}
            />
          ) : null}
        </section>

        <CartSummary
          subtotal={subtotal}
          total={total}
          onStartCheckout={() => setCheckoutPressed(true)}
        />
      </div>

      {checkoutPressed ? (
        <p className="mt-4 text-center text-sm text-[#F5F0E8]/60">
          Proceed to Payment (placeholder)
        </p>
      ) : null}
    </main>
  );
}
