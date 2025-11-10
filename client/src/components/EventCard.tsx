import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  eventName: string;
  recipientNames: string[];
  daysUntil: number;
  date: string;
  onViewSuggestions: () => void;
}

export default function EventCard({
  eventName,
  recipientNames,
  daysUntil,
  date,
  onViewSuggestions,
}: EventCardProps) {
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
          <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
            {eventName}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {displayRecipients()}
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
