import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Users, Palette, ChevronRight, CalendarCheck } from "lucide-react";
import { useLocation } from "wouter";
import type { EventWithRecipients, CollaborativeEvent } from "@shared/schema";

type TodayEvent = {
  id: string;
  type: 'event' | 'role';
  name: string;
  eventType?: string;
  recipientNames?: string[];
  data: EventWithRecipients | CollaborativeEvent;
};

interface TodayEventsCardProps {
  events: EventWithRecipients[];
  roles: CollaborativeEvent[];
}

export default function TodayEventsCard({ events, roles }: TodayEventsCardProps) {
  const [, setLocation] = useLocation();

  const isToday = (dateValue: string | Date | null): boolean => {
    if (!dateValue) return false;
    let eventDate: Date;
    if (typeof dateValue === "string") {
      const dateStr = dateValue.split("T")[0];
      eventDate = new Date(dateStr + "T12:00:00");
    } else {
      const dateStr = dateValue.toISOString().split("T")[0];
      eventDate = new Date(dateStr + "T12:00:00");
    }
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const getTodayEvents = (): TodayEvent[] => {
    const items: TodayEvent[] = [];
    
    if (events) {
      events
        .filter(event => isToday(event.eventDate))
        .forEach(event => {
          items.push({
            id: event.id,
            type: 'event',
            name: event.eventName ? `${event.eventType} - ${event.eventName}` : event.eventType,
            recipientNames: event.recipients?.map(r => r.name) || [],
            data: event,
          });
        });
    }
    
    if (roles) {
      roles
        .filter(role => role.status === "active" || role.status === "draft")
        .filter(role => isToday(role.eventDate))
        .forEach(role => {
          items.push({
            id: role.id,
            type: 'role',
            name: role.name,
            eventType: role.eventType,
            data: role,
          });
        });
    }
    
    return items;
  };

  const getRoleTypeInfo = (eventType: string) => {
    switch (eventType) {
      case "secret_santa":
        return { icon: Gift, label: "Amigo Secreto", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800" };
      case "themed_night":
        return { icon: Palette, label: "Evento Temático", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800" };
      case "collective_gift":
        return { icon: Gift, label: "Presente Coletivo", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" };
      case "creative_challenge":
        return { icon: Palette, label: "Desafio Criativo", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" };
      default:
        return { icon: Users, label: "Rolê", color: "bg-muted text-muted-foreground" };
    }
  };

  const todayEvents = getTodayEvents();

  if (todayEvents.length === 0) {
    return null;
  }

  return (
    <Card 
      className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5"
      data-testid="card-today-events"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-full bg-primary/10">
            <CalendarCheck className="w-5 h-5 text-primary" />
          </div>
          <span>Eventos de Hoje</span>
          <Badge variant="secondary" className="ml-auto">
            {todayEvents.length} {todayEvents.length === 1 ? 'evento' : 'eventos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayEvents.map((item) => {
          if (item.type === 'event') {
            const event = item.data as EventWithRecipients;
            return (
              <div
                key={`today-event-${item.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-background/80 hover-elevate cursor-pointer"
                onClick={() => setLocation("/eventos")}
                data-testid={`today-event-item-${item.id}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    {item.recipientNames && item.recipientNames.length > 0 && (
                      <p className="text-sm text-muted-foreground truncate">
                        Para: {item.recipientNames.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="shrink-0" data-testid={`button-view-event-${item.id}`}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            );
          } else {
            const role = item.data as CollaborativeEvent;
            const typeInfo = getRoleTypeInfo(role.eventType);
            const TypeIcon = typeInfo.icon;
            return (
              <div
                key={`today-role-${item.id}`}
                className="flex items-center justify-between p-3 rounded-md bg-background/80 hover-elevate cursor-pointer"
                onClick={() => setLocation(`/role/${role.id}`)}
                data-testid={`today-role-item-${item.id}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-full shrink-0 ${typeInfo.color}`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{role.name}</p>
                    <Badge className={`mt-1 text-xs ${typeInfo.color}`}>
                      {typeInfo.label}
                    </Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="shrink-0" data-testid={`button-view-role-${item.id}`}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            );
          }
        })}
      </CardContent>
    </Card>
  );
}