import { apiRequest } from "./queryClient";
import type { GiftSuggestion } from "@shared/schema";

export interface UnifiedProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  priceFormatted: string;
  productUrl: string;
  source: "internal" | "google";
  store?: string;
  category?: string;
  tags?: string[];
  cupom?: string | null;
  validadeCupom?: string | null;
}

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

interface SuggestionAlgorithmOptions {
  keywords?: string;
  category?: string;
  maxBudget?: number;
  recipientInterests?: string[];
  googleLimit?: number;
}

interface SuggestionAlgorithmResult {
  products: UnifiedProduct[];
  internalCount: number;
  googleCount: number;
  version: string;
}

function convertInternalToUnified(suggestion: GiftSuggestion): UnifiedProduct {
  const priceValue = typeof suggestion.price === "string" 
    ? parseFloat(suggestion.price) 
    : suggestion.price;
  
  return {
    id: `internal-${suggestion.id}`,
    name: suggestion.name,
    description: suggestion.description || "",
    imageUrl: suggestion.imageUrl,
    price: priceValue,
    priceFormatted: `R$ ${priceValue.toFixed(2).replace(".", ",")}`,
    productUrl: suggestion.productUrl || "",
    source: "internal",
    category: suggestion.category,
    tags: suggestion.tags || [],
    cupom: suggestion.cupom,
    validadeCupom: suggestion.validadeCupom,
  };
}

function convertGoogleToUnified(product: SerpApiProduct, index: number): UnifiedProduct {
  const priceValue = product.precoNumerico || 0;
  
  return {
    id: `google-${index}`,
    name: product.nome,
    description: product.descricao || "",
    imageUrl: product.imagem,
    price: priceValue,
    priceFormatted: product.preco,
    productUrl: product.link,
    source: "google",
    store: product.loja,
  };
}

async function fetchGoogleProducts(keywords: string, limit: number = 5): Promise<SerpApiProduct[]> {
  try {
    const response = await apiRequest("/api/serpapi/search", "POST", {
      keywords,
      limit,
    });
    const data: SerpApiResponse = await response.json();
    return data.sucesso ? data.resultados : [];
  } catch (error) {
    console.error("Error fetching Google products:", error);
    return [];
  }
}

function filterInternalSuggestions(
  suggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions
): GiftSuggestion[] {
  return suggestions.filter((suggestion) => {
    const matchesCategory = !options.category || options.category === "all" || suggestion.category === options.category;
    
    const priceValue = typeof suggestion.price === "string" 
      ? parseFloat(suggestion.price) 
      : suggestion.price;
    const matchesBudget = !options.maxBudget || priceValue <= options.maxBudget;
    
    let matchesInterests = true;
    if (options.recipientInterests && options.recipientInterests.length > 0) {
      const suggestionTags = suggestion.tags || [];
      matchesInterests = options.recipientInterests.some(interest =>
        suggestionTags.some(tag =>
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        ) || suggestion.category.toLowerCase().includes(interest.toLowerCase())
      );
    }
    
    return matchesCategory && matchesBudget && matchesInterests;
  });
}

export async function runSuggestionAlgorithmV1(
  internalSuggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions = {}
): Promise<SuggestionAlgorithmResult> {
  const {
    keywords = "presentes",
    googleLimit = 5,
  } = options;

  const filteredInternal = filterInternalSuggestions(internalSuggestions, options);
  
  const googleProducts = await fetchGoogleProducts(keywords, googleLimit);
  
  const internalUnified = filteredInternal.map(convertInternalToUnified);
  const googleUnified = googleProducts.map((p, i) => convertGoogleToUnified(p, i));
  
  const allProducts = [...internalUnified, ...googleUnified];

  return {
    products: allProducts,
    internalCount: internalUnified.length,
    googleCount: googleUnified.length,
    version: "1.0",
  };
}

export type { SuggestionAlgorithmOptions, SuggestionAlgorithmResult };
