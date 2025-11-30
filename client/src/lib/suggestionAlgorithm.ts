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

export interface SuggestionAlgorithmOptions {
  keywords?: string;
  category?: string;
  maxBudget?: number;
  minBudget?: number;
  recipientInterests?: string[];
  googleLimit?: number;
  enableGoogleSearch?: boolean;
}

interface SuggestionAlgorithmResult {
  products: UnifiedProduct[];
  internalCount: number;
  googleCount: number;
  version: string;
  appliedFilters: {
    keywords: string;
    category: string | null;
    budgetRange: { min: number; max: number } | null;
    googleFiltersApplied: string[];
    googleFiltersNotAvailable: string[];
  };
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

function buildGoogleSearchQuery(options: SuggestionAlgorithmOptions): string {
  const parts: string[] = [];
  
  if (options.keywords && options.keywords.trim()) {
    parts.push(options.keywords.trim());
  }
  
  if (options.category && options.category !== "all") {
    const categoryMap: Record<string, string> = {
      "Tecnologia": "tecnologia gadget",
      "Moda": "moda roupa acessório",
      "Casa & Decoração": "decoração casa",
      "Beleza": "beleza cosmético perfume",
      "Esportes": "esporte fitness",
      "Livros": "livro literatura",
      "Jogos": "jogo videogame",
      "Música": "música instrumento",
      "Arte": "arte quadro",
      "Viagem": "viagem turismo",
      "Gastronomia": "gastronomia gourmet",
      "Pet": "pet animal",
      "Bebê": "bebê infantil",
      "Bem-estar": "bem-estar spa relaxamento",
    };
    
    const categoryHint = categoryMap[options.category] || options.category;
    parts.push(categoryHint);
  }
  
  if (options.recipientInterests && options.recipientInterests.length > 0) {
    const relevantInterests = options.recipientInterests.slice(0, 2);
    parts.push(...relevantInterests);
  }
  
  if (parts.length === 0) {
    return "presentes";
  }
  
  return parts.join(" ");
}

async function fetchGoogleProducts(
  searchQuery: string, 
  options: SuggestionAlgorithmOptions
): Promise<{ products: SerpApiProduct[]; filtersApplied: string[]; filtersNotAvailable: string[] }> {
  const filtersApplied: string[] = [];
  const filtersNotAvailable: string[] = [];
  
  try {
    const requestBody: Record<string, any> = {
      keywords: searchQuery,
      limit: options.googleLimit || 10,
    };
    
    if (options.minBudget !== undefined || options.maxBudget !== undefined) {
      requestBody.minPrice = options.minBudget || 0;
      requestBody.maxPrice = options.maxBudget || 10000;
      filtersApplied.push("Orçamento (aproximado)");
    }
    
    if (options.category && options.category !== "all") {
      filtersNotAvailable.push("Categoria (incluída na busca)");
    }
    
    const response = await apiRequest("/api/serpapi/search", "POST", requestBody);
    const data: SerpApiResponse = await response.json();
    
    return {
      products: data.sucesso ? data.resultados : [],
      filtersApplied,
      filtersNotAvailable,
    };
  } catch (error) {
    console.error("Error fetching Google products:", error);
    return { products: [], filtersApplied, filtersNotAvailable };
  }
}

function matchesKeyword(text: string, keywords: string): boolean {
  if (!keywords || !keywords.trim()) return true;
  
  const searchTerms = keywords.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  if (searchTerms.length === 0) return true;
  
  const lowerText = text.toLowerCase();
  return searchTerms.some(term => lowerText.includes(term));
}

function filterInternalSuggestions(
  suggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions
): GiftSuggestion[] {
  return suggestions.filter((suggestion) => {
    const searchableText = `${suggestion.name} ${suggestion.description || ""} ${suggestion.category} ${(suggestion.tags || []).join(" ")}`;
    const matchesKeywords = matchesKeyword(searchableText, options.keywords || "");
    
    const matchesCategory = !options.category || options.category === "all" || suggestion.category === options.category;
    
    const priceValue = typeof suggestion.price === "string" 
      ? parseFloat(suggestion.price) 
      : suggestion.price;
    const matchesMaxBudget = !options.maxBudget || priceValue <= options.maxBudget;
    const matchesMinBudget = !options.minBudget || priceValue >= options.minBudget;
    
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
    
    return matchesKeywords && matchesCategory && matchesMaxBudget && matchesMinBudget && matchesInterests;
  });
}

function filterGoogleProducts(
  products: UnifiedProduct[],
  options: SuggestionAlgorithmOptions
): UnifiedProduct[] {
  return products.filter((product) => {
    const matchesMaxBudget = !options.maxBudget || product.price <= options.maxBudget;
    const matchesMinBudget = !options.minBudget || product.price >= options.minBudget;
    
    return matchesMaxBudget && matchesMinBudget;
  });
}

export async function runSuggestionAlgorithmV1(
  internalSuggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions = {}
): Promise<SuggestionAlgorithmResult> {
  const {
    keywords = "",
    googleLimit = 10,
    enableGoogleSearch = true,
  } = options;

  const filteredInternal = filterInternalSuggestions(internalSuggestions, options);
  const internalUnified = filteredInternal.map(convertInternalToUnified);
  
  let googleUnified: UnifiedProduct[] = [];
  let googleFiltersApplied: string[] = [];
  let googleFiltersNotAvailable: string[] = [];
  
  if (enableGoogleSearch && keywords.trim()) {
    const searchQuery = buildGoogleSearchQuery(options);
    const googleResult = await fetchGoogleProducts(searchQuery, { ...options, googleLimit });
    
    const rawGoogleUnified = googleResult.products.map((p, i) => convertGoogleToUnified(p, i));
    googleUnified = filterGoogleProducts(rawGoogleUnified, options);
    googleFiltersApplied = googleResult.filtersApplied;
    googleFiltersNotAvailable = googleResult.filtersNotAvailable;
  }
  
  const allProducts = [...internalUnified, ...googleUnified];

  return {
    products: allProducts,
    internalCount: internalUnified.length,
    googleCount: googleUnified.length,
    version: "1.1",
    appliedFilters: {
      keywords: keywords || "",
      category: options.category || null,
      budgetRange: options.maxBudget ? { min: options.minBudget || 0, max: options.maxBudget } : null,
      googleFiltersApplied,
      googleFiltersNotAvailable,
    },
  };
}

export type { SuggestionAlgorithmResult };
