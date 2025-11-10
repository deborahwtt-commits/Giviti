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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      eventName,
      eventType,
      eventDate,
      recipientIds: selectedRecipients,
    };
    console.log("Event form submitted:", data);
    onSubmit(data);
    setEventName("");
    setEventType("");
    setEventDate("");
    setSelectedRecipients([]);
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
            <Label>Presenteados (opcional)</Label>
            {recipients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum presenteado cadastrado
              </p>
            ) : (
              <ScrollArea className="h-40 rounded-md border p-3">
                <div className="space-y-3">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`recipient-${recipient.id}`}
                        checked={selectedRecipients.includes(recipient.id)}
                        onCheckedChange={() => toggleRecipient(recipient.id)}
                        data-testid={`checkbox-recipient-${recipient.id}`}
                      />
                      <label
                        htmlFor={`recipient-${recipient.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {recipient.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {selectedRecipients.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedRecipients.length} presenteado{selectedRecipients.length > 1 ? 's' : ''} selecionado{selectedRecipients.length > 1 ? 's' : ''}
              </p>
            )}
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
