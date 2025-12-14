import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Mail, Users, Calendar, PartyPopper } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_celebration_gift_exchange_b57996b1.png";
import HoroscopeBanner from "@/components/HoroscopeBanner";

interface DashboardHeroProps {
  userName: string;
  stats: {
    totalRecipients: number;
    upcomingEvents: number;
    giftsPurchased: number;
    totalSpent: number;
    upcomingRoles: number;
    invitationsReceived: number;
  };
  onCreateRecipient: () => void;
  onExploreSuggestions: () => void;
  onRecipientsClick?: () => void;
  onEventsClick?: () => void;
  onGiftsClick?: () => void;
  onRolesClick?: () => void;
  onInvitationsClick?: () => void;
}

export default function DashboardHero({
  userName,
  stats,
  onCreateRecipient,
  onExploreSuggestions,
  onRecipientsClick,
  onEventsClick,
  onGiftsClick,
  onRolesClick,
  onInvitationsClick,
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background rounded-lg">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
      </div>

      <div className="relative px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Bem-vindo de volta
            </span>
          </div>

          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Olá, {userName}!
          </h1>

          <p className="text-lg text-muted-foreground mb-6">
            Encontre o presente perfeito para quem você ama. Sugestões
            personalizadas prontas para você.
          </p>

          <div className="mb-6">
            <HoroscopeBanner />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div 
              className="bg-card/80 backdrop-blur-sm p-4 rounded-md border border-card-border cursor-pointer hover-elevate transition-all"
              onClick={onRecipientsClick}
              data-testid="stat-recipients"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onRecipientsClick?.();
                }
              }}
            >
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {stats.totalRecipients}
              </div>
              <div className="text-xs text-muted-foreground">Presenteados</div>
            </div>
            <div 
              className="bg-card/80 backdrop-blur-sm p-4 rounded-md border border-card-border cursor-pointer hover-elevate transition-all"
              onClick={onEventsClick}
              data-testid="stat-events"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onEventsClick?.();
                }
              }}
            >
              <div className="text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {stats.upcomingEvents}
              </div>
              <div className="text-xs text-muted-foreground">
                Eventos próximos
              </div>
            </div>
            <div 
              className="bg-card/80 backdrop-blur-sm p-4 rounded-md border border-card-border cursor-pointer hover-elevate transition-all"
              onClick={onRolesClick}
              data-testid="stat-upcoming-roles"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onRolesClick?.();
                }
              }}
            >
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2">
                <PartyPopper className="w-5 h-5" />
                {stats.upcomingRoles}
              </div>
              <div className="text-xs text-muted-foreground">
                Rolês próximos
              </div>
            </div>
            <div 
              className="bg-card/80 backdrop-blur-sm p-4 rounded-md border border-card-border cursor-pointer hover-elevate transition-all"
              onClick={onInvitationsClick}
              data-testid="stat-invitations"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onInvitationsClick?.();
                }
              }}
            >
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {stats.invitationsReceived}
              </div>
              <div className="text-xs text-muted-foreground">
                Convites recebidos
              </div>
            </div>
            <div 
              className="bg-card/80 backdrop-blur-sm p-4 rounded-md border border-card-border cursor-pointer hover-elevate transition-all"
              onClick={onGiftsClick}
              data-testid="stat-gifts"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onGiftsClick?.();
                }
              }}
            >
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                {stats.giftsPurchased}
              </div>
              <div className="text-xs text-muted-foreground">
                Presentes dados
              </div>
              {stats.totalSpent > 0 && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium" data-testid="stat-total-spent">
                  R$ {stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onCreateRecipient}
              data-testid="button-create-recipient"
            >
              <Gift className="w-4 h-4 mr-2" />
              Criar Novo Presenteado
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onExploreSuggestions}
              data-testid="button-explore-suggestions"
            >
              Explorar Sugestões
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
