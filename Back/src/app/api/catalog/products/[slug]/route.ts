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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
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
