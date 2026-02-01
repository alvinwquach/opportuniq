"use server";

/**
 * Instructables Integration
 *
 * Uses the internal Instructables JSON API (free, no key required) with
 * Firecrawl as fallback for detailed guide scraping.
 *
 * Internal API endpoints discovered from Instructables website:
 * - Search: https://www.instructables.com/json-api/search?q=<query>&limit=<n>
 * - Featured: https://www.instructables.com/json-api/showFeatured?limit=<n>
 * - By channel: https://www.instructables.com/json-api/showInstructablesByChannel?channel=<channel>&limit=<n>
 *
 * Categories: Home, Workshop, Craft, Cooking, Living, Outside, Teachers
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import type {
  UnifiedGuide,
  GuideSearchResponse,
  GuideDetailResponse,
} from "./types";

// ============================================
// Constants
// ============================================

const INSTRUCTABLES_BASE_URL = "https://www.instructables.com";
const INSTRUCTABLES_API_URL = "https://www.instructables.com/json-api";

// Relevant channels for home repair/DIY
const HOME_REPAIR_CHANNELS = [
  "home-improvement",
  "repair",
  "woodworking",
  "metalworking",
  "garage",
  "outdoor-projects",
  "tools",
] as const;

// ============================================
// Internal API Types
// ============================================

interface InstructablesApiItem {
  id: string;
  title: string;
  urlString: string;
  screenName: string; // author
  channel?: string;
  category?: string;
  views?: number;
  favorites?: number;
  featureFlag?: boolean;
  squareUrl?: string; // thumbnail
  mediumUrl?: string; // larger image
  publishDate?: string;
}

interface InstructablesSearchResponse {
  items?: InstructablesApiItem[];
  count?: number;
  offset?: number;
  limit?: number;
}

// ============================================
// Firecrawl Client (for fallback)
// ============================================

function getFirecrawlClient(): FirecrawlApp | null {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new FirecrawlApp({ apiKey });
}

// ============================================
// Internal API Functions (FREE)
// ============================================

/**
 * Search Instructables using internal JSON API (FREE)
 */
