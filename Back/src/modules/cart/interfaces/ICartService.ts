import type { CartWithItems } from './ICartRepository';

export interface CartTotals {
  subtotal:  number;
  discount:  number;
  total:     number;
  currency:  string;
}

export interface ICartService {
  getOrCreateCart(userId: string | null, sessionId: string | null): Promise<CartWithItems>;
  addItem(cartId: string, variantId: string, quantity: number, userId?: string): Promise<CartWithItems>;
  updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartWithItems>;
  removeItem(cartId: string, itemId: string): Promise<CartWithItems>;
  markItemTriedOn3d(itemId: string): Promise<void>;
  calculateTotals(cartId: string): Promise<CartTotals>;
  abandonCart(cartId: string): Promise<void>;
  mergeOnLogin(sessionId: string, userId: string): Promise<CartWithItems>;
}
