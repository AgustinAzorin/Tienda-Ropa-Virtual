import type { Order } from '@/models/ecommerce/Order';
import type { OrderItem } from '@/models/ecommerce/OrderItem';

export interface CreateOrderDto {
  userId:            string;
  cartId:            string;
  shippingAddressId: string;
  currency:          string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface IOrderRepository {
  findById(id: string): Promise<OrderWithItems | null>;
  listByUser(userId: string): Promise<Order[]>;
  create(dto: CreateOrderDto & { totalAmount: number; medusaOrderId?: string }): Promise<Order>;
  updateStatus(id: string, status: Order['status']): Promise<Order>;
  addItems(orderId: string, items: Omit<OrderItem, 'id' | 'order_id'>[]): Promise<OrderItem[]>;
}
