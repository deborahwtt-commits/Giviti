import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  image: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-48 h-48 mb-6 opacity-80">
        <img src={image} alt={title} className="w-full h-full object-contain" />
      </div>

      <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-state-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
