export type FitRating = 'small' | 'true_to_size' | 'large';

export interface Review {
  id: string; // uuid PK
  product_id: string; // uuid FK → products.id
  user_id: string; // uuid FK → users.id
  /** Solo quien compró puede reseñar */
  order_item_id: string; // uuid FK → order_items.id
  /** CHECK (rating BETWEEN 1 AND 5) */
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string | null;
  fit_rating: FitRating | null;
  /** ¿El usuario usó el probador 3D antes de comprar? */
  used_3d_tryon: boolean;
  helpful_count: number;
  created_at: string; // timestamptz
}
