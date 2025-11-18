// Storage layer for Giviti - Following Replit Auth blueprint
import {
  users,
  recipients,
  events,
  eventRecipients,
  userGifts,
  giftSuggestions,
  userProfiles,
  recipientProfiles,
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
  type UserProfile,
  type InsertUserProfile,
  type RecipientProfile,
  type InsertRecipientProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql, inArray } from "drizzle-orm";

// Storage interface with all CRUD operations
export interface IStorage {
  // User operations - MANDATORY for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
  getStats(userId: string): Promise<{ totalRecipients: number; upcomingEvents: number; giftsPurchased: number }>;
  
  // Gift Suggestions
  getGiftSuggestions(filters?: { category?: string; minPrice?: number; maxPrice?: number; tags?: string[] }): Promise<GiftSuggestion[]>;
  
  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // Recipient Profile operations
  getRecipientProfile(recipientId: string, userId: string): Promise<RecipientProfile | undefined>;
  upsertRecipientProfile(recipientId: string, userId: string, profile: InsertRecipientProfile): Promise<RecipientProfile>;
}

export class DatabaseStorage implements IStorage {
  // ========== User Operations (MANDATORY for Replit Auth) ==========
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
    const nextYearDate = new Date(currentDate);
    nextYearDate.setFullYear(currentDate.getFullYear() + 1);

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

    // Gifts purchased
    const purchasedGiftCount = await db
      .select({ count: sql<number>`count(*)::int` })
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
      giftsPurchased: purchasedGiftCount[0]?.count || 0,
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
      conditions.push(gte(giftSuggestions.priceMax, filters.minPrice));
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${giftSuggestions.priceMin} <= ${filters.maxPrice}`);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      conditions.push(sql`${giftSuggestions.tags} && ARRAY[${sql.join(filters.tags.map(t => sql`${t}`), sql`, `)}]::text[]`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
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
}

export const storage = new DatabaseStorage();
