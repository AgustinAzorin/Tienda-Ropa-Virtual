import { type NextRequest } from 'next/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { catalogService } from '@/modules/catalog/catalog.service';
import {
  brands,
  categories,
  product3dAssets,
  productImages,
  productVariants,
  products,
  reviews,
  tryonSessions,
} from '@/db/schema';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const MOCK_PRODUCT_DETAILS = [
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
    variants: [
      {
        id: 'mock-variant-pantalon-001',
        product_id: 'mock-pantalon-001',
        size: 'M',
        color: 'Negro',
        color_hex: '#0D0A08',
        stock: 12,
      },
    ],
    assets_3d: [],
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
    variants: [
      {
        id: 'mock-variant-remera-001',
        product_id: 'mock-remera-001',
        size: 'L',
        color: 'Blanco Hueso',
        color_hex: '#F5F0E8',
        stock: 20,
      },
    ],
    assets_3d: [],
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
    variants: [
      {
        id: 'mock-variant-zapatillas-001',
        product_id: 'mock-zapatillas-001',
        size: '42',
        color: 'Gris',
        color_hex: '#6B7280',
        stock: 8,
      },
    ],
    assets_3d: [],
  },
] as const;

type VariantSelection = {
  id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock: number;
};

async function ensureMockBackingVariant(mock: (typeof MOCK_PRODUCT_DETAILS)[number]): Promise<VariantSelection | null> {
  const sku = `mock-backing-${mock.id}`;
  const [existingVariant] = await db
    .select({
      id: productVariants.id,
      size: productVariants.size,
      color: productVariants.color,
      color_hex: productVariants.color_hex,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .where(eq(productVariants.sku, sku))
    .limit(1);

  if (existingVariant) {
    if (existingVariant.stock > 0) return existingVariant;
    const [updated] = await db
      .update(productVariants)
      .set({ stock: Math.max(1, mock.stock) })
      .where(eq(productVariants.id, existingVariant.id))
      .returning({
        id: productVariants.id,
        size: productVariants.size,
        color: productVariants.color,
        color_hex: productVariants.color_hex,
        stock: productVariants.stock,
      });
    return updated ?? existingVariant;
  }

  let [brand] = await db.select().from(brands).limit(1);
  if (!brand) {
    [brand] = await db
      .insert(brands)
      .values({
        name: 'Anya Demo',
        slug: 'anya-demo',
        is_active: true,
      })
      .returning();
  }

  let [category] = await db.select().from(categories).limit(1);
  if (!category) {
    [category] = await db
      .insert(categories)
      .values({
        name: 'Demo',
        slug: 'demo',
        sort_order: 0,
      })
      .returning();
  }

  if (!brand || !category) return null;

  const backingSlug = `mock-backing-${mock.slug}`;
  let [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, backingSlug))
    .limit(1);

  if (!product) {
    [product] = await db
      .insert(products)
      .values({
        brand_id: brand.id,
        category_id: category.id,
        name: `${mock.name} (Demo)` ,
        slug: backingSlug,
        description: mock.description,
        price: String(mock.price),
        compare_at_price: null,
        currency: mock.currency,
        is_active: true,
        has_3d_model: false,
        tags: [...mock.tags],
      })
      .returning();
  }

  if (!product) return null;

  const template = mock.variants[0];
  const [createdVariant] = await db
    .insert(productVariants)
    .values({
      product_id: product.id,
      size: template?.size ?? 'U',
      color: template?.color ?? 'Demo',
      color_hex: template?.color_hex ?? '#0D0A08',
      sku,
      stock: Math.max(1, mock.stock),
      price_override: String(mock.price),
    })
    .returning({
      id: productVariants.id,
      size: productVariants.size,
      color: productVariants.color,
      color_hex: productVariants.color_hex,
      stock: productVariants.stock,
    });

  return createdVariant ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const mockBySlugOrId = MOCK_PRODUCT_DETAILS.find(
      (item) => item.slug === slug || item.id === slug,
    );
    if (mockBySlugOrId) {
      const selected = await ensureMockBackingVariant(mockBySlugOrId);

      if (!selected) {
        return ok({
          ...mockBySlugOrId,
          stock: 0,
          variants: [],
        });
      }

      const normalized = {
        ...mockBySlugOrId,
        stock: selected.stock,
        variants: mockBySlugOrId.variants.map((variant) => ({
          ...variant,
          id: selected.id,
          size: variant.size ?? selected.size,
          color: variant.color ?? selected.color,
          color_hex: variant.color_hex ?? selected.color_hex,
          stock: selected.stock,
        })),
      };

      return ok(normalized);
    }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

    if (isUuid) {
      const product = await catalogService.getProductById(slug);
      return ok(product);
    }

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.is_active, true)))
      .limit(1);

    if (!product) {
      return ok(null, undefined, 404);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [brand, category, variants, images, assets, ratingRow, tryonRow] = await Promise.all([
      db.select().from(brands).where(eq(brands.id, product.brand_id)).limit(1).then((rows) => rows[0] ?? null),
      db
        .select()
        .from(categories)
        .where(eq(categories.id, product.category_id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db.select().from(productVariants).where(eq(productVariants.product_id, product.id)),
      db.select().from(productImages).where(eq(productImages.product_id, product.id)).orderBy(desc(productImages.is_primary), productImages.sort_order),
      db.select().from(product3dAssets).where(eq(product3dAssets.product_id, product.id)),
      db
        .select({
          average_rating: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
          reviews_count: sql<number>`count(*)`,
        })
        .from(reviews)
        .where(eq(reviews.product_id, product.id))
        .then((rows) => rows[0]),
      db
        .select({ tryon_count_7d: sql<number>`count(*)` })
        .from(tryonSessions)
        .where(and(eq(tryonSessions.product_id, product.id), gte(tryonSessions.created_at, sevenDaysAgo)))
        .then((rows) => rows[0]),
    ]);

    return ok({
      ...product,
      brand,
      category,
      variants,
      images,
      assets_3d: assets,
      average_rating: Number(ratingRow?.average_rating ?? 0),
      reviews_count: Number(ratingRow?.reviews_count ?? 0),
      tryon_count_7d: Number(tryonRow?.tryon_count_7d ?? 0),
    });
  } catch (err) {
    return handleError(err);
  }
}
