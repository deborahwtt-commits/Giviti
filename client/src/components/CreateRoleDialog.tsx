import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Gift, PartyPopper, Heart, Calendar as CalendarIcon, X, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CollaborativeEvent } from "@shared/schema";

const createRoleSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  eventType: z.enum(["secret_santa", "themed_night", "collective_gift", "creative_challenge"]),
  eventDate: z.date({ required_error: "Data e hora são obrigatórios" }),
  confirmationDeadline: z.date({ required_error: "Data limite para confirmação é obrigatória" }),
  location: z.string().min(1, "Local é obrigatório").max(200),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  budgetLimit: z.string().optional(),
  themedNightCategoryId: z.string().optional(),
  // Collective gift specific fields
  giftName: z.string().max(100).optional(),
  giftDescription: z.string().max(500).optional(),
  purchaseLink: z.string().url("Link inválido").max(500).optional().or(z.literal("")),
  targetAmount: z.string().optional(),
  recipientName: z.string().max(100).optional(),
}).refine((data) => {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(data.eventDate);
  return selectedDate >= today;
}, {
  message: "A data do rolê deve ser hoje ou no futuro",
  path: ["eventDate"],
}).refine((data) => {
  // Confirmation deadline must be today or in the future
  const today = startOfDay(new Date());
  const deadline = startOfDay(data.confirmationDeadline);
  return deadline >= today;
}, {
  message: "A data limite deve ser hoje ou no futuro",
  path: ["confirmationDeadline"],
}).refine((data) => {
  // Confirmation deadline must be before or equal to event date
  return data.confirmationDeadline <= data.eventDate;
}, {
  message: "A data limite de confirmação deve ser antes da data do evento",
  path: ["confirmationDeadline"],
}).refine((data) => {
  // Require targetAmount for collective gift
  if (data.eventType === "collective_gift") {
    return data.targetAmount && parseFloat(data.targetAmount) > 0;
  }
  return true;
}, {
  message: "O valor alvo é obrigatório para presente coletivo",
  path: ["targetAmount"],
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
];

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const { toast } = useToast();

  const { data: themedCategories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery<Array<{ id: string; name: string; description: string | null }>>({
    queryKey: ["/api/themed-night-categories"],
    enabled: open,
  });

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      eventType: undefined,
      eventDate: undefined,
      confirmationDeadline: undefined,
      location: "",
      description: "",
      isPublic: false,
      budgetLimit: "",
      themedNightCategoryId: "",
      giftName: "",
      giftDescription: "",
      purchaseLink: "",
      targetAmount: "",
      recipientName: "",
    },
  });

  const selectedType = form.watch("eventType");
  const selectedCategoryId = form.watch("themedNightCategoryId");
  
  // Find the selected category to show its description
  const selectedCategory = themedCategories.find(cat => cat.id === selectedCategoryId);

  // Show toast error if categories fail to load
  if (categoriesError && selectedType === "themed_night") {
    toast({
      title: "Erro ao carregar temas",
      description: "Não foi possível carregar os temas disponíveis. Tente novamente.",
      variant: "destructive",
    });
  }

  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      const typeSpecificData: Record<string, any> = {};
      
      if (data.eventType === "secret_santa" && data.budgetLimit) {
        typeSpecificData.budgetLimit = parseFloat(data.budgetLimit);
      }
      
      if (data.eventType === "collective_gift") {
        // Store amounts in cents for precision
        if (data.targetAmount) {
          typeSpecificData.targetAmount = Math.round(parseFloat(data.targetAmount) * 100);
        }
        if (data.giftName) {
          typeSpecificData.giftName = data.giftName;
        }
        if (data.giftDescription) {
          typeSpecificData.giftDescription = data.giftDescription;
        }
        if (data.purchaseLink) {
          typeSpecificData.purchaseLink = data.purchaseLink;
        }
        if (data.recipientName) {
          typeSpecificData.recipientName = data.recipientName;
        }
      }

      const payload = {
        name: data.name,
        eventType: data.eventType,
        eventDate: data.eventDate.toISOString(),
        confirmationDeadline: data.confirmationDeadline.toISOString(),
        location: data.location,
        description: data.description || null,
        isPublic: data.isPublic,
        status: "active" as const,
        themedNightCategoryId: data.eventType === "themed_night" && data.themedNightCategoryId ? data.themedNightCategoryId : null,
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

            {selectedType === "themed_night" && (
              <FormField
                control={form.control}
                name="themedNightCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qual é a boa?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-themed-category">
                          <SelectValue placeholder={isLoadingCategories ? "Carregando temas..." : "Selecione o tema"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {themedCategories.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Nenhum tema disponível
                          </div>
                        ) : (
                          themedCategories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              data-testid={`option-category-${category.id}`}
                            >
                              <div>
                                <div className="font-medium">{category.name}</div>
                                {category.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha o tema da noite temática
                    </FormDescription>
                    <FormMessage />
                    
                    {/* Show selected category description */}
                    {selectedCategory?.description && (
                      <div 
                        className="mt-3 p-3 rounded-md bg-muted/50 border border-muted text-sm text-muted-foreground"
                        data-testid="themed-category-description"
                      >
                        <p className="font-medium text-foreground mb-1">{selectedCategory.name}</p>
                        <p>{selectedCategory.description}</p>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Collective Gift specific fields */}
            {selectedType === "collective_gift" && (
              <div className="space-y-4 p-4 border rounded-lg bg-pink-50/50 dark:bg-pink-950/20">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Detalhes do Presente
                </h4>
                
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem vai receber o presente?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Maria (aniversariante)"
                          data-testid="input-recipient-name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nome da pessoa que vai receber o presente coletivo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor alvo (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ex: 500.00"
                          data-testid="input-target-amount"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor total que o grupo pretende arrecadar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="giftName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do presente (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: iPhone 15 Pro"
                          data-testid="input-gift-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="giftDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do presente (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes sobre o presente escolhido..."
                          data-testid="input-gift-description"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchaseLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link para compra (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://loja.com/produto"
                          data-testid="input-purchase-link"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link do produto na loja online
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data e Hora *</FormLabel>
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
              name="confirmationDeadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data limite para confirmação *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-select-deadline"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione a data limite</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            if (date) {
                              date.setHours(23, 59, 59);
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                          locale={ptBR}
                          data-testid="calendar-deadline"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Participantes não poderão confirmar presença após esta data
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
                  <FormLabel>Local *</FormLabel>
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
