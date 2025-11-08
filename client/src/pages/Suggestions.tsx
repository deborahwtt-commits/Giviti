import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import GiftCard from "@/components/GiftCard";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { GiftSuggestion } from "@shared/schema";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";
import EmptyState from "@/components/EmptyState";

export default function Suggestions() {
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState([1000]);
  const [category, setCategory] = useState<string>("");
  const { toast } = useToast();

  const { data: allSuggestions, isLoading: suggestionsLoading, error: suggestionsError } = useQuery<GiftSuggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  useEffect(() => {
    if (suggestionsError && isUnauthorizedError(suggestionsError as Error)) {
      toast({
        title: "Sessão Expirada",
        description: "Você foi desconectado. Redirecionando para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [suggestionsError, toast]);

  const categories = Array.from(
    new Set(allSuggestions?.map((s) => s.category) || [])
  ).sort();

  const filteredSuggestions = allSuggestions?.filter((suggestion) => {
    const matchesCategory = !category || suggestion.category === category;
    const matchesBudget = suggestion.priceMin <= budget[0];
    return matchesCategory && matchesBudget;
  }) || [];

  const formatPriceRange = (min: number, max: number) => {
    return `R$ ${min} - R$ ${max}`;
  };

  const handleClearFilters = () => {
    setCategory("");
    setBudget([1000]);
  };

  if (suggestionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sugestões...</p>
        </div>
      </div>
    );
  }

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
                  data-testid="button-close-filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Categoria
                  </Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Orçamento Máximo: R$ {budget[0]}
                  </Label>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    max={2000}
                    min={50}
                    step={50}
                    className="mt-2"
                    data-testid="slider-budget"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>R$ 50</span>
                    <span>R$ 2.000</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearFilters}
                  data-testid="button-clear-filters"
                >
                  Limpar Filtros
                </Button>
              </div>
            </Card>
          </aside>

          <div className="flex-1">
            {filteredSuggestions.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'resultado' : 'resultados'}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSuggestions.map((gift) => (
                    <GiftCard
                      key={gift.id}
                      id={gift.id}
                      name={gift.name}
                      description={gift.description}
                      imageUrl={gift.imageUrl}
                      priceRange={formatPriceRange(gift.priceMin, gift.priceMax)}
                      onViewDetails={() => {
                        toast({
                          title: gift.name,
                          description: "Funcionalidade de detalhes em breve!",
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            ) : !allSuggestions || allSuggestions.length === 0 ? (
              <EmptyState
                image={emptySuggestionsImage}
                title="Nenhuma sugestão disponível"
                description="Adicione presenteados e eventos para começar a receber sugestões personalizadas de presentes."
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma sugestão encontrada com os filtros selecionados.
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  data-testid="button-clear-filters-empty"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
