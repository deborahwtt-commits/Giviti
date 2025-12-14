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
import { sendCollaborativeEventInviteEmail, sendSecretSantaDrawResultEmail, sendThemedNightInviteEmail, sendCollectiveGiftInviteEmail } from "./emailService";

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
  // ========== INVITATION TOKEN ROUTES (PUBLIC) ==========

  // GET /api/invitations/by-token/:token - Get invitation details by token (public)
  app.get("/api/invitations/by-token/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token || token.length < 32) {
        return res.status(400).json({ error: "Token inválido" });
      }
      
      const participant = await storage.getParticipantByInviteToken(token);
      
      if (!participant) {
        return res.status(404).json({ error: "Convite não encontrado ou já utilizado" });
      }
      
      // Get the event details (no userId needed for public lookup)
      const event = await storage.getCollaborativeEvent(participant.eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      
      // Return invitation info (without sensitive data)
      res.json({
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          status: participant.status,
          eventId: participant.eventId,
        },
        event: {
          id: event.id,
          name: event.name,
          eventType: event.eventType,
          eventDate: event.eventDate,
          location: event.location,
          description: event.description,
          confirmationDeadline: event.confirmationDeadline,
        },
      });
    } catch (error) {
      console.error("Error fetching invitation by token:", error);
      res.status(500).json({ error: "Erro ao buscar convite" });
    }
  });

  // POST /api/invitations/by-token/:token/accept - Accept invitation by token (requires auth)
  app.post("/api/invitations/by-token/:token/accept", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const userEmail = (req as AuthenticatedRequest).user.email;
      
      if (!token || token.length < 32) {
        return res.status(400).json({ error: "Token inválido" });
      }
      
      const participant = await storage.getParticipantByInviteToken(token);
      
      if (!participant) {
        return res.status(404).json({ error: "Convite não encontrado ou já utilizado" });
      }
      
      // Check if participant status is already accepted
      if (participant.status === "accepted") {
        return res.status(400).json({ error: "Este convite já foi aceito" });
      }
      
      // Get event to check confirmation deadline
      const event = await storage.getCollaborativeEvent(participant.eventId);
      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      
      // Check if confirmation deadline has passed
      if (event.confirmationDeadline) {
        const deadline = new Date(event.confirmationDeadline);
        const now = new Date();
        if (now > deadline) {
          const formattedDeadline = deadline.toLocaleDateString('pt-BR', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          });
          return res.status(400).json({ 
            error: `O prazo para confirmar presença encerrou em ${formattedDeadline}. Entre em contato com o organizador.` 
          });
        }
      }
      
      // Verify the user's email matches the participant's email (if participant has email)
      if (participant.email && userEmail && participant.email.toLowerCase() !== userEmail.toLowerCase()) {
        return res.status(403).json({ 
          error: "Este convite foi enviado para outro email. Por favor, faça login com o email correto." 
        });
      }
      
      // Update participant status to accepted and link to user
      const updatedParticipant = await storage.updateParticipantStatus(participant.id, "accepted");
      
      // Clear the invite token so it can't be used again
      await storage.updateParticipantInviteToken(participant.id, "");
      
      // Link participant to user if they have an email
      if (userEmail) {
        await storage.linkParticipantsByEmail(userEmail, userId);
      }
      
      res.json({
        success: true,
        message: "Convite aceito com sucesso!",
        eventId: participant.eventId,
        participant: updatedParticipant,
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Erro ao aceitar convite" });
    }
  });

  // ========== COLLABORATIVE EVENT ROUTES ==========

  // GET /api/collab-events - Get all collaborative events for the user
  app.get("/api/collab-events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const events = await storage.getCollaborativeEvents(userId);
      
      // Enrich secret_santa events with draw status
      const enrichedEvents = await Promise.all(
        events.map(async (event) => {
          if (event.eventType === "secret_santa") {
            const pairs = await storage.getPairsByEvent(event.id);
            return {
              ...event,
              isDrawPerformed: pairs.length > 0,
            };
          }
          return event;
        })
      );
      
      res.json(enrichedEvents);
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
      const ownerName = user ? (`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Organizador') : 'Organizador';
      const ownerEmail = user?.email || '';
      
      // Add the creator as a participant with owner role
      await storage.addParticipant(event.id, {
        eventId: event.id,
        userId,
        name: ownerName,
        email: ownerEmail,
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

  // POST /api/collab-events/:id/reschedule - Reschedule a collaborative event
  app.post("/api/collab-events/:id/reschedule", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      const { eventDate } = req.body;
      
      if (!eventDate) {
        return res.status(400).json({ error: "Nova data é obrigatória" });
      }
      
      const newDate = new Date(eventDate);
      
      // Check if date is valid
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ error: "Data inválida" });
      }
      
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newDateNormalized = new Date(newDate);
      newDateNormalized.setHours(0, 0, 0, 0);
      
      if (newDateNormalized < today) {
        return res.status(400).json({ error: "A nova data deve ser hoje ou no futuro" });
      }
      
      const event = await storage.rescheduleCollaborativeEvent(id, userId, newDate);
      
      if (!event) {
        return res.status(404).json({ error: "Rolê não encontrado ou acesso negado" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error rescheduling collaborative event:", error);
      res.status(500).json({ error: "Falha ao reagendar o rolê" });
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

  // GET /api/collab-events/:id/participants - Get all participants for an event (with profile data)
  app.get("/api/collab-events/:id/participants", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const hasAccess = await canAccessEvent(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const participants = await storage.getParticipantsWithProfiles(id);
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
      
      // Check if a user with this email already exists and link them
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
          validatedData.userId = existingUser.id;
          console.log(`[AddParticipant] Found existing user for email ${validatedData.email}, linking userId: ${existingUser.id}`);
        }
      }
      
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
          
          // Use specialized email for themed_night events
          if (event.eventType === 'themed_night') {
            // Fetch category details for themed night email
            let categoryName: string | null = null;
            let categoryDescription: string | null = null;
            let categorySuggestions: string[] | null = null;
            
            if (event.themedNightCategoryId) {
              try {
                const category = await storage.getThemedNightCategory(event.themedNightCategoryId);
                if (category) {
                  categoryName = category.name;
                  categoryDescription = category.description || null;
                  
                  // First try to get personalized suggestions from themedNightSuggestions table
                  const detailedSuggestions = await storage.getThemedNightSuggestions(event.themedNightCategoryId, false);
                  if (detailedSuggestions && detailedSuggestions.length > 0) {
                    // Convert structured suggestions to displayable strings
                    categorySuggestions = detailedSuggestions.slice(0, 5).map(s => s.title);
                  } else if (category.suggestions && category.suggestions.length > 0) {
                    // Fall back to simple category suggestions
                    categorySuggestions = category.suggestions;
                  }
                }
              } catch (catError) {
                console.log('[AddParticipant] Could not fetch category details:', catError);
              }
            }
            
            await sendThemedNightInviteEmail({
              to: validatedData.email,
              inviterName,
              eventName: event.name,
              categoryName,
              categoryDescription,
              eventDate: event.eventDate ? event.eventDate.toString() : null,
              eventLocation: event.location || null,
              eventDescription: event.description || null,
              categorySuggestions,
              signupLink: inviteLink,
              confirmationDeadline: event.confirmationDeadline ? event.confirmationDeadline.toString() : null
            });
          } else if (event.eventType === 'collective_gift') {
            // Use specialized email for collective gift events
            const giftData = event.typeSpecificData as {
              targetAmount?: number;
              giftName?: string;
              giftDescription?: string;
              purchaseLink?: string;
              recipientName?: string;
            } | null;
            
            // Calculate amount per person based on all participants (including new one)
            // Include all status except 'declined' - owner/accepted/confirmed/pending all contribute
            let amountPerPerson: number | null = null;
            if (giftData?.targetAmount) {
              const existingParticipants = await storage.getParticipants(id);
              // Count all participants except declined ones - they all contribute
              const contributingCount = existingParticipants.filter(
                p => p.status !== 'declined'
              ).length;
              // Use contributing count (which now includes the just-added participant)
              if (contributingCount > 0) {
                amountPerPerson = Math.ceil(giftData.targetAmount / contributingCount);
              }
            }
            
            await sendCollectiveGiftInviteEmail({
              to: validatedData.email,
              inviterName,
              eventName: event.name,
              recipientName: giftData?.recipientName || null,
              giftName: giftData?.giftName || null,
              giftDescription: giftData?.giftDescription || null,
              targetAmount: giftData?.targetAmount || null,
              amountPerPerson,
              eventDate: event.eventDate ? event.eventDate.toString() : null,
              eventDescription: event.description || null,
              purchaseLink: giftData?.purchaseLink || null,
              signupLink: inviteLink,
              confirmationDeadline: event.confirmationDeadline ? event.confirmationDeadline.toString() : null
            });
          } else {
            await sendCollaborativeEventInviteEmail(
              validatedData.email,
              inviterName,
              event.name,
              event.eventType,
              inviteLink,
              event.confirmationDeadline ? event.confirmationDeadline.toString() : null
            );
          }
          
          emailSent = true;
          console.log(`[AddParticipant] SUCCESS: Invite email sent to ${validatedData.email} for event ${event.name} (type: ${event.eventType})`);
          
          // Update email status to sent
          await storage.updateParticipantEmailStatus(participant.id, 'sent');
        } catch (emailError) {
          // Log error but don't fail the request - participant was added successfully
          console.error("[AddParticipant] FAILED to send invite email:", emailError);
          
          // Update email status to failed
          await storage.updateParticipantEmailStatus(participant.id, 'failed');
        }
      } else if (validatedData.email && !validatedData.inviteToken) {
        console.log(`[AddParticipant] No invite email sent to ${validatedData.email} - participant already accepted`);
      } else if (!validatedData.email) {
        console.log(`[AddParticipant] No invite email sent - participant has no email address`);
      }
      
      // Fetch updated participant with emailStatus
      const updatedParticipant = await storage.getParticipant(participant.id);
      res.status(201).json({ ...updatedParticipant, emailSent });
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
      
      // Get event to check confirmation deadline (only for accepting invitations)
      if (status === "accepted") {
        const event = await storage.getCollaborativeEvent(eventId, userId);
        if (event && event.confirmationDeadline) {
          const deadline = new Date(event.confirmationDeadline);
          const now = new Date();
          if (now > deadline) {
            const formattedDeadline = deadline.toLocaleDateString('pt-BR', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            });
            return res.status(400).json({ 
              error: `O prazo para confirmar presença encerrou em ${formattedDeadline}. Entre em contato com o organizador.` 
            });
          }
        }
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
      
      // Use specialized email for themed_night events
      if (event.eventType === 'themed_night') {
        // Fetch category details for themed night email
        let categoryName: string | null = null;
        let categoryDescription: string | null = null;
        let categorySuggestions: string[] | null = null;
        
        if (event.themedNightCategoryId) {
          try {
            const category = await storage.getThemedNightCategory(event.themedNightCategoryId);
            if (category) {
              categoryName = category.name;
              categoryDescription = category.description || null;
              
              // First try to get personalized suggestions from themedNightSuggestions table
              const detailedSuggestions = await storage.getThemedNightSuggestions(event.themedNightCategoryId, false);
              if (detailedSuggestions && detailedSuggestions.length > 0) {
                // Convert structured suggestions to displayable strings
                categorySuggestions = detailedSuggestions.slice(0, 5).map(s => s.title);
              } else if (category.suggestions && category.suggestions.length > 0) {
                // Fall back to simple category suggestions
                categorySuggestions = category.suggestions;
              }
            }
          } catch (catError) {
            console.log('[ResendInvite] Could not fetch category details:', catError);
          }
        }
        
        await sendThemedNightInviteEmail({
          to: participant.email,
          inviterName,
          eventName: event.name,
          categoryName,
          categoryDescription,
          eventDate: event.eventDate ? event.eventDate.toString() : null,
          eventLocation: event.location || null,
          eventDescription: event.description || null,
          categorySuggestions,
          signupLink: inviteLink
        });
      } else {
        await sendCollaborativeEventInviteEmail(
          participant.email,
          inviterName,
          event.name,
          event.eventType,
          inviteLink
        );
      }
      
      console.log(`[ResendInvite] SUCCESS: Invite email resent to ${participant.email} for event ${event.name} (type: ${event.eventType})`);
      
      // Update email status to sent
      await storage.updateParticipantEmailStatus(participantId, 'sent');
      
      res.json({ success: true, message: "Convite reenviado com sucesso" });
    } catch (error) {
      console.error("[ResendInvite] Error resending invite:", error);
      
      // Update email status to failed if we have a participantId
      if (req.params.participantId) {
        await storage.updateParticipantEmailStatus(req.params.participantId, 'failed');
      }
      
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
      
      // Get restrictions for this event
      const restrictions = await storage.getRestrictionsByEvent(id);
      
      // Build forbidden pairs set (including self-matching)
      const forbiddenPairs = new Set<string>();
      
      // Add self-matching restrictions (no one can draw themselves)
      for (const participant of confirmedParticipants) {
        forbiddenPairs.add(`${participant.id}->${participant.id}`);
      }
      
      // Add user-defined restrictions
      for (const restriction of restrictions) {
        forbiddenPairs.add(`${restriction.blockerParticipantId}->${restriction.blockedParticipantId}`);
      }
      
      // Backtracking algorithm to find valid matching
      const participantIds = confirmedParticipants.map(p => p.id);
      const n = participantIds.length;
      
      // Build adjacency list of allowed receivers for each giver
      const allowedReceivers: Map<string, string[]> = new Map();
      for (const giverId of participantIds) {
        const allowed = participantIds.filter(receiverId => 
          !forbiddenPairs.has(`${giverId}->${receiverId}`)
        );
        allowedReceivers.set(giverId, allowed);
      }
      
      // Shuffle the order of givers and their allowed receivers for randomness
      const shuffleArray = <T>(arr: T[]): T[] => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      // Backtracking algorithm with forward-checking constraint propagation
      const tryBacktrackingDraw = (giverOrder: string[]): Map<string, string> | null => {
        const assignment: Map<string, string> = new Map();
        const usedReceivers = new Set<string>();
        
        // Forward-checking: verify all unassigned givers still have at least one option
        const forwardCheck = (fromIndex: number): boolean => {
          for (let i = fromIndex; i < giverOrder.length; i++) {
            const futureGiverId = giverOrder[i];
            const futureOptions = (allowedReceivers.get(futureGiverId) || [])
              .filter(r => !usedReceivers.has(r));
            if (futureOptions.length === 0) {
              return false; // This giver would have no options
            }
          }
          return true;
        };
        
        const backtrack = (giverIndex: number): boolean => {
          if (giverIndex === giverOrder.length) {
            return true; // All givers assigned
          }
          
          const giverId = giverOrder[giverIndex];
          const candidates = shuffleArray(allowedReceivers.get(giverId) || []);
          
          for (const receiverId of candidates) {
            if (!usedReceivers.has(receiverId)) {
              // Try this assignment
              assignment.set(giverId, receiverId);
              usedReceivers.add(receiverId);
              
              // Forward-check: ensure remaining givers still have options
              if (forwardCheck(giverIndex + 1) && backtrack(giverIndex + 1)) {
                return true;
              }
              
              // Backtrack
              assignment.delete(giverId);
              usedReceivers.delete(receiverId);
            }
          }
          
          return false; // No valid assignment found for this giver
        };
        
        return backtrack(0) ? assignment : null;
      };
      
      // Try multiple orderings with constraint-based ordering first
      // Sort givers by number of allowed receivers (most constrained first)
      const sortedByConstraint = [...participantIds].sort((a, b) => {
        const aCount = (allowedReceivers.get(a) || []).length;
        const bCount = (allowedReceivers.get(b) || []).length;
        return aCount - bCount; // Most constrained first
      });
      
      // Try constraint-ordered approach first (most likely to find solution quickly)
      let assignment = tryBacktrackingDraw(sortedByConstraint);
      
      // If constraint-ordered fails, try multiple random orderings
      const maxRetries = 5;
      for (let attempt = 0; attempt < maxRetries && !assignment; attempt++) {
        assignment = tryBacktrackingDraw(shuffleArray(participantIds));
      }
      
      const success = assignment !== null;
      
      if (!success) {
        return res.status(422).json({ 
          error: "Não foi possível realizar o sorteio com as restrições definidas. Por favor, revise as restrições e tente novamente.",
          code: "IMPOSSIBLE_DRAW"
        });
      }
      
      // Create pairs from the valid assignment
      const pairs = Array.from(assignment.entries()).map(([giverId, receiverId]) => ({
        eventId: id,
        giverParticipantId: giverId,
        receiverParticipantId: receiverId,
        isRevealed: false,
      }));
      
      // Save pairs
      const savedPairs = await storage.savePairs(id, pairs);
      
      // Create participant map for quick lookup
      const participantMap = new Map(confirmedParticipants.map(p => [p.id, p]));
      
      // Get base URL for signup link
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;
      const signupLink = `${baseUrl}/cadastro`;
      
      // Extract rules from event data
      const rules = event.typeSpecificData as {
        minGiftValue?: number | null;
        maxGiftValue?: number | null;
        rulesDescription?: string | null;
      } | null;
      
      // Send emails to all participants with their draw results
      // IMPORTANT: Send emails sequentially with delay to respect Resend rate limit (2/second)
      let emailsSent = 0;
      let emailsFailed = 0;
      
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      for (const pair of savedPairs) {
        const giver = participantMap.get(pair.giverParticipantId);
        const receiver = participantMap.get(pair.receiverParticipantId);
        
        if (!giver || !receiver) {
          console.error(`[Draw] Missing participant data for pair: giver=${pair.giverParticipantId}, receiver=${pair.receiverParticipantId}`);
          emailsFailed++;
          continue;
        }
        
        // Skip if giver has no email
        if (!giver.email) {
          console.log(`[Draw] Skipping email for participant ${giver.name || giver.id} - no email address`);
          continue;
        }
        
        try {
          const eventDateISO = event.eventDate 
            ? (typeof event.eventDate === 'string' ? event.eventDate : event.eventDate.toISOString())
            : null;
          
          await sendSecretSantaDrawResultEmail({
            to: giver.email,
            participantName: giver.name || 'Participante',
            receiverName: receiver.name || 'Seu amigo secreto',
            eventName: event.name,
            eventDate: eventDateISO,
            eventLocation: event.location,
            eventDescription: event.description,
            rules,
            signupLink,
          });
          emailsSent++;
          console.log(`[Draw] Email sent to ${giver.email}`);
        } catch (emailError) {
          console.error(`[Draw] Failed to send email to ${giver.email}:`, emailError);
          emailsFailed++;
        } finally {
          // Wait 600ms between emails to respect Resend rate limit (2 requests/second)
          // In finally block to ensure spacing even after failures
          await delay(600);
        }
      }
      
      console.log(`[Draw] Email summary: ${emailsSent} sent, ${emailsFailed} failed`);
      
      res.status(201).json({ 
        success: true, 
        message: `Sorteio realizado com sucesso! ${savedPairs.length} pares criados.`,
        pairsCount: savedPairs.length,
        emailsSent,
        emailsFailed,
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

  // ========== SECRET SANTA RESTRICTIONS (FORBIDDEN PAIRS) ROUTES ==========

  // GET /api/collab-events/:id/restrictions - Get all restrictions for an event
  app.get("/api/collab-events/:id/restrictions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "secret_santa") {
        return res.status(400).json({ error: "This event is not a Secret Santa event" });
      }
      
      const restrictions = await storage.getRestrictionsByEvent(id);
      
      // Enrich with participant names
      const enrichedRestrictions = await Promise.all(
        restrictions.map(async (restriction) => {
          const blocker = await storage.getParticipant(restriction.blockerParticipantId);
          const blocked = await storage.getParticipant(restriction.blockedParticipantId);
          return {
            ...restriction,
            blockerName: blocker?.name || 'Desconhecido',
            blockedName: blocked?.name || 'Desconhecido',
          };
        })
      );
      
      res.json(enrichedRestrictions);
    } catch (error) {
      console.error("Error fetching restrictions:", error);
      res.status(500).json({ error: "Failed to fetch restrictions" });
    }
  });

  // POST /api/collab-events/:id/restrictions - Create a new restriction (owner only)
  app.post("/api/collab-events/:id/restrictions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      const { blockerParticipantId, blockedParticipantId } = req.body;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can manage restrictions" });
      }
      
      if (event.eventType !== "secret_santa") {
        return res.status(400).json({ error: "This event is not a Secret Santa event" });
      }
      
      // Validate that both participants exist and belong to this event
      const blocker = await storage.getParticipant(blockerParticipantId);
      const blocked = await storage.getParticipant(blockedParticipantId);
      
      if (!blocker || blocker.eventId !== id) {
        return res.status(400).json({ error: "Invalid blocker participant" });
      }
      
      if (!blocked || blocked.eventId !== id) {
        return res.status(400).json({ error: "Invalid blocked participant" });
      }
      
      // Cannot restrict yourself from yourself
      if (blockerParticipantId === blockedParticipantId) {
        return res.status(400).json({ error: "A participant cannot be restricted from themselves" });
      }
      
      // Check if restriction already exists
      const existingRestrictions = await storage.getRestrictionsByEvent(id);
      const exists = existingRestrictions.some(
        r => r.blockerParticipantId === blockerParticipantId && r.blockedParticipantId === blockedParticipantId
      );
      
      if (exists) {
        return res.status(400).json({ error: "This restriction already exists" });
      }
      
      const restriction = await storage.createRestriction({
        eventId: id,
        blockerParticipantId,
        blockedParticipantId,
      });
      
      res.status(201).json(restriction);
    } catch (error) {
      console.error("Error creating restriction:", error);
      res.status(500).json({ error: "Failed to create restriction" });
    }
  });

  // DELETE /api/collab-events/:id/restrictions/:restrictionId - Delete a restriction (owner only)
  app.delete("/api/collab-events/:id/restrictions/:restrictionId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id, restrictionId } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can manage restrictions" });
      }
      
      const success = await storage.deleteRestriction(restrictionId);
      
      if (!success) {
        return res.status(404).json({ error: "Restriction not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting restriction:", error);
      res.status(500).json({ error: "Failed to delete restriction" });
    }
  });

  // ========== COLLECTIVE GIFT CONTRIBUTION ROUTES ==========

  // GET /api/collab-events/:id/contributions - Get all contributions for a collective gift event
  app.get("/api/collab-events/:id/contributions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "collective_gift") {
        return res.status(400).json({ error: "This event is not a collective gift" });
      }
      
      const contributions = await storage.getContributions(id);
      
      // Enrich with participant details
      const enrichedContributions = await Promise.all(
        contributions.map(async (contribution) => {
          const participant = await storage.getParticipant(contribution.participantId);
          return {
            ...contribution,
            participant,
          };
        })
      );
      
      res.json(enrichedContributions);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      res.status(500).json({ error: "Failed to fetch contributions" });
    }
  });

  // GET /api/collab-events/:id/contributions/summary - Get summary of contributions
  app.get("/api/collab-events/:id/contributions/summary", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "collective_gift") {
        return res.status(400).json({ error: "This event is not a collective gift" });
      }
      
      const summary = await storage.getContributionsSummary(id);
      
      // Get target amount from typeSpecificData
      const typeData = event.typeSpecificData as Record<string, unknown> | null;
      const targetAmount = (typeData?.targetAmount as number) || 0;
      
      res.json({
        ...summary,
        targetAmount,
        progress: targetAmount > 0 ? Math.round((summary.totalPaid / targetAmount) * 100) : 0,
      });
    } catch (error) {
      console.error("Error fetching contribution summary:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // POST /api/collab-events/:id/contributions - Create a contribution
  app.post("/api/collab-events/:id/contributions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "collective_gift") {
        return res.status(400).json({ error: "This event is not a collective gift" });
      }
      
      // Validate request body
      const contributionSchema = z.object({
        participantId: z.string(),
        amountDue: z.number().min(0),
        amountPaid: z.number().min(0).optional(),
        isPaid: z.boolean().optional(),
        paymentNotes: z.string().optional(),
      });
      
      const data = contributionSchema.parse(req.body);
      
      // Check if contribution already exists for this participant
      const existing = await storage.getContributionByParticipant(id, data.participantId);
      if (existing) {
        return res.status(400).json({ error: "Contribution already exists for this participant" });
      }
      
      const contribution = await storage.createContribution({
        eventId: id,
        participantId: data.participantId,
        amountDue: data.amountDue,
        amountPaid: data.amountPaid || 0,
        isPaid: data.isPaid || false,
        paymentNotes: data.paymentNotes,
      });
      
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating contribution:", error);
      res.status(500).json({ error: "Failed to create contribution" });
    }
  });

  // PATCH /api/collab-events/:id/contributions/:contributionId - Update a contribution
  app.patch("/api/collab-events/:id/contributions/:contributionId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id, contributionId } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "collective_gift") {
        return res.status(400).json({ error: "This event is not a collective gift" });
      }
      
      // Validate request body
      const updateSchema = z.object({
        amountDue: z.number().min(0).optional(),
        amountPaid: z.number().min(0).optional(),
        isPaid: z.boolean().optional(),
        paymentNotes: z.string().optional().nullable(),
      });
      
      const data = updateSchema.parse(req.body);
      
      // If marking as paid and no amountPaid specified, set it to amountDue
      let updates: Record<string, unknown> = { ...data };
      if (data.isPaid === true && data.amountPaid === undefined) {
        const existingContribution = await storage.getContribution(contributionId);
        if (existingContribution) {
          updates.amountPaid = existingContribution.amountDue;
          updates.paidAt = new Date();
        }
      }
      
      const contribution = await storage.updateContribution(contributionId, updates);
      
      if (!contribution) {
        return res.status(404).json({ error: "Contribution not found" });
      }
      
      res.json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating contribution:", error);
      res.status(500).json({ error: "Failed to update contribution" });
    }
  });

  // DELETE /api/collab-events/:id/contributions/:contributionId - Delete a contribution (owner only)
  app.delete("/api/collab-events/:id/contributions/:contributionId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id, contributionId } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      // Only owner can delete contributions
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can delete contributions" });
      }
      
      const success = await storage.deleteContribution(contributionId);
      
      if (!success) {
        return res.status(404).json({ error: "Contribution not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contribution:", error);
      res.status(500).json({ error: "Failed to delete contribution" });
    }
  });

  // POST /api/collab-events/:id/contributions/initialize - Initialize contributions for all participants
  app.post("/api/collab-events/:id/contributions/initialize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params;
      
      const event = await storage.getCollaborativeEvent(id, userId);
      if (!event) {
        return res.status(404).json({ error: "Event not found or access denied" });
      }
      
      if (event.eventType !== "collective_gift") {
        return res.status(400).json({ error: "This event is not a collective gift" });
      }
      
      // Only owner can initialize
      if (event.ownerId !== userId) {
        return res.status(403).json({ error: "Only the event owner can initialize contributions" });
      }
      
      const participants = await storage.getParticipants(id);
      const existingContributions = await storage.getContributions(id);
      const existingParticipantIds = new Set(existingContributions.map(c => c.participantId));
      
      // Get target amount and divide equally
      const typeData = event.typeSpecificData as Record<string, unknown> | null;
      const targetAmount = (typeData?.targetAmount as number) || 0;
      const contributingParticipants = participants.filter(p => !existingParticipantIds.has(p.id));
      const amountPerPerson = contributingParticipants.length > 0 
        ? Math.ceil(targetAmount / (participants.length || 1)) 
        : 0;
      
      // Create contributions for participants who don't have one
      const newContributions = await Promise.all(
        contributingParticipants.map(async (participant) => {
          return await storage.createContribution({
            eventId: id,
            participantId: participant.id,
            amountDue: amountPerPerson,
            amountPaid: 0,
            isPaid: false,
          });
        })
      );
      
      res.status(201).json({
        created: newContributions.length,
        amountPerPerson,
        contributions: newContributions,
      });
    } catch (error) {
      console.error("Error initializing contributions:", error);
      res.status(500).json({ error: "Failed to initialize contributions" });
    }
  });
}
