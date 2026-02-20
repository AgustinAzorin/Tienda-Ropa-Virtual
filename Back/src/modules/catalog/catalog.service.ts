import { NotFoundError } from '@/lib/errors';
import { CatalogRepository } from './catalog.repository';
import type { ICatalogService } from './interfaces/ICatalogService';
import type { ProductFilterParams, ProductWithVariants } from './interfaces/ICatalogRepository';
import type { Product } from '@/models/catalog/Product';

export class CatalogService implements ICatalogService {
  constructor(private readonly repo = new CatalogRepository()) {}

  async listProducts(filters: ProductFilterParams) {
    return this.repo.list(filters);
  }

  async getProductById(id: string): Promise<ProductWithVariants> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundError('Producto');
    return product;
  }

  async getProductBySlug(slug: string): Promise<ProductWithVariants> {
    const product = await this.repo.findBySlug(slug);
    if (!product) throw new NotFoundError('Producto');
    return product;
  }

  async getByCategory(categoryId: string): Promise<Product[]> {
    return this.repo.findByCategory(categoryId, true);
  }

  async getByBrand(brandId: string): Promise<Product[]> {
    return this.repo.findByBrand(brandId);
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    return this.repo.findRelated(productId);
  }

  async checkStock(variantId: string): Promise<{ inStock: boolean; stock: number }> {
    const stock = await this.repo.getVariantStock(variantId);
    return { inStock: stock > 0, stock };
  }
}

export const catalogService = new CatalogService();
