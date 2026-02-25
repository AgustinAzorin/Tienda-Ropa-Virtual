import {
  pgTable, uuid, text, numeric, boolean, integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── custom_users ──────────────────────────────────────────────────────────────
export const customUsers = pgTable('custom_users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          text('email').unique().notNull(),
  password_hash:  text('password_hash').notNull(),
  email_verified: boolean('email_verified').notNull().default(false),
  created_at:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── refresh_tokens ─────────────────────────────────────────────────────────
export const refreshTokens = pgTable('refresh_tokens', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id').notNull().references(() => customUsers.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').unique().notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked:    boolean('revoked').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── password_resets ────────────────────────────────────────────────────────
export const passwordResets = pgTable('password_resets', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    uuid('user_id').notNull().references(() => customUsers.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').unique().notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  used:       boolean('used').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── profiles ────────────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id:             uuid('id').primaryKey(),
  username:       text('username').unique().notNull(),
  display_name:   text('display_name'),
  bio:            text('bio'),
  avatar_url:     text('avatar_url'),
  location:       text('location'),
  is_verified:    boolean('is_verified').notNull().default(false),
  follower_count: integer('follower_count').notNull().default(0),
  following_count:integer('following_count').notNull().default(0),
  created_at:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── addresses ───────────────────────────────────────────────────────────────
export const addresses = pgTable('addresses', {
  id:           uuid('id').primaryKey().defaultRandom(),
  user_id:      uuid('user_id').notNull(),
  full_name:    text('full_name').notNull(),
  phone:        text('phone'),
  street_line1: text('street_line1').notNull(),
  street_line2: text('street_line2'),
  city:         text('city').notNull(),
  state:        text('state'),
  postal_code:  text('postal_code'),
  country:      text('country').notNull(),
  is_default:   boolean('is_default').notNull().default(false),
  created_at:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── body_profiles ────────────────────────────────────────────────────────────
export const bodyProfiles = pgTable('body_profiles', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  user_id:             uuid('user_id').notNull().unique(),
  height_cm:           numeric('height_cm'),
  weight_kg:           numeric('weight_kg'),
  chest_cm:            numeric('chest_cm'),
  waist_cm:            numeric('waist_cm'),
  hips_cm:             numeric('hips_cm'),
  shoulder_width_cm:   numeric('shoulder_width_cm'),
  inseam_cm:           numeric('inseam_cm'),
  skin_tone:           text('skin_tone'),
  avatar_model_url:    text('avatar_model_url'),
  muscle_mass_level:   integer('muscle_mass_level'),
  age_appearance:      integer('age_appearance'),
  gender_expression:   text('gender_expression'),
  updated_at:          timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────────────────────
export const customUsersRelations = relations(customUsers, ({ many, one }) => ({
  tokens:         many(refreshTokens),
  passwordResets: many(passwordResets),
  profile:        one(profiles, { fields: [customUsers.id], references: [profiles.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(customUsers, { fields: [refreshTokens.user_id], references: [customUsers.id] }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(customUsers, { fields: [passwordResets.user_id], references: [customUsers.id] }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  bodyProfile: one(bodyProfiles, {
    fields:     [profiles.id],
    references: [bodyProfiles.user_id],
  }),
}));
