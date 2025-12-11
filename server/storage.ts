// Storage layer for Giviti - Following Replit Auth blueprint
import {
  users,
  recipients,
  events,
  eventRecipients,
  userGifts,
  giftSuggestions,
  giftCategories,
  giftTypes,
  giftSuggestionCategories,
  googleProductCategories,
  userProfiles,
  recipientProfiles,
  occasions,
  priceRanges,
  relationshipTypes,
  systemSettings,
  auditLogs,
  themedNightCategories,
  themedNightSuggestions,
  collaborativeEvents,
  collaborativeEventParticipants,
  collaborativeEventLinks,
  secretSantaPairs,
  collectiveGiftContributions,
  collaborativeEventTasks,
  clicks,
  type User,
  type UpsertUser,
  type Recipient,
  type InsertRecipient,
  type Event,
  type InsertEvent,
  type EventWithRecipients,
  type InsertEventRecipient,
  type UserGift,
  type InsertUserGift,
  type GiftSuggestion,
  type InsertGiftSuggestion,
  type GiftCategory,
  type InsertGiftCategory,
  type GiftType,
  type InsertGiftType,
  type GiftSuggestionCategory,
  type InsertGiftSuggestionCategory,
  type GiftSuggestionWithRelations,
  type UserProfile,
  type InsertUserProfile,
  type RecipientProfile,
  type InsertRecipientProfile,
  type Occasion,
  type InsertOccasion,
  type PriceRange,
  type InsertPriceRange,
  type RelationshipType,
  type InsertRelationshipType,
  type SystemSetting,
  type InsertSystemSetting,
  type AuditLog,
  type InsertAuditLog,
  type ThemedNightCategory,
  type InsertThemedNightCategory,
  type ThemedNightSuggestion,
  type InsertThemedNightSuggestion,
  type CollaborativeEvent,
  type InsertCollaborativeEvent,
  type CollaborativeEventParticipant,
  type InsertCollaborativeEventParticipant,
  type CollaborativeEventLink,
  type InsertCollaborativeEventLink,
  type SecretSantaPair,
  type InsertSecretSantaPair,
  type CollectiveGiftContribution,
  type InsertCollectiveGiftContribution,
  type CollaborativeEventTask,
  type InsertCollaborativeEventTask,
  type Click,
  type GoogleProductCategory,
  signos,
  mensagensSemanais,
  type Signo,
  type MensagemSemanal,
  passwordResetTokens,
  type PasswordResetToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql, inArray } from "drizzle-orm";

// Enriched participant type with profile data
export type ParticipantWithProfile = CollaborativeEventParticipant & {
  hasFilledProfile: boolean;
  userProfile: {
    ageRange: string | null;
    gender: string | null;
    zodiacSign: string | null;
    giftPreference: string | null;
    freeTimeActivity: string | null;
    musicalStyle: string | null;
    monthlyGiftPreference: string | null;
    surpriseReaction: string | null;
    giftPriority: string | null;
    giftGivingStyle: string | null;
    specialTalent: string | null;
    giftsToAvoid: string | null;
    interests: string[] | null;
  } | null;
};

// Storage interface with all CRUD operations
export interface IStorage {
  // User operations - email/password authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User>;
  updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean>;

  // Password reset tokens
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<boolean>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  invalidatePasswordResetTokensForUser(userId: string): Promise<void>;

  // Recipient operations
  createRecipient(userId: string, recipient: InsertRecipient): Promise<Recipient>;
  getRecipients(userId: string): Promise<Recipient[]>;
  getRecipient(id: string, userId: string): Promise<Recipient | undefined>;
  updateRecipient(id: string, userId: string, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined>;
  deleteRecipient(id: string, userId: string): Promise<boolean>;

  // Event operations
  createEvent(userId: string, event: InsertEvent, recipientIds?: string[]): Promise<EventWithRecipients>;
  getEvents(userId: string): Promise<EventWithRecipients[]>;
  getEvent(id: string, userId: string): Promise<EventWithRecipients | undefined>;
  updateEvent(id: string, userId: string, event: Partial<InsertEvent>, recipientIds?: string[]): Promise<EventWithRecipients | undefined>;
  deleteEvent(id: string, userId: string): Promise<boolean>;
  archiveEvent(id: string, userId: string): Promise<EventWithRecipients | undefined>;
  advanceEventToNextYear(id: string, userId: string): Promise<EventWithRecipients | undefined>;
  getUpcomingEvents(userId: string, days?: number): Promise<EventWithRecipients[]>;

  // UserGift operations
  createUserGift(userId: string, gift: InsertUserGift): Promise<UserGift>;
  getUserGifts(userId: string): Promise<UserGift[]>;
  getUserGiftBySuggestion(userId: string, suggestionId: string, recipientId: string): Promise<UserGift | undefined>;
  updateUserGift(id: string, userId: string, updates: Partial<Pick<UserGift, 'isFavorite' | 'isPurchased' | 'purchasedAt'>>): Promise<UserGift | undefined>;
  deleteUserGift(id: string, userId: string): Promise<boolean>;

  // Stats
  getStats(userId: string): Promise<{ totalRecipients: number; upcomingEvents: number; giftsPurchased: number; totalSpent: number }>;
  
  // Admin stats
  getAdminStats(): Promise<{ 
    totalUsers: number; 
    totalRecipients: number; 
    totalEvents: number; 
    totalSuggestions: number;
    totalGiftsPurchased: number;
  }>;
  
  // Gift Suggestions
  getGiftSuggestions(filters?: { category?: string; minPrice?: number; maxPrice?: number; tags?: string[] }): Promise<GiftSuggestion[]>;
  getGiftSuggestion(id: string): Promise<GiftSuggestion | undefined>;
  getAutoSuggestions(recipientId: string, userId: string, page?: number, limit?: number): Promise<{ suggestions: GiftSuggestion[]; total: number; page: number; totalPages: number }>;
  createGiftSuggestion(suggestion: InsertGiftSuggestion): Promise<GiftSuggestion>;
  updateGiftSuggestion(id: string, updates: Partial<InsertGiftSuggestion>): Promise<GiftSuggestion | undefined>;
  deleteGiftSuggestion(id: string): Promise<boolean>;
  
  // Google Product Categories
  getGoogleProductCategories(): Promise<GoogleProductCategory[]>;
  
  // Gift Categories Management (Admin)
  getGiftCategories(includeInactive?: boolean): Promise<GiftCategory[]>;
  getGiftCategory(id: string): Promise<GiftCategory | undefined>;
  createGiftCategory(category: InsertGiftCategory): Promise<GiftCategory>;
  updateGiftCategory(id: string, updates: Partial<InsertGiftCategory>): Promise<GiftCategory | undefined>;
  deleteGiftCategory(id: string): Promise<boolean>;
  
  // Gift Types Management (Admin)
  getGiftTypes(includeInactive?: boolean): Promise<GiftType[]>;
  getGiftType(id: string): Promise<GiftType | undefined>;
  createGiftType(giftType: InsertGiftType): Promise<GiftType>;
  updateGiftType(id: string, updates: Partial<InsertGiftType>): Promise<GiftType | undefined>;
  deleteGiftType(id: string): Promise<boolean>;
  
  // Gift Suggestion Categories (many-to-many)
  getSuggestionCategories(suggestionId: string): Promise<GiftCategory[]>;
  setSuggestionCategories(suggestionId: string, categoryIds: string[]): Promise<void>;
  
  // Click Tracking
  recordClick(link: string): Promise<Click>;
  getClickStats(link: string): Promise<Click | undefined>;
  getAllClickStats(): Promise<Click[]>;
  
  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // Recipient Profile operations
  getRecipientProfile(recipientId: string, userId: string): Promise<RecipientProfile | undefined>;
  upsertRecipientProfile(recipientId: string, userId: string, profile: InsertRecipientProfile): Promise<RecipientProfile>;
  
  // ========== ADMIN MODULE OPERATIONS ==========
  
  // User Management (Admin)
  getAllUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]>;
  updateUser(userId: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'role' | 'isActive'>>): Promise<User | undefined>;
  updateUserLastLogin(userId: string): Promise<void>;
  
