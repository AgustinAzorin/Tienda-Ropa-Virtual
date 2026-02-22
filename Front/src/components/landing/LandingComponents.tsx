'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 48);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'flex items-center justify-between',
        'px-6 md:px-12 h-16',
        'transition-all duration-300',
        solid
          ? 'bg-[#0D0A08] border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent',
      )}
    >
      <span className="font-display italic text-xl text-[#F5F0E8] tracking-wide">
        ANYA
      </span>

      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className={cn(
            'px-4 h-9 rounded-[8px] text-sm font-medium',
            'text-[rgba(245,240,232,0.7)] hover:text-[#F5F0E8]',
            'hover:bg-[rgba(255,255,255,0.06)]',
            'transition-all duration-150',
            'inline-flex items-center',
          )}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/auth/registro"
          className={cn(
            'px-4 h-9 rounded-[8px] text-sm font-medium',
            'bg-[#C9A84C] text-[#0D0A08]',
            'hover:bg-[#B8942E]',
            'transition-colors duration-150',
            'inline-flex items-center',
          )}
        >
          Registrarse
        </Link>
      </div>
    </nav>
  );
}

// ─── Floating particles ───────────────────────────────────────────────────────

function createSeededRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const PARTICLE_COUNT = 24;
const particleRandom = createSeededRng(20260220);
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  size: particleRandom() * 2.5 + 1,
  left: particleRandom() * 100,
  delay: particleRandom() * 8,
  duration: particleRandom() * 12 + 10,
  opacity: particleRandom() * 0.4 + 0.1,
}));

function stableIndex(input: string, length: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function Particles() {
  return (
    <div className="particles-bg" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
            opacity: 0,
            animation: `float-up ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Hero CTA group ───────────────────────────────────────────────────────────

export function HeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
      <Link
        href="/auth/registro"
        className={cn(
          'h-12 px-7 rounded-[8px] text-sm font-semibold',
          'bg-[#C9A84C] text-[#0D0A08]',
          'hover:bg-[#B8942E]',
          'transition-all duration-150 active:scale-[0.98]',
          'inline-flex items-center justify-center',
          'min-w-[180px]',
        )}
      >
        Crear mi avatar
      </Link>
      <Link
        href="/auth/registro"
        className={cn(
          'h-12 px-7 rounded-[8px] text-sm font-semibold',
          'border border-[#D4614A] text-[#D4614A]',
          'hover:bg-[rgba(212,97,74,0.08)]',
          'transition-all duration-150 active:scale-[0.98]',
          'inline-flex items-center justify-center',
          'min-w-[180px]',
        )}
      >
        Explorar looks
      </Link>
    </div>
  );
}

// ─── Feed preview card ────────────────────────────────────────────────────────

interface FeedCardProps {
  className?: string;
  aspectClass?: string;
  onInteract?: () => void;
}

export function FeedCard({ className, aspectClass = 'aspect-[3/4]', onInteract }: FeedCardProps) {
  const colors = [
    'from-[#2a1f14] to-[#1a1410]',
    'from-[#1a1f2a] to-[#10141a]',
    'from-[#251a14] to-[#1a1010]',
    'from-[#141a25] to-[#100f1a]',
  ];
  const gradient = colors[stableIndex(`${aspectClass}-${className ?? ''}`, colors.length)];

  return (
    <button
      type="button"
      onClick={onInteract}
      className={cn(
        'rounded-[12px] overflow-hidden',
        `bg-gradient-to-br ${gradient}`,
        'border border-[rgba(255,255,255,0.04)]',
        'relative group cursor-pointer',
        aspectClass,
        className,
      )}
      aria-label="Ver post"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.5)] to-transparent" />
      {/* Fake content lines */}
      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
        <div className="h-2 bg-[rgba(255,255,255,0.08)] rounded w-3/4" />
        <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded w-1/2" />
      </div>
      {/* Avatar placeholder */}
      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[rgba(255,255,255,0.08)]" />
    </button>
  );
}

// ─── Blur modal de registro ───────────────────────────────────────────────────

export function FeedBlurModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4 rounded-[16px] overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-lg bg-[rgba(13,10,8,0.7)]" />
      <div className={cn(
        'relative z-10 rounded-[12px] p-6 max-w-xs w-full text-center',
        'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]',
        'backdrop-blur-2xl shadow-2xl',
        'animate-slide-up',
      )}>
        <p className="font-display italic text-lg text-[#F5F0E8] mb-2">
          Unite a la comunidad
        </p>
        <p className="text-sm text-[rgba(245,240,232,0.5)] mb-5 leading-relaxed">
          Creá tu cuenta gratis para explorar looks, probarte ropa y compartir tu estilo.
        </p>
        <Link
          href="/auth/registro"
          className={cn(
            'w-full h-10 rounded-[8px] text-sm font-semibold',
            'bg-[#C9A84C] text-[#0D0A08]',
            'hover:bg-[#B8942E] transition-colors',
            'inline-flex items-center justify-center mb-3',
          )}
        >
          Crear cuenta gratis
        </Link>
        <button
          onClick={onClose}
          className="text-xs text-[rgba(245,240,232,0.35)] hover:text-[rgba(245,240,232,0.6)] transition-colors"
        >
          Continuar viendo
        </button>
      </div>
    </div>
  );
}
