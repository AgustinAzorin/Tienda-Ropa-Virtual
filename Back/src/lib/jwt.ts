import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface AccessTokenPayload {
  sub:   string; // userId
  email: string;
}

// ── Clave secreta ──────────────────────────────────────────────────────────
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido');
  return new TextEncoder().encode(secret);
}

// ── Access token (15 minutos) ──────────────────────────────────────────────
export async function signAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

/**
 * Verifica el access token.
 * Lanza un error si el token es inválido o expiró.
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('Token structure invalid');
  }
  return { sub: payload.sub, email: payload.email };
}

// ── Refresh token (valor opaco — guardamos el hash en la DB) ──────────────
/**
 * Genera un refresh token opaco (UUID v4).
 * El llamador debe hashear y persistir en refresh_tokens.
 */
export function generateRefreshToken(): string {
  return randomUUID();
}
