// Storage layer for Giviti - Following Replit Auth blueprint
import {
  users,
  recipients,
  events,
  userGifts,
  giftSuggestions,
  type User,
  type UpsertUser,
  type Recipient,
  type InsertRecipient,
  type Event,
  type InsertEvent,
  type UserGift,
  type InsertUserGift,
  type GiftSuggestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql } from "drizzle-orm";

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
  createEvent(userId: string, event: InsertEvent): Promise<Event>;
  getEvents(userId: string): Promise<Event[]>;
  getEvent(id: string, userId: string): Promise<Event | undefined>;
  updateEvent(id: string, userId: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string, userId: string): Promise<boolean>;
  getUpcomingEvents(userId: string, days?: number): Promise<Event[]>;

  // UserGift operations
  createUserGift(userId: string, gift: InsertUserGift): Promise<UserGift>;
  getUserGifts(userId: string): Promise<UserGift[]>;
  updateUserGift(id: string, userId: string, updates: Partial<Pick<UserGift, 'isFavorite' | 'isPurchased' | 'purchasedAt'>>): Promise<UserGift | undefined>;
  deleteUserGift(id: string, userId: string): Promise<boolean>;

  // Stats
  getStats(userId: string): Promise<{ totalRecipients: number; upcomingEvents: number; giftsPurchased: number }>;
  
  // Gift Suggestions
  getGiftSuggestions(filters?: { category?: string; minPrice?: number; maxPrice?: number; tags?: string[] }): Promise<GiftSuggestion[]>;
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

  async createEvent(userId: string, event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...event,
        userId,
      })
      .returning();
    return newEvent;
  }

  async getEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(events.eventDate);
  }

  async getEvent(id: string, userId: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return event;
  }

  async updateEvent(
    id: string,
    userId: string,
    eventData: Partial<InsertEvent>
  ): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return updated;
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getUpcomingEvents(userId: string, days: number = 30): Promise<Event[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          gte(events.eventDate, today.toISOString().split('T')[0])
        )
      )
      .orderBy(events.eventDate);
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
}

export const storage = new DatabaseStorage();
