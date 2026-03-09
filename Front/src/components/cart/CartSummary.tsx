'use client';

import { Lock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { InstallmentSelector } from '@/components/checkout/InstallmentSelector';
import type { InstallmentQuote } from '@/lib/installments/calculator';

interface CartSummaryProps {
  subtotal: number;
  total: number;
  discount?: number;
  onStartCheckout?: () => void;
  onInstallmentChange?: (quote: InstallmentQuote) => void;
}

export function CartSummary({
  subtotal,
  total,
  discount = 0,
  onStartCheckout,
  onInstallmentChange,
}: CartSummaryProps) {
  return (
    <section className="glass sticky top-24 rounded-2xl p-5">
      <h3 className="font-display text-2xl italic text-[#F5F0E8]">Resumen de orden</h3>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#F5F0E8]/70">Subtotal</span>
          <span className="font-mono text-sm">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#C9A84C]">Descuento</span>
            <span className="font-mono text-sm text-[#C9A84C]">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#F5F0E8]/60">Envio</span>
          <span className="text-sm text-[#F5F0E8]/55">Calculado en el siguiente paso</span>
        </div>
      </div>

      <div className="my-4 h-px bg-white/10" />

      <p className="font-mono text-3xl font-semibold">{formatPrice(total)}</p>

      <div className="mt-4">
        <InstallmentSelector
          total={total}
          paymentMethod="credit_card"
          onChange={(quote) => onInstallmentChange?.(quote)}
        />
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-[#0D0A08] hover:bg-[#B8942E]"
        onClick={onStartCheckout}
      >
        <Lock size={15} />
        Iniciar compra
      </button>

      <p className="mt-3 text-center text-xs text-[#F5F0E8]/55">Compra 100% segura</p>
    </section>
  );
}
