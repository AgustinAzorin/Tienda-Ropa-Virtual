export interface ProductVariant {
  id: string; // uuid PK
  product_id: string; // uuid FK → products.id
  size: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string; // UNIQUE
  stock: number;
  /** null = usa el precio del producto padre */
  price_override: number | null;
  weight_g: number | null;
}
