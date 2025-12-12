import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Calendar, ArrowLeft, CalendarDays, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Occasion, User } from "@shared/schema";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const occasionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  monthDay: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type OccasionFormData = z.infer<typeof occasionSchema>;

function CreateOccasionDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<OccasionFormData>({
    resolver: zodResolver(occasionSchema),
    defaultValues: {
      name: "",
      description: "",
      isRecurring: false,
      monthDay: "",
      icon: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OccasionFormData) => {
      return await apiRequest("/api/admin/occasions", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/occasions?includeInactive=true"] });
      toast({
        title: "Data criada",
        description: "A data comemorativa foi criada com sucesso.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar data",
        description: error.message || "Não foi possível criar a data comemorativa.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-occasion">
          <Plus className="w-4 h-4 mr-2" />
          Nova Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-occasion">
        <DialogHeader>
          <DialogTitle>Nova Data Comemorativa</DialogTitle>
          <DialogDescription>
            Adicione um novo tipo de data especial para eventos
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Natal, Aniversário, Dia das Mães"
                      {...field}
                      data-testid="input-occasion-name"
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a data comemorativa..."
                      {...field}
                      data-testid="input-occasion-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Data Recorrente</FormLabel>
                    <FormDescription>
                      Marque se a data se repete todo ano (ex: Natal, Dia das Mães)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-is-recurring"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <FormField
                control={form.control}
                name="monthDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia/Mês (DD/MM)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 25/12 para Natal"
                        {...field}
                        data-testid="input-occasion-monthday"
                      />
                    </FormControl>
                    <FormDescription>
                      Formato: DD/MM (deixe vazio para datas variáveis como Páscoa)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (emoji)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 🎄 🎂 💝"
                      {...field}
                      data-testid="input-occasion-icon"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Datas inativas não aparecem para os usuários
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-create"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Data
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditOccasionDialog({ occasion }: { occasion: Occasion }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<OccasionFormData>({
    resolver: zodResolver(occasionSchema),
    defaultValues: {
      name: occasion.name,
      description: occasion.description || "",
      isRecurring: occasion.isRecurring,
      monthDay: occasion.monthDay || "",
      icon: occasion.icon || "",
      isActive: occasion.isActive,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: OccasionFormData) => {
      return await apiRequest(`/api/admin/occasions/${occasion.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/occasions?includeInactive=true"] });
      toast({
        title: "Data atualizada",
        description: "A data comemorativa foi atualizada com sucesso.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a data.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid={`button-edit-occasion-${occasion.id}`}>
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-occasion">
        <DialogHeader>
          <DialogTitle>Editar Data Comemorativa</DialogTitle>
          <DialogDescription>
            Atualize as informações da data comemorativa
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-edit-occasion-name" />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="input-edit-occasion-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Data Recorrente</FormLabel>
                    <FormDescription>
                      Marque se a data se repete todo ano
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-edit-is-recurring"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <FormField
                control={form.control}
                name="monthDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia/Mês (DD/MM)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-occasion-monthday" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (emoji)</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-edit-occasion-icon" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Datas inativas não aparecem para os usuários
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-edit-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteOccasionDialog({ occasion }: { occasion: Occasion }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/admin/occasions/${occasion.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/occasions?includeInactive=true"] });
      toast({
        title: "Data excluída",
        description: "A data comemorativa foi excluída com sucesso.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a data.",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setOpen(true)}
        data-testid={`button-delete-occasion-${occasion.id}`}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
      <AlertDialogContent data-testid="dialog-delete-occasion">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Data Comemorativa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir "{occasion.name}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminOccasions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: occasions, isLoading, error } = useQuery<Occasion[]>({
    queryKey: ["/api/admin/occasions?includeInactive=true"],
  });

  if (error) {
    handleAuthError(toast, setLocation);
  }

  const activeOccasions = occasions?.filter(o => o.isActive) || [];
  const inactiveOccasions = occasions?.filter(o => !o.isActive) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                Datas Comemorativas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os tipos de datas especiais disponíveis no sistema
              </p>
            </div>
          </div>
          <CreateOccasionDialog />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Datas Ativas ({activeOccasions.length})
              </h2>
              {activeOccasions.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  Nenhuma data comemorativa cadastrada
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOccasions.map((occasion) => (
                    <Card key={occasion.id} className="hover-elevate" data-testid={`card-occasion-${occasion.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {occasion.icon && (
                              <span className="text-2xl">{occasion.icon}</span>
                            )}
                            <CardTitle className="text-lg">{occasion.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <EditOccasionDialog occasion={occasion} />
                            <DeleteOccasionDialog occasion={occasion} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {occasion.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {occasion.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {occasion.isRecurring && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              Recorrente
                            </Badge>
                          )}
                          {occasion.monthDay && (
                            <Badge variant="outline">
                              {occasion.monthDay}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {inactiveOccasions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                  Datas Inativas ({inactiveOccasions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveOccasions.map((occasion) => (
                    <Card key={occasion.id} className="opacity-60" data-testid={`card-occasion-inactive-${occasion.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {occasion.icon && (
                              <span className="text-2xl">{occasion.icon}</span>
                            )}
                            <CardTitle className="text-lg">{occasion.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <EditOccasionDialog occasion={occasion} />
                            <DeleteOccasionDialog occasion={occasion} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-muted-foreground">
                          Inativo
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
