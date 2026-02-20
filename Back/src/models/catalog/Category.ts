export interface Category {
  id: string; // uuid PK
  /** Self-join para jerarquía de categorías */
  parent_id: string | null; // uuid FK → categories.id
  name: string;
  slug: string; // UNIQUE
  image_url: string | null;
  sort_order: number;
}
