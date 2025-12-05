import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Tag, Layers, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GiftCategory, GiftType, User } from "@shared/schema";

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  keywords: string[];
  isActive: boolean;
}

interface TypeFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function AdminGiftCategoriesTypes() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("categories");
  
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'type'; item: GiftCategory | GiftType } | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | null>(null);
  const [selectedType, setSelectedType] = useState<GiftType | null>(null);
  
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "#6B7280",
    icon: "tag",
    keywords: [],
    isActive: true,
  });
  
  const [keywordsInput, setKeywordsInput] = useState("");
  
  const [typeForm, setTypeForm] = useState<TypeFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const hasAdminAccess = user?.role === "admin" || user?.role === "manager";

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<GiftCategory[]>({
    queryKey: ["/api/admin/gift-categories"],
    enabled: hasAdminAccess,
  });

  const { data: types = [], isLoading: typesLoading, error: typesError } = useQuery<GiftType[]>({
    queryKey: ["/api/admin/gift-types"],
    enabled: hasAdminAccess,
  });

  if (categoriesError && !categoriesLoading) {
    const apiError = categoriesError as any;
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

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return apiRequest("/api/admin/gift-categories", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria de presentes foi criada com sucesso.",
      });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    },
    onError: () => {
      toast({
        title: "Erro ao criar",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      return apiRequest(`/api/admin/gift-categories/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-categories"] });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/gift-categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: async (data: TypeFormData) => {
      return apiRequest("/api/admin/gift-types", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-types"] });
      toast({
        title: "Tipo criado",
        description: "O tipo de presente foi criado com sucesso.",
      });
      setIsTypeDialogOpen(false);
      resetTypeForm();
    },
    onError: () => {
      toast({
        title: "Erro ao criar",
        description: "Não foi possível criar o tipo.",
        variant: "destructive",
      });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TypeFormData> }) => {
      return apiRequest(`/api/admin/gift-types/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-types"] });
      toast({
        title: "Tipo atualizado",
        description: "O tipo foi atualizado com sucesso.",
      });
      setIsTypeDialogOpen(false);
      resetTypeForm();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o tipo.",
        variant: "destructive",
      });
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/admin/gift-types/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift-types"] });
      toast({
        title: "Tipo excluído",
        description: "O tipo foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o tipo.",
        variant: "destructive",
      });
    },
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      color: "#6B7280",
      icon: "tag",
      keywords: [],
      isActive: true,
    });
    setKeywordsInput("");
    setSelectedCategory(null);
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: "",
      description: "",
      isActive: true,
    });
    setSelectedType(null);
  };

  const openAddCategoryDialog = () => {
    resetCategoryForm();
    setIsCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: GiftCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "#6B7280",
      icon: category.icon || "tag",
      keywords: category.keywords || [],
      isActive: category.isActive,
    });
    setKeywordsInput((category.keywords || []).join(", "));
    setIsCategoryDialogOpen(true);
  };

  const openAddTypeDialog = () => {
    resetTypeForm();
    setIsTypeDialogOpen(true);
  };

  const openEditTypeDialog = (type: GiftType) => {
    setSelectedType(type);
    setTypeForm({
      name: type.name,
      description: type.description || "",
      isActive: type.isActive,
    });
    setIsTypeDialogOpen(true);
  };

  const parseKeywords = (input: string): string[] => {
    return input
      .split(/[,;]+/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);
  };

  const handleCategorySubmit = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      ...categoryForm,
      keywords: parseKeywords(keywordsInput),
    };

    if (selectedCategory) {
      updateCategoryMutation.mutate({
        id: selectedCategory.id,
        data: formData,
      });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleTypeSubmit = () => {
    if (!typeForm.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do tipo é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (selectedType) {
      updateTypeMutation.mutate({
        id: selectedType.id,
        data: typeForm,
      });
    } else {
      createTypeMutation.mutate(typeForm);
    }
  };

  const handleDelete = (type: 'category' | 'type', item: GiftCategory | GiftType) => {
    setDeleteTarget({ type, item });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'category') {
      deleteCategoryMutation.mutate(deleteTarget.item.id);
    } else {
      deleteTypeMutation.mutate(deleteTarget.item.id);
    }
  };

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

  if (categoriesLoading || typesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back-admin">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Categorias e Tipos de Presentes
          </h1>
          <p className="text-muted-foreground">
            Gerencie categorias e tipos para organizar as sugestões de presentes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Tag className="h-4 w-4 mr-2" />
            Categorias ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="types" data-testid="tab-types">
            <Layers className="h-4 w-4 mr-2" />
            Tipos ({types.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Categorias são usadas para agrupar sugestões por interesse ou tema. 
              Uma sugestão pode ter múltiplas categorias.
            </p>
            <Button onClick={openAddCategoryDialog} data-testid="button-add-category">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="relative" data-testid={`card-category-${category.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {category.description || "Sem descrição"}
                  </p>
                  {category.keywords && category.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {category.keywords.slice(0, 5).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {category.keywords.length > 5 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          +{category.keywords.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditCategoryDialog(category)}
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('category', category)}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma categoria cadastrada</p>
                <Button variant="ghost" onClick={openAddCategoryDialog} className="text-primary">
                  Criar primeira categoria
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Tipos definem a natureza do presente (físico, digital, experiência, etc.). 
              Cada sugestão pode ter apenas um tipo.
            </p>
            <Button onClick={openAddTypeDialog} data-testid="button-add-type">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {types.map((type) => (
              <Card key={type.id} className="relative" data-testid={`card-type-${type.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {type.description || "Sem descrição"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditTypeDialog(type)}
                      data-testid={`button-edit-type-${type.id}`}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('type', type)}
                      data-testid={`button-delete-type-${type.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {types.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum tipo cadastrado</p>
                <Button variant="ghost" onClick={openAddTypeDialog} className="text-primary">
                  Criar primeiro tipo
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Tecnologia, Livros, Decoração"
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Descreva a categoria..."
                rows={3}
                data-testid="input-category-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-keywords">Palavras-chave</Label>
              <Textarea
                id="category-keywords"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="tecnologia, gadgets, eletrônicos, computador, celular (separados por vírgula)"
                rows={2}
                data-testid="input-category-keywords"
              />
              <p className="text-xs text-muted-foreground">
                Termos que serão usados para conectar interesses do presenteado com esta categoria. 
                Separe por vírgula ou ponto e vírgula.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-category-color"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  placeholder="#6B7280"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="category-active">Categoria ativa</Label>
              <Switch
                id="category-active"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                data-testid="switch-category-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              data-testid="button-cancel-category"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCategorySubmit}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {selectedCategory ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedType ? "Editar Tipo" : "Novo Tipo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Nome *</Label>
              <Input
                id="type-name"
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="Ex: Físico, Digital, Experiência"
                data-testid="input-type-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-description">Descrição</Label>
              <Textarea
                id="type-description"
                value={typeForm.description}
                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                placeholder="Descreva o tipo de presente..."
                rows={3}
                data-testid="input-type-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="type-active">Tipo ativo</Label>
              <Switch
                id="type-active"
                checked={typeForm.isActive}
                onCheckedChange={(checked) => setTypeForm({ ...typeForm, isActive: checked })}
                data-testid="switch-type-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTypeDialogOpen(false)}
              data-testid="button-cancel-type"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTypeSubmit}
              disabled={createTypeMutation.isPending || updateTypeMutation.isPending}
              data-testid="button-save-type"
            >
              {(createTypeMutation.isPending || updateTypeMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {selectedType ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {deleteTarget?.type === 'category' ? 'a categoria' : 'o tipo'} "
              {deleteTarget?.item.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
