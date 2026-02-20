export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'order_update'
  | 'restock';

export type NotificationReferenceType =
  | 'post'
  | 'order'
  | 'product'
  | 'comment'
  | 'review';

export interface Notification {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  type: NotificationType;
  /** nullable — quién realizó la acción (like, comment, follow) */
  actor_id: string | null; // uuid FK → users.id
  /** ID del recurso relacionado (post_id, order_id, etc.) */
  reference_id: string | null; // uuid
  reference_type: NotificationReferenceType | null;
  is_read: boolean; // DEFAULT false
  created_at: string; // timestamptz
}
