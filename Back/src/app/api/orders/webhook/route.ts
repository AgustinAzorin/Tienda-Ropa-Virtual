import { type NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/orders.service';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';

/** Receives Medusa order.* webhooks. Should be secured via HMAC signature in production. */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const medusaOrderId = event?.id ?? event?.data?.id;
    const status = event?.status ?? event?.data?.status;

    if (typeof medusaOrderId !== 'string' || medusaOrderId.trim() === '') {
      throw new ValidationError('Webhook invalido: id de orden requerido');
    }
    if (typeof status !== 'string' || status.trim() === '') {
      throw new ValidationError('Webhook invalido: status requerido');
    }

    await orderService.handleMedusaWebhook(medusaOrderId, status);
    return ok({ received: true });
  } catch (err) {
    return handleError(err);
  }
}
