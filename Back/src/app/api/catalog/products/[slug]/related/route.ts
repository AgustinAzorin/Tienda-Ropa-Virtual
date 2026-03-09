import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await catalogService.getProductBySlug(slug);
    const related = await catalogService.getRelatedProducts(product.id);
    return ok(related);
  } catch (err) {
    return handleError(err);
  }
}
