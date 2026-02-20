import {
  pgTable, uuid, text, numeric, boolean, integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
export const profilesRelations = relations(profiles, ({ one }) => ({
  bodyProfile: one(bodyProfiles, {
    fields: [profiles.id],
    references: [bodyProfiles.user_id],
  }),
}));
