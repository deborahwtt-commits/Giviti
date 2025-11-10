// From Replit Auth blueprint integration
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function handleAuthError(toast: any, setLocation: any) {
  toast({
    title: "Sessão expirada",
    description: "Sua sessão expirou. Por favor, faça login novamente.",
    variant: "destructive",
  });
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 1500);
}
