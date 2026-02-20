'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCircle2, Shirt, Share2 } from 'lucide-react';
import {
  LandingNav,
  Particles,
  HeroCTAs,
  FeedCard,
  FeedBlurModal,
} from '@/components/landing/LandingComponents';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: UserCircle2,
    title: 'Creá tu avatar',
    desc: 'Ingresá tus medidas para generar un avatar 3D que te representa con precisión.',
  },
  {
    icon: Shirt,
    title: 'Probate la ropa',
    desc: 'Visualizá cómo te quedan las prendas antes de comprar. Sin probadores físicos.',
  },
  {
    icon: Share2,
    title: 'Compartí tu estilo',
    desc: 'Publicá tus outfits, seguí a otras personas y descubrí tendencias de la comunidad.',
  },
];

export default function LandingPage() {
  const [showFeedModal, setShowFeedModal] = useState(false);

  return (
    <>
      <LandingNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-[#0D0A08]">
        <Particles />

        {/* Ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.08)] text-xs text-[#C9A84C] font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse-amber" />
            Probador virtual 3D · Ya disponible
          </div>

          <h1 className="font-display italic text-5xl sm:text-6xl md:text-7xl text-[#F5F0E8] leading-tight tracking-tight">
            Tu estilo,
            <br />
            <span className="text-gradient-amber">sin límites</span>
          </h1>

          <p className="text-[rgba(245,240,232,0.55)] text-lg leading-relaxed max-w-xl mx-auto font-body">
            La primera plataforma de moda donde podés probarte la ropa en tu propio avatar 3D,
            descubrir looks de la comunidad y comprar con confianza.
          </p>

          <HeroCTAs />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[rgba(245,240,232,0.25)] animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-[rgba(245,240,232,0.15)]" />
          <span className="text-xs font-body tracking-widest uppercase">scroll</span>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#141010]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs tracking-widest uppercase text-[#C9A84C] font-medium font-body">
              El proceso
            </p>
            <h2 className="font-display italic text-4xl md:text-5xl text-[#F5F0E8]">
              Cómo funciona
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-[rgba(255,255,255,0.06)]"
              aria-hidden="true"
            />

            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className={cn(
                    'w-20 h-20 rounded-[12px]',
                    'bg-[#1C1714] border border-[rgba(255,255,255,0.06)]',
                    'flex items-center justify-center',
                  )}>
                    <step.icon size={32} className="text-[#C9A84C]" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2a2218] border border-[rgba(201,168,76,0.3)] text-[#C9A84C] text-xs font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display italic text-xl text-[#F5F0E8]">{step.title}</h3>
                <p className="text-sm text-[rgba(245,240,232,0.5)] leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feed preview ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0D0A08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs tracking-widest uppercase text-[#C9A84C] font-medium">
              La comunidad
            </p>
            <h2 className="font-display italic text-4xl md:text-5xl text-[#F5F0E8]">
              Descubrí miles de looks
            </h2>
            <p className="text-[rgba(245,240,232,0.5)] text-base max-w-md mx-auto">
              Una comunidad de personas que comparten, prueban y recomiendan.
            </p>
          </div>

          {/* Bento grid */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Col 1 */}
              <div className="space-y-3 md:space-y-4">
                <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
                <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
              </div>
              {/* Col 2 — tall */}
              <div className="space-y-3 md:space-y-4">
                <FeedCard aspectClass="aspect-[2/3]" onInteract={() => setShowFeedModal(true)} />
                <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
              </div>
              {/* Col 3 (hidden on mobile) */}
              <div className="hidden md:flex flex-col gap-4">
                <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
                <FeedCard aspectClass="aspect-[3/5]" onInteract={() => setShowFeedModal(true)} />
              </div>
              {/* Col 4 (hidden on mobile) */}
              <div className="hidden md:flex flex-col gap-4">
                <FeedCard aspectClass="aspect-[3/4]" onInteract={() => setShowFeedModal(true)} />
                <FeedCard aspectClass="aspect-square" onInteract={() => setShowFeedModal(true)} />
              </div>
            </div>

            {/* Fade out bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0D0A08] to-transparent pointer-events-none" />

            {/* Blur modal */}
            {showFeedModal && (
              <FeedBlurModal onClose={() => setShowFeedModal(false)} />
            )}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-[#141010] relative overflow-hidden">
        {/* Ambient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto text-center space-y-8">
          <h2 className="font-display italic text-5xl md:text-6xl text-[#F5F0E8] leading-tight">
            Tu guardarropa
            <br />
            nunca fue
            <br />
            <span className="text-gradient-amber">tan tuyo</span>
          </h2>
          <p className="text-[rgba(245,240,232,0.5)] text-lg">
            Unite gratis. Sin tarjeta de crédito.
          </p>
          <Link
            href="/auth/registro"
            className={cn(
              'inline-flex items-center justify-center',
              'h-14 px-10 rounded-[8px] text-base font-semibold',
              'bg-[#C9A84C] text-[#0D0A08]',
              'hover:bg-[#B8942E]',
              'transition-all duration-150 active:scale-[0.98]',
              'shadow-[0_8px_32px_rgba(201,168,76,0.25)]',
            )}
          >
            Empezar gratis
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[rgba(255,255,255,0.04)] bg-[#0D0A08]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display italic text-[rgba(245,240,232,0.4)]">ANYA</span>
          <p className="text-xs text-[rgba(245,240,232,0.25)]">
            © 2026 ANYA. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-[rgba(245,240,232,0.3)]">
            <Link href="/privacidad" className="hover:text-[rgba(245,240,232,0.6)] transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-[rgba(245,240,232,0.6)] transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
