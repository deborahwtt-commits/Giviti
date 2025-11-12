import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";
import type { EventWithRecipients, Recipient } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

export default function Events() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithRecipients | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: recipients, error: recipientsError } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: allEvents, isLoading: eventsLoading, error: eventsError } = useQuery<EventWithRecipients[]>({
    queryKey: ["/api/events"],
  });

  useEffect(() => {
    const error = recipientsError || eventsError;
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
  }, [recipientsError, eventsError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        return await apiRequest(`/api/events/${data.id}`, "PUT", data);
      }
      return await apiRequest("/api/events", "POST", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso!",
        description: variables.id ? "Evento atualizado com sucesso." : "Evento criado com sucesso.",
      });
      setShowEventForm(false);
      setEditingEvent(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Você foi desconectado. Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao salvar evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest(`/api/events/${eventId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso!",
        description: "Evento deletado com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Você foi desconectado. Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao deletar evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const calculateDaysUntil = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    return differenceInDays(event, today);
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  const thisMonthEvents = allEvents?.filter((e) => {
    const eventDate = new Date(e.eventDate);
    return eventDate >= today && eventDate <= oneMonthFromNow;
  }) || [];

  const nextThreeMonthsEvents = allEvents?.filter((e) => {
    const eventDate = new Date(e.eventDate);
    return eventDate >= today && eventDate <= threeMonthsFromNow;
  }) || [];

  const recipientOptions = recipients?.map(r => ({ id: r.id, name: r.name })) || [];

  const handleEdit = (event: EventWithRecipients) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm("Tem certeza que deseja deletar este evento?")) {
      deleteMutation.mutate(eventId);
    }
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-foreground">
              Eventos
            </h1>
            <p className="text-muted-foreground mt-2">
              Nunca perca uma data importante
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowEventForm(true)}
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {allEvents && allEvents.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-events">
                Todos ({allEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="thisMonth"
                data-testid="tab-this-month-events"
              >
                Este Mês ({thisMonthEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="nextThreeMonths"
                data-testid="tab-next-three-months-events"
              >
                Próximos 3 Meses ({nextThreeMonthsEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allEvents?.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    daysUntil={calculateDaysUntil(event.eventDate)}
                    date={formatEventDate(event.eventDate)}
                    onViewSuggestions={() => setLocation("/sugestoes")}
                    onEdit={handleEdit}
                    onDelete={() => handleDelete(event.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="thisMonth">
              {thisMonthEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {thisMonthEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={calculateDaysUntil(event.eventDate)}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onEdit={handleEdit}
                      onDelete={() => handleDelete(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum evento neste mês
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="nextThreeMonths">
              {nextThreeMonthsEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {nextThreeMonthsEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={calculateDaysUntil(event.eventDate)}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onEdit={handleEdit}
                      onDelete={() => handleDelete(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum evento nos próximos 3 meses
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            image={emptyEventsImage}
            title="Nenhum evento cadastrado"
            description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
            actionLabel="Criar Evento"
            onAction={() => setShowEventForm(true)}
          />
        )}

        <EventForm
          isOpen={showEventForm}
          onClose={handleCloseForm}
          onSubmit={(data) => createMutation.mutate(data)}
          recipients={recipientOptions}
          initialEvent={editingEvent ? {
            id: editingEvent.id,
            eventName: editingEvent.eventName,
            eventType: editingEvent.eventType,
            eventDate: editingEvent.eventDate,
            recipientIds: editingEvent.recipients.map(r => r.id),
          } : undefined}
        />
      </div>
    </div>
  );
}
