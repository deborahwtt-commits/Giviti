import { useState } from "react";
import RecipientCard from "@/components/RecipientCard";
import RecipientForm from "@/components/RecipientForm";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import emptyRecipientsImage from "@assets/generated_images/Empty_state_no_recipients_cc3b64a6.png";

export default function Recipients() {
  const [showForm, setShowForm] = useState(false);
  const [hasRecipients] = useState(true);

  const mockRecipients = [
    {
      id: "1",
      name: "João Silva",
      age: 28,
      relationship: "Amigo",
      interests: ["Tecnologia", "Games", "Música", "Fotografia", "Viagens"],
      nextEventDate: "25 de Dez",
      nextEventName: "Aniversário",
    },
    {
      id: "2",
      name: "Ana Costa",
      age: 24,
      relationship: "Irmã",
      interests: ["Leitura", "Yoga", "Culinária"],
      nextEventDate: "10 de Jan",
      nextEventName: "Formatura",
    },
    {
      id: "3",
      name: "Pedro Santos",
      age: 32,
      relationship: "Parceiro",
      interests: ["Esportes", "Cinema", "Cervejaria"],
    },
    {
      id: "4",
      name: "Maria Oliveira",
      age: 55,
      relationship: "Mãe",
      interests: ["Jardinagem", "Culinária", "Artesanato"],
      nextEventDate: "15 de Mar",
      nextEventName: "Dia das Mães",
    },
    {
      id: "5",
      name: "Carlos Mendes",
      age: 19,
      relationship: "Primo",
      interests: ["Games", "Skate", "Música"],
    },
    {
      id: "6",
      name: "Beatriz Lima",
      age: 26,
      relationship: "Colega",
      interests: ["Fitness", "Moda", "Fotografia", "Viagens"],
      nextEventDate: "5 de Abr",
      nextEventName: "Aniversário",
    },
  ];

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

            {hasRecipients ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockRecipients.map((recipient) => (
                  <RecipientCard
                    key={recipient.id}
                    id={recipient.id}
                    name={recipient.name}
                    age={recipient.age}
                    relationship={recipient.relationship}
                    interests={recipient.interests}
                    nextEventDate={recipient.nextEventDate}
                    nextEventName={recipient.nextEventName}
                    onViewSuggestions={() =>
                      console.log(`View suggestions for ${recipient.name}`)
                    }
                    onEdit={() => console.log(`Edit ${recipient.name}`)}
                    onDelete={() => console.log(`Delete ${recipient.name}`)}
                  />
                ))}
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
                Novo Presenteado
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                data-testid="button-close-form"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <RecipientForm
                onSubmit={(data) => {
                  console.log("Recipient created:", data);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
