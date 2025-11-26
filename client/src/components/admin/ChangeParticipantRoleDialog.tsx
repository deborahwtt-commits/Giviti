import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ChangeParticipantRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  participantId: string;
  participantName: string;
  currentRole: string;
}

const roleLabels: Record<string, string> = {
  owner: "Organizador",
  participant: "Participante",
};

export function ChangeParticipantRoleDialog({
  open,
  onOpenChange,
  eventId,
  participantId,
  participantName,
  currentRole,
}: ChangeParticipantRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const { toast } = useToast();

  // Reset selectedRole when currentRole changes (different participant selected)
  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const changeRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      return await apiRequest(
        `/api/collab-events/${eventId}/participants/${participantId}/role`,
        "PATCH",
        { role }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", eventId, "participants"] });
      toast({
        title: "Perfil atualizado",
        description: `O perfil de ${participantName} foi alterado para ${roleLabels[selectedRole]}.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar perfil",
        description: error.message || "Não foi possível alterar o perfil do participante.",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = () => {
    if (selectedRole !== currentRole) {
      changeRoleMutation.mutate(selectedRole);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-change-participant-role">
        <AlertDialogHeader>
          <AlertDialogTitle>Alterar Perfil do Participante</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a alterar o perfil de <strong>{participantName}</strong>.
            Esta ação será registrada no histórico de auditoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 py-4">
          <Label htmlFor="role-select">Novo Perfil</Label>
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={changeRoleMutation.isPending}
          >
            <SelectTrigger id="role-select" data-testid="select-new-role">
              <SelectValue placeholder="Selecione um perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant" data-testid="option-role-participant">
                Participante
              </SelectItem>
              <SelectItem value="owner" data-testid="option-role-owner">
                Organizador
              </SelectItem>
            </SelectContent>
          </Select>
          {selectedRole !== currentRole && (
            <p className="text-sm text-muted-foreground">
              Alterando de <strong>{roleLabels[currentRole]}</strong> para{" "}
              <strong>{roleLabels[selectedRole]}</strong>
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={changeRoleMutation.isPending}
            data-testid="button-cancel-role-change"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={changeRoleMutation.isPending || selectedRole === currentRole}
            data-testid="button-confirm-role-change"
          >
            {changeRoleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              "Confirmar Alteração"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
