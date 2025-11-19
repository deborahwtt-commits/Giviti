import type { Response, NextFunction } from "express";

export async function isAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  if (req.user.role !== "admin") {
    console.warn(`Unauthorized admin access attempt by user ${req.user.id} (${req.user.email})`);
    return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }

  next();
}
