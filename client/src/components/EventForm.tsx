import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  recipients?: { id: string; name: string }[];
}

const eventTypes = [
  "Aniversário",
  "Casamento",
  "Formatura",
  "Aniversário de Namoro",
  "Dia das Mães",
  "Dia dos Pais",
  "Natal",
  "Outro",
];

export default function EventForm({
  isOpen,
  onClose,
  onSubmit,
  recipients = [],
}: EventFormProps) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [recipientId, setRecipientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      eventName,
      eventType,
      eventDate,
      recipientId,
    };
    console.log("Event form submitted:", data);
    onSubmit(data);
    setEventName("");
    setEventType("");
    setEventDate("");
    setRecipientId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Criar Novo Evento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="eventType">Tipo de evento</Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger id="eventType" data-testid="select-event-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName">Nome do evento (opcional)</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex: Aniversário de 30 anos"
              data-testid="input-event-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Data do evento</Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              data-testid="input-event-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Presenteado</Label>
            <Select value={recipientId} onValueChange={setRecipientId} required>
              <SelectTrigger id="recipient" data-testid="select-recipient">
                <SelectValue placeholder="Selecione o presenteado" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              data-testid="button-save-event"
            >
              Criar Evento
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-event"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
