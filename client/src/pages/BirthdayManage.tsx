import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Gift,
  Users,
  Plus,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  Mail,
  Check,
  Loader2,
  Cake,
  Calendar,
  MapPin,
} from "lucide-react";

// Função para formatar valor como moeda brasileira
function formatCurrency(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para considerar centavos
  const amount = parseInt(numbers, 10) / 100;
  
  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

interface WishlistItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
  price: string | null;
  priority: number;
  isReceived: boolean;
  receivedFrom: string | null;
}

interface BirthdayGuest {
  id: string;
  name: string;
  email: string;
  rsvpStatus: string | null;
  emailStatus: string;
}

interface Event {
  id: string;
  eventName: string | null;
  eventType: string;
  eventDate: string | Date | null;
  eventLocation: string | null;
  eventDescription: string | null;
  isBirthday: boolean;
}

export default function BirthdayManage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wishlist");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    imageUrl: "",
    purchaseUrl: "",
    price: "",
    priority: 0,
  });

  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
  });

  const { data: event, isLoading: isLoadingEvent } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  const { data: wishlistItems = [], isLoading: isLoadingWishlist } = useQuery<WishlistItem[]>({
    queryKey: ["/api/events", id, "wishlist"],
    enabled: !!id,
  });

  const { data: guests = [], isLoading: isLoadingGuests } = useQuery<BirthdayGuest[]>({
    queryKey: ["/api/events", id, "guests"],
    enabled: !!id,
  });

  const addWishlistItemMutation = useMutation({
    mutationFn: async (data: typeof newItem) => {
      return apiRequest(`/api/events/${id}/wishlist`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowAddItemDialog(false);
      setNewItem({ title: "", description: "", imageUrl: "", purchaseUrl: "", price: "", priority: 0 });
      toast({ title: "Item adicionado!", description: "Seu desejo foi adicionado à lista." });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o item.",
        variant: "destructive",
      });
    },
  });

  const deleteWishlistItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/events/${id}/wishlist/${itemId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Item removido" });
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: async (data: typeof newGuest) => {
      return apiRequest(`/api/events/${id}/guests`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "guests"] });
      setShowAddGuestDialog(false);
      setNewGuest({ name: "", email: "" });
      toast({ title: "Convidado adicionado!", description: "Um convite será enviado por email." });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o convidado.",
        variant: "destructive",
      });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      return apiRequest(`/api/events/${id}/guests/${guestId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "guests"] });
      toast({ title: "Convidado removido" });
    },
  });

  const generateShareLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/events/${id}/share-link`, "POST");
      return response.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
      navigator.clipboard.writeText(fullUrl);
      toast({ title: "Link copiado!", description: "O link foi copiado para a área de transferência." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível gerar o link.", variant: "destructive" });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addWishlistItemMutation.mutate(newItem);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    addGuestMutation.mutate(newGuest);
  };

  const formatEventDate = (date: string | Date | null) => {
    if (!date) return "Sem data definida";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getRsvpBadge = (status: string | null) => {
    switch (status) {
      case "yes":
        return <Badge variant="default" className="bg-green-500">Confirmado</Badge>;
      case "no":
        return <Badge variant="destructive">Não vai</Badge>;
      case "maybe":
        return <Badge variant="secondary">Talvez</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const getEmailStatusBadge = (status: string) => {
    const statusConfig = {
      sent: {
        label: "Enviado",
        className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        tooltip: "Email de convite enviado com sucesso",
        icon: <Check className="w-3 h-3" />,
      },
      failed: {
        label: "Falhou",
        className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
        tooltip: "Falha ao enviar email de convite",
        icon: <Mail className="w-3 h-3" />,
      },
      pending: {
        label: "Pendente",
        className: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
        tooltip: "Email de convite será enviado em breve",
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
      },
      not_sent: {
        label: "Aguardando",
        className: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20",
        tooltip: "Email de convite ainda não enviado",
        icon: <Mail className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_sent;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${config.className}`}
            data-testid={`badge-email-status`}
          >
            {config.icon}
            {config.label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Evento não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/eventos">Voltar aos eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/eventos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos eventos
          </Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Cake className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {event.eventName || event.eventType}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatEventDate(event.eventDate)}
                    </span>
                    {event.eventLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.eventLocation}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateShareLinkMutation.mutate()}
                disabled={generateShareLinkMutation.isPending}
                data-testid="button-share-birthday"
              >
                {generateShareLinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                Compartilhar
              </Button>
            </div>
            {shareUrl && (
              <div className="mt-4 p-3 bg-muted rounded-md flex items-center gap-2">
                <span className="text-sm flex-1 truncate">{shareUrl}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({ title: "Link copiado!" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Lista de Desejos ({wishlistItems.length}/15)
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convidados ({guests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Meus Desejos</h3>
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={wishlistItems.length >= 15}
                    data-testid="button-add-wishlist-item"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Desejo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar à Lista de Desejos</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">O que você deseja? *</Label>
                      <Input
                        id="title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Ex: Fone de ouvido bluetooth"
                        required
                        data-testid="input-wishlist-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Detalhes (opcional)</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Cor, tamanho, modelo específico..."
                        data-testid="input-wishlist-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço estimado</Label>
                        <Input
                          id="price"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: formatCurrency(e.target.value) })}
                          placeholder="R$ 0,00"
                          data-testid="input-wishlist-price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseUrl">Link de compra</Label>
                        <Input
                          id="purchaseUrl"
                          value={newItem.purchaseUrl}
                          onChange={(e) => setNewItem({ ...newItem, purchaseUrl: e.target.value })}
                          placeholder="https://..."
                          data-testid="input-wishlist-url"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={addWishlistItemMutation.isPending}>
                        {addWishlistItemMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingWishlist ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : wishlistItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Sua lista de desejos está vazia.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adicione até 15 itens que você gostaria de ganhar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className={item.isReceived ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.isReceived && (
                              <Badge variant="default" className="bg-green-500">
                                Recebido
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {item.price && (
                              <span className="text-sm font-medium text-primary">
                                {item.price}
                              </span>
                            )}
                            {item.purchaseUrl && (
                              <a
                                href={item.purchaseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                              >
                                Ver produto <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-wishlist-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja remover "{item.title}" da sua lista de desejos?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWishlistItemMutation.mutate(item.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guests" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Meus Convidados</h3>
              <Dialog open={showAddGuestDialog} onOpenChange={setShowAddGuestDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-guest">
                    <Plus className="h-4 w-4 mr-2" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar para o Aniversário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddGuest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Nome *</Label>
                      <Input
                        id="guestName"
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        placeholder="Nome do convidado"
                        required
                        data-testid="input-guest-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={newGuest.email}
                        onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                        placeholder="email@exemplo.com"
                        required
                        data-testid="input-guest-email"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Um convite será enviado por email com o link para ver sua lista de desejos.
                    </p>
                    <DialogFooter>
                      <Button type="submit" disabled={addGuestMutation.isPending}>
                        {addGuestMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Enviar Convite
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingGuests ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : guests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum convidado ainda.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Convide amigos e familiares para seu aniversário!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {guests.map((guest) => (
                    <Card key={guest.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-lg font-medium">
                                {guest.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{guest.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {guest.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getEmailStatusBadge(guest.emailStatus)}
                            {getRsvpBadge(guest.rsvpStatus)}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-testid={`button-delete-guest-${guest.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover convidado?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Deseja remover {guest.name} da lista de convidados?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteGuestMutation.mutate(guest.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
