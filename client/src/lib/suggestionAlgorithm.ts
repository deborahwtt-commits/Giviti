import { apiRequest } from "./queryClient";
import type { GiftSuggestion, Recipient, RecipientProfile, GiftCategory, GoogleProductCategory } from "@shared/schema";
import { searchCache } from "./searchCache";

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
  googleCategoryId?: number;
  maxBudget?: number;
  minBudget?: number;
  recipientData?: RecipientData;
  googleLimit?: number;
  enableGoogleSearch?: boolean;
  giftCategories?: GiftCategory[];
  googleCategories?: GoogleProductCategory[];
  page?: number;
  pageSize?: number;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
  maxResults: number;
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
  googleFromCache?: boolean;
  pagination: PaginationMeta;
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

function normalizeGender(gender: string | null | undefined): string | null {
  if (!gender) return null;
  const genderLower = gender.toLowerCase().trim();
  if (genderLower === "masculino" || genderLower === "male" || genderLower === "m") return "masculino";
  if (genderLower === "feminino" || genderLower === "female" || genderLower === "f") return "feminino";
  if (genderLower === "unissex" || genderLower === "outro" || genderLower === "other") return null;
  return null;
}

function getAgeCategory(age: number | null | undefined): string | null {
  if (age === null || age === undefined || age <= 0) return null;
  if (age < 13) return "crianca";
  if (age < 18) return "adolescente";
  if (age < 60) return "adulto";
  return "idoso";
}

function matchesTargetGender(productTargetGender: string | null | undefined, recipientGender: string | null | undefined): boolean {
  if (!productTargetGender || productTargetGender.toLowerCase() === "unissex") return true;
  const normalizedRecipient = normalizeGender(recipientGender);
  if (normalizedRecipient === null) return true;
  return productTargetGender.toLowerCase() === normalizedRecipient;
}

