"use server";

/**
 * Firecrawl Server Actions for Guide Scraping
 *
 * Scrapes DIY guide content from sites without free APIs:
 * - Family Handyman
 * - This Old House
 * - Bob Vila
 *
 * Uses your existing Firecrawl setup (100,000 pages/month budget)
 */

import FirecrawlApp from "@mendable/firecrawl-js";
import type {
  FirecrawlGuide,
  FirecrawlStep,
  FirecrawlSearchResult,
  UnifiedGuide,
  GuideSearchResponse,
  GuideDetailResponse,
} from "./types";

// ============================================
// Firecrawl Client
// ============================================

function getFirecrawlClient(): FirecrawlApp {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not configured");
  }
  return new FirecrawlApp({ apiKey });
}

// ============================================
// Source Configuration
// ============================================

interface SourceConfig {
  name: string;
  baseUrl: string;
  searchUrl: (query: string) => string;
  guideUrlPattern: RegExp;
  source: "family_handyman" | "this_old_house" | "bob_vila" | "other";
}

const SOURCES: Record<string, SourceConfig> = {
  family_handyman: {
    name: "Family Handyman",
    baseUrl: "https://www.familyhandyman.com",
    searchUrl: (query: string) =>
      `https://www.familyhandyman.com/search/?q=${encodeURIComponent(query)}`,
    guideUrlPattern: /familyhandyman\.com\/(project|article|list)\//,
    source: "family_handyman",
  },
  this_old_house: {
    name: "This Old House",
    baseUrl: "https://www.thisoldhouse.com",
    searchUrl: (query: string) =>
      `https://www.thisoldhouse.com/search?q=${encodeURIComponent(query)}`,
    guideUrlPattern: /thisoldhouse\.com\/.*\/(how-to|21)/,
    source: "this_old_house",
  },
  bob_vila: {
    name: "Bob Vila",
    baseUrl: "https://www.bobvila.com",
    searchUrl: (query: string) =>
      `https://www.bobvila.com/?s=${encodeURIComponent(query)}`,
    guideUrlPattern: /bobvila\.com\/articles\//,
    source: "bob_vila",
  },
};

// ============================================
// Guide Extraction Schema
// ============================================

const GUIDE_EXTRACT_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const, description: "The title of the guide" },
    description: { type: "string" as const, description: "A brief description or intro" },
    difficulty: { type: "string" as const, description: "Difficulty level (easy, medium, hard, beginner, intermediate, advanced)" },
    timeEstimate: { type: "string" as const, description: "Estimated time to complete" },
    tools: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "List of tools needed",
    },
    materials: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "List of materials needed",
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
    warnings: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Safety warnings",
    },
    tips: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Pro tips",
    },
    author: { type: "string" as const, description: "Author name" },
  },
  required: ["title"] as const,
};

// ============================================
// Search Functions
// ============================================

/**
 * Search a specific source for guides
 */
