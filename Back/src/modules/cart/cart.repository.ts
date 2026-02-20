import { db } from '@/db/client';
import { carts, cartItems } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { Cart } from '@/models/ecommerce/Cart';
import type { CartItem } from '@/models/ecommerce/CartItem';
import type { ICartRepository, AddCartItemDto, CartWithItems } from './interfaces/ICartRepository';

export class CartRepository implements ICartRepository {

  private async attachItems(cart: Cart): Promise<CartWithItems> {
    const items = await db.select().from(cartItems).where(eq(cartItems.cart_id, cart.id));
    return { ...cart, items: items as CartItem[] };
  }

  async findActiveByUserId(userId: string): Promise<CartWithItems | null> {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.user_id, userId), eq(carts.status, 'active'))).limit(1);
    return cart ? this.attachItems(cart as Cart) : null;
  }

  async findActiveBySession(sessionId: string): Promise<CartWithItems | null> {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.session_id, sessionId), eq(carts.status, 'active'))).limit(1);
    return cart ? this.attachItems(cart as Cart) : null;
  }

  async findById(cartId: string): Promise<CartWithItems | null> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
    return cart ? this.attachItems(cart as Cart) : null;
  }

  async create(userId: string | null, sessionId: string | null): Promise<Cart> {
    const [row] = await db.insert(carts).values({
      user_id:    userId,
      session_id: sessionId,
      status:     'active',
    }).returning();
    return row as Cart;
  }

  async addItem(cartId: string, dto: AddCartItemDto): Promise<CartItem> {
    // If the same variant already exists, increment quantity
    const [existing] = await db.select().from(cartItems)
      .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.variant_id, dto.variantId))).limit(1);
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: sql`${cartItems.quantity} + ${dto.quantity}` })
        .where(eq(cartItems.id, existing.id)).returning();
      return updated as CartItem;
    }
    const [row] = await db.insert(cartItems).values({
      cart_id:     cartId,
      variant_id:  dto.variantId,
      quantity:    dto.quantity,
      unit_price:  String(dto.unitPrice),
      tried_on_3d: dto.triedOn3d ?? false,
    }).returning();
    return row as CartItem;
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const [row] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId)).returning();
    return row as CartItem;
  }

  async removeItem(itemId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async markItemTriedOn3d(itemId: string): Promise<CartItem> {
    const [row] = await db.update(cartItems).set({ tried_on_3d: true }).where(eq(cartItems.id, itemId)).returning();
    return row as CartItem;
  }

  async setStatus(cartId: string, status: 'active' | 'abandoned' | 'converted'): Promise<void> {
    await db.update(carts).set({ status }).where(eq(carts.id, cartId));
  }

  async mergeGuestCart(guestSessionId: string, userId: string): Promise<void> {
    // Re-assign guest's cart items to the user's active cart
    const guestCart = await this.findActiveBySession(guestSessionId);
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await this.findActiveByUserId(userId);
    if (!userCart) {
      const created = await this.create(userId, null);
      userCart = { ...created, items: [] };
    }

    for (const item of guestCart.items) {
      await this.addItem(userCart.id, {
        variantId:  item.variant_id,
        quantity:   item.quantity,
        unitPrice:  Number(item.unit_price),
        triedOn3d:  item.tried_on_3d,
      });
    }
    await this.setStatus(guestCart.id, 'converted');
  }
}
