'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface UpsellProduct {
  id: string;
  name: string;
  brand?: string;
  price: number;
}

interface UpsellCarouselProps {
  items: UpsellProduct[];
  onQuickAdd?: (variantId: string) => void;
}

export function UpsellCarousel({ items, onQuickAdd }: UpsellCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl italic text-[#F5F0E8]">Completa tu look</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.slice(0, 6).map((item) => (
          <article
            key={item.id}
            className="glass min-w-56 rounded-xl p-3"
          >
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="mt-0.5 text-xs text-[#F5F0E8]/55">{item.brand ?? 'Seleccion curada'}</p>
            <p className="mt-2 font-mono text-base">{formatPrice(item.price)}</p>
            <div className="mt-3 flex items-center justify-between">
              <Link href={`/producto/${item.id}`} className="text-xs text-[#F5F0E8]/70">
                Ver
              </Link>
              <button
                type="button"
                onClick={() => onQuickAdd?.(item.id)}
                className="rounded-lg bg-[#C9A84C] px-3 py-1 text-xs font-semibold text-[#0D0A08]"
              >
                Agregar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
