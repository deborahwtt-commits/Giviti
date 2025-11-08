import RecipientCard from "../RecipientCard";

export default function RecipientCardExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
      <RecipientCard
        id="1"
        name="João Silva"
        age={28}
        relationship="Amigo"
        interests={["Tecnologia", "Games", "Música", "Fotografia", "Viagens"]}
        nextEventDate="25 de Dez"
        nextEventName="Aniversário"
        onViewSuggestions={() => console.log("View suggestions clicked")}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <RecipientCard
        id="2"
        name="Ana Costa"
        age={24}
        relationship="Irmã"
        interests={["Leitura", "Yoga", "Culinária"]}
        nextEventDate="10 de Jan"
        nextEventName="Formatura"
        onViewSuggestions={() => console.log("View suggestions clicked")}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
      <RecipientCard
        id="3"
        name="Pedro Santos"
        age={32}
        relationship="Parceiro"
        interests={["Esportes", "Cinema", "Cervejaria"]}
        onViewSuggestions={() => console.log("View suggestions clicked")}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  );
}
