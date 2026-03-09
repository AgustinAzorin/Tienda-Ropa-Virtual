import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/catalog/ProductCard';

export const revalidate = 3600;

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  parent_id?: string | null;
  children?: CategoryNode[];
}

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
}

async function fetchCategories(base: string): Promise<CategoryNode[]> {
  const res = await fetch(`${base}/api/catalog/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const visit = (list: CategoryNode[], parentId?: string | null) => {
    list.forEach((item) => {
      out.push({ ...item, parent_id: parentId ?? null });
      if (item.children?.length) visit(item.children, item.id);
    });
  };
  visit(nodes);
  return out;
}

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const categories = flatten(await fetchCategories(base));
  return categories.map((cat) => ({ categoria: cat.slug }));
}

export default async function CatalogoCategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const { categoria } = await params;
  const resolvedSearch = await searchParams;

  const categoriesTree = await fetchCategories(base);
  const categories = flatten(categoriesTree);
  const currentCategory = categories.find((item) => item.slug === categoria);

  if (!currentCategory) notFound();

  const subcategoria = (Array.isArray(resolvedSearch.subcategoria)
    ? resolvedSearch.subcategoria[0]
    : resolvedSearch.subcategoria) ?? undefined;

  const effectiveCategory = categories.find((c) => c.slug === subcategoria) ?? currentCategory;

  const productsRes = await fetch(`${base}/api/catalog/categories/${effectiveCategory.id}/products?per_page=24`, {
    next: { revalidate: 60 },
  });

  const productsJson = productsRes.ok ? await productsRes.json() : { data: { items: [], total: 0 } };

  const products: ProductItem[] = productsJson.data?.items ?? [];
  const total: number = productsJson.data?.total ?? 0;

  const parent = currentCategory.parent_id
    ? categories.find((c) => c.id === currentCategory.parent_id)
    : undefined;

  const subcategories = categories.filter((item) => item.parent_id === currentCategory.id);

  return (
    <div className="min-h-dvh bg-[#0D0A08] pb-24">
      <section className="relative h-[30vh] w-full overflow-hidden md:h-[40vh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.28),transparent_40%),linear-gradient(180deg,rgba(13,10,8,0.25),rgba(13,10,8,0.95))]" />
        <div className="absolute bottom-5 left-4 right-4 md:left-8">
          <p className="font-mono text-sm text-[#F5F0E8]/55">{total} productos</p>
          <h1 className="font-display text-4xl italic md:text-5xl">{currentCategory.name}</h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pt-5 md:px-8">
        <nav className="mb-4 text-xs text-[#F5F0E8]/60">
          <Link href="/home" className="hover:text-[#F5F0E8]">Home</Link>
          {parent && (
            <>
              <span className="px-1.5">&gt;</span>
              <span>{parent.name}</span>
            </>
          )}
          <span className="px-1.5">&gt;</span>
          <span className="text-[#F5F0E8]">{currentCategory.name}</span>
        </nav>

        <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/catalogo/${categoria}`}
            className={
              !subcategoria
                ? 'rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.15)] px-3 py-1.5 text-sm'
                : 'rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1.5 text-sm text-[#F5F0E8]/70'
            }
          >
            Todos
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/catalogo/${categoria}?subcategoria=${sub.slug}`}
              className={
                subcategoria === sub.slug
                  ? 'rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.15)] px-3 py-1.5 text-sm'
                  : 'rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1.5 text-sm text-[#F5F0E8]/70'
              }
            >
              {sub.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                brand_name: currentCategory.name,
                average_rating: 4.1,
                reviews_count: 21,
                stock: 8,
              }}
              showBadge3D
            />
          ))}
        </div>
      </div>
    </div>
  );
}
