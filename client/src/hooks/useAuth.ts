// From Replit Auth blueprint integration
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const hasAdminAccess = user?.role === "admin" || user?.role === "manager" || user?.role === "support";

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    hasAdminAccess,
  };
}
