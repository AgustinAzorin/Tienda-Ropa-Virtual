import { type NextRequest } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  try {
    const body = await request.json();
    if (url.searchParams.get('action') === 'register') {
      const result = await authService.register({ email: body.email, password: body.password, username: body.username });
      return created(result);
    }
    // Default: login
    const result = await authService.loginWithPassword({ email: body.email, password: body.password });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ?? '';
    await authService.logout(userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
