import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ProductGallery } from '@/components/catalog/ProductGallery';
import { VariantSelector } from '@/components/catalog/VariantSelector';
import { ReviewCard } from '@/components/catalog/ReviewCard';
import { UGCGallery } from '@/components/catalog/UGCGallery';
import { RelatedProducts } from '@/components/catalog/RelatedProducts';

interface Variant {
  id: string;
  size?: string | null;
  color?: string | null;
  color_hex?: string | null;
  stock?: number;
}

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  has_3d_model: boolean;
  variants: Variant[];
  average_rating?: number;
  reviews_count?: number;
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${base}/api/catalog/products/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Producto no encontrado' };
  }

  return {
    title: `${product.name} | Tienda`,
    description: product.description ?? 'Detalle de producto',
    openGraph: {
      title: product.name,
      description: product.description ?? 'Detalle de producto',
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const [relatedRes, reviewsRes, ugcRes] = await Promise.all([
    fetch(`${base}/api/catalog/products/${slug}/related`, { next: { revalidate: 120 } }),
    fetch(`${base}/api/reviews/products/${product.id}?per_page=5`, { next: { revalidate: 120 } }),
    fetch(`${base}/api/social/posts/by-product/${product.id}`, { next: { revalidate: 120 } }),
  ]);

  const relatedJson = relatedRes.ok ? await relatedRes.json() : { data: [] };
  const reviewsJson = reviewsRes.ok ? await reviewsRes.json() : { data: [] };
  const ugcJson = ugcRes.ok ? await ugcRes.json() : { data: [] };

  const variants = product.variants ?? [];
  const firstVariant = variants[0];

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-32 pt-6 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={[]} has3d={product.has_3d_model} />

        <section className="space-y-5">
          <div>
            <Link href="/marca/default" className="text-sm text-[#F5F0E8]/65">Marca</Link>
            <h1 className="font-display text-4xl italic">{product.name}</h1>
            <p className="mt-1 text-sm text-[#F5F0E8]/70">
              {Number(product.average_rating ?? 0).toFixed(1)} ★ ({product.reviews_count ?? 0} resenas)
            </p>
          </div>

          <PriceDisplay productId={product.id} variantId={firstVariant?.id} installments={3} />

          <VariantSelector variants={variants} selectedVariantId={firstVariant?.id} onChange={() => {}} />

          <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
            <h3 className="font-display text-2xl italic">Descripcion</h3>
            <p className="mt-2 text-sm text-[#F5F0E8]/75">{product.description ?? 'Sin descripcion disponible.'}</p>
          </div>

          <section className="space-y-3">
            <h3 className="font-display text-2xl italic">Lo que dice la comunidad</h3>
            {(reviewsJson.data ?? []).slice(0, 5).map((review: { id: string; rating: number; fit_rating?: string | null; body?: string | null; user_id: string }) => (
              <ReviewCard
                key={review.id}
                username={review.user_id.slice(0, 8)}
                rating={Number(review.rating)}
                fit={review.fit_rating ?? undefined}
                text={review.body ?? 'Sin comentario.'}
              />
            ))}
          </section>

          <UGCGallery
            items={(ugcJson.data ?? []).slice(0, 8).map((post: { id: string; user_id: string }) => ({
              id: post.id,
              author: post.user_id.slice(0, 8),
            }))}
          />
        </section>
      </div>

      <section className="mx-auto mt-8 w-full max-w-7xl">
        <RelatedProducts
          items={(relatedJson.data ?? []).slice(0, 10)}
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(255,255,255,0.08)] bg-[#0D0A08]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          {product.has_3d_model ? (
            <button className="h-12 flex-1 rounded-[8px] bg-[#C9A84C] text-sm font-semibold text-[#0D0A08]">🧍 Probar en 3D</button>
          ) : null}
          <button className="h-12 flex-1 rounded-[8px] bg-[#D4614A] text-sm font-semibold text-[#F5F0E8]">Agregar al carrito</button>
        </div>
      </div>
    </main>
  );
}
