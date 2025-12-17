import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users, Gift, PartyPopper, Heart, Sparkles, Check, Ban } from "lucide-react";
import { format, parseISO } from "date-fns";
import { CreateRoleDialog } from "@/components/CreateRoleDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CollaborativeEvent, User } from "@shared/schema";
import type { LucideIcon } from "lucide-react";

interface EnrichedCollaborativeEvent extends CollaborativeEvent {
  isDrawPerformed?: boolean;
}

export default function CollaborativeEvents() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<EnrichedCollaborativeEvent | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  const { data: events, isLoading } = useQuery<EnrichedCollaborativeEvent[]>({
    queryKey: ["/api/collab-events"],
  });
  
  const cancelEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("POST", `/api/collab-events/${eventId}/cancel`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Evento cancelado",
        description: data.message || "O evento foi cancelado e os participantes foram notificados.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events"] });
      setCancelDialogOpen(false);
      setEventToCancel(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Não foi possível cancelar o evento.",
        variant: "destructive",
      });
    },
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
      className: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", 
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
    const dateA = typeof a.eventDate === 'string' ? parseISO(a.eventDate) : a.eventDate;
    const dateB = typeof b.eventDate === 'string' ? parseISO(b.eventDate) : b.eventDate;
    return dateA.getTime() - dateB.getTime();
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
                        {format(typeof event.eventDate === 'string' ? parseISO(event.eventDate) : event.eventDate, "dd/MM/yyyy 'às' HH:mm")}
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
                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    <Badge
                      variant={event.status === "active" ? "default" : "secondary"}
                      data-testid="badge-event-status"
                    >
                      {event.status === "draft" && "Rascunho"}
                      {event.status === "active" && "Ativo"}
                      {event.status === "completed" && "Concluído"}
                      {event.status === "cancelled" && "Cancelado"}
                    </Badge>
                    {currentUser?.id === event.ownerId && event.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-cancel-event-${event.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToCancel(event);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
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
      
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar "{eventToCancel?.name}"?
              <br /><br />
              Todos os participantes serão notificados por email sobre o cancelamento.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (eventToCancel) {
                  cancelEventMutation.mutate(eventToCancel.id);
                }
              }}
              disabled={cancelEventMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelEventMutation.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
