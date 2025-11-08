import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Trash2, Eye } from "lucide-react";

interface GiftListItemProps {
  id: string;
  name: string;
  recipientName: string;
  occasion: string;
  price: string;
  imageUrl: string;
  isPurchased?: boolean;
  purchaseDate?: string;
  onTogglePurchased?: () => void;
  onViewDetails: () => void;
  onRemove?: () => void;
}

export default function GiftListItem({
  id,
  name,
  recipientName,
  occasion,
  price,
  imageUrl,
  isPurchased = false,
  purchaseDate,
  onTogglePurchased,
  onViewDetails,
  onRemove,
}: GiftListItemProps) {
  return (
    <Card className="p-4 hover-elevate">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-20 h-20 rounded-md bg-muted overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">
                Para {recipientName} • {occasion}
              </p>
            </div>

            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {price}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isPurchased && onTogglePurchased && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`purchased-${id}`}
                  onCheckedChange={onTogglePurchased}
                  data-testid={`checkbox-mark-purchased-${id}`}
                />
                <label
                  htmlFor={`purchased-${id}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Marcar como comprado
                </label>
              </div>
            )}

            {isPurchased && purchaseDate && (
              <span className="text-xs text-muted-foreground">
                Comprado em {purchaseDate}
              </span>
            )}

            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={onViewDetails}
                data-testid={`button-view-gift-${id}`}
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>

              {onRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  data-testid={`button-remove-gift-${id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
