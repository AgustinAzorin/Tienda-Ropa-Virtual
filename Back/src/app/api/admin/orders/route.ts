import { type NextRequest } from 'next/server';
import { adminService } from '@/modules/admin/admin.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    await requireUserId(request);
    const status   = request.nextUrl.searchParams.get('status') ?? undefined;
    const orders   = await adminService.listOrdersByStatus(status);
    return ok(orders);
  } catch (err) {
    return handleError(err);
  }
}
