import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar, Gift, Cake, Palette, MapPin, PartyPopper } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseDateSafe } from "@/lib/utils";
import type { EventWithRecipients, CollaborativeEvent } from "@shared/schema";

interface CalendarEvent {
  id: string;
  name: string;
  date: Date;
  type: "event" | "role";
  eventType: string;
  path: string;
}

interface MiniCalendarProps {
  events: EventWithRecipients[];
  roles: CollaborativeEvent[];
  onNavigate: (path: string) => void;
  isLoading?: boolean;
}

function getEventTypeIcon(eventType: string) {
  switch (eventType) {
    case "Meu Aniversário":
    case "Aniversário":
      return Cake;
    case "secret_santa":
      return Gift;
    case "themed_night":
      return Palette;
    case "collective_gift":
      return Gift;
    case "group_trip":
      return MapPin;
    case "custom_event":
      return PartyPopper;
    default:
      return Calendar;
  }
}

function getEventDotColor(eventType: string, type: "event" | "role") {
  if (type === "role") {
    switch (eventType) {
      case "secret_santa": return "bg-red-500 dark:bg-red-400";
      case "themed_night": return "bg-violet-500 dark:bg-violet-400";
      case "collective_gift": return "bg-amber-500 dark:bg-amber-400";
      case "group_trip": return "bg-sky-500 dark:bg-sky-400";
      case "custom_event": return "bg-teal-500 dark:bg-teal-400";
      default: return "bg-primary";
    }
  }
  switch (eventType) {
    case "Meu Aniversário":
    case "Aniversário":
      return "bg-pink-500 dark:bg-pink-400";
    case "Natal":
    case "Dia das Mães":
    case "Dia dos Pais":
      return "bg-red-500 dark:bg-red-400";
    default:
      return "bg-primary";
  }
}

function getEventLabel(eventType: string) {
  switch (eventType) {
    case "secret_santa": return "Amigo Secreto";
    case "themed_night": return "Evento Temático";
    case "collective_gift": return "Presente Coletivo";
    case "group_trip": return "Viagem em Grupo";
    case "custom_event": return "Rolê Personalizado";
    default: return eventType;
  }
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function MiniCalendar({ events, roles, onNavigate, isLoading }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarEvents = useMemo(() => {
    const items: CalendarEvent[] = [];

    events.forEach(event => {
      if (!event.eventDate) return;
      const date = parseDateSafe(event.eventDate);
      if (!date || isNaN(date.getTime())) return;
      const isBirthday = event.eventType === "Meu Aniversário";
      items.push({
        id: event.id,
        name: event.eventName ? `${event.eventType} - ${event.eventName}` : event.eventType,
        date,
        type: "event",
        eventType: event.eventType,
        path: isBirthday ? `/eventos/${event.id}/aniversario` : `/eventos`,
      });
    });

    roles.forEach(role => {
      if (!role.eventDate) return;
      const date = parseDateSafe(role.eventDate);
      if (!date || isNaN(date.getTime())) return;
      items.push({
        id: role.id,
        name: role.name,
        date,
        type: "role",
        eventType: role.eventType,
        path: `/role/${role.id}`,
      });
    });

    return items;
  }, [events, roles]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(e => isSameDay(e.date, date));
  };

  const today = new Date();

  if (isLoading) {
    return (
      <Card data-testid="mini-calendar">
        <CardContent className="p-4">
          <div className="h-[320px] bg-muted/30 rounded-md animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="mini-calendar">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            aria-label="Mês anterior"
            data-testid="calendar-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-heading font-semibold text-base capitalize" data-testid="calendar-month-label">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            aria-label="Próximo mês"
            data-testid="calendar-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center text-xs font-medium text-muted-foreground py-1.5">
              {wd}
            </div>
          ))}

          {days.map((d, i) => {
            const dayEvents = getEventsForDay(d);
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isToday = isSameDay(d, today);
            const hasEvents = dayEvents.length > 0 && isCurrentMonth;

            const dayInner = (
              <>
                <span
                  className={`
                    text-sm leading-none z-10 relative
                    ${isToday ? "text-primary-foreground" : "text-foreground"}
                  `}
                >
                  {format(d, "d")}
                </span>
                {isToday && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary" style={{ zIndex: 0 }} />
                )}
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${getEventDotColor(ev.eventType, ev.type)}`}
                      />
                    ))}
                  </div>
                )}
              </>
            );

            if (hasEvents) {
              return (
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`
                        relative flex flex-col items-center justify-center py-1.5 min-h-[2.5rem]
                        rounded-md cursor-pointer hover-elevate transition-all outline-none
                        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
                        ${isToday ? "font-bold" : ""}
                      `}
                      aria-label={`${format(d, "d 'de' MMMM", { locale: ptBR })}, ${dayEvents.length} evento${dayEvents.length > 1 ? "s" : ""}`}
                      data-testid={`calendar-day-${format(d, "yyyy-MM-dd")}`}
                    >
                      {dayInner}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="center" side="bottom">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                      {format(d, "d 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map(ev => {
                        const Icon = getEventTypeIcon(ev.eventType);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            className="flex items-center gap-2 w-full text-left p-2 rounded-md hover-elevate transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => onNavigate(ev.path)}
                            data-testid={`calendar-event-${ev.id}`}
                          >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${getEventDotColor(ev.eventType, ev.type)}`} />
                            <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">
                                {ev.name}
                              </span>
                              {ev.type === "role" && (
                                <span className="text-xs text-muted-foreground">
                                  {getEventLabel(ev.eventType)}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return (
              <div
                key={i}
                className={`
                  relative flex flex-col items-center justify-center py-1.5 min-h-[2.5rem]
                  ${!isCurrentMonth ? "opacity-30" : ""}
                  ${isToday ? "font-bold" : ""}
                `}
              >
                {dayInner}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
