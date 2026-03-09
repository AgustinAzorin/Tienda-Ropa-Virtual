import { CatalogoClient } from './CatalogoClient';

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  has_3d_model: boolean;
  stock?: number;
}

interface Option {
  id: string;
  name: string;
  slug?: string;
}

async function fetchCatalog(searchParams: Record<string, string | string[] | undefined>) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const params = new URLSearchParams();

  const keys = ['categoryId', 'brandId', 'minPrice', 'maxPrice', 'has3dModel', 'order'];
  keys.forEach((key) => {
    const value = searchParams[key];
    if (!value) return;
    params.set(key, Array.isArray(value) ? value[0] : value);
  });

  params.set('per_page', '24');

  const [productsRes, brandsRes, categoriesRes] = await Promise.all([
    fetch(`${base}/api/catalog/products?${params.toString()}`, { next: { revalidate: 60 } }),
    fetch(`${base}/api/catalog/brands`, { next: { revalidate: 3600 } }),
    fetch(`${base}/api/catalog/categories`, { next: { revalidate: 3600 } }),
  ]);

  const productsJson = productsRes.ok ? await productsRes.json() : { data: { items: [], total: 0 } };
  const brandsJson = brandsRes.ok ? await brandsRes.json() : { data: [] };
  const categoriesJson = categoriesRes.ok ? await categoriesRes.json() : { data: [] };

  const products: ProductItem[] = productsJson.data?.items ?? [];
  const total = productsJson.data?.total ?? 0;

  const flattenCategories = (nodes: Array<{ id: string; name: string; slug: string; children?: unknown[] }>): Option[] => {
    const out: Option[] = [];
    const visit = (list: Array<{ id: string; name: string; slug: string; children?: unknown[] }>) => {
      list.forEach((item) => {
        out.push({ id: item.id, name: item.name, slug: item.slug });
        if (Array.isArray(item.children) && item.children.length > 0) {
          visit(item.children as Array<{ id: string; name: string; slug: string; children?: unknown[] }>);
        }
      });
    };
    visit(nodes);
    return out;
  };

  const categories: Option[] = flattenCategories(categoriesJson.data ?? []);
  const brands: Option[] = (brandsJson.data ?? []).map((b: { id: string; name: string; slug?: string }) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
  }));

  return { products, total, categories, brands };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const data = await fetchCatalog(resolved);

  return (
    <CatalogoClient
      products={data.products}
      total={data.total}
      categories={data.categories}
      brands={data.brands}
    />
  );
}
