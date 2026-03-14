import { type NextRequest } from 'next/server';
import { pricingService } from '@/modules/pricing/pricing.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDailySeed() {
  return new Date().toISOString().slice(0, 10);
}

function resolveMockPrice(productId: string) {
  const seed = `${getDailySeed()}::${productId}`;
  const hash = hashString(seed);
  const min = 19000;
  const max = 139000;
  const step = 500;
  const steps = Math.floor((max - min) / step) + 1;
  return min + (hash % steps) * step;
}

function isMockProduct(productId: string) {
  return productId === 'mock-pantalon-001'
    || productId === 'mock-remera-001'
    || productId === 'mock-zapatillas-001';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }      = await params;
    const installments = Number(request.nextUrl.searchParams.get('installments') ?? 12);

    if (isMockProduct(id)) {
      const mockPrice = resolveMockPrice(id);
      const safeInstallments = Number.isInteger(installments) && installments > 0 ? installments : 3;
      return ok({
        installments: safeInstallments,
        amount_per_installment: Math.ceil(mockPrice / safeInstallments),
        total_amount: mockPrice,
        currency: 'ARS',
      });
    }

    const result      = await pricingService.calculateInstallments(id, installments);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
