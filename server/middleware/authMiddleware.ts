import type { Request, Response, NextFunction } from "express";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const user = req.user as any;
  if (user.role !== "admin") {
    console.warn(`Unauthorized admin access attempt by user ${user.id} (${user.email})`);
    return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }

  next();
}
