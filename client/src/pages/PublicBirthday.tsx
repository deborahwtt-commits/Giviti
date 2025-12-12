import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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

  const { data, isLoading, error } = useQuery<PublicBirthdayData>({
    queryKey: ["/api/birthday", token],
    enabled: !!token,
  });

  const formatEventDate = (date: string | null) => {
    if (!date) return "Sem data definida";
    try {
      return format(new Date(date), "d 'de' MMMM", { locale: ptBR });
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

        <p className="text-center text-sm text-muted-foreground mt-8">
          Página criada com Giviti
        </p>
      </div>
    </div>
  );
}
