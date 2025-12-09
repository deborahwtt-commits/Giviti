import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AddParticipantDialog } from "@/components/AddParticipantDialog";
import { ParticipantPreferencesDialog } from "@/components/ParticipantPreferencesDialog";
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
  Trash2,
  MoreVertical,
  Check,
  Clock,
  X,
  Mail,
  Save,
  DollarSign,
  FileText,
  ClipboardCheck,
  Music,
  Home,
  Lightbulb,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import type { CollaborativeEvent, CollaborativeEventParticipant } from "@shared/schema";

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

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

interface SecretSantaRules {
  minGiftValue?: number | null;
  maxGiftValue?: number | null;
  rulesDescription?: string | null;
}

interface EnrichedPair {
  id: string;
  eventId: string;
  giverParticipantId: string;
  receiverParticipantId: string;
  isRevealed: boolean;
  giver: CollaborativeEventParticipant;
  receiver: CollaborativeEventParticipant;
}

interface MyPairResponse {
  pair: {
    id: string;
    eventId: string;
    giverParticipantId: string;
    receiverParticipantId: string;
    isRevealed: boolean;
  };
  receiver: CollaborativeEventParticipant;
}

interface ParticipantUserProfile {
  ageRange: string | null;
  gender: string | null;
  zodiacSign: string | null;
  giftPreference: string | null;
  freeTimeActivity: string | null;
  musicalStyle: string | null;
  monthlyGiftPreference: string | null;
  surpriseReaction: string | null;
  giftPriority: string | null;
  giftGivingStyle: string | null;
  specialTalent: string | null;
  giftsToAvoid: string | null;
  interests: string[] | null;
}

interface ParticipantWithProfile extends CollaborativeEventParticipant {
  hasFilledProfile: boolean;
  userProfile: ParticipantUserProfile | null;
}

