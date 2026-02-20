-- ============================================================
-- Migration 004: Módulo Social
-- ============================================================

-- ── Follows ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ── Posts (feed / UGC) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption       text,
  type          text NOT NULL CHECK (type IN ('outfit','review','lookbook')),
  visibility    text NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public','followers','private')),
  like_count    int  NOT NULL DEFAULT 0,     -- desnormalizado
  comment_count int  NOT NULL DEFAULT 0,     -- desnormalizado
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Imágenes del post ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url        text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0
);

-- ── Tags de productos en posts (shoppable feed) ──────────────
CREATE TABLE IF NOT EXISTS post_product_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  x_position numeric NOT NULL,   -- 0–100 relativo a la imagen
  y_position numeric NOT NULL   -- 0–100 relativo a la imagen
);

-- ── Likes (PK compuesta) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ── Comentarios (con soporte de replies) ─────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  uuid REFERENCES comments(id) ON DELETE CASCADE,  -- nullable (replies)
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Guardados / Wishlists ────────────────────────────────────
CREATE TABLE IF NOT EXISTS saves (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      uuid REFERENCES products(id) ON DELETE CASCADE,
  post_id         uuid REFERENCES posts(id) ON DELETE CASCADE,
  collection_name text NOT NULL DEFAULT 'Guardados',
  created_at      timestamptz NOT NULL DEFAULT now(),
  -- Al menos uno de los dos debe estar seteado
  CHECK (product_id IS NOT NULL OR post_id IS NOT NULL)
);
