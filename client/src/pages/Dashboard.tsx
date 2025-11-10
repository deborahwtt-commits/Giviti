import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardHero from "@/components/DashboardHero";
import EventCard from "@/components/EventCard";
import GiftCard from "@/components/GiftCard";
import EmptyState from "@/components/EmptyState";
import ProfileOnboardingModal from "@/components/ProfileOnboardingModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";
import type { Event, Recipient, GiftSuggestion } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{
    totalRecipients: number;
    upcomingEvents: number;
    giftsPurchased: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recipients, isLoading: recipientsLoading, error: recipientsError } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: upcomingEvents, isLoading: eventsLoading, error: eventsError } = useQuery<Event[]>({
    queryKey: ["/api/events", { upcoming: "true" }],
  });

  const { data: suggestions, isLoading: suggestionsLoading, error: suggestionsError } = useQuery<GiftSuggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  useEffect(() => {
    const error = statsError || recipientsError || eventsError || suggestionsError;
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
  }, [statsError, recipientsError, eventsError, suggestionsError, toast]);

  const getRecipientName = (recipientId: string) => {
    const recipient = recipients?.find(r => r.id === recipientId);
    return recipient?.name || "Desconhecido";
  };

  const calculateDaysUntil = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    return differenceInDays(event, today);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMM, yyyy");
  };

  const formatPriceRange = (min: number, max: number) => {
    return `R$ ${min} - R$ ${max}`;
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
          }}
          onCreateRecipient={() => setLocation("/presenteados")}
          onExploreSuggestions={() => setLocation("/sugestoes")}
        />

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground">
                Eventos Próximos
              </h2>
              <p className="text-muted-foreground mt-1">
                Não perca as datas importantes
              </p>
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

          {eventsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard
                  key={event.id}
                  eventName={event.eventName || event.eventType}
                  recipientName={getRecipientName(event.recipientId)}
                  daysUntil={calculateDaysUntil(event.eventDate)}
                  date={formatEventDate(event.eventDate)}
                  onViewSuggestions={() => setLocation("/sugestoes")}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              image={emptyEventsImage}
              title="Nenhum evento próximo"
              description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
              actionLabel="Criar Evento"
              onAction={() => setLocation("/eventos")}
            />
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground">
                Sugestões Recentes
              </h2>
              <p className="text-muted-foreground mt-1">
                Ideias personalizadas para você
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLocation("/sugestoes")}
              data-testid="button-view-all-suggestions"
            >
              Ver Todas
            </Button>
          </div>

          {suggestionsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {suggestions.slice(0, 8).map((gift) => (
                <GiftCard
                  key={gift.id}
                  id={gift.id}
                  name={gift.name}
                  description={gift.description}
                  imageUrl={gift.imageUrl}
                  priceRange={formatPriceRange(gift.priceMin, gift.priceMax)}
                  onViewDetails={() => setLocation("/sugestoes")}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              image={emptySuggestionsImage}
              title="Nenhuma sugestão ainda"
              description="Adicione presenteados e eventos para receber sugestões personalizadas."
            />
          )}
        </section>
      </div>
    </div>
  );
}
