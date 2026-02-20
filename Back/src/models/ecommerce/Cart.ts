export type CartStatus = 'active' | 'abandoned' | 'converted';

export interface Cart {
  id: string; // uuid PK
  /** nullable para guest checkout */
  user_id: string | null; // uuid FK → users.id
  session_id: string | null;
  status: CartStatus;
  currency: string;
  metadata: Record<string, unknown> | null; // jsonb
  updated_at: string; // timestamptz
}
