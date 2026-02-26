import { createHash, randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { customUsers, refreshTokens, passwordResets, profiles } from '@/db/schema';
import { hashPassword, verifyPassword } from '@/lib/password';
import { signAccessToken, generateRefreshToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase/client';
import { AppError, UnauthorizedError, ConflictError } from '@/lib/errors';
import type {
  IAuthService, RegisterDto, LoginDto,
  AuthResult, AuthTokens,
} from './interfaces/IAuthService';

// ── Helpers ────────────────────────────────────────────────────────────────

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const ACCESS_TOKEN_SECS = 15 * 60;          // 15 minutos
const REFRESH_TOKEN_DAYS = 30;              // 30 días

async function issueTokens(userId: string, email: string, tx: any = db): Promise<AuthTokens> {
  const accessToken = await signAccessToken(userId, email);
  const refreshToken = generateRefreshToken();
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86_400_000);

  await tx.insert(refreshTokens).values({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_SECS };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms))
  ]);
}

// ── Servicio ───────────────────────────────────────────────────────────────

export class AuthService implements IAuthService {

  async register({ email, password }: RegisterDto): Promise<AuthResult> {
    // 1. Normaliza el email recibido
    const normalizedEmail = email.trim().toLowerCase();
    // 2. Verifica que no exista
    const existing = await db.select({ id: customUsers.id }).from(customUsers).where(eq(customUsers.email, normalizedEmail)).limit(1);
    if (existing.length > 0) throw new ConflictError('Este email ya está registrado');

    const passwordHash = await hashPassword(password);

    // 3. Transacción: Todo o nada
    return await db.transaction(async (tx) => {
      try {
        console.log('[REGISTER] Iniciando transacción');
        // Inserta usuario
        const [user] = await tx.insert(customUsers)
          .values({ email: normalizedEmail, password_hash: passwordHash })
          .returning({ id: customUsers.id, email: customUsers.email });
        console.log('[REGISTER] Usuario insertado:', user);

        // Inserta perfil
        const profileResult = await tx.insert(profiles).values({
          id: user.id,
          username: `user_${user.id.slice(0, 8)}`,
        });
        console.log('[REGISTER] Perfil insertado:', profileResult);

        // Genera los tokens usando la transacción
        const tokens = await issueTokens(user.id, user.email, tx);
        console.log('[REGISTER] Tokens generados:', tokens);
        return { user: { id: user.id, email: user.email }, tokens };
      } catch (err) {
        console.error('[REGISTER] Error en transacción:', err);
        throw err;
      }
    });
}

  async loginWithPassword({ email, password }: LoginDto): Promise<AuthResult> {
    // Normaliza el email recibido
    const normalizedEmail = email.trim().toLowerCase();
    console.log('[LOGIN] Email recibido:', email);
    console.log('[LOGIN] Email normalizado:', normalizedEmail);

    // Busca el usuario por email normalizado
    const [user] = await db
      .select()
      .from(customUsers)
      .where(eq(customUsers.email, normalizedEmail))
      .limit(1);

    if (!user) {
      console.log('[LOGIN] Usuario no encontrado para email:', normalizedEmail);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Compara el email de la DB con el email normalizado
    console.log('[LOGIN] Email en DB:', user.email);
    console.log('[LOGIN] ¿Coinciden?:', user.email === normalizedEmail);

    // Verifica la contraseña
    console.log('[LOGIN] Password recibido:', password);
    console.log('[LOGIN] Hash en DB:', user.password_hash);
    const valid = await verifyPassword(password, user.password_hash);
    console.log('[LOGIN] ¿Password válido?:', valid);
    if (!valid) {
      console.log('[LOGIN] Contraseña inválida para email:', normalizedEmail);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const tokens = await issueTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email }, tokens };
  }

  /** Mantener Google OAuth en paralelo — redirige a Supabase OAuth */
  async loginWithOAuth(provider: 'google'): Promise<{ url: string }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
    return { url: data.url };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revocar solo el refresh token específico
      const tokenHash = sha256(refreshToken);
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(
          and(
            eq(refreshTokens.user_id, userId),
            eq(refreshTokens.token_hash, tokenHash),
          ),
        );
    } else {
      // Revocar todos los refresh tokens del usuario
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.user_id, userId));
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = sha256(refreshToken);
    const now = new Date();

    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token_hash, tokenHash))
      .limit(1);

    if (!row || row.revoked || row.expires_at < now) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    // Obtener datos del usuario
    const [user] = await db
      .select({ id: customUsers.id, email: customUsers.email })
      .from(customUsers)
      .where(eq(customUsers.id, row.user_id))
      .limit(1);

    if (!user) throw new UnauthorizedError('Usuario no encontrado');

    // Rotar: revocar el viejo y emitir nuevo
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, row.id));

    return issueTokens(user.id, user.email);
  }

  async sendPasswordReset(email: string): Promise<void> {
    const [user] = await db
      .select({ id: customUsers.id })
      .from(customUsers)
      .where(eq(customUsers.email, email.toLowerCase()))
      .limit(1);

    // Anti-enumeración: no revelar si el email existe
    if (!user) return;

    const token    = randomUUID();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Invalidar resets anteriores
    await db
      .update(passwordResets)
      .set({ used: true })
      .where(eq(passwordResets.user_id, user.id));

    await db.insert(passwordResets).values({
      user_id:    user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // En desarrollo: el token se retorna por el API route
    // En producción: enviar por email
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(customUsers)
      .set({ password_hash: passwordHash, updated_at: new Date() })
      .where(eq(customUsers.id, userId));

    // Revocar todos los refresh tokens por seguridad
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.user_id, userId));
  }

  /** Verificar token de reset de contraseña y actualizar password */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    const tokenHash = sha256(token);
    const now = new Date();

    const [row] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token_hash, tokenHash))
      .limit(1);

    if (!row || row.used || row.expires_at < now) {
      throw new UnauthorizedError('Token de recuperación inválido o expirado');
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(customUsers)
      .set({ password_hash: passwordHash, updated_at: new Date() })
      .where(eq(customUsers.id, row.user_id));

    await db
      .update(passwordResets)
      .set({ used: true })
      .where(eq(passwordResets.id, row.id));

    // Revocar todos los refresh tokens
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.user_id, row.user_id));
  }
}

export const authService = new AuthService();

