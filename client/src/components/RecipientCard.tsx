import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Gift, Pencil, Trash2 } from "lucide-react";

interface RecipientCardProps {
  id: string;
  name: string;
  age: number;
  relationship?: string;
  interests: string[];
  nextEventDate?: string;
  nextEventName?: string;
  onViewSuggestions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RecipientCard({
  id,
  name,
  age,
  relationship,
  interests,
  nextEventDate,
  nextEventName,
  onViewSuggestions,
  onEdit,
  onDelete,
}: RecipientCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayedInterests = interests.slice(0, 3);
  const remainingCount = interests.length - 3;

  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {age} anos{relationship ? ` • ${relationship}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {displayedInterests.map((interest, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {interest}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} mais
          </Badge>
        )}
      </div>

      {nextEventDate && nextEventName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 bg-accent/20 rounded-md">
          <Calendar className="w-3 h-3 text-primary" />
          <span>
            <span className="font-medium">{nextEventName}</span> em{" "}
            {nextEventDate}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onViewSuggestions}
          data-testid={`button-view-suggestions-${id}`}
          className="flex-1"
        >
          <Gift className="w-3 h-3 mr-2" />
          Ver Sugestões
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          data-testid={`button-edit-${id}`}
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          data-testid={`button-delete-${id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}
