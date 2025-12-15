import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Temporarily hidden imports
// import { useState } from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Heart } from "lucide-react";
import { ExternalLink } from "lucide-react";

interface GiftCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceRange: string;
  onViewDetails: () => void;
  onToggleFavorite?: () => void;
  onTogglePurchased?: () => void;
  isFavorite?: boolean;
  isPurchased?: boolean;
}

export default function GiftCard({
  id,
  name,
  description,
  imageUrl,
  priceRange,
  onViewDetails,
  onToggleFavorite,
  onTogglePurchased,
  isFavorite = false,
  isPurchased = false,
}: GiftCardProps) {
  // Temporarily hidden - favorite and purchased state/handlers
  // const [favorite, setFavorite] = useState(isFavorite);
  // const [purchased, setPurchased] = useState(isPurchased);
  // const handleFavoriteToggle = () => {
  //   setFavorite(!favorite);
  //   onToggleFavorite?.();
  //   console.log(`Favorite toggled for ${name}`);
  // };
  // const handlePurchasedToggle = () => {
  //   setPurchased(!purchased);
  //   onTogglePurchased?.();
  //   console.log(`Purchased toggled for ${name}`);
  // };

  // Suppress unused parameter warnings
  void onToggleFavorite;
  void onTogglePurchased;
  void isFavorite;
  void isPurchased;

  return (
    <Card className="overflow-hidden group hover-elevate">
      <div className="relative aspect-square bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />

{/* Temporarily hidden - favorite and purchased options
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            favorite
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-foreground hover-elevate"
          }`}
          data-testid={`button-favorite-${id}`}
          aria-label="Favoritar"
        >
          <Heart
            className={`w-4 h-4 ${favorite ? "fill-current" : ""}`}
          />
        </button>

        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={purchased}
              onCheckedChange={handlePurchasedToggle}
              id={`purchased-${id}`}
              data-testid={`checkbox-purchased-${id}`}
              className="bg-background"
            />
            <label
              htmlFor={`purchased-${id}`}
              className="text-xs font-medium text-background bg-foreground/90 px-2 py-1 rounded cursor-pointer"
            >
              Comprado
            </label>
          </div>
        </div>
        */}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {priceRange}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
          {name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {description}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onViewDetails}
          data-testid={`button-view-details-${id}`}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}