export default function RoleDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [confirmDrawOpen, setConfirmDrawOpen] = useState(false);
  const [selectedParticipantForProfile, setSelectedParticipantForProfile] = useState<ParticipantWithProfile | null>(null);
  
  const [minGiftValue, setMinGiftValue] = useState<string>("");
  const [maxGiftValue, setMaxGiftValue] = useState<string>("");
  const [rulesDescription, setRulesDescription] = useState<string>("");

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

  const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<ParticipantWithProfile[]>({
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

  // Fetch themed night category if applicable
  const { data: themedCategory } = useQuery<{ id: string; name: string; description: string | null }>({
    queryKey: ["/api/themed-night-categories", event?.themedNightCategoryId],
    enabled: !!event && event.eventType === "themed_night" && !!event.themedNightCategoryId,
  });

  // Fetch themed night suggestions for the category
  const { data: themedSuggestions } = useQuery<Array<{
    id: string;
    categoryId: string;
    title: string;
    suggestionType: string;
    content: string | null;
    mediaUrl: string | null;
    priority: number | null;
    tags: string[] | null;
  }>>({
    queryKey: ["/api/themed-night-categories", event?.themedNightCategoryId, "suggestions"],
    enabled: !!event && event.eventType === "themed_night" && !!event.themedNightCategoryId,
  });

  // Calculate if current user is owner
  const isOwner = event && user && event.ownerId === user.id;

  // Owner-only query: draw status is restricted to event owners
  const { data: drawStatus, isLoading: drawStatusLoading } = useQuery<{
    isDrawPerformed: boolean;
    pairsCount?: number;
    confirmedParticipantsCount?: number;
    totalParticipantsCount?: number;
    isOwner: boolean;
  }>({
    queryKey: ["/api/collab-events", id, "draw-status"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/draw-status`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao verificar status do sorteio");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && isOwner,
  });

  // Query: All pairs (owner only) - for displaying in Overview after draw
  const { data: allPairs, isLoading: allPairsLoading } = useQuery<EnrichedPair[]>({
    queryKey: ["/api/collab-events", id, "pairs"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/pairs`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar pares");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && isOwner && drawStatus?.isDrawPerformed === true,
  });

  // Query: My pair (participant view) - for non-owners to see who they got
  const { data: myPair, isLoading: myPairLoading } = useQuery<MyPairResponse>({
    queryKey: ["/api/collab-events", id, "my-pair"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/my-pair`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Erro ao buscar seu par");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && !isOwner,
  });

  // State for confirming redraw
  const [confirmRedrawOpen, setConfirmRedrawOpen] = useState(false);

  useEffect(() => {
    if (event && event.eventType === "secret_santa" && event.typeSpecificData) {
      const data = event.typeSpecificData as SecretSantaRules;
      setMinGiftValue(data.minGiftValue?.toString() || "");
      setMaxGiftValue(data.maxGiftValue?.toString() || "");
      setRulesDescription(data.rulesDescription || "");
    }
  }, [event]);

  const saveRulesMutation = useMutation({
    mutationFn: async (rules: SecretSantaRules) => {
      return await apiRequest(`/api/collab-events/${id}`, "PATCH", {
        typeSpecificData: rules
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Regras salvas",
        description: "As regras do Amigo Secreto foram atualizadas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar regras",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveRules = () => {
    const rules: SecretSantaRules = {
      minGiftValue: minGiftValue ? parseFloat(minGiftValue) : null,
      maxGiftValue: maxGiftValue ? parseFloat(maxGiftValue) : null,
      rulesDescription: rulesDescription || null,
    };
    saveRulesMutation.mutate(rules);
  };

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Participante removido",
        description: "O participante foi removido com sucesso.",
      });
      setParticipantToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover participante",
        description: error.message,
        variant: "destructive",
      });
      setParticipantToRemove(null);
    },
  });

  const updateParticipantStatusMutation = useMutation({
    mutationFn: async ({ participantId, status }: { participantId: string; status: "pending" | "accepted" | "declined" }) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Status atualizado",
        description: "O status do participante foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}/resend-invite`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Convite reenviado",
        description: "O email de convite foi reenviado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const performDrawMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/collab-events/${id}/draw`, "POST", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "pairs"] });
      
      let description = data.message || "O sorteio foi realizado com sucesso.";
      if (data.emailsSent !== undefined && data.emailsSent > 0) {
        description += ` ${data.emailsSent} email(s) enviado(s) aos participantes.`;
      }
      
      toast({
        title: "Sorteio realizado!",
        description,
      });
      setConfirmDrawOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao realizar sorteio",
        description: error.message,
        variant: "destructive",
      });
      setConfirmDrawOpen(false);
    },
  });

  const deletePairsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/collab-events/${id}/pairs`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "pairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "my-pair"] });
      toast({
        title: "Pares removidos",
        description: "Os pares foram removidos. Você pode realizar um novo sorteio.",
      });
      setConfirmRedrawOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover pares",
        description: error.message,
        variant: "destructive",
      });
      setConfirmRedrawOpen(false);
    },
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
    className: "",
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

  const budgetLimit =
    event.eventType === "secret_santa" &&
    event.typeSpecificData &&
    typeof event.typeSpecificData === "object" &&
    "budgetLimit" in event.typeSpecificData &&
    typeof (event.typeSpecificData as { budgetLimit?: unknown }).budgetLimit === "number"
      ? (event.typeSpecificData as { budgetLimit: number }).budgetLimit
      : null;

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
                <Badge variant="outline" className={typeInfo.className} data-testid="badge-role-type">
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
                {event.eventType === "themed_night" && themedCategory && (
                  <div className="flex items-start gap-3">
                    <PartyPopper className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Qual é a boa?</p>
                      <p className="text-sm font-semibold" data-testid="text-themed-category-name">
                        {themedCategory.name}
                      </p>
                      {themedCategory.description && (
                        <p className="text-sm text-muted-foreground mt-1" data-testid="text-themed-category-description">
                          {themedCategory.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Themed Night Suggestions Card */}
            {event.eventType === "themed_night" && themedSuggestions && themedSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Sugestões para o Rolê
                  </CardTitle>
                  <CardDescription>
                    Dicas e ideias para tornar sua noite ainda mais especial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group by suggestion type */}
                  {['produto', 'ambiente', 'atividade', 'playlist'].map((type) => {
                    const suggestionsOfType = themedSuggestions.filter(s => s.suggestionType === type);
                    if (suggestionsOfType.length === 0) return null;
                    
                    const typeLabels: Record<string, { label: string; Icon: LucideIcon }> = {
                      produto: { label: 'Produtos', Icon: ShoppingBag },
                      ambiente: { label: 'Ambiente', Icon: Home },
                      atividade: { label: 'Atividades', Icon: Sparkles },
                      playlist: { label: 'Playlists', Icon: Music },
                    };
                    
                    const { label, Icon } = typeLabels[type] || { label: type, Icon: Lightbulb };
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{label}</span>
                        </div>
                        <div className="grid gap-2 pl-6">
                          {suggestionsOfType.map((suggestion) => (
                            <div 
                              key={suggestion.id} 
                              className="p-3 rounded-md bg-muted/50 hover-elevate"
                              data-testid={`suggestion-${suggestion.id}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{suggestion.title}</p>
                                  {suggestion.content && (
                                    <p className="text-sm text-muted-foreground mt-1">{suggestion.content}</p>
                                  )}
                                  {suggestion.tags && suggestion.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {suggestion.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {suggestion.mediaUrl && (
                                  <a 
                                    href={suggestion.mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <Button size="icon" variant="ghost">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {event.eventType === "secret_santa" && (() => {
              const rules = event.typeSpecificData as SecretSantaRules | null;
              const hasRules = rules && (rules.minGiftValue || rules.maxGiftValue || rules.rulesDescription);
              
              if (!hasRules && !isOwner) return null;
              
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Regras do Amigo Secreto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(rules?.minGiftValue || rules?.maxGiftValue) && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Faixa de Valor do Presente</p>
                          <p className="text-lg font-semibold text-primary" data-testid="text-gift-value-range">
                            {rules?.minGiftValue && rules?.maxGiftValue ? (
                              <>R$ {rules.minGiftValue} - R$ {rules.maxGiftValue}</>
                            ) : rules?.minGiftValue ? (
                              <>A partir de R$ {rules.minGiftValue}</>
                            ) : (
                              <>Até R$ {rules?.maxGiftValue}</>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {rules?.rulesDescription && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Regras</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-rules-description">
                            {rules.rulesDescription}
                          </p>
                        </div>
                      </div>
                    )}
                    {!hasRules && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma regra definida ainda. {isOwner && "Vá em Configurações para definir as regras."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {event.eventType === "secret_santa" && isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Status do Sorteio</CardTitle>
                <CardDescription>
                  Realize o sorteio quando todos os participantes confirmarem presença
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drawStatusLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drawStatus && drawStatus.isDrawPerformed ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-500">
                              Sorteio realizado!
                            </p>
                            {drawStatus.isOwner && drawStatus.pairsCount && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {drawStatus.pairsCount} pares criados
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              Concluído
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Display pairs for owner */}
                        {allPairsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : allPairs && allPairs.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm font-medium">Pares do Sorteio:</p>
                            <div className="space-y-2">
                              {allPairs.map((pair) => (
                                <div 
                                  key={pair.id} 
                                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                  data-testid={`pair-${pair.id}`}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(pair.giver?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {pair.giver?.name || "Participante"}
                                    </p>
                                  </div>
                                  <Gift className="w-4 h-4 text-primary" />
                                  <div className="flex-1 text-right">
                                    <p className="text-sm font-medium">
                                      {pair.receiver?.name || "Participante"}
                                    </p>
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(pair.receiver?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Redraw button */}
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setConfirmRedrawOpen(true)}
                            className="w-full"
                            data-testid="button-redraw-secret-santa"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Realizar Novo Sorteio
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {drawStatus?.isOwner ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Sorteio ainda não realizado
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {drawStatus?.confirmedParticipantsCount || 0} participante(s) confirmado(s)
                                {(drawStatus?.confirmedParticipantsCount || 0) < 3 && 
                                  " (mínimo: 3)"}
                              </p>
                            </div>
                            <Button 
                              variant="default" 
                              onClick={() => setConfirmDrawOpen(true)}
                              disabled={(drawStatus?.confirmedParticipantsCount || 0) < 3}
                              data-testid="button-draw-secret-santa"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Realizar Sorteio
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Aguardando o organizador realizar o sorteio
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participant view: show their assigned pair */}
          {event.eventType === "secret_santa" && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Seu Amigo Secreto
                </CardTitle>
                <CardDescription>
                  Descubra quem você tirou no sorteio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myPairLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : myPair && myPair.receiver ? (
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-primary/5">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {getInitials(myPair.receiver.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold" data-testid="text-my-pair-name">
                        {myPair.receiver.name || "Participante"}
                      </p>
                      {myPair.receiver.email && (
                        <p className="text-sm text-muted-foreground" data-testid="text-my-pair-email">
                          {myPair.receiver.email}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-sm text-muted-foreground">
                      O sorteio ainda não foi realizado. Aguarde o organizador.
                    </p>
                  </div>
                )}
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
                {event?.eventType === "secret_santa" && drawStatus?.isDrawPerformed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          data-testid="button-invite-participants"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Convidar
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Realize um novo sorteio para adicionar participantes</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddParticipantOpen(true)}
                    data-testid="button-invite-participants"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                )}
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium" data-testid={`text-participant-name-${participant.id}`}>
                            {participant.name || participant.email}
                          </p>
                          {participant.hasFilledProfile && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSelectedParticipantForProfile(participant)}
                                  className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                                  data-testid={`button-view-profile-${participant.id}`}
                                >
                                  <ClipboardCheck className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver preferências</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {participant.name && participant.email && (
                            <span className="text-sm text-muted-foreground truncate" data-testid={`text-participant-email-${participant.id}`}>
                              ({participant.email})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                            data-testid={`badge-participant-status-${participant.id}`}
                          >
                            {participant.status === "accepted"
                              ? "Confirmado"
                              : participant.status === "pending"
                              ? "Pendente"
                              : "Recusado"}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-participant-menu-${participant.id}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => updateParticipantStatusMutation.mutate({
                              participantId: participant.id,
                              status: "accepted"
                            })}
                            disabled={updateParticipantStatusMutation.isPending || participant.status === "accepted"}
                            data-testid={`menu-item-accept-${participant.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateParticipantStatusMutation.mutate({
                              participantId: participant.id,
                              status: "pending"
                            })}
                            disabled={updateParticipantStatusMutation.isPending || participant.status === "pending"}
                            data-testid={`menu-item-pending-${participant.id}`}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Marcar Pendente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateParticipantStatusMutation.mutate({
                              participantId: participant.id,
                              status: "declined"
                            })}
                            disabled={updateParticipantStatusMutation.isPending || participant.status === "declined"}
                            data-testid={`menu-item-decline-${participant.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Recusar
                          </DropdownMenuItem>
                          {participant.email && (
                            <DropdownMenuItem
                              onClick={() => resendInviteMutation.mutate(participant.id)}
                              disabled={resendInviteMutation.isPending}
                              data-testid={`menu-item-resend-invite-${participant.id}`}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Reenviar convite
                            </DropdownMenuItem>
                          )}
                          {participant.role !== "owner" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setParticipantToRemove(participant.id)}
                                className="text-destructive focus:text-destructive"
                                data-testid={`menu-item-remove-${participant.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum participante ainda</p>
                  {event?.eventType === "secret_santa" && drawStatus?.isDrawPerformed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            className="mt-4"
                            disabled
                            data-testid="button-add-first-participant"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Adicionar Primeiro Participante
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Realize um novo sorteio para adicionar participantes</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddParticipantOpen(true)}
                      data-testid="button-add-first-participant"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Participante
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {event?.eventType === "secret_santa" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Regras do Amigo Secreto
                </CardTitle>
                <CardDescription>
                  Defina o valor do presente e outras regras para os participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minGiftValue" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Valor Mínimo (R$)
                    </Label>
                    <Input
                      id="minGiftValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 50,00"
                      value={minGiftValue}
                      onChange={(e) => setMinGiftValue(e.target.value)}
                      data-testid="input-min-gift-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGiftValue" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Valor Máximo (R$)
                    </Label>
                    <Input
                      id="maxGiftValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 100,00"
                      value={maxGiftValue}
                      onChange={(e) => setMaxGiftValue(e.target.value)}
                      data-testid="input-max-gift-value"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rulesDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Descrição das Regras
                  </Label>
                  <Textarea
                    id="rulesDescription"
                    placeholder="Descreva as regras do seu Amigo Secreto... Ex: 'Não vale presente repetido, vale presente caseiro, etc.'"
                    rows={4}
                    value={rulesDescription}
                    onChange={(e) => setRulesDescription(e.target.value)}
                    data-testid="textarea-rules-description"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveRules}
                    disabled={saveRulesMutation.isPending}
                    data-testid="button-save-rules"
                  >
                    {saveRulesMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Regras
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste as configurações do seu rolê
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Outras configurações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddParticipantDialog
        eventId={id!}
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
      />

      <AlertDialog open={confirmDrawOpen} onOpenChange={setConfirmDrawOpen}>
        <AlertDialogContent data-testid="dialog-confirm-draw">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Sorteio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja realizar o sorteio do Amigo Secreto? Todos os participantes confirmados serão incluídos.
              <br /><br />
              <strong>Participantes confirmados:</strong> {drawStatus?.confirmedParticipantsCount || 0}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-draw">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => performDrawMutation.mutate()}
              disabled={performDrawMutation.isPending}
              data-testid="button-confirm-draw"
            >
              {performDrawMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Realizar Sorteio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRedrawOpen} onOpenChange={setConfirmRedrawOpen}>
        <AlertDialogContent data-testid="dialog-confirm-redraw">
          <AlertDialogHeader>
            <AlertDialogTitle>Realizar Novo Sorteio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja refazer o sorteio? Os pares atuais serão apagados e um novo sorteio será necessário.
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-redraw">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePairsMutation.mutate()}
              disabled={deletePairsMutation.isPending}
              data-testid="button-confirm-redraw"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePairsMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Apagar Pares
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={participantToRemove !== null}
        onOpenChange={(open) => !open && setParticipantToRemove(null)}
      >
        <AlertDialogContent data-testid="dialog-confirm-remove-participant">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Participante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este participante? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => participantToRemove && removeParticipantMutation.mutate(participantToRemove)}
              disabled={removeParticipantMutation.isPending}
              data-testid="button-confirm-remove"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeParticipantMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ParticipantPreferencesDialog
        open={selectedParticipantForProfile !== null}
        onOpenChange={(open) => !open && setSelectedParticipantForProfile(null)}
        participantName={selectedParticipantForProfile?.name || "Participante"}
        userProfile={selectedParticipantForProfile?.userProfile || null}
      />
    </div>
  );
}
