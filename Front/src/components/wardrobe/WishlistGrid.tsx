import { ProductCard } from '@/components/catalog/ProductCard';
import type { SaveItem } from '@/lib/tryon/types';

interface WishlistGridProps {
  saves: SaveItem[];
  onRemove: (saveId: string) => void;
}

export function WishlistGrid({ saves, onRemove }: WishlistGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-[8px] border border-[#C9A84C] px-3 py-1.5 text-xs text-[#C9A84C]"
        >
          Crear coleccion
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {saves.map((save) => (
          <div key={save.id} className="relative">
            {save.product ? <ProductCard product={save.product} showBadge3D /> : null}
            <button
              type="button"
              className="absolute right-2 top-2 z-20 h-7 w-7 rounded-full border border-[rgba(255,255,255,0.2)] bg-[#0D0A08]/80 text-xs"
              onClick={() => onRemove(save.id)}
              aria-label="Quitar de wishlist"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
