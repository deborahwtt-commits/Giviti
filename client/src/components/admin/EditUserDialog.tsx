import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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

const editUserSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  role: z.enum(["user", "admin", "manager", "support", "readonly"]),
  isActive: z.boolean(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

const roleLabels: Record<string, string> = {
  user: "Usuário",
  admin: "Administrador",
  manager: "Gerente",
  support: "Suporte",
  readonly: "Somente Leitura",
};

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showSelfEditWarning, setShowSelfEditWarning] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<EditUserFormData | null>(null);
  const [wasSelfDemotion, setWasSelfDemotion] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "user" | "admin" | "manager" | "support" | "readonly",
      isActive: user.isActive,
    },
  });

  // Reset form with fresh user data whenever dialog opens or user prop changes
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as "user" | "admin" | "manager" | "support" | "readonly",
        isActive: user.isActive,
      });
    }
  }, [open, user, form]);

  const editUserMutation = useMutation({
    mutationFn: async (data: Partial<EditUserFormData>) => {
      return await apiRequest(`/api/admin/users/${user.id}`, "PUT", data);
    },
    onSuccess: () => {
      // If this was a self-demotion, redirect to dashboard instead of reloading admin data
      if (wasSelfDemotion) {
        toast({
          title: "Suas permissões foram alteradas",
          description: "Você não tem mais acesso ao painel administrativo. Redirecionando...",
        });
        setOpen(false);
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1500);
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users/detailed"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/advanced-stats"] });
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
        setOpen(false);
      }
      setWasSelfDemotion(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
      setWasSelfDemotion(false);
    },
  });

  const isSelfEdit = currentUser?.id === user.id;

  const onSubmit = (data: EditUserFormData) => {
    // Check if editing self and attempting to demote or deactivate
    if (isSelfEdit) {
      const isDemoting = data.role !== user.role && 
        (data.role === "user" || data.role === "support" || data.role === "readonly");
      const isDeactivating = !data.isActive && user.isActive;
      
      if (isDemoting || isDeactivating) {
        setPendingFormData(data);
        setShowSelfEditWarning(true);
        return;
      }
    }

    // Only send fields that have changed
    const updates: Partial<EditUserFormData> = {};
    if (data.firstName !== user.firstName) updates.firstName = data.firstName;
    if (data.lastName !== user.lastName) updates.lastName = data.lastName;
    if (data.role !== user.role) updates.role = data.role;
    if (data.isActive !== user.isActive) updates.isActive = data.isActive;

    // Only proceed if there are actual changes
    if (Object.keys(updates).length === 0) {
      toast({
        title: "Nenhuma alteração",
        description: "Não há mudanças para salvar.",
      });
      return;
    }

    editUserMutation.mutate(updates);
  };

  const handleConfirmSelfEdit = () => {
    if (pendingFormData) {
      // Only send fields that have changed
      const updates: Partial<EditUserFormData> = {};
      if (pendingFormData.firstName !== user.firstName) updates.firstName = pendingFormData.firstName;
      if (pendingFormData.lastName !== user.lastName) updates.lastName = pendingFormData.lastName;
      if (pendingFormData.role !== user.role) updates.role = pendingFormData.role;
      if (pendingFormData.isActive !== user.isActive) updates.isActive = pendingFormData.isActive;

      // Check if this is a demotion
      const isDemoting = updates.role && 
        (updates.role === "user" || updates.role === "support" || updates.role === "readonly");
      const isDeactivating = updates.isActive === false;
      
      if (isDemoting || isDeactivating) {
        setWasSelfDemotion(true);
      }

      editUserMutation.mutate(updates);
    }
    setShowSelfEditWarning(false);
    setPendingFormData(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            data-testid={`button-edit-user-${user.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-user">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações e permissões do usuário {user.email}
            </DialogDescription>
          </DialogHeader>
          {isSelfEdit && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Você está editando seu próprio perfil. Tenha cuidado ao alterar suas permissões.
              </p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome"
                        {...field}
                        data-testid="input-firstName"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o sobrenome"
                        {...field}
                        data-testid="input-lastName"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user" data-testid="option-role-user">
                          {roleLabels.user}
                        </SelectItem>
                        <SelectItem value="support" data-testid="option-role-support">
                          {roleLabels.support}
                        </SelectItem>
                        <SelectItem value="readonly" data-testid="option-role-readonly">
                          {roleLabels.readonly}
                        </SelectItem>
                        <SelectItem value="manager" data-testid="option-role-manager">
                          {roleLabels.manager}
                        </SelectItem>
                        <SelectItem value="admin" data-testid="option-role-admin">
                          {roleLabels.admin}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Conta Ativa</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value
                          ? "Este usuário pode acessar o sistema"
                          : "Este usuário está bloqueado"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-isActive"
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
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editUserMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {editUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSelfEditWarning} onOpenChange={setShowSelfEditWarning}>
        <AlertDialogContent data-testid="dialog-self-edit-warning">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Atenção: Alterando Suas Próprias Permissões
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a {pendingFormData?.role !== user.role ? "rebaixar seu perfil de acesso" : "desativar sua própria conta"}. 
              {" "}Esta ação pode fazer com que você perca acesso ao painel administrativo.
              <br /><br />
              <strong>Tem certeza que deseja continuar?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowSelfEditWarning(false);
                setPendingFormData(null);
              }}
              data-testid="button-cancel-self-edit"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSelfEdit}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-self-edit"
            >
              Sim, Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
