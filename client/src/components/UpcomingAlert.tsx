import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Gift, 
  Clock, 
  AlertTriangle, 
  PartyPopper,
  Users,
  Heart,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import type { EventWithRecipients, CollaborativeEvent } from "@shared/schema";
import { differenceInDays } from "date-fns";

interface UpcomingAlertProps {
  events: EventWithRecipients[];
  roles: CollaborativeEvent[];
}

type UpcomingItem = {
  id: string;
  name: string;
  type: 'event' | 'role';
  eventType?: string;
  daysUntil: number;
  date: Date;
  url: string;
};

export default function UpcomingAlert({ events, roles }: UpcomingAlertProps) {
  const [, setLocation] = useLocation();

  const getUpcomingItems = (): UpcomingItem[] => {
    const today = new Date();
    const items: UpcomingItem[] = [];

    events.forEach(event => {
      if (!event.eventDate) return;
      const eventDate = new Date(event.eventDate);
      const daysUntil = differenceInDays(eventDate, today);
      if (daysUntil >= 0 && daysUntil <= 30) {
        const displayName = event.eventName 
          ? `${event.eventType} ${event.eventName}` 
          : event.eventType;
        items.push({
          id: event.id,
          name: displayName,
          type: 'event',
          eventType: event.eventType,
          daysUntil,
          date: eventDate,
          url: '/eventos'
        });
      }
    });

    roles.forEach(role => {
      if (!role.eventDate || role.status === 'cancelled' || role.status === 'completed') return;
      const eventDate = new Date(role.eventDate);
      const daysUntil = differenceInDays(eventDate, today);
      if (daysUntil >= 0 && daysUntil <= 30) {
        items.push({
          id: role.id,
          name: role.name,
          type: 'role',
          eventType: role.eventType,
          daysUntil,
          date: eventDate,
          url: `/role/${role.id}`
        });
      }
    });

    return items.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const items = getUpcomingItems();
  const nextItem = items[0];

  if (!nextItem) return null;

  const getIcon = () => {
    if (nextItem.type === 'role') {
      switch (nextItem.eventType) {
        case 'secret_santa': return Gift;
        case 'themed_night': return PartyPopper;
        case 'collective_gift': return Heart;
        default: return Users;
      }
    }
    return Calendar;
  };

  const getUrgencyStyles = () => {
    if (nextItem.daysUntil <= 3) {
      return {
        bg: "bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30",
        icon: "text-destructive",
        badge: "bg-destructive text-destructive-foreground",
        text: "text-destructive font-bold"
      };
    }
    if (nextItem.daysUntil <= 7) {
      return {
        bg: "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30",
        icon: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500 text-white",
        text: "text-amber-600 dark:text-amber-400 font-semibold"
      };
    }
    return {
      bg: "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30",
      icon: "text-primary",
      badge: "bg-primary text-primary-foreground",
      text: "text-primary font-medium"
    };
  };

  const styles = getUrgencyStyles();
  const Icon = getIcon();

  const getDaysText = () => {
    if (nextItem.daysUntil === 0) return "Hoje!";
    if (nextItem.daysUntil === 1) return "Amanhã!";
    return `${nextItem.daysUntil} dias`;
  };

  return (
    <Card 
      className={`p-4 border-2 ${styles.bg} cursor-pointer hover-elevate transition-all`}
      onClick={() => setLocation(nextItem.url)}
      data-testid="upcoming-alert"
    >
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${nextItem.daysUntil <= 3 ? 'bg-destructive/20 animate-pulse' : 'bg-card'}`}>
          {nextItem.daysUntil <= 3 ? (
            <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
          ) : (
            <Icon className={`w-7 h-7 ${styles.icon}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={styles.badge}>
              <Clock className="w-3 h-3 mr-1" />
              {getDaysText()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {nextItem.type === 'role' ? 'Rolê' : 'Evento'}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg text-foreground truncate">
            {nextItem.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {nextItem.daysUntil <= 3 
              ? "Corra! Está chegando a hora!" 
              : nextItem.daysUntil <= 7 
                ? "Ainda dá tempo de se preparar"
                : "Planeje com antecedência"
            }
          </p>
        </div>

        <Button size="sm" variant="ghost" className="shrink-0">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}
