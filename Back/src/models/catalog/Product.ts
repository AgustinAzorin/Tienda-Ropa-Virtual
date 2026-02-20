export interface Product {
  id: string; // uuid PK
  brand_id: string; // uuid FK → brands.id
  category_id: string; // uuid FK → categories.id
  name: string;
  slug: string; // UNIQUE
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string; // DEFAULT 'ARS'
  is_active: boolean;
  has_3d_model: boolean;
  tags: string[]; // text[]
  metadata: Record<string, unknown> | null; // jsonb
  created_at: string; // timestamptz
}
