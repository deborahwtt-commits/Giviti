import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, parseISO, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Mail, Calendar, User, Gift, Users, PartyPopper, Sparkles, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReceivedInvitation = {
  id: string;
  type: 'birthday' | 'collaborative';
  eventName: string;
  eventType: string;
  eventDate: string | null;
  confirmationDeadline: string | null;
  ownerName: string;
  status: string;
  invitedAt: string | null;
  eventId: string;
  shareToken?: string | null;
};

function getStatusLabel(status: string): { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string } {
  switch (status) {
    case 'confirmed':
    case 'accepted':
      return { label: 'Vou participar!', variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800' };
    case 'declined':
    case 'rejected':
      return { label: 'Recusado', variant: 'destructive' };
    case 'pending':
    case 'invited':
      return { label: 'Pendente', variant: 'secondary' };
    case 'maybe':
      return { label: 'Talvez', variant: 'outline' };
    default:
      return { label: status, variant: 'secondary' };
  }
}

function getTypeIcon(type: 'birthday' | 'collaborative', eventType: string) {
  if (type === 'birthday') {
    return <PartyPopper className="w-5 h-5 text-pink-500" />;
  }
  
  if (eventType.includes('Amigo Secreto')) {
    return <Gift className="w-5 h-5 text-red-500" />;
  }
  if (eventType.includes('Noite Temática')) {
    return <Sparkles className="w-5 h-5 text-purple-500" />;
  }
  if (eventType.includes('Presente Coletivo')) {
    return <Gift className="w-5 h-5 text-blue-500" />;
  }
  
  return <Users className="w-5 h-5 text-violet-500" />;
}

export default function ReceivedInvitations() {
  const { data: invitations, isLoading } = useQuery<ReceivedInvitation[]>({
    queryKey: ['/api/user/invitations'],
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          <h1 className="font-heading font-bold text-3xl text-foreground" data-testid="text-page-title">
            Convites Recebidos
          </h1>
        </div>
        <p className="text-muted-foreground">
          Veja todos os eventos para os quais você foi convidado
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : !invitations || invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Nenhum convite recebido
            </h3>
            <p className="text-muted-foreground max-w-md">
              Quando alguém te convidar para um evento de aniversário ou um rolê colaborativo, 
              os convites aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invitations.map((invitation) => {
            const { label: statusLabel, variant: statusVariant, className: statusClassName } = getStatusLabel(invitation.status);
            const typeIcon = getTypeIcon(invitation.type, invitation.eventType);
            
            return (
              <Card 
                key={`${invitation.type}-${invitation.id}`} 
                className="hover-elevate transition-all"
                data-testid={`card-invitation-${invitation.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {typeIcon}
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-invitation-name-${invitation.id}`}>
                          {invitation.eventName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {invitation.eventType}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant} className={statusClassName} data-testid={`badge-invitation-status-${invitation.id}`}>
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>Organizado por <strong className="text-foreground">{invitation.ownerName}</strong></span>
                    </div>
                    
                    {invitation.eventDate && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Data do evento: <strong className="text-foreground">{format(parseISO(invitation.eventDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
                        </span>
                      </div>
                    )}
                    
                    {invitation.confirmationDeadline && (
                      <div className={`flex items-center gap-1.5 ${
                        isPast(parseISO(invitation.confirmationDeadline)) && !isToday(parseISO(invitation.confirmationDeadline))
                          ? 'text-destructive' 
                          : isToday(parseISO(invitation.confirmationDeadline))
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-muted-foreground'
                      }`}>
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Responder até: <strong>{format(parseISO(invitation.confirmationDeadline), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
                          {isPast(parseISO(invitation.confirmationDeadline)) && !isToday(parseISO(invitation.confirmationDeadline)) && (
                            <span className="ml-1.5 text-xs">(prazo expirado)</span>
                          )}
                          {isToday(parseISO(invitation.confirmationDeadline)) && (
                            <span className="ml-1.5 text-xs">(hoje)</span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {invitation.invitedAt && (
                      <div className="text-xs text-muted-foreground/70 pt-1">
                        Convidado em {format(parseISO(invitation.invitedAt), "d/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  
                  {invitation.type === 'collaborative' && (
                    <div className="mt-4">
                      <Link href={`/role/${invitation.eventId}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-role-${invitation.id}`}>
                          Ver Detalhes do Rolê
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {invitation.type === 'birthday' && invitation.shareToken && (
                    <div className="mt-4">
                      <Link href={`/aniversario/${invitation.shareToken}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-birthday-${invitation.id}`}>
                          Ver Detalhes do Convite
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
