import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, ShoppingBag, Gift, Ticket, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { runSuggestionAlgorithmV1, type UnifiedProduct, type RecipientData } from "@/lib/suggestionAlgorithm";
import type { Recipient, RecipientProfile, GiftSuggestion, UserGift, GiftCategory, GoogleProductCategory } from "@shared/schema";
import { parseISO, isBefore, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  recipient: Recipient;
}

function CouponBadge({ cupom, validadeCupom }: { cupom: string; validadeCupom?: string | null }) {
  const isExpired = validadeCupom && isBefore(parseISO(validadeCupom), startOfDay(new Date()));
  
  if (isExpired) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
      <Ticket className="w-3 h-3" />
      <span className="font-medium">{cupom}</span>
      {validadeCupom && (
        <span className="text-muted-foreground">
          até {format(parseISO(validadeCupom), "dd/MM", { locale: ptBR })}
        </span>
      )}
    </div>
  );
}

function ProductCard({ 
  product, 
  recipientId,
  userGifts,
  onPurchase 
}: { 
  product: UnifiedProduct; 
  recipientId: string;
  userGifts?: UserGift[];
  onPurchase: (product: UnifiedProduct) => void;
}) {
  const internalId = product.source === "internal" ? product.id.replace("internal-", "") : null;
  
  const isPurchasedAnywhere = internalId
    ? userGifts?.some(ug => ug.suggestionId === internalId && ug.isPurchased)
    : product.productUrl
      ? userGifts?.some(ug => ug.purchaseUrl === product.productUrl && ug.isPurchased)
      : false;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`modal-product-${product.id}`}>
      <div className="relative aspect-square bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Sem+Imagem";
          }}
        />
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
          <CouponBadge cupom={product.cupom} validadeCupom={product.validadeCupom} />
        )}
        
        <div className="flex flex-col gap-1.5 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => window.open(product.productUrl, "_blank")}
            disabled={!product.productUrl}
            data-testid={`button-view-product-${product.id}`}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            className="w-full text-xs"
            onClick={() => onPurchase(product)}
            disabled={isPurchasedAnywhere}
            data-testid={`button-purchase-${product.id}`}
          >
            <ShoppingBag className="w-3 h-3 mr-1" />
            {isPurchasedAnywhere ? "Comprado" : "Comprar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function SuggestionsModal({ open, onClose, recipient }: SuggestionsModalProps) {
  const { toast } = useToast();
  const [budget, setBudget] = useState([500]);
  const [isLoadingAlgorithm, setIsLoadingAlgorithm] = useState(false);
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const { data: allSuggestions, isLoading: suggestionsLoading } = useQuery<GiftSuggestion[]>({
    queryKey: ["/api/suggestions"],
    enabled: open,
  });

  const { data: recipientProfile, isLoading: profileLoading } = useQuery<RecipientProfile>({
    queryKey: ["/api/recipients", recipient.id, "profile"],
    enabled: open,
    retry: false,
  });

  const { data: userGifts } = useQuery<UserGift[]>({
    queryKey: ["/api/gifts"],
    enabled: open,
  });

  const { data: giftCategories, isLoading: categoriesLoading } = useQuery<GiftCategory[]>({
    queryKey: ["/api/gift-categories"],
    enabled: open,
  });

  const { data: googleCategories, isLoading: googleCategoriesLoading } = useQuery<GoogleProductCategory[]>({
    queryKey: ["/api/google-categories"],
    enabled: open,
  });

  const isDataReady = !suggestionsLoading && !categoriesLoading && !googleCategoriesLoading && allSuggestions && giftCategories && googleCategories;

  const recipientData: RecipientData = useMemo(() => ({
    recipient,
    profile: recipientProfile || null,
  }), [recipient, recipientProfile]);

  const loadSuggestions = async () => {
    if (!allSuggestions || !giftCategories || !googleCategories) return;
    
    setIsLoadingAlgorithm(true);
    try {
      const result = await runSuggestionAlgorithmV1(allSuggestions, {
        recipientData,
        maxBudget: budget[0],
        enableGoogleSearch: true,
        googleLimit: 5,
        giftCategories,
        googleCategories,
        page: 1,
        pageSize: 12,
      });
      setProducts(result.products);
      setHasLoaded(true);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      toast({
        title: "Erro ao carregar sugestões",
        description: "Não foi possível buscar as sugestões. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAlgorithm(false);
    }
  };

  useEffect(() => {
    if (open && isDataReady && !hasLoaded) {
      loadSuggestions();
    }
  }, [open, isDataReady, hasLoaded]);

  useEffect(() => {
    if (!open) {
      setHasLoaded(false);
      setProducts([]);
      setVisibleCount(5);
    }
  }, [open]);

  const handleBudgetChange = (value: number[]) => {
    setBudget(value);
  };

  const handleApplyBudget = () => {
    setHasLoaded(false);
    loadSuggestions();
  };

  const handlePurchase = async (product: UnifiedProduct) => {
    const internalId = product.source === "internal" ? product.id.replace("internal-", "") : null;
    
    try {
      await apiRequest("/api/gifts", "POST", {
        recipientId: recipient.id,
        suggestionId: internalId || undefined,
        name: product.name,
        description: product.description || undefined,
        imageUrl: product.imageUrl || undefined,
        price: String(product.price),
        purchaseUrl: product.productUrl || undefined,
        externalSource: product.source === "google" ? "google_shopping" : undefined,
        isFavorite: false,
        isPurchased: true,
        purchasedAt: new Date().toISOString(),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/gifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Presente registrado!",
        description: `${product.name} foi marcado como comprado para ${recipient.name}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a compra.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Sugestões para {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="flex-1">
            <Label className="text-sm font-medium mb-2 block">
              Orçamento: R$ {budget[0]}
            </Label>
            <Slider
              value={budget}
              onValueChange={handleBudgetChange}
              max={2000}
              min={50}
              step={50}
              className="w-full"
              data-testid="modal-slider-budget"
            />
          </div>
          <Button 
            onClick={handleApplyBudget} 
            size="sm"
            disabled={isLoadingAlgorithm}
            data-testid="button-apply-budget"
          >
            Aplicar
          </Button>
        </div>

        {recipient.interests && recipient.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-2">
            <span className="text-sm text-muted-foreground mr-2">Interesses:</span>
            {recipient.interests.slice(0, 5).map((interest) => (
              <Badge key={interest} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {recipient.interests.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{recipient.interests.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4">
          {(!isDataReady || isLoadingAlgorithm) ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {!isDataReady ? "Carregando dados..." : "Buscando sugestões personalizadas..."}
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Mostrando {Math.min(visibleCount, products.length)} de {products.length} {products.length === 1 ? 'sugestão' : 'sugestões'}
              </p>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    recipientId={recipient.id}
                    userGifts={userGifts}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
              {visibleCount < products.length && visibleCount < 15 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount(prev => Math.min(prev + 5, 15, products.length))}
                    data-testid="button-load-more"
                  >
                    Ver mais sugestões
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Nenhuma sugestão encontrada para este presenteado.
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar o orçamento ou adicionar mais interesses ao perfil.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
