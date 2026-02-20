import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { products, productVariants } from './catalog.schema';
import { orderItems } from './ecommerce.schema';

// ── reviews ───────────────────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id:            uuid('id').primaryKey().defaultRandom(),
  product_id:    uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  user_id:       uuid('user_id').notNull(),
  order_item_id: uuid('order_item_id').notNull().references(() => orderItems.id).unique(),
  rating:        integer('rating').notNull(),
  title:         text('title'),
  body:          text('body'),
  fit_rating:    text('fit_rating'),
  used_3d_tryon: boolean('used_3d_tryon').notNull().default(false),
  helpful_count: integer('helpful_count').notNull().default(0),
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── review_images ─────────────────────────────────────────────────────────────
export const reviewImages = pgTable('review_images', {
  id:        uuid('id').primaryKey().defaultRandom(),
  review_id: uuid('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
});

// ── tryon_sessions ────────────────────────────────────────────────────────────
export const tryonSessions = pgTable('tryon_sessions', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  user_id:               uuid('user_id'),
  product_id:            uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variant_id:            uuid('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  body_profile_snapshot: jsonb('body_profile_snapshot'),
  duration_seconds:      integer('duration_seconds'),
  converted_to_cart:     boolean('converted_to_cart').notNull().default(false),
  converted_to_purchase: boolean('converted_to_purchase').notNull().default(false),
  created_at:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:             uuid('id').primaryKey().defaultRandom(),
  user_id:        uuid('user_id').notNull(),
  type:           text('type').notNull(),
  actor_id:       uuid('actor_id'),
  reference_id:   uuid('reference_id'),
  reference_type: text('reference_type'),
  is_read:        boolean('is_read').notNull().default(false),
  created_at:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── restock_subscriptions ─────────────────────────────────────────────────────
export const restockSubscriptions = pgTable('restock_subscriptions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id').notNull(),
  variant_id: uuid('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── consents (Privacy / GDPR) ────────────────────────────────────────────────
export const consents = pgTable('consents', {
  id:            uuid('id').primaryKey().defaultRandom(),
  user_id:       uuid('user_id').notNull(),
  consent_type:  text('consent_type').notNull(), // 'marketing', 'analytics', 'biometric', 'terms'
  version:       text('version').notNull(),       // versión del documento aceptado
  accepted:      boolean('accepted').notNull(),
  accepted_at:   timestamp('accepted_at', { withTimezone: true }).notNull().defaultNow(),
  ip_address:    text('ip_address'),
  user_agent:    text('user_agent'),
});
