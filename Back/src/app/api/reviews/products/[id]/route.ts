import { type NextRequest } from 'next/server';
import { reviewService } from '@/modules/reviews/reviews.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }  = await params;
    const sp      = request.nextUrl.searchParams;
    const reviews = await reviewService.listProductReviews(id, {
      rating:    sp.has('rating')    ? Number(sp.get('rating'))    : undefined,
      fitRating: sp.get('fitRating') ?? undefined,
      page:      sp.has('page')      ? Number(sp.get('page'))      : 1,
      per_page:  sp.has('per_page')  ? Number(sp.get('per_page'))  : 20,
    });
    return ok(reviews);
  } catch (err) {
    return handleError(err);
  }
}
