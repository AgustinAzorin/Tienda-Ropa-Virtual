import type { Order } from '@/models/ecommerce/Order';
import type { OrderWithItems } from './IOrderRepository';

export interface IOrderService {
  initCheckout(userId: string, cartId: string, shippingAddressId: string): Promise<OrderWithItems>;
  getOrder(id: string, userId: string): Promise<OrderWithItems>;
  listUserOrders(userId: string): Promise<Order[]>;
  cancelOrder(id: string, userId: string): Promise<Order>;
  handleMedusaWebhook(medusaOrderId: string, status: string): Promise<void>;
}
