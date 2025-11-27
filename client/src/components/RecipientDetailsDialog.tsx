import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, User, Cake, Users, Star, Heart, MapPin } from "lucide-react";
import type { Recipient, RecipientProfile } from "@shared/schema";
import AutoSuggestions from "./AutoSuggestions";

interface RecipientDetailsDialogProps {
  recipient: Recipient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (recipient: Recipient) => void;
}

const PROFILE_LABELS: Record<string, string> = {
  ageRange: "Faixa etária",
  gender: "Sexo",
  zodiacSign: "Signo zodiacal",
  relationship: "Tipo de relacionamento",
  giftPreference: "Tipo de presente preferido",
  lifestyle: "Estilo de vida",
  interestCategory: "Principal categoria de interesse",
  giftReceptionStyle: "Como gosta de receber presentes",
  budgetRange: "Faixa de preço ideal",
  occasion: "Principal ocasião",
  giftsToAvoid: "Presentes a evitar",
};

export default function RecipientDetailsDialog({
  recipient,
  open,
  onOpenChange,
  onEdit,
}: RecipientDetailsDialogProps) {
  const { data: profile, isLoading: profileLoading } = useQuery<RecipientProfile | null>({
    queryKey: ["/api/recipients", recipient?.id, "profile"],
    queryFn: async () => {
      if (!recipient?.id) return null;
      try {
        const response = await fetch(`/api/recipients/${recipient.id}/profile`);
        if (response.status === 404) return null;
        return response.json();
      } catch (error) {
        return null;
      }
    },
    enabled: open && !!recipient?.id,
  });

  if (!recipient) return null;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit(recipient);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-recipient-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              {recipient.age && (
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Idade:</span>{" "}
                    <span className="font-medium">{recipient.age} anos</span>
                  </span>
                </div>
              )}
              
              {recipient.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Sexo:</span>{" "}
                    <span className="font-medium">{recipient.gender}</span>
                  </span>
                </div>
              )}

              {recipient.zodiacSign && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Signo:</span>{" "}
                    <span className="font-medium">{recipient.zodiacSign}</span>
                  </span>
                </div>
              )}

              {recipient.relationship && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Relacionamento:</span>{" "}
                    <span className="font-medium">{recipient.relationship}</span>
                  </span>
                </div>
              )}
            </div>

            {recipient.interests && recipient.interests.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Interesses:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipient.interests.map((interest: string) => (
                    <Badge key={interest} variant="secondary" className="capitalize">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Location Information */}
            {profile && (profile.cidade || profile.estado || profile.pais) && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Localização:</span>
                </div>
                <span className="text-sm font-medium" data-testid="text-profile-location">
                  {[profile.cidade, profile.estado, profile.pais]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Detailed Profile */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Perfil Detalhado</h3>
            {profileLoading ? (
              <p className="text-sm text-muted-foreground">Carregando perfil...</p>
            ) : profile ? (
              <div className="space-y-3">
                {Object.entries(PROFILE_LABELS).map(([key, label]) => {
                  const value = profile[key as keyof RecipientProfile];
                  if (!value || key === "isCompleted") return null;
                  
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm" data-testid={`text-profile-${key}`}>
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhum perfil detalhado cadastrado para este presenteado.
              </p>
            )}
          </div>

          <Separator />

          {/* Auto Suggestions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sugestões de Presentes</h3>
            <AutoSuggestions 
              recipientId={recipient.id} 
              recipientName={recipient.name} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-details"
          >
            Fechar
          </Button>
          <Button onClick={handleEdit} data-testid="button-edit-from-details">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
