import { type NextRequest } from 'next/server';
import { adminService } from '@/modules/admin/admin.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    await requireUserId(request);
    const sp       = request.nextUrl.searchParams;
    const params   = {
      search:     sp.get('search') ?? undefined,
      brandId:    sp.get('brandId') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      page:       sp.has('page') ? Number(sp.get('page')) : 1,
      per_page:   sp.has('per_page') ? Number(sp.get('per_page')) : 50,
    };
    const { catalogService } = await import('@/modules/catalog/catalog.service');
    return ok(await catalogService.list(params));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUserId(request);
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('multipart/form-data')) {
      const fd      = await request.formData();
      const data    = JSON.parse(fd.get('data') as string);
      const product = await adminService.createProduct(data);
      return created(product);
    }
    const body    = await request.json();
    const product = await adminService.createProduct(body);
    return created(product);
  } catch (err) {
    return handleError(err);
  }
}
