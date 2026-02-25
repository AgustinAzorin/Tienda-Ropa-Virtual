'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { saveSession } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const errs: Errors = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof Errors;
        if (!errs[key]) errs[key] = e.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const res = await fetch(`${API}/api/auth`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrors({ password: json.error?.message ?? 'Email o contraseña incorrectos' });
          return;
        }
        const { user, tokens } = json.data;
        saveSession(user, tokens.accessToken, tokens.refreshToken);
        document.cookie = 'onboarding_done=0; Path=/; Max-Age=31536000; SameSite=Lax';
        router.push('/onboarding/perfil');
        router.refresh();
      } catch {
        setErrors({ password: 'Error de conexión. Intentá de nuevo.' });
      }
    });
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      // Google OAuth sigue usando Supabase como proveedor OAuth (en paralelo)
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <Input
        label="Contraseña"
        passwordToggle
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <div className="flex justify-end">
        <a
          href="/auth/recuperar"
          className="text-xs text-[rgba(212,97,74,0.8)] hover:text-[#D4614A] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Iniciar sesión
      </Button>

      <Divider />

      <GoogleButton onClick={handleGoogleLogin} loading={isPending} />

      <p className="text-center text-sm text-[rgba(245,240,232,0.5)]">
        ¿No tenés cuenta?{' '}
        <a
          href="/auth/registro"
          className="text-[#C9A84C] hover:text-[#B8942E] transition-colors font-medium"
        >
          Registrate
        </a>
      </p>
    </form>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

export function Divider() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
      <span className="text-xs text-[rgba(245,240,232,0.3)] shrink-0">o</span>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
    </div>
  );
}

export function GoogleButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'w-full h-11 rounded-[8px]',
        'border border-[rgba(255,255,255,0.12)]',
        'bg-[rgba(255,255,255,0.03)]',
        'hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.2)]',
        'transition-all duration-150',
        'flex items-center justify-center gap-3',
        'text-sm font-medium text-[rgba(245,240,232,0.8)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      Continuar con Google
    </button>
  );
}

