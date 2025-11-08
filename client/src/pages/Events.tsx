import { useState } from "react";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";

export default function Events() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [hasEvents] = useState(true);

  const mockRecipients = [
    { id: "1", name: "João Silva" },
    { id: "2", name: "Ana Costa" },
    { id: "3", name: "Pedro Santos" },
  ];

  const allEvents = [
    {
      id: "1",
      eventName: "Aniversário",
      recipientName: "João Silva",
      daysUntil: 12,
      date: "25 de Dez, 2024",
    },
    {
      id: "2",
      eventName: "Formatura",
      recipientName: "Ana Costa",
      daysUntil: 28,
      date: "10 de Jan, 2025",
    },
    {
      id: "3",
      eventName: "Casamento",
      recipientName: "Pedro Santos",
      daysUntil: 45,
      date: "27 de Fev, 2025",
    },
    {
      id: "4",
      eventName: "Dia das Mães",
      recipientName: "Maria Oliveira",
      daysUntil: 85,
      date: "15 de Mar, 2025",
    },
    {
      id: "5",
      eventName: "Aniversário",
      recipientName: "Beatriz Lima",
      daysUntil: 120,
      date: "5 de Abr, 2025",
    },
  ];

  const thisMonthEvents = allEvents.filter((e) => e.daysUntil <= 30);
  const nextThreeMonthsEvents = allEvents.filter((e) => e.daysUntil <= 90);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-foreground">
              Eventos
            </h1>
            <p className="text-muted-foreground mt-2">
              Nunca perca uma data importante
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowEventForm(true)}
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {hasEvents ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-events">
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="thisMonth"
                data-testid="tab-this-month-events"
              >
                Este Mês
              </TabsTrigger>
              <TabsTrigger
                value="nextThreeMonths"
                data-testid="tab-next-three-months-events"
              >
                Próximos 3 Meses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    eventName={event.eventName}
                    recipientName={event.recipientName}
                    daysUntil={event.daysUntil}
                    date={event.date}
                    onViewSuggestions={() =>
                      console.log(`View suggestions for ${event.recipientName}`)
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="thisMonth">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {thisMonthEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    eventName={event.eventName}
                    recipientName={event.recipientName}
                    daysUntil={event.daysUntil}
                    date={event.date}
                    onViewSuggestions={() =>
                      console.log(`View suggestions for ${event.recipientName}`)
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nextThreeMonths">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {nextThreeMonthsEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    eventName={event.eventName}
                    recipientName={event.recipientName}
                    daysUntil={event.daysUntil}
                    date={event.date}
                    onViewSuggestions={() =>
                      console.log(`View suggestions for ${event.recipientName}`)
                    }
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState
            image={emptyEventsImage}
            title="Nenhum evento cadastrado"
            description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
            actionLabel="Criar Evento"
            onAction={() => setShowEventForm(true)}
          />
        )}

        <EventForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSubmit={(data) => {
            console.log("Event created:", data);
            setShowEventForm(false);
          }}
          recipients={mockRecipients}
        />
      </div>
    </div>
  );
}
