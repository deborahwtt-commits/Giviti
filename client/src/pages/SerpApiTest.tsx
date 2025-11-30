import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2, ExternalLink, ShoppingBag, Store } from "lucide-react";

interface SerpApiProduct {
  nome: string;
  descricao: string;
  imagem: string;
  preco: string;
  precoNumerico: number | null;
  link: string;
  fonte: string;
  loja: string;
}

interface SerpApiResponse {
  sucesso: boolean;
  fonte: string;
  keywords: string;
  total: number;
  resultados: SerpApiProduct[];
}

export default function SerpApiTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<SerpApiProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (searchKeywords: string) => {
      const response = await apiRequest("/api/serpapi/search", "POST", {
        keywords: searchKeywords,
        limit: 5,
      });
      return response.json() as Promise<SerpApiResponse>;
    },
    onSuccess: (data) => {
      setResults(data.resultados);
      setHasSearched(true);
      if (data.resultados.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: `Não foram encontrados produtos para "${keywords}"`,
        });
      } else {
        toast({
          title: "Busca concluída",
          description: `Encontrados ${data.resultados.length} produtos`,
        });
      }
    },
    onError: (error: any) => {
      console.error("SerpApi search error:", error);
      setResults([]);
      setHasSearched(true);
      toast({
        title: "Erro na busca",
        description: error.message || "Não foi possível buscar produtos. Verifique a configuração da API.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (keywords.trim()) {
      setResults([]);
      setHasSearched(false);
      searchMutation.mutate(keywords);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin")}
          className="mb-6"
          data-testid="button-back-admin"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Admin
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teste SerpApi</h1>
          <p className="text-muted-foreground">
            Teste a integração com Google Shopping via SerpApi
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex gap-4">
            <Input
              placeholder="Digite palavras-chave para buscar presentes..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              data-testid="input-search-keywords"
            />
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending || !keywords.trim()}
              data-testid="button-search-serpapi"
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
        </Card>

        {searchMutation.isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Buscando produtos no Google...</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Resultados ({results.length} produtos)
              </h2>
              <Badge variant="secondary">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Google Shopping
              </Badge>
            </div>

            <div className="grid gap-4">
              {results.map((product, index) => (
                <Card 
                  key={index} 
                  className="p-4 hover-elevate"
                  data-testid={`card-product-${index}`}
                >
                  <div className="flex gap-4">
                    {product.imagem ? (
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                        {product.nome}
                      </h3>
                      
                      {product.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.descricao}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-primary">
                          {product.preco}
                        </span>
                        
                        {product.loja && (
                          <Badge variant="outline" className="text-xs">
                            <Store className="w-3 h-3 mr-1" />
                            {product.loja}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {product.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          data-testid={`button-view-product-${index}`}
                        >
                          <a href={product.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!searchMutation.isPending && hasSearched && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum produto encontrado para "{keywords}"
          </div>
        )}
      </div>
    </div>
  );
}
