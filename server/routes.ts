// API routes for Giviti - Email/password authentication
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { isAdmin, hasRole, isActive } from "./middleware/authMiddleware";
import {
  insertRecipientSchema,
  insertEventSchema,
  insertUserGiftSchema,
  insertUserProfileSchema,
  insertRecipientProfileSchema,
  insertCategorySchema,
  insertOccasionSchema,
  insertPriceRangeSchema,
  insertRelationshipTypeSchema,
  insertSystemSettingSchema,
  insertAuditLogSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { registerAdminRoutes } from "./adminRoutes";
import { registerCollabEventsRoutes } from "./collabEventsRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);
  
  // Register all administrative routes
  registerAdminRoutes(app);
  
  // Register collaborative events routes (Planeje seu rolê!)
  registerCollabEventsRoutes(app);

  // ========== Auth Routes ==========

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Never send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== Themed Night Categories Routes (Public) ==========
  
  // GET /api/themed-night-categories - Get all themed night categories (public)
  app.get("/api/themed-night-categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getThemedNightCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching themed night categories:", error);
      res.status(500).json({ message: "Failed to fetch themed night categories" });
    }
  });

  // ========== Recipient Routes ==========

  // GET /api/recipients - Get all recipients for authenticated user
  app.get("/api/recipients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const recipientsList = await storage.getRecipients(userId);
      res.json(recipientsList);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      res.status(500).json({ message: "Failed to fetch recipients" });
    }
  });

  // POST /api/recipients - Create a new recipient
  app.post("/api/recipients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertRecipientSchema.parse(req.body);
      const newRecipient = await storage.createRecipient(userId, validatedData);
      res.status(201).json(newRecipient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid recipient data", 
          errors: error.errors 
        });
      }
      console.error("Error creating recipient:", error);
      res.status(500).json({ message: "Failed to create recipient" });
    }
  });

  // GET /api/recipients/:id - Get a specific recipient
  app.get("/api/recipients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const recipient = await storage.getRecipient(id, userId);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.json(recipient);
    } catch (error) {
      console.error("Error fetching recipient:", error);
      res.status(500).json({ message: "Failed to fetch recipient" });
    }
  });

  // PUT /api/recipients/:id - Update a recipient
  app.put("/api/recipients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const validatedData = insertRecipientSchema.partial().parse(req.body);
      const updated = await storage.updateRecipient(id, userId, validatedData);
      
      if (!updated) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid recipient data", 
          errors: error.errors 
        });
      }
      console.error("Error updating recipient:", error);
      res.status(500).json({ message: "Failed to update recipient" });
    }
  });

  // DELETE /api/recipients/:id - Delete a recipient
  app.delete("/api/recipients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await storage.deleteRecipient(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipient:", error);
      res.status(500).json({ message: "Failed to delete recipient" });
    }
  });

  // ========== Event Routes ==========

  // GET /api/events - Get all events for authenticated user
  app.get("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { upcoming } = req.query;
      
      let eventsList;
      if (upcoming === "true") {
        eventsList = await storage.getUpcomingEvents(userId, 30);
      } else {
        eventsList = await storage.getEvents(userId);
      }
      
      res.json(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // POST /api/events - Create a new event
  app.post("/api/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { recipientIds = [], ...eventData } = req.body;
      const validatedData = insertEventSchema.parse(eventData);
      
      // Validate event date is not in the past
      if (validatedData.eventDate) {
        const eventDate = new Date(validatedData.eventDate);
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({ 
            message: "Data inválida" 
          });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          return res.status(400).json({ 
            message: "A data do evento deve ser hoje ou no futuro" 
          });
        }
      }
      
      // Verify that all recipients belong to the user
      if (recipientIds.length > 0) {
        const userRecipients = await storage.getRecipients(userId);
        const userRecipientIds = userRecipients.map(r => r.id);
        const invalidIds = recipientIds.filter((id: string) => !userRecipientIds.includes(id));
        
        if (invalidIds.length > 0) {
          return res.status(400).json({ 
            message: "One or more recipient IDs are invalid or do not belong to user" 
          });
        }
      }
      
      const newEvent = await storage.createEvent(userId, validatedData, recipientIds);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // GET /api/events/:id - Get a specific event
  app.get("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const event = await storage.getEvent(id, userId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // PUT /api/events/:id - Update an event
  app.put("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { recipientIds, ...eventData } = req.body;
      const validatedData = insertEventSchema.partial().parse(eventData);
      
      // Validate event date is not in the past if being updated
      if (validatedData.eventDate !== undefined) {
        const eventDate = new Date(validatedData.eventDate);
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({ 
            message: "Data inválida" 
          });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          return res.status(400).json({ 
            message: "A data do evento deve ser hoje ou no futuro" 
          });
        }
      }
      
      // If recipientIds is being updated, verify they belong to the user
      if (recipientIds !== undefined) {
        if (recipientIds.length > 0) {
          const userRecipients = await storage.getRecipients(userId);
          const userRecipientIds = userRecipients.map(r => r.id);
          const invalidIds = recipientIds.filter((rid: string) => !userRecipientIds.includes(rid));
          
          if (invalidIds.length > 0) {
            return res.status(400).json({ 
              message: "One or more recipient IDs are invalid or do not belong to user" 
            });
          }
        }
      }
      
      const updated = await storage.updateEvent(id, userId, validatedData, recipientIds);
      
      if (!updated) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // DELETE /api/events/:id - Delete an event
  app.delete("/api/events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await storage.deleteEvent(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // PATCH /api/events/:id/archive - Archive an event
  app.patch("/api/events/:id/archive", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const archived = await storage.archiveEvent(id, userId);
      
      if (!archived) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(archived);
    } catch (error) {
      console.error("Error archiving event:", error);
      res.status(500).json({ message: "Failed to archive event" });
    }
  });

  // PATCH /api/events/:id/advance-year - Advance event to next year
  app.patch("/api/events/:id/advance-year", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const advanced = await storage.advanceEventToNextYear(id, userId);
      
      if (!advanced) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(advanced);
    } catch (error) {
      console.error("Error advancing event:", error);
      res.status(500).json({ message: "Failed to advance event to next year" });
    }
  });

  // ========== UserGift Routes ==========

  // GET /api/gifts - Get all user gifts
  app.get("/api/gifts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const gifts = await storage.getUserGifts(userId);
      res.json(gifts);
    } catch (error) {
      console.error("Error fetching gifts:", error);
      res.status(500).json({ message: "Failed to fetch gifts" });
    }
  });

  // POST /api/gifts - Create a new user gift
  app.post("/api/gifts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertUserGiftSchema.parse(req.body);
      
      // Verify that the recipient belongs to the user
      const recipient = await storage.getRecipient(validatedData.recipientId, userId);
      if (!recipient) {
        return res.status(400).json({ 
          message: "Invalid recipient ID or recipient does not belong to user" 
        });
      }
      
      // If eventId is provided, verify it belongs to the user
      if (validatedData.eventId) {
        const event = await storage.getEvent(validatedData.eventId, userId);
        if (!event) {
          return res.status(400).json({ 
            message: "Invalid event ID or event does not belong to user" 
          });
        }
      }
      
      const newGift = await storage.createUserGift(userId, validatedData);
      res.status(201).json(newGift);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid gift data", 
          errors: error.errors 
        });
      }
      console.error("Error creating gift:", error);
      res.status(500).json({ message: "Failed to create gift" });
    }
  });

  // PUT /api/gifts/:id - Update user gift (toggle favorite/purchased)
  app.put("/api/gifts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { isFavorite, isPurchased } = req.body;
      
      // Only allow updating favorite and purchased status
      const updates: any = {};
      if (typeof isFavorite === 'boolean') {
        updates.isFavorite = isFavorite;
      }
      if (typeof isPurchased === 'boolean') {
        updates.isPurchased = isPurchased;
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          message: "No valid updates provided. Only isFavorite and isPurchased can be updated." 
        });
      }
      
      const updated = await storage.updateUserGift(id, userId, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating gift:", error);
      res.status(500).json({ message: "Failed to update gift" });
    }
  });

  // DELETE /api/gifts/:id - Delete a user gift
  app.delete("/api/gifts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await storage.deleteUserGift(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gift:", error);
      res.status(500).json({ message: "Failed to delete gift" });
    }
  });

  // ========== Stats Route ==========

  // GET /api/stats - Get user statistics
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ========== Gift Suggestions Routes ==========

  // GET /api/suggestions - Get gift suggestions with optional filters
  app.get("/api/suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const { category, minPrice, maxPrice, tags } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category;
      if (minPrice) filters.minPrice = parseInt(minPrice);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice);
      if (tags) {
        filters.tags = Array.isArray(tags) ? tags : tags.split(',');
      }
      
      const suggestions = await storage.getGiftSuggestions(filters);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching gift suggestions:", error);
      res.status(500).json({ message: "Failed to fetch gift suggestions" });
    }
  });

  // ========== User Profile Routes ==========

  // GET /api/profile - Get user profile
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // POST /api/profile - Create or update user profile
  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.upsertUserProfile(userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      console.error("Error saving profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // GET /api/recipients/:id/profile - Get recipient profile
  app.get("/api/recipients/:id/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const recipientId = req.params.id;
      const profile = await storage.getRecipientProfile(recipientId, userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Recipient profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching recipient profile:", error);
      res.status(500).json({ message: "Failed to fetch recipient profile" });
    }
  });

  // POST /api/recipients/:id/profile - Create or update recipient profile
  app.post("/api/recipients/:id/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const recipientId = req.params.id;
      const validatedData = insertRecipientProfileSchema.parse(req.body);
      const profile = await storage.upsertRecipientProfile(recipientId, userId, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid recipient profile data", 
          errors: error.errors 
        });
      }
      console.error("Error saving recipient profile:", error);
      res.status(500).json({ message: "Failed to save recipient profile" });
    }
  });

  // ========== Admin Routes ==========

  // GET /api/admin/stats - Get global platform statistics (admin only)
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
