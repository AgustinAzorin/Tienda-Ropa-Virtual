'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import type { InstallmentConfig } from '@/lib/cart/types';
import { calculateInstallmentQuotes, type InstallmentQuote } from '@/lib/installments/calculator';

interface InstallmentSelectorProps {
  total: number;
  paymentMethod: string;
  onChange: (quote: InstallmentQuote) => void;
}

export function InstallmentSelector({ total, paymentMethod, onChange }: InstallmentSelectorProps) {
  const [configs, setConfigs] = useState<InstallmentConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('installment_configs')
        .select('*')
        .eq('payment_method', paymentMethod)
        .eq('is_active', true);
      setConfigs((data ?? []) as InstallmentConfig[]);
    };

    void load();
  }, [paymentMethod]);

  const quotes = useMemo(() => calculateInstallmentQuotes(total, configs), [total, configs]);

  useEffect(() => {
    if (quotes.length === 0) return;
    const first = quotes[0];
    if (!selectedId) {
      setSelectedId(first.configId);
      onChange(first);
    }
  }, [quotes, selectedId, onChange]);

  if (quotes.length === 0) {
    return <p className="text-xs text-[#F5F0E8]/60">No hay cuotas disponibles para este medio.</p>;
  }

  return (
    <div className="space-y-2">
      {quotes.map((quote) => {
        const selected = selectedId === quote.configId;
        return (
          <button
            key={quote.configId}
            type="button"
            onClick={() => {
              setSelectedId(quote.configId);
              onChange(quote);
            }}
            className={[
              'w-full rounded-xl border p-3 text-left transition',
              selected ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.10)]' : 'border-white/10 bg-white/5',
            ].join(' ')}
          >
            <p className="font-mono text-lg text-[#F5F0E8]">{quote.installments} cuotas de {formatPrice(quote.amountPerInstallment)}</p>
            <p className="font-mono text-xs text-[#F5F0E8]/60">Total {formatPrice(quote.totalWithInterest)}</p>
            <p className="font-mono text-xs text-[#F5F0E8]/60">CFT: {quote.cft}%</p>
          </button>
        );
      })}
    </div>
  );
}
