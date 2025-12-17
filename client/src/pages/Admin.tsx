import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Users, 
  Gift, 
  Calendar, 
  Package, 
  ShoppingCart, 
  Heart,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  Sparkles,
  Tag,
  MousePointerClick,
  ExternalLink,
  Clock,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalRecipients: number;
  totalEvents: number;
  totalSuggestions: number;
  totalGiftsPurchased: number;
}

interface AdvancedStats {
  userStats: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  inactiveStats: {
    total: number;
    byAdmin: number;
    bySelf: number;
  };
  giftStats: {
    totalSuggestions: number;
    purchasedGifts: number;
    favoriteGifts: number;
  };
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: {
    newUsersToday: number;
    newEventsToday: number;
    giftsMarkedTodayAsPurchased: number;
  };
  totalEvents: number;
}

interface TopClickedLink {
  id: string;
  link: string;
  clickCount: number;
  updatedAt: string | null;
  suggestionName: string | null;
  suggestionId: string | null;
}

interface WishlistClickedItem {
  id: string;
  title: string;
  purchaseUrl: string | null;
  price: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  eventTitle: string;
  ownerName: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const hasAdminAccess = user?.role === "admin" || user?.role === "manager" || user?.role === "support";

  const { data: advancedStats, isLoading, error } = useQuery<AdvancedStats>({
    queryKey: ["/api/admin/advanced-stats"],
    enabled: hasAdminAccess,
    meta: {
      onError: (error: any) => {
        if (error?.status === 401) {
          handleAuthError(toast, setLocation);
        } else if (error?.status === 403) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          setLocation("/");
        }
      },
    },
  });

  const { data: topClicks } = useQuery<TopClickedLink[]>({
    queryKey: ["/api/admin/top-clicks"],
    enabled: hasAdminAccess,
  });

  const { data: wishlistClicks } = useQuery<WishlistClickedItem[]>({
    queryKey: ["/api/admin/wishlist-clicks"],
    enabled: hasAdminAccess,
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar as estatísticas administrativas.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-semibold text-3xl text-foreground mb-2" data-testid="admin-page-title">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">Visão geral completa das estatísticas da plataforma</p>
          </div>
          <CreateUserDialog />
        </div>

        {/* Atividade Recente */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Atividade de Hoje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Novos Usuários Hoje"
              value={advancedStats?.recentActivity.newUsersToday || 0}
              icon={UserPlus}
            />
            <AdminStatsCard
              title="Novos Eventos Hoje"
              value={advancedStats?.recentActivity.newEventsToday || 0}
              icon={CalendarPlus}
              description="Datas Comemorativas + Rolês"
            />
            <AdminStatsCard
              title="Presentes Comprados Hoje"
              value={advancedStats?.recentActivity.giftsMarkedTodayAsPurchased || 0}
              icon={ShoppingCart}
            />
            <AdminStatsCard
              title="Total de Eventos"
              value={advancedStats?.totalEvents || 0}
              icon={Calendar}
              description="Datas Comemorativas + Rolês"
            />
          </div>
        </div>

        {/* Estatísticas de Usuários */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários da Plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Total de Usuários"
              value={advancedStats?.userStats.total || 0}
              icon={Users}
              onClick={() => setLocation("/admin/usuarios")}
            />
            <AdminStatsCard
              title="Usuários Ativos"
              value={advancedStats?.userStats.active || 0}
              icon={Users}
              description={`${Math.round(((advancedStats?.userStats.active || 0) / (advancedStats?.userStats.total || 1)) * 100)}% ativos`}
            />
            <Card className="p-6" data-testid="card-inactive-users">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Usuários Inativos
                </h3>
                <div className="p-2 rounded-full bg-muted">
                  <UserX className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-3" data-testid="text-inactive-total">
                {advancedStats?.inactiveStats.total || 0}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Por administrador</span>
                  <span className="font-medium" data-testid="text-inactive-by-admin">{advancedStats?.inactiveStats.byAdmin || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contas excluídas</span>
                  <span className="font-medium" data-testid="text-inactive-by-self">{advancedStats?.inactiveStats.bySelf || 0}</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Usuários por Perfil
              </h3>
              <div className="space-y-2">
                {Object.entries(advancedStats?.userStats.byRole || {}).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Gestão de Eventos */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Gestão de Eventos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminStatsCard
              title="Cadastro de Rolês"
              value="Gerenciar"
              icon={Sparkles}
              description="Configurar categorias de Noite Temática"
              onClick={() => setLocation("/admin/cadastro-roles")}
            />
            <AdminStatsCard
              title="Tipos de Datas Comemorativas"
              value="Gerenciar"
              icon={Calendar}
              description="Cadastrar tipos (Aniversário, Natal, etc.)"
              onClick={() => setLocation("/admin/datas-comemorativas")}
            />
          </div>
        </div>

        {/* Estatísticas de Presentes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Presentes e Sugestões
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Sugestões na Base"
              value={advancedStats?.giftStats.totalSuggestions || 0}
              icon={Package}
              onClick={() => setLocation("/admin/sugestoes")}
            />
            <AdminStatsCard
              title="Categorias e Tipos"
              value="Gerenciar"
              icon={Tag}
              description="Configurar categorias e tipos de presentes"
              onClick={() => setLocation("/admin/categorias-tipos")}
            />
            <AdminStatsCard
              title="Presentes Comprados"
              value={advancedStats?.giftStats.purchasedGifts || 0}
              icon={ShoppingCart}
            />
            <AdminStatsCard
              title="Presentes Favoritos"
              value={advancedStats?.giftStats.favoriteGifts || 0}
              icon={Heart}
            />
          </div>
        </div>

        {/* Top Categorias */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Categorias Mais Populares
          </h2>
          <Card className="p-6">
            <div className="space-y-3">
              {advancedStats?.topCategories.slice(0, 5).map((cat, index) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{cat.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{cat.count} presentes</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Links Mais Clicados */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5" />
            Links Mais Clicados
          </h2>
          <Card className="p-6" data-testid="top-clicks-section">
            {topClicks && topClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Sugestão</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">URL do Produto</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Cliques</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Último Clique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClicks.map((click, index) => (
                      <tr 
                        key={click.id} 
                        className="border-b last:border-0 hover-elevate"
                        data-testid={`top-click-row-${index}`}
                      >
                        <td className="py-3 px-2">
                          <Badge variant={index < 3 ? "default" : "secondary"} className="w-8 justify-center">
                            {index + 1}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium" data-testid={`click-suggestion-name-${index}`}>
                            {click.suggestionName || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <a 
                            href={click.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 max-w-[300px] truncate"
                            data-testid={`click-link-${index}`}
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{click.link}</span>
                          </a>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="font-semibold" data-testid={`click-count-${index}`}>
                            {click.clickCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {click.updatedAt ? (
                            <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(click.updatedAt), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MousePointerClick className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum clique registrado ainda</p>
                <p className="text-sm mt-1">Os cliques nos links de produtos aparecerão aqui</p>
              </div>
            )}
          </Card>
        </div>

        {/* Links de Wishlist Mais Clicados */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Links de Wishlist Mais Clicados
          </h2>
          <Card className="p-6" data-testid="wishlist-clicks-section">
            {wishlistClicks && wishlistClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Item</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Evento/Dono</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Preço</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Cliques</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Último Clique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlistClicks.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className="border-b last:border-0 hover-elevate"
                        data-testid={`wishlist-click-row-${index}`}
                      >
                        <td className="py-3 px-2">
                          <Badge variant={index < 3 ? "default" : "secondary"} className="w-8 justify-center">
                            {index + 1}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium" data-testid={`wishlist-item-title-${index}`}>
                              {item.title}
                            </span>
                            {item.purchaseUrl && (
                              <a 
                                href={item.purchaseUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 max-w-[250px] truncate"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{item.purchaseUrl}</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm">{item.eventTitle}</span>
                            <span className="text-xs text-muted-foreground">{item.ownerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm">{item.price || "—"}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="font-semibold" data-testid={`wishlist-click-count-${index}`}>
                            {item.clickCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {item.lastClickedAt ? (
                            <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.lastClickedAt), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum clique em wishlist registrado ainda</p>
                <p className="text-sm mt-1">Os cliques nos links de produtos da wishlist aparecerão aqui</p>
              </div>
            )}
          </Card>
        </div>

      </main>
    </div>
  );
}
