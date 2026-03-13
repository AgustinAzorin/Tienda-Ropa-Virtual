"use client";
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider, GoogleButton } from './LoginForm';
import { saveSession } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    startTransition(async () => {
      const url = `${API}/api/auth?action=register`;
      const opciones = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' as RequestCredentials,
      };
      try {
        const res = await fetch(url, opciones);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 409) {
            setErrors({ email: 'Este email ya está registrado' });
          } else if (json?.error?.message) {
            setServerError(json.error.message);
          } else {
            setServerError('Ocurrió un error. Intentá de nuevo.');
          }
          return;
        }
        // El backend retorna { user, tokens } directamente (sin wrapper data:)
        const { user, tokens } = json;
        saveSession(user, tokens.accessToken, tokens.refreshToken);
        document.cookie = 'onboarding_done=0; Path=/; Max-Age=31536000; SameSite=Lax';
        window.location.replace('/');
      } catch (err) {
        setServerError('Error de conexión. Intentá de nuevo.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <p className="text-sm text-[#D4614A] text-center animate-slide-up" role="alert">
          {serverError}
        </p>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="Contraseña"
        passwordToggle
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit" className="w-full" loading={isPending}>
        Registrar
      </Button>
      <Divider />
      <GoogleButton onClick={() => {}} loading={isPending} />
      <p className="text-center text-sm text-[rgba(245,240,232,0.5)]">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/auth/login"
          className="text-[#C9A84C] hover:text-[#B8942E] transition-colors font-medium"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}