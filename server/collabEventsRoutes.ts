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
      
      const event = await storage.createCollaborativeEvent(userId, validatedData);
      
      // Add the creator as a participant with owner role
      await storage.addParticipant(event.id, {
        eventId: event.id,
        userId,
        role: "owner",
        status: "confirmed",
        joinedAt: new Date(),
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
      
      const validatedData = insertCollaborativeEventParticipantSchema.parse(req.body);
      
      // Generate invite token if not confirmed
      if (validatedData.status !== "confirmed") {
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
}
