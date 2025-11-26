import { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/detailed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advanced-stats"] });
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    },
  });

  const isSelfEdit = currentUser?.id === user.id;

  const onSubmit = (data: EditUserFormData) => {
    // Only send fields that have changed
    const updates: Partial<EditUserFormData> = {};
    if (data.firstName !== user.firstName) updates.firstName = data.firstName;
    if (data.lastName !== user.lastName) updates.lastName = data.lastName;
    if (data.role !== user.role) updates.role = data.role;
    if (data.isActive !== user.isActive) updates.isActive = data.isActive;

    // Hard guard: prevent self-demotion or self-deactivation
    if (isSelfEdit) {
      const isDemoting = updates.role && updates.role !== "admin";
      const isDeactivating = updates.isActive === false;
      
      if (isDemoting || isDeactivating) {
        toast({
          title: "Ação bloqueada",
          description: "Você não pode remover suas próprias permissões administrativas ou desativar sua conta. Peça a outro administrador para fazer isso.",
          variant: "destructive",
        });
        return;
      }
    }

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

  return (
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
  );
}
