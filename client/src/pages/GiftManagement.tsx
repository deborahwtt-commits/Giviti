import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EmptyState from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ShoppingBag, Calendar, User, ExternalLink } from "lucide-react";
import { isToday, isThisMonth, isThisYear, subMonths, isAfter } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UserGift, Recipient } from "@shared/schema";
import emptySuggestionsImage from "@assets/generated_images/Empty_state_no_suggestions_4bee11bc.png";

type PeriodFilter = "today" | "this_month" | "last_3_months" | "this_year" | "all";

export default function GiftManagement() {
  const [, navigate] = useLocation();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const { data: gifts = [], isLoading: giftsLoading } = useQuery<UserGift[]>({
    queryKey: ["/api/gifts"],
  });

  const { data: recipients = [] } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  // Filter only purchased gifts
  const purchasedGifts = useMemo(() => {
    return gifts.filter((gift) => gift.isPurchased);
  }, [gifts]);

  // Apply period filter
  const filteredGifts = useMemo(() => {
    if (periodFilter === "all") return purchasedGifts;

    return purchasedGifts.filter((gift) => {
      if (!gift.purchasedAt) return false;
      // purchasedAt can be Date or string depending on serialization
      const purchaseDate = gift.purchasedAt instanceof Date 
        ? gift.purchasedAt 
        : new Date(gift.purchasedAt);

      switch (periodFilter) {
        case "today":
          return isToday(purchaseDate);
        case "this_month":
          return isThisMonth(purchaseDate);
        case "last_3_months":
          return isAfter(purchaseDate, subMonths(new Date(), 3));
        case "this_year":
          return isThisYear(purchaseDate);
        default:
          return true;
      }
    });
  }, [purchasedGifts, periodFilter]);

  // Get recipient name by ID
  const getRecipientName = (recipientId: string | null) => {
    if (!recipientId) return "—";
    const recipient = recipients.find((r) => r.id === recipientId);
    return recipient?.name || "—";
  };

  // Format price
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return `R$ ${numPrice.toFixed(2).replace(".", ",")}`;
  };

  // Format date - handles both Date objects and ISO strings from API
  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const periodLabels: Record<PeriodFilter, string> = {
    today: "Hoje",
    this_month: "Este Mês",
    last_3_months: "Últimos 3 Meses",
    this_year: "Este Ano",
    all: "Todos",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground flex items-center gap-2">
                <ShoppingBag className="w-7 h-7 text-primary" />
                Meus Presentes
              </h1>
              <p className="text-muted-foreground mt-1">
                Presentes que você já comprou
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                <SelectTrigger className="w-[180px]" data-testid="select-period-filter">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="this_month">Este Mês</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                  <SelectItem value="this_year">Este Ano</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {giftsLoading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        ) : filteredGifts.length === 0 ? (
          <EmptyState
            image={emptySuggestionsImage}
            title={periodFilter === "all" ? "Nenhum presente comprado ainda" : `Nenhum presente comprado ${periodLabels[periodFilter].toLowerCase()}`}
            description="Os presentes que você marcar como comprados aparecerão aqui."
            actionLabel="Explorar Sugestões"
            onAction={() => navigate("/suggestions")}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {filteredGifts.length} {filteredGifts.length === 1 ? "presente" : "presentes"}
                  {periodFilter !== "all" && ` (${periodLabels[periodFilter].toLowerCase()})`}
                </span>
                <Badge variant="secondary">
                  Total: {formatPrice(
                    filteredGifts
                      .reduce((sum, g) => sum + parseFloat(g.price || "0"), 0)
                      .toString()
                  )}
                </Badge>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Presente</TableHead>
                    <TableHead className="min-w-[120px]">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Para
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">Valor</TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Data
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px]">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGifts.map((gift) => (
                    <TableRow key={gift.id} data-testid={`row-gift-${gift.id}`}>
                      <TableCell className="font-medium">
                        <span className="line-clamp-2">{gift.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getRecipientName(gift.recipientId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatPrice(gift.price)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(gift.purchasedAt)}
                      </TableCell>
                      <TableCell>
                        {gift.purchaseUrl ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(gift.purchaseUrl!, "_blank", "noopener,noreferrer")}
                            title="Abrir link do produto"
                            data-testid={`button-open-link-${gift.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
