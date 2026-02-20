'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider, GoogleButton } from './LoginForm';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

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
      setServerError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'Este email ya está registrado' });
        } else {
          setServerError('Ocurrió un error. Intentá de nuevo.');
        }
        return;
      }

      router.push('/onboarding/perfil');
      router.refresh();
    });
  };

  const handleGoogleLogin = () => {
    startTransition(async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
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
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <Input
        label="Contraseña"
        passwordToggle
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint="Mínimo 8 caracteres, una mayúscula y un número"
      />

      <Button type="submit" className="w-full" loading={isPending}>
        Continuar
      </Button>

      <Divider />

      <GoogleButton onClick={handleGoogleLogin} loading={isPending} />

      <p className="text-center text-sm text-[rgba(245,240,232,0.5)]">
        ¿Ya tenés cuenta?{' '}
        <a
          href="/auth/login"
          className="text-[#C9A84C] hover:text-[#B8942E] transition-colors font-medium"
        >
          Iniciá sesión
        </a>
      </p>
    </form>
  );
}
