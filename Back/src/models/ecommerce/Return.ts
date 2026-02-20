export type ReturnReasonCategory = 'size' | 'quality' | 'not_as_shown' | 'other';
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Return {
  id: string; // uuid PK
  order_id: string; // uuid FK → orders.id
  reason: string | null;
  reason_category: ReturnReasonCategory | null;
  /** Métrica clave: ¿el cliente usó el probador 3D antes de comprar? */
  tried_3d_before_purchase: boolean;
  status: ReturnStatus;
  created_at: string; // timestamptz
}
