import type { Metadata } from 'next';
import { RecoverForm } from '@/components/auth/RecoverForm';

export const metadata: Metadata = { title: 'Recuperar contraseña' };

export default function RecuperarPage() {
  return (
    <div className="max-w-md mx-auto w-full">
      <div className="rounded-[12px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="mb-7 space-y-1.5">
          <h1 className="font-display italic text-2xl text-[#F5F0E8]">Recuperar acceso</h1>
          <p className="text-sm text-[rgba(245,240,232,0.45)]">
            Te enviamos las instrucciones por email
          </p>
        </div>
        <RecoverForm />
      </div>
    </div>
  );
}
