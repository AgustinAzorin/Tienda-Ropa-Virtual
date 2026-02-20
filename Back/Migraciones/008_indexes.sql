-- ============================================================
-- Migration 008: Índices de Performance
-- ============================================================

-- ── Catálogo ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_brand
  ON products(brand_id);

CREATE INDEX IF NOT EXISTS idx_products_active
  ON products(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_tags
  ON products USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_products_metadata
  ON products USING GIN(metadata);

-- ── Variantes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_variants_product
  ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_variants_sku
  ON product_variants(sku);

-- ── Assets 3D ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_3d_assets_product
  ON product_3d_assets(product_id);

CREATE INDEX IF NOT EXISTS idx_3d_textures_asset
  ON product_3d_textures(asset_id);

CREATE INDEX IF NOT EXISTS idx_fit_anchors_asset
  ON product_fit_anchors(asset_id);

-- ── Social ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user
  ON posts(user_id);

CREATE INDEX IF NOT EXISTS idx_posts_created
  ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_comments_post
  ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_saves_user
  ON saves(user_id);

-- ── eCommerce ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user
  ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart
  ON cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON order_items(order_id);

-- ── Reseñas ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_product
  ON reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user
  ON reviews(user_id);

-- ── Probador 3D ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tryon_user
  ON tryon_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_tryon_product
  ON tryon_sessions(product_id);

-- ── Notificaciones ───────────────────────────────────────────
-- Índice parcial: solo notificaciones no leídas (consulta frecuente)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read)
  WHERE is_read = false;

-- ── Addresses ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_addresses_user
  ON addresses(user_id);

-- ── Body profiles ────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_body_profiles_user
  ON body_profiles(user_id);
