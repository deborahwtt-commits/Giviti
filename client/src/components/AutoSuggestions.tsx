import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Gift, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Globe,
  Database,
  AlertCircle,
  Ticket,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AutoSuggestion {
  id: string;
  nome: string;
  descricao: string;
  link: string;
  imagem: string | null;
  preco: string | number;
  prioridade: number | null;
  categoria: string | null;
  tags: string[];
  fonte?: "interna" | "externa";
  cupom?: string | null;
  validadeCupom?: string | null;
}

interface AutoSuggestionsResponse {
  fonte: "interna" | "externa" | "mista";
  resultados: AutoSuggestion[];
  paginacao: {
    pagina_atual: number;
    total_paginas: number;
    total_resultados: number;
  };
  aviso?: string;
}

interface AutoSuggestionsProps {
  recipientId: string;
  recipientName: string;
}

export default function AutoSuggestions({ recipientId, recipientName }: AutoSuggestionsProps) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, error, isFetching } = useQuery<AutoSuggestionsResponse>({
    queryKey: ["/api/sugestoes-auto", recipientId, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/sugestoes-auto?recipientId=${recipientId}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Falha ao carregar sugestões");
      }
      return response.json();
    },
    enabled: !!recipientId,
  });

  const handleProductClick = async (link: string) => {
    if (link && link.startsWith("http")) {
      try {
        await fetch("/api/clicks/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link }),
        });
      } catch (e) {
        console.error("Error recording click:", e);
      }
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">Carregando sugestões...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Erro ao carregar sugestões</span>
      </div>
    );
  }

  if (!data || data.resultados.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>Nenhuma sugestão encontrada para este perfil.</p>
        <p className="text-sm">Complete mais informações no questionário do presenteado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Sugestões para {recipientName}
          </span>
          <Badge variant="outline" className="text-xs">
            {data.fonte === "interna" ? (
              <>
                <Database className="h-3 w-3 mr-1" />
                Interna
              </>
            ) : data.fonte === "externa" ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Externa
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Mista
              </>
            )}
          </Badge>
        </div>
        {data.paginacao.total_resultados > 0 && (
          <span className="text-sm text-muted-foreground">
            {data.paginacao.total_resultados} resultado(s)
          </span>
        )}
      </div>

      {data.aviso && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          {data.aviso}
        </div>
      )}

      <div className="space-y-3">
        {data.resultados.map((suggestion) => (
          <Card 
            key={suggestion.id} 
            className="p-3 hover-elevate"
            data-testid={`card-auto-suggestion-${suggestion.id}`}
          >
            <div className="flex gap-3">
              {suggestion.imagem ? (
                <img
                  src={suggestion.imagem}
                  alt={suggestion.nome}
                  className="h-20 w-20 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1" data-testid={`text-suggestion-name-${suggestion.id}`}>
                      {suggestion.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {suggestion.descricao}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      {typeof suggestion.preco === "number" 
                        ? formatCurrency(suggestion.preco) 
                        : suggestion.preco}
                    </span>
                    {suggestion.fonte && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.fonte === "externa" ? (
                          <Globe className="h-3 w-3 mr-1" />
                        ) : (
                          <Database className="h-3 w-3 mr-1" />
                        )}
                        {suggestion.fonte}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1 flex-wrap">
                    {suggestion.categoria && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.categoria}
                      </Badge>
                    )}
                    {suggestion.tags?.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {suggestion.prioridade && (
                      <Badge className="text-xs bg-primary/10 text-primary">
                        Prioridade {suggestion.prioridade}
                      </Badge>
                    )}
                  </div>
                  
                  {suggestion.link && suggestion.link.startsWith("http") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleProductClick(suggestion.link)}
                      className="h-7 px-2"
                      data-testid={`button-view-product-${suggestion.id}`}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                </div>
                
                {/* Coupon Display */}
                {suggestion.cupom && (
                  <CouponBadgeCompact 
                    cupom={suggestion.cupom} 
                    validadeCupom={suggestion.validadeCupom} 
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data.paginacao.total_paginas > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {data.paginacao.pagina_atual} de {data.paginacao.total_paginas}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.paginacao.total_paginas || isFetching}
            data-testid="button-next-page"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact Coupon Badge for Auto Suggestions
interface CouponBadgeCompactProps {
  cupom: string;
  validadeCupom?: string | null;
}

function CouponBadgeCompact({ cupom, validadeCupom }: CouponBadgeCompactProps) {
  const today = startOfDay(new Date());
  const isExpired = validadeCupom ? isBefore(parseISO(validadeCupom), today) : false;
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (isExpired) {
    return (
      <div 
        className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-muted/50 border border-muted text-muted-foreground text-xs"
        data-testid="coupon-badge-expired"
      >
        <AlertTriangle className="h-3 w-3" />
        <span className="line-through">{cupom}</span>
        <span>(expirado)</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs"
      data-testid="coupon-badge-active"
    >
      <Ticket className="h-3 w-3" />
      <span className="font-medium">Cupom: {cupom}</span>
      {validadeCupom && (
        <span className="flex items-center gap-0.5">
          <Calendar className="h-2.5 w-2.5" />
          até {formatDate(validadeCupom)}
        </span>
      )}
    </div>
  );
}
