-- ══════════════════════════════════════════════════════════════════════════════
-- Migration 011 — Missing indexes for common query patterns
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Carritos ─────────────────────────────────────────────────
-- Active cart lookup by user (CartRepository.findActiveByUserId)
CREATE INDEX IF NOT EXISTS idx_carts_user_status
  ON carts(user_id, status);

-- Active cart lookup by session (CartRepository.findActiveBySession)
CREATE INDEX IF NOT EXISTS idx_carts_session_status
  ON carts(session_id, status);

-- ── Historial de precios ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_price_history_product_valid
  ON price_history(product_id, valid_from DESC);

-- ── Consentimientos GDPR ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_consents_user
  ON consents(user_id);

-- ── Devoluciones ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_returns_order
  ON returns(order_id);

-- ── Imágenes de posts ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_images_post
  ON post_images(post_id);

-- ── Product tags en posts ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_product_tags_post
  ON post_product_tags(post_id);

-- ── Imágenes de reseñas ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_review_images_review
  ON review_images(review_id);