export async function searchFirecrawlSource(
  sourceKey: keyof typeof SOURCES,
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  try {
    const source = SOURCES[sourceKey];
    if (!source) {
      return { success: false, guides: [], error: `Unknown source: ${sourceKey}` };
    }

    const firecrawl = getFirecrawlClient();
    const searchUrl = source.searchUrl(query);

    // Scrape the search results page
    const result = await firecrawl.scrape(searchUrl, {
      formats: ["markdown", "links"],
      onlyMainContent: true,
      waitFor: 3000,
    });

    // Filter links to find guide pages
    const guideLinks = (result.links || [])
      .filter((link: string) => source.guideUrlPattern.test(link))
      .slice(0, options?.limit ?? 5);

    // Convert to unified format (basic info only, full details require separate fetch)
    const guides: UnifiedGuide[] = guideLinks.map((url: string, index: number) => ({
      id: `${sourceKey}-${Buffer.from(url).toString("base64").slice(0, 12)}`,
      externalId: url,
      source: source.source,
      sourceUrl: url,
      title: extractTitleFromUrl(url),
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: guideLinks.length,
    };
  } catch (error) {
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search",
    };
  }
}

/**
 * Search all sources for guides
 */
export async function searchAllSources(
  query: string,
  options?: { limitPerSource?: number }
): Promise<GuideSearchResponse> {
  const limit = options?.limitPerSource ?? 3;

  const results = await Promise.allSettled([
    searchFirecrawlSource("family_handyman", query, { limit }),
    searchFirecrawlSource("this_old_house", query, { limit }),
    searchFirecrawlSource("bob_vila", query, { limit }),
  ]);

  const allGuides: UnifiedGuide[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    const sourceNames = ["Family Handyman", "This Old House", "Bob Vila"];
    if (result.status === "fulfilled" && result.value.success) {
      allGuides.push(...result.value.guides);
    } else if (result.status === "rejected") {
      errors.push(`${sourceNames[index]}: ${result.reason}`);
    } else if (result.status === "fulfilled" && result.value.error) {
      errors.push(`${sourceNames[index]}: ${result.value.error}`);
    }
  });

  return {
    success: allGuides.length > 0,
    guides: allGuides,
    totalResults: allGuides.length,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

// ============================================
// Guide Detail Functions
// ============================================

/**
 * Scrape and extract full guide details from a URL
 */
export async function scrapeGuideDetails(url: string): Promise<GuideDetailResponse> {
  try {
    const firecrawl = getFirecrawlClient();

    // Determine source from URL
    let source: "family_handyman" | "this_old_house" | "bob_vila" | "other" = "other";
    for (const [key, config] of Object.entries(SOURCES)) {
      if (url.includes(config.baseUrl.replace("https://www.", ""))) {
        source = config.source;
        break;
      }
    }

    // Scrape with extraction
    const result = await firecrawl.scrape(url, {
      formats: [
        "markdown",
        { type: "json", schema: GUIDE_EXTRACT_SCHEMA },
      ],
      onlyMainContent: true,
      waitFor: 3000,
    });

    const extracted = result.json as {
      title?: string;
      description?: string;
      difficulty?: string;
      timeEstimate?: string;
      tools?: string[];
      materials?: string[];
      steps?: Array<{ stepNumber?: number; title?: string; instruction?: string }>;
      warnings?: string[];
      tips?: string[];
      author?: string;
    } | undefined;

    // Build unified guide
    const guide: UnifiedGuide = {
      id: `scraped-${Buffer.from(url).toString("base64").slice(0, 12)}`,
      externalId: url,
      source,
      sourceUrl: url,
      title: extracted?.title || extractTitleFromUrl(url),
      description: extracted?.description || result.markdown?.slice(0, 300),
      difficulty: normalizeDifficulty(extracted?.difficulty),
      timeEstimate: extracted?.timeEstimate,
      tools: extracted?.tools || [],
      materials: extracted?.materials || [],
      steps: extracted?.steps?.map((step, index) => ({
        stepNumber: step.stepNumber || index + 1,
        title: step.title,
        instruction: step.instruction || "",
      })) || parseStepsFromMarkdown(result.markdown || ""),
      author: extracted?.author,
      fetchedAt: new Date().toISOString(),
    };

    // Add warnings and tips to steps if available
    if (extracted?.warnings?.length) {
      guide.steps = guide.steps || [];
      if (guide.steps.length > 0) {
        guide.steps[0].warnings = extracted.warnings;
      }
    }
    if (extracted?.tips?.length) {
      guide.steps = guide.steps || [];
      if (guide.steps.length > 0) {
        guide.steps[guide.steps.length - 1].tips = extracted.tips;
      }
    }

    return {
      success: true,
      guide,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scrape guide",
    };
  }
}

/**
 * Scrape multiple guides in parallel (use sparingly)
 */
export async function scrapeMultipleGuides(
  urls: string[]
): Promise<GuideSearchResponse> {
  const results = await Promise.allSettled(
    urls.slice(0, 5).map((url) => scrapeGuideDetails(url))
  );

  const guides: UnifiedGuide[] = [];
  const errors: string[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.success && result.value.guide) {
      guides.push(result.value.guide);
    } else if (result.status === "rejected") {
      errors.push(result.reason);
    }
  });

  return {
    success: guides.length > 0,
    guides,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract a readable title from URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const slug = pathname.split("/").filter(Boolean).pop() || "";
    return slug
      .replace(/-/g, " ")
      .replace(/\d+$/, "")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return "Untitled Guide";
  }
}

/**
 * Normalize difficulty level
 */
function normalizeDifficulty(difficulty?: string): string | undefined {
  if (!difficulty) return undefined;

  const lower = difficulty.toLowerCase();
  if (lower.includes("easy") || lower.includes("beginner")) return "beginner";
  if (lower.includes("medium") || lower.includes("intermediate")) return "intermediate";
  if (lower.includes("hard") || lower.includes("advanced") || lower.includes("expert"))
    return "advanced";

  return difficulty;
}

/**
 * Parse steps from markdown content (fallback)
 */
function parseStepsFromMarkdown(markdown: string): UnifiedGuide["steps"] {
  const steps: UnifiedGuide["steps"] = [];

  // Look for numbered lists or "Step X" patterns
  const stepPatterns = [
    /(?:^|\n)(\d+)\.\s+(.+?)(?=\n\d+\.|$)/g, // Numbered lists
    /(?:^|\n)(?:Step|STEP)\s*(\d+)[:\s]+(.+?)(?=\n(?:Step|STEP)\s*\d+|$)/gi, // "Step X:" format
  ];

  for (const pattern of stepPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(markdown)) !== null) {
      steps.push({
        stepNumber: parseInt(match[1]),
        instruction: match[2].trim(),
      });
    }
    if (steps.length > 0) break;
  }

  // If no steps found, split by paragraphs
  if (steps.length === 0) {
    const paragraphs = markdown
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 50)
      .slice(0, 10);

    paragraphs.forEach((p, index) => {
      steps.push({
        stepNumber: index + 1,
        instruction: p.trim(),
      });
    });
  }

  return steps;
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Search Family Handyman specifically
 */
export async function searchFamilyHandyman(
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  return searchFirecrawlSource("family_handyman", query, options);
}

/**
 * Search This Old House specifically
 */
export async function searchThisOldHouse(
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  return searchFirecrawlSource("this_old_house", query, options);
}

/**
 * Search Bob Vila specifically
 */
export async function searchBobVila(
  query: string,
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  return searchFirecrawlSource("bob_vila", query, options);
}
