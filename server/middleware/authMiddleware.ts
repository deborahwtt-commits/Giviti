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

// Middleware to check if user has any of the allowed roles
export function hasRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Autenticação necessária" });
    }

    const user = req.user as any;
    if (!allowedRoles.includes(user.role)) {
      console.warn(
        `Unauthorized access attempt by user ${user.id} (${user.email}) with role ${user.role}. Required: ${allowedRoles.join(", ")}`
      );
      return res.status(403).json({
        message: "Acesso negado. Permissões insuficientes.",
      });
    }

    next();
  };
}

// Check if user is active
export async function isActive(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const user = req.user as any;
  if (user.isActive === false) {
    return res.status(403).json({
      message: "Conta desativada. Entre em contato com o administrador.",
    });
  }

  next();
}
