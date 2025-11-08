import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import RecipientCard from "@/components/RecipientCard";
import RecipientForm from "@/components/RecipientForm";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import emptyRecipientsImage from "@assets/generated_images/Empty_state_no_recipients_cc3b64a6.png";
import type { Recipient, Event } from "@shared/schema";
import { format } from "date-fns";

export default function Recipients() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: recipients, isLoading: recipientsLoading, error: recipientsError } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: events, error: eventsError } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  useEffect(() => {
    const error = recipientsError || eventsError;
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Sessão Expirada",
        description: "Você foi desconectado. Redirecionando para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [recipientsError, eventsError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/recipients", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Sucesso!",
        description: "Presenteado criado com sucesso.",
      });
      setShowForm(false);
      setEditingRecipient(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Você foi desconectado. Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao criar presenteado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/recipients/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      toast({
        title: "Sucesso!",
        description: "Presenteado atualizado com sucesso.",
      });
      setShowForm(false);
      setEditingRecipient(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Você foi desconectado. Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao atualizar presenteado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/recipients/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Sucesso!",
        description: "Presenteado excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Você foi desconectado. Redirecionando para login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao excluir presenteado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getNextEvent = (recipientId: string) => {
    if (!events) return null;
    const recipientEvents = events.filter(e => e.recipientId === recipientId);
    if (recipientEvents.length === 0) return null;

    const today = new Date();
    const futureEvents = recipientEvents
      .filter(e => new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    return futureEvents[0] || null;
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMM");
    } catch {
      return "";
    }
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este presenteado?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingRecipient) {
      updateMutation.mutate({ id: editingRecipient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecipient(null);
  };

  if (recipientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {!showForm ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading font-bold text-4xl text-foreground">
                  Presenteados
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie as pessoas especiais da sua vida
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                data-testid="button-add-recipient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Presenteado
              </Button>
            </div>

            {recipients && recipients.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipients.map((recipient) => {
                  const nextEvent = getNextEvent(recipient.id);
                  return (
                    <RecipientCard
                      key={recipient.id}
                      id={recipient.id}
                      name={recipient.name}
                      age={recipient.age}
                      relationship={recipient.relationship}
                      interests={recipient.interests}
                      nextEventDate={nextEvent ? formatEventDate(nextEvent.eventDate) : undefined}
                      nextEventName={nextEvent ? (nextEvent.eventName || nextEvent.eventType) : undefined}
                      onViewSuggestions={() => setLocation("/sugestoes")}
                      onEdit={() => handleEdit(recipient)}
                      onDelete={() => handleDelete(recipient.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                image={emptyRecipientsImage}
                title="Nenhum presenteado ainda"
                description="Adicione pessoas especiais para receber sugestões de presentes personalizadas para cada uma delas."
                actionLabel="Adicionar Presenteado"
                onAction={() => setShowForm(true)}
              />
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading font-bold text-4xl text-foreground">
                {editingRecipient ? "Editar Presenteado" : "Novo Presenteado"}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseForm}
                data-testid="button-close-form"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <RecipientForm
                initialData={editingRecipient ? {
                  name: editingRecipient.name,
                  age: editingRecipient.age,
                  gender: editingRecipient.gender,
                  zodiacSign: editingRecipient.zodiacSign || "",
                  relationship: editingRecipient.relationship,
                  interests: editingRecipient.interests,
                } : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
