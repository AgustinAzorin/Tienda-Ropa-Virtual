/** Guardados / Wishlists — puede guardar productos o posts */
export interface Save {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  /** nullable — guardar producto */
  product_id: string | null; // uuid FK → products.id
  /** nullable — guardar post */
  post_id: string | null; // uuid FK → posts.id
  collection_name: string; // DEFAULT 'Guardados'
  created_at: string; // timestamptz
}
