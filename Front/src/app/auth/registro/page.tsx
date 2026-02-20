import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <div className="max-w-md mx-auto w-full">
      <div className="rounded-[12px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-2xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        {/* Progress */}
        <ProgressBar current={1} total={3} className="mb-7" />

        <div className="mb-7 space-y-1.5">
          <h1 className="font-display italic text-2xl text-[#F5F0E8]">Crear tu cuenta</h1>
          <p className="text-sm text-[rgba(245,240,232,0.45)]">
            Comenzá gratis. Sin tarjeta de crédito.
          </p>
        </div>

        <RegisterForm />

        {/* Preview de próximos pasos */}
        <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-[rgba(245,240,232,0.3)] mb-3">Próximos pasos</p>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs border border-[rgba(255,255,255,0.06)] text-[rgba(245,240,232,0.3)] bg-[rgba(255,255,255,0.02)]">
              2. Tu estilo
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs border border-[rgba(255,255,255,0.06)] text-[rgba(245,240,232,0.3)] bg-[rgba(255,255,255,0.02)]">
              3. Tus medidas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
