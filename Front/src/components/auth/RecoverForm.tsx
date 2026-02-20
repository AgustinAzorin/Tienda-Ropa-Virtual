'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

export function RecoverForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setEmailError(result.error.errors[0]?.message ?? 'Email inválido');
      return;
    }
    setEmailError('');

    startTransition(async () => {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/nueva-contrasena`,
      });
      // Always show success to prevent email enumeration
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 animate-slide-up">
        <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center">
          <Mail size={24} className="text-[#C9A84C]" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-medium text-[#F5F0E8]">Revisá tu casilla</h3>
          <p className="text-sm text-[rgba(245,240,232,0.5)] leading-relaxed">
            Si existe una cuenta con{' '}
            <span className="text-[rgba(245,240,232,0.8)]">{email}</span>,
            recibirás las instrucciones en breve.
          </p>
        </div>
        <a
          href="/auth/login"
          className="text-sm text-[#C9A84C] hover:text-[#B8942E] transition-colors"
        >
          Volver al inicio de sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-[rgba(245,240,232,0.5)] leading-relaxed">
        Ingresá tu email y te enviamos las instrucciones para restablecer tu contraseña.
      </p>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
      />

      <Button type="submit" className="w-full" loading={isPending}>
        Enviar instrucciones
      </Button>

      <p className="text-center">
        <a
          href="/auth/login"
          className="text-sm text-[rgba(245,240,232,0.5)] hover:text-[rgba(245,240,232,0.8)] transition-colors"
        >
          ← Volver al inicio de sesión
        </a>
      </p>
    </form>
  );
}
