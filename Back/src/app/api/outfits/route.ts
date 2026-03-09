import { type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth-helpers';
import { created, ok } from '@/lib/response';
import { handleError } from '@/lib/errors';
import { outfitsService } from '@/modules/outfits/outfits.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const outfits = await outfitsService.listByUser(userId);
    return ok(outfits);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = await request.json();
    const outfit = await outfitsService.create({
      userId,
      name: body.name,
      is_public: body.is_public,
      items: body.items ?? [],
    });

    return created(outfit);
  } catch (err) {
    return handleError(err);
  }
}
