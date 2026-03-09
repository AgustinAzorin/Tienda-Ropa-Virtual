'use client';

interface Variant {
  id: string;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  stock?: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onChange: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedVariantId, onChange }: VariantSelectorProps) {
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = variants.filter((v) => v.color_hex);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-[#F5F0E8]/70">Talle</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const variant = variants.find((v) => v.size === size);
            if (!variant) return null;
            const active = selectedVariantId === variant.id;
            return (
              <button
                type="button"
                key={variant.id}
                onClick={() => onChange(variant.id)}
                className={`rounded-[8px] border px-3 py-1.5 text-sm ${
                  active
                    ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)]'
                    : 'border-[rgba(255,255,255,0.12)] text-[#F5F0E8]/75'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-[#F5F0E8]/70">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((variant) => {
            const active = selectedVariantId === variant.id;
            return (
              <button
                type="button"
                key={`color-${variant.id}`}
                onClick={() => onChange(variant.id)}
                title={variant.color ?? 'Color'}
                className={`h-8 w-8 rounded-full border ${active ? 'border-[#C9A84C]' : 'border-[rgba(255,255,255,0.2)]'}`}
                style={{ backgroundColor: variant.color_hex ?? '#888' }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
