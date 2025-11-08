import { useState } from "react";
import GiftCard from "@/components/GiftCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SlidersHorizontal, X } from "lucide-react";

export default function Suggestions() {
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState([500]);
  const [sortBy, setSortBy] = useState("relevant");

  const mockGifts = [
    {
      id: "1",
      name: "Fone de Ouvido Bluetooth Premium",
      description:
        "Som de alta qualidade com cancelamento de ruído ativo. Perfeito para quem ama música.",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      priceRange: "R$ 200 - R$ 350",
    },
    {
      id: "2",
      name: "Kit de Cuidados com a Pele",
      description:
        "Conjunto completo de produtos naturais para rotina de skincare diária.",
      imageUrl:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
      priceRange: "R$ 150 - R$ 280",
    },
    {
      id: "3",
      name: "Livro 'O Poder do Hábito'",
      description:
        "Best-seller sobre como criar hábitos positivos e transformar sua vida.",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
      priceRange: "R$ 35 - R$ 60",
    },
    {
      id: "4",
      name: "Smartwatch Fitness Tracker",
      description:
        "Monitore atividades físicas, sono e saúde com estilo moderno.",
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      priceRange: "R$ 400 - R$ 800",
    },
    {
      id: "5",
      name: "Câmera Instantânea Polaroid",
      description:
        "Capture e imprima memórias instantaneamente com design vintage moderno.",
      imageUrl:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
      priceRange: "R$ 350 - R$ 600",
    },
    {
      id: "6",
      name: "Kit de Chá Gourmet",
      description:
        "Seleção premium de chás importados com infusor e acessórios.",
      imageUrl:
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop",
      priceRange: "R$ 80 - R$ 150",
    },
    {
      id: "7",
      name: "Mochila Executiva Impermeável",
      description:
        "Design moderno com compartimento para laptop e USB charging port.",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      priceRange: "R$ 180 - R$ 320",
    },
    {
      id: "8",
      name: "Difusor de Aromas com LED",
      description:
        "Aromaterapia e iluminação ambiente em um único produto elegante.",
      imageUrl:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
      priceRange: "R$ 90 - R$ 180",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-foreground">
              Sugestões de Presentes
            </h1>
            <p className="text-muted-foreground mt-2">
              Encontre o presente perfeito
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="flex gap-6">
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 lg:mb-4">
                <h3 className="font-semibold text-lg text-foreground">
                  Filtros
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Orçamento: até R$ {budget[0]}</Label>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    max={1000}
                    step={50}
                    data-testid="slider-budget"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 0</span>
                    <span>R$ 1000+</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occasion">Ocasião</Label>
                  <Select>
                    <SelectTrigger id="occasion" data-testid="select-occasion">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Aniversário</SelectItem>
                      <SelectItem value="wedding">Casamento</SelectItem>
                      <SelectItem value="graduation">Formatura</SelectItem>
                      <SelectItem value="christmas">Natal</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Para quem</Label>
                  <Select>
                    <SelectTrigger id="recipient" data-testid="select-recipient">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Ana Costa</SelectItem>
                      <SelectItem value="3">Pedro Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" data-testid="select-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevant">Mais Relevantes</SelectItem>
                      <SelectItem value="price-low">Menor Preço</SelectItem>
                      <SelectItem value="price-high">Maior Preço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-clear-filters"
                >
                  Limpar Filtros
                </Button>
              </div>
            </Card>
          </aside>

          <main className="flex-1">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  id={gift.id}
                  name={gift.name}
                  description={gift.description}
                  imageUrl={gift.imageUrl}
                  priceRange={gift.priceRange}
                  onViewDetails={() =>
                    console.log(`View details for ${gift.name}`)
                  }
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
