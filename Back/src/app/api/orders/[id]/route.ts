import { type NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/orders.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    const order  = await orderService.getOrder(id, userId);
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    await orderService.cancelOrder(id, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
