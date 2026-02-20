import {
  pgTable, uuid, text, numeric, boolean, integer,
  timestamp, jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { addresses } from './users.schema';
import { productVariants } from './catalog.schema';

// ── carts ─────────────────────────────────────────────────────────────────────
export const carts = pgTable('carts', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id'),
  session_id: text('session_id'),
  status:     text('status').notNull().default('active'),
  currency:   text('currency').notNull().default('ARS'),
  metadata:   jsonb('metadata'),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── cart_items ────────────────────────────────────────────────────────────────
export const cartItems = pgTable('cart_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  cart_id:     uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  variant_id:  uuid('variant_id').notNull().references(() => productVariants.id),
  quantity:    integer('quantity').notNull(),
  unit_price:  numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  tried_on_3d: boolean('tried_on_3d').notNull().default(false),
});

// ── orders ────────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  user_id:             uuid('user_id').notNull(),
  status:              text('status').notNull().default('pending'),
  total_amount:        numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency:            text('currency').notNull().default('ARS'),
  shipping_address_id: uuid('shipping_address_id').notNull().references(() => addresses.id),
  medusa_order_id:     text('medusa_order_id'),
  created_at:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── order_items ───────────────────────────────────────────────────────────────
export const orderItems = pgTable('order_items', {
  id:           uuid('id').primaryKey().defaultRandom(),
  order_id:     uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variant_id:   uuid('variant_id').notNull().references(() => productVariants.id),
  product_name: text('product_name').notNull(),
  quantity:     integer('quantity').notNull(),
  unit_price:   numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
});

// ── returns ───────────────────────────────────────────────────────────────────
export const returns = pgTable('returns', {
  id:                       uuid('id').primaryKey().defaultRandom(),
  order_id:                 uuid('order_id').notNull().references(() => orders.id),
  reason:                   text('reason'),
  reason_category:          text('reason_category'),
  tried_3d_before_purchase: boolean('tried_3d_before_purchase').notNull().default(false),
  status:                   text('status').notNull().default('pending'),
  created_at:               timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────────────────────
export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items:   many(orderItems),
  returns: many(returns),
  address: one(addresses, { fields: [orders.shipping_address_id], references: [addresses.id] }),
}));
