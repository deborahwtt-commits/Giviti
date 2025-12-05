import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const addParticipantSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
});

type AddParticipantFormValues = z.infer<typeof addParticipantSchema>;

interface AddParticipantDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddParticipantDialog({
  eventId,
  open,
  onOpenChange,
}: AddParticipantDialogProps) {
  const { toast } = useToast();

  const form = useForm<AddParticipantFormValues>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: async (data: AddParticipantFormValues) => {
      const response = await apiRequest(`/api/collab-events/${eventId}/participants`, "POST", data);
      return response.json() as Promise<{ emailSent?: boolean }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", eventId, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", eventId] });
      toast({
        title: "Participante adicionado",
        description: data.emailSent 
          ? "Convite enviado por email com sucesso!" 
          : "O participante foi adicionado com sucesso.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddParticipantFormValues) => {
    addParticipantMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-participant">
        <DialogHeader>
          <DialogTitle>Adicionar Participante</DialogTitle>
          <DialogDescription>
            Convide alguém para participar deste rolê. Enviaremos um convite por email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="exemplo@email.com"
                      {...field}
                      data-testid="input-participant-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do participante"
                      {...field}
                      data-testid="input-participant-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addParticipantMutation.isPending}
                data-testid="button-cancel-add-participant"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addParticipantMutation.isPending}
                data-testid="button-submit-add-participant"
              >
                {addParticipantMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Adicionar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
