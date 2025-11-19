import type { Response, NextFunction } from "express";
import { storage } from "../storage";

export async function isAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user || !req.user.claims?.sub) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  try {
    const dbUser = await storage.getUser(req.user.claims.sub);
    
    if (!dbUser) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    if (dbUser.role !== "admin") {
      console.warn(`Unauthorized admin access attempt by user ${dbUser.id} (${dbUser.email})`);
      return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
    }

    next();
  } catch (error) {
    console.error("Error validating admin role:", error);
    return res.status(500).json({ message: "Erro ao validar permissões" });
  }
}
