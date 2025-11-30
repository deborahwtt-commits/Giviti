import { apiRequest } from "./queryClient";
import type { GiftSuggestion, Recipient, RecipientProfile } from "@shared/schema";

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
  relevanceScore?: number;
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

export interface RecipientData {
  recipient: Recipient;
  profile?: RecipientProfile | null;
}

export interface SuggestionAlgorithmOptions {
  keywords?: string;
  category?: string;
  maxBudget?: number;
  minBudget?: number;
  recipientData?: RecipientData;
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
    recipientName: string | null;
    googleFiltersApplied: string[];
    googleFiltersNotAvailable: string[];
  };
  generatedQuery?: string;
}

function getAgeRange(age: number): string {
  if (age < 13) return "criança";
  if (age < 18) return "adolescente";
  if (age < 25) return "jovem adulto";
  if (age < 35) return "adulto 25-35 anos";
  if (age < 45) return "adulto 35-45 anos";
  if (age < 55) return "adulto 45-55 anos";
  if (age < 65) return "adulto 55-65 anos";
  return "idoso 65+ anos";
}

function getGenderTerm(gender: string | null | undefined): string {
  if (!gender) return "";
  const genderLower = gender.toLowerCase();
  if (genderLower === "masculino" || genderLower === "male" || genderLower === "m") return "masculino homem";
  if (genderLower === "feminino" || genderLower === "female" || genderLower === "f") return "feminino mulher";
  return "";
}

function getRelationshipTerm(relationship: string | null | undefined): string {
  if (!relationship) return "";
  const relationshipMap: Record<string, string> = {
    "Pai": "pai presente para pai",
    "Mãe": "mãe presente para mãe",
    "Irmão": "irmão presente para irmão",
    "Irmã": "irmã presente para irmã",
    "Filho": "filho presente para filho",
    "Filha": "filha presente para filha",
    "Avô": "avô presente para avô",
    "Avó": "avó presente para avó",
    "Tio": "tio",
    "Tia": "tia",
    "Primo": "primo",
    "Prima": "prima",
    "Namorado": "namorado presente romântico",
    "Namorada": "namorada presente romântico",
    "Esposo": "marido presente para marido",
    "Esposa": "esposa presente para esposa",
    "Amigo": "amigo",
    "Amiga": "amiga",
    "Colega": "colega de trabalho",
    "Chefe": "chefe profissional",
  };
  return relationshipMap[relationship] || relationship.toLowerCase();
}

function buildRecipientBasedQuery(recipientData: RecipientData, userKeywords?: string): string {
  const { recipient, profile } = recipientData;
  const parts: string[] = [];
  
  if (userKeywords && userKeywords.trim()) {
    parts.push(userKeywords.trim());
  }
  
  const relationship = profile?.relationship || recipient.relationship;
  if (relationship) {
    parts.push(getRelationshipTerm(relationship));
  }
  
  const gender = profile?.gender || recipient.gender;
  if (gender) {
    const genderTerm = getGenderTerm(gender);
    if (genderTerm) parts.push(genderTerm);
  }
  
  if (recipient.age) {
    parts.push(getAgeRange(recipient.age));
  }
  
  const interests = recipient.interests || [];
  if (interests.length > 0) {
    const topInterests = interests.slice(0, 3);
    parts.push(...topInterests);
  }
  
  if (profile?.cidade) {
    parts.push(profile.cidade);
  }
  
  if (profile?.interestCategory) {
    parts.push(profile.interestCategory);
  }
  
  if (parts.length === 0) {
    return "presentes";
  }
  
  const uniqueParts = Array.from(new Set(parts.filter(p => p && p.trim())));
  return uniqueParts.join(" ");
}

