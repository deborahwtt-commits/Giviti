import { useState } from "react";
import DashboardHero from "@/components/DashboardHero";
import EventCard from "@/components/EventCard";
import GiftCard from "@/components/GiftCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";

export default function Dashboard() {
  const [hasEvents] = useState(true);
  const [hasSuggestions] = useState(true);

  const mockEvents = [
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
  ];

  const mockGifts = [
    {
      id: "1",
      name: "Fone de Ouvido Bluetooth Premium",
      description:
        "Som de alta qualidade com cancelamento de ruído ativo. Perfeito para quem ama música.",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      priceRange: "R$ 200 - R$ 350",
    },
    {
      id: "2",
      name: "Kit de Cuidados com a Pele",
      description:
        "Conjunto completo de produtos naturais para rotina de skincare diária.",
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
      priceRange: "R$ 150 - R$ 280",
    },
    {
      id: "3",
      name: "Livro 'O Poder do Hábito'",
      description:
        "Best-seller sobre como criar hábitos positivos e transformar sua vida.",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
      priceRange: "R$ 35 - R$ 60",
    },
    {
      id: "4",
      name: "Smartwatch Fitness Tracker",
      description:
        "Monitore atividades físicas, sono e saúde com estilo moderno.",
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      priceRange: "R$ 400 - R$ 800",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
        <DashboardHero
          userName="Maria"
          stats={{
            totalRecipients: 12,
            upcomingEvents: 3,
            giftsPurchased: 28,
          }}
          onCreateRecipient={() => console.log("Create recipient")}
          onExploreSuggestions={() => console.log("Explore suggestions")}
        />

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground">
                Eventos Próximos
              </h2>
              <p className="text-muted-foreground mt-1">
                Não perca as datas importantes
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              data-testid="button-add-event"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>

          {hasEvents ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockEvents.map((event) => (
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
          ) : (
            <EmptyState
              image={emptyEventsImage}
              title="Nenhum evento próximo"
              description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
              actionLabel="Criar Evento"
              onAction={() => console.log("Create event")}
            />
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground">
                Sugestões Recentes
              </h2>
              <p className="text-muted-foreground mt-1">
                Ideias personalizadas para você
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              data-testid="button-view-all-suggestions"
            >
              Ver Todas
            </Button>
          </div>

          {hasSuggestions ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {mockGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  id={gift.id}
                  name={gift.name}
                  description={gift.description}
                  imageUrl={gift.imageUrl}
                  priceRange={gift.priceRange}
                  onViewDetails={() =>
                    console.log(`View details for ${gift.name}`)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              image={emptyEventsImage}
              title="Nenhuma sugestão ainda"
              description="Adicione presenteados e eventos para receber sugestões personalizadas."
            />
          )}
        </section>
      </div>
    </div>
  );
}
