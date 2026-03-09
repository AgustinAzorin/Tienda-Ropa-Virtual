import { type NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { orders, orderItems, returns } from '@/db/schema';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError, NotFoundError, ForbiddenError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const userId = await requireUserId(request);
    const { orderId } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) throw new NotFoundError('Orden');
    if (order.user_id !== userId) throw new ForbiddenError('Esta orden no te pertenece');

    const [existingReturn] = await db
      .select()
      .from(returns)
      .where(eq(returns.order_id, orderId))
      .limit(1);

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.order_id, orderId));

    return ok({
      order,
      items,
      has_return: Boolean(existingReturn),
      return_status: existingReturn?.status ?? null,
      return_allowed: order.status === 'delivered' && !existingReturn,
    });
  } catch (err) {
    return handleError(err);
  }
}