export async function searchInstructables(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<GuideSearchResponse> {
  try {
    const limit = options?.limit ?? 10;
    const offset = options?.offset ?? 0;

    const url = `${INSTRUCTABLES_API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; OpportuniqBot/1.0)",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      // Fall back to Firecrawl scraping
      console.log("[Instructables] Internal API failed, trying Firecrawl fallback");
      return searchInstructablesViaFirecrawl(query, { limit });
    }

    const data: InstructablesSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: true,
        guides: [],
        totalResults: 0,
      };
    }

    const guides: UnifiedGuide[] = data.items.map((item) => ({
      id: `instructables-${item.id}`,
      externalId: item.id,
      source: "instructables" as const,
      sourceUrl: `${INSTRUCTABLES_BASE_URL}/${item.urlString}`,
      title: item.title,
      thumbnailUrl: item.squareUrl || item.mediumUrl,
      author: item.screenName,
      viewCount: item.views,
      rating: item.favorites,
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: data.count || guides.length,
    };
  } catch (error) {
    console.error("Instructables search error:", error);
    // Try Firecrawl fallback
    return searchInstructablesViaFirecrawl(query, { limit: options?.limit ?? 10 });
  }
}

/**
 * Get featured Instructables (FREE)
 */
export async function getInstructablesFeatured(
  limit = 10
): Promise<GuideSearchResponse> {
  try {
    const url = `${INSTRUCTABLES_API_URL}/showFeatured?limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; OpportuniqBot/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Instructables API error: ${response.status}`);
    }

    const data: InstructablesSearchResponse = await response.json();

    const guides: UnifiedGuide[] = (data.items || []).map((item) => ({
      id: `instructables-${item.id}`,
      externalId: item.id,
      source: "instructables" as const,
      sourceUrl: `${INSTRUCTABLES_BASE_URL}/${item.urlString}`,
      title: item.title,
      thumbnailUrl: item.squareUrl || item.mediumUrl,
      author: item.screenName,
      viewCount: item.views,
      rating: item.favorites,
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
    };
  } catch (error) {
    console.error("Instructables featured error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to get featured",
    };
  }
}

/**
 * Get Instructables by channel (FREE)
 */
export async function getInstructablesByChannel(
  channel: string,
  limit = 10
): Promise<GuideSearchResponse> {
  try {
    const url = `${INSTRUCTABLES_API_URL}/showInstructablesByChannel?channel=${encodeURIComponent(channel)}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; OpportuniqBot/1.0)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Instructables API error: ${response.status}`);
    }

    const data: InstructablesSearchResponse = await response.json();

    const guides: UnifiedGuide[] = (data.items || []).map((item) => ({
      id: `instructables-${item.id}`,
      externalId: item.id,
      source: "instructables" as const,
      sourceUrl: `${INSTRUCTABLES_BASE_URL}/${item.urlString}`,
      title: item.title,
      thumbnailUrl: item.squareUrl || item.mediumUrl,
      author: item.screenName,
      viewCount: item.views,
      rating: item.favorites,
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
    };
  } catch (error) {
    console.error("Instructables channel error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to get channel",
    };
  }
}

/**
 * Get popular home repair Instructables (FREE)
 */
export async function getInstructablesPopular(
  limit = 10
): Promise<GuideSearchResponse> {
  // Search across home repair relevant channels in parallel
  const channelPromises = HOME_REPAIR_CHANNELS.slice(0, 3).map((channel) =>
    getInstructablesByChannel(channel, Math.ceil(limit / 3))
  );

  const results = await Promise.allSettled(channelPromises);

  const allGuides: UnifiedGuide[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.success) {
      allGuides.push(...result.value.guides);
    }
  });

  // Deduplicate by ID
  const uniqueGuides = allGuides.filter(
    (guide, index, self) =>
      index === self.findIndex((g) => g.id === guide.id)
  );

  return {
    success: uniqueGuides.length > 0,
    guides: uniqueGuides.slice(0, limit),
    totalResults: uniqueGuides.length,
  };
}

/**
 * Search home repair specific content (FREE)
 */
export async function searchInstructablesHomeRepair(
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  // Enhance query with home repair terms
  const enhancedQuery = `${query} repair DIY home`;
  return searchInstructables(enhancedQuery, options);
}

// ============================================
// Firecrawl Fallback Functions (PAID)
// ============================================

/**
 * Fallback: Search Instructables via Firecrawl scraping
 */
async function searchInstructablesViaFirecrawl(
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  const firecrawl = getFirecrawlClient();
  if (!firecrawl) {
    return {
      success: false,
      guides: [],
      error: "Instructables API unavailable and FIRECRAWL_API_KEY not configured",
    };
  }

  try {
    const limit = options?.limit ?? 5;
    const searchUrl = `${INSTRUCTABLES_BASE_URL}/search/?q=${encodeURIComponent(query)}&projects=all`;

    const result = await firecrawl.scrapeUrl(searchUrl, {
      formats: ["markdown", "links"],
      onlyMainContent: true,
      waitFor: 3000,
    });

    if (!result.success) {
      throw new Error("Failed to scrape Instructables search results");
    }

    // Filter links to find project pages
    const projectPattern = /instructables\.com\/(?!search|member|id\/)[A-Za-z0-9-]+\/?$/;
    const projectLinks = (result.links || [])
      .filter((link: string) => {
        if (!link.includes("instructables.com")) return false;
        if (link.includes("/search") || link.includes("/member/")) return false;
        if (link.match(/instructables\.com\/(home|workshop|craft|cooking|living|outside|teachers)\/?$/)) return false;
        return projectPattern.test(link) || link.match(/instructables\.com\/[A-Z][a-zA-Z0-9-]+\/?$/);
      })
      .slice(0, limit);

    const guides: UnifiedGuide[] = projectLinks.map((url: string) => ({
      id: `instructables-${Buffer.from(url).toString("base64").slice(0, 12)}`,
      externalId: url,
      source: "instructables" as const,
      sourceUrl: url,
      title: extractTitleFromUrl(url),
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
    };
  } catch (error) {
    console.error("Instructables Firecrawl fallback error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search Instructables",
    };
  }
}

// ============================================
// Guide Detail Functions
// ============================================

const INSTRUCTABLES_EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const, description: "Project title" },
    description: { type: "string" as const, description: "Project description/intro" },
    author: { type: "string" as const, description: "Author username" },
    difficulty: { type: "string" as const, description: "Difficulty level" },
    timeEstimate: { type: "string" as const, description: "Time to complete" },
    views: { type: "number" as const, description: "View count" },
    favorites: { type: "number" as const, description: "Favorites count" },
    supplies: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "List of supplies/materials needed",
    },
    tools: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "List of tools needed",
    },
    steps: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          stepNumber: { type: "number" as const },
          title: { type: "string" as const },
          instruction: { type: "string" as const },
        },
      },
      description: "Step-by-step instructions",
    },
    tips: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Tips and notes from author",
    },
  },
  required: ["title"] as const,
};

/**
 * Scrape full guide details from an Instructables URL (requires Firecrawl)
 */
export async function scrapeInstructablesGuide(url: string): Promise<GuideDetailResponse> {
  const firecrawl = getFirecrawlClient();
  if (!firecrawl) {
    return {
      success: false,
      error: "FIRECRAWL_API_KEY not configured - cannot fetch guide details",
    };
  }

  try {
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown", "extract"],
      onlyMainContent: true,
      waitFor: 3000,
      extract: {
        schema: INSTRUCTABLES_EXTRACT_SCHEMA,
      },
    });

    if (!result.success) {
      throw new Error("Failed to scrape Instructables guide");
    }

    const extracted = result.extract as {
      title?: string;
      description?: string;
      author?: string;
      difficulty?: string;
      timeEstimate?: string;
      views?: number;
      favorites?: number;
      supplies?: string[];
      tools?: string[];
      steps?: Array<{ stepNumber?: number; title?: string; instruction?: string }>;
      tips?: string[];
    } | undefined;

    const guide: UnifiedGuide = {
      id: `instructables-${Buffer.from(url).toString("base64").slice(0, 12)}`,
      externalId: url,
      source: "instructables",
      sourceUrl: url,
      title: extracted?.title || extractTitleFromUrl(url),
      description: extracted?.description || result.markdown?.slice(0, 300),
      difficulty: normalizeDifficulty(extracted?.difficulty),
      timeEstimate: extracted?.timeEstimate,
      tools: extracted?.tools || [],
      materials: extracted?.supplies || [],
      viewCount: extracted?.views,
      rating: extracted?.favorites,
      author: extracted?.author,
      steps: extracted?.steps?.map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        title: step.title,
        instruction: step.instruction || "",
        tips: index === 0 && extracted?.tips ? extracted.tips : undefined,
      })) || parseStepsFromMarkdown(result.markdown || ""),
      fetchedAt: new Date().toISOString(),
    };

    return {
      success: true,
      guide,
    };
  } catch (error) {
    console.error("Instructables guide scrape error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scrape guide",
    };
  }
}

// ============================================
// Helper Functions
// ============================================

function extractTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split("/").filter(Boolean).pop() || "";
    return slug
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return "Untitled Project";
  }
}

function normalizeDifficulty(difficulty?: string): string | undefined {
  if (!difficulty) return undefined;

  const lower = difficulty.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner") || lower.includes("simple")) return "beginner";
  if (lower.includes("medium") || lower.includes("intermediate") || lower.includes("moderate")) return "intermediate";
  if (lower.includes("hard") || lower.includes("advanced") || lower.includes("expert")) return "advanced";

  return difficulty;
}

function parseStepsFromMarkdown(markdown: string): UnifiedGuide["steps"] {
  const steps: UnifiedGuide["steps"] = [];

  const stepPattern = /(?:^|\n)(?:Step|STEP)\s*(\d+)[:\s]+([^\n]+)(?:\n([\s\S]*?))?(?=\n(?:Step|STEP)\s*\d+|$)/gi;
  const matches = markdown.matchAll(stepPattern);

  for (const match of matches) {
    steps.push({
      stepNumber: parseInt(match[1]),
      title: match[2]?.trim(),
      instruction: match[3]?.trim() || match[2]?.trim() || "",
    });
  }

  if (steps.length === 0) {
    const headerPattern = /(?:^|\n)#+\s+(.+?)(?:\n([\s\S]*?))?(?=\n#+\s+|$)/g;
    const headerMatches = markdown.matchAll(headerPattern);
    let stepNum = 1;

    for (const match of headerMatches) {
      const title = match[1]?.trim();
      const content = match[2]?.trim();
      if (title && !title.toLowerCase().includes("comment") && !title.toLowerCase().includes("related")) {
        steps.push({
          stepNumber: stepNum++,
          title,
          instruction: content || title,
        });
      }
    }
  }

  return steps.slice(0, 20);
}
