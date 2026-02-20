-- ============================================================
-- Migration 006: Probador Virtual 3D — Sesiones
-- ============================================================

CREATE TABLE IF NOT EXISTS tryon_sessions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable (guest)
  product_id             uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id             uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  -- Snapshot de medidas corporales al momento de la sesión
  body_profile_snapshot  jsonb,
  duration_seconds       int,
  converted_to_cart      boolean NOT NULL DEFAULT false,
  converted_to_purchase  boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE tryon_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tryon_sessions_owner"
  ON tryon_sessions FOR ALL USING (auth.uid() = user_id);
