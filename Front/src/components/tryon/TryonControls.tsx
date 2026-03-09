'use client';

import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { HeatmapToggle } from '@/components/tryon/HeatmapToggle';
import type { Product, ProductVariant } from '@/lib/tryon/types';

interface TryonControlsProps {
  product: Product;
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  onAddToCart: () => void;
  onSaveToWardrobe: () => void;
  onShare: () => void;
}

export function TryonControls({
  product,
  variants,
  selectedVariant,
  onVariantChange,
  showHeatmap,
  onToggleHeatmap,
  onAddToCart,
  onSaveToWardrobe,
  onShare,
}: TryonControlsProps) {
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean))) as string[];
  const colors = variants.filter((variant) => variant.color_hex);

  return (
    <section className="glass w-full rounded-t-[16px] p-3 md:h-full md:rounded-[14px] md:p-4">
      <div className="space-y-4">
        <div>
          <p className="font-display text-lg italic leading-tight">{product.name}</p>
          <PriceDisplay productId={product.id} variantId={selectedVariant.id} installments={3} className="mt-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#F5F0E8]/55">Talles</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find((item) => item.size === size);
              if (!variant) return null;

              const active = selectedVariant.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onVariantChange(variant)}
                  className={active
                    ? 'rounded-[8px] border border-[#C9A84C] bg-[rgba(201,168,76,0.2)] px-2.5 py-1 text-xs font-semibold text-[#F5F0E8]'
                    : 'rounded-[8px] border border-[rgba(255,255,255,0.2)] px-2.5 py-1 text-xs text-[#F5F0E8]/75'}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {!!colors.length && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[#F5F0E8]/55">Colores</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((variant) => (
                <button
                  key={`color-${variant.id}`}
                  type="button"
                  title={variant.color ?? 'Color'}
                  onClick={() => onVariantChange(variant)}
                  className={selectedVariant.id === variant.id
                    ? 'h-7 w-7 rounded-full border-2 border-[#C9A84C]'
                    : 'h-7 w-7 rounded-full border border-[rgba(255,255,255,0.16)]'}
                  style={{ backgroundColor: variant.color_hex ?? '#777' }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <HeatmapToggle enabled={showHeatmap} onToggle={onToggleHeatmap} />
          <button
            type="button"
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-left text-sm text-[#F5F0E8]/90"
            onClick={onShare}
          >
            Rotar / Compartir como post
          </button>
        </div>

        <div className="sticky bottom-0 z-10 grid grid-cols-2 gap-2 bg-transparent pt-1">
          <button
            type="button"
            onClick={onSaveToWardrobe}
            className="h-11 rounded-[10px] border border-[#D4614A] bg-transparent text-sm font-semibold text-[#F5F0E8]"
          >
            Guardar outfit
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            className="h-11 rounded-[10px] bg-[#C9A84C] text-sm font-semibold text-[#0D0A08]"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </section>
  );
}
