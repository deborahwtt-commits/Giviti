import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users, Gift, PartyPopper, Heart, Sparkles, Check } from "lucide-react";
import { format } from "date-fns";
import { CreateRoleDialog } from "@/components/CreateRoleDialog";
import type { CollaborativeEvent } from "@shared/schema";
import type { LucideIcon } from "lucide-react";

interface EnrichedCollaborativeEvent extends CollaborativeEvent {
  isDrawPerformed?: boolean;
}

export default function CollaborativeEvents() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: events, isLoading } = useQuery<EnrichedCollaborativeEvent[]>({
    queryKey: ["/api/collab-events"],
  });

  // Fetch themed night categories
  const { data: categories } = useQuery<Array<{ id: string; name: string; description: string | null }>>({
    queryKey: ["/api/themed-night-categories"],
    enabled: !!events && events.some(e => e.eventType === "themed_night" && e.themedNightCategoryId),
  });

  // Create a map for quick category lookup
  const categoryMap = new Map(categories?.map(cat => [cat.id, cat]) || []);

  // Event type display information with distinct colors
  const eventTypeInfo: Record<string, { label: string; className: string; Icon: LucideIcon }> = {
    secret_santa: { 
      label: "Amigo Secreto", 
      className: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", 
      Icon: Gift 
    },
    themed_night: { 
      label: "Noite Temática", 
      className: "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", 
      Icon: PartyPopper 
    },
    collective_gift: { 
      label: "Presente Coletivo", 
      className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", 
      Icon: Heart 
    },
    creative_challenge: { 
      label: "Desafio Criativo", 
      className: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", 
      Icon: Sparkles 
    },
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-bold">Planeje seu rolê!</h1>
            <p className="text-muted-foreground">Organize eventos colaborativos com seus amigos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const sortedEvents = events ? [...events].sort((a, b) => {
    if (!a.eventDate) return 1;
    if (!b.eventDate) return -1;
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  }) : [];

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold">Planeje seu rolê!</h1>
          <p className="text-muted-foreground">
            Organize rolês colaborativos com seus amigos
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={() => setCreateDialogOpen(true)}
          data-testid="button-create-role"
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Rolê
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum rolê ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Comece criando seu primeiro rolê! Organize amigo secreto, noites temáticas e muito mais.
            </p>
            <Button 
              size="lg" 
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-create-first-role"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Rolê
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const typeInfo = eventTypeInfo[event.eventType] || {
              label: event.eventType,
              className: "",
              Icon: Calendar,
            };
            const IconComponent = typeInfo.Icon;

            return (
              <Card
                key={event.id}
                className="hover-elevate active-elevate-2 cursor-pointer transition-all"
                data-testid={`card-event-${event.id}`}
                onClick={() => setLocation(`/role/${event.id}`)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setLocation(`/role/${event.id}`);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <IconComponent className="w-6 h-6 text-primary" />
                    <div className="flex items-center gap-2">
                      {event.eventType === "secret_santa" && event.isDrawPerformed && (
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                          data-testid="badge-draw-performed"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Sorteado
                        </Badge>
                      )}
                      <Badge variant="outline" className={typeInfo.className} data-testid="badge-event-type">
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl" data-testid="text-event-name">
                    {event.name}
                  </CardTitle>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.eventDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid="text-event-date">
                        {format(new Date(event.eventDate), "dd/MM/yyyy 'às' HH:mm")}
                      </span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1" data-testid="text-event-location">
                        {event.location}
                      </span>
                    </div>
                  )}
                  {event.eventType === "themed_night" && event.themedNightCategoryId && (
                    <div className="flex items-center gap-2 text-sm">
                      <PartyPopper className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground" data-testid="text-category-name">
                        {categoryMap.get(event.themedNightCategoryId)?.name || "Carregando..."}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Ver participantes</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge
                      variant={event.status === "active" ? "default" : "secondary"}
                      data-testid="badge-event-status"
                    >
                      {event.status === "draft" && "Rascunho"}
                      {event.status === "active" && "Ativo"}
                      {event.status === "completed" && "Concluído"}
                      {event.status === "cancelled" && "Cancelado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
