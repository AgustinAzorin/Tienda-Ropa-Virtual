import { type NextRequest } from 'next/server';
import { bodyProfileService } from '@/modules/body-profile/body-profile.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId    = await requireUserId(request);
    const productId = request.nextUrl.searchParams.get('productId') ?? undefined;
    const suggestion = await bodyProfileService.suggestSize(userId, productId);
    return ok(suggestion);
  } catch (err) {
    return handleError(err);
  }
}
