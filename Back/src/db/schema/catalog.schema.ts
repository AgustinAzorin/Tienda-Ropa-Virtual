import {
  pgTable, uuid, text, numeric, boolean, integer,
  timestamp, jsonb,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ── brands ───────────────────────────────────────────────────────────────────
export const brands = pgTable('brands', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  slug:        text('slug').unique().notNull(),
  logo_url:    text('logo_url'),
  description: text('description'),
  is_active:   boolean('is_active').notNull().default(true),
});

// ── categories ────────────────────────────────────────────────────────────────
export const categories = pgTable('categories', {
  id:         uuid('id').primaryKey().defaultRandom(),
  parent_id:  uuid('parent_id'),
  name:       text('name').notNull(),
  slug:       text('slug').unique().notNull(),
  image_url:  text('image_url'),
  sort_order: integer('sort_order').notNull().default(0),
});

// ── products ─────────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id:               uuid('id').primaryKey().defaultRandom(),
  brand_id:         uuid('brand_id').notNull().references(() => brands.id),
  category_id:      uuid('category_id').notNull().references(() => categories.id),
  name:             text('name').notNull(),
  slug:             text('slug').unique().notNull(),
  description:      text('description'),
  price:            numeric('price', { precision: 12, scale: 2 }).notNull(),
  compare_at_price: numeric('compare_at_price', { precision: 12, scale: 2 }),
  currency:         text('currency').notNull().default('ARS'),
  is_active:        boolean('is_active').notNull().default(true),
  has_3d_model:     boolean('has_3d_model').notNull().default(false),
  tags:             text('tags').array().notNull().default(sql`'{}'::text[]`),
  metadata:         jsonb('metadata'),
  created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── product_variants ─────────────────────────────────────────────────────────
export const productVariants = pgTable('product_variants', {
  id:             uuid('id').primaryKey().defaultRandom(),
  product_id:     uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size:           text('size'),
  color:          text('color'),
  color_hex:      text('color_hex'),
  sku:            text('sku').unique().notNull(),
  stock:          integer('stock').notNull().default(0),
  price_override: numeric('price_override', { precision: 12, scale: 2 }),
  weight_g:       integer('weight_g'),
});

// ── product_images ────────────────────────────────────────────────────────────
export const productImages = pgTable('product_images', {
  id:         uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variant_id: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  url:        text('url').notNull(),
  alt_text:   text('alt_text'),
  sort_order: integer('sort_order').notNull().default(0),
  is_primary: boolean('is_primary').notNull().default(false),
});

// ── product_3d_assets ─────────────────────────────────────────────────────────
export const product3dAssets = pgTable('product_3d_assets', {
  id:               uuid('id').primaryKey().defaultRandom(),
  product_id:       uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variant_id:       uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  model_url:        text('model_url').notNull(),
  draco_compressed: boolean('draco_compressed').notNull().default(false),
  created_at:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── product_3d_textures ───────────────────────────────────────────────────────
export const product3dTextures = pgTable('product_3d_textures', {
  id:       uuid('id').primaryKey().defaultRandom(),
  asset_id: uuid('asset_id').notNull().references(() => product3dAssets.id, { onDelete: 'cascade' }),
  type:     text('type').notNull(),
  url:      text('url').notNull(),
});

// ── product_fit_anchors ───────────────────────────────────────────────────────
export const productFitAnchors = pgTable('product_fit_anchors', {
  id:          uuid('id').primaryKey().defaultRandom(),
  asset_id:    uuid('asset_id').notNull().references(() => product3dAssets.id, { onDelete: 'cascade' }),
  anchor_name: text('anchor_name').notNull(),
  x:           numeric('x').notNull(),
  y:           numeric('y').notNull(),
  z:           numeric('z').notNull(),
});

// ── price_history (para bitemporalidad y auditoría ARS) ──────────────────────
export const priceHistory = pgTable('price_history', {
  id:         uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price:      numeric('price', { precision: 12, scale: 2 }).notNull(),
  currency:   text('currency').notNull().default('ARS'),
  valid_from: timestamp('valid_from', { withTimezone: true }).notNull(),
  valid_to:   timestamp('valid_to', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  brand:    one(brands, { fields: [products.brand_id], references: [brands.id] }),
  category: one(categories, { fields: [products.category_id], references: [categories.id] }),
  variants: many(productVariants),
  images:   many(productImages),
  assets3d: many(product3dAssets),
  priceHistory: many(priceHistory),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.product_id], references: [products.id] }),
}));

export const product3dAssetsRelations = relations(product3dAssets, ({ one, many }) => ({
  product:  one(products, { fields: [product3dAssets.product_id], references: [products.id] }),
  textures: many(product3dTextures),
  anchors:  many(productFitAnchors),
}));