function convertInternalToUnified(suggestion: GiftSuggestion, relevanceScore?: number): UnifiedProduct {
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
    relevanceScore,
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
  if (options.recipientData) {
    return buildRecipientBasedQuery(options.recipientData, options.keywords);
  }
  
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
    
    if (options.recipientData) {
      filtersApplied.push("Perfil do presenteado");
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

function getGiftsToAvoidTerms(recipientData?: RecipientData): string[] {
  if (!recipientData?.profile?.giftsToAvoid) return [];
  return recipientData.profile.giftsToAvoid
    .toLowerCase()
    .split(/[,;]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

function shouldExcludeProduct(
  productName: string,
  productDescription: string,
  productCategory: string | undefined,
  productTags: string[] | undefined,
  avoidTerms: string[]
): boolean {
  if (avoidTerms.length === 0) return false;
  
  const searchableText = `${productName} ${productDescription} ${productCategory || ""} ${(productTags || []).join(" ")}`.toLowerCase();
  
  return avoidTerms.some(term => searchableText.includes(term));
}

function calculateRelevanceScore(
  suggestion: GiftSuggestion, 
  recipientData?: RecipientData
): number {
  if (!recipientData) return 0;
  
  let score = 0;
  const { recipient, profile } = recipientData;
  const suggestionTags = (suggestion.tags || []).map(t => t.toLowerCase());
  const suggestionCategory = suggestion.category.toLowerCase();
  
  const interests = recipient.interests || [];
  for (const interest of interests) {
    const interestLower = interest.toLowerCase();
    if (suggestionTags.some(tag => tag.includes(interestLower) || interestLower.includes(tag))) {
      score += 10;
    }
    if (suggestionCategory.includes(interestLower)) {
      score += 15;
    }
  }
  
  if (profile?.interestCategory) {
    const interestCat = profile.interestCategory.toLowerCase();
    if (suggestionCategory.includes(interestCat) || interestCat.includes(suggestionCategory)) {
      score += 20;
    }
  }
  
  if (profile?.giftPreference) {
    const prefLower = profile.giftPreference.toLowerCase();
    if (suggestionTags.some(tag => prefLower.includes(tag))) {
      score += 5;
    }
  }
  
  if (profile?.giftsToAvoid) {
    const avoidTerms = profile.giftsToAvoid.toLowerCase().split(/[,;]+/).map(t => t.trim());
    for (const term of avoidTerms) {
      if (term && (suggestionTags.some(tag => tag.includes(term)) || suggestionCategory.includes(term))) {
        score -= 50;
      }
    }
  }
  
  return score;
}

function filterInternalSuggestions(
  suggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions
): { suggestion: GiftSuggestion; score: number }[] {
  const results: { suggestion: GiftSuggestion; score: number }[] = [];
  const avoidTerms = getGiftsToAvoidTerms(options.recipientData);
  
  for (const suggestion of suggestions) {
    if (shouldExcludeProduct(
      suggestion.name,
      suggestion.description || "",
      suggestion.category,
      suggestion.tags,
      avoidTerms
    )) {
      continue;
    }
    
    const searchableText = `${suggestion.name} ${suggestion.description || ""} ${suggestion.category} ${(suggestion.tags || []).join(" ")}`;
    const matchesKeywords = matchesKeyword(searchableText, options.keywords || "");
    
    const matchesCategory = !options.category || options.category === "all" || suggestion.category === options.category;
    
    const priceValue = typeof suggestion.price === "string" 
      ? parseFloat(suggestion.price) 
      : suggestion.price;
    const matchesMaxBudget = !options.maxBudget || priceValue <= options.maxBudget;
    const matchesMinBudget = !options.minBudget || priceValue >= options.minBudget;
    
    let matchesInterests = true;
    const recipientInterests = options.recipientData?.recipient.interests || [];
    
    if (recipientInterests.length > 0 && options.recipientData) {
      const suggestionTags = suggestion.tags || [];
      matchesInterests = recipientInterests.some(interest =>
        suggestionTags.some(tag =>
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        ) || suggestion.category.toLowerCase().includes(interest.toLowerCase())
      );
    }
    
    if (matchesKeywords && matchesCategory && matchesMaxBudget && matchesMinBudget) {
      const relevanceScore = calculateRelevanceScore(suggestion, options.recipientData);
      const finalScore = matchesInterests ? relevanceScore + 10 : relevanceScore;
      results.push({ suggestion, score: finalScore });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

function filterGoogleProducts(
  products: UnifiedProduct[],
  options: SuggestionAlgorithmOptions
): UnifiedProduct[] {
  const avoidTerms = getGiftsToAvoidTerms(options.recipientData);
  
  return products.filter((product) => {
    if (shouldExcludeProduct(
      product.name,
      product.description,
      product.category,
      product.tags,
      avoidTerms
    )) {
      return false;
    }
    
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

  const filteredResults = filterInternalSuggestions(internalSuggestions, options);
  const internalUnified = filteredResults.map(({ suggestion, score }) => 
    convertInternalToUnified(suggestion, score)
  );
  
  let googleUnified: UnifiedProduct[] = [];
  let googleFiltersApplied: string[] = [];
  let googleFiltersNotAvailable: string[] = [];
  let generatedQuery = "";
  
  const shouldSearchGoogle = enableGoogleSearch && (
    keywords.trim() || 
    options.recipientData
  );
  
  if (shouldSearchGoogle) {
    generatedQuery = buildGoogleSearchQuery(options);
    const googleResult = await fetchGoogleProducts(generatedQuery, { ...options, googleLimit });
    
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
    version: "2.0",
    appliedFilters: {
      keywords: keywords || "",
      category: options.category || null,
      budgetRange: options.maxBudget ? { min: options.minBudget || 0, max: options.maxBudget } : null,
      recipientName: options.recipientData?.recipient.name || null,
      googleFiltersApplied,
      googleFiltersNotAvailable,
    },
    generatedQuery: generatedQuery || undefined,
  };
}

export type { SuggestionAlgorithmResult };
