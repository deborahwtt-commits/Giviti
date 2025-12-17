import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AddParticipantDialog } from "@/components/AddParticipantDialog";
import { ParticipantPreferencesDialog } from "@/components/ParticipantPreferencesDialog";
import {
  Gift,
  PartyPopper,
  Heart,
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Settings,
  Eye,
  Loader2,
  UserPlus,
  Share2,
  Trash2,
  MoreVertical,
  Check,
  Clock,
  X,
  Mail,
  Save,
  DollarSign,
  FileText,
  ClipboardCheck,
  Music,
  Home,
  Lightbulb,
  ShoppingBag,
  ExternalLink,
  CalendarPlus,
  Ban,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import type { CollaborativeEvent, CollaborativeEventParticipant } from "@shared/schema";

const eventTypeInfo: Record<string, { label: string; className: string; Icon: LucideIcon }> = {
  secret_santa: { 
    label: "Amigo Secreto", 
    className: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", 
    Icon: Gift 
  },
  themed_night: { 
    label: "Noite Temática", 
    className: "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", 
    Icon: PartyPopper 
  },
  collective_gift: { 
    label: "Presente Coletivo", 
    className: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", 
    Icon: Heart 
  },
  creative_challenge: { 
    label: "Desafio Criativo", 
    className: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", 
    Icon: Sparkles 
  },
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
};

interface SecretSantaRules {
  minGiftValue?: number | null;
  maxGiftValue?: number | null;
  rulesDescription?: string | null;
}

interface EnrichedPair {
  id: string;
  eventId: string;
  giverParticipantId: string;
  receiverParticipantId: string;
  isRevealed: boolean;
  giver: CollaborativeEventParticipant;
  receiver: CollaborativeEventParticipant;
}

interface MyPairResponse {
  pair: {
    id: string;
    eventId: string;
    giverParticipantId: string;
    receiverParticipantId: string;
    isRevealed: boolean;
  };
  receiver: CollaborativeEventParticipant;
}

interface ParticipantUserProfile {
  ageRange: string | null;
  gender: string | null;
  zodiacSign: string | null;
  giftPreference: string | null;
  freeTimeActivity: string | null;
  musicalStyle: string | null;
  monthlyGiftPreference: string | null;
  surpriseReaction: string | null;
  giftPriority: string | null;
  giftGivingStyle: string | null;
  specialTalent: string | null;
  giftsToAvoid: string | null;
  interests: string[] | null;
}

interface ParticipantWithProfile extends CollaborativeEventParticipant {
  hasFilledProfile: boolean;
  wishlistItemsCount: number;
  userProfile: ParticipantUserProfile | null;
}

interface CollectiveGiftData {
  targetAmount?: number;
  giftName?: string;
  giftDescription?: string;
  purchaseLink?: string;
  recipientName?: string;
}

interface ContributionWithParticipant {
  id: string;
  eventId: string;
  participantId: string;
  amountDue: number;
  amountPaid: number;
  isPaid: boolean;
  paidAt: string | null;
  paymentNotes: string | null;
  participant: CollaborativeEventParticipant | null;
}

interface ContributionsSummary {
  totalDue: number;
  totalPaid: number;
  participantsCount: number;
  paidCount: number;
  targetAmount: number;
  progress: number;
}

interface EnrichedRestriction {
  id: string;
  eventId: string;
  blockerParticipantId: string;
  blockedParticipantId: string;
  createdAt: string;
  blockerName: string;
  blockedName: string;
}

interface SecretSantaWishlistItem {
  id: string;
  participantId: string;
  eventId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
  price: string | null;
  priority: number | null;
  displayOrder: number | null;
  createdAt: string | null;
}

export default function RoleDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [confirmDrawOpen, setConfirmDrawOpen] = useState(false);
  const [selectedParticipantForProfile, setSelectedParticipantForProfile] = useState<ParticipantWithProfile | null>(null);
  
  const [minGiftValue, setMinGiftValue] = useState<string>("");
  const [maxGiftValue, setMaxGiftValue] = useState<string>("");
  const [rulesDescription, setRulesDescription] = useState<string>("");
  
  // Description editing states
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState<string>("");

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<CollaborativeEvent>({
    queryKey: ["/api/collab-events", id],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Rolê não encontrado");
        }
        if (response.status === 403) {
          throw new Error("Você não tem permissão para acessar este rolê");
        }
        throw new Error("Erro ao carregar rolê");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const { data: participants, isLoading: participantsLoading, error: participantsError } = useQuery<ParticipantWithProfile[]>({
    queryKey: ["/api/collab-events", id, "participants"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/participants`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Participantes não encontrados");
        }
        if (response.status === 403) {
          throw new Error("Você não tem permissão para ver os participantes");
        }
        throw new Error("Erro ao carregar participantes");
      }
      return response.json();
    },
    enabled: !!id && !!event,
  });

  // Fetch themed night category if applicable
  const { data: themedCategory } = useQuery<{ id: string; name: string; description: string | null }>({
    queryKey: ["/api/themed-night-categories", event?.themedNightCategoryId],
    enabled: !!event && event.eventType === "themed_night" && !!event.themedNightCategoryId,
  });

  // Fetch themed night suggestions for the category
  const { data: themedSuggestions } = useQuery<Array<{
    id: string;
    categoryId: string;
    title: string;
    suggestionType: string;
    content: string | null;
    mediaUrl: string | null;
    priority: number | null;
    tags: string[] | null;
  }>>({
    queryKey: ["/api/themed-night-categories", event?.themedNightCategoryId, "suggestions"],
    enabled: !!event && event.eventType === "themed_night" && !!event.themedNightCategoryId,
  });

  // Calculate if current user is owner
  const isOwner = event && user && event.ownerId === user.id;

  // Owner-only query: draw status is restricted to event owners
  const { data: drawStatus, isLoading: drawStatusLoading } = useQuery<{
    isDrawPerformed: boolean;
    pairsCount?: number;
    confirmedParticipantsCount?: number;
    totalParticipantsCount?: number;
    isOwner: boolean;
  }>({
    queryKey: ["/api/collab-events", id, "draw-status"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/draw-status`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao verificar status do sorteio");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && isOwner,
  });

  // Query: All pairs (owner only) - for displaying in Overview after draw
  const { data: allPairs, isLoading: allPairsLoading } = useQuery<EnrichedPair[]>({
    queryKey: ["/api/collab-events", id, "pairs"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/pairs`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar pares");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && isOwner && drawStatus?.isDrawPerformed === true,
  });

  // Query: My pair (participant view) - for non-owners to see who they got
  const { data: myPair, isLoading: myPairLoading } = useQuery<MyPairResponse>({
    queryKey: ["/api/collab-events", id, "my-pair"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/my-pair`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Erro ao buscar seu par");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && !isOwner,
  });

  // Query: User profile (participant view) - to check if profile is filled
  const { data: userProfile } = useQuery<{ isCompleted: boolean }>({
    queryKey: ["/api/profile"],
    enabled: !isOwner && event?.eventType === "secret_santa",
  });

  // State for confirming redraw
  const [confirmRedrawOpen, setConfirmRedrawOpen] = useState(false);
  
  // State for reschedule dialog
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  
  // State for restrictions management
  const [selectedBlockerId, setSelectedBlockerId] = useState<string>("");
  const [selectedBlockedId, setSelectedBlockedId] = useState<string>("");
  
  // State for wishlist dialog
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false);
  const [wishlistTitle, setWishlistTitle] = useState("");
  const [wishlistDescription, setWishlistDescription] = useState("");
  const [wishlistUrl, setWishlistUrl] = useState("");
  const [wishlistPrice, setWishlistPrice] = useState("");
  const [wishlistPriority, setWishlistPriority] = useState<string>("3");

  // Collective Gift Queries
  const { data: contributions, isLoading: contributionsLoading } = useQuery<ContributionWithParticipant[]>({
    queryKey: ["/api/collab-events", id, "contributions"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/contributions`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar contribuições");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "collective_gift",
  });

  const { data: contributionsSummary, isLoading: summaryLoading } = useQuery<ContributionsSummary>({
    queryKey: ["/api/collab-events", id, "contributions", "summary"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/contributions/summary`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar resumo");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "collective_gift",
  });

  // Secret Santa Restrictions Query
  const { data: restrictions, isLoading: restrictionsLoading } = useQuery<EnrichedRestriction[]>({
    queryKey: ["/api/collab-events", id, "restrictions"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/restrictions`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar restrições");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && isOwner,
  });

  // Secret Santa Wishlist Query (participant view)
  const { data: myWishlist, isLoading: wishlistLoading } = useQuery<SecretSantaWishlistItem[]>({
    queryKey: ["/api/collab-events", id, "my-wishlist"],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/my-wishlist`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar lista de desejos");
      }
      return response.json();
    },
    enabled: !!id && !!event && event.eventType === "secret_santa" && !isOwner,
  });

  // Receiver's wishlist query (for participant to see what their receiver wants)
  const { data: receiverWishlist, isLoading: receiverWishlistLoading } = useQuery<SecretSantaWishlistItem[]>({
    queryKey: ["/api/collab-events", id, "receiver-wishlist", myPair?.receiver?.id],
    queryFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/receiver-wishlist`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error("Erro ao buscar lista de desejos do sorteado");
      }
      return response.json();
    },
    enabled: Boolean(id && event && event.eventType === "secret_santa" && !isOwner && myPair?.receiver),
  });

  // Add wishlist item mutation
  const addWishlistItemMutation = useMutation({
    mutationFn: async (item: { title: string; description?: string; purchaseUrl?: string; price?: string; priority?: number }) => {
      const response = await fetch(`/api/collab-events/${id}/my-wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao adicionar item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "my-wishlist"] });
      setWishlistDialogOpen(false);
      setWishlistTitle("");
      setWishlistDescription("");
      setWishlistUrl("");
      setWishlistPrice("");
      setWishlistPriority("3");
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado à sua lista de desejos.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove wishlist item mutation
  const removeWishlistItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/collab-events/${id}/my-wishlist/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao remover item");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "my-wishlist"] });
      toast({
        title: "Item removido",
        description: "O item foi removido da sua lista de desejos.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddWishlistItem = () => {
    if (!wishlistTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe o nome do item desejado.",
        variant: "destructive",
      });
      return;
    }
    addWishlistItemMutation.mutate({
      title: wishlistTitle.trim(),
      description: wishlistDescription.trim() || undefined,
      purchaseUrl: wishlistUrl.trim() || undefined,
      price: wishlistPrice.trim() || undefined,
      priority: parseInt(wishlistPriority) || 3,
    });
  };

  // Create restriction mutation
  const createRestrictionMutation = useMutation({
    mutationFn: async ({ blockerParticipantId, blockedParticipantId }: { blockerParticipantId: string; blockedParticipantId: string }) => {
      if (blockerParticipantId === blockedParticipantId) {
        throw new Error("Um participante não pode ser bloqueado de tirar a si mesmo.");
      }
      const response = await fetch(`/api/collab-events/${id}/restrictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blockerParticipantId, blockedParticipantId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao criar restrição");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "restrictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      setSelectedBlockerId("");
      setSelectedBlockedId("");
      toast({
        title: "Restrição adicionada",
        description: "A restrição de par foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar restrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete restriction mutation
  const deleteRestrictionMutation = useMutation({
    mutationFn: async (restrictionId: string) => {
      const response = await fetch(`/api/collab-events/${id}/restrictions/${restrictionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao remover restrição");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "restrictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      toast({
        title: "Restrição removida",
        description: "A restrição de par foi removida com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover restrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize contributions mutation
  const initializeContributionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/collab-events/${id}/contributions/initialize`, "POST");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "contributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "contributions", "summary"] });
      toast({
        title: "Contribuições criadas",
        description: `${data.created} contribuições criadas. Valor por pessoa: R$ ${(data.amountPerPerson / 100).toFixed(2)}`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar as contribuições",
        variant: "destructive",
      });
    },
  });

  // Update contribution mutation
  const updateContributionMutation = useMutation({
    mutationFn: async ({ contributionId, updates }: { contributionId: string; updates: Record<string, unknown> }) => {
      const response = await apiRequest(`/api/collab-events/${id}/contributions/${contributionId}`, "PATCH", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "contributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "contributions", "summary"] });
      toast({
        title: "Contribuição atualizada",
        description: "O status da contribuição foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a contribuição",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (event && event.eventType === "secret_santa" && event.typeSpecificData) {
      const data = event.typeSpecificData as SecretSantaRules;
      setMinGiftValue(data.minGiftValue?.toString() || "");
      setMaxGiftValue(data.maxGiftValue?.toString() || "");
      setRulesDescription(data.rulesDescription || "");
    }
  }, [event]);

  const saveRulesMutation = useMutation({
    mutationFn: async (rules: SecretSantaRules) => {
      return await apiRequest(`/api/collab-events/${id}`, "PATCH", {
        typeSpecificData: rules
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Regras salvas",
        description: "As regras do Amigo Secreto foram atualizadas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar regras",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveRules = () => {
    const rules: SecretSantaRules = {
      minGiftValue: minGiftValue ? parseFloat(minGiftValue) : null,
      maxGiftValue: maxGiftValue ? parseFloat(maxGiftValue) : null,
      rulesDescription: rulesDescription || null,
    };
    saveRulesMutation.mutate(rules);
  };

  // Mutation to save event description
  const saveDescriptionMutation = useMutation({
    mutationFn: async (description: string) => {
      return await apiRequest(`/api/collab-events/${id}`, "PATCH", {
        description: description || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      setIsEditingDescription(false);
      toast({
        title: "Descrição salva",
        description: "A descrição do rolê foi atualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar descrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartEditDescription = () => {
    setEditedDescription(event?.description || "");
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  const handleSaveDescription = () => {
    // Only save if there's an actual change
    const currentDescription = event?.description || "";
    if (editedDescription.trim() === currentDescription.trim()) {
      setIsEditingDescription(false);
      return;
    }
    saveDescriptionMutation.mutate(editedDescription.trim());
  };

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Participante removido",
        description: "O participante foi removido com sucesso.",
      });
      setParticipantToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover participante",
        description: error.message,
        variant: "destructive",
      });
      setParticipantToRemove(null);
    },
  });

  const updateParticipantStatusMutation = useMutation({
    mutationFn: async ({ participantId, status }: { participantId: string; status: "pending" | "accepted" | "declined" }) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}/status`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      toast({
        title: "Status atualizado",
        description: "O status do participante foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await apiRequest(`/api/collab-events/${id}/participants/${participantId}/resend-invite`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] });
      toast({
        title: "Convite reenviado",
        description: "O email de convite foi reenviado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const performDrawMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/collab-events/${id}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422 && errorData.code === "IMPOSSIBLE_DRAW") {
          throw new Error("IMPOSSIBLE_DRAW");
        }
        throw new Error(errorData.error || "Erro ao realizar sorteio");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "pairs"] });
      
      let description = data.message || "O sorteio foi realizado com sucesso.";
      if (data.emailsSent !== undefined && data.emailsSent > 0) {
        description += ` ${data.emailsSent} email(s) enviado(s) aos participantes.`;
      }
      
      toast({
        title: "Sorteio realizado!",
        description,
      });
      setConfirmDrawOpen(false);
    },
    onError: (error: Error) => {
      setConfirmDrawOpen(false);
      
      if (error.message === "IMPOSSIBLE_DRAW") {
        toast({
          title: "Sorteio impossível",
          description: "Não foi possível realizar o sorteio com as restrições configuradas. Tente remover algumas restrições de pares proibidos nas Configurações.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao realizar sorteio",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const deletePairsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/collab-events/${id}/pairs`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "draw-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "pairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "my-pair"] });
      toast({
        title: "Pares removidos",
        description: "Os pares foram removidos. Você pode realizar um novo sorteio.",
      });
      setConfirmRedrawOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover pares",
        description: error.message,
        variant: "destructive",
      });
      setConfirmRedrawOpen(false);
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async (newDate: string) => {
      return await apiRequest(`/api/collab-events/${id}/reschedule`, "POST", { eventDate: newDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/collab-events"] });
      toast({
        title: "Rolê reagendado!",
        description: "O rolê foi reagendado e está ativo novamente.",
      });
      setRescheduleDialogOpen(false);
      setRescheduleDate("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reagendar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReschedule = () => {
    if (!rescheduleDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma nova data para o rolê.",
        variant: "destructive",
      });
      return;
    }
    rescheduleMutation.mutate(rescheduleDate);
  };

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/role">
            <Button variant="ghost" size="icon" data-testid="button-back-roles">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Rolê não encontrado</h1>
          </div>
        </div>
        <Card className="p-6 max-w-md">
          <p className="text-muted-foreground">
            {eventError instanceof Error ? eventError.message : "Rolê não encontrado ou você não tem acesso."}
          </p>
          <Link href="/role">
            <Button className="mt-4" data-testid="button-back-to-roles">
              Voltar para Rolês
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const typeInfo = eventTypeInfo[event.eventType] || {
    label: event.eventType,
    className: "",
    Icon: Calendar,
  };
  const TypeIcon = typeInfo.Icon;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const budgetLimit =
    event.eventType === "secret_santa" &&
    event.typeSpecificData &&
    typeof event.typeSpecificData === "object" &&
    "budgetLimit" in event.typeSpecificData &&
    typeof (event.typeSpecificData as { budgetLimit?: unknown }).budgetLimit === "number"
      ? (event.typeSpecificData as { budgetLimit: number }).budgetLimit
      : null;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/role">
          <Button variant="ghost" size="icon" data-testid="button-back-roles">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-role-name">{event.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={typeInfo.className} data-testid="badge-role-type">
                  {typeInfo.label}
                </Badge>
                <Badge variant="outline" data-testid="badge-role-status">
                  {statusLabels[event.status]}
                </Badge>
                {event.isPublic && (
                  <Badge variant="outline" data-testid="badge-role-public">
                    <Eye className="w-3 h-3 mr-1" />
                    Público
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && event.status === "completed" && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setRescheduleDialogOpen(true)}
              data-testid="button-reschedule-role"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Reagendar
            </Button>
          )}
          <Button variant="outline" size="sm" data-testid="button-share-role">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Eye className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="participants" data-testid="tab-participants">
            <Users className="w-4 h-4 mr-2" />
            Participantes ({participants?.length || 0})
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Rolê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.eventDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Data e Hora</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-event-date">
                        {format(typeof event.eventDate === 'string' ? parseISO(event.eventDate) : event.eventDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                {event.confirmationDeadline && (() => {
                  const deadline = typeof event.confirmationDeadline === 'string' 
                    ? parseISO(event.confirmationDeadline) 
                    : event.confirmationDeadline;
                  const now = new Date();
                  const isExpired = now > deadline;
                  const isUrgent = !isExpired && (deadline.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;
                  
                  return (
                    <div className={`flex items-start gap-3 p-2 rounded-md ${
                      isExpired 
                        ? 'bg-destructive/10' 
                        : isUrgent 
                          ? 'bg-amber-100 dark:bg-amber-950'
                          : ''
                    }`}>
                      <Clock className={`w-5 h-5 mt-0.5 ${
                        isExpired 
                          ? 'text-destructive' 
                          : isUrgent 
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          isExpired 
                            ? 'text-destructive' 
                            : isUrgent 
                              ? 'text-amber-700 dark:text-amber-300'
                              : ''
                        }`}>
                          Prazo para Confirmar
                        </p>
                        <p className={`text-sm ${
                          isExpired 
                            ? 'text-destructive' 
                            : isUrgent 
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                        }`} data-testid="text-confirmation-deadline">
                          {isExpired 
                            ? `Encerrado em ${format(deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                            : format(deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          }
                        </p>
                      </div>
                    </div>
                  );
                })()}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Local</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-event-location">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}
                {/* Editable description section */}
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Descrição</p>
                      {isOwner && !isEditingDescription && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleStartEditDescription}
                          data-testid="button-edit-description"
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Adicione uma descrição para o rolê..."
                          className="min-h-[80px]"
                          data-testid="textarea-event-description"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveDescription}
                            disabled={saveDescriptionMutation.isPending}
                            data-testid="button-save-description"
                          >
                            {saveDescriptionMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Save className="w-4 h-4 mr-1" />
                            )}
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditDescription}
                            disabled={saveDescriptionMutation.isPending}
                            data-testid="button-cancel-description"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground" data-testid="text-event-description">
                        {event.description || (isOwner ? "Nenhuma descrição definida. Clique em Editar para adicionar." : "Nenhuma descrição definida.")}
                      </p>
                    )}
                  </div>
                </div>
                {event.eventType === "themed_night" && themedCategory && (
                  <div className="flex items-start gap-3">
                    <PartyPopper className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Qual é a boa?</p>
                      <p className="text-sm font-semibold" data-testid="text-themed-category-name">
                        {themedCategory.name}
                      </p>
                      {themedCategory.description && (
                        <p className="text-sm text-muted-foreground mt-1" data-testid="text-themed-category-description">
                          {themedCategory.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Status do Perfil - Participante Amigo Secreto */}
            {event.eventType === "secret_santa" && !isOwner && (
              <Card data-testid="card-profile-status">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Seu Perfil de Presentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile?.isCompleted ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
                        Perfil Completo
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Quem te tirou vai ter boas dicas do que você gosta!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Psiu... seu amigo secreto está perdido sem saber o que você gosta! 
                        Que tal dar uma mãozinha e preencher suas preferências?
                      </p>
                      <Link href="/perfil" data-testid="link-fill-profile">
                        <Button variant="outline" size="sm" data-testid="button-fill-profile">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Preencher meu perfil
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Themed Night Suggestions Card */}
            {event.eventType === "themed_night" && themedSuggestions && themedSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Sugestões para o Rolê
                  </CardTitle>
                  <CardDescription>
                    Dicas e ideias para tornar sua noite ainda mais especial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group by suggestion type */}
                  {['produto', 'ambiente', 'atividade', 'playlist'].map((type) => {
                    const suggestionsOfType = themedSuggestions.filter(s => s.suggestionType === type);
                    if (suggestionsOfType.length === 0) return null;
                    
                    const typeLabels: Record<string, { label: string; Icon: LucideIcon }> = {
                      produto: { label: 'Produtos', Icon: ShoppingBag },
                      ambiente: { label: 'Ambiente', Icon: Home },
                      atividade: { label: 'Atividades', Icon: Sparkles },
                      playlist: { label: 'Playlists', Icon: Music },
                    };
                    
                    const { label, Icon } = typeLabels[type] || { label: type, Icon: Lightbulb };
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{label}</span>
                        </div>
                        <div className="grid gap-2 pl-6">
                          {suggestionsOfType.map((suggestion) => (
                            <div 
                              key={suggestion.id} 
                              className="p-3 rounded-md bg-muted/50 hover-elevate"
                              data-testid={`suggestion-${suggestion.id}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{suggestion.title}</p>
                                  {suggestion.content && (
                                    <p className="text-sm text-muted-foreground mt-1">{suggestion.content}</p>
                                  )}
                                  {suggestion.tags && suggestion.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {suggestion.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {suggestion.mediaUrl && (
                                  <a 
                                    href={suggestion.mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <Button size="icon" variant="ghost">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Collective Gift Section */}
            {event.eventType === "collective_gift" && (() => {
              const giftData = event.typeSpecificData as CollectiveGiftData | null;
              const targetAmount = giftData?.targetAmount || 0;
              const targetAmountFormatted = (targetAmount / 100).toFixed(2);
              const totalPaid = contributionsSummary?.totalPaid || 0;
              const totalPaidFormatted = (totalPaid / 100).toFixed(2);
              const progress = contributionsSummary?.progress || 0;
              
              return (
                <>
                  {/* Gift Details Card */}
                  <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Detalhes do Presente
                      </CardTitle>
                      {giftData?.recipientName && (
                        <CardDescription>
                          Presente para: <span className="font-semibold text-foreground">{giftData.recipientName}</span>
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Arrecadado</span>
                          <span className="font-semibold">
                            R$ {totalPaidFormatted} / R$ {targetAmountFormatted}
                          </span>
                        </div>
                        <Progress value={progress} className="h-3" data-testid="progress-contributions" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress}% do objetivo</span>
                          <span>
                            {contributionsSummary?.paidCount || 0} de {contributionsSummary?.participantsCount || 0} pagaram
                          </span>
                        </div>
                      </div>
                      
                      {/* Gift Info */}
                      {giftData?.giftName && (
                        <div className="flex items-start gap-3 pt-2 border-t">
                          <Gift className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Presente</p>
                            <p className="text-lg font-semibold" data-testid="text-gift-name">
                              {giftData.giftName}
                            </p>
                            {giftData.giftDescription && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {giftData.giftDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {giftData?.purchaseLink && (
                        <div className="pt-2">
                          <a 
                            href={giftData.purchaseLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              Ver produto na loja
                            </Button>
                          </a>
                        </div>
                      )}
                      
                      {/* Initialize Button (owner only) */}
                      {isOwner && participants && participants.length > 0 && (!contributions || contributions.length === 0) && (
                        <div className="pt-4 border-t">
                          <Button
                            onClick={() => initializeContributionsMutation.mutate()}
                            disabled={initializeContributionsMutation.isPending}
                            className="w-full"
                            data-testid="button-initialize-contributions"
                          >
                            {initializeContributionsMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <DollarSign className="w-4 h-4 mr-2" />
                            )}
                            Dividir valor entre participantes
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            O valor será dividido igualmente entre {participants.length} participante(s)
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Contributions List */}
                  {contributions && contributions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Contribuições
                        </CardTitle>
                        <CardDescription>
                          Status de pagamento de cada participante
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {contributions.map((contribution) => {
                            const participant = contribution.participant;
                            const name = participant?.name || participant?.email || "Participante";
                            const initials = name.substring(0, 2).toUpperCase();
                            const amountDue = (contribution.amountDue / 100).toFixed(2);
                            const amountPaid = (contribution.amountPaid / 100).toFixed(2);
                            
                            return (
                              <div 
                                key={contribution.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  contribution.isPaid 
                                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
                                    : "bg-muted/50"
                                }`}
                                data-testid={`contribution-${contribution.id}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      R$ {amountDue}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {contribution.isPaid ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                      <Check className="w-3 h-3 mr-1" />
                                      Pago
                                    </Badge>
                                  ) : (
                                    <>
                                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pendente
                                      </Badge>
                                      {isOwner && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => updateContributionMutation.mutate({
                                            contributionId: contribution.id,
                                            updates: { isPaid: true }
                                          })}
                                          disabled={updateContributionMutation.isPending}
                                          data-testid={`button-mark-paid-${contribution.id}`}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}

            {event.eventType === "secret_santa" && (() => {
              const rules = event.typeSpecificData as SecretSantaRules | null;
              const hasRules = rules && (rules.minGiftValue || rules.maxGiftValue || rules.rulesDescription);
              
              if (!hasRules && !isOwner) return null;
              
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Regras do Amigo Secreto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(rules?.minGiftValue || rules?.maxGiftValue) && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Faixa de Valor do Presente</p>
                          <p className="text-lg font-semibold text-primary" data-testid="text-gift-value-range">
                            {rules?.minGiftValue && rules?.maxGiftValue ? (
                              <>R$ {rules.minGiftValue} - R$ {rules.maxGiftValue}</>
                            ) : rules?.minGiftValue ? (
                              <>A partir de R$ {rules.minGiftValue}</>
                            ) : (
                              <>Até R$ {rules?.maxGiftValue}</>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {rules?.rulesDescription && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Regras</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-rules-description">
                            {rules.rulesDescription}
                          </p>
                        </div>
                      </div>
                    )}
                    {!hasRules && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma regra definida ainda. {isOwner && "Vá em Configurações para definir as regras."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {event.eventType === "secret_santa" && isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Status do Sorteio</CardTitle>
                <CardDescription>
                  Realize o sorteio quando todos os participantes confirmarem presença
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drawStatusLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drawStatus && drawStatus.isDrawPerformed ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-500">
                              Sorteio realizado!
                            </p>
                            {drawStatus.isOwner && drawStatus.pairsCount && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {drawStatus.pairsCount} pares criados
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              Concluído
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Display pairs for owner */}
                        {allPairsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : allPairs && allPairs.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm font-medium">Pares do Sorteio:</p>
                            <div className="space-y-2">
                              {allPairs.map((pair) => (
                                <div 
                                  key={pair.id} 
                                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                  data-testid={`pair-${pair.id}`}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(pair.giver?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {pair.giver?.name || "Participante"}
                                    </p>
                                  </div>
                                  <Gift className="w-4 h-4 text-primary" />
                                  <div className="flex-1 text-right">
                                    <p className="text-sm font-medium">
                                      {pair.receiver?.name || "Participante"}
                                    </p>
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(pair.receiver?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Redraw button */}
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setConfirmRedrawOpen(true)}
                            className="w-full"
                            data-testid="button-redraw-secret-santa"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Realizar Novo Sorteio
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {drawStatus?.isOwner ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Sorteio ainda não realizado
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {drawStatus?.confirmedParticipantsCount || 0} participante(s) confirmado(s)
                                {(drawStatus?.confirmedParticipantsCount || 0) < 3 && 
                                  " (mínimo: 3)"}
                              </p>
                            </div>
                            <Button 
                              variant="default" 
                              onClick={() => setConfirmDrawOpen(true)}
                              disabled={(drawStatus?.confirmedParticipantsCount || 0) < 3}
                              data-testid="button-draw-secret-santa"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Realizar Sorteio
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Aguardando o organizador realizar o sorteio
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participant view: show their assigned pair */}
          {event.eventType === "secret_santa" && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Seu Amigo Secreto
                </CardTitle>
                <CardDescription>
                  Descubra quem você tirou no sorteio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myPairLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : myPair && myPair.receiver ? (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-primary/5">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {getInitials(myPair.receiver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold" data-testid="text-my-pair-name">
                          {myPair.receiver.name || "Participante"}
                        </p>
                        {myPair.receiver.email && (
                          <p className="text-sm text-muted-foreground" data-testid="text-my-pair-email">
                            {myPair.receiver.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Receiver's Wishlist */}
                    {receiverWishlistLoading ? (
                      <div className="flex items-center justify-center py-4 mt-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : receiverWishlist && receiverWishlist.length > 0 ? (
                      <div className="mt-4 pt-4 border-t" data-testid="receiver-wishlist-section">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          O que seu amigo quer ganhar
                        </p>
                        <div className="space-y-2">
                          {receiverWishlist.map((item) => (
                            <div key={item.id} className="p-3 rounded-lg border bg-background" data-testid={`receiver-wishlist-item-${item.id}`}>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="font-medium">{item.title}</p>
                                {item.priority === 1 && (
                                  <Badge variant="outline" className="text-xs">Muito desejado</Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {item.price && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    R$ {item.price}
                                  </span>
                                )}
                                {item.purchaseUrl && (
                                  <a
                                    href={item.purchaseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                    data-testid={`link-receiver-wishlist-${item.id}`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Ver produto
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Seu amigo ainda não adicionou itens à lista de desejos
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-sm text-muted-foreground">
                      O sorteio ainda não foi realizado. Aguarde o organizador.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participant view: My Wishlist */}
          {event.eventType === "secret_santa" && !isOwner && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Minha Lista de Desejos
                    </CardTitle>
                    <CardDescription>
                      Compartilhe seus desejos com quem te tirou ({myWishlist?.length || 0}/10 itens)
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWishlistDialogOpen(true)}
                    disabled={(myWishlist?.length || 0) >= 10}
                    data-testid="button-add-wishlist-item"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {wishlistLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : myWishlist && myWishlist.length > 0 ? (
                  <div className="space-y-3">
                    {myWishlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        data-testid={`wishlist-item-${item.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium" data-testid={`text-wishlist-title-${item.id}`}>
                              {item.title}
                            </p>
                            {item.priority && (
                              <Badge variant="outline" className="text-xs">
                                {item.priority === 1 ? "Muito desejado" : item.priority === 2 ? "Desejado" : "Opcional"}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1" data-testid={`text-wishlist-desc-${item.id}`}>
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {item.price && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                R$ {item.price}
                              </span>
                            )}
                            {item.purchaseUrl && (
                              <a
                                href={item.purchaseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                data-testid={`link-wishlist-url-${item.id}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ver produto
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWishlistItemMutation.mutate(item.id)}
                          disabled={removeWishlistItemMutation.isPending}
                          data-testid={`button-remove-wishlist-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Sua lista de desejos está vazia.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adicione itens que você gostaria de ganhar!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Participantes</CardTitle>
                  <CardDescription>
                    Gerencie os participantes do seu rolê
                  </CardDescription>
                </div>
                {isOwner && (
                  event?.eventType === "secret_santa" && drawStatus?.isDrawPerformed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            data-testid="button-invite-participants"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Convidar
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Realize um novo sorteio para adicionar participantes</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddParticipantOpen(true)}
                      data-testid="button-invite-participants"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convidar
                    </Button>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent>
              {participantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : participantsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-2">
                    {participantsError instanceof Error
                      ? participantsError.message
                      : "Erro ao carregar participantes"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/collab-events", id, "participants"] })}
                    data-testid="button-retry-participants"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : participants && participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                      data-testid={`participant-${participant.id}`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium" data-testid={`text-participant-name-${participant.id}`}>
                            {participant.name || participant.email}
                          </p>
                          {/* Profile status icon */}
                          {participant.hasFilledProfile ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSelectedParticipantForProfile(participant)}
                                  className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                                  data-testid={`button-view-profile-${participant.id}`}
                                >
                                  <ClipboardCheck className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver preferências</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground">
                                  <FileText className="w-4 h-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Perfil não preenchido</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Wishlist status icon (only for secret_santa) */}
                          {event.eventType === "secret_santa" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={participant.wishlistItemsCount > 0 ? "text-rose-500" : "text-muted-foreground"}>
                                  <Heart className={`w-4 h-4 ${participant.wishlistItemsCount > 0 ? "fill-current" : ""}`} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {participant.wishlistItemsCount > 0
                                    ? `${participant.wishlistItemsCount} ${participant.wishlistItemsCount === 1 ? "item" : "itens"} na lista de desejos`
                                    : "Lista de desejos vazia"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {participant.name && participant.email && (
                            <span className="text-sm text-muted-foreground truncate" data-testid={`text-participant-email-${participant.id}`}>
                              ({participant.email})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline">
                            {participant.role === "owner" ? "Organizador" : "Participante"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              participant.status === "accepted"
                                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                                : participant.status === "pending"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                            }
                            data-testid={`badge-participant-status-${participant.id}`}
                          >
                            {participant.status === "accepted"
                              ? "Confirmado"
                              : participant.status === "pending"
                              ? "Pendente"
                              : "Recusado"}
                          </Badge>
                          {/* Email status indicator */}
                          {participant.email && participant.role !== "owner" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span 
                                  className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                                    participant.emailStatus === 'sent' 
                                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                                      : participant.emailStatus === 'failed' 
                                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' 
                                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                                  }`}
                                  data-testid={`badge-email-status-${participant.id}`}
                                >
                                  <Mail className="w-3 h-3" />
                                  {participant.emailStatus === 'sent' ? 'Enviado' : participant.emailStatus === 'failed' ? 'Falhou' : 'Pendente'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {participant.emailStatus === 'sent' 
                                    ? 'Email de convite enviado com sucesso' 
                                    : participant.emailStatus === 'failed' 
                                    ? 'Falha ao enviar email de convite' 
                                    : 'Email de convite ainda não enviado'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      {isOwner ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-participant-menu-${participant.id}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateParticipantStatusMutation.mutate({
                                participantId: participant.id,
                                status: "accepted"
                              })}
                              disabled={updateParticipantStatusMutation.isPending || participant.status === "accepted"}
                              data-testid={`menu-item-accept-${participant.id}`}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateParticipantStatusMutation.mutate({
                                participantId: participant.id,
                                status: "pending"
                              })}
                              disabled={updateParticipantStatusMutation.isPending || participant.status === "pending"}
                              data-testid={`menu-item-pending-${participant.id}`}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Marcar Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateParticipantStatusMutation.mutate({
                                participantId: participant.id,
                                status: "declined"
                              })}
                              disabled={updateParticipantStatusMutation.isPending || participant.status === "declined"}
                              data-testid={`menu-item-decline-${participant.id}`}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Recusar
                            </DropdownMenuItem>
                            {participant.email && (
                              <DropdownMenuItem
                                onClick={() => resendInviteMutation.mutate(participant.id)}
                                disabled={resendInviteMutation.isPending}
                                data-testid={`menu-item-resend-invite-${participant.id}`}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Reenviar convite
                              </DropdownMenuItem>
                            )}
                            {participant.role !== "owner" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setParticipantToRemove(participant.id)}
                                  className="text-destructive focus:text-destructive"
                                  data-testid={`menu-item-remove-${participant.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remover
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        user?.email && participant.email === user.email && participant.status === "pending" && (
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateParticipantStatusMutation.mutate({
                                    participantId: participant.id,
                                    status: "accepted"
                                  })}
                                  disabled={updateParticipantStatusMutation.isPending}
                                  data-testid={`button-accept-own-${participant.id}`}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Aceitar convite</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateParticipantStatusMutation.mutate({
                                    participantId: participant.id,
                                    status: "declined"
                                  })}
                                  disabled={updateParticipantStatusMutation.isPending}
                                  data-testid={`button-decline-own-${participant.id}`}
                                >
                                  <X className="w-4 h-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Recusar convite</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum participante ainda</p>
                  {isOwner && (
                    event?.eventType === "secret_santa" && drawStatus?.isDrawPerformed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="outline"
                              className="mt-4"
                              disabled
                              data-testid="button-add-first-participant"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Adicionar Primeiro Participante
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Realize um novo sorteio para adicionar participantes</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setAddParticipantOpen(true)}
                        data-testid="button-add-first-participant"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Participante
                      </Button>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {event?.eventType === "secret_santa" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Regras do Amigo Secreto
                </CardTitle>
                <CardDescription>
                  Defina o valor do presente e outras regras para os participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minGiftValue" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Valor Mínimo (R$)
                    </Label>
                    <Input
                      id="minGiftValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 50,00"
                      value={minGiftValue}
                      onChange={(e) => setMinGiftValue(e.target.value)}
                      data-testid="input-min-gift-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGiftValue" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Valor Máximo (R$)
                    </Label>
                    <Input
                      id="maxGiftValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 100,00"
                      value={maxGiftValue}
                      onChange={(e) => setMaxGiftValue(e.target.value)}
                      data-testid="input-max-gift-value"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rulesDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Descrição das Regras
                  </Label>
                  <Textarea
                    id="rulesDescription"
                    placeholder="Descreva as regras do seu Amigo Secreto... Ex: 'Não vale presente repetido, vale presente caseiro, etc.'"
                    rows={4}
                    value={rulesDescription}
                    onChange={(e) => setRulesDescription(e.target.value)}
                    data-testid="textarea-rules-description"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveRules}
                    disabled={saveRulesMutation.isPending}
                    data-testid="button-save-rules"
                  >
                    {saveRulesMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Regras
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secret Santa Restrictions */}
          {event?.eventType === "secret_santa" && isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="w-5 h-5" />
                  Pares Proibidos
                </CardTitle>
                <CardDescription>
                  Defina quem não pode tirar quem no sorteio (ex: casais, familiares)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new restriction */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Participante
                      </Label>
                      <Select
                        value={selectedBlockerId}
                        onValueChange={setSelectedBlockerId}
                      >
                        <SelectTrigger data-testid="select-blocker-participant">
                          <SelectValue placeholder="Selecione quem..." />
                        </SelectTrigger>
                        <SelectContent>
                          {participants?.filter(p => p.status === "accepted").map((participant) => (
                            <SelectItem 
                              key={participant.id} 
                              value={participant.id}
                              disabled={participant.id === selectedBlockedId}
                            >
                              {participant.name || participant.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-muted-foreground" />
                        Não pode tirar
                      </Label>
                      <Select
                        value={selectedBlockedId}
                        onValueChange={setSelectedBlockedId}
                      >
                        <SelectTrigger data-testid="select-blocked-participant">
                          <SelectValue placeholder="Selecione quem não pode tirar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {participants?.filter(p => p.status === "accepted").map((participant) => (
                            <SelectItem 
                              key={participant.id} 
                              value={participant.id}
                              disabled={participant.id === selectedBlockerId}
                            >
                              {participant.name || participant.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (selectedBlockerId && selectedBlockedId) {
                        createRestrictionMutation.mutate({
                          blockerParticipantId: selectedBlockerId,
                          blockedParticipantId: selectedBlockedId,
                        });
                      }
                    }}
                    disabled={!selectedBlockerId || !selectedBlockedId || createRestrictionMutation.isPending}
                    data-testid="button-add-restriction"
                  >
                    {createRestrictionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Adicionar Restrição
                  </Button>
                </div>

                {/* List existing restrictions */}
                {restrictionsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : restrictions && restrictions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Restrições ativas:</p>
                    <div className="space-y-2">
                      {restrictions.map((restriction) => (
                        <div 
                          key={restriction.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          data-testid={`restriction-${restriction.id}`}
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{restriction.blockerName}</span>
                            <Ban className="w-4 h-4 text-destructive" />
                            <span className="font-medium">{restriction.blockedName}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRestrictionMutation.mutate(restriction.id)}
                            disabled={deleteRestrictionMutation.isPending}
                            data-testid={`button-delete-restriction-${restriction.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma restrição definida. O sorteio será completamente aleatório.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Ajuste as configurações do seu rolê
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Outras configurações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddParticipantDialog
        eventId={id!}
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
      />

      <AlertDialog open={confirmDrawOpen} onOpenChange={setConfirmDrawOpen}>
        <AlertDialogContent data-testid="dialog-confirm-draw">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Sorteio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja realizar o sorteio do Amigo Secreto? Todos os participantes confirmados serão incluídos.
              <br /><br />
              <strong>Participantes confirmados:</strong> {drawStatus?.confirmedParticipantsCount || 0}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-draw">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => performDrawMutation.mutate()}
              disabled={performDrawMutation.isPending}
              data-testid="button-confirm-draw"
            >
              {performDrawMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Realizar Sorteio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRedrawOpen} onOpenChange={setConfirmRedrawOpen}>
        <AlertDialogContent data-testid="dialog-confirm-redraw">
          <AlertDialogHeader>
            <AlertDialogTitle>Realizar Novo Sorteio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja refazer o sorteio? Os pares atuais serão apagados e um novo sorteio será necessário.
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-redraw">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePairsMutation.mutate()}
              disabled={deletePairsMutation.isPending}
              data-testid="button-confirm-redraw"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePairsMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Apagar Pares
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={participantToRemove !== null}
        onOpenChange={(open) => !open && setParticipantToRemove(null)}
      >
        <AlertDialogContent data-testid="dialog-confirm-remove-participant">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Participante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este participante? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => participantToRemove && removeParticipantMutation.mutate(participantToRemove)}
              disabled={removeParticipantMutation.isPending}
              data-testid="button-confirm-remove"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeParticipantMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ParticipantPreferencesDialog
        open={selectedParticipantForProfile !== null}
        onOpenChange={(open) => !open && setSelectedParticipantForProfile(null)}
        participantName={selectedParticipantForProfile?.name || "Participante"}
        userProfile={selectedParticipantForProfile?.userProfile || null}
      />

      <AlertDialog
        open={rescheduleDialogOpen}
        onOpenChange={(open) => {
          setRescheduleDialogOpen(open);
          if (!open) setRescheduleDate("");
        }}
      >
        <AlertDialogContent data-testid="dialog-reschedule-role">
          <AlertDialogHeader>
            <AlertDialogTitle>Reagendar Rolê</AlertDialogTitle>
            <AlertDialogDescription>
              Escolha uma nova data para o rolê. O status será alterado para "Ativo" automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reschedule-date">Nova data</Label>
            <Input
              id="reschedule-date"
              type="datetime-local"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-2"
              data-testid="input-reschedule-date"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reschedule">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReschedule}
              disabled={rescheduleMutation.isPending || !rescheduleDate}
              data-testid="button-confirm-reschedule"
            >
              {rescheduleMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Reagendar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={wishlistDialogOpen}
        onOpenChange={(open) => {
          setWishlistDialogOpen(open);
          if (!open) {
            setWishlistTitle("");
            setWishlistDescription("");
            setWishlistUrl("");
            setWishlistPrice("");
            setWishlistPriority("3");
          }
        }}
      >
        <AlertDialogContent data-testid="dialog-add-wishlist-item">
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Item à Lista</AlertDialogTitle>
            <AlertDialogDescription>
              Adicione um item que você gostaria de ganhar. Quem te tirou no sorteio poderá ver sua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="wishlist-title">Nome do item *</Label>
              <Input
                id="wishlist-title"
                value={wishlistTitle}
                onChange={(e) => setWishlistTitle(e.target.value)}
                placeholder="Ex: Fone de ouvido Bluetooth"
                className="mt-1"
                data-testid="input-wishlist-title"
              />
            </div>
            <div>
              <Label htmlFor="wishlist-description">Descrição (opcional)</Label>
              <Textarea
                id="wishlist-description"
                value={wishlistDescription}
                onChange={(e) => setWishlistDescription(e.target.value)}
                placeholder="Detalhes sobre o item, cor preferida, modelo específico..."
                className="mt-1"
                data-testid="input-wishlist-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wishlist-price">Preço estimado</Label>
                <Input
                  id="wishlist-price"
                  value={wishlistPrice}
                  onChange={(e) => setWishlistPrice(e.target.value)}
                  placeholder="Ex: 150,00"
                  className="mt-1"
                  data-testid="input-wishlist-price"
                />
              </div>
              <div>
                <Label htmlFor="wishlist-priority">Prioridade</Label>
                <Select value={wishlistPriority} onValueChange={setWishlistPriority}>
                  <SelectTrigger className="mt-1" data-testid="select-wishlist-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Muito desejado</SelectItem>
                    <SelectItem value="2">Desejado</SelectItem>
                    <SelectItem value="3">Opcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="wishlist-url">Link do produto (opcional)</Label>
              <Input
                id="wishlist-url"
                value={wishlistUrl}
                onChange={(e) => setWishlistUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
                data-testid="input-wishlist-url"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-wishlist">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddWishlistItem}
              disabled={addWishlistItemMutation.isPending || !wishlistTitle.trim()}
              data-testid="button-confirm-wishlist"
            >
              {addWishlistItemMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
