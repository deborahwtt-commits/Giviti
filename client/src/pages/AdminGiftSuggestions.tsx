import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, Plus, Pencil, Trash2, Package, Tag, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatCurrencyInput, parseCurrencyToNumber } from "@/lib/utils";
import type { GiftSuggestion, GiftCategory, GiftType, User } from "@shared/schema";

export default function AdminGiftSuggestions() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GiftSuggestion | null>(null);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const hasAdminAccess = user?.role === "admin" || user?.role === "manager";

  const { data: suggestions, isLoading, error } = useQuery<GiftSuggestion[]>({
    queryKey: ["/api/admin/gift-suggestions"],
    enabled: hasAdminAccess,
  });

  // Handle errors after query completes
  if (error && !isLoading) {
    const apiError = error as any;
    if (apiError?.message?.includes('401')) {
      handleAuthError(toast, setLocation);
      return null;
    } else if (apiError?.message?.includes('403')) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      setLocation("/admin");
      return null;
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/gift-suggestions/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advanced-stats"] });
      toast({
        title: "Sugestão excluída",
        description: "A sugestão de presente foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedSuggestion(null);
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a sugestão.",
        variant: "destructive",
      });
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
    setLocation("/admin");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDelete = (suggestion: GiftSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (suggestion: GiftSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-semibold text-3xl text-foreground mb-2" data-testid="admin-suggestions-title">
              Gerenciar Sugestões de Presentes
            </h1>
            <p className="text-muted-foreground">
              {suggestions?.length || 0} sugestões cadastradas
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="button-add-suggestion"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Sugestão
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions?.map((suggestion) => (
            <Card key={suggestion.id} className="overflow-hidden" data-testid={`card-suggestion-${suggestion.id}`}>
              <img
                src={suggestion.imageUrl}
                alt={suggestion.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg" data-testid={`text-suggestion-name-${suggestion.id}`}>
                    {suggestion.name}
                  </h3>
                  {suggestion.priority && (
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      P{suggestion.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {suggestion.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{suggestion.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium">
                      {formatCurrency(suggestion.price)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestion.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {suggestion.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 text-muted-foreground">
                        +{suggestion.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(suggestion)}
                    className="flex-1"
                    data-testid={`button-edit-${suggestion.id}`}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(suggestion)}
                    data-testid={`button-delete-${suggestion.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {suggestions?.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma sugestão cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Comece adicionando a primeira sugestão de presente.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Sugestão
              </Button>
            </div>
          </Card>
        )}

        <SuggestionFormDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          mode="create"
        />

        <SuggestionFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          suggestion={selectedSuggestion}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a sugestão "{selectedSuggestion?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedSuggestion && deleteMutation.mutate(selectedSuggestion.id)}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

interface SuggestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  suggestion?: GiftSuggestion | null;
}

function SuggestionFormDialog({ open, onOpenChange, mode, suggestion }: SuggestionFormDialogProps) {
  const { toast } = useToast();
  const normalizeGiftTypeId = (id: string | null | undefined): string => {
    return id && id !== "" ? id : "__none__";
  };

  const formatPriceForDisplay = (price: string | number | null | undefined): string => {
    if (!price) return "";
    const numValue = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numValue)) return "";
    return formatCurrencyInput((numValue * 100).toFixed(0));
  };

  const [formData, setFormData] = useState({
    name: suggestion?.name || "",
    description: suggestion?.description || "",
    imageUrl: suggestion?.imageUrl || "",
    category: suggestion?.category || "",
    price: formatPriceForDisplay(suggestion?.price),
    tags: suggestion?.tags.join(", ") || "",
    priority: suggestion?.priority?.toString() || "null",
    giftTypeId: normalizeGiftTypeId(suggestion?.giftTypeId),
    selectedCategoryIds: [] as string[],
  });

  const { data: giftCategories = [] } = useQuery<GiftCategory[]>({
    queryKey: ["/api/gift-categories"],
    enabled: open,
  });

  const { data: giftTypes = [] } = useQuery<GiftType[]>({
    queryKey: ["/api/gift-types"],
    enabled: open,
  });

  useEffect(() => {
    if (suggestion) {
      setFormData({
        name: suggestion.name || "",
        description: suggestion.description || "",
        imageUrl: suggestion.imageUrl || "",
        category: suggestion.category || "",
        price: formatPriceForDisplay(suggestion.price),
        tags: suggestion.tags.join(", ") || "",
        priority: suggestion.priority?.toString() || "null",
        giftTypeId: normalizeGiftTypeId(suggestion.giftTypeId),
        selectedCategoryIds: [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        category: "",
        price: "",
        tags: "",
        priority: "null",
        giftTypeId: "__none__",
        selectedCategoryIds: [],
      });
    }
  }, [suggestion, open]);

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(categoryId)
        ? prev.selectedCategoryIds.filter(id => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId]
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const priceValue = parseCurrencyToNumber(data.price);
      const payload = {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        price: priceValue.toFixed(2),
        tags: data.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        priority: data.priority === "null" ? null : parseInt(data.priority),
        giftTypeId: data.giftTypeId === "__none__" ? null : data.giftTypeId,
      };

      if (mode === "create") {
        return await apiRequest("/api/admin/gift-suggestions", "POST", payload);
      } else {
        return await apiRequest(`/api/admin/gift-suggestions/${suggestion?.id}`, "PATCH", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advanced-stats"] });
      toast({
        title: mode === "create" ? "Sugestão criada" : "Sugestão atualizada",
        description: `A sugestão foi ${mode === "create" ? "criada" : "atualizada"} com sucesso.`,
      });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        category: "",
        price: "",
        tags: "",
        priority: "null",
        giftTypeId: "__none__",
        selectedCategoryIds: [],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a sugestão.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-suggestion">
            {mode === "create" ? "Adicionar Nova Sugestão" : "Editar Sugestão"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-suggestion-name"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              data-testid="input-suggestion-description"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">URL da Imagem *</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              required
              placeholder="https://images.unsplash.com/..."
              data-testid="input-suggestion-imageurl"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria Principal *</Label>
            <Select
              value={formData.category || "__none__"}
              onValueChange={(value) => {
                const newCategory = value === "__none__" ? "" : value;
                const selectedCategory = giftCategories.find(c => c.name === newCategory);
                setFormData(prev => ({
                  ...prev,
                  category: newCategory,
                  selectedCategoryIds: selectedCategory 
                    ? prev.selectedCategoryIds.filter(id => id !== selectedCategory.id)
                    : prev.selectedCategoryIds
                }));
              }}
            >
              <SelectTrigger data-testid="select-suggestion-category">
                <SelectValue placeholder="Selecione uma categoria">
                  {formData.category ? giftCategories.find(c => c.name === formData.category)?.name || formData.category : "Selecione uma categoria"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione uma categoria</SelectItem>
                {giftCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <Tag className="h-4 w-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="giftType">Tipo de Presente</Label>
            <Select
              value={formData.giftTypeId}
              onValueChange={(value) => setFormData({ ...formData, giftTypeId: value })}
            >
              <SelectTrigger data-testid="select-suggestion-gift-type">
                <SelectValue placeholder="Selecione um tipo (opcional)">
                  {formData.giftTypeId !== "__none__" ? giftTypes.find(t => t.id === formData.giftTypeId)?.name : "Nenhum"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {giftTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Cada sugestão pode ter apenas um tipo (físico, digital, experiência, etc.)
            </p>
          </div>

          {giftCategories.length > 0 && (
            <div>
              <Label>Categorias Adicionais</Label>
              <div className="mt-2 p-3 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {giftCategories.map((category) => {
                    const isPrimaryCategory = formData.category === category.name;
                    return (
                      <div key={category.id} className={`flex items-center gap-2 ${isPrimaryCategory ? 'opacity-50' : ''}`}>
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={formData.selectedCategoryIds.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                          disabled={isPrimaryCategory}
                          data-testid={`checkbox-category-${category.id}`}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className={`text-sm flex items-center gap-1 ${isPrimaryCategory ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {category.color && (
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category.name}
                          {isPrimaryCategory && <span className="text-xs text-muted-foreground ml-1">(principal)</span>}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              {formData.selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedCategoryIds.map((id) => {
                    const cat = giftCategories.find(c => c.id === id);
                    return cat ? (
                      <Badge 
                        key={id} 
                        variant="secondary"
                        style={{ 
                          backgroundColor: cat.color ? `${cat.color}20` : undefined,
                          borderColor: cat.color || undefined
                        }}
                      >
                        {cat.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Uma sugestão pode ter múltiplas categorias para melhor organização
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="price">Preço *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  setFormData({ ...formData, price: formatted });
                }}
                required
                placeholder="0,00"
                className="pl-10"
                data-testid="input-suggestion-price"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (separadas por vírgula) *</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              required
              placeholder="Ex: tecnologia, portátil, música"
              data-testid="input-suggestion-tags"
            />
          </div>

          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger data-testid="select-suggestion-priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Sem prioridade</SelectItem>
                <SelectItem value="1">Alta (1)</SelectItem>
                <SelectItem value="2">Média (2)</SelectItem>
                <SelectItem value="3">Baixa (3)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-form"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-submit-suggestion"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                mode === "create" ? "Criar Sugestão" : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
