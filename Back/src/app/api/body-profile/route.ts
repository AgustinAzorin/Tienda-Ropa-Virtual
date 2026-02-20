import { type NextRequest } from 'next/server';
import { bodyProfileService } from '@/modules/body-profile/body-profile.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const profile = await bodyProfileService.getByUserId(userId);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    const profile = await bodyProfileService.upsert(userId, body);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    await bodyProfileService.delete(userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
