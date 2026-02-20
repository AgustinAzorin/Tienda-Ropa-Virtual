import { type NextRequest } from 'next/server';
import { profileService } from '@/modules/profile/profile.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId  = await requireUserId(request);
    const fd      = await request.formData();
    const file    = fd.get('file') as File;
    const buffer  = await file.arrayBuffer();
    const profile = await profileService.uploadAvatar(userId, buffer, file.name);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}
