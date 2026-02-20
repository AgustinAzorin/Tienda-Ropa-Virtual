export interface ProductImage {
  id: string; // uuid PK
  product_id: string; // uuid FK → products.id
  /** nullable — imagen puede ser del producto o de una variante específica */
  variant_id: string | null; // uuid FK → product_variants.id
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}
