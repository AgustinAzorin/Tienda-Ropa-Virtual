import { type NextRequest } from 'next/server';
import { profileService } from '@/modules/profile/profile.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId  = await requireUserId(request);
    const profile = await profileService.getById(userId);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    const profile = await profileService.update(userId, body);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    await profileService.deleteAccount(userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
