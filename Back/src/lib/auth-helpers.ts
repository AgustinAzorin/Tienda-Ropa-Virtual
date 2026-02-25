import { type NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { UnauthorizedError } from '@/lib/errors';

/**
 * Extrae y verifica el access token (Bearer) del header Authorization.
 * Lanza UnauthorizedError si falta o es inválido.
 */
export async function requireUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) throw new UnauthorizedError('Token no proporcionado');

  const token = authHeader.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    return payload.sub;
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}

/**
 * Como requireUserId pero devuelve null en lugar de lanzar para rutas opcionales.
 */
export async function optionalUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}

