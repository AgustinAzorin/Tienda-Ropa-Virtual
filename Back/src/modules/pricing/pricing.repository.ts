import { db } from '@/db/client';
import { priceHistory, products } from '@/db/schema';
import { eq, and, lte, isNull, or, desc, sql } from 'drizzle-orm';
import type { IPricingRepository, PriceRecord, SetPriceDto } from './interfaces/IPricingRepository';

export class PricingRepository implements IPricingRepository {

  async findCurrentPrice(productId: string): Promise<PriceRecord | null> {
    const now = new Date();
    // Find price record where now is within [valid_from, valid_to) or valid_to is null
    const [row] = await db.select().from(priceHistory)
      .where(and(
        eq(priceHistory.product_id, productId),
        lte(priceHistory.valid_from, now),
        or(isNull(priceHistory.valid_to), sql`${priceHistory.valid_to} > ${now}`)!,
      ))
      .orderBy(desc(priceHistory.valid_from))
      .limit(1);

    if (row) return row as unknown as PriceRecord;

    // Fallback: read directly from products table
    const [product] = await db.select({ id: products.id, price: products.price, currency: products.currency })
      .from(products).where(eq(products.id, productId)).limit(1);
    if (!product) return null;
    return {
      id: '', product_id: productId,
      price: Number(product.price), currency: product.currency,
      valid_from: new Date(0).toISOString(), valid_to: null,
      created_at: new Date(0).toISOString(),
    };
  }

  async getHistory(productId: string): Promise<PriceRecord[]> {
    const rows = await db.select().from(priceHistory)
      .where(eq(priceHistory.product_id, productId))
      .orderBy(desc(priceHistory.valid_from));
    return rows as unknown as PriceRecord[];
  }

  async setPrice(productId: string, dto: SetPriceDto): Promise<PriceRecord> {
    const [row] = await db.insert(priceHistory).values({
      product_id: productId,
      price:      String(dto.price),
      currency:   dto.currency,
      valid_from: dto.valid_from,
      valid_to:   dto.valid_to ?? null,
    }).returning();
    return row as unknown as PriceRecord;
  }
}
