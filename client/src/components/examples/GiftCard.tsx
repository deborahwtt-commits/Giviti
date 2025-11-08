import GiftCard from "../GiftCard";

export default function GiftCardExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl">
      <GiftCard
        id="1"
        name="Fone de Ouvido Bluetooth Premium"
        description="Som de alta qualidade com cancelamento de ruído ativo. Perfeito para quem ama música."
        imageUrl="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
        priceRange="R$ 200 - R$ 350"
        onViewDetails={() => console.log("View details clicked")}
      />
      <GiftCard
        id="2"
        name="Kit de Cuidados com a Pele"
        description="Conjunto completo de produtos naturais para rotina de skincare diária."
        imageUrl="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"
        priceRange="R$ 150 - R$ 280"
        onViewDetails={() => console.log("View details clicked")}
        isFavorite={true}
      />
      <GiftCard
        id="3"
        name="Livro 'O Poder do Hábito'"
        description="Best-seller sobre como criar hábitos positivos e transformar sua vida."
        imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop"
        priceRange="R$ 35 - R$ 60"
        onViewDetails={() => console.log("View details clicked")}
      />
      <GiftCard
        id="4"
        name="Smartwatch Fitness Tracker"
        description="Monitore atividades físicas, sono e saúde com estilo moderno."
        imageUrl="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
        priceRange="R$ 400 - R$ 800"
        onViewDetails={() => console.log("View details clicked")}
        isPurchased={true}
      />
    </div>
  );
}
