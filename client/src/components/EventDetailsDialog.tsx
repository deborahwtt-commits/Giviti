import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import type { EventWithRecipients } from "@shared/schema";

interface EventDetailsDialogProps {
  event: EventWithRecipients | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: EventWithRecipients) => void;
  formattedDate: string;
  daysUntil: number;
}

export default function EventDetailsDialog({
  event,
  open,
  onClose,
  onEdit,
  formattedDate,
  daysUntil,
}: EventDetailsDialogProps) {
  if (!event) return null;

  const eventName = event.eventName || event.eventType;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-event-details"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{eventName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Type */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tipo de Evento
            </h3>
            <Badge variant="secondary" className="capitalize">
              {event.eventType}
            </Badge>
          </div>

          {/* Event Date */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data
            </h3>
            <p className="text-foreground" data-testid="text-event-date">
              {formattedDate}
            </p>
            <p className="text-sm text-primary font-medium mt-1">
              Faltam {daysUntil} dias
            </p>
          </div>

          {/* Recipients */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Presenteados
            </h3>
            {event.recipients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {event.recipients.map((recipient) => (
                  <Badge
                    key={recipient.id}
                    variant="outline"
                    data-testid={`badge-recipient-${recipient.id}`}
                  >
                    {recipient.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                Nenhum presenteado associado
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              data-testid="button-edit-from-details"
            >
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-close-details"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
