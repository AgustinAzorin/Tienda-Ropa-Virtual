import { type NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/orders.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const orders = await orderService.listUserOrders(userId);
    return ok(orders);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    const order  = await orderService.initCheckout({ userId, ...body });
    return created(order);
  } catch (err) {
    return handleError(err);
  }
}
