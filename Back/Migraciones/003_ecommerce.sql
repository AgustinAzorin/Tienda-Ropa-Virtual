-- ============================================================
-- Migration 003: eCommerce (Carritos, Órdenes, Devoluciones)
-- ============================================================

-- ── Carritos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable (guest)
  session_id text,
  status     text NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'abandoned', 'converted')),
  currency   text NOT NULL DEFAULT 'ARS',
  metadata   jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Items del carrito ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id  uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity    int  NOT NULL CHECK (quantity > 0),
  unit_price  numeric(12, 2) NOT NULL,
  tried_on_3d boolean NOT NULL DEFAULT false  -- flag de conversión
);

-- ── Órdenes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total_amount        numeric(12, 2) NOT NULL,
  currency            text NOT NULL DEFAULT 'ARS',
  shipping_address_id uuid NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  medusa_order_id     text,    -- ID externo de Medusa.js
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Items de la orden ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id   uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_name text NOT NULL,   -- snapshot al momento de compra
  quantity     int  NOT NULL CHECK (quantity > 0),
  unit_price   numeric(12, 2) NOT NULL
);

-- ── Devoluciones ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  reason                   text,
  reason_category          text CHECK (reason_category IN ('size','quality','not_as_shown','other')),
  tried_3d_before_purchase boolean NOT NULL DEFAULT false,  -- métrica clave del negocio
  status                   text NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','approved','rejected','completed')),
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE carts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns    ENABLE ROW LEVEL SECURITY;

-- Carritos: solo el dueño (o session anónima — lógica en app)
CREATE POLICY "carts_owner"
  ON carts FOR ALL USING (auth.uid() = user_id);

-- Items de carrito: accesible si tenés acceso al carrito
CREATE POLICY "cart_items_owner"
  ON cart_items FOR ALL
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- Órdenes: solo el dueño
CREATE POLICY "orders_owner"
  ON orders FOR ALL USING (auth.uid() = user_id);

-- Items de orden: accesible si tenés acceso a la orden
CREATE POLICY "order_items_owner"
  ON order_items FOR ALL
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Devoluciones: accesible si tenés acceso a la orden
CREATE POLICY "returns_owner"
  ON returns FOR ALL
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
