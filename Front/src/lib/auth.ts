/**
 * auth.ts — Manejo del estado de autenticación en el Front.
 * Almacena tokens en localStorage + cookie para el middleware.
 */

const ACCESS_KEY   = 'auth_access';
const REFRESH_KEY  = 'auth_refresh';
const USER_KEY     = 'auth_user';
const COOKIE_NAME  = 'auth_session';

export interface StoredUser {
  id:    string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: StoredUser | null;
}

const authListeners = new Set<() => void>();

function readUserFromStorage(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

let authState: AuthState = {
  isAuthenticated: false,
  user: null,
};

function emitAuthChange() {
  authListeners.forEach((listener) => listener());
}

function syncAuthStateFromStorage() {
  const hasToken = !!getAccessToken();
  authState = {
    isAuthenticated: hasToken,
    user: hasToken ? readUserFromStorage() : null,
  };
}

if (typeof window !== 'undefined') {
  syncAuthStateFromStorage();
  window.addEventListener('storage', (event) => {
    if (event.key === ACCESS_KEY || event.key === REFRESH_KEY || event.key === USER_KEY) {
      syncAuthStateFromStorage();
      emitAuthChange();
    }
  });
}

// ── Persistencia ─────────────────────────────────────────────────────────────

export function saveSession(user: StoredUser, accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY,  accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Cookie simple (no httpOnly) para que el middleware del Front la lea
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${30 * 24 * 3600}; SameSite=Lax`;
  authState = { isAuthenticated: true, user };
  emitAuthChange();
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  authState = { isAuthenticated: false, user: null };
  emitAuthChange();
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): StoredUser | null {
  return readUserFromStorage();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getAuthState(): AuthState {
  return authState;
}

export function subscribeAuthState(listener: () => void): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

// ── Renovación automática de tokens ──────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/auth/refresh`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:    JSON.stringify({ refreshToken }),
        },
      );

      if (!res.ok) { clearSession(); return null; }

      const { data } = await res.json();
      const user = getStoredUser();
      if (user) {
        saveSession(user, data.accessToken, data.refreshToken);
      } else {
        localStorage.setItem(ACCESS_KEY,  data.accessToken);
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
      return data.accessToken as string;
    } catch {
      clearSession();
      return null;
    }
  })();

  refreshPromise.finally(() => { refreshPromise = null; });
  return refreshPromise;
}
