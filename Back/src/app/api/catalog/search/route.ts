import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    enforceRateLimit(request, { keyPrefix: 'catalog-search', limit: 120, windowMs: 60_000 });

    const q = (request.nextUrl.searchParams.get('q') ?? '').trim();
    if (q.length > 120) {
      throw new ValidationError('Busqueda demasiado larga (max 120 caracteres)');
    }

    const rawHas3dModel = request.nextUrl.searchParams.get('has3dModel');
    if (rawHas3dModel !== null && rawHas3dModel !== 'true' && rawHas3dModel !== 'false') {
      throw new ValidationError('has3dModel debe ser true o false');
    }
    const has3dModel = rawHas3dModel === 'true';

    const result = await catalogService.listProducts({
      q: q || undefined,
      has3dModel,
      page: 1,
      per_page: 24,
    });

    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
