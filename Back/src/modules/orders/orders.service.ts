import { OrderRepository } from './orders.repository';
import { CartRepository } from '@/modules/cart/cart.repository';
import { CatalogRepository } from '@/modules/catalog/catalog.repository';
import { NotFoundError, ForbiddenError, AppError } from '@/lib/errors';
import type { IOrderService } from './interfaces/IOrderService';
import type { Order } from '@/models/ecommerce/Order';
import type { OrderWithItems } from './interfaces/IOrderRepository';
import type { OrderItem } from '@/models/ecommerce/OrderItem';

export class OrderService implements IOrderService {
  constructor(
    private readonly repo    = new OrderRepository(),
    private readonly cartRepo = new CartRepository(),
    private readonly catalog  = new CatalogRepository(),
  ) {}

  async initCheckout(userId: string, cartId: string, shippingAddressId: string): Promise<OrderWithItems> {
    const cart = await this.cartRepo.findById(cartId);
    if (!cart || cart.user_id !== userId) throw new ForbiddenError('Carrito inválido');

    // Validate stock for each item
    for (const item of cart.items) {
      const stock = await this.catalog.getVariantStock(item.variant_id);
      if (stock < item.quantity) throw new AppError('INSUFFICIENT_STOCK', `Stock insuficiente`, 409);
    }

    const totalAmount = cart.items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);

    const order = await this.repo.create({
      userId, cartId, shippingAddressId, currency: cart.currency, totalAmount,
    });

    const itemsToInsert = cart.items.map((i) => ({
      variant_id:   i.variant_id,
      product_name: i.variant_id, // resolved later via join in reads
      quantity:     i.quantity,
      unit_price:   Number(i.unit_price),
    }));
    const insertedItems = await this.repo.addItems(order.id, itemsToInsert as Omit<OrderItem, 'id' | 'order_id'>[]);

    // Decrement stock
    for (const item of cart.items) {
      await this.catalog.decrementStock(item.variant_id, item.quantity);
    }

    // Mark cart as converted
    await this.cartRepo.setStatus(cartId, 'converted');

    return { ...order, items: insertedItems };
  }

  async getOrder(id: string, userId: string): Promise<OrderWithItems> {
    const order = await this.repo.findById(id);
    if (!order) throw new NotFoundError('Orden');
    if (order.user_id !== userId) throw new ForbiddenError();
    return order;
  }

  async listUserOrders(userId: string): Promise<Order[]> {
    return this.repo.listByUser(userId);
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.getOrder(id, userId);
    if (!['pending', 'paid'].includes(order.status)) {
      throw new AppError('INVALID_STATE', 'La orden no puede cancelarse en este estado', 400);
    }
    return this.repo.updateStatus(id, 'cancelled');
  }

  async handleMedusaWebhook(medusaOrderId: string, status: string): Promise<void> {
    // Map Medusa status to our internal status
    const statusMap: Record<string, Order['status']> = {
      completed:  'delivered',
      shipped:    'shipped',
      paid:       'paid',
      cancelled:  'cancelled',
    };
    const internalStatus = statusMap[status];
    if (!internalStatus) return;

    const { db } = await import('@/db/client');
    const { orders } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const [order] = await db.select({ id: orders.id }).from(orders)
      .where(eq(orders.medusa_order_id, medusaOrderId)).limit(1);
    if (order) await this.repo.updateStatus(order.id, internalStatus);
  }
}

export const orderService = new OrderService();
