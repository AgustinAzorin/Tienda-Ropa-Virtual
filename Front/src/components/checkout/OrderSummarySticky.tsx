import type { CartItem } from '@/lib/cart/types';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryStickyProps {
  items: CartItem[];
  total: number;
  installmentLabel?: string;
}

export function OrderSummarySticky({ items, total, installmentLabel }: OrderSummaryStickyProps) {
  return (
    <aside className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-display text-2xl italic">Resumen</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-xs text-[#F5F0E8]/70">
            <span>{item.productName} x{item.quantity}</span>
            <span className="font-mono">{formatPrice(item.total, item.currency)}</span>
          </div>
        ))}
      </div>
      <div className="my-3 h-px bg-white/10" />
      <p className="font-mono text-lg text-[#F5F0E8]">{formatPrice(total)}</p>
      {installmentLabel ? <p className="font-mono text-xs text-[#C9A84C]">{installmentLabel}</p> : null}
    </aside>
  );
}
