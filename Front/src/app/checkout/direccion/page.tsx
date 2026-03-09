'use client';

import { useRouter } from 'next/navigation';
import { AddressForm, type AddressFormValues } from '@/components/checkout/AddressForm';
import { AddressCard } from '@/components/checkout/AddressCard';
import { useCartStore } from '@/lib/stores/cartStore';
import { setShippingAddressAction } from '@/lib/medusa/cartHelpers';

export default function CheckoutDireccionPage() {
  const router = useRouter();
  const { cartId } = useCartStore();

  const submit = async (values: AddressFormValues) => {
    if (!cartId) return;
    await setShippingAddressAction(cartId, {
      address_1: values.street,
      city: values.city,
      province: values.province,
      postal_code: values.postal_code,
      metadata: {
        alias: values.alias,
        number: values.number,
        floor: values.floor,
        apartment: values.apartment,
      },
    });
    router.push('/checkout/envio');
  };

  return (
    <main className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="space-y-3">
        <h1 className="font-display text-4xl italic">Direccion de envio</h1>
        <AddressCard alias="Casa" street="Av. Siempre Viva" number="742" city="CABA" province="Buenos Aires" selected onUse={() => router.push('/checkout/envio')} />
        <AddressForm onSubmit={submit} />
      </section>

      <aside className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-[#F5F0E8]/70">Paso 1 de 4</p>
        <p className="mt-2 text-sm text-[#F5F0E8]/70">Completa o selecciona una direccion para continuar.</p>
      </aside>
    </main>
  );
}
