import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceder',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0D0A08] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(201,168,76,0.07) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom right, rgba(212,97,74,0.04) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <a
        href="/"
        className="fixed top-6 left-6 font-display italic text-xl text-[rgba(245,240,232,0.6)] hover:text-[#F5F0E8] transition-colors z-10"
      >
        ANYA
      </a>

      {/* Content (modal) */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
