import { type NextRequest } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

/** POST /api/auth/refresh  { refreshToken: string } → new tokens */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: { code: 'MISSING_TOKEN', message: 'refreshToken requerido' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const tokens = await authService.refreshSession(refreshToken);
    return ok(tokens);
  } catch (err) {
    return handleError(err);
  }
}
