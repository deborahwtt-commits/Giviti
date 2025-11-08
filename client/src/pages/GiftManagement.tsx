import { useState } from "react";
import GiftListItem from "@/components/GiftListItem";
import EmptyState from "@/components/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";

export default function GiftManagement() {
  const [hasToBuy] = useState(true);
  const [hasPurchased] = useState(true);

  const toBuyGifts = [
    {
      id: "1",
      name: "Fone de Ouvido Bluetooth Premium",
      recipientName: "João Silva",
      occasion: "Aniversário",
      price: "R$ 280",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
    },
    {
      id: "2",
      name: "Kit de Cuidados com a Pele",
      recipientName: "Ana Costa",
      occasion: "Formatura",
      price: "R$ 220",
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=80&h=80&fit=crop",
    },
    {
      id: "3",
      name: "Smartwatch Fitness Tracker",
      recipientName: "Pedro Santos",
      occasion: "Casamento",
      price: "R$ 650",
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
    },
  ];

  const purchasedGifts = [
    {
      id: "4",
      name: "Livro 'O Poder do Hábito'",
      recipientName: "Carlos Mendes",
      occasion: "Aniversário",
      price: "R$ 45",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=80&fit=crop",
      purchaseDate: "10 Nov, 2024",
    },
    {
      id: "5",
      name: "Câmera Instantânea",
      recipientName: "Beatriz Lima",
      occasion: "Formatura",
      price: "R$ 480",
      imageUrl:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&h=80&fit=crop",
      purchaseDate: "5 Nov, 2024",
    },
  ];

  const allGifts = [...toBuyGifts, ...purchasedGifts];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl text-foreground">
            Meus Presentes
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua lista de presentes
          </p>
        </div>

        <Tabs defaultValue="toBuy" className="space-y-6">
          <TabsList>
            <TabsTrigger value="toBuy" data-testid="tab-to-buy">
              A Comprar ({toBuyGifts.length})
            </TabsTrigger>
            <TabsTrigger value="purchased" data-testid="tab-purchased">
              Comprados ({purchasedGifts.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              Histórico Completo ({allGifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="toBuy">
            {hasToBuy ? (
              <div className="space-y-4">
                {toBuyGifts.map((gift) => (
                  <GiftListItem
                    key={gift.id}
                    id={gift.id}
                    name={gift.name}
                    recipientName={gift.recipientName}
                    occasion={gift.occasion}
                    price={gift.price}
                    imageUrl={gift.imageUrl}
                    onTogglePurchased={() =>
                      console.log(`Toggle purchased: ${gift.name}`)
                    }
                    onViewDetails={() =>
                      console.log(`View details: ${gift.name}`)
                    }
                    onRemove={() => console.log(`Remove: ${gift.name}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                image={emptySuggestionsImage}
                title="Nenhum presente na lista"
                description="Explore nossas sugestões e adicione presentes à sua lista de compras."
                actionLabel="Explorar Sugestões"
                onAction={() => console.log("Explore suggestions")}
              />
            )}
          </TabsContent>

          <TabsContent value="purchased">
            {hasPurchased ? (
              <div className="space-y-4">
                {purchasedGifts.map((gift) => (
                  <GiftListItem
                    key={gift.id}
                    id={gift.id}
                    name={gift.name}
                    recipientName={gift.recipientName}
                    occasion={gift.occasion}
                    price={gift.price}
                    imageUrl={gift.imageUrl}
                    isPurchased={true}
                    purchaseDate={gift.purchaseDate}
                    onViewDetails={() =>
                      console.log(`View details: ${gift.name}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                image={emptySuggestionsImage}
                title="Nenhum presente comprado ainda"
                description="Os presentes que você marcar como comprados aparecerão aqui."
              />
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              {allGifts.map((gift) => (
                <GiftListItem
                  key={gift.id}
                  id={gift.id}
                  name={gift.name}
                  recipientName={gift.recipientName}
                  occasion={gift.occasion}
                  price={gift.price}
                  imageUrl={gift.imageUrl}
                  isPurchased={"purchaseDate" in gift}
                  purchaseDate={
                    "purchaseDate" in gift ? (gift as any).purchaseDate : undefined
                  }
                  onViewDetails={() => console.log(`View details: ${gift.name}`)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
