import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s — Configuración inicial · ANYA', default: 'Onboarding · ANYA' },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0D0A08] flex flex-col">
      {/* Simple header */}
      <header className="px-6 h-14 flex items-center border-b border-[rgba(255,255,255,0.04)] shrink-0">
        <span className="font-display italic text-lg text-[rgba(245,240,232,0.5)]">ANYA</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
