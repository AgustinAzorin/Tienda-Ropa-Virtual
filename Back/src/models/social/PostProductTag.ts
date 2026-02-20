/** Etiqueta de producto en un post (shoppable feed) */
export interface PostProductTag {
  id: string; // uuid PK
  post_id: string; // uuid FK → posts.id
  product_id: string; // uuid FK → products.id
  /** Posición horizontal del tag flotante en la imagen (0–100) */
  x_position: number;
  /** Posición vertical del tag flotante en la imagen (0–100) */
  y_position: number;
}
