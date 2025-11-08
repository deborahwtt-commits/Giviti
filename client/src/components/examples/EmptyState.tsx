import EmptyState from "../EmptyState";
import emptyRecipientsImage from "@assets/generated_images/Empty_state_no_recipients_cc3b64a6.png";
import emptyEventsImage from "@assets/generated_images/Empty_state_no_events_a8c49f04.png";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";

export default function EmptyStateExample() {
  return (
    <div className="space-y-12">
      <EmptyState
        image={emptyRecipientsImage}
        title="Nenhum presenteado ainda"
        description="Adicione pessoas especiais para receber sugestões de presentes personalizadas para cada uma delas."
        actionLabel="Adicionar Presenteado"
        onAction={() => console.log("Add recipient clicked")}
      />

      <EmptyState
        image={emptyEventsImage}
        title="Nenhum evento cadastrado"
        description="Cadastre aniversários, formaturas e outras datas especiais para nunca esquecer de presentear."
        actionLabel="Criar Evento"
        onAction={() => console.log("Create event clicked")}
      />

      <EmptyState
        image={emptySuggestionsImage}
        title="Nenhuma sugestão salva"
        description="Explore nossas sugestões personalizadas e salve seus presentes favoritos."
        actionLabel="Explorar Sugestões"
        onAction={() => console.log("Explore clicked")}
      />
    </div>
  );
}
