import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift, Pencil, Trash2, Archive, CalendarClock, Users, PartyPopper, Heart, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import type { EventWithRecipients, CollaborativeEvent } from "@shared/schema";
import type { LucideIcon } from "lucide-react";
import { getEventColors } from "@/lib/eventColors";

type UnifiedEvent = (EventWithRecipients & { type: 'event' }) | (CollaborativeEvent & { type: 'role' });

interface UnifiedEventCardProps {
  item: UnifiedEvent;
  daysUntil: number;
  date: string;
  onEdit?: (event: EventWithRecipients) => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onAdvanceYear?: () => void;
  onViewSuggestions?: () => void;
}

export default function UnifiedEventCard({
  item,
  daysUntil,
  date,
  onEdit,
  onDelete,
  onArchive,
  onAdvanceYear,
  onViewSuggestions,
}: UnifiedEventCardProps) {
  const [, setLocation] = useLocation();
  const isPastEvent = daysUntil < 0;

  const roleTypeInfo: Record<string, { label: string; Icon: LucideIcon }> = {
    secret_santa: { 
      label: "Amigo Secreto", 
      Icon: Gift 
    },
    themed_night: { 
      label: "Noite Temática", 
      Icon: PartyPopper 
    },
    collective_gift: { 
      label: "Presente Coletivo", 
      Icon: Heart 
    },
    creative_challenge: { 
      label: "Desafio Criativo", 
      Icon: Sparkles 
    },
  };

  if (item.type === 'role') {
    const role = item as CollaborativeEvent & { type: 'role' };
    const typeInfo = roleTypeInfo[role.eventType] || {
      label: role.eventType,
      Icon: Calendar,
    };
    const IconComponent = typeInfo.Icon;
    const colors = getEventColors(role.eventType);

    return (
      <Card
        className="p-6 hover-elevate active-elevate-2 cursor-pointer"
        data-testid={`card-role-${role.id}`}
        onClick={() => setLocation(`/role/${role.id}`)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setLocation(`/role/${role.id}`);
          }
        }}
        tabIndex={0}
        role="button"
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-md ${colors.bg} flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground truncate" data-testid={`text-role-name-${role.id}`}>
                {role.name}
              </h3>
              <Badge className={`shrink-0 ${colors.badge}`}>
                Rolê
              </Badge>
            </div>
            
            {role.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {role.description}
              </p>
            )}

            {role.eventDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <span>{date}</span>
                <span>•</span>
                {isPastEvent ? (
                  <span className="font-medium text-destructive">
                    Passou há {Math.abs(daysUntil)} dias
                  </span>
                ) : (
                  <span className="font-medium text-primary">
                    Faltam {daysUntil} dias
                  </span>
                )}
              </div>
            )}
            {!role.eventDate && (
              <div className="text-xs text-muted-foreground mb-4">
                Sem data definida
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${colors.bg} ${colors.icon} ${colors.border}`}>
                {typeInfo.label}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>Ver detalhes</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Event card (original logic)
  const event = item as EventWithRecipients & { type: 'event' };
  const eventColors = getEventColors('regular');
  // Combine event type + name (e.g., "Aniversário Mãe", "Natal família Silva")
  const eventDisplayName = event.eventName 
    ? `${event.eventType} ${event.eventName}` 
    : event.eventType;
  const recipientNames = event.recipients.map(r => r.name);
  const displayRecipients = () => {
    if (recipientNames.length === 0) {
      return <span className="text-muted-foreground italic">Sem presenteados</span>;
    }
    if (recipientNames.length === 1) {
      return `Para ${recipientNames[0]}`;
    }
    if (recipientNames.length === 2) {
      return `Para ${recipientNames[0]} e ${recipientNames[1]}`;
    }
    return (
      <span>
        Para {recipientNames[0]} e mais {recipientNames.length - 1} {recipientNames.length - 1 === 1 ? 'pessoa' : 'pessoas'}
      </span>
    );
  };

  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-md ${eventColors.bg} flex items-center justify-center`}>
          <Calendar className={`w-6 h-6 ${eventColors.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {eventDisplayName}
            </h3>
            <Badge className={`shrink-0 ${eventColors.badge}`}>
              Evento
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {displayRecipients()}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span>{date}</span>
            <span>•</span>
            {isPastEvent ? (
              <span className="font-medium text-destructive">
                Passou há {Math.abs(daysUntil)} dias
              </span>
            ) : (
              <span className="font-medium text-primary">
                Faltam {daysUntil} dias
              </span>
            )}
          </div>

          {isPastEvent ? (
            <div className="flex gap-2 flex-wrap">
              {onArchive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onArchive}
                  data-testid={`button-archive-${event.id}`}
                >
                  <Archive className="w-3 h-3 mr-2" />
                  Arquivar
                </Button>
              )}
              {onAdvanceYear && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAdvanceYear}
                  data-testid={`button-advance-year-${event.id}`}
                >
                  <CalendarClock className="w-3 h-3 mr-2" />
                  Atualizar para o próximo ano
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit && onEdit(event)}
                data-testid={`button-edit-${event.id}`}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                data-testid={`button-delete-${event.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {onViewSuggestions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewSuggestions}
                  data-testid={`button-view-suggestions-${event.id}`}
                >
                  <Gift className="w-3 h-3 mr-2" />
                  Ver Sugestões
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit && onEdit(event)}
                data-testid={`button-edit-${event.id}`}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                data-testid={`button-delete-${event.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
