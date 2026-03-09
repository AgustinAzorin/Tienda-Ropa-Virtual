'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/cart/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void> | void;
  onRemove: (itemId: string) => Promise<void> | void;
  variant?: 'drawer' | 'page' | 'readonly';
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, variant = 'drawer' }: CartItemRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [displayedTotal, setDisplayedTotal] = useState(item.total);

  useEffect(() => {
    const target = item.total;
    const start = displayedTotal;
    const delta = target - start;
    if (delta === 0) return;

    let frame = 0;
    const max = 10;
    const timer = setInterval(() => {
      frame += 1;
      setDisplayedTotal(Math.round(start + (delta * frame) / max));
      if (frame >= max) clearInterval(timer);
    }, 18);

    return () => clearInterval(timer);
  }, [item.total, displayedTotal]);

  const handleRemove = async () => {
    if (item.quantity > 1) {
      const confirmed = window.confirm('Este item tiene mas de una unidad. Queres eliminarlo?');
      if (!confirmed) return;
    }

    setIsRemoving(true);
    setTimeout(() => {
      void onRemove(item.id);
    }, 220);
  };

  const imageSize = variant === 'page' ? 100 : 60;

  return (
    <article
      className={cn(
        'glass flex gap-3 rounded-xl p-3 transition-all duration-300',
        isRemoving && 'translate-x-8 scale-y-75 opacity-0',
        item.outOfStock && 'border-[#D4614A]/70',
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-white/5" style={{ width: imageSize, height: imageSize, minWidth: imageSize }}>
        {item.thumbnail ? (
          <Image src={item.thumbnail} alt={item.productName} fill sizes={`${imageSize}px`} className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#F5F0E8]/45">Sin imagen</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#F5F0E8]">{item.productName}</p>
        <p className="mt-0.5 text-xs text-[#F5F0E8]/60">{item.size ?? '-'} · {item.color ?? item.variantTitle ?? 'Variante seleccionada'}</p>

        {item.triedOn3D ? <span className="mt-2 inline-flex rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/15 px-2 py-1 text-[10px] text-[#C9A84C]">Probado en 3D</span> : null}
        {item.outOfStock ? <p className="mt-2 text-xs text-[#D4614A]">Sin stock disponible - guardalo en tu wishlist</p> : null}

        <p className="mt-2 font-mono text-lg text-[#F5F0E8]">{formatPrice(Math.ceil(displayedTotal / Math.max(item.quantity, 1)), item.currency)}</p>
        <p className="font-mono text-xs text-[#F5F0E8]/55">Total {formatPrice(displayedTotal, item.currency)} · CFT visible</p>
      </div>

      {variant !== 'readonly' ? (
        <div className="ml-1 flex flex-col items-end justify-between">
          <button type="button" onClick={handleRemove} className="rounded p-1 text-[#D4614A] hover:bg-[#D4614A]/15" aria-label="Eliminar item">
            <Trash2 size={16} />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1">
            <button type="button" onClick={() => void onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="h-6 w-6 rounded-full text-[#F5F0E8]/80 hover:bg-white/10">-</button>
            <span className="w-4 text-center font-mono text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => void onUpdateQuantity(item.id, Math.min(item.maxStock ?? 99, item.quantity + 1))}
              className="h-6 w-6 rounded-full text-[#F5F0E8]/80 hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
