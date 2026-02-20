export interface CartItem {
  id: string; // uuid PK
  cart_id: string; // uuid FK → carts.id
  variant_id: string; // uuid FK → product_variants.id
  quantity: number;
  unit_price: number;
  /** Flag de conversión: indica si el usuario usó el probador 3D antes de agregar al carrito */
  tried_on_3d: boolean;
}
