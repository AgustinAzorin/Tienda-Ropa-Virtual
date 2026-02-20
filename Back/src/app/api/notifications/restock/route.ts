import { type NextRequest } from 'next/server';
import { notificationService } from '@/modules/notifications/notifications.service';
import { requireUserId } from '@/lib/auth-helpers';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId    = await requireUserId(request);
    const body      = await request.json();
    await notificationService.subscribeRestock(userId, body.variantId);
    return created({ subscribed: true });
  } catch (err) {
    return handleError(err);
  }
}
