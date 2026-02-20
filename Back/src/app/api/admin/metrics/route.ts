import { type NextRequest } from 'next/server';
import { adminService } from '@/modules/admin/admin.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    await requireUserId(request);
    const days          = Number(request.nextUrl.searchParams.get('days') ?? 30);
    const [tryon, ret]  = await Promise.all([
      adminService.getTryonMetrics(days),
      adminService.getReturnMetrics(),
    ]);
    return ok({ tryon, returns: ret });
  } catch (err) {
    return handleError(err);
  }
}
