import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Recipients from "@/pages/Recipients";
import Events from "@/pages/Events";
import Suggestions from "@/pages/Suggestions";
import GiftManagement from "@/pages/GiftManagement";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      return stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  if (isLoading || !isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onToggleTheme={() => setIsDark(!isDark)}
        isDark={isDark}
      />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/presenteados" component={Recipients} />
        <Route path="/eventos" component={Events} />
        <Route path="/sugestoes" component={Suggestions} />
        <Route path="/presentes" component={GiftManagement} />
        <Route path="/perfil" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
