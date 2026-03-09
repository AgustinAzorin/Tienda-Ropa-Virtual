'use server';

import { createClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/cart/types';

export async function syncCartSnapshotWithSupabase(params: {
  medusaCartId: string;
  currency: string;
  items: CartItem[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cartRow, error: cartError } = await supabase
    .from('carts')
    .upsert(
      {
        user_id: user?.id ?? null,
        session_id: user ? null : 'guest-session',
        status: 'active',
        medusa_cart_id: params.medusaCartId,
        currency: params.currency,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'medusa_cart_id' },
    )
    .select('id')
    .single();

  if (cartError) throw new Error(cartError.message);

  await supabase.from('cart_items').delete().eq('cart_id', cartRow.id);

  if (params.items.length > 0) {
    const rows = params.items.map((item) => ({
      cart_id: cartRow.id,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tried_on_3d: item.triedOn3D,
    }));

    const { error: itemsError } = await supabase.from('cart_items').insert(rows);
    if (itemsError) throw new Error(itemsError.message);
  }

  return cartRow.id as string;
}
