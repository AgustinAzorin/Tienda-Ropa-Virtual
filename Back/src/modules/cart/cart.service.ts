import { CartRepository } from './cart.repository';
import { CatalogRepository } from '@/modules/catalog/catalog.repository';
import { StockError, NotFoundError } from '@/lib/errors';
import type { ICartService, CartTotals } from './interfaces/ICartService';
import type { CartWithItems } from './interfaces/ICartRepository';

export class CartService implements ICartService {
  constructor(
    private readonly repo   = new CartRepository(),
    private readonly catalog = new CatalogRepository(),
  ) {}

  async getOrCreateCart(userId: string | null, sessionId: string | null): Promise<CartWithItems> {
    if (userId) {
      return (await this.repo.findActiveByUserId(userId))
          ?? (await this.repo.create(userId, null)).then
          ?? this._create(userId, null);
    }
    if (sessionId) {
      return (await this.repo.findActiveBySession(sessionId))
          ?? this._create(null, sessionId);
    }
    return this._create(null, null);
  }

  private async _create(userId: string | null, sessionId: string | null): Promise<CartWithItems> {
    const cart = await this.repo.create(userId, sessionId);
    return { ...cart, items: [] };
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<CartWithItems> {
    const stock = await this.catalog.getVariantStock(variantId);
    if (stock < quantity) {
      const variant = await this.catalog.findVariantBySku(variantId) ?? { sku: variantId };
      throw new StockError(variant.sku ?? variantId);
    }
    // Fetch current price from the product (variant override or product price)
    const [variant] = await import('@/db/client').then(({ db }) =>
      db.select().from((await import('@/db/schema')).productVariants)
        .where((await import('drizzle-orm')).eq((await import('@/db/schema')).productVariants.id, variantId))
        .limit(1)
    );
    const unitPrice = Number(variant?.price_override ?? 0);
    await this.repo.addItem(cartId, { variantId, quantity, unitPrice });
    return this.getCart(cartId);
  }

  async updateItemQuantity(_cartId: string, itemId: string, quantity: number): Promise<CartWithItems> {
    if (quantity <= 0) {
      await this.repo.removeItem(itemId);
    } else {
      await this.repo.updateItemQuantity(itemId, quantity);
    }
    return this.getCart(_cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<CartWithItems> {
    await this.repo.removeItem(itemId);
    return this.getCart(cartId);
  }

  async markItemTriedOn3d(itemId: string): Promise<void> {
    await this.repo.markItemTriedOn3d(itemId);
  }

  async calculateTotals(cartId: string): Promise<CartTotals> {
    const cart = await this.getCart(cartId);
    const subtotal = cart.items.reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0);
    return { subtotal, discount: 0, total: subtotal, currency: cart.currency };
  }

  async abandonCart(cartId: string): Promise<void> {
    await this.repo.setStatus(cartId, 'abandoned');
  }

  async mergeOnLogin(sessionId: string, userId: string): Promise<CartWithItems> {
    await this.repo.mergeGuestCart(sessionId, userId);
    return (await this.repo.findActiveByUserId(userId))!;
  }

  private async getCart(cartId: string): Promise<CartWithItems> {
    const cart = await this.repo.findById(cartId);
    if (!cart) throw new NotFoundError('Carrito');
    return cart;
  }
}

export const cartService = new CartService();
