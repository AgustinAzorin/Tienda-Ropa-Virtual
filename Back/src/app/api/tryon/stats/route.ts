import { type NextRequest } from 'next/server';
import { tryonService } from '@/modules/tryon/tryon.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const days  = Number(request.nextUrl.searchParams.get('days') ?? 30);
    const stats = await tryonService.getConversionStats(days);
    return ok(stats);
  } catch (err) {
    return handleError(err);
  }
}
