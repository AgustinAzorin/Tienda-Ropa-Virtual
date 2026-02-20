-- ============================================================
-- Migration 005: Reseñas
-- ============================================================

-- ── Reseñas verificadas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id  uuid NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,  -- solo compradores
  rating         int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title          text,
  body           text,
  fit_rating     text CHECK (fit_rating IN ('small','true_to_size','large')),
  used_3d_tryon  boolean NOT NULL DEFAULT false,
  helpful_count  int     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Un usuario solo puede reseñar el mismo item de orden una vez
  UNIQUE (order_item_id)
);

-- ── Imágenes de reseña ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_images (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url       text NOT NULL
);
