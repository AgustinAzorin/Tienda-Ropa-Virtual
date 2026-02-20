import { type NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/orders.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

/** Receives Medusa order.* webhooks. Should be secured via HMAC signature in production. */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    await orderService.handleMedusaWebhook(event);
    return ok({ received: true });
  } catch (err) {
    return handleError(err);
  }
}
