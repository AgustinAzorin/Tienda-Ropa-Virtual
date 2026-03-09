import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    const page       = Number(request.nextUrl.searchParams.get('page') ?? 1);
    const per_page   = Number(request.nextUrl.searchParams.get('per_page') ?? 20);
    const products   = await catalogService.getByCategory(categoryId);
    const start = (page - 1) * per_page;
    const items = products.slice(start, start + per_page);
    return ok({ items, total: products.length, page, per_page });
  } catch (err) {
    return handleError(err);
  }
}
