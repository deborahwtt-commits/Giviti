import EventCard from "../EventCard";

export default function EventCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <EventCard
        eventName="Aniversário"
        recipientName="João Silva"
        daysUntil={12}
        date="25 de Dez, 2024"
        onViewSuggestions={() => console.log("View suggestions clicked")}
      />
      <EventCard
        eventName="Formatura"
        recipientName="Ana Costa"
        daysUntil={28}
        date="10 de Jan, 2025"
        onViewSuggestions={() => console.log("View suggestions clicked")}
      />
      <EventCard
        eventName="Casamento"
        recipientName="Pedro Santos"
        daysUntil={45}
        date="27 de Fev, 2025"
        onViewSuggestions={() => console.log("View suggestions clicked")}
      />
    </div>
  );
}
