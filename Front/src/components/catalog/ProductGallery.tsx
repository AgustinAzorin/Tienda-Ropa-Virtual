'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GalleryImage {
  url: string;
  alt_text?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  has3d: boolean;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 900'%3E%3Crect width='800' height='900' fill='%23141010'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='34' fill='%23C9A84C' font-family='Arial'%3EGaleria%3C/text%3E%3C/svg%3E";

export function ProductGallery({ images, has3d }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : [{ url: FALLBACK_IMAGE, alt_text: 'Producto' }];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="grid gap-3 md:grid-cols-[84px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
        {safeImages.map((img, idx) => (
          <button
            key={`${img.url}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border ${
              idx === activeIndex ? 'border-[#C9A84C]' : 'border-[rgba(255,255,255,0.12)]'
            }`}
          >
            <Image src={img.url} alt={img.alt_text ?? 'Miniatura'} fill className="object-cover" sizes="80px" />
          </button>
        ))}
        {has3d && (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[8px] border border-[#C9A84C] bg-[rgba(201,168,76,0.1)] text-xl">
            🧍
          </div>
        )}
      </div>

      <div className="order-1 overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] md:order-2">
        <div className="relative h-[56vh] min-h-[360px] w-full md:h-[70vh]">
          <Image
            src={safeImages[activeIndex]?.url ?? FALLBACK_IMAGE}
            alt={safeImages[activeIndex]?.alt_text ?? 'Producto'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>
      </div>
    </section>
  );
}
