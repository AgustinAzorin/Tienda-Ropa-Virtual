import { db } from '@/db/client';
import { orders, orderItems } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Order } from '@/models/ecommerce/Order';
import type { OrderItem } from '@/models/ecommerce/OrderItem';
import type { IOrderRepository, CreateOrderDto, OrderWithItems } from './interfaces/IOrderRepository';

export class OrderRepository implements IOrderRepository {

  async findById(id: string): Promise<OrderWithItems | null> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, id));
    return { ...(order as Order), items: items as OrderItem[] };
  }

  async listByUser(userId: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(sql`${orders.created_at} DESC`) as Promise<Order[]>;
  }

  async create(dto: CreateOrderDto & { totalAmount: number; medusaOrderId?: string }): Promise<Order> {
    const [row] = await db.insert(orders).values({
      user_id:             dto.userId,
      status:              'pending',
      total_amount:        String(dto.totalAmount),
      currency:            dto.currency,
      shipping_address_id: dto.shippingAddressId,
      medusa_order_id:     dto.medusaOrderId ?? null,
    }).returning();
    return row as Order;
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const [row] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return row as Order;
  }

  async addItems(orderId: string, items: Omit<OrderItem, 'id' | 'order_id'>[]): Promise<OrderItem[]> {
    const rows = await db.insert(orderItems).values(
      items.map((i) => ({ ...i, order_id: orderId, unit_price: String(i.unit_price) }))
    ).returning();
    return rows as OrderItem[];
  }
}
