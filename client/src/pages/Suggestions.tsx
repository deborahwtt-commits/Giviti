import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, Gift, Heart, ExternalLink, Ticket, AlertTriangle, Loader2, Search, Info, AlertCircle, Sparkles, ShoppingBag, Calendar } from "lucide-react";
import { parseISO, isBefore, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { GiftSuggestion, Recipient, RecipientProfile, UserGift, GiftCategory, GoogleProductCategory } from "@shared/schema";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";
import EmptyState from "@/components/EmptyState";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { runSuggestionAlgorithmV1, type UnifiedProduct, type RecipientData, type PaginationMeta } from "@/lib/suggestionAlgorithm";

// Modal for marking a product as purchased
interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  product: UnifiedProduct;
  recipients: Recipient[];
  selectedRecipientId?: string;
  onSuccess: () => void;
}

// Currency formatting helpers
function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, "");
  
  if (!numericValue) return "";
  
  // Convert to number (in cents) and format
  const cents = parseInt(numericValue, 10);
  const reais = cents / 100;
  
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseCurrencyToNumber(formattedValue: string): number {
  // Remove currency symbol, dots (thousands) and replace comma with dot
  const numericString = formattedValue
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  
  return parseFloat(numericString) || 0;
}

function PurchaseModal({ open, onClose, product, recipients, selectedRecipientId, onSuccess }: PurchaseModalProps) {
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState(selectedRecipientId || "");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRecipientId(selectedRecipientId || "");
      // Format initial price as currency
      const initialPrice = product.price || 0;
      setPriceDisplay(
        initialPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      );
      setPurchaseDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [open, selectedRecipientId, product.price]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPriceDisplay(formatted);
  };

  const handleSubmit = async () => {
    const numericPrice = parseCurrencyToNumber(priceDisplay);
    
    if (!priceDisplay || numericPrice <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe o valor pago pelo presente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const internalId = product.source === "internal" ? product.id.replace("internal-", "") : null;
      
      // "none" and "myself" both mean no specific recipient
      const finalRecipientId = recipientId && recipientId !== "none" && recipientId !== "myself" 
        ? recipientId 
        : null;
      
      await apiRequest("/api/gifts", "POST", {
        recipientId: finalRecipientId,
        suggestionId: internalId,
        name: product.name,
        description: product.description || product.store || "",
        imageUrl: product.imageUrl,
        price: numericPrice.toFixed(2),
        purchaseUrl: product.productUrl || "",
        externalSource: product.source === "google" ? "google_shopping" : null,
        currencyCode: "BRL",
        isFavorite: false,
        isPurchased: true,
        // Parse date as local time by adding noon time to avoid UTC midnight timezone issues
        purchasedAt: new Date(purchaseDate + "T12:00:00").toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/gifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Presente registrado!",
        description: `${product.name} foi marcado como comprado por ${priceDisplay}.`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-purchase-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Marcar como Comprado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Sem+Imagem";
              }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {product.source === "google" ? product.store : "Sugestão Giviti"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="purchase-price" className="text-sm font-medium">
                Valor pago (R$)
              </Label>
              <Input
                id="purchase-price"
                type="text"
                inputMode="numeric"
                value={priceDisplay}
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
                className="mt-1"
                data-testid="input-purchase-price"
              />
            </div>

            <div>
              <Label htmlFor="purchase-date" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Data da compra
              </Label>
              <Input
                id="purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1"
                data-testid="input-purchase-date"
              />
            </div>

            <div>
              <Label htmlFor="purchase-recipient" className="text-sm font-medium">
                Para quem é o presente? (opcional)
              </Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger id="purchase-recipient" className="mt-1" data-testid="select-purchase-recipient">
                  <SelectValue placeholder="Selecione um presenteado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não especificar</SelectItem>
                  <SelectItem value="myself">Eu!</SelectItem>
                  {recipients.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-confirm-purchase">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Confirmar Compra
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  recipients: Recipient[];
  toast: any;
  userGifts?: UserGift[];
}

function UnifiedProductCard({ product, recipientId, recipients, toast, userGifts }: UnifiedProductCardProps) {
  const internalId = product.source === "internal" ? product.id.replace("internal-", "") : null;
  
  // Find existing gift by suggestionId - for purchase status, check ANY gift with this suggestionId
  const existingGift = internalId
    ? userGifts?.find(ug => ug.suggestionId === internalId && (recipientId ? ug.recipientId === recipientId : !ug.recipientId))
    : undefined;
  
  // Check if this product was purchased (with ANY recipientId) - used to disable the purchase button
  // For internal products: match by suggestionId
  // For Google products: match by purchaseUrl (product URL)
  const isPurchasedAnywhere = internalId
    ? userGifts?.some(ug => ug.suggestionId === internalId && ug.isPurchased)
    : product.productUrl
      ? userGifts?.some(ug => ug.purchaseUrl === product.productUrl && ug.isPurchased)
      : false;

  const [favorite, setFavorite] = useState(existingGift?.isFavorite ?? false);
  const [purchased, setPurchased] = useState(isPurchasedAnywhere ?? false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    setFavorite(existingGift?.isFavorite ?? false);
    // Only update purchased state if server confirms purchase - never reset to false
    // This prevents the optimistic update from being overridden before refetch completes
    if (isPurchasedAnywhere) {
      setPurchased(true);
    }
  }, [existingGift, isPurchasedAnywhere]);

  const createGiftMutation = useMutation({
    mutationFn: async (data: { isFavorite: boolean; isPurchased: boolean }) => {
      return await apiRequest("/api/gifts", "POST", {
        recipientId: recipientId || null,
        suggestionId: internalId,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        purchaseUrl: product.productUrl || "",
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
        
        {/* Funcionalidade de favoritar temporariamente oculta
        {product.source === "internal" && (
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
        )}
        */}
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
        
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
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
            Ver
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowPurchaseModal(true)}
            disabled={purchased}
            title={purchased ? "Já comprado" : "Marcar como comprado"}
            data-testid={`button-mark-purchased-${product.id}`}
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <PurchaseModal
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        product={product}
        recipients={recipients}
        selectedRecipientId={recipientId}
        onSuccess={() => setPurchased(true)}
      />
    </Card>
  );
}

export default function Suggestions() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const recipientIdFromUrl = urlParams.get("recipientId") || "";
  
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState([1000]);
  const [selectedGoogleCategoryId, setSelectedGoogleCategoryId] = useState<number | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>(recipientIdFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLoadedProducts, setAllLoadedProducts] = useState<UnifiedProduct[]>([]);
  const [algorithmLoading, setAlgorithmLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [committedSearchKeywords, setCommittedSearchKeywords] = useState("");
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
    googleFromCache?: boolean;
    pagination?: PaginationMeta;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage(1);
    setAllLoadedProducts([]);
  }, [selectedGoogleCategoryId, selectedRecipient, budget]);

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

  const { data: googleCategories } = useQuery<GoogleProductCategory[]>({
    queryKey: ["/api/google-categories"],
  });

  // Fetch recipient profile when a recipient is selected
  const { 
    data: recipientProfileData, 
    isLoading: profileLoading, 
    error: profileError,
    isError: hasProfileError 
  } = useQuery<RecipientProfile>({
    queryKey: ["/api/recipients", selectedRecipient, "profile"],
    enabled: !!selectedRecipient && selectedRecipient !== "all" && selectedRecipient !== "none",
    retry: false,
  });

  // Handle profile loading errors
  useEffect(() => {
    if (hasProfileError && selectedRecipient && selectedRecipient !== "all" && selectedRecipient !== "none") {
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

  // Get the display name for the selected category
  const selectedCategoryName = selectedGoogleCategoryId 
    ? googleCategories?.find(c => c.id === selectedGoogleCategoryId)?.namePtBr 
    : null;

  const selectedRecipientData = useMemo(() => {
    if (!selectedRecipient || selectedRecipient === "all" || selectedRecipient === "none") return null;
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

  // Unified algorithm runner - handles both internal filtering and Google search
  const runAlgorithm = useCallback(async (options: {
    enableGoogle: boolean;
    keywords?: string;
    page?: number;
    isLoadMore?: boolean;
  }) => {
    if (!allSuggestions) return;
    
    const { enableGoogle, keywords = "", page = 1, isLoadMore = false } = options;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setAlgorithmLoading(true);
    }
    
    try {
      const result = await runSuggestionAlgorithmV1(allSuggestions, {
        keywords: keywords.trim(),
        googleCategoryId: selectedGoogleCategoryId || undefined,
        maxBudget: budget[0],
        recipientData: recipientDataForAlgorithm,
        enableGoogleSearch: enableGoogle,
        giftCategories: giftCategories,
        googleCategories: googleCategories,
        page,
        pageSize: 5,
      });
      
      if (isLoadMore) {
        setAllLoadedProducts(prev => [...prev, ...result.products]);
      } else {
        setAllLoadedProducts(result.products);
      }
      
      setAlgorithmResult({
        internalCount: result.internalCount,
        googleCount: result.googleCount,
        appliedFilters: result.appliedFilters,
        generatedQuery: result.generatedQuery,
        googleFromCache: result.googleFromCache,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Algorithm error:", error);
      if (!isLoadMore) {
        setAllLoadedProducts([]);
      }
      setAlgorithmResult(null);
    } finally {
      setAlgorithmLoading(false);
      setLoadingMore(false);
    }
  }, [allSuggestions, selectedGoogleCategoryId, budget, recipientDataForAlgorithm, giftCategories, googleCategories]);

  // Single effect: runs when filters change
  // Enables Google search if user has searched OR has a recipient selected OR has a category selected
  // Note: Uses committedSearchKeywords (not searchKeywords) to only trigger on explicit search, not while typing
  useEffect(() => {
    if (!allSuggestions || allSuggestions.length === 0) return;
    if (profileLoading && selectedRecipient && selectedRecipient !== "all" && selectedRecipient !== "none") return;
    
    // Enable Google when there's an active search context (search, recipient, or category selected)
    const shouldEnableGoogle = hasSearched || !!recipientDataForAlgorithm || !!selectedGoogleCategoryId;
    
    setCurrentPage(1);
    runAlgorithm({ 
      enableGoogle: shouldEnableGoogle, 
      keywords: committedSearchKeywords,
      page: 1,
      isLoadMore: false,
    });
  }, [allSuggestions, selectedGoogleCategoryId, budget, giftCategories, recipientDataForAlgorithm, profileLoading, hasSearched, committedSearchKeywords]);

  // Execute explicit search (when user clicks "Buscar")
  const executeSearch = useCallback(async (keywords: string) => {
    if (!allSuggestions) return;
    
    setHasSearched(true);
    setCommittedSearchKeywords(keywords);
    setCurrentPage(1);
    // Run immediately with Google enabled
    runAlgorithm({ 
      enableGoogle: true, 
      keywords,
      page: 1,
      isLoadMore: false,
    });
  }, [allSuggestions, runAlgorithm]);

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

  const hasMoreProducts = algorithmResult?.pagination?.hasMore ?? false;
  const maxResultsReached = allLoadedProducts.length >= (algorithmResult?.pagination?.maxResults ?? 15);

  const handleClearFilters = () => {
    setSelectedGoogleCategoryId(null);
    setBudget([1000]);
    setSelectedRecipient(""); // Reset to "Não especificado"
    setCurrentPage(1);
    setAllLoadedProducts([]);
    setSearchKeywords("");
    setCommittedSearchKeywords("");
    setHasSearched(false);
    setAlgorithmResult(null);
  };

  const handleLoadMore = async () => {
    if (loadingMore || maxResultsReached) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    const shouldEnableGoogle = hasSearched || !!recipientDataForAlgorithm;
    
    await runAlgorithm({
      enableGoogle: shouldEnableGoogle,
      keywords: committedSearchKeywords,
      page: nextPage,
      isLoadMore: true,
    });
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
            {committedSearchKeywords && (
              <Badge variant="secondary" className="text-xs">
                Busca: "{committedSearchKeywords}"
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
                {algorithmResult.googleFromCache && " (cache)"}
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
                    Categoria
                  </Label>
                  <Select
                    value={selectedGoogleCategoryId?.toString() || "all"}
                    onValueChange={(value) => {
                      if (value === "all") {
                        setSelectedGoogleCategoryId(null);
                      } else {
                        setSelectedGoogleCategoryId(parseInt(value, 10));
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {googleCategories?.filter(c => c.isActive).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.namePtBr}
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
            ) : allLoadedProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Mostrando {allLoadedProducts.length} de {algorithmResult?.pagination?.totalItems ?? allLoadedProducts.length} {allLoadedProducts.length === 1 ? 'sugestão' : 'sugestões'}
                  {selectedRecipientData && ` para ${selectedRecipientData.name}`}
                  {algorithmResult?.pagination && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (máx. {algorithmResult.pagination.maxResults})
                    </span>
                  )}
                </div>
                
                {selectedRecipientData && (
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <Gift className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Para: {selectedRecipientData.name}</h2>
                  </div>
                )}
                
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {allLoadedProducts.map((product: UnifiedProduct) => (
                    <UnifiedProductCard
                      key={product.id}
                      product={product}
                      recipientId={selectedRecipientData?.id}
                      recipients={recipients || []}
                      toast={toast}
                      userGifts={userGifts}
                    />
                  ))}
                </div>
                
                {hasMoreProducts && !maxResultsReached && (
                  <div className="flex flex-col items-center gap-2 mt-8">
                    <Button 
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      disabled={loadingMore}
                      data-testid="button-load-more"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        `Carregar mais (${allLoadedProducts.length}/${algorithmResult?.pagination?.maxResults ?? 15})`
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Página {currentPage} de {algorithmResult?.pagination?.totalPages ?? 1}
                    </span>
                  </div>
                )}
                
                {maxResultsReached && (
                  <div className="text-center mt-6 text-sm text-muted-foreground">
                    Limite máximo de {algorithmResult?.pagination?.maxResults ?? 15} sugestões atingido
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
