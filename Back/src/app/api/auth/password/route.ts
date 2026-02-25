import { type NextRequest } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const action = request.nextUrl.searchParams.get('action');

    // Cambiar contraseña de usuario autenticado
    if (action === 'update') {
      const userId = await requireUserId(request);
      await authService.updatePassword(userId, body.password);
      return ok({ message: 'Contraseña actualizada' });
    }

    // Confirmar reset con token de recuperación (link del email)
    if (action === 'reset-confirm') {
      await authService.resetPasswordWithToken(body.token, body.password);
      return ok({ message: 'Contraseña actualizada' });
    }

    // Enviar email de recuperación (o en dev devolver token)
    await authService.sendPasswordReset(body.email);
    return ok({ message: 'Si el email existe, recibirás las instrucciones en breve' });
  } catch (err) {
    return handleError(err);
  }
}

