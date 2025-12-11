import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { KeyRound, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResetPasswordButtonProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

export function ResetPasswordButton({ user }: ResetPasswordButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/admin/users/${user.id}/reset-password`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "E-mail enviado",
        description: `Um link para redefinição de senha foi enviado para ${user.email}.`,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Não foi possível enviar o e-mail de redefinição de senha.",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = () => {
    resetPasswordMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!user.isActive}
          title={user.isActive ? "Redefinir senha" : "Usuário inativo"}
          data-testid={`button-reset-password-${user.id}`}
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent data-testid="dialog-reset-password">
        <AlertDialogHeader>
          <AlertDialogTitle>Redefinir senha</AlertDialogTitle>
          <AlertDialogDescription>
            Um e-mail com link para redefinição de senha será enviado para{" "}
            <strong>{user.email}</strong> ({user.firstName} {user.lastName}).
            <br /><br />
            O link expira em 1 hora.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-reset-password">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={resetPasswordMutation.isPending}
            data-testid="button-confirm-reset-password"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
