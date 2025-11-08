import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift } from "lucide-react";

interface EventCardProps {
  eventName: string;
  recipientName: string;
  daysUntil: number;
  date: string;
  onViewSuggestions: () => void;
}

export default function EventCard({
  eventName,
  recipientName,
  daysUntil,
  date,
  onViewSuggestions,
}: EventCardProps) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
            {eventName}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Para {recipientName}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span>{date}</span>
            <span>•</span>
            <span className="font-medium text-primary">
              Faltam {daysUntil} dias
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onViewSuggestions}
            data-testid={`button-view-suggestions-${eventName}`}
          >
            <Gift className="w-3 h-3 mr-2" />
            Ver Sugestões
          </Button>
        </div>
      </div>
    </Card>
  );
}
