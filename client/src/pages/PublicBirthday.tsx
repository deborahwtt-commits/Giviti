import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
} from "lucide-react";

interface PublicBirthdayData {
  event: {
    id: string;
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
  }>;
}

export default function PublicBirthday() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<PublicBirthdayData>({
    queryKey: ["/api/birthday", token],
    enabled: !!token,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ rsvpStatus }: { rsvpStatus: string }) => {
      const response = await apiRequest(`/api/birthday/${token}/rsvp`, "POST", {
        email: email.trim().toLowerCase(),
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
      toast({
        title: "Erro",
        description: error.message || "Não foi possível confirmar sua presença",
        variant: "destructive",
      });
    },
  });

  const formatEventDate = (date: string | null) => {
    if (!date) return "Sem data definida";
    try {
      return format(parseISO(date), "d 'de' MMMM", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getZodiacEmoji = (sign: string | null) => {
    const signs: Record<string, string> = {
      "Áries": "♈",
      "Aries": "♈",
      "Touro": "♉",
      "Taurus": "♉",
      "Gêmeos": "♊",
      "Gemini": "♊",
      "Câncer": "♋",
      "Cancer": "♋",
      "Leão": "♌",
      "Leo": "♌",
      "Virgem": "♍",
      "Virgo": "♍",
      "Libra": "♎",
      "Escorpião": "♏",
      "Scorpio": "♏",
      "Sagitário": "♐",
      "Sagittarius": "♐",
      "Capricórnio": "♑",
      "Capricorn": "♑",
      "Aquário": "♒",
      "Aquarius": "♒",
      "Peixes": "♓",
      "Pisces": "♓",
    };
    return sign ? signs[sign] || "" : "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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

  const { event, owner, profile, wishlist } = data;
  const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(" ") || "Aniversariante";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Cake className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {event.eventName || `Aniversário de ${fullName}`}
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatEventDate(event.eventDate)}</span>
            </div>
            {event.eventDescription && (
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                {event.eventDescription}
              </p>
            )}
          </div>
        </Card>

        {profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Sobre {owner.firstName || "mim"}
              </CardTitle>
              <CardDescription>
                Conheça um pouco mais para escolher o presente perfeito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.zodiacSign && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getZodiacEmoji(profile.zodiacSign)}</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Signo</p>
                      <p className="font-medium">{profile.zodiacSign}</p>
                    </div>
                  </div>
                )}
                {profile.freeTimeActivity && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo livre</p>
                      <p className="font-medium">{profile.freeTimeActivity}</p>
                    </div>
                  </div>
                )}
                {profile.musicalStyle && (
                  <div className="flex items-start gap-3">
                    <Music className="h-5 w-5 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estilo musical</p>
                      <p className="font-medium">{profile.musicalStyle}</p>
                    </div>
                  </div>
                )}
                {profile.specialTalent && (
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Talento especial</p>
                      <p className="font-medium">{profile.specialTalent}</p>
                    </div>
                  </div>
                )}
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Interesses</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.giftPreference && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Preferência de presente</p>
                  <p className="font-medium">{profile.giftPreference}</p>
                </div>
              )}

              {profile.giftsToAvoid && (
                <div className="mt-4 p-3 bg-destructive/5 rounded-lg">
                  <p className="text-sm text-destructive">Evitar</p>
                  <p className="text-muted-foreground">{profile.giftsToAvoid}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              <div className="space-y-4">
                {wishlist
                  .sort((a, b) => b.priority - a.priority)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover-elevate"
                    >
                      <div className="flex items-start gap-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3">
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
                                >
                                  Ver produto
                                  <ExternalLink className="h-3 w-3 ml-2" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              Confirme sua presença!
            </CardTitle>
            <CardDescription>
              Informe seu email para confirmar se você irá ao evento
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
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => rsvpMutation.mutate({ rsvpStatus: "yes" })}
                    disabled={!email.trim() || rsvpMutation.isPending}
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
                    disabled={!email.trim() || rsvpMutation.isPending}
                    data-testid="button-rsvp-maybe"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Talvez
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-muted-foreground"
                    onClick={() => rsvpMutation.mutate({ rsvpStatus: "no" })}
                    disabled={!email.trim() || rsvpMutation.isPending}
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

        <Card className="mt-8 border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-semibold text-lg mb-2">Quer facilitar sua vida nas próximas festas?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Crie sua conta grátis no Giviti e nunca mais esqueça um aniversário importante! 
              Além de organizar seus próprios eventos, você pode criar listas de desejos, 
              receber lembretes e descobrir o presente perfeito para cada pessoa especial na sua vida. 
              É rápido, é grátis, e seu futuro eu agradece! 😉
            </p>
            <Link href="/">
              <Button className="gap-2" data-testid="button-create-account">
                <Sparkles className="w-4 h-4" />
                Criar minha conta grátis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Página criada com Giviti
        </p>
      </div>
    </div>
  );
}
