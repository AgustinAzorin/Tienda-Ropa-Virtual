import type { User, Session } from '@supabase/supabase-js';

export interface RegisterDto {
  email:    string;
  password: string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface AuthResult {
  user:    User;
  session: Session;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResult>;
  loginWithPassword(dto: LoginDto): Promise<AuthResult>;
  loginWithOAuth(provider: 'google'): Promise<{ url: string }>;
  logout(accessToken: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthResult>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(accessToken: string, newPassword: string): Promise<void>;
  verifyOtp(email: string, token: string): Promise<AuthResult>;
}
