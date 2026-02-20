import type { Product } from '@/models/catalog/Product';
import type { ProductVariant } from '@/models/catalog/ProductVariant';

export interface ProductFilterParams {
  q?:          string;
  categoryId?: string;
  brandId?:    string;
  size?:       string;
  color?:      string;
  minPrice?:   number;
  maxPrice?:   number;
  has3dModel?: boolean;
  page?:       number;
  per_page?:   number;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface ICatalogRepository {
  list(filters: ProductFilterParams): Promise<{ items: Product[]; total: number }>;
  findById(id: string): Promise<ProductWithVariants | null>;
  findBySlug(slug: string): Promise<ProductWithVariants | null>;
  findByCategory(categoryId: string, includeChildren?: boolean): Promise<Product[]>;
  findByBrand(brandId: string): Promise<Product[]>;
  findRelated(productId: string, limit?: number): Promise<Product[]>;
  getVariantStock(variantId: string): Promise<number>;
  decrementStock(variantId: string, qty: number): Promise<void>;
  findVariantBySku(sku: string): Promise<ProductVariant | null>;
}
