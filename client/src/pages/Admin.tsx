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
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminStatsCard
              title="Novos Usuários Hoje"
              value={advancedStats?.recentActivity.newUsersToday || 0}
              icon={UserPlus}
            />
            <AdminStatsCard
              title="Novos Eventos Hoje"
              value={advancedStats?.recentActivity.newEventsToday || 0}
              icon={CalendarPlus}
            />
            <AdminStatsCard
              title="Presentes Comprados Hoje"
              value={advancedStats?.recentActivity.giftsMarkedTodayAsPurchased || 0}
              icon={ShoppingCart}
            />
          </div>
        </div>

        {/* Estatísticas de Usuários */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários da Plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Gestão de Rolês */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Gestão de Rolês Temáticos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminStatsCard
              title="Cadastro de Rolês"
              value="Gerenciar"
              icon={Sparkles}
              description="Configurar categorias de Noite Temática"
              onClick={() => setLocation("/admin/cadastro-roles")}
            />
          </div>
        </div>

        {/* Estatísticas de Presentes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Presentes e Sugestões
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminStatsCard
              title="Sugestões na Base"
              value={advancedStats?.giftStats.totalSuggestions || 0}
              icon={Package}
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

      </main>
    </div>
  );
}
