'use client';

import { useSyncExternalStore } from 'react';
import { getAuthState, subscribeAuthState, type AuthState } from '@/lib/auth';

const serverSnapshot: AuthState = {
  isAuthenticated: false,
  user: null,
};

export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribeAuthState, getAuthState, () => serverSnapshot);
}
