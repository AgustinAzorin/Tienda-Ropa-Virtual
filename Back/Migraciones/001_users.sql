-- ============================================================
-- Migration 001: Usuarios, Perfiles y Datos Corporales
-- Nota: la tabla `auth.users` es gestionada por Supabase Auth.
--       Todas las FKs a usuarios apuntan a auth.users(id).
-- ============================================================

-- ── Perfiles públicos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       text UNIQUE NOT NULL,
  display_name   text,
  bio            text,
  avatar_url     text,
  location       text,
  is_verified    boolean NOT NULL DEFAULT false,
  follower_count  int     NOT NULL DEFAULT 0,
  following_count int     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── Direcciones normalizadas ─────────────────────────────────
-- Se crea antes de orders para que orders pueda referenciarla.
CREATE TABLE IF NOT EXISTS addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  phone         text,
  street_line1  text NOT NULL,
  street_line2  text,
  city          text NOT NULL,
  state         text,
  postal_code   text,
  country       text NOT NULL,
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Perfiles corporales para el Probador 3D ─────────────────
CREATE TABLE IF NOT EXISTS body_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm            numeric,
  weight_kg            numeric,
  chest_cm             numeric,
  waist_cm             numeric,
  hips_cm              numeric,
  shoulder_width_cm    numeric,
  inseam_cm            numeric,
  skin_tone            text,
  avatar_model_url     text,
  -- Columnas tipadas para los sliders de Anny (reemplazan semantic_parameters jsonb)
  muscle_mass_level    int CHECK (muscle_mass_level BETWEEN 1 AND 5),
  age_appearance       int,
  gender_expression    text,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_profiles ENABLE ROW LEVEL SECURITY;

-- profiles: lectura pública, escritura solo del dueño
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_owner"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- addresses: solo el dueño
CREATE POLICY "addresses_owner"
  ON addresses FOR ALL USING (auth.uid() = user_id);

-- body_profiles: solo el dueño
CREATE POLICY "body_profiles_owner"
  ON body_profiles FOR ALL USING (auth.uid() = user_id);
