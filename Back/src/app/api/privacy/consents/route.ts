import { type NextRequest } from 'next/server';
import { privacyService } from '@/modules/privacy/privacy.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const status = await privacyService.getConsentStatus(userId);
    return ok(status);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body   = await request.json();
    const ip     = request.headers.get('x-forwarded-for') ?? undefined;
    const ua     = request.headers.get('user-agent') ?? undefined;
    await privacyService.recordConsent({ userId, ...body, ipAddress: ip, userAgent: ua });
    return created({ recorded: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    await privacyService.requestDataDeletion(userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
