import { useState } from "react";
import EventForm from "../EventForm";
import { Button } from "@/components/ui/button";

export default function EventFormExample() {
  const [isOpen, setIsOpen] = useState(false);

  const mockRecipients = [
    { id: "1", name: "João Silva" },
    { id: "2", name: "Ana Costa" },
    { id: "3", name: "Pedro Santos" },
  ];

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Abrir Formulário de Evento</Button>

      <EventForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          console.log("Event created:", data);
          setIsOpen(false);
        }}
        recipients={mockRecipients}
      />
    </div>
  );
}
