import { type NextRequest } from 'next/server';
import { pricingService } from '@/modules/pricing/pricing.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }      = await params;
    const installments = Number(request.nextUrl.searchParams.get('installments') ?? 12);
    const result      = await pricingService.calculateInstallments(id, installments);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
