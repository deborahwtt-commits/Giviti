import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
import { SlidersHorizontal, X, Gift, Heart, ExternalLink, Ticket, AlertTriangle, Loader2, Search, Info, AlertCircle, Sparkles } from "lucide-react";
import { parseISO, isBefore, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { GiftSuggestion, Recipient, RecipientProfile, UserGift, GiftCategory } from "@shared/schema";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";
import EmptyState from "@/components/EmptyState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { runSuggestionAlgorithmV1, type UnifiedProduct, type RecipientData } from "@/lib/suggestionAlgorithm";

// Compact Coupon Badge for Suggestions page
interface CouponBadgeCompactProps {
  cupom: string;
  validadeCupom?: string | null;
}

function CouponBadgeCompact({ cupom, validadeCupom }: CouponBadgeCompactProps) {
  const today = startOfDay(new Date());
  const isExpired = validadeCupom ? isBefore(parseISO(validadeCupom), today) : false;

  if (isExpired) {
    return (
      <div 
        className="flex items-start gap-1 px-2 py-1 rounded bg-muted/50 border border-muted text-muted-foreground text-xs mb-2"
        data-testid="coupon-badge-expired"
      >
        <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
        <span className="line-through break-words">{cupom} (expirado)</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-start gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs mb-2"
      data-testid="coupon-badge-active"
    >
      <Ticket className="h-3 w-3 flex-shrink-0 mt-0.5" />
      <span className="font-medium break-words">{cupom}</span>
    </div>
  );
}

// Unified Product Card Component
interface UnifiedProductCardProps {
  product: UnifiedProduct;
  recipientId?: string;
  toast: any;
  userGifts?: UserGift[];
}

function UnifiedProductCard({ product, recipientId, toast, userGifts }: UnifiedProductCardProps) {
  const internalId = product.source === "internal" ? product.id.replace("internal-", "") : null;
  
  const existingGift = recipientId && internalId
    ? userGifts?.find(ug => ug.suggestionId === internalId && ug.recipientId === recipientId)
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
        suggestionId: internalId,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
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

    if (product.source === "google") {
      toast({
        title: "Funcionalidade não disponível",
        description: "Favoritos só podem ser salvos para produtos internos.",
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

    if (product.source === "google") {
      toast({
        title: "Funcionalidade não disponível",
        description: "Status de compra só pode ser salvo para produtos internos.",
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
            description: `${product.name} foi marcado como comprado.`,
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
            description: `${product.name} foi marcado como comprado.`,
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
    <Card className="overflow-hidden group hover-elevate" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-square bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Sem+Imagem";
          }}
        />
        
        {product.source === "internal" && (
          <>
            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                favorite
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-foreground hover-elevate"
              }`}
              data-testid={`button-favorite-${product.id}`}
              aria-label="Favoritar"
            >
              <Heart className={`w-3 h-3 ${favorite ? "fill-current" : ""}`} />
            </button>

            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  checked={purchased}
                  onCheckedChange={handlePurchasedToggle}
                  id={`purchased-${product.id}`}
                  data-testid={`checkbox-purchased-${product.id}`}
                  className="bg-background h-4 w-4"
                />
                <label
                  htmlFor={`purchased-${product.id}`}
                  className="text-xs font-medium text-background bg-foreground/90 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Comprado
                </label>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="p-3">
        <Badge variant="secondary" className="text-xs mb-2">
          {product.priceFormatted}
        </Badge>
        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {product.description || product.store || ""}
        </p>
        
        {product.cupom && (
          <CouponBadgeCompact cupom={product.cupom} validadeCupom={product.validadeCupom} />
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs mt-2"
          onClick={async () => {
            if (product.productUrl) {
              try {
                await apiRequest("/api/clicks", "POST", { link: product.productUrl });
              } catch (error) {
                console.error("Error recording click:", error);
              }
              window.open(product.productUrl, "_blank", "noopener,noreferrer");
            } else {
              toast({
                title: product.name,
                description: "Link do produto não disponível.",
                variant: "destructive",
              });
            }
          }}
          data-testid={`button-view-product-${product.id}`}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver Produto
        </Button>
      </div>
    </Card>
  );
}

export default function Suggestions() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const recipientIdFromUrl = urlParams.get("recipientId") || "";
  
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState([1000]);
  const [category, setCategory] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>(recipientIdFromUrl);
  const [visibleCount, setVisibleCount] = useState(10);
  const [unifiedProducts, setUnifiedProducts] = useState<UnifiedProduct[]>([]);
  const [algorithmLoading, setAlgorithmLoading] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [algorithmResult, setAlgorithmResult] = useState<{
    internalCount: number;
    googleCount: number;
    appliedFilters?: {
      googleFiltersApplied: string[];
      googleFiltersNotAvailable: string[];
      recipientName?: string | null;
    };
    generatedQuery?: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setVisibleCount(10);
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

  const { data: giftCategories } = useQuery<GiftCategory[]>({
    queryKey: ["/api/gift-categories"],
  });

  // Fetch recipient profile when a recipient is selected
  const { 
    data: recipientProfileData, 
    isLoading: profileLoading, 
    error: profileError,
    isError: hasProfileError 
  } = useQuery<RecipientProfile>({
    queryKey: ["/api/recipients", selectedRecipient, "profile"],
    enabled: !!selectedRecipient && selectedRecipient !== "all",
    retry: false,
  });

  // Handle profile loading errors
  useEffect(() => {
    if (hasProfileError && selectedRecipient && selectedRecipient !== "all") {
      console.warn("Could not load recipient profile:", profileError);
    }
  }, [hasProfileError, profileError, selectedRecipient]);

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

  const selectedRecipientData = useMemo(() => {
    if (!selectedRecipient || selectedRecipient === "all") return null;
    return recipients?.find(r => r.id === selectedRecipient) || null;
  }, [selectedRecipient, recipients]);

  const selectedRecipientNames = selectedRecipientData ? [selectedRecipientData.name] : [];

  // Combine recipient and profile data for the algorithm - memoized to prevent infinite loops
  const recipientDataForAlgorithm: RecipientData | undefined = useMemo(() => {
    if (!selectedRecipientData) return undefined;
    return {
      recipient: selectedRecipientData,
      profile: recipientProfileData || null,
    };
  }, [selectedRecipientData, recipientProfileData]);

  const executeSearch = useCallback(async (keywords: string) => {
    if (!allSuggestions) return;
    
    setAlgorithmLoading(true);
    setHasSearched(true);
    try {
      // Enable Google Search when we have keywords OR when we have recipient data
      const shouldEnableGoogleSearch = keywords.trim().length > 0 || !!recipientDataForAlgorithm;
      
      const result = await runSuggestionAlgorithmV1(allSuggestions, {
        keywords: keywords.trim(),
        category: category || undefined,
        maxBudget: budget[0],
        recipientData: recipientDataForAlgorithm,
        googleLimit: 10,
        enableGoogleSearch: shouldEnableGoogleSearch,
        giftCategories: giftCategories,
      });
      setUnifiedProducts(result.products);
      setAlgorithmResult({
        internalCount: result.internalCount,
        googleCount: result.googleCount,
        appliedFilters: result.appliedFilters,
        generatedQuery: result.generatedQuery,
      });
    } catch (error) {
      console.error("Algorithm error:", error);
      setUnifiedProducts([]);
      setAlgorithmResult(null);
    } finally {
      setAlgorithmLoading(false);
    }
  }, [allSuggestions, category, budget, recipientDataForAlgorithm, giftCategories]);

  // Run algorithm when recipient changes or profile finishes loading
  // This is the main effect that applies personalization
  useEffect(() => {
    // Don't run if no suggestions loaded yet
    if (!allSuggestions || allSuggestions.length === 0) return;
    
    // If a recipient is selected but profile is still loading, wait
    if (selectedRecipient && selectedRecipient !== "all" && profileLoading) {
      return;
    }
    
    const runAlgorithmWithFilters = async () => {
      setAlgorithmLoading(true);
      try {
        // Enable Google search when we have keywords OR when we have recipient data
        // This ensures personalized searches work when selecting a recipient
        const shouldEnableGoogleSearch = searchKeywords.trim().length > 0 || !!recipientDataForAlgorithm;
        
        console.log("[Suggestions] Running algorithm:", {
          hasKeywords: searchKeywords.trim().length > 0,
          hasRecipientData: !!recipientDataForAlgorithm,
          shouldEnableGoogleSearch,
          recipientName: recipientDataForAlgorithm?.recipient?.name,
        });
        
        const result = await runSuggestionAlgorithmV1(allSuggestions, {
          keywords: searchKeywords.trim(),
          category: category || undefined,
          maxBudget: budget[0],
          recipientData: recipientDataForAlgorithm,
          googleLimit: 10,
          enableGoogleSearch: shouldEnableGoogleSearch,
          giftCategories: giftCategories,
        });
        
        console.log("[Suggestions] Algorithm result:", {
          internalCount: result.internalCount,
          googleCount: result.googleCount,
          totalProducts: result.products.length,
          generatedQuery: result.generatedQuery,
        });
        
        setUnifiedProducts(result.products);
        setAlgorithmResult({
          internalCount: result.internalCount,
          googleCount: result.googleCount,
          appliedFilters: result.appliedFilters,
          generatedQuery: result.generatedQuery,
        });
      } catch (error) {
        console.error("Algorithm error:", error);
        setUnifiedProducts([]);
        setAlgorithmResult(null);
      } finally {
        setAlgorithmLoading(false);
      }
    };
    
    runAlgorithmWithFilters();
  }, [
    allSuggestions, 
    category, 
    budget, 
    recipientDataForAlgorithm, 
    profileLoading, 
    selectedRecipient,
    hasSearched,
    searchKeywords,
    giftCategories
  ]);

  const handleSearch = () => {
    if (!searchKeywords.trim()) {
      toast({
        title: "Digite palavras-chave",
        description: "Insira termos de busca para encontrar presentes.",
        variant: "destructive",
      });
      return;
    }
    executeSearch(searchKeywords);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const visibleProducts = unifiedProducts.slice(0, visibleCount);
  const hasMoreProducts = unifiedProducts.length > visibleCount;

  const handleClearFilters = () => {
    setCategory("all");
    setBudget([1000]);
    setSelectedRecipient("all");
    setVisibleCount(10);
    setSearchKeywords("");
    setHasSearched(false);
    setAlgorithmResult(null);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
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
              <div className="mt-2">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Para:</span> <span className="font-medium text-foreground">{selectedRecipientNames.join(", ")}</span>
                  {profileLoading && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                      Carregando perfil...
                    </span>
                  )}
                </div>
                {hasProfileError && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Não foi possível carregar o perfil completo. A busca usará dados básicos.
                  </div>
                )}
                {!profileLoading && !hasProfileError && recipientProfileData && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Perfil carregado - busca personalizada ativada
                  </div>
                )}
              </div>
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

        {/* Search Section */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">O que você está procurando?</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Textarea
                placeholder="Digite palavras-chave para buscar presentes... Ex: perfume, relógio, livro de ficção, fones de ouvido, kit churrasco"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] resize-none flex-1"
                data-testid="input-search-keywords"
              />
              <Button 
                onClick={handleSearch}
                disabled={algorithmLoading}
                className="sm:self-end"
                data-testid="button-search"
              >
                {algorithmLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A busca encontra produtos em nossa base de dados e também no Google Shopping. Use os filtros ao lado para refinar os resultados.
            </p>
          </div>
        </Card>

        {/* Filter Info Badges */}
        {algorithmResult && hasSearched && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {searchKeywords && (
              <Badge variant="secondary" className="text-xs">
                Busca: "{searchKeywords}"
              </Badge>
            )}
            {algorithmResult.appliedFilters?.recipientName && (
              <Badge variant="secondary" className="text-xs bg-primary/10">
                Personalizado para: {algorithmResult.appliedFilters.recipientName}
              </Badge>
            )}
            {algorithmResult.internalCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {algorithmResult.internalCount} da nossa base
              </Badge>
            )}
            {algorithmResult.googleCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                {algorithmResult.googleCount} do Google Shopping
              </Badge>
            )}
            {algorithmResult.generatedQuery && algorithmResult.googleCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid="text-generated-query">
                <Search className="w-3 h-3" />
                <span>Query: {algorithmResult.generatedQuery}</span>
              </div>
            )}
            {algorithmResult.appliedFilters?.googleFiltersNotAvailable && 
             algorithmResult.appliedFilters.googleFiltersNotAvailable.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>
                  {algorithmResult.appliedFilters.googleFiltersNotAvailable.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

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
            {algorithmLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Carregando sugestões...</span>
              </div>
            ) : unifiedProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Mostrando {visibleProducts.length} de {unifiedProducts.length} {unifiedProducts.length === 1 ? 'sugestão' : 'sugestões'}
                  {selectedRecipientData && ` para ${selectedRecipientData.name}`}
                </div>
                
                {selectedRecipientData && (
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <Gift className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Para: {selectedRecipientData.name}</h2>
                  </div>
                )}
                
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleProducts.map((product) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                      recipientId={selectedRecipientData?.id}
                      toast={toast}
                      userGifts={userGifts}
                    />
                  ))}
                </div>
                
                {hasMoreProducts && (
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
