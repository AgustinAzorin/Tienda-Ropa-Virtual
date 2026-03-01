import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const sp      = request.nextUrl.searchParams;
    const params  = {
      search:     sp.get('search') ?? undefined,
      brandId:    sp.get('brandId') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      minPrice:   sp.has('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice:   sp.has('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      inStock:    sp.get('inStock') === 'true',
      sortBy:     (sp.get('sortBy') as 'created_at' | 'price' | 'name') ?? 'created_at',
      order:      (sp.get('order') as 'asc' | 'desc') ?? 'desc',
      page:       sp.has('page') ? Number(sp.get('page')) : 1,
      per_page:   sp.has('per_page') ? Number(sp.get('per_page')) : 20,
    };
    const products = await catalogService.list(params);
    const response = ok(products);
    // Public catalog data — cache for 60s, revalidate in background for 5min
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (err) {
    return handleError(err);
  }
}