  // Occasions Management
  getOccasions(includeInactive?: boolean): Promise<Occasion[]>;
  getOccasion(id: string): Promise<Occasion | undefined>;
  createOccasion(occasion: InsertOccasion): Promise<Occasion>;
  updateOccasion(id: string, updates: Partial<InsertOccasion>): Promise<Occasion | undefined>;
  deleteOccasion(id: string): Promise<boolean>;
  
  // Price Ranges Management
  getPriceRanges(includeInactive?: boolean): Promise<PriceRange[]>;
  getPriceRange(id: string): Promise<PriceRange | undefined>;
  createPriceRange(priceRange: InsertPriceRange): Promise<PriceRange>;
  updatePriceRange(id: string, updates: Partial<InsertPriceRange>): Promise<PriceRange | undefined>;
  deletePriceRange(id: string): Promise<boolean>;
  
  // Relationship Types Management
  getRelationshipTypes(includeInactive?: boolean): Promise<RelationshipType[]>;
  getRelationshipType(id: string): Promise<RelationshipType | undefined>;
  createRelationshipType(relationshipType: InsertRelationshipType): Promise<RelationshipType>;
  updateRelationshipType(id: string, updates: Partial<InsertRelationshipType>): Promise<RelationshipType | undefined>;
  deleteRelationshipType(id: string): Promise<boolean>;
  
  // Themed Night Categories Management
  getThemedNightCategories(includeInactive?: boolean): Promise<ThemedNightCategory[]>;
  getThemedNightCategory(id: string): Promise<ThemedNightCategory | undefined>;
  createThemedNightCategory(category: InsertThemedNightCategory): Promise<ThemedNightCategory>;
  updateThemedNightCategory(id: string, updates: Partial<InsertThemedNightCategory>): Promise<ThemedNightCategory | undefined>;
  deleteThemedNightCategory(id: string): Promise<boolean>;
  
  // Themed Night Suggestions Management
  getThemedNightSuggestions(categoryId: string, includeInactive?: boolean): Promise<ThemedNightSuggestion[]>;
  getThemedNightSuggestion(id: string): Promise<ThemedNightSuggestion | undefined>;
  createThemedNightSuggestion(suggestion: InsertThemedNightSuggestion): Promise<ThemedNightSuggestion>;
  updateThemedNightSuggestion(id: string, updates: Partial<InsertThemedNightSuggestion>): Promise<ThemedNightSuggestion | undefined>;
  deleteThemedNightSuggestion(id: string): Promise<boolean>;
  
  // System Settings Management
  getSystemSettings(publicOnly?: boolean): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<boolean>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: string; resource?: string; limit?: number }): Promise<AuditLog[]>;
  
  // Advanced Admin Stats & Reports
  getAdvancedStats(): Promise<{
    userStats: { total: number; active: number; byRole: Record<string, number> };
    giftStats: { totalSuggestions: number; purchasedGifts: number; favoriteGifts: number };
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: { newUsersToday: number; newEventsToday: number; giftsMarkedTodayAsPurchased: number };
    totalEvents: number;
  }>;
  
  // User statistics for detailed user list
  getUserEventsCount(userId: string): Promise<number>;
  getUserRecipientsCount(userId: string): Promise<number>;
  getUserPurchasedGiftsCount(userId: string): Promise<number>;
  getAllUsersWithStats(): Promise<Array<User & { eventsCount: number; recipientsCount: number; purchasedGiftsCount: number }>>;
  
  // ========== COLLABORATIVE EVENTS (Planeje seu rolê!) ==========
  
  // Collaborative Event Operations
  createCollaborativeEvent(ownerId: string, event: InsertCollaborativeEvent): Promise<CollaborativeEvent>;
  getCollaborativeEvents(userId: string): Promise<CollaborativeEvent[]>;
  getCollaborativeEvent(id: string, userId?: string): Promise<CollaborativeEvent | undefined>;
  updateCollaborativeEvent(id: string, userId: string, updates: Partial<InsertCollaborativeEvent>): Promise<CollaborativeEvent | undefined>;
  rescheduleCollaborativeEvent(id: string, userId: string, newDate: Date): Promise<CollaborativeEvent | undefined>;
  deleteCollaborativeEvent(id: string, userId: string): Promise<boolean>;
  
  // Participant Operations
  addParticipant(eventId: string, participant: InsertCollaborativeEventParticipant): Promise<CollaborativeEventParticipant>;
  getParticipants(eventId: string): Promise<CollaborativeEventParticipant[]>;
  getParticipantsWithProfiles(eventId: string): Promise<ParticipantWithProfile[]>;
  getParticipant(id: string): Promise<CollaborativeEventParticipant | undefined>;
  updateParticipantStatus(id: string, status: string): Promise<CollaborativeEventParticipant | undefined>;
  updateParticipantInviteToken(id: string, inviteToken: string): Promise<CollaborativeEventParticipant | undefined>;
  updateParticipantEmailStatus(id: string, emailStatus: string): Promise<CollaborativeEventParticipant | undefined>;
  removeParticipant(id: string, eventId: string): Promise<boolean>;
  linkParticipantsByEmail(email: string, userId: string): Promise<number>;
  
  // Share Link Operations
  createShareLink(link: InsertCollaborativeEventLink): Promise<CollaborativeEventLink>;
  getShareLink(token: string): Promise<CollaborativeEventLink | undefined>;
  getShareLinksByEvent(eventId: string): Promise<CollaborativeEventLink[]>;
  incrementShareLinkUse(token: string): Promise<void>;
  revokeShareLink(token: string): Promise<boolean>;
  
  // Secret Santa Operations
  savePairs(eventId: string, pairs: InsertSecretSantaPair[]): Promise<SecretSantaPair[]>;
  getPairsByEvent(eventId: string): Promise<SecretSantaPair[]>;
  getPairForParticipant(eventId: string, participantId: string): Promise<SecretSantaPair | undefined>;
  deletePairsByEvent(eventId: string): Promise<boolean>;
  
  // Collective Gift Contribution Operations
  getContributions(eventId: string): Promise<CollectiveGiftContribution[]>;
  getContribution(id: string): Promise<CollectiveGiftContribution | undefined>;
  getContributionByParticipant(eventId: string, participantId: string): Promise<CollectiveGiftContribution | undefined>;
  createContribution(contribution: InsertCollectiveGiftContribution): Promise<CollectiveGiftContribution>;
  updateContribution(id: string, updates: Partial<InsertCollectiveGiftContribution>): Promise<CollectiveGiftContribution | undefined>;
  deleteContribution(id: string): Promise<boolean>;
  getContributionsSummary(eventId: string): Promise<{ totalDue: number; totalPaid: number; participantsCount: number; paidCount: number }>;
  
  // Horoscope Operations
  getSignoByDate(dia: number, mes: number): Promise<Signo | undefined>;
  getMensagemSemanal(signoId: string, numeroSemana: number): Promise<MensagemSemanal | undefined>;
  getHoroscope(userId: string): Promise<{ signo: Signo; mensagem: MensagemSemanal } | null>;
}

