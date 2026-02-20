import type { Product } from '@/models/catalog/Product';
import type { ProductFilterParams, ProductWithVariants } from './ICatalogRepository';

export interface ICatalogService {
  listProducts(filters: ProductFilterParams): Promise<{ items: Product[]; total: number }>;
  getProductById(id: string): Promise<ProductWithVariants>;
  getProductBySlug(slug: string): Promise<ProductWithVariants>;
  getByCategory(categoryId: string): Promise<Product[]>;
  getByBrand(brandId: string): Promise<Product[]>;
  getRelatedProducts(productId: string): Promise<Product[]>;
  checkStock(variantId: string): Promise<{ inStock: boolean; stock: number }>;
}
