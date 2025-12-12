import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { startOfDay, parseISO } from "date-fns";
import { Loader2, Cake, Gift, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Occasion } from "@shared/schema";

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

  const { data: occasions, isLoading: isLoadingOccasions } = useQuery<Occasion[]>({
    queryKey: ["/api/occasions"],
  });

  const isBirthdayEvent = eventType === "Meu Aniversário";

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
      const selectedDate = startOfDay(parseISO(eventDate));
      const today = startOfDay(new Date());
      
      if (selectedDate < today) {
        toast({
          title: "Data inválida",
          description: "A data deve ser hoje ou no futuro",
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
            {initialEvent ? "Editar Data Comemorativa" : "Nova Data Comemorativa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="eventType">Tipo de data</Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger id="eventType" data-testid="select-event-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingOccasions ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : occasions && occasions.length > 0 ? (
                  occasions.map((occasion) => (
                    <SelectItem key={occasion.id} value={occasion.name}>
                      {occasion.icon && <span className="mr-2">{occasion.icon}</span>}
                      {occasion.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Nenhum tipo cadastrado
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName">Nome da data (opcional)</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex: Aniversário de 30 anos"
              data-testid="input-event-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Data</Label>
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

          {isBirthdayEvent ? (
            <Alert className="border-primary/20 bg-primary/5">
              <Cake className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Seu aniversário especial!</strong>
                <br />
                Após criar, você poderá:
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Gift className="h-3 w-3" /> Criar sua lista de desejos (até 15 itens)
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-3 w-3" /> Convidar amigos e familiares
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
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
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              data-testid="button-save-event"
            >
              {initialEvent ? "Salvar" : "Criar data comemorativa"}
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
