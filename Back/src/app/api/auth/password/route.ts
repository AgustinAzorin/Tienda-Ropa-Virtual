import { type NextRequest } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const action = request.nextUrl.searchParams.get('action');
    if (action === 'update') {
      const result = await authService.updatePassword(body.password);
      return ok(result);
    }
    await authService.resetPasswordForEmail(body.email);
    return ok({ message: 'Email de recuperación enviado' });
  } catch (err) {
    return handleError(err);
  }
}
