import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Gift,
  PartyPopper,
  Heart,
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Settings,
  Eye,
  Loader2,
  UserPlus,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import type { CollaborativeEvent, CollaborativeEventParticipant } from "@shared/schema";

const eventTypeInfo: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  secret_santa: { label: "Amigo Secreto", color: "destructive", Icon: Gift },
  themed_night: { label: "Noite Temática", color: "default", Icon: PartyPopper },
  collective_gift: { label: "Presente Coletivo", color: "secondary", Icon: Heart },
  creative_challenge: { label: "Desafio Criativo", color: "outline", Icon: Sparkles },
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default function RoleDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<CollaborativeEvent>({
    queryKey: ["/api/collab-events", id],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Rolê não encontrado");
        }
        if (response.status === 403) {
          throw new Error("Você não tem permissão para acessar este rolê");
        }
        throw new Error("Erro ao carregar rolê");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<CollaborativeEventParticipant[]>({
    queryKey: ["/api/collab-events", id, "participants"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/participants`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Participantes não encontrados");
        }
        if (response.status === 403) {
          throw new Error("Você não tem permissão para ver os participantes");
        }
        throw new Error("Erro ao carregar participantes");
      }
      return response.json();
    },
    enabled: !!id && !!event,
  });

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/role">
            <Button variant="ghost" size="icon" data-testid="button-back-roles">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Rolê não encontrado</h1>
          </div>
        </div>
        <Card className="p-6 max-w-md">
          <p className="text-muted-foreground">
            {eventError instanceof Error ? eventError.message : "Rolê não encontrado ou você não tem acesso."}
          </p>
          <Link href="/role">
            <Button className="mt-4" data-testid="button-back-to-roles">
              Voltar para Rolês
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const typeInfo = eventTypeInfo[event.eventType] || {
    label: event.eventType,
    color: "default",
    Icon: Calendar,
  };
  const TypeIcon = typeInfo.Icon;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/role">
          <Button variant="ghost" size="icon" data-testid="button-back-roles">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-role-name">{event.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={typeInfo.color as any} data-testid="badge-role-type">
                  {typeInfo.label}
                </Badge>
                <Badge variant="outline" data-testid="badge-role-status">
                  {statusLabels[event.status]}
                </Badge>
                {event.isPublic && (
                  <Badge variant="outline" data-testid="badge-role-public">
                    <Eye className="w-3 h-3 mr-1" />
                    Público
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" data-testid="button-share-role">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" data-testid="button-add-participant">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Eye className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="participants" data-testid="tab-participants">
            <Users className="w-4 h-4 mr-2" />
            Participantes ({participants?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Rolê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.eventDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Data e Hora</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-event-date">
                        {format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Local</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-event-location">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}
                {event.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Descrição</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-event-description">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {event.eventType === "secret_santa" && 
             event.typeSpecificData && 
             typeof event.typeSpecificData === "object" &&
             "budgetLimit" in event.typeSpecificData &&
             typeof (event.typeSpecificData as { budgetLimit?: unknown }).budgetLimit === "number" && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Amigo Secreto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Limite de Orçamento</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-budget-limit">
                      R$ {(event.typeSpecificData as { budgetLimit: number }).budgetLimit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {event.eventType === "secret_santa" && (
            <Card>
              <CardHeader>
                <CardTitle>Status do Sorteio</CardTitle>
                <CardDescription>
                  Realize o sorteio quando todos os participantes confirmarem presença
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Sorteio ainda não realizado
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Funcionalidade será implementada em breve
                    </p>
                  </div>
                  <Button variant="default" disabled data-testid="button-draw-secret-santa">
                    <Gift className="w-4 h-4 mr-2" />
                    Realizar Sorteio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Participantes</CardTitle>
                  <CardDescription>
                    Gerencie os participantes do seu rolê
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" data-testid="button-invite-participants">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {participantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : participantsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-2">
                    {participantsError instanceof Error
                      ? participantsError.message
                      : "Erro ao carregar participantes"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] })}
                    data-testid="button-retry-participants"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : participants && participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                      data-testid={`participant-${participant.id}`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium" data-testid={`text-participant-name-${participant.id}`}>
                          {participant.name || participant.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {participant.role === "owner" ? "Organizador" : "Participante"}
                          </Badge>
                          <Badge
                            variant={
                              participant.status === "accepted"
                                ? "default"
                                : participant.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {participant.status === "accepted"
                              ? "Confirmado"
                              : participant.status === "pending"
                              ? "Pendente"
                              : "Recusado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum participante ainda</p>
                  <Button variant="outline" className="mt-4" data-testid="button-add-first-participant">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Participante
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Rolê</CardTitle>
              <CardDescription>
                Ajuste as configurações do seu rolê
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
