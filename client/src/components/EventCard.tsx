import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Pencil, Trash2, Archive, CalendarClock, AlertTriangle, Cake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EventDetailsDialog from "./EventDetailsDialog";
import type { EventWithRecipients } from "@shared/schema";
import { getEventColors } from "@/lib/eventColors";

interface EventCardProps {
  event: EventWithRecipients;
  daysUntil: number;
  date: string;
  onViewSuggestions: () => void;
  onEdit?: (event: EventWithRecipients) => void;
  onDelete: () => void;
  onArchive?: () => void;
  onAdvanceYear?: () => void;
  hasGiftPurchased?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function EventCard({
  event,
  daysUntil,
  date,
  onViewSuggestions,
  onEdit,
  onDelete,
  onArchive,
  onAdvanceYear,
  hasGiftPurchased = false,
  onClick,
  compact = false,
}: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isPastEvent = daysUntil < 0;
  const needsAttention = !isPastEvent && daysUntil <= 7 && !hasGiftPurchased;
  const eventColors = getEventColors('regular');
  const isBirthdayEvent = event.eventType === "Meu Aniversário";

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

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDetails(true);
    }
  };

  return (
    <Card 
      className={`p-6 hover-elevate ${onClick ? 'cursor-pointer' : ''} ${needsAttention ? 'border-amber-400 dark:border-amber-600 border-2' : ''}`}
      onClick={onClick ? handleCardClick : undefined}
      data-testid={`card-event-${event.id}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center ${needsAttention ? 'bg-amber-100 dark:bg-amber-950' : eventColors.bg}`}>
          {needsAttention ? (
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ) : (
            <Calendar className={`w-6 h-6 ${eventColors.icon}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) {
                  onClick();
                } else {
                  setShowDetails(true);
                }
              }}
              className="font-semibold text-lg text-foreground truncate hover:text-primary transition-colors text-left"
              data-testid={`button-view-details-${event.id}`}
            >
              {eventDisplayName}
            </button>
            {needsAttention && (
              <Badge className="bg-amber-500 text-white text-xs shrink-0">
                Sem presente!
              </Badge>
            )}
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

          {!compact && (
            isPastEvent ? (
              <div className="flex gap-2 flex-wrap">
                {onArchive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
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
                    onClick={(e) => { e.stopPropagation(); onAdvanceYear(); }}
                    data-testid={`button-advance-year-${event.id}`}
                  >
                    <CalendarClock className="w-3 h-3 mr-2" />
                    Atualizar para o próximo ano
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    data-testid={`button-edit-${event.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  data-testid={`button-delete-${event.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {isBirthdayEvent ? (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    data-testid={`button-manage-birthday-${event.id}`}
                  >
                    <Link href={`/eventos/${event.id}/aniversario`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Cake className="w-3 h-3 mr-2" />
                      Gerenciar Aniversário
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onViewSuggestions(); }}
                    data-testid={`button-view-suggestions-${event.id}`}
                  >
                    <Gift className="w-3 h-3 mr-2" />
                    Ver Sugestões
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    data-testid={`button-edit-${event.id}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  data-testid={`button-delete-${event.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      <EventDetailsDialog
        event={event}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onEdit={onEdit}
        formattedDate={date}
        daysUntil={daysUntil}
      />
    </Card>
  );
}
