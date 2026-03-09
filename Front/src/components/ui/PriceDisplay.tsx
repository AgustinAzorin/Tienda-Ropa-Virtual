'use client';

import { apiFetch } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

interface PriceDisplayProps {
  productId: string;
  variantId?: string;
  installments?: number;
  className?: string;
}

interface CurrentPriceResponse {
  price: number | string;
  currency: string;
}

interface InstallmentResponse {
  installments: number;
  amount_per_installment: number;
  total_amount: number;
  currency: string;
}

export function PriceDisplay({
  productId,
  variantId,
  installments = 3,
  className,
}: PriceDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('ARS');
  const [total, setTotal] = useState(0);
  const [installmentAmount, setInstallmentAmount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [current, installmentsResult] = await Promise.all([
          apiFetch<CurrentPriceResponse>(`/api/pricing/products/${productId}`),
          apiFetch<InstallmentResponse>(
            `/api/pricing/products/${productId}/installments?installments=${installments}`,
          ),
        ]);

        if (cancelled) return;

        const baseTotal = Number(current.price);
        let computedTotal = Number.isFinite(baseTotal) ? baseTotal : installmentsResult.total_amount;

        // TODO: wire exact variant override once product-detail endpoint by variant is exposed.
        if (variantId) {
          computedTotal = installmentsResult.total_amount;
        }

        setCurrency(current.currency ?? installmentsResult.currency ?? 'ARS');
        setTotal(computedTotal);
        setInstallmentAmount(Math.ceil(computedTotal / installmentsResult.installments));
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar el precio');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [productId, variantId, installments]);

  const cftLabel = useMemo(() => {
    if (loading || error) return 'CFT: -';
    return 'CFT: 0%';
  }, [loading, error]);

  if (loading) {
    return (
      <div className={cn('space-y-1.5', className)} aria-busy>
        <div className="skeleton h-8 w-28 rounded-[8px]" />
        <div className="skeleton h-3 w-36 rounded-[6px]" />
      </div>
    );
  }

  if (error) {
    return <p className={cn('text-xs text-[#D4614A]', className)}>{error}</p>;
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className="font-mono text-2xl font-semibold tracking-tight text-[#F5F0E8]">
        {installments}x {formatPrice(installmentAmount, currency)}
      </p>
      <p className="font-mono text-xs text-[#F5F0E8]/60">
        Total {formatPrice(total, currency)} · {cftLabel}
      </p>
    </div>
  );
}
