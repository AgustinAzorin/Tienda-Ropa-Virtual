import { ProductCard } from '@/components/catalog/ProductCard';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
}

async function getBrands(base: string): Promise<Brand[]> {
  const res = await fetch(`${base}/api/catalog/brands`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const brands = await getBrands(base);
  return brands.map((brand) => ({ slug: brand.slug }));
}

export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const { slug } = await params;

  const brands = await getBrands(base);
  const brand = brands.find((item) => item.slug === slug) ?? {
    id: 'default',
    name: 'Marca',
    slug,
    description: 'Perfil editorial de la marca.',
  };

  const productsRes = await fetch(`${base}/api/catalog/brands/${brand.id}/products?per_page=16`, {
    next: { revalidate: 120 },
  });
  const productsJson = productsRes.ok ? await productsRes.json() : { data: { items: [] } };
  const products: Product[] = productsJson.data?.items ?? [];

  return (
    <main className="min-h-dvh bg-[#0D0A08] px-4 pb-24 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(170deg,#141010,#0f0c0a)] p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-xl">
            {brand.name.slice(0, 1).toUpperCase()}
          </div>
          <h1 className="font-display text-4xl italic">{brand.name}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#F5F0E8]/70">{brand.description ?? 'Sin descripcion'}</p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-[#F5F0E8]/60">
            <span>{products.length} productos</span>
            <span>42 posts de comunidad</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl italic">Productos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  brand_name: brand.name,
                  stock: 12,
                  average_rating: 4.3,
                  reviews_count: 17,
                }}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl italic">Comunidad</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3 text-xs text-[#F5F0E8]/70">
                Post de la comunidad #{index + 1}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
