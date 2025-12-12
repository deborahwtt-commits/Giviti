import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardHero from "@/components/DashboardHero";
import UpcomingAlert from "@/components/UpcomingAlert";
import GettingStartedWizard from "@/components/GettingStartedWizard";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import ProfileOnboardingModal from "@/components/ProfileOnboardingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Gift, Palette, MapPin, Calendar } from "lucide-react";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";
import type { EventWithRecipients, Recipient, CollaborativeEvent } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{
    totalRecipients: number;
    upcomingEvents: number;
    giftsPurchased: number;
    totalSpent: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recipients, isLoading: recipientsLoading, error: recipientsError } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: upcomingEvents, isLoading: eventsLoading, error: eventsError} = useQuery<EventWithRecipients[]>({
    queryKey: ["/api/events?upcoming=true"],
  });

  const { data: roles, isLoading: rolesLoading, error: rolesError } = useQuery<CollaborativeEvent[]>({
    queryKey: ["/api/collab-events"],
  });

  const { data: invitationsData } = useQuery<{ count: number }>({
    queryKey: ["/api/user/invitations-count"],
  });

  useEffect(() => {
    const error = statsError || recipientsError || eventsError || rolesError;
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Sessão Expirada",
        description: "Você foi desconectado. Redirecionando para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, recipientsError, eventsError, rolesError, toast]);

  const calculateDaysUntil = (eventDate: string | Date | null) => {
    if (!eventDate) return 999;
    const today = new Date();
    const event = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
    return differenceInDays(event, today);
  };

  const formatEventDate = (dateString: string | Date | null) => {
    if (!dateString) return "Sem data definida";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return format(date, "d 'de' MMM, yyyy");
  };

  type UnifiedUpcomingItem = {
    id: string;
    type: 'event' | 'role';
    name: string;
    date: Date | null;
    daysUntil: number;
    eventType?: string;
    data: EventWithRecipients | CollaborativeEvent;
  };

  const getItemsNext30Days = (): UnifiedUpcomingItem[] => {
    const items: UnifiedUpcomingItem[] = [];
    
    if (upcomingEvents) {
      upcomingEvents.forEach(event => {
        const daysUntil = calculateDaysUntil(event.eventDate);
        if (daysUntil >= 0 && daysUntil <= 30) {
          items.push({
            id: event.id,
            type: 'event',
            name: event.eventName ? `${event.eventType} - ${event.eventName}` : event.eventType,
            date: event.eventDate ? new Date(event.eventDate) : null,
            daysUntil,
            data: event,
          });
        }
      });
    }
    
    if (roles) {
      roles
        .filter(role => role.status === "active" || role.status === "draft")
        .forEach(role => {
          const daysUntil = calculateDaysUntil(role.eventDate);
          if (daysUntil >= 0 && daysUntil <= 30) {
            items.push({
              id: role.id,
              type: 'role',
              name: role.name,
              date: role.eventDate ? new Date(role.eventDate) : null,
              daysUntil,
              eventType: role.eventType,
              data: role as CollaborativeEvent,
            });
          }
        });
    }
    
    return items.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });
  };

  const getDisplayedItemsIn30Days = () => {
    return getItemsNext30Days().slice(0, 6);
  };

  const getUpcomingItemsForVemAi = () => {
    const displayedItemIds = new Set(getDisplayedItemsIn30Days().map(e => e.id));
    
    type UnifiedItem = {
      id: string;
      type: 'event' | 'role';
      name: string;
      date: Date | null;
      eventType?: string;
      data: EventWithRecipients | CollaborativeEvent;
    };
    
    const items: UnifiedItem[] = [];
    
    if (upcomingEvents) {
      upcomingEvents
        .filter(event => !displayedItemIds.has(event.id))
        .forEach(event => {
          items.push({
            id: event.id,
            type: 'event',
            name: event.eventName ? `${event.eventType} ${event.eventName}` : event.eventType,
            date: event.eventDate ? new Date(event.eventDate) : null,
            data: event,
          });
        });
    }
    
    if (roles) {
      roles
        .filter(role => role.status === "active" || role.status === "draft")
        .filter(role => !displayedItemIds.has(role.id))
        .filter(role => {
          if (!role.eventDate) return true;
          const eventDate = new Date(role.eventDate);
          return eventDate >= new Date();
        })
        .forEach(role => {
          items.push({
            id: role.id,
            type: 'role',
            name: role.name,
            date: role.eventDate ? new Date(role.eventDate) : null,
            eventType: role.eventType,
            data: role as CollaborativeEvent,
          });
        });
    }
    
    return items.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.getTime() - b.date.getTime();
    });
  };

  const getRoleTypeInfo = (eventType: string) => {
    switch (eventType) {
      case "secret_santa":
        return { icon: Gift, label: "Amigo Secreto", color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800" };
      case "themed_night":
        return { icon: Palette, label: "Noite Temática", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800" };
      case "collective_gift":
        return { icon: Gift, label: "Presente Coletivo", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" };
      case "creative_challenge":
        return { icon: Palette, label: "Desafio Criativo", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" };
      default:
        return { icon: Users, label: "Rolê", color: "bg-muted text-muted-foreground" };
    }
  };

  const formatRoleDate = (date: Date | string | null) => {
    if (!date) return "Sem data definida";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d 'de' MMM, yyyy", { locale: ptBR });
  };

  const getUpcomingRoles = () => {
    if (!roles) return [];
    const now = new Date();
    return roles
      .filter(role => role.status === "active" || role.status === "draft")
      .filter(role => {
        if (!role.eventDate) return true;
        const eventDate = new Date(role.eventDate);
        return eventDate >= now;
      })
      .sort((a, b) => {
        if (!a.eventDate) return 1;
        if (!b.eventDate) return -1;
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });
  };

  if (statsLoading || recipientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const userName = user?.firstName || "Usuário";

  return (
    <div className="min-h-screen bg-background">
      <ProfileOnboardingModal />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
        <DashboardHero
          userName={userName}
          stats={{
            totalRecipients: stats?.totalRecipients || 0,
            upcomingEvents: stats?.upcomingEvents || 0,
            giftsPurchased: stats?.giftsPurchased || 0,
            totalSpent: stats?.totalSpent || 0,
            upcomingRoles: getUpcomingRoles().length,
            invitationsReceived: invitationsData?.count || 0,
          }}
          onCreateRecipient={() => setLocation("/presenteados")}
          onExploreSuggestions={() => setLocation("/sugestoes")}
          onRecipientsClick={() => setLocation("/presenteados")}
          onEventsClick={() => {
            const eventsSection = document.getElementById("events-section");
            if (eventsSection) {
              eventsSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onGiftsClick={() => setLocation("/presentes")}
          onRolesClick={() => {
            const vemAiSection = document.getElementById("vem-ai-section");
            if (vemAiSection) {
              vemAiSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onInvitationsClick={() => setLocation("/convites")}
        />

        {(upcomingEvents && upcomingEvents.length > 0) || (roles && getUpcomingRoles().length > 0) ? (
          <UpcomingAlert 
            events={upcomingEvents || []} 
            roles={roles || []} 
          />
        ) : null}

        {(!recipients || recipients.length === 0) || (!upcomingEvents || upcomingEvents.length === 0) ? (
          <GettingStartedWizard
            hasRecipients={Boolean(recipients && recipients.length > 0)}
            hasEvents={Boolean(upcomingEvents && upcomingEvents.length > 0)}
            hasPurchasedGifts={Boolean(stats && stats.giftsPurchased > 0)}
            onAddRecipient={() => setLocation("/presenteados")}
            onAddEvent={() => setLocation("/eventos")}
            onExploreSuggestions={() => setLocation("/sugestoes")}
          />
        ) : null}

        <section id="events-section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground">
                Eventos Próximos
              </h2>
              <p className="text-muted-foreground mt-1">Eventos nos próximos 30 dias</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation("/eventos")}
              data-testid="button-add-event"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>

          {eventsLoading || rolesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : getDisplayedItemsIn30Days().length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getDisplayedItemsIn30Days().map((item) => {
                if (item.type === 'event') {
                  const event = item.data as EventWithRecipients;
                  return (
                    <EventCard
                      key={`event-${item.id}`}
                      event={event}
                      daysUntil={item.daysUntil}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onDelete={() => {}}
                    />
                  );
                } else {
                  const role = item.data as CollaborativeEvent;
                  const typeInfo = getRoleTypeInfo(role.eventType);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <Card
                      key={`role-${item.id}`}
                      className="cursor-pointer hover-elevate transition-all"
                      onClick={() => setLocation(`/role/${role.id}`)}
                      data-testid={`card-role-${role.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {role.name}
                            </h3>
                            <Badge className={`mt-1 text-xs ${typeInfo.color}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`shrink-0 ${item.daysUntil <= 7 ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}`}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            {item.daysUntil === 0 ? 'Hoje' : item.daysUntil === 1 ? 'Amanhã' : `${item.daysUntil} dias`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatRoleDate(role.eventDate)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>
          ) : (
            <EmptyState
              image={emptyEventsImage}
              title="Nenhum evento nos próximos 30 dias"
              description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
              actionLabel="Criar Evento"
              onAction={() => setLocation("/eventos")}
            />
          )}
        </section>

        {getUpcomingItemsForVemAi().length > 0 && (
          <section id="vem-ai-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading font-semibold text-3xl text-foreground">
                  Vem aí!
                </h2>
                <p className="text-muted-foreground mt-1">Seus próximos eventos e rolês</p>
              </div>
              {getUpcomingItemsForVemAi().length > 9 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLocation("/eventos")}
                  data-testid="button-view-all-events"
                >
                  Ver todos os eventos
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getUpcomingItemsForVemAi().slice(0, 9).map((item) => {
                if (item.type === 'event') {
                  const event = item.data as EventWithRecipients;
                  return (
                    <EventCard
                      key={`event-${item.id}`}
                      event={event}
                      daysUntil={calculateDaysUntil(event.eventDate)}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onDelete={() => {}}
                    />
                  );
                } else {
                  const role = item.data as CollaborativeEvent;
                  const typeInfo = getRoleTypeInfo(role.eventType);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <Card
                      key={`role-${item.id}`}
                      className="cursor-pointer hover-elevate transition-all"
                      onClick={() => setLocation(`/role/${role.id}`)}
                      data-testid={`card-role-${role.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {role.name}
                            </h3>
                            <Badge className={`mt-1 text-xs ${typeInfo.color}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs shrink-0 ${
                              role.status === "active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" 
                                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                            }`}
                          >
                            {role.status === "active" ? "Ativo" : role.status === "draft" ? "Rascunho" : role.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatRoleDate(role.eventDate)}</span>
                          </div>
                          {role.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{role.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
