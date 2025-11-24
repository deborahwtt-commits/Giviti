// Collaborative Events Routes - Planeje seu rolê!
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { 
  insertCollaborativeEventSchema,
  insertCollaborativeEventParticipantSchema,
  insertCollaborativeEventLinkSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Extend Request type for TypeScript
interface AuthenticatedRequest extends Request {
  user: User;
}

// Middleware to check if user is event owner or participant
async function canAccessEvent(userId: string, eventId: string): Promise<boolean> {
  const event = await storage.getCollaborativeEvent(eventId, userId);
  return !!event;
}

export function registerCollabEventsRoutes(app: Express) {
  // ========== COLLABORATIVE EVENT ROUTES ==========

  // GET /api/collab-events - Get all collaborative events for the user
  app.get("/api/collab-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const events = await storage.getCollaborativeEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching collaborative events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // GET /api/collab-events/:id - Get a specific collaborative event
  app.get("/api/collab-events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching collaborative event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // POST /api/collab-events - Create a new collaborative event
  app.post("/api/collab-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const validatedData = insertCollaborativeEventSchema.parse(req.body);
      
      // Add ownerId from authenticated user
      const eventData = {
        ...validatedData,
        ownerId: userId,
      };
      
      const event = await storage.createCollaborativeEvent(userId, eventData);
      
      // Add the creator as a participant with owner role
      await storage.addParticipant(event.id, {
        eventId: event.id,
        userId,
        role: "owner",
        status: "accepted",
        participantData: null,
        inviteToken: null,
      });
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating collaborative event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // PATCH /api/collab-events/:id - Update a collaborative event
  app.patch("/api/collab-events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.updateCollaborativeEvent(id, userId, req.body);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error updating collaborative event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // DELETE /api/collab-events/:id - Delete a collaborative event
  app.delete("/api/collab-events/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const success = await storage.deleteCollaborativeEvent(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting collaborative event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // ========== PARTICIPANT ROUTES ==========

  // GET /api/collab-events/:id/participants - Get all participants for an event
  app.get("/api/collab-events/:id/participants", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const participants = await storage.getParticipants(id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // POST /api/collab-events/:id/participants - Add a participant to an event
  app.post("/api/collab-events/:id/participants", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get event to check type
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Inject eventId from route params (avoid redundancy in request body)
      const validatedData = insertCollaborativeEventParticipantSchema.parse({
        ...req.body,
        eventId: id,
      });
      
      // For Secret Santa events, override status to "pending" (schema default is "invited")
      // This ensures Secret Santa participants start with pending status
      if (event.eventType === "secret_santa" && !req.body.status) {
        validatedData.status = "pending";
      }
      
      // Generate invite token if not accepted
      if (validatedData.status !== "accepted") {
        validatedData.inviteToken = crypto.randomBytes(32).toString("hex");
      }
      
      const participant = await storage.addParticipant(id, validatedData);
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error adding participant:", error);
      res.status(500).json({ error: "Failed to add participant" });
    }
  });

  // PATCH /api/collab-events/:eventId/participants/:participantId/status - Update participant status
  app.patch("/api/collab-events/:eventId/participants/:participantId/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { eventId, participantId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const hasAccess = await canAccessEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const participant = await storage.updateParticipantStatus(participantId, status);
      
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      
      res.json(participant);
    } catch (error) {
      console.error("Error updating participant status:", error);
      res.status(500).json({ error: "Failed to update participant status" });
    }
  });

  // DELETE /api/collab-events/:eventId/participants/:participantId - Remove a participant
  app.delete("/api/collab-events/:eventId/participants/:participantId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { eventId, participantId } = req.params;
      
      const hasAccess = await canAccessEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const success = await storage.removeParticipant(participantId, eventId);
      
      if (!success) {
        return res.status(404).json({ error: "Participant not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ error: "Failed to remove participant" });
    }
  });

  // ========== SHARE LINK ROUTES ==========

  // GET /api/collab-events/:id/share-links - Get all share links for an event
  app.get("/api/collab-events/:id/share-links", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const links = await storage.getShareLinksByEvent(id);
      res.json(links);
    } catch (error) {
      console.error("Error fetching share links:", error);
      res.status(500).json({ error: "Failed to fetch share links" });
    }
  });

  // POST /api/collab-events/:id/share-links - Create a new share link
  app.post("/api/collab-events/:id/share-links", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const token = crypto.randomBytes(32).toString("hex");
      
      const linkData = insertCollaborativeEventLinkSchema.parse({
        ...req.body,
        eventId: id,
        token,
        createdBy: userId,
      });
      
      const link = await storage.createShareLink(linkData);
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating share link:", error);
      res.status(500).json({ error: "Failed to create share link" });
    }
  });

  // DELETE /api/collab-events/share-links/:token - Revoke a share link
  app.delete("/api/collab-events/share-links/:token", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const success = await storage.revokeShareLink(token);
      
      if (!success) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking share link:", error);
      res.status(500).json({ error: "Failed to revoke share link" });
    }
  });

  // ========== SECRET SANTA ROUTES ==========

  // POST /api/collab-events/:id/draw - Perform Secret Santa draw
  app.post("/api/collab-events/:id/draw", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      // Get event with user scope (enforces access control in storage layer)
      const event = await storage.getCollaborativeEvent(id, userId);
      
      // Return uniform 403 for both non-participants and non-owners to prevent enumeration
      if (!event || event.ownerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Validate event type
      if (event.eventType !== "secret_santa") {
        return res.status(400).json({ error: "This event is not a Secret Santa event" });
      }
      
      // Check if draw already performed
      const existingPairs = await storage.getPairsByEvent(id);
      if (existingPairs.length > 0) {
        return res.status(400).json({ error: "Draw already performed. Delete existing pairs first to redraw." });
      }
      
      // Get confirmed participants
      const allParticipants = await storage.getParticipants(id);
      const confirmedParticipants = allParticipants.filter(p => p.status === "accepted");
      
      // Validate minimum participants
      if (confirmedParticipants.length < 3) {
        return res.status(400).json({ 
          error: `Minimum 3 confirmed participants required. Currently: ${confirmedParticipants.length}` 
        });
      }
      
      // Fisher-Yates shuffle
      const shuffled = [...confirmedParticipants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Create circular pairs (each person gives to the next)
      const pairs = shuffled.map((giver, index) => {
        const receiver = shuffled[(index + 1) % shuffled.length];
        return {
          eventId: id,
          giverParticipantId: giver.id,
          receiverParticipantId: receiver.id,
          isRevealed: false,
        };
      });
      
      // Save pairs
      const savedPairs = await storage.savePairs(id, pairs);
      
      res.status(201).json({ 
        success: true, 
        message: `Draw completed! ${savedPairs.length} pairs created.`,
        pairsCount: savedPairs.length 
      });
    } catch (error) {
      console.error("Error performing draw:", error);
      res.status(500).json({ error: "Failed to perform draw" });
    }
  });

  // GET /api/collab-events/:id/draw-status - Check if draw was performed (OWNER ONLY)
  app.get("/api/collab-events/:id/draw-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      // Get event with user scope (enforces access control)
      const event = await storage.getCollaborativeEvent(id, userId);
      
      // Owner-only endpoint: return uniform 403 to prevent enumeration
      if (!event || event.ownerId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get draw status and participant counts (owner-only metadata)
      const pairs = await storage.getPairsByEvent(id);
      const allParticipants = await storage.getParticipants(id);
      const confirmedParticipants = allParticipants.filter(p => p.status === "accepted");
      
      res.json({ 
        isDrawPerformed: pairs.length > 0,
        pairsCount: pairs.length,
        confirmedParticipantsCount: confirmedParticipants.length,
        totalParticipantsCount: allParticipants.length,
        isOwner: true,
      });
    } catch (error) {
      console.error("Error fetching draw status:", error);
      res.status(500).json({ error: "Failed to fetch draw status" });
    }
  });

  // GET /api/collab-events/:id/my-pair - Get current user's Secret Santa assignment
  app.get("/api/collab-events/:id/my-pair", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      // Check access
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Find participant by userId
      const participants = await storage.getParticipants(id);
      const userParticipant = participants.find(p => p.userId === userId);
      
      if (!userParticipant) {
        return res.status(404).json({ error: "You are not a participant in this event" });
      }
      
      // Get pair
      const pair = await storage.getPairForParticipant(id, userParticipant.id);
      
      if (!pair) {
        return res.status(404).json({ error: "Draw not yet performed" });
      }
      
      // Get receiver details
      const receiver = await storage.getParticipant(pair.receiverParticipantId);
      
      res.json({ 
        pair,
        receiver 
      });
    } catch (error) {
      console.error("Error fetching pair:", error);
      res.status(500).json({ error: "Failed to fetch pair" });
    }
  });

  // GET /api/collab-events/:id/pairs - Get all pairs (owner only)
  app.get("/api/collab-events/:id/pairs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      // Get event
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is owner
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can view all pairs" });
      }
      
      const pairs = await storage.getPairsByEvent(id);
      
      // Enrich with participant details
      const enrichedPairs = await Promise.all(
        pairs.map(async (pair) => {
          const giver = await storage.getParticipant(pair.giverParticipantId);
          const receiver = await storage.getParticipant(pair.receiverParticipantId);
          return {
            ...pair,
            giver,
            receiver,
          };
        })
      );
      
      res.json(enrichedPairs);
    } catch (error) {
      console.error("Error fetching pairs:", error);
      res.status(500).json({ error: "Failed to fetch pairs" });
    }
  });

  // DELETE /api/collab-events/:id/pairs - Delete all pairs (owner only, to allow redraw)
  app.delete("/api/collab-events/:id/pairs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      // Get event
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is owner
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can delete pairs" });
      }
      
      const success = await storage.deletePairsByEvent(id);
      
      if (!success) {
        return res.status(404).json({ error: "No pairs found to delete" });
      }
      
      res.json({ success: true, message: "Pairs deleted. You can now redraw." });
    } catch (error) {
      console.error("Error deleting pairs:", error);
      res.status(500).json({ error: "Failed to delete pairs" });
    }
  });
}
