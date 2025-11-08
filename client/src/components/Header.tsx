import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Event } from "@shared/schema";

interface HeaderProps {
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export default function Header({
  onToggleTheme,
  isDark = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const { data: upcomingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events", { upcoming: "true" }],
    enabled: isAuthenticated,
  });
  
  const upcomingEventsCount = upcomingEvents?.length || 0;

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/presenteados", label: "Presenteados" },
    { path: "/eventos", label: "Eventos" },
    { path: "/sugestoes", label: "Sugestões" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Giftly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover-elevate px-3 py-2 rounded-md relative ${
                  location === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                {item.label}
                {item.label === "Eventos" && upcomingEventsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {upcomingEventsCount}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-md font-medium hover-elevate ${
                    location === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                  {item.label === "Eventos" && upcomingEventsCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {upcomingEventsCount} próximos
                    </Badge>
                  )}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start px-3"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-mobile-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
