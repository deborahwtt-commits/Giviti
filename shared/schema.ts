// Database schema for Giviti - includes Replit Auth integration
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  date,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Recipients table (presenteados)
export const recipients = pgTable("recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender"),
  zodiacSign: varchar("zodiac_sign"),
  relationship: varchar("relationship"),
  interests: text("interests").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRecipientSchema = createInsertSchema(recipients).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Recipient = typeof recipients.$inferSelect;

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id")
    .notNull()
    .references(() => recipients.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(),
  eventName: varchar("event_name"),
  eventDate: date("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Gift suggestions table
export const giftSuggestions = pgTable("gift_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  category: varchar("category").notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export type GiftSuggestion = typeof giftSuggestions.$inferSelect;

// User gifts (saved/purchased)
export const userGifts = pgTable("user_gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id")
    .notNull()
    .references(() => recipients.id, { onDelete: "cascade" }),
  eventId: varchar("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  suggestionId: varchar("suggestion_id").references(() => giftSuggestions.id, {
    onDelete: "set null",
  }),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: integer("price").notNull(),
  purchaseUrl: text("purchase_url"),
  isFavorite: boolean("is_favorite").default(false),
  isPurchased: boolean("is_purchased").default(false),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserGiftSchema = createInsertSchema(userGifts).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserGift = z.infer<typeof insertUserGiftSchema>;
export type UserGift = typeof userGifts.$inferSelect;

// User profiles (questionnaire responses)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  ageRange: varchar("age_range"),
  gender: varchar("gender"),
  zodiacSign: varchar("zodiac_sign"),
  giftPreference: varchar("gift_preference"),
  freeTimeActivity: varchar("free_time_activity"),
  musicalStyle: varchar("musical_style"),
  monthlyGiftPreference: varchar("monthly_gift_preference"),
  surpriseReaction: varchar("surprise_reaction"),
  giftPriority: varchar("gift_priority"),
  giftGivingStyle: varchar("gift_giving_style"),
  specialTalent: varchar("special_talent"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
