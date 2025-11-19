// Email/password authentication system for Giviti
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, type User } from "@shared/schema";
import { ZodError } from "zod";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = connectPgSimple(session);

const SALT_ROUNDS = 10;

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function setupAuth(app: Express): Promise<void> {
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

      // Create session
      req.session.userId = newUser.id;
      
      // Handle "remember me" functionality
      const remember = req.query.remember === "true";
      if (remember) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
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

      // Create session
      req.session.userId = user.id;

      // Handle "remember me" functionality
      const remember = req.query.remember === "true";
      if (remember) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    res.status(500).json({ message: "Erro de autenticação" });
  }
}
