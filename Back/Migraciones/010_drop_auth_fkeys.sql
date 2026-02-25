-- ─────────────────────────────────────────────────────────────────────────────
-- 010_drop_auth_fkeys.sql
-- Desacopla TODAS las tablas de Supabase Auth (auth.users).
-- Las FK se eliminan sin reemplazar para que tanto custom_users (JWT propio)
-- como usuarios de Google OAuth (auth.users) coexistan sin conflictos.
-- La integridad referencial se garantiza a nivel de aplicación.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles        DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE addresses       DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
ALTER TABLE body_profiles   DROP CONSTRAINT IF EXISTS body_profiles_user_id_fkey;
ALTER TABLE carts            DROP CONSTRAINT IF EXISTS carts_user_id_fkey;
ALTER TABLE comments         DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE follows          DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE follows          DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE likes            DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE notifications    DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications    DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE orders           DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE posts             DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE reviews          DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE saves             DROP CONSTRAINT IF EXISTS saves_user_id_fkey;
ALTER TABLE tryon_sessions   DROP CONSTRAINT IF EXISTS tryon_sessions_user_id_fkey;
