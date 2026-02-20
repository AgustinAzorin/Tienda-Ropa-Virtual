import { db } from '@/db/client';
import { returns, orders } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { Return } from '@/models/ecommerce/Return';
import { OrderRepository } from '@/modules/orders/orders.repository';
import type { IReturnRepository, CreateReturnDto, ReturnMetrics } from './interfaces/IReturnRepository';
export class ReturnRepository implements IReturnRepository {

  async create(dto: CreateReturnDto): Promise<Return> {
    const [row] = await db.insert(returns).values({
      order_id:                  dto.orderId,
      reason:                    dto.reason,
      reason_category:           dto.reasonCategory ?? null,
      tried_3d_before_purchase:  dto.tried3dBeforePurchase,
    }).returning();
    return row as unknown as Return;
  }

  async findById(id: string): Promise<Return | null> {
    const [row] = await db.select().from(returns).where(eq(returns.id, id)).limit(1);
    return (row as unknown as Return) ?? null;
  }

  async listByOrder(orderId: string): Promise<Return[]> {
    return db.select().from(returns).where(eq(returns.order_id, orderId)) as Promise<Return[]>;
  }

  async updateStatus(id: string, status: Return['status']): Promise<Return> {
    const [row] = await db.update(returns).set({ status }).where(eq(returns.id, id)).returning();
    return row as unknown as Return;
  }

  async getMetrics(): Promise<ReturnMetrics> {
    const rows = await db.select({
      tried_3d:       returns.tried_3d_before_purchase,
      count:          sql<number>`count(*)`,
      avg_order_value:sql<number>`avg(${orders.total_amount})`,
    })
    .from(returns)
    .innerJoin(orders, eq(orders.id, returns.order_id))
    .groupBy(returns.tried_3d_before_purchase);

    const withTryon    = rows.find((r) => r.tried_3d) ?? { count: 0, avg_order_value: 0 };
    const withoutTryon = rows.find((r) => !r.tried_3d) ?? { count: 0, avg_order_value: 0 };
    return {
      with_tryon:    { count: Number(withTryon.count),    avg_order_value: Number(withTryon.avg_order_value)    },
      without_tryon: { count: Number(withoutTryon.count), avg_order_value: Number(withoutTryon.avg_order_value) },
    };
  }
}

export class ReturnService {
  constructor(
    private readonly repo      = new ReturnRepository(),
    private readonly orderRepo: { findById: (id: string) => Promise<{ status: string; user_id: string } | null> } = new OrderRepository(),
  ) {}

  async requestReturn(userId: string, dto: CreateReturnDto): Promise<Return> {
    const order = await this.orderRepo.findById(dto.orderId);
    if (!order || order.user_id !== userId) throw new Error('Orden no encontrada');
    if (order.status !== 'delivered') throw new Error('Solo se pueden devolver órdenes entregadas');
    return this.repo.create(dto);
  }

  async getReturn(id: string): Promise<Return> {
    const r = await this.repo.findById(id);
    if (!r) throw new Error('Devolución no encontrada');
    return r;
  }

  async listByOrder(orderId: string, userId: string): Promise<Return[]> {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.user_id !== userId) throw new Error('Orden no encontrada');
    return this.repo.listByOrder(orderId);
  }

  async getMetrics(): Promise<ReturnMetrics> {
    return this.repo.getMetrics();
  }
}

export const returnService = new ReturnService();
