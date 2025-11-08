import GiftListItem from "../GiftListItem";

export default function GiftListItemExample() {
  return (
    <div className="space-y-4 max-w-3xl">
      <GiftListItem
        id="1"
        name="Fone de Ouvido Bluetooth Premium"
        recipientName="João Silva"
        occasion="Aniversário"
        price="R$ 280"
        imageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"
        onTogglePurchased={() => console.log("Toggle purchased")}
        onViewDetails={() => console.log("View details")}
        onRemove={() => console.log("Remove gift")}
      />

      <GiftListItem
        id="2"
        name="Kit de Cuidados com a Pele"
        recipientName="Ana Costa"
        occasion="Formatura"
        price="R$ 220"
        imageUrl="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop"
        isPurchased={true}
        purchaseDate="15 Nov, 2024"
        onViewDetails={() => console.log("View details")}
      />

      <GiftListItem
        id="3"
        name="Smartwatch Fitness Tracker"
        recipientName="Pedro Santos"
        occasion="Casamento"
        price="R$ 650"
        imageUrl="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop"
        onTogglePurchased={() => console.log("Toggle purchased")}
        onViewDetails={() => console.log("View details")}
        onRemove={() => console.log("Remove gift")}
      />
    </div>
  );
}
