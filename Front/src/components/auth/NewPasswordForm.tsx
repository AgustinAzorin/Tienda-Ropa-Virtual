'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type Errors = Partial<Record<'password' | 'confirm', string>>;

export function NewPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const resetToken   = searchParams.get('token');   // presente si viene desde email de reset

  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [errors, setErrors]     = useState<Errors>({});
  const [success, setSuccess]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ password, confirm });
    if (!result.success) {
      const errs: Errors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof Errors;
        if (!errs[key]) errs[key] = err.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        if (resetToken) {
          // Flujo de reset desde email: token en URL
          await fetch(`${API}/api/auth/password?action=reset-confirm`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token: resetToken, password }),
          });
        } else {
          // Flujo de cambio de contraseña estando autenticado
          await apiFetch('/api/auth/password?action=update', {
            method: 'POST',
            body:   JSON.stringify({ password }),
          });
        }
        setSuccess(true);
        setTimeout(() => router.push('/auth/login'), 2000);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar la contraseña. El link puede haber expirado.';
        setErrors({ password: msg });
      }
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center">
          <CheckCircle2 size={24} className="text-[#C9A84C]" />
        </div>
        <p className="text-sm text-[rgba(245,240,232,0.6)] text-center">
          Contraseña actualizada. Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Nueva contraseña"
        passwordToggle
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint="Mínimo 8 caracteres, una mayúscula y un número"
      />

      <Input
        label="Confirmar contraseña"
        passwordToggle
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
      />

      <Button type="submit" className="w-full" loading={isPending}>
        Guardar contraseña
      </Button>
    </form>
  );
}

