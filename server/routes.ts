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
  insertOccasionSchema,
  insertPriceRangeSchema,
  insertRelationshipTypeSchema,
  insertSystemSettingSchema,
  insertAuditLogSchema,
  insertGiftSuggestionSchema,
  updateGiftSuggestionSchema,
  insertThemedNightSuggestionSchema,
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

  // GET /api/themed-night-categories/:id - Get a specific themed night category (public)
  app.get("/api/themed-night-categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getThemedNightCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching themed night category:", error);
      res.status(500).json({ message: "Failed to fetch themed night category" });
    }
  });

  // ========== Themed Night Suggestions Routes ==========
  
  // GET /api/themed-night-categories/:categoryId/suggestions - Get all suggestions for a category
  app.get("/api/themed-night-categories/:categoryId/suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const { categoryId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const suggestions = await storage.getThemedNightSuggestions(categoryId, includeInactive);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching themed night suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });
  
  // GET /api/themed-night-suggestions/:id - Get a specific suggestion
  app.get("/api/themed-night-suggestions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const suggestion = await storage.getThemedNightSuggestion(id);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error fetching themed night suggestion:", error);
      res.status(500).json({ message: "Failed to fetch suggestion" });
    }
  });
  
  // POST /api/themed-night-categories/:categoryId/suggestions - Create a new suggestion (admin only)
  app.post("/api/themed-night-categories/:categoryId/suggestions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { categoryId } = req.params;
      const validatedData = insertThemedNightSuggestionSchema.parse({
        ...req.body,
        categoryId,
      });
      const newSuggestion = await storage.createThemedNightSuggestion(validatedData);
      res.status(201).json(newSuggestion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid suggestion data", 
          errors: error.errors 
        });
      }
      console.error("Error creating themed night suggestion:", error);
      res.status(500).json({ message: "Failed to create suggestion" });
    }
  });
  
  // PUT /api/themed-night-suggestions/:id - Update a suggestion (admin only)
  app.put("/api/themed-night-suggestions/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existingSuggestion = await storage.getThemedNightSuggestion(id);
      
      if (!existingSuggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      const updatedSuggestion = await storage.updateThemedNightSuggestion(id, req.body);
      res.json(updatedSuggestion);
    } catch (error) {
      console.error("Error updating themed night suggestion:", error);
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });
  
  // DELETE /api/themed-night-suggestions/:id - Delete a suggestion (admin only)
  app.delete("/api/themed-night-suggestions/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteThemedNightSuggestion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      res.json({ message: "Suggestion deleted successfully" });
    } catch (error) {
      console.error("Error deleting themed night suggestion:", error);
      res.status(500).json({ message: "Failed to delete suggestion" });
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

  // GET /api/sugestoes-auto - Get automatic gift suggestions based on recipient profile
  app.get("/api/sugestoes-auto", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user!.id;
      const { recipientId, page = "1", limit = "5" } = req.query;
      
      if (!recipientId) {
        return res.status(400).json({ message: "recipientId is required" });
      }
      
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 5;
      
      // Get internal suggestions first
      const internalResult = await storage.getAutoSuggestions(recipientId as string, userId, pageNum, limitNum);
      
      // If we have enough internal suggestions, return them
      if (internalResult.total >= limitNum) {
        return res.json({
          fonte: "interna",
          resultados: internalResult.suggestions.map(s => ({
            id: s.id,
            nome: s.name,
            descricao: s.description,
            link: s.productUrl,
            imagem: s.imageUrl,
            preco: s.price,
            prioridade: s.priority,
            categoria: s.category,
            tags: s.tags,
            cupom: s.cupom,
            validadeCupom: s.validadeCupom
          })),
          paginacao: {
            pagina_atual: internalResult.page,
            total_paginas: internalResult.totalPages,
            total_resultados: internalResult.total
          }
        });
      }
      
      // If we don't have enough internal suggestions, try external search
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      
      if (!perplexityApiKey) {
        // Return whatever internal results we have
        return res.json({
          fonte: "interna",
          resultados: internalResult.suggestions.map(s => ({
            id: s.id,
            nome: s.name,
            descricao: s.description,
            link: s.productUrl,
            imagem: s.imageUrl,
            preco: s.price,
            prioridade: s.priority,
            categoria: s.category,
            tags: s.tags,
            cupom: s.cupom,
            validadeCupom: s.validadeCupom
          })),
          paginacao: {
            pagina_atual: internalResult.page,
            total_paginas: internalResult.totalPages,
            total_resultados: internalResult.total
          },
          aviso: "Sugestões limitadas - sem integração externa configurada"
        });
      }
      
      // Get recipient info to build search query
      const recipient = await storage.getRecipient(recipientId as string, userId);
      const profile = await storage.getRecipientProfile(recipientId as string, userId);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Build search query based on profile
      const queryParts: string[] = ["presente"];
      
      if (recipient.gender) {
        queryParts.push(`para ${recipient.gender}`);
      }
      if (recipient.age) {
        queryParts.push(`de ${recipient.age} anos`);
      }
      if (recipient.interests && recipient.interests.length > 0) {
        queryParts.push(`que gosta de ${recipient.interests.slice(0, 3).join(", ")}`);
      }
      if (profile?.interestCategory) {
        queryParts.push(`categoria ${profile.interestCategory}`);
      }
      if (profile?.budgetRange) {
        const budgetLabels: Record<string, string> = {
          "ate-50": "até R$50",
          "50-100": "entre R$50 e R$100",
          "100-200": "entre R$100 e R$200",
          "200-500": "entre R$200 e R$500",
          "acima-500": "acima de R$500"
        };
        const budgetLabel = budgetLabels[profile.budgetRange];
        if (budgetLabel) {
          queryParts.push(budgetLabel);
        }
      }
      
      const searchQuery = queryParts.join(" ");
      
      try {
        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${perplexityApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [
              {
                role: "system",
                content: "Você é um assistente especializado em sugestões de presentes. Responda APENAS com um JSON array contendo exatamente 5 sugestões de presentes. Cada item deve ter: nome (string), descricao (string breve), preco_estimado (string com valor em R$), link (URL de loja real para compra). Formato: [{\"nome\": \"\", \"descricao\": \"\", \"preco_estimado\": \"\", \"link\": \"\"}]. Não inclua texto adicional, apenas o JSON."
              },
              {
                role: "user",
                content: `Sugira 5 opções de ${searchQuery} no Brasil. Inclua links de lojas reais como Amazon.com.br, Americanas, Magazine Luiza, etc.`
              }
            ],
            max_tokens: 1500,
            temperature: 0.3
          })
        });
        
        if (!perplexityResponse.ok) {
          throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
        }
        
        const perplexityData = await perplexityResponse.json();
        const content = perplexityData.choices?.[0]?.message?.content || "[]";
        
        // Try to parse the JSON response
        let externalResults: Array<{ nome: string; descricao: string; preco_estimado: string; link: string }> = [];
        try {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            externalResults = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.error("Error parsing Perplexity response:", parseError);
        }
        
        // Combine internal and external results
        const combinedResults = [
          ...internalResult.suggestions.map(s => ({
            id: s.id,
            nome: s.name,
            descricao: s.description,
            link: s.productUrl,
            imagem: s.imageUrl,
            preco: s.price,
            prioridade: s.priority,
            categoria: s.category,
            tags: s.tags,
            cupom: s.cupom,
            validadeCupom: s.validadeCupom,
            fonte: "interna" as const
          })),
          ...externalResults.map((r, i) => ({
            id: `external-${i}`,
            nome: r.nome,
            descricao: r.descricao,
            link: r.link,
            imagem: null,
            preco: r.preco_estimado,
            prioridade: null,
            categoria: null,
            tags: [],
            cupom: null,
            validadeCupom: null,
            fonte: "externa" as const
          }))
        ];
        
        return res.json({
          fonte: "mista",
          resultados: combinedResults.slice(0, limitNum * pageNum),
          paginacao: {
            pagina_atual: pageNum,
            total_paginas: Math.ceil(combinedResults.length / limitNum),
            total_resultados: combinedResults.length
          }
        });
        
      } catch (externalError) {
        console.error("Error fetching external suggestions:", externalError);
        
        // Return internal results only
        return res.json({
          fonte: "interna",
          resultados: internalResult.suggestions.map(s => ({
            id: s.id,
            nome: s.name,
            descricao: s.description,
            link: s.productUrl,
            imagem: s.imageUrl,
            preco: s.price,
            prioridade: s.priority,
            categoria: s.category,
            tags: s.tags,
            cupom: s.cupom,
            validadeCupom: s.validadeCupom
          })),
          paginacao: {
            pagina_atual: internalResult.page,
            total_paginas: internalResult.totalPages,
            total_resultados: internalResult.total
          },
          aviso: "Busca externa temporariamente indisponível"
        });
      }
      
    } catch (error) {
      console.error("Error fetching auto suggestions:", error);
      res.status(500).json({ message: "Failed to fetch auto suggestions" });
    }
  });

  // GET /api/admin/gift-suggestions - Get all gift suggestions (Admin only)
  app.get("/api/admin/gift-suggestions", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const suggestions = await storage.getGiftSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching gift suggestions:", error);
      res.status(500).json({ message: "Failed to fetch gift suggestions" });
    }
  });

  // GET /api/admin/gift-suggestions/:id - Get a specific gift suggestion (Admin only)
  app.get("/api/admin/gift-suggestions/:id", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const suggestion = await storage.getGiftSuggestion(id);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Gift suggestion not found" });
      }
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error fetching gift suggestion:", error);
      res.status(500).json({ message: "Failed to fetch gift suggestion" });
    }
  });

  // POST /api/admin/gift-suggestions - Create a new gift suggestion (Admin only)
  app.post("/api/admin/gift-suggestions", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const validatedData = insertGiftSuggestionSchema.parse(req.body);
      const newSuggestion = await storage.createGiftSuggestion(validatedData);
      res.status(201).json(newSuggestion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid gift suggestion data", 
          errors: error.errors 
        });
      }
      console.error("Error creating gift suggestion:", error);
      res.status(500).json({ message: "Failed to create gift suggestion" });
    }
  });

  // PATCH /api/admin/gift-suggestions/:id - Update a gift suggestion (Admin only)
  app.patch("/api/admin/gift-suggestions/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateGiftSuggestionSchema.parse(req.body);
      const updated = await storage.updateGiftSuggestion(id, validatedData);
      
      if (!updated) {
        return res.status(404).json({ message: "Gift suggestion not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid gift suggestion data", 
          errors: error.errors 
        });
      }
      console.error("Error updating gift suggestion:", error);
      res.status(500).json({ message: "Failed to update gift suggestion" });
    }
  });

  // DELETE /api/admin/gift-suggestions/:id - Delete a gift suggestion (Admin only)
  app.delete("/api/admin/gift-suggestions/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGiftSuggestion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Gift suggestion not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gift suggestion:", error);
      res.status(500).json({ message: "Failed to delete gift suggestion" });
    }
  });

  // ========== Click Tracking Routes ==========

  // POST /api/clicks - Record a click on a product link
  app.post("/api/clicks", isAuthenticated, async (req: any, res) => {
    try {
      const { link } = req.body;
      
      if (!link || typeof link !== 'string') {
        return res.status(400).json({ message: "Link is required" });
      }
      
      // Validate URL format
      try {
        const url = new URL(link);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).json({ message: "Invalid URL protocol" });
        }
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
      
      const click = await storage.recordClick(link);
      res.json(click);
    } catch (error) {
      console.error("Error recording click:", error);
      res.status(500).json({ message: "Failed to record click" });
    }
  });

  // GET /api/admin/clicks - Get all click stats (Admin only)
  app.get("/api/admin/clicks", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const clicks = await storage.getAllClickStats();
      res.json(clicks);
    } catch (error) {
      console.error("Error fetching click stats:", error);
      res.status(500).json({ message: "Failed to fetch click stats" });
    }
  });

  // GET /api/admin/clicks/:link - Get click stats for a specific link (Admin only)
  app.get("/api/admin/clicks/stats", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { link } = req.query;
      
      if (!link || typeof link !== 'string') {
        return res.status(400).json({ message: "Link query parameter is required" });
      }
      
      const click = await storage.getClickStats(link);
      res.json(click || { link, clickCount: 0 });
    } catch (error) {
      console.error("Error fetching click stats:", error);
      res.status(500).json({ message: "Failed to fetch click stats" });
    }
  });

  // ========== Google Product Categories Routes ==========

  // GET /api/google-categories - Get all active Google product categories
  app.get("/api/google-categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getGoogleProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching Google product categories:", error);
      res.status(500).json({ message: "Failed to fetch Google product categories" });
    }
  });

  // ========== Gift Categories Routes (Admin) ==========

  // GET /api/admin/gift-categories - Get all gift categories
  app.get("/api/admin/gift-categories", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await storage.getGiftCategories(includeInactive);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching gift categories:", error);
      res.status(500).json({ message: "Failed to fetch gift categories" });
    }
  });

  // GET /api/gift-categories - Get active gift categories (public for forms)
  app.get("/api/gift-categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getGiftCategories(false);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching gift categories:", error);
      res.status(500).json({ message: "Failed to fetch gift categories" });
    }
  });

  // GET /api/admin/gift-categories/:id - Get a specific gift category
  app.get("/api/admin/gift-categories/:id", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getGiftCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Gift category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching gift category:", error);
      res.status(500).json({ message: "Failed to fetch gift category" });
    }
  });

  // POST /api/admin/gift-categories - Create a new gift category
  app.post("/api/admin/gift-categories", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { insertGiftCategorySchema } = await import("@shared/schema");
      const validatedData = insertGiftCategorySchema.parse(req.body);
      const newCategory = await storage.createGiftCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid gift category data", 
          errors: error.errors 
        });
      }
      console.error("Error creating gift category:", error);
      res.status(500).json({ message: "Failed to create gift category" });
    }
  });

  // PATCH /api/admin/gift-categories/:id - Update a gift category
  app.patch("/api/admin/gift-categories/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateGiftCategory(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Gift category not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating gift category:", error);
      res.status(500).json({ message: "Failed to update gift category" });
    }
  });

  // DELETE /api/admin/gift-categories/:id - Delete a gift category
  app.delete("/api/admin/gift-categories/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGiftCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Gift category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gift category:", error);
      res.status(500).json({ message: "Failed to delete gift category" });
    }
  });

  // ========== Gift Types Routes (Admin) ==========

  // GET /api/admin/gift-types - Get all gift types
  app.get("/api/admin/gift-types", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const types = await storage.getGiftTypes(includeInactive);
      res.json(types);
    } catch (error) {
      console.error("Error fetching gift types:", error);
      res.status(500).json({ message: "Failed to fetch gift types" });
    }
  });

  // GET /api/gift-types - Get active gift types (public for forms)
  app.get("/api/gift-types", isAuthenticated, async (req: any, res) => {
    try {
      const types = await storage.getGiftTypes(false);
      res.json(types);
    } catch (error) {
      console.error("Error fetching gift types:", error);
      res.status(500).json({ message: "Failed to fetch gift types" });
    }
  });

  // GET /api/admin/gift-types/:id - Get a specific gift type
  app.get("/api/admin/gift-types/:id", isAuthenticated, hasRole('admin', 'manager', 'support'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const giftType = await storage.getGiftType(id);
      
      if (!giftType) {
        return res.status(404).json({ message: "Gift type not found" });
      }
      
      res.json(giftType);
    } catch (error) {
      console.error("Error fetching gift type:", error);
      res.status(500).json({ message: "Failed to fetch gift type" });
    }
  });

  // POST /api/admin/gift-types - Create a new gift type
  app.post("/api/admin/gift-types", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { insertGiftTypeSchema } = await import("@shared/schema");
      const validatedData = insertGiftTypeSchema.parse(req.body);
      const newGiftType = await storage.createGiftType(validatedData);
      res.status(201).json(newGiftType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid gift type data", 
          errors: error.errors 
        });
      }
      console.error("Error creating gift type:", error);
      res.status(500).json({ message: "Failed to create gift type" });
    }
  });

  // PATCH /api/admin/gift-types/:id - Update a gift type
  app.patch("/api/admin/gift-types/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateGiftType(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Gift type not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating gift type:", error);
      res.status(500).json({ message: "Failed to update gift type" });
    }
  });

  // DELETE /api/admin/gift-types/:id - Delete a gift type
  app.delete("/api/admin/gift-types/:id", isAuthenticated, hasRole('admin', 'manager'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGiftType(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Gift type not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gift type:", error);
      res.status(500).json({ message: "Failed to delete gift type" });
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

  // ========== SerpApi Routes (Google Search Integration) ==========

  // POST /api/serpapi/search - Search for gift suggestions via Google Shopping
  app.post("/api/serpapi/search", isAuthenticated, async (req: any, res) => {
    try {
      const { keywords, limit = 5 } = req.body;
      
      if (!keywords || typeof keywords !== "string") {
        return res.status(400).json({ message: "Keywords are required" });
      }
      
      const maxLimit = Math.min(Math.max(1, Number(limit) || 5), 20);

      const apiKey = process.env.SERPAPI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "SerpApi not configured" });
      }

      const { getJson } = await import("serpapi");
      
      const response = await getJson({
        engine: "google_shopping",
        q: keywords,
        api_key: apiKey,
        hl: "pt",
        gl: "br",
        location: "Brazil",
      });

      const shoppingResults = response.shopping_results || [];
      
      const products = shoppingResults.slice(0, maxLimit).map((item: any) => ({
        nome: item.title || "Produto sem nome",
        descricao: item.snippet || item.source || "",
        imagem: item.thumbnail || "",
        preco: item.extracted_price ? `R$ ${item.extracted_price.toFixed(2)}` : (item.price || "Preço não disponível"),
        precoNumerico: item.extracted_price || null,
        link: item.link || item.product_link || "",
        fonte: "google",
        loja: item.source || "",
      }));

      res.json({
        sucesso: true,
        fonte: "google",
        keywords,
        total: products.length,
        resultados: products,
      });
    } catch (error: any) {
      console.error("Error searching SerpApi:", error);
      res.status(500).json({ 
        message: "Failed to search products",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
