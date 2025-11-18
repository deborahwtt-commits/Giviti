import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Pencil, Trash2, Archive, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EventDetailsDialog from "./EventDetailsDialog";
import type { EventWithRecipients } from "@shared/schema";

interface EventCardProps {
  event: EventWithRecipients;
  daysUntil: number;
  date: string;
  onViewSuggestions: () => void;
  onEdit: (event: EventWithRecipients) => void;
  onDelete: () => void;
  onArchive?: () => void;
  onAdvanceYear?: () => void;
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
}: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isPastEvent = daysUntil < 0;

  const eventName = event.eventName || event.eventType;
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
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => setShowDetails(true)}
            className="font-semibold text-lg text-foreground truncate hover:text-primary transition-colors text-left w-full mb-1"
            data-testid={`button-view-details-${event.id}`}
          >
            {eventName}
          </button>
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
                  Encerrar
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
                  Próximo Ano
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(event)}
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
              <Button
                size="sm"
                variant="outline"
                onClick={onViewSuggestions}
                data-testid={`button-view-suggestions-${event.id}`}
              >
                <Gift className="w-3 h-3 mr-2" />
                Ver Sugestões
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(event)}
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
