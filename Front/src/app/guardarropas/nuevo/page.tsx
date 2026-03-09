import type { Product } from '@/lib/tryon/types';
import { OutfitComposer } from '@/components/wardrobe/OutfitComposer';

async function getCatalogProducts(): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const response = await fetch(`${base}/api/catalog/products?per_page=40&has_3d_model=true`, {
      next: { revalidate: 180 },
    });
    if (!response.ok) return [];
    const json = await response.json();
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function NuevoOutfitPage() {
  const products = await getCatalogProducts();
  return <OutfitComposer products={products} />;
}
