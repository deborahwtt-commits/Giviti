import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";
import type { EventWithRecipients, Recipient } from "@shared/schema";
import { format, differenceInDays, startOfDay } from "date-fns";
import { parseDateSafe } from "@/lib/utils";

export default function Events() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithRecipients | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [eventToArchive, setEventToArchive] = useState<string | null>(null);
  const [advanceYearDialogOpen, setAdvanceYearDialogOpen] = useState(false);
  const [eventToAdvance, setEventToAdvance] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"recent" | "eventDate" | "alphabetical">("recent");
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
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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

  const archiveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest(`/api/events/${eventId}/archive`, "PATCH");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso!",
        description: "Evento arquivado com sucesso.",
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
        description: "Falha ao arquivar evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const advanceYearMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest(`/api/events/${eventId}/advance-year`, "PATCH");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso!",
        description: "Evento atualizado para o próximo ano.",
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
        description: "Falha ao atualizar evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const calculateDaysUntil = (eventDate: string | Date | null) => {
    if (!eventDate) return 0;
    const today = startOfDay(new Date());
    return differenceInDays(startOfDay(parseDateSafe(eventDate)), today);
  };

  const formatEventDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Sem data definida';
    try {
      return format(parseDateSafe(dateString), "d 'de' MMM, yyyy");
    } catch {
      return 'Data inválida';
    }
  };

  const today = startOfDay(new Date());
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  // Sort function based on selected order, with birthday events always first
  const sortEvents = (events: EventWithRecipients[]) => {
    return [...events].sort((a, b) => {
      // Birthday events always come first
      const aIsBirthday = a.eventType?.toLowerCase().includes("meu anivers");
      const bIsBirthday = b.eventType?.toLowerCase().includes("meu anivers");
      if (aIsBirthday && !bIsBirthday) return -1;
      if (!aIsBirthday && bIsBirthday) return 1;
      
      switch (sortOrder) {
        case "recent":
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Most recent first
        case "eventDate":
          const eventDateA = a.eventDate ? parseDateSafe(a.eventDate).getTime() : Infinity;
          const eventDateB = b.eventDate ? parseDateSafe(b.eventDate).getTime() : Infinity;
          return eventDateA - eventDateB; // Closest event first
        case "alphabetical":
          const nameA = a.eventName || a.eventType || "";
          const nameB = b.eventName || b.eventType || "";
          return nameA.localeCompare(nameB, "pt-BR");
        default:
          return 0;
      }
    });
  };

  // Filter active (non-archived) events
  const activeEvents = sortEvents((allEvents || []).filter((event) => !event.archived));
  
  // Filter archived events
  const archivedEvents = sortEvents((allEvents || []).filter((event) => event.archived));

  const thisMonthEvents = activeEvents.filter((event) => {
    if (!event.eventDate) return false;
    const eventDate = startOfDay(parseDateSafe(event.eventDate));
    return eventDate >= today && eventDate <= oneMonthFromNow;
  });

  const nextThreeMonthsEvents = activeEvents.filter((event) => {
    if (!event.eventDate) return false;
    const eventDate = startOfDay(parseDateSafe(event.eventDate));
    return eventDate >= today && eventDate <= threeMonthsFromNow;
  });

  const pastEvents = activeEvents.filter((event) => {
    if (!event.eventDate) return false;
    const eventDate = startOfDay(parseDateSafe(event.eventDate));
    return eventDate < today;
  });

  const recipientOptions = recipients?.map(r => ({ id: r.id, name: r.name })) || [];

  const handleEdit = (event: EventWithRecipients) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleArchive = (eventId: string) => {
    setEventToArchive(eventId);
    setArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (eventToArchive) {
      archiveMutation.mutate(eventToArchive);
    }
    setArchiveDialogOpen(false);
    setEventToArchive(null);
  };

  const handleAdvanceYear = (eventId: string) => {
    setEventToAdvance(eventId);
    setAdvanceYearDialogOpen(true);
  };

  const confirmAdvanceYear = () => {
    if (eventToAdvance) {
      advanceYearMutation.mutate(eventToAdvance);
    }
    setAdvanceYearDialogOpen(false);
    setEventToAdvance(null);
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
              Datas Comemorativas
            </h1>
            <p className="text-muted-foreground mt-2">
              Nunca perca uma data importante para presentear
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowEventForm(true)}
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Data
          </Button>
        </div>

        {allEvents && allEvents.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-events">
                  Todos ({activeEvents.length})
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
                <TabsTrigger value="past" data-testid="tab-past-events">
                  Passados ({pastEvents.length})
                </TabsTrigger>
                <TabsTrigger value="archived" data-testid="tab-archived-events">
                  Arquivados ({archivedEvents.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortOrder} onValueChange={(value: "recent" | "eventDate" | "alphabetical") => setSortOrder(value)}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort-order">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent" data-testid="sort-recent">Mais recentes</SelectItem>
                    <SelectItem value="eventDate" data-testid="sort-event-date">Data do evento</SelectItem>
                    <SelectItem value="alphabetical" data-testid="sort-alphabetical">Alfabético</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    daysUntil={calculateDaysUntil(event.eventDate)}
                    date={formatEventDate(event.eventDate)}
                    onViewSuggestions={() => setLocation("/sugestoes")}
                    onEdit={() => handleEdit(event)}
                    onDelete={() => handleDelete(event.id)}
                    onArchive={() => handleArchive(event.id)}
                    onAdvanceYear={() => handleAdvanceYear(event.id)}
                    hasGiftPurchased={event.hasWishlistItems}
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
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      onArchive={() => handleArchive(event.id)}
                      onAdvanceYear={() => handleAdvanceYear(event.id)}
                      hasGiftPurchased={event.hasWishlistItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma data comemorativa neste mês
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
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      onArchive={() => handleArchive(event.id)}
                      onAdvanceYear={() => handleAdvanceYear(event.id)}
                      hasGiftPurchased={event.hasWishlistItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma data comemorativa nos próximos 3 meses
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={calculateDaysUntil(event.eventDate)}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      onArchive={() => handleArchive(event.id)}
                      onAdvanceYear={() => handleAdvanceYear(event.id)}
                      hasGiftPurchased={event.hasWishlistItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma data comemorativa passada
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived">
              {archivedEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {archivedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      daysUntil={calculateDaysUntil(event.eventDate)}
                      date={formatEventDate(event.eventDate)}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onEdit={() => handleEdit(event)}
                      onDelete={() => handleDelete(event.id)}
                      hasGiftPurchased={event.hasWishlistItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhuma data comemorativa arquivada
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            image={emptyEventsImage}
            title="Nenhuma data comemorativa cadastrada"
            description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
            actionLabel="Criar Data"
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

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-testid="dialog-delete-event">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir evento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <AlertDialogContent data-testid="dialog-archive-event">
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar evento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja arquivar este evento?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-archive">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchive} data-testid="button-confirm-archive">
                Arquivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={advanceYearDialogOpen} onOpenChange={setAdvanceYearDialogOpen}>
          <AlertDialogContent data-testid="dialog-advance-year-event">
            <AlertDialogHeader>
              <AlertDialogTitle>Alterar evento</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja atualizar este evento para o próximo ano?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-advance-year">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAdvanceYear} data-testid="button-confirm-advance-year">
                Atualizar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
