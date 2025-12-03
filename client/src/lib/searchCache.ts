import type { UnifiedProduct } from "./suggestionAlgorithm";

interface CacheEntry {
  products: UnifiedProduct[];
  timestamp: number;
  query: string;
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();

  generateKey(params: {
    recipientId?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    keywords?: string;
  }): string {
    const parts = [
      params.recipientId || "no-recipient",
      params.category || "no-category",
      params.minBudget?.toString() || "0",
      params.maxBudget?.toString() || "max",
      params.keywords || "no-keywords",
    ];
    return parts.join("|");
  }

  get(key: string): UnifiedProduct[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    return entry.products;
  }

  set(key: string, products: UnifiedProduct[], query: string): void {
    this.cache.set(key, {
      products,
      timestamp: Date.now(),
      query,
    });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { totalEntries: number; keys: string[] } {
    return {
      totalEntries: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  getEntry(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }
}

export const searchCache = new SearchCache();
export type { CacheEntry };
