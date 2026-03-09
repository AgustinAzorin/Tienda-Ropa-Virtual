import { type NextRequest } from 'next/server';
import { pricingService } from '@/modules/pricing/pricing.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }  = await params;
    const price   = await pricingService.getCurrentPrice(id);
    return ok(price);
  } catch (err) {
    return handleError(err);
  }
}

/** Admin only – set a new price */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUserId(request);
    const { id } = await params;
    const body   = await request.json();
    const price  = await pricingService.setPrice(id, body);
    return created(price);
  } catch (err) {
    return handleError(err);
  }
}
