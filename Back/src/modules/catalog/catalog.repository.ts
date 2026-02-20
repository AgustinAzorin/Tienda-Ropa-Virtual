import { db } from '@/db/client';
import { products, productVariants } from '@/db/schema';
import { eq, ilike, and, gte, lte, sql, inArray, or } from 'drizzle-orm';
import type { Product } from '@/models/catalog/Product';
import type { ProductVariant } from '@/models/catalog/ProductVariant';
import type { ICatalogRepository, ProductFilterParams, ProductWithVariants } from './interfaces/ICatalogRepository';

export class CatalogRepository implements ICatalogRepository {

  async list(f: ProductFilterParams): Promise<{ items: Product[]; total: number }> {
    const page     = f.page     ?? 1;
    const per_page = f.per_page ?? 20;
    const offset   = (page - 1) * per_page;

    const conditions = [eq(products.is_active, true)];
    if (f.categoryId) conditions.push(eq(products.category_id, f.categoryId));
    if (f.brandId)    conditions.push(eq(products.brand_id, f.brandId));
    if (f.has3dModel !== undefined) conditions.push(eq(products.has_3d_model, f.has3dModel));
    if (f.minPrice)   conditions.push(gte(products.price, String(f.minPrice)));
    if (f.maxPrice)   conditions.push(lte(products.price, String(f.maxPrice)));
    if (f.q) {
      conditions.push(
        or(
          ilike(products.name, `%${f.q}%`),
          ilike(products.description ?? products.name, `%${f.q}%`),
          sql`${products.tags} @> ARRAY[${f.q}]::text[]`,
        )!
      );
    }

    const where = and(...conditions);
    const [items, countResult] = await Promise.all([
      db.select().from(products).where(where).limit(per_page).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products).where(where),
    ]);

    return { items: items as Product[], total: Number(countResult[0]?.count ?? 0) };
  }

  async findById(id: string): Promise<ProductWithVariants | null> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) return null;
    const variants = await db.select().from(productVariants).where(eq(productVariants.product_id, id));
    return { ...(product as Product), variants: variants as ProductVariant[] };
  }

  async findBySlug(slug: string): Promise<ProductWithVariants | null> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) return null;
    const variants = await db.select().from(productVariants).where(eq(productVariants.product_id, product.id));
    return { ...(product as Product), variants: variants as ProductVariant[] };
  }

  async findByCategory(categoryId: string, includeChildren = false): Promise<Product[]> {
    if (!includeChildren) {
      return db.select().from(products)
        .where(and(eq(products.category_id, categoryId), eq(products.is_active, true))) as Promise<Product[]>;
    }
    // Recursive CTE to get all child category ids
    const childIds = await db.execute<{ id: string }>(sql`
      WITH RECURSIVE subtree AS (
        SELECT id FROM categories WHERE id = ${categoryId}
        UNION ALL
        SELECT c.id FROM categories c JOIN subtree s ON c.parent_id = s.id
      )
      SELECT id FROM subtree
    `);
    const ids = childIds.rows.map((r) => r.id);
    return db.select().from(products)
      .where(and(inArray(products.category_id, ids), eq(products.is_active, true))) as Promise<Product[]>;
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    return db.select().from(products)
      .where(and(eq(products.brand_id, brandId), eq(products.is_active, true))) as Promise<Product[]>;
  }

  async findRelated(productId: string, limit = 8): Promise<Product[]> {
    const [source] = await db.select({ category_id: products.category_id, brand_id: products.brand_id })
      .from(products).where(eq(products.id, productId)).limit(1);
    if (!source) return [];
    return db.select().from(products)
      .where(and(
        or(eq(products.category_id, source.category_id), eq(products.brand_id, source.brand_id))!,
        eq(products.is_active, true),
        sql`${products.id} <> ${productId}`,
      ))
      .limit(limit) as Promise<Product[]>;
  }

  async getVariantStock(variantId: string): Promise<number> {
    const [row] = await db.select({ stock: productVariants.stock })
      .from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
    return row?.stock ?? 0;
  }

  async decrementStock(variantId: string, qty: number): Promise<void> {
    await db.update(productVariants)
      .set({ stock: sql`${productVariants.stock} - ${qty}` })
      .where(eq(productVariants.id, variantId));
  }

  async findVariantBySku(sku: string): Promise<ProductVariant | null> {
    const [row] = await db.select().from(productVariants).where(eq(productVariants.sku, sku)).limit(1);
    return (row as ProductVariant) ?? null;
  }
}
