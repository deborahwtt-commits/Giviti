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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, User, Cake, Users, Star, Heart, MapPin, Mail, Link2, RefreshCw } from "lucide-react";
import type { RecipientWithSyncedData, RecipientProfile } from "@shared/schema";
import AutoSuggestions from "./AutoSuggestions";

interface RecipientDetailsDialogProps {
  recipient: RecipientWithSyncedData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (recipient: RecipientWithSyncedData) => void;
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

  // Use synced data when available, otherwise fall back to recipient data
  const displayGender = recipient.isLinked && recipient.syncedData?.syncedGender 
    ? recipient.syncedData.syncedGender 
    : recipient.gender;

  const displayZodiacSign = recipient.isLinked && recipient.syncedData?.syncedZodiacSign
    ? recipient.syncedData.syncedZodiacSign
    : recipient.zodiacSign;
  
  const displayInterests = recipient.isLinked && recipient.syncedData?.syncedInterests?.length 
    ? recipient.syncedData.syncedInterests 
    : recipient.interests;

  const displayGiftPreference = recipient.isLinked && recipient.syncedData?.syncedGiftPreference
    ? recipient.syncedData.syncedGiftPreference
    : null;

  const displayGiftsToAvoid = recipient.isLinked && recipient.syncedData?.syncedGiftsToAvoid
    ? recipient.syncedData.syncedGiftsToAvoid
    : null;

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
            {recipient.isLinked && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Link2 className="w-4 h-4 text-primary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Perfil conectado - dados atualizados automaticamente</p>
                </TooltipContent>
              </Tooltip>
            )}
          </DialogTitle>
          {recipient.isLinked && recipient.syncedData && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 rounded-md p-2 mt-2">
              <RefreshCw className="h-3 w-3" />
              <span>
                Dados sincronizados do perfil original
                {recipient.syncedData.syncedProfileUpdatedAt && (
                  <> • Atualizado em {new Date(recipient.syncedData.syncedProfileUpdatedAt).toLocaleDateString('pt-BR')}</>
                )}
              </span>
            </div>
          )}
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
              
              {displayGender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Sexo:</span>{" "}
                    <span className="font-medium">{displayGender}</span>
                    {recipient.isLinked && recipient.syncedData?.syncedGender && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link2 className="inline-block w-3 h-3 ml-1 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>Sincronizado do perfil original</TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </div>
              )}

              {displayZodiacSign && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Signo:</span>{" "}
                    <span className="font-medium">{displayZodiacSign}</span>
                    {recipient.isLinked && recipient.syncedData?.syncedZodiacSign && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link2 className="inline-block w-3 h-3 ml-1 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>Sincronizado do perfil original</TooltipContent>
                      </Tooltip>
                    )}
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

              {recipient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{recipient.email}</span>
                  </span>
                </div>
              )}
            </div>

            {displayInterests && displayInterests.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Interesses:</span>
                  {recipient.isLinked && recipient.syncedData?.syncedInterests?.length && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link2 className="w-3 h-3 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>Sincronizado do perfil original</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayInterests.map((interest: string) => (
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
            
            {/* Synced data from linked profile */}
            {recipient.isLinked && (displayGiftPreference || displayGiftsToAvoid) && (
              <div className="space-y-3 mb-4 p-3 bg-primary/5 rounded-md border border-primary/10">
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <Link2 className="w-3 h-3" />
                  <span>Dados sincronizados do perfil original</span>
                </div>
                {displayGiftPreference && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tipo de presente preferido
                    </span>
                    <span className="text-sm" data-testid="text-synced-gift-preference">
                      {displayGiftPreference}
                    </span>
                  </div>
                )}
                {displayGiftsToAvoid && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Presentes a evitar
                    </span>
                    <span className="text-sm" data-testid="text-synced-gifts-to-avoid">
                      {displayGiftsToAvoid}
                    </span>
                  </div>
                )}
              </div>
            )}

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
