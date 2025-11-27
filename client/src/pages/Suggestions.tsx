import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, X, Gift, Heart, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { GiftSuggestion, Recipient, UserGift } from "@shared/schema";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";
import EmptyState from "@/components/EmptyState";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CompactGiftCardProps {
  gift: GiftSuggestion;
  recipientId?: string;
  toast: any;
  userGifts?: UserGift[];
}

function CompactGiftCard({ gift, recipientId, toast, userGifts }: CompactGiftCardProps) {
  // Find existing userGift for this suggestion and recipient
  // Only match if both suggestionId AND recipientId match
  const existingGift = recipientId 
    ? userGifts?.find(ug => ug.suggestionId === gift.id && ug.recipientId === recipientId)
    : undefined;

  const [favorite, setFavorite] = useState(existingGift?.isFavorite ?? false);
  const [purchased, setPurchased] = useState(existingGift?.isPurchased ?? false);

  useEffect(() => {
    setFavorite(existingGift?.isFavorite ?? false);
    setPurchased(existingGift?.isPurchased ?? false);
  }, [existingGift]);

  const createGiftMutation = useMutation({
    mutationFn: async (data: { isFavorite: boolean; isPurchased: boolean }) => {
      if (!recipientId) {
        throw new Error("Recipient required to save gift");
      }
      return await apiRequest("/api/gifts", "POST", {
        recipientId,
        suggestionId: gift.id,
        name: gift.name,
        description: gift.description,
        imageUrl: gift.imageUrl,
        price: gift.price,
        isFavorite: data.isFavorite,
        isPurchased: data.isPurchased,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gifts"] });
    },
  });

  const updateGiftMutation = useMutation({
    mutationFn: async (data: { isFavorite: boolean; isPurchased: boolean }) => {
      if (!existingGift) return;
      return await apiRequest(`/api/gifts/${existingGift.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gifts"] });
    },
  });

  const handleFavoriteToggle = async () => {
    if (!recipientId) {
      toast({
        title: "Selecione um presenteado",
        description: "Para salvar favoritos, escolha um presenteado específico no filtro.",
        variant: "destructive",
      });
      return;
    }

    const newFavorite = !favorite;
    setFavorite(newFavorite);

    try {
      if (existingGift) {
        await updateGiftMutation.mutateAsync({
          isFavorite: newFavorite,
          isPurchased: purchased,
        });
      } else {
        await createGiftMutation.mutateAsync({
          isFavorite: newFavorite,
          isPurchased: false,
        });
      }
    } catch (error) {
      setFavorite(!newFavorite);
      toast({
        title: "Erro",
        description: "Não foi possível salvar favorito",
        variant: "destructive",
      });
    }
  };

  const handlePurchasedToggle = async (checked: boolean) => {
    if (!recipientId) {
      toast({
        title: "Selecione um presenteado",
        description: "Para marcar como comprado, escolha um presenteado específico no filtro.",
        variant: "destructive",
      });
      return;
    }

    setPurchased(checked);

    try {
      if (existingGift) {
        await updateGiftMutation.mutateAsync({
          isFavorite: favorite,
          isPurchased: checked,
        });
        if (checked) {
          toast({
            title: "Presente Comprado!",
            description: `${gift.name} foi marcado como comprado.`,
          });
        }
      } else {
        await createGiftMutation.mutateAsync({
          isFavorite: false,
          isPurchased: checked,
        });
        if (checked) {
          toast({
            title: "Presente Comprado!",
            description: `${gift.name} foi marcado como comprado.`,
          });
        }
      }
    } catch (error) {
      setPurchased(!checked);
      toast({
        title: "Erro",
        description: "Não foi possível marcar como comprado",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden group hover-elevate" data-testid={`card-suggestion-${gift.id}`}>
      <div className="relative aspect-square bg-muted">
        <img
          src={gift.imageUrl}
          alt={gift.name}
          className="w-full h-full object-cover"
        />
        
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            favorite
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-foreground hover-elevate"
          }`}
          data-testid={`button-favorite-${gift.id}`}
          aria-label="Favoritar"
        >
          <Heart className={`w-3 h-3 ${favorite ? "fill-current" : ""}`} />
        </button>

        <div className="absolute bottom-2 left-2">
          <div className="flex items-center gap-1.5">
            <Checkbox
              checked={purchased}
              onCheckedChange={handlePurchasedToggle}
              id={`purchased-${gift.id}`}
              data-testid={`checkbox-purchased-${gift.id}`}
              className="bg-background h-4 w-4"
            />
            <label
              htmlFor={`purchased-${gift.id}`}
              className="text-xs font-medium text-background bg-foreground/90 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Comprado
            </label>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <Badge variant="secondary" className="text-xs mb-2">
          R$ {gift.price}
        </Badge>
        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
          {gift.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {gift.description}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            toast({
              title: gift.name,
              description: "Funcionalidade de detalhes em breve!",
            });
          }}
          data-testid={`button-view-details-${gift.id}`}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}

export default function Suggestions() {
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState([1000]);
  const [category, setCategory] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    setVisibleCount(5);
  }, [category, selectedRecipient, budget]);

  const { data: allSuggestions, isLoading: suggestionsLoading, error: suggestionsError } = useQuery<GiftSuggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const { data: recipients, isLoading: recipientsLoading } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: userGifts } = useQuery<UserGift[]>({
    queryKey: ["/api/gifts"],
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

  const selectedRecipientData = selectedRecipient && selectedRecipient !== "all"
    ? recipients?.find(r => r.id === selectedRecipient)
    : null;

  const filteredSuggestions = allSuggestions?.filter((suggestion) => {
    const matchesCategory = !category || category === "all" || suggestion.category === category;
    const matchesBudget = suggestion.price <= budget[0];
    
    let matchesRecipient = true;
    if (selectedRecipientData) {
      const recipientInterests = selectedRecipientData.interests || [];
      const suggestionTags = suggestion.tags || [];
      
      if (recipientInterests.length > 0) {
        matchesRecipient = recipientInterests.some(interest => 
          suggestionTags.some(tag => 
            tag.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(tag.toLowerCase())
          ) || suggestion.category.toLowerCase().includes(interest.toLowerCase())
        );
      }
    }
    
    return matchesCategory && matchesBudget && matchesRecipient;
  }) || [];

  // Group suggestions by recipient when "Todos" is selected
  const groupedByRecipient = !selectedRecipient || selectedRecipient === "all"
    ? (recipients || []).map(recipient => {
        const recipientInterests = recipient.interests || [];
        const matchingSuggestions = (allSuggestions || []).filter((suggestion) => {
          const matchesCategory = !category || category === "all" || suggestion.category === category;
          const matchesBudget = suggestion.price <= budget[0];
          
          let matchesRecipient = true;
          const suggestionTags = suggestion.tags || [];
          
          if (recipientInterests.length > 0) {
            matchesRecipient = recipientInterests.some(interest => 
              suggestionTags.some(tag => 
                tag.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(tag.toLowerCase())
              ) || suggestion.category.toLowerCase().includes(interest.toLowerCase())
            );
          }
          
          return matchesCategory && matchesBudget && matchesRecipient;
        });
        
        return {
          recipient,
          suggestions: matchingSuggestions.slice(0, 5) // Show up to 5 per recipient
        };
      }).filter(group => group.suggestions.length > 0)
    : [];

  const visibleSuggestions = filteredSuggestions.slice(0, visibleCount);
  const hasMoreSuggestions = filteredSuggestions.length > visibleCount;

  const selectedRecipientNames = selectedRecipientData ? [selectedRecipientData.name] : [];


  const handleClearFilters = () => {
    setCategory("all");
    setBudget([1000]);
    setSelectedRecipient("all");
    setVisibleCount(5);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  if (suggestionsLoading || recipientsLoading) {
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
            {selectedRecipientNames.length > 0 ? (
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Para: <span className="font-medium text-foreground">{selectedRecipientNames.join(", ")}</span>
              </p>
            ) : (
              <p className="text-muted-foreground mt-2">
                Encontre o presente perfeito
              </p>
            )}
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
                    Presenteado
                  </Label>
                  <Select
                    value={selectedRecipient}
                    onValueChange={setSelectedRecipient}
                  >
                    <SelectTrigger data-testid="select-recipient">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {recipients?.map((recipient) => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="all">Todas</SelectItem>
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
            {selectedRecipientData ? (
              // Single recipient selected
              filteredSuggestions.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Mostrando {visibleSuggestions.length} de {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'sugestão' : 'sugestões'}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <Gift className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Para: {selectedRecipientData.name}</h2>
                      </div>
                      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {visibleSuggestions.map((gift) => (
                          <CompactGiftCard
                            key={gift.id}
                            gift={gift}
                            recipientId={selectedRecipientData.id}
                            
                            toast={toast}
                            userGifts={userGifts}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {hasMoreSuggestions && (
                    <div className="flex justify-center mt-8">
                      <Button 
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                        data-testid="button-load-more"
                      >
                        Ver mais sugestões
                      </Button>
                    </div>
                  )}
                </>
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
              )
            ) : groupedByRecipient.length > 0 ? (
              // "Todos" selected - show grouped by recipient
              <div className="space-y-8">
                {groupedByRecipient.map((group) => (
                  <div key={group.recipient.id}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <Gift className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-lg" data-testid={`heading-recipient-${group.recipient.id}`}>
                        Para: {group.recipient.name}
                      </h2>
                    </div>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {group.suggestions.map((gift) => (
                        <CompactGiftCard
                          key={gift.id}
                          gift={gift}
                          recipientId={group.recipient.id}
                          
                          toast={toast}
                          userGifts={userGifts}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSuggestions.length > 0 ? (
              // Fallback: Show all suggestions when no recipients or no matches
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Mostrando {visibleSuggestions.length} de {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'sugestão' : 'sugestões'}
                </div>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleSuggestions.map((gift) => (
                    <CompactGiftCard
                      key={gift.id}
                      gift={gift}
                      
                      toast={toast}
                      userGifts={userGifts}
                    />
                  ))}
                </div>
                {hasMoreSuggestions && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      data-testid="button-load-more"
                    >
                      Ver mais sugestões
                    </Button>
                  </div>
                )}
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
