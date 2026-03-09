'use client';

import { create } from 'zustand';
import type { CartItem } from '@/lib/cart/types';
import {
  addItemAction,
  clearCartAction,
  initOrRetrieveCartAction,
  mergeGuestCartAction,
  removeItemAction,
  updateQuantityAction,
} from '@/lib/medusa/cartHelpers';

interface CartStoreState {
  cartId: string | null;
  localCartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  isOpen: boolean;
  hasInteractedWithDrawer: boolean;
  initCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number, triedOn3D: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  markDrawerInteracted: () => void;
  mergeGuestCart: (customerId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function countItems(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  cartId: null,
  localCartId: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  isLoading: false,
  isOpen: false,
  hasInteractedWithDrawer: false,

  initCart: async () => {
    set({ isLoading: true });
    try {
      const snapshot = await initOrRetrieveCartAction();
      set({
        cartId: snapshot.cartId,
        localCartId: snapshot.localCartId,
        items: snapshot.items,
        subtotal: snapshot.subtotal,
        total: snapshot.total,
        itemCount: countItems(snapshot.items),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity, triedOn3D) => {
    set({ isLoading: true, isOpen: true, hasInteractedWithDrawer: false });
    try {
      const snapshot = await addItemAction(variantId, quantity, triedOn3D, get().cartId ?? undefined);
      set({
        cartId: snapshot.cartId,
        localCartId: snapshot.localCartId,
        items: snapshot.items,
        subtotal: snapshot.subtotal,
        total: snapshot.total,
        itemCount: countItems(snapshot.items),
      });

      setTimeout(() => {
        if (!get().hasInteractedWithDrawer) {
          set({ isOpen: false });
        }
      }, 3000);
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const { cartId, items } = get();
    if (!cartId) return;

    const optimistic = items
      .map((item) =>
        item.id === itemId
          ? { ...item, quantity, total: item.unitPrice * quantity }
          : item,
      )
      .filter((item) => item.quantity > 0);

    const optimisticSubtotal = optimistic.reduce((acc, item) => acc + item.total, 0);
    set({ items: optimistic, subtotal: optimisticSubtotal, total: optimisticSubtotal, itemCount: countItems(optimistic) });

    const snapshot = await updateQuantityAction(cartId, itemId, quantity);
    set({
      cartId: snapshot.cartId,
      localCartId: snapshot.localCartId,
      items: snapshot.items,
      subtotal: snapshot.subtotal,
      total: snapshot.total,
      itemCount: countItems(snapshot.items),
    });
  },

  removeItem: async (itemId) => {
    const { cartId, items } = get();
    if (!cartId) return;

    const optimistic = items.filter((item) => item.id !== itemId);
    const optimisticSubtotal = optimistic.reduce((acc, item) => acc + item.total, 0);
    set({ items: optimistic, subtotal: optimisticSubtotal, total: optimisticSubtotal, itemCount: countItems(optimistic) });

    const snapshot = await removeItemAction(cartId, itemId);
    set({
      cartId: snapshot.cartId,
      localCartId: snapshot.localCartId,
      items: snapshot.items,
      subtotal: snapshot.subtotal,
      total: snapshot.total,
      itemCount: countItems(snapshot.items),
    });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  markDrawerInteracted: () => set({ hasInteractedWithDrawer: true }),

  mergeGuestCart: async (customerId) => {
    const result = await mergeGuestCartAction(customerId);
    if (result.merged) {
      await get().initCart();
    }
  },

  clearCart: async () => {
    const { cartId } = get();
    if (!cartId) return;
    await clearCartAction(cartId);
    set({ items: [], itemCount: 0, subtotal: 0, total: 0 });
  },
}));
