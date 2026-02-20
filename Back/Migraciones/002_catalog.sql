-- ============================================================
-- Migration 002: Catálogo de Productos
-- ============================================================

-- ── Marcas ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  logo_url    text,
  description text,
  is_active   boolean NOT NULL DEFAULT true
);

-- ── Categorías (árbol jerárquico via self-join) ──────────────
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  uuid REFERENCES categories(id) ON DELETE SET NULL,
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  image_url  text,
  sort_order int  NOT NULL DEFAULT 0
);

-- ── Productos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id         uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  category_id      uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  description      text,
  price            numeric(12, 2) NOT NULL,
  compare_at_price numeric(12, 2),
  currency         text NOT NULL DEFAULT 'ARS',
  is_active        boolean NOT NULL DEFAULT true,
  has_3d_model     boolean NOT NULL DEFAULT false,
  tags             text[]  NOT NULL DEFAULT '{}',
  metadata         jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Variantes (talle, color, stock) ─────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size           text,
  color          text,
  color_hex      text,
  sku            text UNIQUE NOT NULL,
  stock          int  NOT NULL DEFAULT 0,
  price_override numeric(12, 2),   -- NULL = usa precio del producto
  weight_g       int
);

-- ── Imágenes de producto ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  url        text NOT NULL,
  alt_text   text,
  sort_order int  NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false
);

-- ── Assets 3D ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_3d_assets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id       uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  model_url        text NOT NULL,   -- GLTF/GLB en Supabase Storage
  draco_compressed boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Texturas 3D (tabla normalizada, reemplaza texture_urls jsonb) ──
CREATE TABLE IF NOT EXISTS product_3d_textures (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES product_3d_assets(id) ON DELETE CASCADE,
  type     text NOT NULL CHECK (type IN ('diffuse','normal','roughness','metalness','emissive','ao')),
  url      text NOT NULL
);

-- ── Anchors de fit 3D (tabla normalizada, reemplaza fit_anchors jsonb) ─
CREATE TABLE IF NOT EXISTS product_fit_anchors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id    uuid NOT NULL REFERENCES product_3d_assets(id) ON DELETE CASCADE,
  anchor_name text NOT NULL,  -- ej: 'shoulder_left', 'waist', 'hem'
  x           numeric NOT NULL,
  y           numeric NOT NULL,
  z           numeric NOT NULL
);
