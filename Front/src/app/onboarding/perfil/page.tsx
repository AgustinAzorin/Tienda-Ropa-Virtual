'use client';

import { useState, useTransition, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { getStoredUser, clearSession } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { debounce } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VibePicker, type Vibe } from '@/components/ui/VibePicker';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { cn } from '@/lib/utils';

const BIO_MAX = 160;

const schema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(24, 'Máximo 24 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guión bajo'),
  displayName: z.string().min(1, 'Completá tu nombre').max(50),
});

// Extracted outside the component: no closure dependency on component state
function UsernameStatusIcon({ status }: { status: 'idle' | 'checking' | 'available' | 'taken' | 'error' }) {
  if (status === 'checking')  return <Loader2 size={16} className="text-[rgba(245,240,232,0.4)] animate-spin" />;
  if (status === 'available') return <Check size={16} className="text-emerald-400" />;
  if (status === 'taken')     return <X size={16} className="text-[#D4614A]" />;
  return null;
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function PerfilPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Supabase client — stable across renders, never recreated
  const supabase = useMemo(() => createClient(), []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [errors, setErrors] = useState<Partial<Record<'username' | 'displayName', string>>>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  // Debounced username check.
  // The debounce instance is kept in a ref so it is never recreated on re-renders,
  // which would reset the timer and make rapid keystrokes fire multiple API calls.
  const checkUsername = useRef(
    debounce(async (val: string, sb: ReturnType<typeof createClient>) => {
      if (val.length < 3) { setUsernameStatus('idle'); return; }
      const reg = /^[a-z0-9_]+$/;
      if (!reg.test(val)) { setUsernameStatus('idle'); return; }

      setUsernameStatus('checking');
      const { data, error } = await sb
        .from('profiles')
        .select('username')
        .eq('username', val)
        .maybeSingle();

      if (error) { setUsernameStatus('error'); return; }
      setUsernameStatus(data ? 'taken' : 'available');
    }, 500),
  ).current;

  // Stable callback: calls the stable debounced function with the current supabase client
  const handleUsernameCheck = useCallback(
    (val: string) => checkUsername(val, supabase),
    [checkUsername, supabase],
  );

  useEffect(() => {
    handleUsernameCheck(username);
  }, [username, handleUsernameCheck]);

  const canContinue =
    username.length >= 3 &&
    displayName.length >= 1 &&
    usernameStatus === 'available';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = schema.safeParse({ username, displayName });
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof typeof errs;
        if (!errs[key]) errs[key] = err.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});

    // Verificar sesión ANTES de startTransition
    const user = getStoredUser();
    if (!user) {
      clearSession();
      window.location.replace('/auth/login');
      return;
    }

    startTransition(async () => {
      // Upload avatar si se proporcionó
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      try {
        await apiFetch('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({
            username,
            display_name: displayName,
            bio: bio || null,
            avatar_url: avatarUrl ?? null,
          }),
        });
        router.push('/onboarding/medidas');
      } catch (error) {
        console.error('Error al guardar perfil:', error);
      }
    });
  };

  // Username status icon
  // (component defined outside — not recreated on every render)

  const bioPercent = bio.length / BIO_MAX;

  return (
    <div className="space-y-8">
      <ProgressBar current={2} total={3} />

      <div className="space-y-1.5">
        <h1 className="font-display italic text-3xl text-[#F5F0E8]">Tu perfil público</h1>
        <p className="text-sm text-[rgba(245,240,232,0.45)]">
          Así te verán las demás personas en la comunidad
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <AvatarUpload value={avatarFile} onChange={setAvatarFile} />

        {/* Username */}
        <Input
          label="Usuario"
          type="text"
          autoComplete="username"
          placeholder="tu_usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
          error={
            errors.username ??
            (usernameStatus === 'taken' ? 'Este nombre de usuario no está disponible' : undefined)
          }
          suffix={<UsernameStatusIcon status={usernameStatus} />}
          hint="Solo letras minúsculas, números y guión bajo"
        />

        {/* Display name */}
        <Input
          label="Nombre que se muestra"
          type="text"
          autoComplete="name"
          placeholder="Tu Nombre"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(245,240,232,0.7)]">
            Bio{' '}
            <span className="text-[rgba(245,240,232,0.3)] font-normal">(opcional)</span>
          </label>
          <textarea
            placeholder="Contá algo sobre vos y tu estilo..."
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-[8px] resize-none',
              'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]',
              'text-[#F5F0E8] placeholder:text-[rgba(245,240,232,0.3)]',
              'text-sm font-body',
              'focus:outline-none focus:border-[#C9A84C] focus:bg-[rgba(201,168,76,0.04)]',
              'transition-all duration-150',
            )}
          />
          <div className="flex justify-end">
            <span
              className={cn(
                'text-xs font-mono tabular-nums transition-colors',
                bioPercent >= 0.8 ? 'text-[#C9A84C]' : 'text-[rgba(245,240,232,0.25)]',
              )}
            >
              {bio.length}/{BIO_MAX}
            </span>
          </div>
        </div>

        {/* Vibe picker */}
        <VibePicker selected={vibes} onChange={setVibes} />

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={!canContinue}
            loading={isPending}
          >
            Continuar
          </Button>
          <button
            type="button"
            onClick={() => router.push('/onboarding/medidas')}
            className="text-sm text-[rgba(245,240,232,0.35)] hover:text-[rgba(245,240,232,0.6)] transition-colors text-center"
          >
            Saltar por ahora
          </button>
        </div>
      </form>
    </div>
  );
}
