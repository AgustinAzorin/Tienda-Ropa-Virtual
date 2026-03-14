import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';
import { db } from '@/db/client';
import { categories } from '@/db/schema';

const MOCK_CATALOG_ITEMS = [
  {
    id: 'mock-pantalon-001',
    brand_id: 'mock-brand-anya',
    category_id: 'mock-cat-bottoms',
    name: 'Pantalon Cargo Urbano',
    slug: 'pantalon-cargo-urbano',
    description: 'Pantalon de corte relajado con bolsillos utilitarios.',
    price: '68999',
    compare_at_price: null,
    currency: 'ARS',
    is_active: true,
    has_3d_model: false,
    tags: ['pantalon', 'cargo', 'urbano'],
    stock: 12,
    images: [],
    metadata: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-remera-001',
    brand_id: 'mock-brand-anya',
    category_id: 'mock-cat-tops',
    name: 'Remera Oversize Essential',
    slug: 'remera-oversize-essential',
    description: 'Remera de algodon premium con fit amplio.',
    price: '34999',
    compare_at_price: null,
    currency: 'ARS',
    is_active: true,
    has_3d_model: false,
    tags: ['remera', 'oversize', 'casual'],
    stock: 20,
    images: [],
    metadata: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-zapatillas-001',
    brand_id: 'mock-brand-anya',
    category_id: 'mock-cat-footwear',
    name: 'Zapatillas Chunky Nova',
    slug: 'zapatillas-chunky-nova',
    description: 'Zapatillas urbanas con suela alta y confort diario.',
    price: '99999',
    compare_at_price: null,
    currency: 'ARS',
    is_active: true,
    has_3d_model: false,
    tags: ['zapatillas', 'chunky', 'streetwear'],
    stock: 8,
    images: [],
    metadata: null,
    created_at: new Date().toISOString(),
  },
] as const;

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDailySeed() {
  return new Date().toISOString().slice(0, 10);
}

function resolveMockPrice(productId: string) {
  const seed = `${getDailySeed()}::${productId}`;
  const hash = hashString(seed);
  const min = 19000;
  const max = 139000;
  const step = 500;
  const steps = Math.floor((max - min) / step) + 1;
  return min + (hash % steps) * step;
}

function resolveMockCategoryId(productId: string, availableCategoryIds: string[], fallback: string) {
  if (availableCategoryIds.length === 0) return fallback;
  const seed = `${getDailySeed()}::cat::${productId}`;
  const hash = hashString(seed);
  return availableCategoryIds[hash % availableCategoryIds.length] ?? fallback;
}

function buildMockCatalogItems(availableCategoryIds: string[]) {
  return MOCK_CATALOG_ITEMS.map((item) => ({
    ...item,
    category_id: resolveMockCategoryId(item.id, availableCategoryIds, item.category_id),
    price: String(resolveMockPrice(item.id)),
  }));
}

function filterMockCatalogItems(
  items: Array<(typeof MOCK_CATALOG_ITEMS)[number]>,
  params: {
    q?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock: boolean;
    has3dModel: boolean;
  },
) {
  const query = params.q?.trim().toLowerCase();
  return items.filter((item) => {
    if (params.categoryId && item.category_id !== params.categoryId) return false;
    if (params.brandId && item.brand_id !== params.brandId) return false;
    if (params.has3dModel && !item.has_3d_model) return false;
    if (params.inStock && item.stock <= 0) return false;

    const price = Number(item.price);
    if (params.minPrice !== undefined && price < params.minPrice) return false;
    if (params.maxPrice !== undefined && price > params.maxPrice) return false;

    if (query) {
      const haystack = [
        item.name,
        item.description,
        ...item.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export async function GET(request: NextRequest) {
  try {
    const sp      = request.nextUrl.searchParams;
    const params  = {
      q:          sp.get('search') ?? undefined,
      brandId:    sp.get('brandId') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      minPrice:   sp.has('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice:   sp.has('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      inStock:    sp.get('inStock') === 'true',
      has3dModel: sp.get('has3dModel') === 'true',
      page:       sp.has('page') ? Number(sp.get('page')) : 1,
      per_page:   sp.has('per_page') ? Number(sp.get('per_page')) : 20,
    };
    const products = await catalogService.listProducts(params);
    const categoryRows = await db.select({ id: categories.id }).from(categories);
    const categoryIds = categoryRows.map((row) => row.id);
    const dynamicMockItems = buildMockCatalogItems(categoryIds);

    const filteredMocks = filterMockCatalogItems(dynamicMockItems, {
      q: params.q,
      categoryId: params.categoryId,
      brandId: params.brandId,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      has3dModel: params.has3dModel,
    });

    const combinedItems = [...filteredMocks, ...products.items];
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 20;
    const offset = (page - 1) * perPage;

    const response = ok({
      items: combinedItems.slice(offset, offset + perPage),
      total: combinedItems.length,
    });
    // Public catalog data — cache for 60s, revalidate in background for 5min
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (err) {
    return handleError(err);
  }
}
