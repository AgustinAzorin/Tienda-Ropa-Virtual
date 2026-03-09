'use client';

import { useState } from 'react';

interface ConfirmationHeroProps {
  orderId: string;
  email?: string;
}

export function ConfirmationHero({ orderId, email }: ConfirmationHeroProps) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.18),transparent_40%),rgba(255,255,255,0.05)] p-6 text-center">
      <div className="mb-3 text-4xl">🎉</div>
      <h1 className="font-display text-4xl italic">Tu pedido esta confirmado</h1>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(orderId);
          setCopied(true);
        }}
        className="mt-2 font-mono text-sm text-[#C9A84C]"
      >
        Orden #{orderId} {copied ? '(copiado)' : ''}
      </button>
      <p className="mt-1 text-sm text-[#F5F0E8]/65">Te enviamos un resumen a {email ?? 'tu correo'}.</p>
    </section>
  );
}
