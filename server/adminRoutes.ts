// Administrative routes for Giviti
import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { isAdmin, hasRole } from "./middleware/authMiddleware";
import {
  insertOccasionSchema,
  insertPriceRangeSchema,
  insertRelationshipTypeSchema,
  insertThemedNightCategorySchema,
  insertSystemSettingSchema,
} from "@shared/schema";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "./emailService";

export function registerAdminRoutes(app: Express) {
  // Helper function to create audit log
  async function createAudit(req: any, action: string, resource: string, resourceId?: string, details?: any) {
    try {
      await storage.createAuditLog({
        userId: req.user!.id,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
      });
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  }

  // ========== User Management Routes ==========

  // GET /api/admin/users - Get all users with optional filters
  app.get("/api/admin/users", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      const { role, isActive } = req.query;
      const filters: any = {};
      
      if (role) filters.role = role;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      
      const users = await storage.getAllUsers(filters);
      
      // Remove password hashes from response
      const sanitizedUsers = users.map(({ passwordHash, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // GET /api/admin/users/detailed - Get all users with aggregated stats
  app.get("/api/admin/users/detailed", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      const usersWithStats = await storage.getAllUsersWithStats();
      
      // Remove password hashes from response
      const sanitizedUsers = usersWithStats.map(({ passwordHash, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching detailed users:", error);
      res.status(500).json({ message: "Failed to fetch detailed users" });
    }
  });

  // POST /api/admin/users - Create new user
  app.post("/api/admin/users", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      // Validate request body with Zod schema
      const createUserSchema = z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
        firstName: z.string().min(1, "Nome é obrigatório"),
        lastName: z.string().min(1, "Sobrenome é obrigatório"),
        role: z.enum(["user", "admin", "manager", "support", "readonly"]).optional(),
      });
      
      const validatedData = createUserSchema.parse(req.body);
      const { email, password, firstName, lastName, role } = validatedData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      let newUser = await storage.createUser(email, passwordHash, firstName, lastName);
      
      // Update role if specified and different from default
      if (role && role !== "user") {
        newUser = await storage.updateUser(newUser.id, { role }) || newUser;
      }
      
      await createAudit(req, "CREATE", "user", newUser.id, { email, firstName, lastName, role });
      
      const { passwordHash: _, ...sanitizedUser } = newUser;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // PUT /api/admin/users/:id - Update user (role, active status, etc.)
  app.put("/api/admin/users/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, isActive } = req.body;
      
      // Backend validation: prevent self-demotion or self-deactivation
      if (req.user!.id === id) {
        if (role !== undefined && role !== "admin") {
          return res.status(403).json({ 
            message: "Você não pode remover suas próprias permissões administrativas. Peça a outro administrador para fazer isso." 
          });
        }
        if (isActive === false) {
          return res.status(403).json({ 
            message: "Você não pode desativar sua própria conta. Peça a outro administrador para fazer isso." 
          });
        }
      }
      
      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;
      
      const updatedUser = await storage.updateUser(id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await createAudit(req, "UPDATE", "user", id, updates);
      
      const { passwordHash, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // POST /api/admin/users/:id/reset-password - Admin triggers password reset email
  app.post("/api/admin/users/:id/reset-password", isAuthenticated, hasRole("admin"), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get user to reset password for
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(400).json({ message: "Não é possível redefinir senha de usuário inativo" });
      }
      
      // Invalidate any existing tokens for this user
      await storage.invalidatePasswordResetTokensForUser(id);
      
      // Generate new token
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await storage.createPasswordResetToken(id, token, expiresAt);
      
      // Build reset link - prefer deployment URL, then dev domain, then localhost
      let baseUrl: string;
      if (process.env.REPLIT_DEPLOYMENT_URL) {
        baseUrl = process.env.REPLIT_DEPLOYMENT_URL;
      } else if (process.env.REPLIT_DEV_DOMAIN) {
        baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
      } else {
        baseUrl = 'http://localhost:5000';
      }
      const resetLink = `${baseUrl}/redefinir-senha/${token}`;
      
      // Send password reset email
      await sendPasswordResetEmail(user.email, resetLink, user.firstName || undefined);
      
      // Create audit log
      await createAudit(req, "RESET_PASSWORD", "user", id, { 
        targetEmail: user.email,
        triggeredBy: req.user!.email 
      });
      
      console.log(`[Admin] Password reset email sent to ${user.email} by ${req.user!.email}`);
      
      res.json({ message: "E-mail de redefinição de senha enviado com sucesso" });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      res.status(500).json({ message: "Erro ao enviar e-mail de redefinição de senha" });
    }
  });

  // ========== Occasions Management Routes ==========

  // GET /api/admin/occasions - Get all occasions
  app.get("/api/admin/occasions", isAuthenticated, hasRole("admin", "manager", "support", "readonly"), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const occasions = await storage.getOccasions(includeInactive);
      res.json(occasions);
    } catch (error) {
      console.error("Error fetching occasions:", error);
      res.status(500).json({ message: "Failed to fetch occasions" });
    }
  });

  // POST /api/admin/occasions - Create occasion
  app.post("/api/admin/occasions", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const validatedData = insertOccasionSchema.parse(req.body);
      const occasion = await storage.createOccasion(validatedData);
      
      await createAudit(req, "CREATE", "occasion", occasion.id, validatedData);
      
      res.status(201).json(occasion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid occasion data", errors: error.errors });
      }
      console.error("Error creating occasion:", error);
      res.status(500).json({ message: "Failed to create occasion" });
    }
  });

  // PUT /api/admin/occasions/:id - Update occasion
  app.put("/api/admin/occasions/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertOccasionSchema.partial().parse(req.body);
      const occasion = await storage.updateOccasion(id, validatedData);
      
      if (!occasion) {
        return res.status(404).json({ message: "Occasion not found" });
      }
      
      await createAudit(req, "UPDATE", "occasion", id, validatedData);
      
      res.json(occasion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid occasion data", errors: error.errors });
      }
      console.error("Error updating occasion:", error);
      res.status(500).json({ message: "Failed to update occasion" });
    }
  });

  // DELETE /api/admin/occasions/:id - Delete occasion
  app.delete("/api/admin/occasions/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteOccasion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Occasion not found" });
      }
      
      await createAudit(req, "DELETE", "occasion", id);
      
      res.json({ message: "Occasion deleted successfully" });
    } catch (error) {
      console.error("Error deleting occasion:", error);
      res.status(500).json({ message: "Failed to delete occasion" });
    }
  });

  // ========== Price Ranges Management Routes ==========

  // GET /api/admin/price-ranges - Get all price ranges
  app.get("/api/admin/price-ranges", isAuthenticated, hasRole("admin", "manager", "support", "readonly"), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const priceRanges = await storage.getPriceRanges(includeInactive);
      res.json(priceRanges);
    } catch (error) {
      console.error("Error fetching price ranges:", error);
      res.status(500).json({ message: "Failed to fetch price ranges" });
    }
  });

  // POST /api/admin/price-ranges - Create price range
  app.post("/api/admin/price-ranges", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const validatedData = insertPriceRangeSchema.parse(req.body);
      const priceRange = await storage.createPriceRange(validatedData);
      
      await createAudit(req, "CREATE", "price_range", priceRange.id, validatedData);
      
      res.status(201).json(priceRange);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid price range data", errors: error.errors });
      }
      console.error("Error creating price range:", error);
      res.status(500).json({ message: "Failed to create price range" });
    }
  });

  // PUT /api/admin/price-ranges/:id - Update price range
  app.put("/api/admin/price-ranges/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPriceRangeSchema.partial().parse(req.body);
      const priceRange = await storage.updatePriceRange(id, validatedData);
      
      if (!priceRange) {
        return res.status(404).json({ message: "Price range not found" });
      }
      
      await createAudit(req, "UPDATE", "price_range", id, validatedData);
      
      res.json(priceRange);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid price range data", errors: error.errors });
      }
      console.error("Error updating price range:", error);
      res.status(500).json({ message: "Failed to update price range" });
    }
  });

  // DELETE /api/admin/price-ranges/:id - Delete price range
  app.delete("/api/admin/price-ranges/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePriceRange(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Price range not found" });
      }
      
      await createAudit(req, "DELETE", "price_range", id);
      
      res.json({ message: "Price range deleted successfully" });
    } catch (error) {
      console.error("Error deleting price range:", error);
      res.status(500).json({ message: "Failed to delete price range" });
    }
  });

  // ========== Relationship Types Management Routes ==========

  // GET /api/admin/relationship-types - Get all relationship types
  app.get("/api/admin/relationship-types", isAuthenticated, hasRole("admin", "manager", "support", "readonly"), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const relationshipTypes = await storage.getRelationshipTypes(includeInactive);
      res.json(relationshipTypes);
    } catch (error) {
      console.error("Error fetching relationship types:", error);
      res.status(500).json({ message: "Failed to fetch relationship types" });
    }
  });

  // POST /api/admin/relationship-types - Create relationship type
  app.post("/api/admin/relationship-types", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const validatedData = insertRelationshipTypeSchema.parse(req.body);
      const relationshipType = await storage.createRelationshipType(validatedData);
      
      await createAudit(req, "CREATE", "relationship_type", relationshipType.id, validatedData);
      
      res.status(201).json(relationshipType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid relationship type data", errors: error.errors });
      }
      console.error("Error creating relationship type:", error);
      res.status(500).json({ message: "Failed to create relationship type" });
    }
  });

  // PUT /api/admin/relationship-types/:id - Update relationship type
  app.put("/api/admin/relationship-types/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertRelationshipTypeSchema.partial().parse(req.body);
      const relationshipType = await storage.updateRelationshipType(id, validatedData);
      
      if (!relationshipType) {
        return res.status(404).json({ message: "Relationship type not found" });
      }
      
      await createAudit(req, "UPDATE", "relationship_type", id, validatedData);
      
      res.json(relationshipType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid relationship type data", errors: error.errors });
      }
      console.error("Error updating relationship type:", error);
      res.status(500).json({ message: "Failed to update relationship type" });
    }
  });

  // DELETE /api/admin/relationship-types/:id - Delete relationship type
  app.delete("/api/admin/relationship-types/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRelationshipType(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Relationship type not found" });
      }
      
      await createAudit(req, "DELETE", "relationship_type", id);
      
      res.json({ message: "Relationship type deleted successfully" });
    } catch (error) {
      console.error("Error deleting relationship type:", error);
      res.status(500).json({ message: "Failed to delete relationship type" });
    }
  });

  // ========== Themed Night Categories Management Routes ==========

  // GET /api/admin/themed-night-categories - Get all themed night categories
  app.get("/api/admin/themed-night-categories", isAuthenticated, hasRole("admin", "manager", "support", "readonly"), async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await storage.getThemedNightCategories(includeInactive);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching themed night categories:", error);
      res.status(500).json({ message: "Failed to fetch themed night categories" });
    }
  });

  // POST /api/admin/themed-night-categories - Create themed night category
  app.post("/api/admin/themed-night-categories", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const validatedData = insertThemedNightCategorySchema.parse(req.body);
      const category = await storage.createThemedNightCategory(validatedData);
      
      await createAudit(req, "CREATE", "themed_night_category", category.id, validatedData);
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid themed night category data", errors: error.errors });
      }
      console.error("Error creating themed night category:", error);
      res.status(500).json({ message: "Failed to create themed night category" });
    }
  });

  // PUT /api/admin/themed-night-categories/:id - Update themed night category
  app.put("/api/admin/themed-night-categories/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertThemedNightCategorySchema.partial().parse(req.body);
      const category = await storage.updateThemedNightCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Themed night category not found" });
      }
      
      await createAudit(req, "UPDATE", "themed_night_category", id, validatedData);
      
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid themed night category data", errors: error.errors });
      }
      console.error("Error updating themed night category:", error);
      res.status(500).json({ message: "Failed to update themed night category" });
    }
  });

  // DELETE /api/admin/themed-night-categories/:id - Delete themed night category
  app.delete("/api/admin/themed-night-categories/:id", isAuthenticated, hasRole("admin", "manager"), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteThemedNightCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Themed night category not found" });
      }
      
      await createAudit(req, "DELETE", "themed_night_category", id);
      
      res.json({ message: "Themed night category deleted successfully" });
    } catch (error) {
      console.error("Error deleting themed night category:", error);
      res.status(500).json({ message: "Failed to delete themed night category" });
    }
  });

  // ========== System Settings Management Routes ==========

  // GET /api/admin/settings - Get all system settings
  app.get("/api/admin/settings", isAuthenticated, hasRole("admin", "manager", "support", "readonly"), async (req: any, res) => {
    try {
      const publicOnly = req.query.publicOnly === "true";
      const settings = await storage.getSystemSettings(publicOnly);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // POST /api/admin/settings - Create or update system setting
  app.post("/api/admin/settings", isAuthenticated, hasRole("admin"), async (req: any, res) => {
    try {
      const validatedData = insertSystemSettingSchema.parse(req.body);
      const setting = await storage.upsertSystemSetting(validatedData);
      
      await createAudit(req, "UPSERT", "system_setting", setting.key, validatedData);
      
      res.json(setting);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      }
      console.error("Error upserting setting:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  // DELETE /api/admin/settings/:key - Delete system setting
  app.delete("/api/admin/settings/:key", isAuthenticated, hasRole("admin"), async (req: any, res) => {
    try {
      const { key } = req.params;
      const deleted = await storage.deleteSystemSetting(key);
      
      if (!deleted) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      await createAudit(req, "DELETE", "system_setting", key);
      
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });

  // ========== Audit Logs Routes ==========

  // GET /api/admin/audit-logs - Get audit logs with filters
  app.get("/api/admin/audit-logs", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      const { userId, resource, limit } = req.query;
      const filters: any = {};
      
      if (userId) filters.userId = userId;
      if (resource) filters.resource = resource;
      if (limit) filters.limit = parseInt(limit);
      
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // ========== Advanced Admin Stats Routes ==========

  // GET /api/admin/advanced-stats - Get advanced statistics
  app.get("/api/admin/advanced-stats", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      const stats = await storage.getAdvancedStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching advanced stats:", error);
      res.status(500).json({ message: "Failed to fetch advanced statistics" });
    }
  });

  // ========== Click Analytics Routes ==========

  // GET /api/admin/top-clicks - Get top clicked product links
  app.get("/api/admin/top-clicks", isAuthenticated, hasRole("admin", "manager", "support"), async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topClicks = await storage.getTopClickedLinks(limit);
      res.json(topClicks);
    } catch (error) {
      console.error("Error fetching top clicks:", error);
      res.status(500).json({ message: "Failed to fetch click analytics" });
    }
  });
}
