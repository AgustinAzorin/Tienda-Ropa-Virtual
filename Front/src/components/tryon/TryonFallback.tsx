import Link from 'next/link';
import type { ProductImage } from '@/lib/tryon/types';

interface TryonFallbackProps {
  images?: ProductImage[];
}

export function TryonFallback({ images = [] }: TryonFallbackProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#0D0A08] px-6 py-10 text-center">
      <p className="max-w-sm text-sm text-[#F5F0E8]/75">
        Tu dispositivo no soporta el probador 3D. Podes ver las fotos del producto.
      </p>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {images.slice(0, 4).map((image) => (
          <img
            key={image.id ?? image.url}
            src={image.url}
            alt={image.alt_text ?? 'Foto de producto'}
            className="aspect-[3/4] w-full rounded-[12px] border border-[rgba(255,255,255,0.08)] object-cover"
          />
        ))}
      </div>

      <Link
        href="/catalogo"
        className="rounded-[10px] bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0D0A08]"
      >
        Volver al catalogo
      </Link>
    </div>
  );
}
