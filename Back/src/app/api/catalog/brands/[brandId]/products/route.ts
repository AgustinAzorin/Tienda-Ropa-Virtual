import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  try {
    const { brandId } = await params;
    const page     = Number(request.nextUrl.searchParams.get('page') ?? 1);
    const per_page = Number(request.nextUrl.searchParams.get('per_page') ?? 20);
    const products = await catalogService.listByBrand(brandId, { page, per_page });
    return ok(products);
  } catch (err) {
    return handleError(err);
  }
}
