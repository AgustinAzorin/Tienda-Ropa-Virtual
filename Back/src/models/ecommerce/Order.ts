export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  status: OrderStatus;
  total_amount: number;
  currency: string;
  /** FK a la tabla normalizada de addresses */
  shipping_address_id: string; // uuid FK → addresses.id
  /** ID externo del pedido en Medusa.js */
  medusa_order_id: string | null;
  created_at: string; // timestamptz
}
