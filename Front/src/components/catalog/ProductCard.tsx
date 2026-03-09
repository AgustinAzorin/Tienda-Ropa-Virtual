'use client';

import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

interface ProductImage {
  id?: string;
  url: string;
  alt_text?: string | null;
}

interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
  brand_name?: string | null;
  stock?: number;
  average_rating?: number | null;
  reviews_count?: number;
  images?: ProductImage[];
}

interface ProductCardVariant {
  id: string;
  stock?: number;
  color?: string | null;
  color_hex?: string | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  variant?: ProductCardVariant;
  showBadge3D?: boolean;
  className?: string;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 900'%3E%3Crect width='800' height='900' fill='%23141010'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%23C9A84C' font-family='Arial'%3EProducto%3C/text%3E%3C/svg%3E";

export function ProductCard({ product, variant, showBadge3D = true, className }: ProductCardProps) {
  const router = useRouter();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [holding, setHolding] = useState(false);

  const rating = product.average_rating ?? 0;
  const reviewsCount = product.reviews_count ?? 0;
  const stock = variant?.stock ?? product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const primaryImage = product.images?.[0]?.url ?? FALLBACK_IMAGE;
  const secondaryImage = product.images?.[1]?.url ?? primaryImage;
  const frontAlt = product.images?.[0]?.alt_text ?? product.name;

  const stars = useMemo(() => {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < full);
  }, [rating]);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const onPointerDown = () => {
    setHolding(true);
    clearHold();
    holdTimer.current = setTimeout(() => {
      setFlipped(true);
    }, 500);
  };

  const onPointerUp = () => {
    setHolding(false);
    clearHold();
  };

  const onOpenProduct = () => {
    router.push(`/producto/${product.slug}`);
  };

  const onOpenTryOn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    router.push(`/probador/${product.id}`);
  };

  return (
    <article
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]',
        className,
      )}
      onClick={onOpenProduct}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenProduct();
        }
      }}
    >
      {showBadge3D && product.has_3d_model && (
        <button
          type="button"
          className="absolute left-2 top-2 z-20 rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.15)] px-2 py-1 text-[11px] font-medium text-[#F5F0E8]"
          onClick={onOpenTryOn}
        >
          🧍 Probalo en 3D
        </button>
      )}

      <div className="relative h-[270px] [perspective:1200px]">
        <div
          className={cn(
            'relative h-full w-full transition-transform duration-[380ms] ease-out [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image src={primaryImage} alt={frontAlt} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" />
          </div>
          <div className="absolute inset-0 flex [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {product.has_3d_model ? (
              <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(201,168,76,0.18),transparent_55%),#141010]">
                <span className="animate-pulse-amber text-6xl">🧍</span>
                <p className="absolute bottom-3 font-mono text-xs text-[#C9A84C]">Preview 3D</p>
              </div>
            ) : (
              <Image
                src={secondaryImage}
                alt={`${product.name} vista alternativa`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            )}
          </div>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
            <span className="rounded-[8px] border border-[rgba(255,255,255,0.2)] bg-[rgba(13,10,8,0.72)] px-3 py-1 text-sm text-[#F5F0E8]">
              Sin stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div>
          <p className="line-clamp-1 text-sm text-[#F5F0E8]/60">{product.brand_name ?? 'Marca'}</p>
          <h3 className="line-clamp-1 text-base font-medium text-[#F5F0E8]">{product.name}</h3>
        </div>

        <PriceDisplay productId={product.id} variantId={variant?.id} installments={3} />

        {reviewsCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#F5F0E8]/70">
            <span className="inline-flex gap-0.5" aria-label={`Rating ${rating.toFixed(1)} de 5`}>
              {stars.map((isFilled, index) => (
                <span key={index} className={isFilled ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/25'}>
                  ★
                </span>
              ))}
            </span>
            <span>{rating.toFixed(1)} ({reviewsCount})</span>
          </div>
        )}
      </div>

      {holding && <span className="sr-only">Manteniendo pulsado</span>}
    </article>
  );
}