export class DatabaseStorage implements IStorage {
  // ========== User Operations (Email/Password Authentication) ==========
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result.length > 0;
  }

  // ========== Password Reset Token Operations ==========

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async markPasswordResetTokenUsed(id: string): Promise<boolean> {
    const result = await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < NOW()`);
  }

  async invalidatePasswordResetTokensForUser(userId: string): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));
  }

  // ========== Recipient Operations ==========

  async createRecipient(userId: string, recipient: InsertRecipient): Promise<Recipient> {
    const [newRecipient] = await db
      .insert(recipients)
      .values({
        ...recipient,
        userId,
      })
      .returning();
    return newRecipient;
  }

  async getRecipients(userId: string): Promise<Recipient[]> {
    return await db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, userId))
      .orderBy(recipients.createdAt);
  }

  async getRecipient(id: string, userId: string): Promise<Recipient | undefined> {
    const [recipient] = await db
      .select()
      .from(recipients)
      .where(and(eq(recipients.id, id), eq(recipients.userId, userId)));
    return recipient;
  }

  async updateRecipient(
    id: string,
    userId: string,
    recipientData: Partial<InsertRecipient>
  ): Promise<Recipient | undefined> {
    const [updated] = await db
      .update(recipients)
      .set({
        ...recipientData,
        updatedAt: new Date(),
      })
      .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
      .returning();
    return updated;
  }

  async deleteRecipient(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(recipients)
      .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // ========== Event Operations ==========

  async createEvent(userId: string, event: InsertEvent, recipientIds: string[] = []): Promise<EventWithRecipients> {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...event,
        userId,
      })
      .returning();

    if (recipientIds.length > 0) {
      await db.insert(eventRecipients).values(
        recipientIds.map(recipientId => ({
          eventId: newEvent.id,
          recipientId,
        }))
      );
    }

    return this.getEvent(newEvent.id, userId) as Promise<EventWithRecipients>;
  }

  async getEvents(userId: string): Promise<EventWithRecipients[]> {
    const allEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(events.eventDate);

    return Promise.all(
      allEvents.map(async (event) => {
        const recipients = await this.getEventRecipients(event.id);
        return { ...event, recipients };
      })
    );
  }

  async getEvent(id: string, userId: string): Promise<EventWithRecipients | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    
    if (!event) return undefined;

    const recipients = await this.getEventRecipients(event.id);
    return { ...event, recipients };
  }

  async updateEvent(
    id: string,
    userId: string,
    eventData: Partial<InsertEvent>,
    recipientIds?: string[]
  ): Promise<EventWithRecipients | undefined> {
    const [updated] = await db
      .update(events)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();

    if (!updated) return undefined;

    if (recipientIds !== undefined) {
      await db.delete(eventRecipients).where(eq(eventRecipients.eventId, id));
      
      if (recipientIds.length > 0) {
        await db.insert(eventRecipients).values(
          recipientIds.map(recipientId => ({
            eventId: id,
            recipientId,
          }))
        );
      }
    }

    return this.getEvent(id, userId);
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async archiveEvent(id: string, userId: string): Promise<EventWithRecipients | undefined> {
    const [updated] = await db
      .update(events)
      .set({
        archived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();

    if (!updated) return undefined;

    return this.getEvent(id, userId);
  }

  async advanceEventToNextYear(id: string, userId: string): Promise<EventWithRecipients | undefined> {
    const event = await this.getEvent(id, userId);
    if (!event) return undefined;

    const currentDate = new Date(event.eventDate);
    const today = new Date();
    const nextYearDate = new Date(currentDate);
    
    // Keep adding years until the date is in the future
    do {
      nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    } while (nextYearDate <= today);

    const [updated] = await db
      .update(events)
      .set({
        eventDate: nextYearDate.toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();

    if (!updated) return undefined;

    return this.getEvent(id, userId);
  }

  async getUpcomingEvents(userId: string, days: number = 30): Promise<EventWithRecipients[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          gte(events.eventDate, today.toISOString().split('T')[0])
        )
      )
      .orderBy(events.eventDate);

    return Promise.all(
      upcomingEvents.map(async (event) => {
        const recipients = await this.getEventRecipients(event.id);
        return { ...event, recipients };
      })
    );
  }

  private async getEventRecipients(eventId: string): Promise<Recipient[]> {
    const eventRecipientRows = await db
      .select()
      .from(eventRecipients)
      .where(eq(eventRecipients.eventId, eventId));

    if (eventRecipientRows.length > 0) {
      const recipientIds = eventRecipientRows.map(er => er.recipientId);
      return await db
        .select()
        .from(recipients)
        .where(inArray(recipients.id, recipientIds));
    }

    // Fallback: check if event has legacy recipientId
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (event?.recipientId) {
      const [recipient] = await db
        .select()
        .from(recipients)
        .where(eq(recipients.id, event.recipientId));
      
      return recipient ? [recipient] : [];
    }

    return [];
  }

  // ========== UserGift Operations ==========

  async createUserGift(userId: string, gift: InsertUserGift): Promise<UserGift> {
    const [newGift] = await db
      .insert(userGifts)
      .values({
        ...gift,
        userId,
      })
      .returning();
    return newGift;
  }

  async getUserGifts(userId: string): Promise<UserGift[]> {
    return await db
      .select()
      .from(userGifts)
      .where(eq(userGifts.userId, userId))
      .orderBy(userGifts.createdAt);
  }

  async getUserGiftBySuggestion(
    userId: string,
    suggestionId: string,
    recipientId: string
  ): Promise<UserGift | undefined> {
    const [gift] = await db
      .select()
      .from(userGifts)
      .where(
        and(
          eq(userGifts.userId, userId),
          eq(userGifts.suggestionId, suggestionId),
          eq(userGifts.recipientId, recipientId)
        )
      );
    return gift;
  }

  async updateUserGift(
    id: string,
    userId: string,
    updates: Partial<Pick<UserGift, 'isFavorite' | 'isPurchased' | 'purchasedAt'>>
  ): Promise<UserGift | undefined> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Set purchasedAt when marking as purchased
    if (updates.isPurchased === true && !updates.purchasedAt) {
      updateData.purchasedAt = new Date();
    }
    // Clear purchasedAt when unmarking as purchased
    if (updates.isPurchased === false) {
      updateData.purchasedAt = null;
    }

    const [updated] = await db
      .update(userGifts)
      .set(updateData)
      .where(and(eq(userGifts.id, id), eq(userGifts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteUserGift(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(userGifts)
      .where(and(eq(userGifts.id, id), eq(userGifts.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // ========== Stats ==========

  async getStats(userId: string): Promise<{
    totalRecipients: number;
    upcomingEvents: number;
    giftsPurchased: number;
    totalSpent: number;
  }> {
    // Total recipients
    const recipientCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(recipients)
      .where(eq(recipients.userId, userId));

    // Upcoming events (next 30 days)
    const today = new Date().toISOString().split('T')[0];
    const upcomingEventCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          gte(events.eventDate, today)
        )
      );

    // Gifts purchased and total spent
    const purchasedGiftsData = await db
      .select({ 
        count: sql<number>`count(*)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${userGifts.price}::numeric), 0)::numeric`
      })
      .from(userGifts)
      .where(
        and(
          eq(userGifts.userId, userId),
          eq(userGifts.isPurchased, true)
        )
      );

    return {
      totalRecipients: recipientCount[0]?.count || 0,
      upcomingEvents: upcomingEventCount[0]?.count || 0,
      giftsPurchased: purchasedGiftsData[0]?.count || 0,
      totalSpent: parseFloat(String(purchasedGiftsData[0]?.totalSpent || 0)),
    };
  }

  // ========== Gift Suggestions ==========

  async getGiftSuggestions(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
  }): Promise<GiftSuggestion[]> {
    let query = db.select().from(giftSuggestions);
    
    const conditions: any[] = [];
    
    if (filters?.category) {
      conditions.push(eq(giftSuggestions.category, filters.category));
    }
    
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`${giftSuggestions.price} >= ${filters.minPrice}`);
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${giftSuggestions.price} <= ${filters.maxPrice}`);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      conditions.push(sql`${giftSuggestions.tags} && ARRAY[${sql.join(filters.tags.map(t => sql`${t}`), sql`, `)}]::text[]`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getGiftSuggestion(id: string): Promise<GiftSuggestion | undefined> {
    const [suggestion] = await db
      .select()
      .from(giftSuggestions)
      .where(eq(giftSuggestions.id, id));
    return suggestion;
  }

  async getAutoSuggestions(recipientId: string, userId: string, page: number = 1, limit: number = 5): Promise<{ suggestions: GiftSuggestion[]; total: number; page: number; totalPages: number }> {
    // Get recipient and profile to match suggestions
    const recipient = await this.getRecipient(recipientId, userId);
    if (!recipient) {
      return { suggestions: [], total: 0, page: 1, totalPages: 0 };
    }

    const profile = await this.getRecipientProfile(recipientId, userId);
    
    // Build matching criteria based on profile
    const conditions: any[] = [];
    
    // Match by interests/tags
    const interests = recipient.interests || [];
    if (interests.length > 0) {
      conditions.push(sql`${giftSuggestions.tags} && ARRAY[${sql.join(interests.map(i => sql`${i}`), sql`, `)}]::text[]`);
    }
    
    // Match by category from profile
    if (profile?.interestCategory) {
      conditions.push(sql`LOWER(${giftSuggestions.category}) LIKE LOWER(${'%' + profile.interestCategory + '%'})`);
    }
    
    // Match by budget range from profile
    if (profile?.budgetRange) {
      const budgetMap: Record<string, { min: number; max: number }> = {
        "ate-50": { min: 0, max: 50 },
        "50-100": { min: 50, max: 100 },
        "100-200": { min: 100, max: 200 },
        "200-500": { min: 200, max: 500 },
        "acima-500": { min: 500, max: 99999 }
      };
      const budget = budgetMap[profile.budgetRange];
      if (budget) {
        conditions.push(sql`${giftSuggestions.price} >= ${budget.min}`);
        conditions.push(sql`${giftSuggestions.price} <= ${budget.max}`);
      }
    }

    // Count total matching suggestions
    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(giftSuggestions);
    if (conditions.length > 0) {
      countQuery = countQuery.where(sql`(${sql.join(conditions, sql` OR `)})`) as any;
    }
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    // Get matching suggestions with priority ordering
    let query = db.select().from(giftSuggestions);
    if (conditions.length > 0) {
      query = query.where(sql`(${sql.join(conditions, sql` OR `)})`) as any;
    }
    
    const suggestions = await (query as any)
      .orderBy(sql`${giftSuggestions.priority} IS NULL, ${giftSuggestions.priority} ASC`)
      .limit(limit)
      .offset(offset);
    
    return { suggestions, total, page, totalPages };
  }

  async createGiftSuggestion(suggestion: InsertGiftSuggestion): Promise<GiftSuggestion> {
    const [newSuggestion] = await db
      .insert(giftSuggestions)
      .values(suggestion)
      .returning();
    return newSuggestion;
  }

  async updateGiftSuggestion(id: string, updates: Partial<InsertGiftSuggestion>): Promise<GiftSuggestion | undefined> {
    const [updated] = await db
      .update(giftSuggestions)
      .set(updates)
      .where(eq(giftSuggestions.id, id))
      .returning();
    return updated;
  }

  async deleteGiftSuggestion(id: string): Promise<boolean> {
    const result = await db
      .delete(giftSuggestions)
      .where(eq(giftSuggestions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== Google Product Categories ==========

  async getGoogleProductCategories(): Promise<GoogleProductCategory[]> {
    return db.select().from(googleProductCategories).where(eq(googleProductCategories.isActive, true));
  }

  // ========== Gift Categories Management ==========

  async getGiftCategories(includeInactive: boolean = false): Promise<GiftCategory[]> {
    if (includeInactive) {
      return db.select().from(giftCategories);
    }
    return db.select().from(giftCategories).where(eq(giftCategories.isActive, true));
  }

  async getGiftCategory(id: string): Promise<GiftCategory | undefined> {
    const [category] = await db
      .select()
      .from(giftCategories)
      .where(eq(giftCategories.id, id));
    return category;
  }

  async createGiftCategory(category: InsertGiftCategory): Promise<GiftCategory> {
    const [newCategory] = await db
      .insert(giftCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateGiftCategory(id: string, updates: Partial<InsertGiftCategory>): Promise<GiftCategory | undefined> {
    const [updated] = await db
      .update(giftCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(giftCategories.id, id))
      .returning();
    return updated;
  }

  async deleteGiftCategory(id: string): Promise<boolean> {
    const result = await db
      .delete(giftCategories)
      .where(eq(giftCategories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== Gift Types Management ==========

  async getGiftTypes(includeInactive: boolean = false): Promise<GiftType[]> {
    if (includeInactive) {
      return db.select().from(giftTypes);
    }
    return db.select().from(giftTypes).where(eq(giftTypes.isActive, true));
  }

  async getGiftType(id: string): Promise<GiftType | undefined> {
    const [giftType] = await db
      .select()
      .from(giftTypes)
      .where(eq(giftTypes.id, id));
    return giftType;
  }

  async createGiftType(giftType: InsertGiftType): Promise<GiftType> {
    const [newGiftType] = await db
      .insert(giftTypes)
      .values(giftType)
      .returning();
    return newGiftType;
  }

  async updateGiftType(id: string, updates: Partial<InsertGiftType>): Promise<GiftType | undefined> {
    const [updated] = await db
      .update(giftTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(giftTypes.id, id))
      .returning();
    return updated;
  }

  async deleteGiftType(id: string): Promise<boolean> {
    const result = await db
      .delete(giftTypes)
      .where(eq(giftTypes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ========== Gift Suggestion Categories (many-to-many) ==========

  async getSuggestionCategories(suggestionId: string): Promise<GiftCategory[]> {
    const relations = await db
      .select({ categoryId: giftSuggestionCategories.categoryId })
      .from(giftSuggestionCategories)
      .where(eq(giftSuggestionCategories.suggestionId, suggestionId));
    
    if (relations.length === 0) return [];
    
    const categoryIds = relations.map(r => r.categoryId);
    return db
      .select()
      .from(giftCategories)
      .where(inArray(giftCategories.id, categoryIds));
  }

  async setSuggestionCategories(suggestionId: string, categoryIds: string[]): Promise<void> {
    await db
      .delete(giftSuggestionCategories)
      .where(eq(giftSuggestionCategories.suggestionId, suggestionId));
    
    if (categoryIds.length > 0) {
      const values = categoryIds.map(categoryId => ({
        suggestionId,
        categoryId,
      }));
      await db.insert(giftSuggestionCategories).values(values);
    }
  }

  // ========== Click Tracking ==========

  async recordClick(link: string): Promise<Click> {
    const existing = await db
      .select()
      .from(clicks)
      .where(eq(clicks.link, link));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(clicks)
        .set({ 
          clickCount: sql`${clicks.clickCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(clicks.link, link))
        .returning();
      return updated;
    } else {
      const [newClick] = await db
        .insert(clicks)
        .values({ link, clickCount: 1 })
        .returning();
      return newClick;
    }
  }

  async getClickStats(link: string): Promise<Click | undefined> {
    const [click] = await db
      .select()
      .from(clicks)
      .where(eq(clicks.link, link));
    return click;
  }

  async getAllClickStats(): Promise<Click[]> {
    return db.select().from(clicks).orderBy(sql`${clicks.clickCount} DESC`);
  }

  async getTopClickedLinks(limit: number = 10): Promise<Array<{
    id: string;
    link: string;
    clickCount: number;
    updatedAt: Date | null;
    suggestionName: string | null;
    suggestionId: string | null;
  }>> {
    const result = await db
      .select({
        id: clicks.id,
        link: clicks.link,
        clickCount: clicks.clickCount,
        updatedAt: clicks.updatedAt,
        suggestionName: giftSuggestions.name,
        suggestionId: giftSuggestions.id,
      })
      .from(clicks)
      .leftJoin(giftSuggestions, eq(giftSuggestions.productUrl, clicks.link))
      .orderBy(sql`${clicks.clickCount} DESC`)
      .limit(limit);
    
    return result;
  }

  // ========== User Profile ==========

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(userId: string, profileData: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values({ ...profileData, userId })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // ========== Recipient Profile ==========

  async getRecipientProfile(recipientId: string, userId: string): Promise<RecipientProfile | undefined> {
    // First verify the recipient belongs to the user
    const recipient = await this.getRecipient(recipientId, userId);
    if (!recipient) {
      return undefined;
    }

    const [profile] = await db
      .select()
      .from(recipientProfiles)
      .where(eq(recipientProfiles.recipientId, recipientId));
    return profile;
  }

  async upsertRecipientProfile(recipientId: string, userId: string, profileData: InsertRecipientProfile): Promise<RecipientProfile> {
    // First verify the recipient belongs to the user
    const recipient = await this.getRecipient(recipientId, userId);
    if (!recipient) {
      throw new Error("Recipient not found or access denied");
    }

    const [profile] = await db
      .insert(recipientProfiles)
      .values({ ...profileData, recipientId })
      .onConflictDoUpdate({
        target: recipientProfiles.recipientId,
        set: {
          ...profileData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return profile;
  }

  // ========== ADMIN MODULE IMPLEMENTATIONS ==========
  
  // User Management (Admin)
  async getAllUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    let query = db.select().from(users);
    
    const conditions = [];
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(users.createdAt);
  }
  
  async updateUser(
    userId: string,
    updates: Partial<Pick<User, 'firstName' | 'lastName' | 'role' | 'isActive'>>
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
  
  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }
  
  // Occasions Management
  async getOccasions(includeInactive = false): Promise<Occasion[]> {
    let query = db.select().from(occasions);
    
    if (!includeInactive) {
      query = query.where(eq(occasions.isActive, true)) as any;
    }
    
    return await query.orderBy(occasions.name);
  }
  
  async getOccasion(id: string): Promise<Occasion | undefined> {
    const [occasion] = await db.select().from(occasions).where(eq(occasions.id, id));
    return occasion;
  }
  
  async createOccasion(occasion: InsertOccasion): Promise<Occasion> {
    const [newOccasion] = await db.insert(occasions).values(occasion).returning();
    return newOccasion;
  }
  
  async updateOccasion(id: string, updates: Partial<InsertOccasion>): Promise<Occasion | undefined> {
    const [updated] = await db
      .update(occasions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(occasions.id, id))
      .returning();
    return updated;
  }
  
  async deleteOccasion(id: string): Promise<boolean> {
    const result = await db.delete(occasions).where(eq(occasions.id, id)).returning();
    return result.length > 0;
  }
  
  // Price Ranges Management
  async getPriceRanges(includeInactive = false): Promise<PriceRange[]> {
    let query = db.select().from(priceRanges);
    
    if (!includeInactive) {
      query = query.where(eq(priceRanges.isActive, true)) as any;
    }
    
    return await query.orderBy(priceRanges.minPrice);
  }
  
  async getPriceRange(id: string): Promise<PriceRange | undefined> {
    const [priceRange] = await db.select().from(priceRanges).where(eq(priceRanges.id, id));
    return priceRange;
  }
  
  async createPriceRange(priceRange: InsertPriceRange): Promise<PriceRange> {
    const [newPriceRange] = await db.insert(priceRanges).values(priceRange).returning();
    return newPriceRange;
  }
  
  async updatePriceRange(id: string, updates: Partial<InsertPriceRange>): Promise<PriceRange | undefined> {
    const [updated] = await db
      .update(priceRanges)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(priceRanges.id, id))
      .returning();
    return updated;
  }
  
  async deletePriceRange(id: string): Promise<boolean> {
    const result = await db.delete(priceRanges).where(eq(priceRanges.id, id)).returning();
    return result.length > 0;
  }
  
  // Relationship Types Management
  async getRelationshipTypes(includeInactive = false): Promise<RelationshipType[]> {
    let query = db.select().from(relationshipTypes);
    
    if (!includeInactive) {
      query = query.where(eq(relationshipTypes.isActive, true)) as any;
    }
    
    return await query.orderBy(relationshipTypes.name);
  }
  
  async getRelationshipType(id: string): Promise<RelationshipType | undefined> {
    const [relationshipType] = await db.select().from(relationshipTypes).where(eq(relationshipTypes.id, id));
    return relationshipType;
  }
  
  async createRelationshipType(relationshipType: InsertRelationshipType): Promise<RelationshipType> {
    const [newRelationshipType] = await db.insert(relationshipTypes).values(relationshipType).returning();
    return newRelationshipType;
  }
  
  async updateRelationshipType(id: string, updates: Partial<InsertRelationshipType>): Promise<RelationshipType | undefined> {
    const [updated] = await db
      .update(relationshipTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(relationshipTypes.id, id))
      .returning();
    return updated;
  }
  
  async deleteRelationshipType(id: string): Promise<boolean> {
    const result = await db.delete(relationshipTypes).where(eq(relationshipTypes.id, id)).returning();
    return result.length > 0;
  }
  
  // Themed Night Categories Management
  async getThemedNightCategories(includeInactive = false): Promise<ThemedNightCategory[]> {
    let query = db.select().from(themedNightCategories);
    
    if (!includeInactive) {
      query = query.where(eq(themedNightCategories.isActive, true)) as any;
    }
    
    return await query.orderBy(themedNightCategories.name);
  }
  
  async getThemedNightCategory(id: string): Promise<ThemedNightCategory | undefined> {
    const [category] = await db.select().from(themedNightCategories).where(eq(themedNightCategories.id, id));
    return category;
  }
  
  async createThemedNightCategory(category: InsertThemedNightCategory): Promise<ThemedNightCategory> {
    const [newCategory] = await db.insert(themedNightCategories).values(category).returning();
    return newCategory;
  }
  
  async updateThemedNightCategory(id: string, updates: Partial<InsertThemedNightCategory>): Promise<ThemedNightCategory | undefined> {
    const [updated] = await db
      .update(themedNightCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themedNightCategories.id, id))
      .returning();
    return updated;
  }
  
  async deleteThemedNightCategory(id: string): Promise<boolean> {
    const result = await db.delete(themedNightCategories).where(eq(themedNightCategories.id, id)).returning();
    return result.length > 0;
  }
  
  // Themed Night Suggestions Management
  async getThemedNightSuggestions(categoryId: string, includeInactive = false): Promise<ThemedNightSuggestion[]> {
    if (includeInactive) {
      return await db.select()
        .from(themedNightSuggestions)
        .where(eq(themedNightSuggestions.categoryId, categoryId))
        .orderBy(themedNightSuggestions.priority);
    }
    
    return await db.select()
      .from(themedNightSuggestions)
      .where(and(
        eq(themedNightSuggestions.categoryId, categoryId),
        eq(themedNightSuggestions.isActive, true)
      ))
      .orderBy(themedNightSuggestions.priority);
  }
  
  async getThemedNightSuggestion(id: string): Promise<ThemedNightSuggestion | undefined> {
    const [suggestion] = await db.select().from(themedNightSuggestions).where(eq(themedNightSuggestions.id, id));
    return suggestion;
  }
  
  async createThemedNightSuggestion(suggestion: InsertThemedNightSuggestion): Promise<ThemedNightSuggestion> {
    const [newSuggestion] = await db.insert(themedNightSuggestions).values(suggestion).returning();
    return newSuggestion;
  }
  
  async updateThemedNightSuggestion(id: string, updates: Partial<InsertThemedNightSuggestion>): Promise<ThemedNightSuggestion | undefined> {
    const [updated] = await db
      .update(themedNightSuggestions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(themedNightSuggestions.id, id))
      .returning();
    return updated;
  }
  
  async deleteThemedNightSuggestion(id: string): Promise<boolean> {
    const result = await db.delete(themedNightSuggestions).where(eq(themedNightSuggestions.id, id)).returning();
    return result.length > 0;
  }
  
  // System Settings Management
  async getSystemSettings(publicOnly = false): Promise<SystemSetting[]> {
    let query = db.select().from(systemSettings);
    
    if (publicOnly) {
      query = query.where(eq(systemSettings.isPublic, true)) as any;
    }
    
    return await query.orderBy(systemSettings.key);
  }
  
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }
  
  async upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(systemSettings).values(setting).returning();
      return created;
    }
  }
  
  async deleteSystemSetting(key: string): Promise<boolean> {
    const result = await db.delete(systemSettings).where(eq(systemSettings.key, key)).returning();
    return result.length > 0;
  }
  
  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }
  
  async getAuditLogs(filters?: { userId?: string; resource?: string; limit?: number }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    const conditions = [];
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.resource) {
      conditions.push(eq(auditLogs.resource, filters.resource));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(sql`${auditLogs.createdAt} DESC`) as any;
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    return await query;
  }
  
  // Advanced Admin Stats & Reports
  async getAdvancedStats(): Promise<{
    userStats: { total: number; active: number; byRole: Record<string, number> };
    giftStats: { totalSuggestions: number; purchasedGifts: number; favoriteGifts: number };
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: { newUsersToday: number; newEventsToday: number; giftsMarkedTodayAsPurchased: number };
    totalEvents: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // User stats
    const totalUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    
    const activeUsers = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isActive, true));
    
    const usersByRole = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.role);
    
    const byRole: Record<string, number> = {};
    usersByRole.forEach((r) => {
      byRole[r.role] = r.count;
    });
    
    // Gift stats
    const totalSuggestions = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(giftSuggestions);
    
    const purchasedGifts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGifts)
      .where(eq(userGifts.isPurchased, true));
    
    const favoriteGifts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGifts)
      .where(eq(userGifts.isFavorite, true));
    
    // Top categories
    const topCategoriesResult = await db
      .select({
        category: giftSuggestions.category,
        count: sql<number>`count(*)::int`,
      })
      .from(giftSuggestions)
      .groupBy(giftSuggestions.category)
      .orderBy(sql`count(*) DESC`)
      .limit(10);
    
    // Recent activity
    const newUsersToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, today));
    
    // Count regular events created today
    const newRegularEventsToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(gte(events.createdAt, today));
    
    // Count collaborative events (rolês) created today
    const newCollaborativeEventsToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collaborativeEvents)
      .where(gte(collaborativeEvents.createdAt, today));
    
    const giftsMarkedTodayAsPurchased = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGifts)
      .where(and(
        eq(userGifts.isPurchased, true),
        gte(userGifts.purchasedAt, today)
      ));
    
    // Total events = regular events + collaborative events
    const totalRegularEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events);
    
    const totalCollaborativeEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collaborativeEvents);
    
    return {
      userStats: {
        total: totalUsers[0]?.count || 0,
        active: activeUsers[0]?.count || 0,
        byRole,
      },
      giftStats: {
        totalSuggestions: totalSuggestions[0]?.count || 0,
        purchasedGifts: purchasedGifts[0]?.count || 0,
        favoriteGifts: favoriteGifts[0]?.count || 0,
      },
      topCategories: topCategoriesResult.map((r) => ({
        category: r.category,
        count: r.count,
      })),
      recentActivity: {
        newUsersToday: newUsersToday[0]?.count || 0,
        newEventsToday: (newRegularEventsToday[0]?.count || 0) + (newCollaborativeEventsToday[0]?.count || 0),
        giftsMarkedTodayAsPurchased: giftsMarkedTodayAsPurchased[0]?.count || 0,
      },
      totalEvents: (totalRegularEvents[0]?.count || 0) + (totalCollaborativeEvents[0]?.count || 0),
    };
  }

  // ========== Admin Stats ==========

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalRecipients: number;
    totalEvents: number;
    totalSuggestions: number;
    totalGiftsPurchased: number;
  }> {
    const userCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const recipientCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(recipients);

    const eventCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events);

    const suggestionCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(giftSuggestions);

    const purchasedGiftCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGifts)
      .where(eq(userGifts.isPurchased, true));

    return {
      totalUsers: userCount[0]?.count || 0,
      totalRecipients: recipientCount[0]?.count || 0,
      totalEvents: eventCount[0]?.count || 0,
      totalSuggestions: suggestionCount[0]?.count || 0,
      totalGiftsPurchased: purchasedGiftCount[0]?.count || 0,
    };
  }

  // ========== User Statistics for Detailed User List ==========

  async getUserEventsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(eq(events.userId, userId));
    
    return result[0]?.count || 0;
  }

  async getUserRecipientsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(recipients)
      .where(eq(recipients.userId, userId));
    
    return result[0]?.count || 0;
  }

  async getUserPurchasedGiftsCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userGifts)
      .where(and(
        eq(userGifts.userId, userId),
        eq(userGifts.isPurchased, true)
      ));
    
    return result[0]?.count || 0;
  }

  async getAllUsersWithStats(): Promise<Array<User & { eventsCount: number; recipientsCount: number; purchasedGiftsCount: number }>> {
    // Optimized query using CTEs to aggregate all stats in a single round trip
    // eventsCount includes both regular events (datas comemorativas) and collaborative events (rolês)
    const result = await db.execute(sql`
      WITH user_events AS (
        SELECT user_id, COUNT(*)::int AS events_count
        FROM events
        GROUP BY user_id
      ),
      user_collaborative_events AS (
        SELECT owner_id AS user_id, COUNT(*)::int AS collaborative_count
        FROM collaborative_events
        GROUP BY owner_id
      ),
      user_recipients AS (
        SELECT user_id, COUNT(*)::int AS recipients_count
        FROM recipients
        GROUP BY user_id
      ),
      user_purchased_gifts AS (
        SELECT user_id, COUNT(*)::int AS purchased_gifts_count
        FROM user_gifts
        WHERE is_purchased = true
        GROUP BY user_id
      )
      SELECT 
        u.*,
        (COALESCE(ue.events_count, 0) + COALESCE(uce.collaborative_count, 0)) AS events_count,
        COALESCE(ur.recipients_count, 0) AS recipients_count,
        COALESCE(upg.purchased_gifts_count, 0) AS purchased_gifts_count
      FROM users u
      LEFT JOIN user_events ue ON u.id = ue.user_id
      LEFT JOIN user_collaborative_events uce ON u.id = uce.user_id
      LEFT JOIN user_recipients ur ON u.id = ur.user_id
      LEFT JOIN user_purchased_gifts upg ON u.id = upg.user_id
      ORDER BY u.created_at DESC
    `);

    return result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
      eventsCount: row.events_count,
      recipientsCount: row.recipients_count,
      purchasedGiftsCount: row.purchased_gifts_count,
    }));
  }

  // ========== COLLABORATIVE EVENTS (Planeje seu rolê!) ==========

  async createCollaborativeEvent(ownerId: string, event: InsertCollaborativeEvent): Promise<CollaborativeEvent> {
    const [newEvent] = await db
      .insert(collaborativeEvents)
      .values({
        ...event,
        ownerId,
      })
      .returning();
    return newEvent;
  }

  async getCollaborativeEvents(userId: string): Promise<CollaborativeEvent[]> {
    // Auto-complete events that are past their date (1 day after event date)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    await db
      .update(collaborativeEvents)
      .set({ status: "completed", updatedAt: new Date() })
      .where(
        and(
          eq(collaborativeEvents.status, "active"),
          sql`${collaborativeEvents.eventDate} IS NOT NULL`,
          sql`${collaborativeEvents.eventDate} < ${yesterday}`
        )
      );

    // Get user email for email-only participant matching
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId));
    
    const userEmail = user?.email;

    // Single optimized query: fetch events where user is owner OR participant (by userId or email)
    const events = await db
      .select({
        id: collaborativeEvents.id,
        ownerId: collaborativeEvents.ownerId,
        name: collaborativeEvents.name,
        eventType: collaborativeEvents.eventType,
        eventDate: collaborativeEvents.eventDate,
        location: collaborativeEvents.location,
        description: collaborativeEvents.description,
        themedNightCategoryId: collaborativeEvents.themedNightCategoryId,
        isPublic: collaborativeEvents.isPublic,
        status: collaborativeEvents.status,
        typeSpecificData: collaborativeEvents.typeSpecificData,
        createdAt: collaborativeEvents.createdAt,
        updatedAt: collaborativeEvents.updatedAt,
      })
      .from(collaborativeEvents)
      .leftJoin(
        collaborativeEventParticipants,
        eq(collaborativeEvents.id, collaborativeEventParticipants.eventId)
      )
      .where(
        sql`(
          ${collaborativeEvents.ownerId} = ${userId}
          OR ${collaborativeEventParticipants.userId} = ${userId}
          ${userEmail ? sql`OR ${collaborativeEventParticipants.email} = ${userEmail}` : sql``}
        )`
      );

    // Deduplicate (since LEFT JOIN can return multiple rows per event)
    const uniqueEvents = Array.from(
      new Map(events.map(event => [event.id, event])).values()
    );

    return uniqueEvents;
  }

  async getCollaborativeEvent(id: string, userId?: string): Promise<CollaborativeEvent | undefined> {
    // If no userId provided, fetch event without access check (for admin/share links)
    if (!userId) {
      const [event] = await db
        .select()
        .from(collaborativeEvents)
        .where(eq(collaborativeEvents.id, id));
      return event;
    }

    // Get user email for email-only participant matching
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId));
    
    const userEmail = user?.email;

    // Single optimized query: check owner OR participant (by userId or email)
    const [event] = await db
      .select({
        id: collaborativeEvents.id,
        ownerId: collaborativeEvents.ownerId,
        name: collaborativeEvents.name,
        eventType: collaborativeEvents.eventType,
        eventDate: collaborativeEvents.eventDate,
        location: collaborativeEvents.location,
        description: collaborativeEvents.description,
        themedNightCategoryId: collaborativeEvents.themedNightCategoryId,
        isPublic: collaborativeEvents.isPublic,
        status: collaborativeEvents.status,
        typeSpecificData: collaborativeEvents.typeSpecificData,
        createdAt: collaborativeEvents.createdAt,
        updatedAt: collaborativeEvents.updatedAt,
      })
      .from(collaborativeEvents)
      .leftJoin(
        collaborativeEventParticipants,
        eq(collaborativeEvents.id, collaborativeEventParticipants.eventId)
      )
      .where(
        and(
          eq(collaborativeEvents.id, id),
          sql`(
            ${collaborativeEvents.ownerId} = ${userId}
            OR ${collaborativeEventParticipants.userId} = ${userId}
            ${userEmail ? sql`OR ${collaborativeEventParticipants.email} = ${userEmail}` : sql``}
          )`
        )
      );

    return event;
  }

  async updateCollaborativeEvent(id: string, userId: string, updates: Partial<InsertCollaborativeEvent>): Promise<CollaborativeEvent | undefined> {
    const [updatedEvent] = await db
      .update(collaborativeEvents)
      .set({
        ...updates,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(collaborativeEvents.id, id),
          eq(collaborativeEvents.ownerId, userId)
        )
      )
      .returning();

    return updatedEvent;
  }

  async rescheduleCollaborativeEvent(id: string, userId: string, newDate: Date): Promise<CollaborativeEvent | undefined> {
    const [updatedEvent] = await db
      .update(collaborativeEvents)
      .set({
        eventDate: newDate,
        status: "active",
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(collaborativeEvents.id, id),
          eq(collaborativeEvents.ownerId, userId)
        )
      )
      .returning();

    return updatedEvent;
  }

  async deleteCollaborativeEvent(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(collaborativeEvents)
      .where(
        and(
          eq(collaborativeEvents.id, id),
          eq(collaborativeEvents.ownerId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  // ========== Participant Operations ==========

  async addParticipant(eventId: string, participant: InsertCollaborativeEventParticipant): Promise<CollaborativeEventParticipant> {
    const [newParticipant] = await db
      .insert(collaborativeEventParticipants)
      .values({
        ...participant,
        eventId,
      })
      .returning();
    return newParticipant;
  }

  async getParticipants(eventId: string): Promise<CollaborativeEventParticipant[]> {
    return await db
      .select()
      .from(collaborativeEventParticipants)
      .where(eq(collaborativeEventParticipants.eventId, eventId));
  }

  async getParticipantsWithProfiles(eventId: string): Promise<ParticipantWithProfile[]> {
    const results = await db
      .select({
        participant: collaborativeEventParticipants,
        profile: userProfiles,
      })
      .from(collaborativeEventParticipants)
      .leftJoin(userProfiles, eq(collaborativeEventParticipants.userId, userProfiles.userId))
      .where(eq(collaborativeEventParticipants.eventId, eventId));

    return results.map(({ participant, profile }) => ({
      ...participant,
      hasFilledProfile: profile?.isCompleted === true,
      userProfile: profile ? {
        ageRange: profile.ageRange,
        gender: profile.gender,
        zodiacSign: profile.zodiacSign,
        giftPreference: profile.giftPreference,
        freeTimeActivity: profile.freeTimeActivity,
        musicalStyle: profile.musicalStyle,
        monthlyGiftPreference: profile.monthlyGiftPreference,
        surpriseReaction: profile.surpriseReaction,
        giftPriority: profile.giftPriority,
        giftGivingStyle: profile.giftGivingStyle,
        specialTalent: profile.specialTalent,
        giftsToAvoid: profile.giftsToAvoid,
        interests: profile.interests,
      } : null,
    }));
  }

  async getParticipant(id: string): Promise<CollaborativeEventParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(collaborativeEventParticipants)
      .where(eq(collaborativeEventParticipants.id, id));
    return participant;
  }

  async updateParticipantStatus(id: string, status: string): Promise<CollaborativeEventParticipant | undefined> {
    const [updatedParticipant] = await db
      .update(collaborativeEventParticipants)
      .set({
        status,
        joinedAt: status === 'confirmed' ? sql`now()` : undefined,
        updatedAt: sql`now()`,
      })
      .where(eq(collaborativeEventParticipants.id, id))
      .returning();

    return updatedParticipant;
  }

  async updateParticipantInviteToken(id: string, inviteToken: string): Promise<CollaborativeEventParticipant | undefined> {
    const [updatedParticipant] = await db
      .update(collaborativeEventParticipants)
      .set({
        inviteToken,
        updatedAt: sql`now()`,
      })
      .where(eq(collaborativeEventParticipants.id, id))
      .returning();

    return updatedParticipant;
  }

  async updateParticipantEmailStatus(id: string, emailStatus: string): Promise<CollaborativeEventParticipant | undefined> {
    const [updatedParticipant] = await db
      .update(collaborativeEventParticipants)
      .set({
        emailStatus,
        updatedAt: sql`now()`,
      })
      .where(eq(collaborativeEventParticipants.id, id))
      .returning();

    return updatedParticipant;
  }

  async removeParticipant(id: string, eventId: string): Promise<boolean> {
    const result = await db
      .delete(collaborativeEventParticipants)
      .where(
        and(
          eq(collaborativeEventParticipants.id, id),
          eq(collaborativeEventParticipants.eventId, eventId)
        )
      )
      .returning();

    return result.length > 0;
  }

  async linkParticipantsByEmail(email: string, userId: string): Promise<number> {
    const result = await db
      .update(collaborativeEventParticipants)
      .set({
        userId,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(collaborativeEventParticipants.email, email.toLowerCase()),
          sql`${collaborativeEventParticipants.userId} IS NULL`
        )
      )
      .returning();

    return result.length;
  }

  // ========== Share Link Operations ==========

  async createShareLink(link: InsertCollaborativeEventLink): Promise<CollaborativeEventLink> {
    const [newLink] = await db
      .insert(collaborativeEventLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async getShareLink(token: string): Promise<CollaborativeEventLink | undefined> {
    const [link] = await db
      .select()
      .from(collaborativeEventLinks)
      .where(eq(collaborativeEventLinks.token, token));
    return link;
  }

  async getShareLinksByEvent(eventId: string): Promise<CollaborativeEventLink[]> {
    return await db
      .select()
      .from(collaborativeEventLinks)
      .where(eq(collaborativeEventLinks.eventId, eventId));
  }

  async incrementShareLinkUse(token: string): Promise<void> {
    await db
      .update(collaborativeEventLinks)
      .set({
        useCount: sql`${collaborativeEventLinks.useCount} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(collaborativeEventLinks.token, token));
  }

  async revokeShareLink(token: string): Promise<boolean> {
    const result = await db
      .update(collaborativeEventLinks)
      .set({
        isActive: false,
        updatedAt: sql`now()`,
      })
      .where(eq(collaborativeEventLinks.token, token))
      .returning();

    return result.length > 0;
  }

  // ========== Secret Santa Operations ==========

  async savePairs(eventId: string, pairs: InsertSecretSantaPair[]): Promise<SecretSantaPair[]> {
    const pairsWithEventId = pairs.map(pair => ({
      ...pair,
      eventId,
    }));

    const insertedPairs = await db
      .insert(secretSantaPairs)
      .values(pairsWithEventId)
      .returning();

    return insertedPairs;
  }

  async getPairsByEvent(eventId: string): Promise<SecretSantaPair[]> {
    return await db
      .select()
      .from(secretSantaPairs)
      .where(eq(secretSantaPairs.eventId, eventId));
  }

  async getPairForParticipant(eventId: string, participantId: string): Promise<SecretSantaPair | undefined> {
    const [pair] = await db
      .select()
      .from(secretSantaPairs)
      .where(
        and(
          eq(secretSantaPairs.eventId, eventId),
          eq(secretSantaPairs.giverParticipantId, participantId)
        )
      );

    return pair;
  }

  async deletePairsByEvent(eventId: string): Promise<boolean> {
    const result = await db
      .delete(secretSantaPairs)
      .where(eq(secretSantaPairs.eventId, eventId))
      .returning();

    return result.length > 0;
  }

  // ========== Collective Gift Contribution Operations ==========

  async getContributions(eventId: string): Promise<CollectiveGiftContribution[]> {
    return await db
      .select()
      .from(collectiveGiftContributions)
      .where(eq(collectiveGiftContributions.eventId, eventId))
      .orderBy(collectiveGiftContributions.createdAt);
  }

  async getContribution(id: string): Promise<CollectiveGiftContribution | undefined> {
    const [contribution] = await db
      .select()
      .from(collectiveGiftContributions)
      .where(eq(collectiveGiftContributions.id, id));
    return contribution;
  }

  async getContributionByParticipant(eventId: string, participantId: string): Promise<CollectiveGiftContribution | undefined> {
    const [contribution] = await db
      .select()
      .from(collectiveGiftContributions)
      .where(
        and(
          eq(collectiveGiftContributions.eventId, eventId),
          eq(collectiveGiftContributions.participantId, participantId)
        )
      );
    return contribution;
  }

  async createContribution(contribution: InsertCollectiveGiftContribution): Promise<CollectiveGiftContribution> {
    const [newContribution] = await db
      .insert(collectiveGiftContributions)
      .values(contribution)
      .returning();
    return newContribution;
  }

  async updateContribution(id: string, updates: Partial<InsertCollectiveGiftContribution>): Promise<CollectiveGiftContribution | undefined> {
    const [updated] = await db
      .update(collectiveGiftContributions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collectiveGiftContributions.id, id))
      .returning();
    return updated;
  }

  async deleteContribution(id: string): Promise<boolean> {
    const result = await db
      .delete(collectiveGiftContributions)
      .where(eq(collectiveGiftContributions.id, id))
      .returning();
    return result.length > 0;
  }

  async getContributionsSummary(eventId: string): Promise<{ totalDue: number; totalPaid: number; participantsCount: number; paidCount: number }> {
    const contributions = await this.getContributions(eventId);
    
    const totalDue = contributions.reduce((sum, c) => sum + c.amountDue, 0);
    const totalPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const participantsCount = contributions.length;
    const paidCount = contributions.filter(c => c.isPaid).length;
    
    return { totalDue, totalPaid, participantsCount, paidCount };
  }

  // ========== Horoscope Operations ==========

  async getSignoByDate(dia: number, mes: number): Promise<Signo | undefined> {
    const allSignos = await db.select().from(signos);
    
    for (const signo of allSignos) {
      const { diaInicio, mesInicio, diaFim, mesFim } = signo;
      
      if (mesInicio === mesFim) {
        if (mes === mesInicio && dia >= diaInicio && dia <= diaFim) {
          return signo;
        }
      } else if (mesInicio > mesFim) {
        if ((mes === mesInicio && dia >= diaInicio) || (mes === mesFim && dia <= diaFim)) {
          return signo;
        }
      } else {
        if ((mes === mesInicio && dia >= diaInicio) || (mes === mesFim && dia <= diaFim)) {
          return signo;
        }
      }
    }
    
    const [capricornio] = await db
      .select()
      .from(signos)
      .where(eq(signos.nome, "Capricornio"));
    return capricornio;
  }

  async getMensagemSemanal(signoId: string, numeroSemana: number): Promise<MensagemSemanal | undefined> {
    const [mensagem] = await db
      .select()
      .from(mensagensSemanais)
      .where(
        and(
          eq(mensagensSemanais.signoId, signoId),
          eq(mensagensSemanais.numeroSemana, numeroSemana)
        )
      );
    return mensagem;
  }

  async getHoroscope(userId: string): Promise<{ signo: Signo; mensagem: MensagemSemanal } | null> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile || !profile.zodiacSign) {
      return null;
    }
    
    const signoNameMap: Record<string, string> = {
      "aries": "Aries",
      "áries": "Aries",
      "touro": "Touro",
      "gemeos": "Gemeos",
      "gêmeos": "Gemeos",
      "cancer": "Cancer",
      "câncer": "Cancer",
      "leao": "Leao",
      "leão": "Leao",
      "virgem": "Virgem",
      "libra": "Libra",
      "escorpiao": "Escorpiao",
      "escorpião": "Escorpiao",
      "sagitario": "Sagitario",
      "sagitário": "Sagitario",
      "capricornio": "Capricornio",
      "capricórnio": "Capricornio",
      "aquario": "Aquario",
      "aquário": "Aquario",
      "peixes": "Peixes",
    };
    
    const signoNome = signoNameMap[profile.zodiacSign.toLowerCase()] || profile.zodiacSign;
    
    const [signo] = await db
      .select()
      .from(signos)
      .where(eq(signos.nome, signoNome));
    
    if (!signo) {
      return null;
    }
    
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const numeroSemana = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const semanaAjustada = Math.min(Math.max(numeroSemana, 1), 52);
    
    const mensagem = await this.getMensagemSemanal(signo.id, semanaAjustada);
    
    if (!mensagem) {
      return null;
    }
    
    return { signo, mensagem };
  }
}

export const storage = new DatabaseStorage();
