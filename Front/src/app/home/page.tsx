import { BentoGrid } from '@/components/ui/BentoGrid';
import { ProductCard } from '@/components/catalog/ProductCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Link from 'next/link';
import { Suspense } from 'react';

interface CatalogResponse {
  items?: Array<{
    id: string;
    slug: string;
    name: string;
    has_3d_model: boolean;
    stock?: number;
    images?: Array<{ url: string; alt_text?: string | null }>;
  }>;
}

async function getTrendingProducts() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  try {
    const response = await fetch(`${base}/api/catalog/products?per_page=12`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) return [];
    const json = (await response.json()) as { data?: CatalogResponse };

    const items = json.data?.items ?? [];

    return items.map((item, index) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      has_3d_model: item.has_3d_model,
      stock: item.stock ?? 10,
      average_rating: 4 + (index % 5) / 10,
      reviews_count: 12 + index * 2,
      brand_name: 'Marca destacada',
      images: item.images ?? [],
    }));
  } catch {
    return [];
  }
}

async function HomeBento() {
  const products = await getTrendingProducts();
  const featured = products[0];

  const bentoItems = [
    {
      id: 'featured-post',
      content: (
        <div className="relative h-full w-full overflow-hidden p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.2),transparent_45%),linear-gradient(160deg,#211812,#0f0c0a)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <p className="text-xs uppercase tracking-widest text-[#C9A84C]">Post destacado</p>
            <h2 className="font-display text-2xl italic text-[#F5F0E8]">Look nocturno en capas fluidas</h2>
            <p className="text-sm text-[#F5F0E8]/65">@lucia.style · 1.2k likes</p>
          </div>
        </div>
      ),
    },
    {
      id: 'trend-product',
      content: featured ? (
        <ProductCard product={featured} showBadge3D />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[#F5F0E8]/70">Sin tendencias por ahora</div>
      ),
    },
    {
      id: 'tryon-slot',
      content: (
        <Link
          href="/probador"
          className="flex h-full w-full animate-[pulse-amber_3s_ease-in-out_infinite] flex-col items-center justify-center gap-2"
        >
          <span className="text-4xl text-[#C9A84C]">🧍</span>
          <p className="font-display text-lg italic">Probate algo nuevo</p>
        </Link>
      ),
    },
    {
      id: 'outfit-day',
      content: (
        <div className="flex h-full flex-col justify-between p-4">
          <p className="text-xs uppercase tracking-widest text-[#C9A84C]">Outfit del dia</p>
          <p className="text-sm text-[#F5F0E8]/70">Post mas likeado de las ultimas 24hs</p>
        </div>
      ),
    },
    {
      id: 'vibe-banner',
      content: (
        <div className="flex h-full flex-col justify-end bg-[linear-gradient(20deg,rgba(212,97,74,0.16),transparent_55%),linear-gradient(180deg,transparent,rgba(13,10,8,0.7))] p-4">
          <p className="text-xs uppercase tracking-widest text-[#F5F0E8]/60">Basado en tus vibes</p>
          <h3 className="font-display text-xl italic">Minimal estructurado</h3>
        </div>
      ),
    },
    {
      id: 'wishlist-counter',
      content: (
        <Link href="/wishlist" className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <span className="font-mono text-3xl text-[#C9A84C]">18</span>
          <span className="text-sm text-[#F5F0E8]/70">prendas en wishlist</span>
        </Link>
      ),
    },
  ];

  return <BentoGrid items={bentoItems} layout="discovery" />;
}

async function VibesSection() {
  const products = await getTrendingProducts();

  if (products.length === 0) {
    return (
      <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#F5F0E8]/75">
        Completa tu perfil para recomendaciones personalizadas.
        <Link href="/onboarding/perfil" className="ml-2 text-[#C9A84C] hover:text-[#B8942E]">
          Ir al perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.slice(0, 8).map((product) => (
        <div key={product.id} className="w-[220px] shrink-0">
          <ProductCard product={product} showBadge3D />
        </div>
      ))}
    </div>
  );
}

async function MixedFeedSection() {
  const products = await getTrendingProducts();

  return (
    <div className="space-y-3">
      {products.slice(0, 6).map((product, index) => (
        <div
          key={product.id}
          className="overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
        >
          {index % 2 === 0 ? (
            <div className="p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-[#F5F0E8]/45">Social</p>
              <h3 className="font-display text-xl italic">Post de alguien que seguis</h3>
              <p className="mt-1 text-sm text-[#F5F0E8]/70">Sin separacion visual: social y producto conviven.</p>
            </div>
          ) : (
            <div className="p-2">
              <div className="mb-2 inline-flex rounded-full border border-[#D4614A]/60 bg-[rgba(212,97,74,0.12)] px-2 py-1 text-[11px] text-[#F5F0E8]">
                Sugerido
              </div>
              <ProductCard product={product} showBadge3D />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="space-y-3">
          <h1 className="font-display text-3xl italic">Inicio</h1>
          <p className="text-sm text-[#F5F0E8]/60">Tu hub de discovery y social commerce.</p>
          <Suspense fallback={<SkeletonCard className="h-[420px]" />}>
            <HomeBento />
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl italic">Para tu estilo minimal</h2>
          <Suspense fallback={<div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
            <VibesSection />
          </Suspense>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl italic">Feed</h2>
          <Suspense fallback={<div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-56" />)}</div>}>
            <MixedFeedSection />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
