// ── Tipos propios de autenticación (sin Supabase) ─────────────────────────

export interface RegisterDto {
  email:    string;
  password: string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

/** Par de tokens devueltos en login / register / refresh */
export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number; // segundos hasta que expira el access token
}

/** Info del usuario autenticado */
export interface AuthUser {
  id:    string;
  email: string;
}

/** Resultado de register / login */
export interface AuthResult {
  user:   AuthUser;
  tokens: AuthTokens;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResult>;
  loginWithPassword(dto: LoginDto): Promise<AuthResult>;
  loginWithOAuth(provider: 'google'): Promise<{ url: string }>;
  logout(userId: string, refreshToken?: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthTokens>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  resetPasswordWithToken(token: string, newPassword: string): Promise<void>;
}