function matchesTargetAgeRange(productTargetAge: string | null | undefined, recipientAge: number | null | undefined): boolean {
  if (!productTargetAge || productTargetAge.toLowerCase() === "todos") return true;
  const recipientAgeCategory = getAgeCategory(recipientAge);
  if (recipientAgeCategory === null) return true;
  return productTargetAge.toLowerCase() === recipientAgeCategory;
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
  
  // Use googleCategoryId to find the category name for search
  if (options.googleCategoryId && options.googleCategories) {
    const googleCategory = options.googleCategories.find(c => c.id === options.googleCategoryId);
    if (googleCategory) {
      // Use Portuguese name for better search results in Brazil
      parts.push(googleCategory.namePtBr);
    }
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
    
    if (options.googleCategoryId) {
      filtersApplied.push("Categoria");
    }
    
    if (options.recipientData) {
      filtersApplied.push("Perfil do presenteado");
    }
    
    // Add timeout to prevent freezing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch("/api/serpapi/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn("SerpAPI response not ok:", response.status);
        return { products: [], filtersApplied, filtersNotAvailable };
      }
      
      const data: SerpApiResponse = await response.json();
      
      return {
        products: data.sucesso ? data.resultados : [],
        filtersApplied,
        filtersNotAvailable,
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.warn("Google products fetch timed out after 15 seconds");
      } else {
        console.error("Error fetching Google products:", fetchError);
      }
      return { products: [], filtersApplied, filtersNotAvailable };
    }
  } catch (error) {
    console.error("Error preparing Google products request:", error);
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

function mapInterestsToGoogleCategoryIds(
  interests: string[],
  googleCategories: GoogleProductCategory[]
): { ids: number[]; englishNames: string[] } {
  const ids: number[] = [];
  const englishNames: string[] = [];
  
  if (!interests.length || !googleCategories.length) {
    return { ids, englishNames };
  }
  
  for (const interest of interests) {
    const interestLower = interest.toLowerCase().trim();
    
    for (const category of googleCategories) {
      const namePtBrLower = category.namePtBr.toLowerCase();
      
      if (namePtBrLower === interestLower || 
          namePtBrLower.includes(interestLower) || 
          interestLower.includes(namePtBrLower)) {
        if (!ids.includes(category.id)) {
          ids.push(category.id);
          englishNames.push(category.nameEn);
        }
      }
    }
  }
  
  return { ids, englishNames };
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

function findMatchingCategories(
  interests: string[],
  giftCategories: GiftCategory[]
): { matchedCategories: string[]; matchedKeywords: string[] } {
  const matchedCategories: Set<string> = new Set();
  const matchedKeywords: Set<string> = new Set();
  
  if (!interests.length) {
    return { matchedCategories: [], matchedKeywords: [] };
  }
  
  for (const interest of interests) {
    const interestLower = interest.toLowerCase().trim();
    
    // Direct match: interests are now category names
    // So we just add the interest directly as a matched category
    matchedCategories.add(interest);
    
    // Also check against giftCategories for additional keyword matching (optional expansion)
    if (giftCategories && giftCategories.length > 0) {
      for (const category of giftCategories) {
        if (!category.isActive) continue;
        
        const categoryName = category.name.toLowerCase();
        // Exact or partial match with category name
        if (categoryName === interestLower || categoryName.includes(interestLower) || interestLower.includes(categoryName)) {
          matchedCategories.add(category.name);
          
          // Add category keywords for expanded matching
          const keywords = category.keywords || [];
          for (const keyword of keywords) {
            matchedKeywords.add(keyword);
          }
        }
      }
    }
  }
  
  return {
    matchedCategories: Array.from(matchedCategories),
    matchedKeywords: Array.from(matchedKeywords),
  };
}

function calculateRelevanceScore(
  suggestion: GiftSuggestion, 
  recipientData?: RecipientData,
  giftCategories?: GiftCategory[]
): number {
  if (!recipientData) return 0;
  
  let score = 0;
  const { recipient, profile } = recipientData;
  const suggestionTags = (suggestion.tags || []).map(t => t.toLowerCase());
  const suggestionCategory = suggestion.category.toLowerCase();
  
  const interests = recipient.interests || [];
  
  // Direct category match: interests are now category names
  // This is the primary matching mechanism
  for (const interest of interests) {
    const interestLower = interest.toLowerCase().trim();
    
    // Exact match with product category (highest priority)
    if (suggestionCategory === interestLower) {
      score += 50; // High score for exact category match
    } else if (suggestionCategory.includes(interestLower) || interestLower.includes(suggestionCategory)) {
      score += 30; // Partial category match
    }
    
    // Tag match with interest
    if (suggestionTags.some(tag => tag.includes(interestLower) || interestLower.includes(tag))) {
      score += 15;
    }
  }
  
  // Optional: Use giftCategories keywords for expanded matching
  if (giftCategories && giftCategories.length > 0) {
    const { matchedCategories, matchedKeywords } = findMatchingCategories(interests, giftCategories);
    
    // Boost for matching category via keywords
    if (matchedCategories.some(cat => cat.toLowerCase() === suggestionCategory)) {
      score += 10; // Additional boost if category matched via keywords
    }
    
    // Keyword matching in product name/description
    for (const keyword of matchedKeywords) {
      const keywordLower = keyword.toLowerCase();
      if (suggestionTags.some(tag => tag.includes(keywordLower) || keywordLower.includes(tag))) {
        score += 5;
      }
      if (suggestion.name.toLowerCase().includes(keywordLower) || 
          (suggestion.description || "").toLowerCase().includes(keywordLower)) {
        score += 3;
      }
    }
  }
  
  // Profile questionnaire bonuses
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
  
  // Penalty for gifts to avoid
  if (profile?.giftsToAvoid) {
    const avoidTerms = profile.giftsToAvoid.toLowerCase().split(/[,;]+/).map(t => t.trim());
    for (const term of avoidTerms) {
      if (term && (suggestionTags.some(tag => tag.includes(term)) || suggestionCategory.includes(term))) {
        score -= 50;
      }
    }
  }
  
  // Bonus for gender-specific match (not unissex)
  const recipientGender = profile?.gender || recipient.gender;
  if (suggestion.targetGender && suggestion.targetGender.toLowerCase() !== "unissex" && recipientGender) {
    const normalizedRecipient = normalizeGender(recipientGender);
    if (normalizedRecipient !== null && suggestion.targetGender.toLowerCase() === normalizedRecipient) {
      score += 25; // Bonus for matching gender-specific product
    }
  }
  
  // Bonus for age-specific match (not todos)
  if (suggestion.targetAgeRange && suggestion.targetAgeRange.toLowerCase() !== "todos" && recipient.age) {
    const recipientAgeCategory = getAgeCategory(recipient.age);
    if (recipientAgeCategory !== null && suggestion.targetAgeRange.toLowerCase() === recipientAgeCategory) {
      score += 20; // Bonus for matching age-specific product
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
  
  const recipientInterests = options.recipientData?.recipient.interests || [];
  const hasRecipientWithInterests = recipientInterests.length > 0 && options.recipientData;
  
  const googleCategoryIds = options.googleCategories && recipientInterests.length > 0
    ? mapInterestsToGoogleCategoryIds(recipientInterests, options.googleCategories).ids
    : [];
  const useGoogleCategoryFilter = googleCategoryIds.length > 0;
  
  const recipientGender = options.recipientData?.profile?.gender || options.recipientData?.recipient.gender;
  const recipientAge = options.recipientData?.recipient.age;
  
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
    
    if (!matchesTargetGender(suggestion.targetGender, recipientGender)) {
      continue;
    }
    
    if (!matchesTargetAgeRange(suggestion.targetAgeRange, recipientAge)) {
      continue;
    }
    
    const searchableText = `${suggestion.name} ${suggestion.description || ""} ${suggestion.category} ${(suggestion.tags || []).join(" ")}`;
    const matchesKeywords = matchesKeyword(searchableText, options.keywords || "");
    
    // Filter by googleCategoryId if specified
    // Fallback to text matching if product doesn't have googleCategoryId
    let matchesCategory = true;
    if (options.googleCategoryId) {
      if (suggestion.googleCategoryId) {
        // Direct ID match
        matchesCategory = suggestion.googleCategoryId === options.googleCategoryId;
      } else {
        // Fallback: match by category name or tags
        const googleCategory = options.googleCategories?.find(c => c.id === options.googleCategoryId);
        if (googleCategory) {
          const categoryNamePt = googleCategory.namePtBr.toLowerCase();
          const categoryNameEn = googleCategory.nameEn.toLowerCase();
          const suggestionCategoryLower = suggestion.category.toLowerCase();
          const suggestionTags = (suggestion.tags || []).map(t => t.toLowerCase());
          
          // Check if product category or tags match the selected Google category
          matchesCategory = 
            suggestionCategoryLower.includes(categoryNamePt.split(" ")[0]) ||
            categoryNamePt.includes(suggestionCategoryLower) ||
            suggestionCategoryLower.includes(categoryNameEn.split(" ")[0]) ||
            categoryNameEn.includes(suggestionCategoryLower) ||
            suggestionTags.some(tag => 
              categoryNamePt.includes(tag) || 
              categoryNameEn.includes(tag) ||
              tag.includes(categoryNamePt.split(" ")[0]) ||
              tag.includes(categoryNameEn.split(" ")[0])
            );
        }
      }
    }
    
    const priceValue = typeof suggestion.price === "string" 
      ? parseFloat(suggestion.price) 
      : suggestion.price;
    const matchesMaxBudget = !options.maxBudget || priceValue <= options.maxBudget;
    const matchesMinBudget = !options.minBudget || priceValue >= options.minBudget;
    
    let matchesInterests = true;
    
    if (hasRecipientWithInterests) {
      if (useGoogleCategoryFilter && suggestion.googleCategoryId) {
        matchesInterests = googleCategoryIds.includes(suggestion.googleCategoryId);
      } else {
        const suggestionTags = suggestion.tags || [];
        const suggestionCategoryLower = suggestion.category.toLowerCase();
        
        matchesInterests = recipientInterests.some(interest => {
          const interestLower = interest.toLowerCase();
          
          const categoryMatch = suggestionCategoryLower === interestLower ||
            suggestionCategoryLower.includes(interestLower) ||
            interestLower.includes(suggestionCategoryLower);
          
          const tagMatch = suggestionTags.some(tag => {
            const tagLower = tag.toLowerCase();
            return tagLower === interestLower ||
              tagLower.includes(interestLower) ||
              interestLower.includes(tagLower);
          });
          
          return categoryMatch || tagMatch;
        });
      }
      
      if (!matchesInterests) {
        continue;
      }
    }
    
    if (matchesKeywords && matchesCategory && matchesMaxBudget && matchesMinBudget) {
      const relevanceScore = calculateRelevanceScore(suggestion, options.recipientData, options.giftCategories);
      results.push({ suggestion, score: relevanceScore });
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
    
    // If price is 0 or not available, include the product anyway (price info missing from Google)
    if (product.price === 0 || product.price === null || product.price === undefined) {
      return true;
    }
    
    const matchesMaxBudget = !options.maxBudget || product.price <= options.maxBudget;
    const matchesMinBudget = !options.minBudget || product.price >= options.minBudget;
    
    return matchesMaxBudget && matchesMinBudget;
  });
}

const PAGE_SIZE = 5;
const MAX_RESULTS = 15;

export async function runSuggestionAlgorithmV1(
  internalSuggestions: GiftSuggestion[],
  options: SuggestionAlgorithmOptions = {}
): Promise<SuggestionAlgorithmResult> {
  const {
    keywords = "",
    enableGoogleSearch = true,
    page = 1,
    pageSize = PAGE_SIZE,
  } = options;

  const currentPage = Math.max(1, page);
  const effectivePageSize = Math.min(pageSize, PAGE_SIZE);
  
  const filteredResults = filterInternalSuggestions(internalSuggestions, options);
  const allInternalUnified = filteredResults.map(({ suggestion, score }) => 
    convertInternalToUnified(suggestion, score)
  );
  
  let allGoogleUnified: UnifiedProduct[] = [];
  let googleFiltersApplied: string[] = [];
  let googleFiltersNotAvailable: string[] = [];
  let generatedQuery = "";
  let googleFromCache = false;
  
  const internalCount = allInternalUnified.length;
  const itemsNeededTotal = currentPage * effectivePageSize;
  const googleNeeded = Math.max(0, itemsNeededTotal - internalCount);
  
  const shouldSearchGoogle = enableGoogleSearch && 
    googleNeeded > 0 && 
    (keywords.trim() || options.recipientData);
  
  if (shouldSearchGoogle) {
    generatedQuery = buildGoogleSearchQuery(options);
    
    const cacheKey = searchCache.generateKey({
      recipientId: options.recipientData?.recipient.id,
      googleCategoryId: options.googleCategoryId,
      minBudget: options.minBudget,
      maxBudget: options.maxBudget,
      keywords: generatedQuery,
    });
    
    const cachedProducts = searchCache.get(cacheKey);
    
    if (cachedProducts) {
      allGoogleUnified = filterGoogleProducts(cachedProducts, options);
      googleFromCache = true;
      googleFiltersApplied.push("Resultados do cache");
      console.log(`[Cache] Usando ${cachedProducts.length} resultados do cache para: ${generatedQuery}`);
    } else {
      const googleLimit = Math.min(googleNeeded + 5, MAX_RESULTS - internalCount);
      const googleResult = await fetchGoogleProducts(generatedQuery, { ...options, googleLimit });
      const rawGoogleUnified = googleResult.products.map((p, i) => convertGoogleToUnified(p, i));
      
      if (rawGoogleUnified.length > 0) {
        searchCache.set(cacheKey, rawGoogleUnified, generatedQuery);
        console.log(`[Cache] Salvando ${rawGoogleUnified.length} resultados no cache para: ${generatedQuery}`);
      }
      
      allGoogleUnified = filterGoogleProducts(rawGoogleUnified, options);
      googleFiltersApplied = googleResult.filtersApplied;
      googleFiltersNotAvailable = googleResult.filtersNotAvailable;
    }
  }
  
  const allProductsCombined = [...allInternalUnified, ...allGoogleUnified];
  
  const totalInternalCount = allInternalUnified.length;
  const totalGoogleCount = allGoogleUnified.length;
  const totalAvailable = Math.min(allProductsCombined.length, MAX_RESULTS);
  const totalPages = Math.ceil(totalAvailable / effectivePageSize);
  
  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalAvailable);
  const paginatedProducts = allProductsCombined.slice(startIndex, endIndex);
  
  const hasMore = endIndex < totalAvailable;

  // Get the category name from googleCategoryId for display
  const selectedCategoryName = options.googleCategoryId && options.googleCategories
    ? options.googleCategories.find(c => c.id === options.googleCategoryId)?.namePtBr || null
    : null;
  
  return {
    products: paginatedProducts,
    internalCount: totalInternalCount,
    googleCount: totalGoogleCount,
    version: "2.1",
    appliedFilters: {
      keywords: keywords || "",
      category: selectedCategoryName,
      budgetRange: options.maxBudget ? { min: options.minBudget || 0, max: options.maxBudget } : null,
      recipientName: options.recipientData?.recipient.name || null,
      googleFiltersApplied,
      googleFiltersNotAvailable,
    },
    generatedQuery: generatedQuery || undefined,
    googleFromCache,
    pagination: {
      currentPage,
      pageSize: effectivePageSize,
      totalItems: totalAvailable,
      totalPages,
      hasMore,
      maxResults: MAX_RESULTS,
    },
  };
}

export { searchCache };
export type { SuggestionAlgorithmResult, PaginationMeta };
