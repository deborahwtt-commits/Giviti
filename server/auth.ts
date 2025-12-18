// Email/password authentication system for Giviti
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, type User } from "@shared/schema";
import { ZodError } from "zod";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { sendPasswordResetEmail } from "./emailService";

const PgSession = connectPgSimple(session);

const SALT_ROUNDS = 10;

export async function setupAuth(app: Express): Promise<void> {
  // Trust proxy for production (Replit uses reverse proxy)
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Session configuration
  const sessionMiddleware = session({
    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || "giviti-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours default
    },
    name: "giviti.sid",
  });

  app.use(sessionMiddleware);

  // Register endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "E-mail já está em uso" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

      // Create user
      const newUser = await storage.createUser(
        validatedData.email,
        passwordHash,
        validatedData.firstName ?? undefined,
        validatedData.lastName ?? undefined
      );

      // Link any pending participant invitations to this new user
      const linkedCount = await storage.linkParticipantsByEmail(validatedData.email, newUser.id);
      if (linkedCount > 0) {
        console.log(`[Register] Linked ${linkedCount} participant invitation(s) to new user ${newUser.id}`);
      }

      // Sync any recipients that have this user's email with the new user data
      const syncedRecipientsCount = await storage.syncRecipientsFromUserProfile(newUser.id, validatedData.email);
      if (syncedRecipientsCount > 0) {
        console.log(`[Register] Synced ${syncedRecipientsCount} recipient(s) to new user ${newUser.id}`);
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          return res.status(500).json({ message: "Erro ao criar conta" });
        }

        // Create session
        req.session.userId = newUser.id;
        
        // Handle "remember me" functionality
        const remember = req.query.remember === "true";
        if (remember) {
          req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }

        // Save session explicitly before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session:", saveErr);
            return res.status(500).json({ message: "Erro ao criar conta" });
          }

          // Return user without password hash
          const { passwordHash: _, ...userWithoutPassword } = newUser;
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "E-mail ou senha incorretos" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "E-mail ou senha incorretos" });
      }

      // Link any pending participant invitations to this user (case-insensitive email match)
      const linkedCount = await storage.linkParticipantsByEmail(validatedData.email, user.id);
      if (linkedCount > 0) {
        console.log(`[Login] Linked ${linkedCount} participant invitation(s) to user ${user.id}`);
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          return res.status(500).json({ message: "Erro ao fazer login" });
        }

        // Create session
        req.session.userId = user.id;

        // Handle "remember me" functionality
        const remember = req.query.remember === "true";
        if (remember) {
          req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }

        // Save session explicitly before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session:", saveErr);
            return res.status(500).json({ message: "Erro ao fazer login" });
          }

          // Return user without password hash
          const { passwordHash: _, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("giviti.sid");
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Forgot password endpoint - request password reset
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "E-mail é obrigatório" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await storage.getUserByEmail(normalizedEmail);
      
      // Always return success to prevent email enumeration attacks
      const successMessage = "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";
      
      if (!user) {
        return res.json({ message: successMessage });
      }

      // Clean up expired tokens
      await storage.deleteExpiredPasswordResetTokens();

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save the token
      await storage.createPasswordResetToken(user.id, token, expiresAt);

      // Build reset URL - use custom domain in production, dev domain in development
      // REPLIT_DEPLOYMENT is set to "1" when app is published
      const baseUrl = process.env.REPLIT_DEPLOYMENT === "1"
        ? "https://giviti.com.br"
        : process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "http://localhost:5000";
      const resetLink = `${baseUrl}/redefinir-senha/${token}`;

      // Send email
      try {
        await sendPasswordResetEmail(normalizedEmail, resetLink, user.firstName || undefined);
        console.log(`[ForgotPassword] Reset email sent to ${normalizedEmail}`);
      } catch (emailError) {
        console.error("[ForgotPassword] Failed to send email:", emailError);
        // Still return success to prevent enumeration
      }

      res.json({ message: successMessage });
    } catch (error) {
      console.error("Error in forgot-password:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });

  // Reset password endpoint - set new password using token
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token inválido" });
      }
      
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }

      // Find the token
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Token expirado. Solicite uma nova redefinição de senha." });
      }

      // Check if token was already used
      if (resetToken.usedAt) {
        return res.status(400).json({ message: "Este link já foi utilizado. Solicite uma nova redefinição de senha." });
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Update the user's password
      const updated = await storage.updateUserPassword(resetToken.userId, passwordHash);
      
      if (!updated) {
        return res.status(500).json({ message: "Erro ao atualizar senha" });
      }

      // Mark the token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);

      console.log(`[ResetPassword] Password reset successful for user ${resetToken.userId}`);
      
      res.json({ message: "Senha redefinida com sucesso! Você já pode fazer login." });
    } catch (error) {
      console.error("Error in reset-password:", error);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });

  // Change password endpoint - for authenticated users
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || typeof currentPassword !== "string") {
        return res.status(400).json({ message: "Senha atual é obrigatória" });
      }
      
      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres" });
      }

      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update password
      const updated = await storage.updateUserPassword(user.id, passwordHash);
      if (!updated) {
        return res.status(500).json({ message: "Erro ao atualizar senha" });
      }

      console.log(`[ChangePassword] Password changed for user ${user.id}`);
      
      res.json({ message: "Senha alterada com sucesso!" });
    } catch (error) {
      console.error("Error in change-password:", error);
      res.status(500).json({ message: "Erro ao alterar senha" });
    }
  });

  // Deactivate account endpoint - marks account as inactive (soft delete)
  app.post("/api/auth/deactivate-account", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { password } = req.body;
      
      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Senha é obrigatória para confirmar a exclusão" });
      }

      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Senha incorreta" });
      }

      // Deactivate the account (soft delete) - deactivatedBy is null for self-deactivation
      const updated = await storage.updateUser(user.id, { 
        isActive: false,
        deactivatedBy: null,
        deactivatedAt: new Date(),
      });
      if (!updated) {
        return res.status(500).json({ message: "Erro ao desativar conta" });
      }

      console.log(`[DeactivateAccount] Account self-deactivated for user ${user.id} (${user.email})`);

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session after account deactivation:", err);
        }
        res.clearCookie("giviti.sid");
        res.json({ message: "Conta excluída com sucesso" });
      });
    } catch (error) {
      console.error("Error in deactivate-account:", error);
      res.status(500).json({ message: "Erro ao excluir conta" });
    }
  });
}

// Middleware to check if user is authenticated
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Store user without password hash in request
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword as any;
    next();
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).json({ message: "Erro de autenticação" });
  }
}
