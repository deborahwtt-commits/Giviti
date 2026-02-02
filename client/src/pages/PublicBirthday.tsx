import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Cake,
  Calendar,
  Gift,
  ExternalLink,
  Star,
  Music,
  Sparkles,
  Heart,
  Loader2,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  PartyPopper,
  User,
  Eye,
  Users,
  MapPin,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface PublicBirthdayData {
  event: {
    id: string;
    userId: string;
    eventName: string | null;
    eventDate: string | null;
    eventLocation: string | null;
    eventDescription: string | null;
  };
  owner: {
    firstName: string | null;
    lastName: string | null;
  };
  profile: {
    zodiacSign: string | null;
    giftPreference: string | null;
    freeTimeActivity: string | null;
    musicalStyle: string | null;
    specialTalent: string | null;
    giftsToAvoid: string | null;
    interests: string[] | null;
  } | null;
  wishlist: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    purchaseUrl: string | null;
    price: string | null;
    priority: number;
    isReserved: boolean;
    isReceived: boolean;
  }>;
  guests?: Array<{
    id: string;
    name: string | null;
    email: string;
    rsvpStatus: string | null;
  }>;
}

export default function PublicBirthday() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);
  
  const isLoggedIn = !!user?.email;
  
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const { data, isLoading, error } = useQuery<PublicBirthdayData>({
    queryKey: ["/api/birthday", token],
    enabled: !!token,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ rsvpStatus }: { rsvpStatus: string }) => {
      const emailToUse = email.trim() || user?.email || "";
      const response = await apiRequest(`/api/birthday/${token}/rsvp`, "POST", {
        email: emailToUse.toLowerCase(),
        rsvpStatus,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setConfirmedStatus(data.rsvpStatus);
      toast({
        title: "Presença confirmada!",
        description: data.rsvpStatus === "yes" 
          ? "Obrigado por confirmar! Nos vemos lá!" 
          : data.rsvpStatus === "no"
          ? "Que pena! Sentiremos sua falta."
          : "Entendemos! Esperamos que possa vir.",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Não foi possível confirmar sua presença";
      
      try {
        if (typeof error.message === "string") {
          if (error.message.includes("{")) {
            const parsed = JSON.parse(error.message.replace(/^\d+:\s*/, ""));
            errorMessage = parsed.message || errorMessage;
          } else {
            errorMessage = error.message;
          }
        }
      } catch {
        if (error.message) {
          errorMessage = error.message.replace(/^\d+:\s*/, "").replace(/[{}\"]/g, "").replace("message:", "").trim();
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const reserveItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/birthday/${token}/wishlist/${itemId}/reserve`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/birthday", token] });
      toast({
        title: "Item reservado!",
        description: "Você reservou este presente. Lembre-se de comprá-lo!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível reservar o item.",
        variant: "destructive",
      });
    },
  });

  const formatEventDate = (date: string | null) => {
    if (!date) return "Sem data definida";
    try {
      return format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">Página não encontrada</h2>
            <p className="text-muted-foreground">
              Este link de aniversário pode ter expirado ou não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { event, owner, profile, wishlist, guests } = data;
  const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || "Aniversariante";
  const isOwner = user?.id === event.userId;
  
  const eventTitle = event.eventName && event.eventName.trim().length > 3 
    ? event.eventName 
    : `Aniversário de ${fullName}`;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "yes":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"><Check className="w-3 h-3 mr-1" />Confirmado</Badge>;
      case "no":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Recusado</Badge>;
      case "maybe":
        return <Badge variant="secondary"><HelpCircle className="w-3 h-3 mr-1" />Talvez</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold" data-testid="text-event-name">{eventTitle}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800" data-testid="badge-event-type">
                  Aniversário
                </Badge>
                <Badge variant="outline" data-testid="badge-event-status">
                  Ativo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Eye className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="guests" data-testid="tab-guests">
              <Users className="w-4 h-4 mr-2" />
              Convidados ({guests?.length || 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PartyPopper className="w-4 h-4 text-pink-500" />
                  Detalhes do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{formatEventDate(event.eventDate)}</p>
                  </div>
                </div>
                
                {event.eventLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-medium">{event.eventLocation}</p>
                    </div>
                  </div>
                )}
                
                {event.eventDescription && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="font-medium">{event.eventDescription}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Card */}
            {profile && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-pink-500" />
                    Sobre {owner.firstName || "o Aniversariante"}
                  </CardTitle>
                  <CardDescription>
                    Dicas para escolher o presente ideal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.zodiacSign && (
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-indigo-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Signo</p>
                          <p className="text-sm font-medium">{profile.zodiacSign}</p>
                        </div>
                      </div>
                    )}
                    {profile.freeTimeActivity && (
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tempo livre</p>
                          <p className="text-sm font-medium">{profile.freeTimeActivity}</p>
                        </div>
                      </div>
                    )}
                    {profile.musicalStyle && (
                      <div className="flex items-start gap-2">
                        <Music className="w-4 h-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Estilo musical</p>
                          <p className="text-sm font-medium">{profile.musicalStyle}</p>
                        </div>
                      </div>
                    )}
                    {profile.specialTalent && (
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Talento especial</p>
                          <p className="text-sm font-medium">{profile.specialTalent}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Interesses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.giftPreference && (
                    <div className="p-2.5 bg-primary/5 rounded-md">
                      <p className="text-xs text-muted-foreground">Preferência de presente</p>
                      <p className="text-sm font-medium">{profile.giftPreference}</p>
                    </div>
                  )}

                  {profile.giftsToAvoid && (
                    <div className="p-2.5 bg-destructive/5 rounded-md">
                      <p className="text-xs text-destructive">Evitar</p>
                      <p className="text-sm text-muted-foreground">{profile.giftsToAvoid}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Wishlist Card - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gift className="h-5 w-5 text-primary" />
                Lista de Desejos
              </CardTitle>
              <CardDescription>
                {wishlist.length > 0
                  ? `${owner.firstName || "O aniversariante"} gostaria de receber:`
                  : "Nenhum item na lista de desejos ainda"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>A lista de desejos está vazia.</p>
                </div>
              ) : (
                <>
                  {isOwner && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progresso da lista</span>
                        <span className="text-sm font-medium">
                          {wishlist.filter(item => item.isReceived || item.isReserved).length} de {wishlist.length} itens
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ 
                            width: `${(wishlist.filter(item => item.isReceived || item.isReserved).length / wishlist.length) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          {wishlist.filter(item => item.isReceived).length} recebido(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {wishlist.filter(item => item.isReserved && !item.isReceived).length} reservado(s)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {wishlist
                      .sort((a, b) => b.priority - a.priority)
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg hover-elevate ${item.isReceived || item.isReserved ? "opacity-60" : ""}`}
                          data-testid={`wishlist-item-${item.id}`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm" data-testid={`text-wishlist-title-${item.id}`}>{item.title}</span>
                                {item.price ? (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                    Presente
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                    Gratuito
                                  </Badge>
                                )}
                                {item.isReserved && !item.isReceived && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                    Reservado
                                  </Badge>
                                )}
                                {item.isReceived && (
                                  <Badge variant="default" className="bg-green-500">
                                    Recebido
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {item.price && (
                              <Badge variant="secondary">{item.price}</Badge>
                            )}
                            {item.purchaseUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={item.purchaseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    navigator.sendBeacon(`/api/wishlist-click/${item.id}`);
                                  }}
                                  data-testid={`link-wishlist-item-${item.id}`}
                                >
                                  Ver produto
                                  <ExternalLink className="h-3 w-3 ml-2" />
                                </a>
                              </Button>
                            )}
                            {!item.isReserved && !item.isReceived && !isOwner && (
                              <Button
                                size="sm"
                                onClick={() => reserveItemMutation.mutate(item.id)}
                                disabled={reserveItemMutation.isPending}
                                data-testid={`button-reserve-item-${item.id}`}
                              >
                                {reserveItemMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Gift className="h-4 w-4 mr-2" />
                                )}
                                Vou dar este
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* RSVP Card - Only for non-owners */}
          {!isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PartyPopper className="h-5 w-5 text-primary" />
                  Confirme sua presença!
                </CardTitle>
                <CardDescription>
                  {isLoggedIn 
                    ? "Clique em uma opção para confirmar sua presença"
                    : "Informe seu email para confirmar se você irá ao evento"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {confirmedStatus ? (
                  <div className="text-center py-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      confirmedStatus === "yes" 
                        ? "bg-green-100 dark:bg-green-900" 
                        : confirmedStatus === "no"
                        ? "bg-red-100 dark:bg-red-900"
                        : "bg-amber-100 dark:bg-amber-900"
                    }`}>
                      {confirmedStatus === "yes" && <Check className="h-8 w-8 text-green-600 dark:text-green-400" />}
                      {confirmedStatus === "no" && <X className="h-8 w-8 text-red-600 dark:text-red-400" />}
                      {confirmedStatus === "maybe" && <HelpCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <p className="font-medium text-lg">
                      {confirmedStatus === "yes" && "Você confirmou presença!"}
                      {confirmedStatus === "no" && "Você não poderá comparecer"}
                      {confirmedStatus === "maybe" && "Talvez você compareça"}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {owner.firstName || "O aniversariante"} foi notificado(a) da sua resposta.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setConfirmedStatus(null)}
                      data-testid="button-change-rsvp"
                    >
                      Alterar resposta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!isLoggedIn && (
                      <div className="space-y-2">
                        <Label htmlFor="guest-email">Seu email</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          placeholder="Digite o email que recebeu o convite"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          data-testid="input-rsvp-email"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use o mesmo email que recebeu o convite
                        </p>
                      </div>
                    )}
                    
                    <div className={`flex flex-col sm:flex-row gap-3 ${!isLoggedIn ? 'pt-2' : ''}`}>
                      <Button
                        className="flex-1 bg-green-600"
                        onClick={() => rsvpMutation.mutate({ rsvpStatus: "yes" })}
                        disabled={rsvpMutation.isPending || (!isLoggedIn && !email.trim())}
                        data-testid="button-rsvp-yes"
                      >
                        {rsvpMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Sim, estarei lá!
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => rsvpMutation.mutate({ rsvpStatus: "maybe" })}
                        disabled={rsvpMutation.isPending || (!isLoggedIn && !email.trim())}
                        data-testid="button-rsvp-maybe"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Talvez
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-muted-foreground"
                        onClick={() => rsvpMutation.mutate({ rsvpStatus: "no" })}
                        disabled={rsvpMutation.isPending || (!isLoggedIn && !email.trim())}
                        data-testid="button-rsvp-no"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Não poderei ir
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Promo Card - Only for non-logged users */}
          {!isLoggedIn && (
            <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quer facilitar sua vida nas próximas festas?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Crie sua conta no Giviti e nunca mais esqueça de um aniversário importante!
                </p>
                <Link href="/waitlist">
                  <Button data-testid="button-join-waitlist">
                    Entrar na lista de espera
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guests Tab - Only for Owner */}
        {isOwner && (
          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-5 w-5 text-primary" />
                  Convidados ({guests?.length || 0})
                </CardTitle>
                <CardDescription>
                  Acompanhe quem confirmou presença no seu aniversário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!guests || guests.length === 0) ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum convidado adicionado ainda.</p>
                    <p className="text-sm mt-2">Adicione convidados na página de gerenciamento do evento.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`card-guest-${guest.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {(guest.name || guest.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium" data-testid={`text-guest-name-${guest.id}`}>{guest.name || guest.email}</p>
                            {guest.name && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-guest-email-${guest.id}`}>{guest.email}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(guest.rsvpStatus)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
