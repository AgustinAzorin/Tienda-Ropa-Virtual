import { type NextRequest } from 'next/server';
import { returnService } from '@/modules/returns/returns.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(_request: NextRequest) {
  try {
    const metrics = await returnService.getMetrics();
    return ok(metrics);
  } catch (err) {
    return handleError(err);
  }
}
