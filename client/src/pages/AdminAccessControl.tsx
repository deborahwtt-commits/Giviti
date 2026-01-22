import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Loader2, 
  Ticket, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Mail,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccessTicketSchema, type InsertAccessTicket, type AccessTicket, type Waitlist, type User } from "@shared/schema";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AccessTicketWithUsage extends AccessTicket {
  usage?: Array<{ id: string; userId: string; createdAt: string; user: User }>;
}

export default function AdminAccessControl() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"tickets" | "waitlist">("tickets");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<AccessTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [waitlistPage, setWaitlistPage] = useState(1);
  const WAITLIST_PAGE_SIZE = 10;

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const hasAdminAccess = user?.role === "admin" || user?.role === "manager";

  const { data: tickets, isLoading: ticketsLoading } = useQuery<AccessTicket[]>({
    queryKey: ["/api/admin/access-tickets"],
    enabled: hasAdminAccess,
  });

  const { data: waitlist, isLoading: waitlistLoading } = useQuery<Waitlist[]>({
    queryKey: ["/api/admin/waitlist"],
    enabled: hasAdminAccess,
  });

  // Waitlist statistics and pagination
  const waitlistStats = useMemo(() => {
    if (!waitlist) return { total: 0, pending: 0, invited: 0, registered: 0 };
    return {
      total: waitlist.length,
      pending: waitlist.filter(w => w.status === "pending").length,
      invited: waitlist.filter(w => w.status === "invited").length,
      registered: waitlist.filter(w => w.status === "registered").length,
    };
  }, [waitlist]);

  const paginatedWaitlist = useMemo(() => {
    if (!waitlist) return [];
    const startIndex = (waitlistPage - 1) * WAITLIST_PAGE_SIZE;
    return waitlist.slice(startIndex, startIndex + WAITLIST_PAGE_SIZE);
  }, [waitlist, waitlistPage]);

  const waitlistTotalPages = useMemo(() => {
    if (!waitlist) return 0;
    return Math.ceil(waitlist.length / WAITLIST_PAGE_SIZE);
  }, [waitlist]);

  // Reset page when waitlist changes to avoid empty table
  useEffect(() => {
    if (waitlistTotalPages > 0 && waitlistPage > waitlistTotalPages) {
      setWaitlistPage(waitlistTotalPages);
    }
  }, [waitlistTotalPages, waitlistPage]);

  const { data: expandedTicketData, isLoading: ticketUsageLoading } = useQuery<AccessTicketWithUsage>({
    queryKey: ["/api/admin/access-tickets", expandedTicketId],
    enabled: !!expandedTicketId,
  });

  const ticketForm = useForm<InsertAccessTicket>({
    resolver: zodResolver(insertAccessTicketSchema),
    defaultValues: {
      code: "",
      recipientName: "",
      recipientEmail: "",
      maxAccounts: 1,
      isActive: true,
      notes: "",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertAccessTicket) => {
      return await apiRequest("/api/admin/access-tickets", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Passe VIP criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-tickets"] });
      setShowCreateDialog(false);
      ticketForm.reset();
    },
    onError: (error: any) => {
      const message = error?.message?.match(/\{.*\}/)?.[0];
      const parsed = message ? JSON.parse(message) : null;
      toast({ 
        title: "Erro ao criar passe VIP", 
        description: parsed?.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAccessTicket> }) => {
      return await apiRequest(`/api/admin/access-tickets/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({ title: "Passe VIP atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-tickets"] });
      setEditingTicket(null);
      ticketForm.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar passe VIP", variant: "destructive" });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/access-tickets/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Passe VIP excluído!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-tickets"] });
    },
    onError: () => {
      toast({ title: "Erro ao excluir passe VIP", variant: "destructive" });
    },
  });

  const deleteWaitlistMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/waitlist/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Entrada removida!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/waitlist"] });
    },
    onError: () => {
      toast({ title: "Erro ao remover entrada", variant: "destructive" });
    },
  });

  const handleCreateTicket = (data: InsertAccessTicket) => {
    createTicketMutation.mutate(data);
  };

  const handleEditTicket = (data: InsertAccessTicket) => {
    if (editingTicket) {
      updateTicketMutation.mutate({ id: editingTicket.id, data });
    }
  };

  const openEditDialog = (ticket: AccessTicket) => {
    setEditingTicket(ticket);
    ticketForm.reset({
      code: ticket.code,
      recipientName: ticket.recipientName,
      recipientEmail: ticket.recipientEmail || "",
      maxAccounts: ticket.maxAccounts,
      isActive: ticket.isActive,
      notes: ticket.notes || "",
    });
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: "Código copiado!" });
  };

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    ticketForm.setValue("code", code);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Acesso não autorizado</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/admin")}
          data-testid="button-back-admin"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Controle de Acesso</h1>
          <p className="text-muted-foreground">Gerenciar passes VIP e lista de espera</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tickets" | "waitlist")}>
        <TabsList className="mb-6">
          <TabsTrigger value="tickets" className="flex items-center gap-2" data-testid="tab-tickets">
            <Ticket className="h-4 w-4" />
            Passes VIP
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="flex items-center gap-2" data-testid="tab-waitlist">
            <Clock className="h-4 w-4" />
            Lista de Espera
            {waitlist && waitlist.length > 0 && (
              <Badge variant="secondary" className="ml-1">{waitlist.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Passes VIP Ativos</h2>
            <Button 
              onClick={() => {
                ticketForm.reset();
                setShowCreateDialog(true);
              }}
              data-testid="button-create-ticket"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Passe
            </Button>
          </div>

          {ticketsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4" data-testid={`ticket-card-${ticket.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-lg font-mono font-bold bg-muted px-2 py-1 rounded">
                          {ticket.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(ticket.code)}
                          data-testid={`button-copy-${ticket.id}`}
                        >
                          {copiedCode === ticket.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {!ticket.isActive && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{ticket.recipientName}</p>
                        {ticket.recipientEmail && (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ticket.recipientEmail}
                          </p>
                        )}
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ticket.usedAccounts} / {ticket.maxAccounts} contas usadas
                        </p>
                        {ticket.notes && (
                          <p className="text-xs text-muted-foreground italic mt-2">
                            {ticket.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {ticket.usedAccounts > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleTicketExpand(ticket.id)}
                          data-testid={`button-view-${ticket.id}`}
                          title="Visualizar usuários"
                        >
                          {expandedTicketId === ticket.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(ticket)}
                        data-testid={`button-edit-${ticket.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteTicketMutation.mutate(ticket.id)}
                        disabled={deleteTicketMutation.isPending}
                        data-testid={`button-delete-${ticket.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Usage Section */}
                  {expandedTicketId === ticket.id && (
                    <div className="mt-4 pt-4 border-t" data-testid={`ticket-usage-${ticket.id}`}>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Usuários que usaram este passe
                      </h4>
                      {ticketUsageLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : expandedTicketData?.usage && expandedTicketData.usage.length > 0 ? (
                        <div className="space-y-2">
                          {expandedTicketData.usage.map((usageEntry) => (
                            <div 
                              key={usageEntry.id}
                              className="bg-muted/50 rounded-lg p-3 flex flex-wrap items-center gap-4"
                              data-testid={`usage-entry-${usageEntry.id}`}
                            >
                              <div className="flex-1 min-w-[200px]">
                                <p className="font-medium">
                                  {usageEntry.user.firstName} {usageEntry.user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {usageEntry.user.email}
                                </p>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {usageEntry.createdAt && format(new Date(usageEntry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          Nenhum usuário usou este passe ainda.
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum passe VIP criado ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie passes VIP para permitir que pessoas se registrem
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="waitlist">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AdminStatsCard
              title="Total na Lista"
              value={waitlistStats.total}
              icon={Users}
              description="Pessoas inscritas"
            />
            <AdminStatsCard
              title="Aguardando"
              value={waitlistStats.pending}
              icon={Clock}
              description="Pendentes de convite"
            />
            <AdminStatsCard
              title="Convidados"
              value={waitlistStats.invited}
              icon={Mail}
              description="Convites enviados"
            />
            <AdminStatsCard
              title="Registrados"
              value={waitlistStats.registered}
              icon={UserPlus}
              description="Criaram conta"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Lista de Espera</h2>
            {waitlist && waitlist.length > 0 && (
              <span className="text-sm text-muted-foreground" data-testid="waitlist-count">
                Mostrando {((waitlistPage - 1) * WAITLIST_PAGE_SIZE) + 1} - {Math.min(waitlistPage * WAITLIST_PAGE_SIZE, waitlist.length)} de {waitlist.length}
              </span>
            )}
          </div>

          {waitlistLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : waitlist && waitlist.length > 0 ? (
            <>
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm font-medium">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">E-mail</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Inscrito</th>
                      <th className="text-right py-3 px-4 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWaitlist.map((entry) => (
                      <tr 
                        key={entry.id} 
                        className="border-b last:border-0"
                        data-testid={`waitlist-row-${entry.id}`}
                      >
                        <td className="py-3 px-4 font-medium">{entry.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{entry.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            entry.status === "pending" ? "secondary" :
                            entry.status === "invited" ? "default" : "outline"
                          }>
                            {entry.status === "pending" ? "Aguardando" :
                             entry.status === "invited" ? "Convidado" : "Registrado"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {entry.createdAt && formatDistanceToNow(new Date(entry.createdAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWaitlistMutation.mutate(entry.id)}
                            disabled={deleteWaitlistMutation.isPending}
                            data-testid={`button-delete-waitlist-${entry.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Pagination */}
              {waitlistTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {waitlistPage} de {waitlistTotalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaitlistPage(p => Math.max(1, p - 1))}
                      disabled={waitlistPage === 1}
                      data-testid="button-waitlist-prev"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWaitlistPage(p => Math.min(waitlistTotalPages, p + 1))}
                      disabled={waitlistPage === waitlistTotalPages}
                      data-testid="button-waitlist-next"
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Lista de espera vazia</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pessoas sem passe VIP podem se inscrever na lista de espera
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Ticket Dialog */}
      <Dialog 
        open={showCreateDialog || !!editingTicket} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTicket(null);
            ticketForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Editar Passe VIP" : "Criar Novo Passe VIP"}
            </DialogTitle>
            <DialogDescription>
              {editingTicket 
                ? "Atualize as informações do passe VIP"
                : "Crie um novo passe VIP para permitir registros"}
            </DialogDescription>
          </DialogHeader>
          <Form {...ticketForm}>
            <form onSubmit={ticketForm.handleSubmit(editingTicket ? handleEditTicket : handleCreateTicket)} className="space-y-4">
              <FormField
                control={ticketForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Passe</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="EX: AMIGO2024"
                          className="uppercase font-mono"
                          data-testid="input-ticket-code"
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={generateRandomCode}
                        data-testid="button-generate-code"
                      >
                        Gerar
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ticketForm.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Destinatário</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Para quem é este passe"
                        data-testid="input-ticket-recipient"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ticketForm.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="email"
                        placeholder="email@exemplo.com"
                        data-testid="input-ticket-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ticketForm.control}
                name="maxAccounts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Contas</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={100}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-ticket-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={ticketForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Passe Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-ticket-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={ticketForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Observações internas sobre este passe"
                        className="resize-none"
                        data-testid="input-ticket-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingTicket(null);
                    ticketForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createTicketMutation.isPending || updateTicketMutation.isPending}
                  data-testid="button-save-ticket"
                >
                  {(createTicketMutation.isPending || updateTicketMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingTicket ? "Salvar" : "Criar Passe"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
