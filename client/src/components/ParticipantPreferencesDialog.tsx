import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Heart, 
  Music, 
  Star, 
  Gift, 
  Clock, 
  Sparkles,
  AlertCircle,
  Tag
} from "lucide-react";

interface UserProfile {
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

interface ParticipantPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantName: string;
  userProfile: UserProfile | null;
}

const labelMap: Record<string, string> = {
  ageRange: "Faixa Etária",
  gender: "Gênero",
  zodiacSign: "Signo",
  giftPreference: "Preferência de Presente",
  freeTimeActivity: "Atividade no Tempo Livre",
  musicalStyle: "Estilo Musical",
  monthlyGiftPreference: "Preferência Mensal de Presente",
  surpriseReaction: "Reação a Surpresas",
  giftPriority: "Prioridade em Presentes",
  giftGivingStyle: "Estilo de Presentear",
  specialTalent: "Talento Especial",
  giftsToAvoid: "Presentes a Evitar",
  interests: "Interesses",
};

const valueTranslations: Record<string, Record<string, string>> = {
  ageRange: {
    "crianca": "Criança (até 12 anos)",
    "adolescente": "Adolescente (13-17 anos)",
    "jovem-adulto": "Jovem Adulto (18-25 anos)",
    "adulto": "Adulto (26-59 anos)",
    "idoso": "Idoso (60+ anos)",
  },
  gender: {
    "masculino": "Masculino",
    "feminino": "Feminino",
    "nao-binario": "Não-binário",
    "prefiro-nao-dizer": "Prefiro não dizer",
  },
  zodiacSign: {
    "aries": "Áries",
    "touro": "Touro",
    "gemeos": "Gêmeos",
    "cancer": "Câncer",
    "leao": "Leão",
    "virgem": "Virgem",
    "libra": "Libra",
    "escorpiao": "Escorpião",
    "sagitario": "Sagitário",
    "capricornio": "Capricórnio",
    "aquario": "Aquário",
    "peixes": "Peixes",
  },
  giftPreference: {
    "util-pratico": "Algo útil e prático",
    "emocional-significativo": "Algo emocional e significativo",
    "experiencia-memoria": "Uma experiência ou memória",
    "surpresa": "Adoro surpresas!",
  },
  freeTimeActivity: {
    "leitura-escrita": "Leitura/Escrita",
    "esportes-exercicios": "Esportes/Exercícios",
    "jogos-games": "Jogos/Games",
    "musica-arte": "Música/Arte",
    "cozinhar": "Cozinhar",
    "viagens-aventuras": "Viagens/Aventuras",
    "filmes-series": "Filmes/Séries",
    "natureza-jardinagem": "Natureza/Jardinagem",
  },
  musicalStyle: {
    "pop": "Pop",
    "rock": "Rock",
    "mpb": "MPB",
    "sertanejo": "Sertanejo",
    "eletronica": "Eletrônica",
    "classica": "Clássica",
    "jazz-blues": "Jazz/Blues",
    "hip-hop-rap": "Hip-hop/Rap",
    "funk": "Funk",
    "outros": "Outros",
  },
  surpriseReaction: {
    "amo-surpresas": "Amo surpresas!",
    "gosto-saber": "Gosto de saber antes",
    "depende": "Depende da situação",
  },
  giftPriority: {
    "qualidade": "Qualidade",
    "quantidade": "Quantidade",
    "equilibrio": "Equilíbrio entre os dois",
  },
  giftGivingStyle: {
    "planejado": "Planejado com antecedência",
    "ultima-hora": "De última hora",
    "espontaneo": "Espontâneo",
  },
};

const iconMap: Record<string, typeof User> = {
  ageRange: User,
  gender: User,
  zodiacSign: Star,
  giftPreference: Gift,
  freeTimeActivity: Clock,
  musicalStyle: Music,
  surpriseReaction: Sparkles,
  giftPriority: Heart,
  giftsToAvoid: AlertCircle,
  interests: Tag,
};

function translateValue(key: string, value: string | null): string {
  if (!value) return "Não informado";
  const translations = valueTranslations[key];
  if (translations && translations[value]) {
    return translations[value];
  }
  return value;
}

export function ParticipantPreferencesDialog({
  open,
  onOpenChange,
  participantName,
  userProfile,
}: ParticipantPreferencesDialogProps) {
  if (!userProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de {participantName}</DialogTitle>
            <DialogDescription>
              Este participante ainda não preencheu suas preferências.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const profileEntries = Object.entries(userProfile).filter(
    ([key, value]) => key !== "interests" && value !== null && value !== ""
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Preferências de {participantName}
          </DialogTitle>
          <DialogDescription>
            Informações preenchidas pelo participante para ajudar na escolha do presente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {userProfile.interests && userProfile.interests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Interesses
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-interest-${index}`}>
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {userProfile.interests && userProfile.interests.length > 0 && profileEntries.length > 0 && (
            <Separator />
          )}

          <div className="grid gap-3">
            {profileEntries.map(([key, value]) => {
              const Icon = iconMap[key] || User;
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{labelMap[key] || key}</p>
                    <p className="text-sm text-muted-foreground">
                      {translateValue(key, value as string)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {userProfile.giftsToAvoid && (
            <>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-destructive flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Presentes a Evitar
                </h4>
                <p className="text-sm text-muted-foreground">
                  {userProfile.giftsToAvoid}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
