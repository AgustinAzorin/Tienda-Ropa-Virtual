import { type NextRequest } from 'next/server';
import { notificationService } from '@/modules/notifications/notifications.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const list   = await notificationService.list(userId);
    return ok(list);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    if (body.markAllRead) {
      await notificationService.markAllRead(userId);
    } else if (body.id) {
      await notificationService.markRead(body.id, userId);
    }
    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}
