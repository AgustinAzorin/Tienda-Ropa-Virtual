import { type NextRequest } from 'next/server';
import { profileService } from '@/modules/profile/profile.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Accept either UUID or username
    const profile = id.includes('-')
      ? await profileService.getById(id)
      : await profileService.getByUsername(id);
    return ok(profile);
  } catch (err) {
    return handleError(err);
  }
}
