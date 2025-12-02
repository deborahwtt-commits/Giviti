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
  check,
  numeric,
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

// Users table - now supports email/password authentication
// Roles: admin, manager, support, readonly, user
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = insertUserSchema
  .extend({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .omit({ passwordHash: true })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

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
    .references(() => recipients.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(),
  eventName: varchar("event_name"),
  eventDate: date("event_date").notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  userId: true,
  recipientId: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event Recipients junction table (many-to-many)
export const eventRecipients = pgTable("event_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id")
    .notNull()
    .references(() => recipients.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventRecipientSchema = createInsertSchema(eventRecipients).omit({
  id: true,
  createdAt: true,
});

export type InsertEventRecipient = z.infer<typeof insertEventRecipientSchema>;
export type EventRecipient = typeof eventRecipients.$inferSelect;

// Extended event type with recipients array
export type EventWithRecipients = Event & {
  recipients: Recipient[];
};

// Gift suggestions table
export const giftSuggestions = pgTable("gift_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category").notNull(),
  giftTypeId: varchar("gift_type_id"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  priority: integer("priority"),
  productUrl: text("product_url").notNull().default(""),
  cupom: varchar("cupom"),
  validadeCupom: date("validade_cupom"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  priorityCheck: check("priority_check", sql`${table.priority} IS NULL OR ${table.priority} IN (1, 2, 3)`)
}));

const baseGiftSuggestionSchema = createInsertSchema(giftSuggestions, {
  priority: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.null()
  ]).default(null),
  tags: z.array(z.string()).min(1, "Adicione pelo menos uma tag"),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Preço deve ser maior que zero"),
  productUrl: z.string().url("URL inválida").refine((val) => {
    return val.startsWith("http://") || val.startsWith("https://");
  }, "URL deve começar com http:// ou https://"),
  cupom: z.string().max(50, "Cupom deve ter no máximo 50 caracteres").nullable().optional(),
  validadeCupom: z.string().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertGiftSuggestionSchema = baseGiftSuggestionSchema;

export const updateGiftSuggestionSchema = baseGiftSuggestionSchema.partial();

export type InsertGiftSuggestion = z.infer<typeof insertGiftSuggestionSchema>;
export type UpdateGiftSuggestion = z.infer<typeof updateGiftSuggestionSchema>;
export type GiftSuggestion = typeof giftSuggestions.$inferSelect;

// Click tracking table for product links
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  link: text("link").notNull().unique(),
  clickCount: integer("click_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClickSchema = createInsertSchema(clicks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClick = z.infer<typeof insertClickSchema>;
export type Click = typeof clicks.$inferSelect;

// Gift Categories table (admin-managed)
export const giftCategories = pgTable("gift_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  keywords: text("keywords").array().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGiftCategorySchema = createInsertSchema(giftCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGiftCategory = z.infer<typeof insertGiftCategorySchema>;
export type GiftCategory = typeof giftCategories.$inferSelect;

// Gift Types table (Produto, Serviço, Experiência, etc.)
export const giftTypes = pgTable("gift_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGiftTypeSchema = createInsertSchema(giftTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGiftType = z.infer<typeof insertGiftTypeSchema>;
export type GiftType = typeof giftTypes.$inferSelect;

// Gift Suggestion Categories junction table (many-to-many)
export const giftSuggestionCategories = pgTable("gift_suggestion_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  suggestionId: varchar("suggestion_id")
    .notNull()
    .references(() => giftSuggestions.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => giftCategories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGiftSuggestionCategorySchema = createInsertSchema(giftSuggestionCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertGiftSuggestionCategory = z.infer<typeof insertGiftSuggestionCategorySchema>;
export type GiftSuggestionCategory = typeof giftSuggestionCategories.$inferSelect;

// Extended gift suggestion type with categories and type
export type GiftSuggestionWithRelations = GiftSuggestion & {
  categories: GiftCategory[];
  giftType?: GiftType | null;
};

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
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
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
  giftsToAvoid: varchar("gifts_to_avoid", { length: 256 }),
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

// Recipient profiles (questionnaire responses for gift recipients)
export const recipientProfiles = pgTable("recipient_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id")
    .notNull()
    .unique()
    .references(() => recipients.id, { onDelete: "cascade" }),
  ageRange: varchar("age_range"),
  gender: varchar("gender"),
  zodiacSign: varchar("zodiac_sign"),
  relationship: varchar("relationship"),
  giftPreference: varchar("gift_preference"),
  lifestyle: varchar("lifestyle"),
  interestCategory: varchar("interest_category"),
  giftReceptionStyle: varchar("gift_reception_style"),
  budgetRange: varchar("budget_range"),
  occasion: varchar("occasion"),
  giftsToAvoid: varchar("gifts_to_avoid", { length: 255 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 100 }),
  pais: varchar("pais", { length: 100 }),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRecipientProfileSchema = createInsertSchema(recipientProfiles).omit({
  id: true,
  recipientId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecipientProfile = z.infer<typeof insertRecipientProfileSchema>;
export type RecipientProfile = typeof recipientProfiles.$inferSelect;

// ==================== ADMIN MODULE TABLES ====================

// Occasions table - special dates and occasions
export const occasions = pgTable("occasions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  monthDay: varchar("month_day"),
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOccasionSchema = createInsertSchema(occasions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOccasion = z.infer<typeof insertOccasionSchema>;
export type Occasion = typeof occasions.$inferSelect;

// Price ranges table - budget ranges for gifts
export const priceRanges = pgTable("price_ranges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  minPrice: integer("min_price").notNull(),
  maxPrice: integer("max_price").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPriceRangeSchema = createInsertSchema(priceRanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPriceRange = z.infer<typeof insertPriceRangeSchema>;
export type PriceRange = typeof priceRanges.$inferSelect;

// Relationship types table - types of relationships
export const relationshipTypes = pgTable("relationship_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRelationshipTypeSchema = createInsertSchema(relationshipTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRelationshipType = z.infer<typeof insertRelationshipTypeSchema>;
export type RelationshipType = typeof relationshipTypes.$inferSelect;

// System settings table - global configuration
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  dataType: varchar("data_type").notNull().default("string"),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Audit logs table - track all administrative actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========================================
// COLLABORATIVE EVENTS (Planeje seu rolê!)
// ========================================

// Themed night categories table - configurable subcategories for themed nights
export const themedNightCategories = pgTable("themed_night_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  suggestions: text("suggestions").array().notNull().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertThemedNightCategorySchema = createInsertSchema(themedNightCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertThemedNightCategory = z.infer<typeof insertThemedNightCategorySchema>;
export type ThemedNightCategory = typeof themedNightCategories.$inferSelect;

// Collaborative events table - main table for hangout planning
export const collaborativeEvents = pgTable("collaborative_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  eventType: varchar("event_type").notNull(), // secret_santa, themed_night, collective_gift, creative_challenge
  eventDate: timestamp("event_date"),
  location: varchar("location"),
  description: text("description"),
  themedNightCategoryId: varchar("themed_night_category_id")
    .references(() => themedNightCategories.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").default(false).notNull(),
  status: varchar("status").notNull().default("draft"), // draft, active, completed, cancelled
  typeSpecificData: jsonb("type_specific_data"), // JSON for type-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollaborativeEventSchema = createInsertSchema(collaborativeEvents, {
  eventDate: z.union([z.string(), z.date()]).optional().nullable().transform(val => {
    if (!val) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  }),
}).omit({
  id: true,
  ownerId: true,  // Omit ownerId - will be set from authenticated user
  createdAt: true,
  updatedAt: true,
});

export type InsertCollaborativeEvent = z.infer<typeof insertCollaborativeEventSchema>;
export type CollaborativeEvent = typeof collaborativeEvents.$inferSelect;

// Collaborative event participants table
export const collaborativeEventParticipants = pgTable("collaborative_event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => collaborativeEvents.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email"),
  name: varchar("name"),
  role: varchar("role").notNull().default("participant"), // owner, participant
  status: varchar("status").notNull().default("invited"), // invited, pending, accepted, declined
  inviteToken: varchar("invite_token").unique(),
  participantData: jsonb("participant_data"), // For wishlists, preferences, etc.
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollaborativeEventParticipantSchema = createInsertSchema(collaborativeEventParticipants, {
  status: z.enum(["invited", "pending", "accepted", "declined"]).default("pending"),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => !!(data.userId || (data.email && data.name)),
    {
      message: "Either userId or both email and name must be provided",
      path: ["userId"],
    }
  );

export type InsertCollaborativeEventParticipant = z.infer<typeof insertCollaborativeEventParticipantSchema>;
export type CollaborativeEventParticipant = typeof collaborativeEventParticipants.$inferSelect;

// Collaborative event share links table
export const collaborativeEventLinks = pgTable("collaborative_event_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => collaborativeEvents.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  permissions: varchar("permissions").notNull().default("view"), // view, edit, admin
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses"),
  useCount: integer("use_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollaborativeEventLinkSchema = createInsertSchema(collaborativeEventLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollaborativeEventLink = z.infer<typeof insertCollaborativeEventLinkSchema>;
export type CollaborativeEventLink = typeof collaborativeEventLinks.$inferSelect;

// Secret Santa pairs table - for amigo secreto
export const secretSantaPairs = pgTable("secret_santa_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => collaborativeEvents.id, { onDelete: "cascade" }),
  giverParticipantId: varchar("giver_participant_id")
    .notNull()
    .references(() => collaborativeEventParticipants.id, { onDelete: "cascade" }),
  receiverParticipantId: varchar("receiver_participant_id")
    .notNull()
    .references(() => collaborativeEventParticipants.id, { onDelete: "cascade" }),
  isRevealed: boolean("is_revealed").default(false).notNull(),
  revealedAt: timestamp("revealed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSecretSantaPairSchema = createInsertSchema(secretSantaPairs).omit({
  id: true,
  createdAt: true,
});

export type InsertSecretSantaPair = z.infer<typeof insertSecretSantaPairSchema>;
export type SecretSantaPair = typeof secretSantaPairs.$inferSelect;

// Collective gift contributions table
export const collectiveGiftContributions = pgTable("collective_gift_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => collaborativeEvents.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id")
    .notNull()
    .references(() => collaborativeEventParticipants.id, { onDelete: "cascade" }),
  amountDue: integer("amount_due").notNull(),
  amountPaid: integer("amount_paid").default(0).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  paymentNotes: text("payment_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollectiveGiftContributionSchema = createInsertSchema(collectiveGiftContributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollectiveGiftContribution = z.infer<typeof insertCollectiveGiftContributionSchema>;
export type CollectiveGiftContribution = typeof collectiveGiftContributions.$inferSelect;

// Collaborative event tasks table - for themed nights
export const collaborativeEventTasks = pgTable("collaborative_event_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => collaborativeEvents.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedToParticipantId: varchar("assigned_to_participant_id")
    .references(() => collaborativeEventParticipants.id, { onDelete: "set null" }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  priority: varchar("priority").default("medium"), // low, medium, high
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollaborativeEventTaskSchema = createInsertSchema(collaborativeEventTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollaborativeEventTask = z.infer<typeof insertCollaborativeEventTaskSchema>;
export type CollaborativeEventTask = typeof collaborativeEventTasks.$inferSelect;
