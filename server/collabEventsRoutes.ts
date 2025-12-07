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
import { sendCollaborativeEventInviteEmail } from "./emailService";

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
      
      // Validate event date is not in the past
      if (validatedData.eventDate) {
        const eventDate = new Date(validatedData.eventDate);
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({ 
            error: "Data inválida" 
          });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          return res.status(400).json({ 
            error: "A data do rolê deve ser hoje ou no futuro" 
          });
        }
      }
      
      // Add ownerId from authenticated user
      const eventData = {
        ...validatedData,
        ownerId: userId,
      };
      
      const event = await storage.createCollaborativeEvent(userId, eventData);
      
      // Get user details to include name in participant
      const user = await storage.getUser(userId);
      const ownerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : null;
      
      // Add the creator as a participant with owner role
      await storage.addParticipant(event.id, {
        eventId: event.id,
        userId,
        name: ownerName,
        email: user?.email || null,
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
      
      // Validate event date is not in the past if being updated
      if (req.body.eventDate !== undefined) {
        const eventDate = new Date(req.body.eventDate);
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({ 
            error: "Data inválida" 
          });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          return res.status(400).json({ 
            error: "A data do rolê deve ser hoje ou no futuro" 
          });
        }
      }
      
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
      
      // Get event details for the invite email
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Get inviter (current user) details
      const inviter = await storage.getUser(userId);
      const inviterName = inviter ? `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email : 'Alguém';
      
      // Inject eventId from route params (avoid redundancy in request body)
      const validatedData = insertCollaborativeEventParticipantSchema.parse({
        ...req.body,
        eventId: id,
      });
      
      // Generate invite token if not accepted
      if (validatedData.status !== "accepted") {
        validatedData.inviteToken = crypto.randomBytes(32).toString("hex");
      }
      
      const participant = await storage.addParticipant(id, validatedData);
      
      // Send invite email if participant has an email and invite token
      let emailSent = false;
      console.log('[AddParticipant] Checking email conditions:', {
        email: validatedData.email,
        hasInviteToken: !!validatedData.inviteToken,
        status: validatedData.status
      });
      
      if (validatedData.email && validatedData.inviteToken) {
        try {
          // Build invite link with token - normalize environment variables
          let baseUrl = 'http://localhost:5000';
          
          console.log('[AddParticipant] Building invite link...');
          console.log('[AddParticipant] REPLIT_DEV_DOMAIN:', process.env.REPLIT_DEV_DOMAIN);
          console.log('[AddParticipant] REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);
          
          if (process.env.REPLIT_DEV_DOMAIN) {
            const domain = process.env.REPLIT_DEV_DOMAIN.trim();
            baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
          } else if (process.env.REPLIT_DOMAINS) {
            const domain = process.env.REPLIT_DOMAINS.split(',')[0].trim();
            baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
          }
          
          const inviteLink = `${baseUrl}/convite/${validatedData.inviteToken}`;
          console.log('[AddParticipant] Invite link:', inviteLink);
          
          console.log('[AddParticipant] Attempting to send invite email...');
          await sendCollaborativeEventInviteEmail(
            validatedData.email,
            inviterName,
            event.name,
            event.eventType,
            inviteLink
          );
          emailSent = true;
          console.log(`[AddParticipant] SUCCESS: Invite email sent to ${validatedData.email} for event ${event.name}`);
        } catch (emailError) {
          // Log error but don't fail the request - participant was added successfully
          console.error("[AddParticipant] FAILED to send invite email:", emailError);
        }
      } else if (validatedData.email && !validatedData.inviteToken) {
        console.log(`[AddParticipant] No invite email sent to ${validatedData.email} - participant already accepted`);
      } else if (!validatedData.email) {
        console.log(`[AddParticipant] No invite email sent - participant has no email address`);
      }
      
      res.status(201).json({ ...participant, emailSent });
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

  // POST /api/collab-events/:eventId/participants/:participantId/resend-invite - Resend invite email
  app.post("/api/collab-events/:eventId/participants/:participantId/resend-invite", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { eventId, participantId } = req.params;
      
      const hasAccess = await canAccessEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get event details
      const event = await storage.getCollaborativeEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Get participant details
      const participants = await storage.getParticipants(eventId);
      const participant = participants.find(p => p.id === participantId);
      
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      
      if (!participant.email) {
        return res.status(400).json({ error: "Participant has no email address" });
      }
      
      // Get inviter (current user) details
      const inviter = await storage.getUser(userId);
      const inviterName = inviter ? `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email : 'Alguém';
      
      // Generate new invite token if participant doesn't have one
      let inviteToken = participant.inviteToken;
      if (!inviteToken) {
        inviteToken = crypto.randomBytes(32).toString("hex");
        await storage.updateParticipantInviteToken(participantId, inviteToken);
      }
      
      // Build invite link
      let baseUrl = 'http://localhost:5000';
      
      console.log('[ResendInvite] Building invite link...');
      
      if (process.env.REPLIT_DEV_DOMAIN) {
        const domain = process.env.REPLIT_DEV_DOMAIN.trim();
        baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      } else if (process.env.REPLIT_DOMAINS) {
        const domain = process.env.REPLIT_DOMAINS.split(',')[0].trim();
        baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      }
      
      const inviteLink = `${baseUrl}/convite/${inviteToken}`;
      console.log('[ResendInvite] Invite link:', inviteLink);
      
      // Send invite email
      console.log('[ResendInvite] Sending invite email to:', participant.email);
      await sendCollaborativeEventInviteEmail(
        participant.email,
        inviterName,
        event.name,
        event.eventType,
        inviteLink
      );
      
      console.log(`[ResendInvite] SUCCESS: Invite email resent to ${participant.email} for event ${event.name}`);
      
      res.json({ success: true, message: "Convite reenviado com sucesso" });
    } catch (error) {
      console.error("[ResendInvite] Error resending invite:", error);
      res.status(500).json({ error: "Failed to resend invite email" });
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
