-- ============================================================
-- Migration 007: Notificaciones
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           text NOT NULL
                   CHECK (type IN ('like','comment','follow','order_update','restock')),
  actor_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- quien generó la notif
  reference_id   uuid,    -- post_id, order_id, product_id, etc.
  reference_type text CHECK (reference_type IN ('post','order','product','comment','review')),
  is_read        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_owner"
  ON notifications FOR ALL USING (auth.uid() = user_id);
