import GuardarropasClient from './GuardarropasClient';
import type { Product, SaveItem, TryonSession } from '@/lib/tryon/types';

async function getTryonSessions(): Promise<TryonSession[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${base}/api/tryon/sessions`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getSaves(): Promise<SaveItem[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${base}/api/social/saves`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getProductsById(productIds: string[]): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const unique = Array.from(new Set(productIds));

  const fetched = await Promise.all(unique.map(async (id) => {
    const byId = await fetch(`${base}/api/catalog/products/${id}`, { next: { revalidate: 180 } });
    if (!byId.ok) return null;
    const byIdJson = await byId.json();
    const slug = byIdJson.data?.slug;
    if (!slug) return null;

    const detail = await fetch(`${base}/api/catalog/products/${slug}`, { next: { revalidate: 180 } });
    if (!detail.ok) return null;
    const detailJson = await detail.json();
    return (detailJson.data ?? null) as Product | null;
  }));

  return fetched.filter((item): item is Product => !!item);
}

export default async function GuardarropasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const [tryonSessions, saves] = await Promise.all([getTryonSessions(), getSaves()]);

  const productIds = saves.map((save) => save.product_id).filter((id): id is string => !!id);
  const saveProducts = await getProductsById(productIds);

  const initialTab = tab === 'probadas' || tab === 'guardadas' ? tab : 'outfits';

  return (
    <GuardarropasClient
      initialTryonSessions={tryonSessions}
      initialSaves={saves}
      saveProducts={saveProducts}
      initialTab={initialTab}
    />
  );
}
