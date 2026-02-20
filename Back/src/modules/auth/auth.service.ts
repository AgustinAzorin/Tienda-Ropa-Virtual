import { supabase } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors';
import type { IAuthService, RegisterDto, LoginDto, AuthResult } from './interfaces/IAuthService';

export class AuthService implements IAuthService {

  async register({ email, password }: RegisterDto): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
    if (!data.user || !data.session) throw new AppError('AUTH_ERROR', 'Registro incompleto', 500);
    return { user: data.user, session: data.session };
  }

  async loginWithPassword({ email, password }: LoginDto): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AppError('AUTH_INVALID_CREDENTIALS', error.message, 401);
    if (!data.user || !data.session) throw new AppError('AUTH_ERROR', 'Login fallido', 500);
    return { user: data.user, session: data.session };
  }

  async loginWithOAuth(provider: 'google'): Promise<{ url: string }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
    return { url: data.url };
  }

  async logout(_accessToken?: string): Promise<void> {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.signOut();
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
  }

  async refreshSession(refreshToken: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw new AppError('AUTH_ERROR', error.message, 401);
    if (!data.user || !data.session) throw new AppError('AUTH_ERROR', 'Sesión inválida', 401);
    return { user: data.user, session: data.session };
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
  }

  async updatePassword(_accessToken: string, newPassword: string): Promise<void> {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
  }

  async verifyOtp(email: string, token: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.verifyOtp({
      email, token, type: 'email',
    });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
    if (!data.user || !data.session) throw new AppError('AUTH_ERROR', 'OTP inválido', 400);
    return { user: data.user, session: data.session };
  }
}

export const authService = new AuthService();
