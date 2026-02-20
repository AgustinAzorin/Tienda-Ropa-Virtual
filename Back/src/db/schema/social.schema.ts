import {
  pgTable, uuid, text, numeric, integer,
  timestamp, primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products } from './catalog.schema';

// ── follows ───────────────────────────────────────────────────────────────────
export const follows = pgTable('follows', {
  follower_id:  uuid('follower_id').notNull(),
  following_id: uuid('following_id').notNull(),
  created_at:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.follower_id, t.following_id] }),
}));

// ── posts ─────────────────────────────────────────────────────────────────────
export const posts = pgTable('posts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  user_id:       uuid('user_id').notNull(),
  caption:       text('caption'),
  type:          text('type').notNull(),
  visibility:    text('visibility').notNull().default('public'),
  like_count:    integer('like_count').notNull().default(0),
  comment_count: integer('comment_count').notNull().default(0),
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── post_images ───────────────────────────────────────────────────────────────
export const postImages = pgTable('post_images', {
  id:         uuid('id').primaryKey().defaultRandom(),
  post_id:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  url:        text('url').notNull(),
  sort_order: integer('sort_order').notNull().default(0),
});

// ── post_product_tags ─────────────────────────────────────────────────────────
export const postProductTags = pgTable('post_product_tags', {
  id:         uuid('id').primaryKey().defaultRandom(),
  post_id:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  x_position: numeric('x_position').notNull(),
  y_position: numeric('y_position').notNull(),
});

// ── likes ─────────────────────────────────────────────────────────────────────
export const likes = pgTable('likes', {
  user_id:    uuid('user_id').notNull(),
  post_id:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.post_id] }),
}));

// ── comments ──────────────────────────────────────────────────────────────────
export const comments = pgTable('comments', {
  id:         uuid('id').primaryKey().defaultRandom(),
  post_id:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  user_id:    uuid('user_id').notNull(),
  parent_id:  uuid('parent_id'),
  body:       text('body').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── saves ─────────────────────────────────────────────────────────────────────
export const saves = pgTable('saves', {
  id:              uuid('id').primaryKey().defaultRandom(),
  user_id:         uuid('user_id').notNull(),
  product_id:      uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  post_id:         uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  collection_name: text('collection_name').notNull().default('Guardados'),
  created_at:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────────────────────
export const postsRelations = relations(posts, ({ many }) => ({
  images:      many(postImages),
  productTags: many(postProductTags),
  likes:       many(likes),
  comments:    many(comments),
}));
