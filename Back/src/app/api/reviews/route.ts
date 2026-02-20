import { type NextRequest } from 'next/server';
import { reviewService } from '@/modules/reviews/reviews.service';
import { requireUserId } from '@/lib/auth-helpers';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const fd     = await request.formData();
    const body   = JSON.parse(fd.get('data') as string);
    const files  = fd.getAll('images') as File[];
    const images = await Promise.all(files.map(async (f) => ({ buffer: await f.arrayBuffer() })));
    const review = await reviewService.createReview({ userId, ...body }, images);
    return created(review);
  } catch (err) {
    return handleError(err);
  }
}
