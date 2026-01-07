/**
 * Shared types for chat tools
 */

import FirecrawlApp from "@mendable/firecrawl-js";

export interface ToolContext {
  firecrawl: FirecrawlApp | null;
  userId?: string;
  userName?: string;
  conversationId?: string;
}

/**
 * Helper to wrap Firecrawl scrape with a timeout
 * Returns null if timeout or error occurs
 */
export async function scrapeWithTimeout(
  firecrawl: FirecrawlApp,
  url: string,
  timeoutMs: number = 20000 // 20 seconds default
): Promise<{ markdown?: string } | null> {
  try {
    const result = await Promise.race([
      firecrawl.scrape(url, { formats: ["markdown"] }),
      new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log(`[Firecrawl] Timeout after ${timeoutMs}ms for ${url}`);
          resolve(null);
        }, timeoutMs);
      }),
    ]);
    return result;
  } catch (error) {
    console.log(`[Firecrawl] Scrape error for ${url}:`, error);
    return null;
  }
}

export interface PriceComparisonResult {
  query: string;
  comparison: Array<{
    store: string;
    url: string;
    results?: string;
    error?: string;
  }>;
  tip: string;
}

export interface InventoryCheckResult {
  query: string;
  zipCode: string;
  source: string;
  inventory: string;
  screenshot?: string | null;
  tip: string;
  error?: string;
  suggestion?: string;
}

export interface ContractorVerificationResult {
  contractor: string;
  state: string;
  type: string;
  verificationResults: Array<{
    source: string;
    data: unknown;
    url?: string;
    rating?: string;
  }>;
  licensingBoardUrl: string;
  tips: string[];
  redFlags: string[];
  error?: string;
  availableProviders?: string[];
  suggestion?: string;
}

export interface ContractorSearchResult {
  serviceType: string;
  zipCode: string;
  source?: string;
  fallbacksUsed?: string[];
  contractors?: Array<{
    vendorName: string;
    contactInfo: {
      phone?: string;
      website?: string;
      address?: string;
    };
    rating?: string;
    distance?: string;
    specialties?: string[];
    source: string;
  }>;
  availableProviders?: string[];
  recommendation?: string;
  tips: string[];
  searchSuggestions?: string[];
}

export interface PermitRequirementsResult {
  projectType: string;
  location: string;
  searchResults: string;
  generalGuidance: string[];
  tip: string;
  error?: string;
  suggestion?: string;
}

export interface ProductReviewsResult {
  product: string;
  reviews: Array<{
    source: string;
    url?: string;
    content?: string;
    error?: string;
  }>;
  tip: string;
  error?: string;
  suggestion?: string;
}

export interface TutorialSearchResult {
  searchQuery: string;
  youtubeUrl: string;
  results?: string;
  tips?: string[];
  error?: string;
  suggestion?: string;
}

export interface RecallCheckResult {
  itemType: "product" | "vehicle";
  searchTerm: string;
  source?: string;
  recallUrl?: string;
  results?: string;
  tip?: string;
  error?: string;
  suggestion?: string;
}

export interface UtilityRebatesResult {
  upgradeType: string;
  zipCode: string;
  searchResults?: string | null;
  resources: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  commonRebates: string[];
  tip: string;
  error?: string;
  suggestion?: string;
}

export interface ProductSearchResult {
  source: string;
  searchQuery: string;
  category: string;
  results: string;
  shopUrl: string;
  error?: string;
  suggestion?: string;
}
