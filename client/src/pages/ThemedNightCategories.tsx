import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Sparkles, Lightbulb, ShoppingBag, Home, Music, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { handleAuthError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ThemedNightCategory, User } from "@shared/schema";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  suggestions: z.string(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      suggestions: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        ...data,
        suggestions: data.suggestions.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      return await apiRequest("/api/admin/themed-night-categories", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themed-night-categories"] });
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-category">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-category">
        <DialogHeader>
          <DialogTitle>Nova Categoria de Noite Temática</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para sugestões de rolês temáticos
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Rolê</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Festa das Cores"
                      {...field}
                      data-testid="input-category-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o tipo de rolê..."
                      {...field}
                      data-testid="input-category-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sugestões de Itens</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite as sugestões separadas por vírgula (ex: Bebidas coloridas, Roupas vibrantes, Decoração neon)"
                      {...field}
                      data-testid="input-category-suggestions"
                    />
                  </FormControl>
                  <FormDescription>
                    Separe as sugestões com vírgulas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-create"
              >
                {createMutation.isPending ? "Criando..." : "Criar Categoria"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryDialog({ category }: { category: ThemedNightCategory }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      suggestions: category.suggestions.join(", "),
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        ...data,
        suggestions: data.suggestions.split(",").map((s: string) => s.trim()).filter(Boolean),
      };
      return await apiRequest(`/api/admin/themed-night-categories/${category.id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themed-night-categories"] });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message || "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-edit-category-${category.id}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-category">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Atualize as informações da categoria {category.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => editMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Rolê</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Festa das Cores"
                      {...field}
                      data-testid="input-edit-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o tipo de rolê..."
                      {...field}
                      data-testid="input-edit-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suggestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sugestões de Itens</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite as sugestões separadas por vírgula"
                      {...field}
                      data-testid="input-edit-suggestions"
                    />
                  </FormControl>
                  <FormDescription>
                    Separe as sugestões com vírgulas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editMutation.isPending}
                data-testid="button-submit-edit"
              >
                {editMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Type for themed night suggestion
interface ThemedNightSuggestion {
  id: string;
  categoryId: string;
  title: string;
  suggestionType: string;
  content: string | null;
  mediaUrl: string | null;
  priority: number | null;
  tags: string[] | null;
  isActive: boolean;
}

const suggestionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  suggestionType: z.string().min(1, "Tipo é obrigatório"),
  content: z.string().optional(),
  mediaUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

const suggestionTypeLabels: Record<string, { label: string; icon: typeof ShoppingBag }> = {
  produto: { label: "Produto", icon: ShoppingBag },
  ambiente: { label: "Ambiente", icon: Home },
  atividade: { label: "Atividade", icon: Sparkles },
  playlist: { label: "Playlist", icon: Music },
};

function ManageSuggestionsDialog({ category }: { category: ThemedNightCategory }) {
  const [open, setOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<ThemedNightSuggestion | null>(null);
  const { toast } = useToast();
  
  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      title: "",
      suggestionType: "produto",
      content: "",
      mediaUrl: "",
      tags: "",
    },
  });

  // Fetch suggestions for this category
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<ThemedNightSuggestion[]>({
    queryKey: ["/api/themed-night-categories", category.id, "suggestions"],
    queryFn: async () => {
      const response = await fetch(`/api/themed-night-categories/${category.id}/suggestions?includeInactive=true`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao carregar sugestões");
      return response.json();
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: SuggestionFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        content: data.content || null,
        mediaUrl: data.mediaUrl || null,
      };
      return await apiRequest(`/api/themed-night-categories/${category.id}/suggestions`, "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themed-night-categories", category.id, "suggestions"] });
      toast({
        title: "Sugestão criada",
        description: "A sugestão foi criada com sucesso.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar sugestão",
        description: error.message || "Não foi possível criar a sugestão.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SuggestionFormData }) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        content: data.content || null,
        mediaUrl: data.mediaUrl || null,
      };
      return await apiRequest(`/api/themed-night-suggestions/${id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themed-night-categories", category.id, "suggestions"] });
      toast({
        title: "Sugestão atualizada",
        description: "A sugestão foi atualizada com sucesso.",
      });
      setEditingSuggestion(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar sugestão",
        description: error.message || "Não foi possível atualizar a sugestão.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/themed-night-suggestions/${id}`, "DELETE", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/themed-night-categories", category.id, "suggestions"] });
      toast({
        title: "Sugestão excluída",
        description: "A sugestão foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir sugestão",
        description: error.message || "Não foi possível excluir a sugestão.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (suggestion: ThemedNightSuggestion) => {
    setEditingSuggestion(suggestion);
    form.reset({
      title: suggestion.title,
      suggestionType: suggestion.suggestionType,
      content: suggestion.content || "",
      mediaUrl: suggestion.mediaUrl || "",
      tags: suggestion.tags?.join(", ") || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingSuggestion(null);
    form.reset();
  };

  const handleSubmit = (data: SuggestionFormData) => {
    if (editingSuggestion) {
      updateMutation.mutate({ id: editingSuggestion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setEditingSuggestion(null);
        form.reset();
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-testid={`button-manage-suggestions-${category.id}`}
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto" data-testid="dialog-manage-suggestions">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Sugestões: {category.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie sugestões personalizadas para este tipo de rolê
          </DialogDescription>
        </DialogHeader>

        {/* Form for creating/editing suggestion */}
        <div className="border rounded-lg p-4 bg-muted/30 mb-4">
          <h4 className="font-medium mb-3">
            {editingSuggestion ? "Editar Sugestão" : "Nova Sugestão"}
          </h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Base líquida genérica"
                          {...field}
                          data-testid="input-suggestion-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suggestionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-suggestion-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="produto">Produto</SelectItem>
                          <SelectItem value="ambiente">Ambiente</SelectItem>
                          <SelectItem value="atividade">Atividade</SelectItem>
                          <SelectItem value="playlist">Playlist</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a sugestão..."
                        rows={2}
                        {...field}
                        data-testid="input-suggestion-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="mediaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          data-testid="input-suggestion-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tag1, tag2, tag3"
                          {...field}
                          data-testid="input-suggestion-tags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {editingSuggestion && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit-suggestion"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-suggestion"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {editingSuggestion ? "Salvar Alterações" : "Adicionar Sugestão"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* List of existing suggestions */}
        <div className="space-y-2">
          <h4 className="font-medium">Sugestões Cadastradas ({suggestions?.length || 0})</h4>
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma sugestão cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {suggestions?.map((suggestion) => {
                const typeInfo = suggestionTypeLabels[suggestion.suggestionType] || { label: suggestion.suggestionType, icon: Lightbulb };
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-md border bg-card ${!suggestion.isActive ? 'opacity-50' : ''}`}
                    data-testid={`suggestion-item-${suggestion.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-sm truncate">{suggestion.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {typeInfo.label}
                          </Badge>
                        </div>
                        {suggestion.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 ml-6">{suggestion.content}</p>
                        )}
                        {suggestion.tags && suggestion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 ml-6">
                            {suggestion.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {suggestion.mediaUrl && (
                          <a href={suggestion.mediaUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(suggestion)}
                          data-testid={`button-edit-suggestion-${suggestion.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Excluir esta sugestão?")) {
                              deleteMutation.mutate(suggestion.id);
                            }
                          }}
                          data-testid={`button-delete-suggestion-${suggestion.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ThemedNightCategories() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const hasAccess = user?.role === "admin" || user?.role === "manager";

  const { data: categories, isLoading } = useQuery<ThemedNightCategory[]>({
    queryKey: ["/api/admin/themed-night-categories"],
    enabled: hasAccess,
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
          setLocation("/admin");
        }
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/themed-night-categories/${id}`, "DELETE", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themed-night-categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message || "Não foi possível excluir a categoria.",
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

  if (!hasAccess) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-semibold text-3xl text-foreground mb-2" data-testid="page-title">
              Cadastro de Rolês
            </h1>
            <p className="text-muted-foreground">
              Gerencie as categorias e sugestões de Noite Temática
            </p>
          </div>
          <CreateCategoryDialog />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Categorias de Noite Temática
              </CardTitle>
              <CardDescription>
                {categories?.length || 0} categoria(s) cadastrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma categoria cadastrada ainda.</p>
                    <p className="text-sm mt-2">Clique em "Nova Categoria" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories?.map((category) => (
                      <Card key={category.id} className="hover-elevate" data-testid={`category-card-${category.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1" data-testid={`category-name-${category.id}`}>
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-muted-foreground mb-3" data-testid={`category-description-${category.id}`}>
                                  {category.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {category.suggestions.map((suggestion, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary"
                                    data-testid={`suggestion-${category.id}-${index}`}
                                  >
                                    {suggestion}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <ManageSuggestionsDialog category={category} />
                              <EditCategoryDialog category={category} />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja excluir "${category.name}"?`)) {
                                    deleteMutation.mutate(category.id);
                                  }
                                }}
                                data-testid={`button-delete-category-${category.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
