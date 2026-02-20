import { db } from '@/db/client';
import { products, productVariants, orders } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { CatalogRepository } from '@/modules/catalog/catalog.repository';
import { uploadFile } from '@/lib/storage';
import type { Product } from '@/models/catalog/Product';

const catalogRepo = new CatalogRepository();

export interface AdminProductDto {
  brandId:      string;
  categoryId:   string;
  name:          string;
  slug:          string;
  description?:  string;
  price:         number;
  currency?:     string;
  tags?:         string[];
}

export interface AdminProductVariantDto {
  size?:          string;
  color?:         string;
  colorHex?:      string;
  sku:            string;
  stock:          number;
  priceOverride?: number;
  weightG?:       number;
}

export class AdminService {

  // ── Products ──────────────────────────────────────────────────────────────
  async createProduct(dto: AdminProductDto): Promise<Product> {
    const [row] = await db.insert(products).values({
      brand_id:    dto.brandId,
      category_id: dto.categoryId,
      name:        dto.name,
      slug:        dto.slug,
      description: dto.description ?? null,
      price:       String(dto.price),
      currency:    dto.currency ?? 'ARS',
      tags:        dto.tags ?? [],
    }).returning();
    return row as Product;
  }

  async updateProduct(id: string, dto: Partial<AdminProductDto>): Promise<Product> {
    const updateData: Record<string, unknown> = {};
    if (dto.name)        updateData.name        = dto.name;
    if (dto.description) updateData.description = dto.description;
    if (dto.price)       updateData.price       = String(dto.price);
    if (dto.tags)        updateData.tags        = dto.tags;

    const [row] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return row as Product;
  }

  async createVariant(productId: string, dto: AdminProductVariantDto) {
    const [row] = await db.insert(productVariants).values({
      product_id:     productId,
      size:           dto.size ?? null,
      color:          dto.color ?? null,
      color_hex:      dto.colorHex ?? null,
      sku:            dto.sku,
      stock:          dto.stock,
      price_override: dto.priceOverride ? String(dto.priceOverride) : null,
      weight_g:       dto.weightG ?? null,
    }).returning();
    return row;
  }

  async updateVariantStock(variantId: string, stock: number): Promise<void> {
    const previous = await catalogRepo.getVariantStock(variantId);
    await db.update(productVariants).set({ stock }).where(eq(productVariants.id, variantId));
  // Trigger restock notifications if stock went from 0 to positive
    if (previous === 0 && stock > 0) {
      const { notificationService } = await import('@/modules/notifications/notifications.service');
      await notificationService.triggerRestock(variantId);
    }
  }

  async upload3dAsset(productId: string, buffer: Buffer, filename: string): Promise<string> {
    const path = `${productId}/${Date.now()}-${filename}`;
    return uploadFile('models-3d', path, buffer, 'model/gltf-binary');
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  async listOrdersByStatus(status?: string) {
    const conditions = status ? [eq(orders.status, status)] : [];
    return db.select().from(orders)
      .where(conditions.length ? conditions[0] : sql`1=1`)
      .orderBy(desc(orders.created_at));
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  async getTryonMetrics(daysPast = 30) {
    const { tryonService } = await import('@/modules/tryon/tryon.service');
    return tryonService.getConversionStats(daysPast);
  }

  async getReturnMetrics() {
    const { ReturnRepository } = await import('@/modules/returns/returns.service');
    return new ReturnRepository().getMetrics();
  }
}

export const adminService = new AdminService();
