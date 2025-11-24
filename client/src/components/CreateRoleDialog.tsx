import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Gift, PartyPopper, Heart, Sparkles, Calendar as CalendarIcon, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CollaborativeEvent } from "@shared/schema";

const createRoleSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  eventType: z.enum(["secret_santa", "themed_night", "collective_gift", "creative_challenge"]),
  eventDate: z.date().optional().nullable(),
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  budgetLimit: z.string().optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypeOptions = [
  {
    value: "secret_santa",
    label: "Amigo Secreto",
    icon: Gift,
    description: "Sorteio automático com lista de desejos",
  },
  {
    value: "themed_night",
    label: "Noite Temática",
    icon: PartyPopper,
    description: "Festa com tema e lista de tarefas",
  },
  {
    value: "collective_gift",
    label: "Presente Coletivo",
    icon: Heart,
    description: "Vaquinha para presente compartilhado",
  },
  {
    value: "creative_challenge",
    label: "Desafio Criativo",
    icon: Sparkles,
    description: "Competição com votação",
  },
];

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      eventType: undefined,
      eventDate: undefined,
      location: "",
      description: "",
      isPublic: false,
      budgetLimit: "",
    },
  });

  const selectedType = form.watch("eventType");

  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      const typeSpecificData: Record<string, any> = {};
      
      if (data.eventType === "secret_santa" && data.budgetLimit) {
        typeSpecificData.budgetLimit = parseFloat(data.budgetLimit);
      }

      const payload = {
        name: data.name,
        eventType: data.eventType,
        eventDate: data.eventDate ? data.eventDate.toISOString() : null,
        location: data.location || null,
        description: data.description || null,
        isPublic: data.isPublic,
        status: "active" as const,
        typeSpecificData: Object.keys(typeSpecificData).length > 0 ? typeSpecificData : null,
      };

      const response = await apiRequest("/api/collab-events", "POST", payload);
      return await response.json() as CollaborativeEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events"] });
      toast({
        title: "Rolê criado!",
        description: "Seu rolê foi criado com sucesso.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar rolê",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-role">
        <DialogHeader>
          <DialogTitle>Criar Novo Rolê</DialogTitle>
          <DialogDescription>
            Organize um encontro colaborativo com seus amigos
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Rolê</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Amigo Secreto de Natal 2025"
                      data-testid="input-role-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Rolê</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-role-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            data-testid={`option-type-${option.value}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "secret_santa" && (
              <FormField
                control={form.control}
                name="budgetLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Orçamento (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50.00"
                        data-testid="input-budget-limit"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor máximo sugerido para os presentes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data e Hora (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-select-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                          ) : (
                            <span>Selecione a data e hora</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 space-y-3">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            if (date) {
                              const currentTime = field.value || new Date();
                              date.setHours(currentTime.getHours());
                              date.setMinutes(currentTime.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                          locale={ptBR}
                          data-testid="calendar-event-date"
                        />
                        <div className="flex items-center gap-2 border-t pt-3">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Hora
                            </label>
                            <Select
                              value={field.value ? field.value.getHours().toString() : "12"}
                              onValueChange={(hour) => {
                                const date = field.value || new Date();
                                date.setHours(parseInt(hour));
                                field.onChange(new Date(date));
                              }}
                            >
                              <SelectTrigger data-testid="select-hour">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Minuto
                            </label>
                            <Select
                              value={field.value ? field.value.getMinutes().toString() : "0"}
                              onValueChange={(minute) => {
                                const date = field.value || new Date();
                                date.setMinutes(parseInt(minute));
                                field.onChange(new Date(date));
                              }}
                            >
                              <SelectTrigger data-testid="select-minute">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 60 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {field.value && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mt-5"
                              onClick={() => field.onChange(null)}
                              data-testid="button-clear-date"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Clique para selecionar data e hora do evento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Casa do João"
                      data-testid="input-location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione detalhes sobre o rolê..."
                      className="resize-none"
                      rows={3}
                      data-testid="input-description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Rolê Público</FormLabel>
                    <FormDescription>
                      Qualquer pessoa com o link pode visualizar (ainda não pode participar sem convite)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-public"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createRoleMutation.isPending}
                data-testid="button-submit"
              >
                {createRoleMutation.isPending ? "Criando..." : "Criar Rolê"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
