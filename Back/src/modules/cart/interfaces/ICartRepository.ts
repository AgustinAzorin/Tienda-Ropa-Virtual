import type { Cart } from '@/models/ecommerce/Cart';
import type { CartItem } from '@/models/ecommerce/CartItem';

export interface AddCartItemDto {
  variantId:   string;
  quantity:    number;
  unitPrice:   number;
  triedOn3d?:  boolean;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
}

export interface ICartRepository {
  findActiveByUserId(userId: string): Promise<CartWithItems | null>;
  findActiveBySession(sessionId: string): Promise<CartWithItems | null>;
  findById(cartId: string): Promise<CartWithItems | null>;
  create(userId: string | null, sessionId: string | null): Promise<Cart>;
  addItem(cartId: string, dto: AddCartItemDto): Promise<CartItem>;
  updateItemQuantity(itemId: string, quantity: number): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
  markItemTriedOn3d(itemId: string): Promise<CartItem>;
  setStatus(cartId: string, status: 'active' | 'abandoned' | 'converted'): Promise<void>;
  mergeGuestCart(guestSessionId: string, userId: string): Promise<void>;
}
