import type { Return } from '@/models/ecommerce/Return';

export interface CreateReturnDto {
  orderId:                string;
  reason:                 string;
  reasonCategory:         Return['reason_category'];
  tried3dBeforePurchase:  boolean;
}

export interface ReturnMetrics {
  with_tryon:    { count: number; avg_order_value: number };
  without_tryon: { count: number; avg_order_value: number };
}

export interface IReturnRepository {
  create(dto: CreateReturnDto): Promise<Return>;
  findById(id: string): Promise<Return | null>;
  listByOrder(orderId: string): Promise<Return[]>;
  updateStatus(id: string, status: Return['status']): Promise<Return>;
  getMetrics(): Promise<ReturnMetrics>;
}
