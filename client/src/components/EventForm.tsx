import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { startOfDay } from "date-fns";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  recipients?: { id: string; name: string }[];
  initialEvent?: {
    id: string;
    eventName: string | null;
    eventType: string;
    eventDate: string;
    recipientIds: string[];
  };
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
  initialEvent,
}: EventFormProps) {
  const { toast } = useToast();
  const [eventName, setEventName] = useState(initialEvent?.eventName || "");
  const [eventType, setEventType] = useState(initialEvent?.eventType || "");
  const [eventDate, setEventDate] = useState(initialEvent?.eventDate || "");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(initialEvent?.recipientIds || []);

  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.eventName || "");
      setEventType(initialEvent.eventType);
      setEventDate(initialEvent.eventDate);
      setSelectedRecipients(initialEvent.recipientIds);
    } else {
      setEventName("");
      setEventType("");
      setEventDate("");
      setSelectedRecipients([]);
    }
  }, [initialEvent]);

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date is not in the past
    if (eventDate) {
      const selectedDate = startOfDay(new Date(eventDate));
      const today = startOfDay(new Date());
      
      if (selectedDate < today) {
        toast({
          title: "Data inválida",
          description: "A data do evento deve ser hoje ou no futuro",
          variant: "destructive",
        });
        return;
      }
    }
    
    const data = {
      ...(initialEvent?.id && { id: initialEvent.id }),
      eventName,
      eventType,
      eventDate,
      recipientIds: selectedRecipients,
    };
    onSubmit(data);
    if (!initialEvent) {
      setEventName("");
      setEventType("");
      setEventDate("");
      setSelectedRecipients([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {initialEvent ? "Editar Evento" : "Criar Novo Evento"}
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
              min={new Date().toISOString().split('T')[0]}
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
              {initialEvent ? "Salvar" : "Criar Evento"}
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
