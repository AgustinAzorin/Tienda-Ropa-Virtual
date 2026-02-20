export interface OrderItem {
  id: string; // uuid PK
  order_id: string; // uuid FK → orders.id
  variant_id: string; // uuid FK → product_variants.id
  /** Snapshot del nombre del producto al momento de la compra */
  product_name: string;
  quantity: number;
  unit_price: number;
}
