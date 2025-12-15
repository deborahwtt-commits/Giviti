import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Gift, PartyPopper, Heart, Sparkles, Calendar, MapPin, Loader2, Check, LogIn, UserPlus, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";

const eventTypeInfo: Record<string, { label: string; Icon: LucideIcon }> = {
  secret_santa: { label: "Amigo Secreto", Icon: Gift },
  themed_night: { label: "Noite Temática", Icon: PartyPopper },
  collective_gift: { label: "Presente Coletivo", Icon: Heart },
  creative_challenge: { label: "Desafio Criativo", Icon: Sparkles },
};

interface InvitationData {
  participant: {
    id: string;
    name: string | null;
    email: string | null;
    status: string;
    eventId: string;
  };
  event: {
    id: string;
    name: string;
    eventType: string;
    eventDate: string | null;
    location: string | null;
    description: string | null;
    confirmationDeadline: string | null;
  };
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [hasAccepted, setHasAccepted] = useState(false);

  const { data: invitation, isLoading, error } = useQuery<InvitationData>({
    queryKey: ["/api/invitations/by-token", token],
    queryFn: async () => {
      const response = await fetch(`/api/invitations/by-token/${token}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao carregar convite");
      }
      return response.json();
    },
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/invitations/by-token/${token}/accept`, "POST");
      return response.json();
    },
    onSuccess: (data) => {
      setHasAccepted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/invitations-count"] });
      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte deste rolê.",
      });
      setTimeout(() => {
        setLocation(`/role/${data.eventId}`);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aceitar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!user) {
      localStorage.setItem("pendingInviteToken", token || "");
      setLocation("/entrar");
      return;
    }
    acceptMutation.mutate();
  };

  useEffect(() => {
    const pendingToken = localStorage.getItem("pendingInviteToken");
    if (user && pendingToken === token && !hasAccepted && invitation && invitation.participant.status !== "accepted") {
      localStorage.removeItem("pendingInviteToken");
      acceptMutation.mutate();
    }
  }, [user, token, hasAccepted, invitation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Convite não encontrado</CardTitle>
            <CardDescription>
              Este convite pode ter expirado ou já foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              Ir para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const { participant, event } = invitation;
  const eventInfo = eventTypeInfo[event.eventType] || { label: event.eventType, Icon: Gift };
  const EventIcon = eventInfo.Icon;

  if (participant.status === "accepted" || hasAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Convite aceito!</CardTitle>
            <CardDescription>
              Você já faz parte do rolê "{event.name}"
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation(`/role/${event.id}`)} data-testid="button-go-to-event">
              Ver o rolê
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <EventIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Você foi convidado!</CardTitle>
          <CardDescription>
            {participant.name ? `${participant.name}, você` : "Você"} recebeu um convite para participar de um {eventInfo.label}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg" data-testid="text-event-name">{event.name}</h3>
            
            {event.eventDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-event-date">
                  {format(parseISO(event.eventDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-event-location">{event.location}</span>
              </div>
            )}
            
            {event.description && (
              <p className="text-sm text-muted-foreground" data-testid="text-event-description">
                {event.description}
              </p>
            )}
            
            {event.confirmationDeadline && (() => {
              const deadline = parseISO(event.confirmationDeadline);
              const now = new Date();
              const isExpired = now > deadline;
              const isUrgent = !isExpired && (deadline.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;
              
              return (
                <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                  isExpired 
                    ? 'bg-destructive/10 text-destructive' 
                    : isUrgent 
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'text-muted-foreground'
                }`}>
                  {isExpired ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <span data-testid="text-confirmation-deadline">
                    {isExpired ? (
                      <>Prazo para confirmar encerrou em {format(deadline, "d 'de' MMMM", { locale: ptBR })}</>
                    ) : (
                      <>Confirme até {format(deadline, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</>
                    )}
                  </span>
                </div>
              );
            })()}
          </div>

          {user ? (
            <Button 
              onClick={handleAccept} 
              className="w-full" 
              size="lg"
              disabled={acceptMutation.isPending}
              data-testid="button-accept-invite"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Aceitar convite
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Para aceitar o convite, você precisa estar conectado
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    localStorage.setItem("pendingInviteToken", token || "");
                    setLocation("/entrar");
                  }}
                  className="flex-1"
                  data-testid="button-login"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
                <Button 
                  onClick={() => {
                    localStorage.setItem("pendingInviteToken", token || "");
                    setLocation("/cadastro");
                  }}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-register"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
