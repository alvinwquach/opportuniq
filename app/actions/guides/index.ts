"use server";

/**
 * Guide Actions Index
 *
 * Unified exports for fetching guides from multiple sources:
 * - iFixit API (free) - Device/appliance repairs
 * - YouTube API (free, 10k units/day) - Video tutorials
 * - Stack Exchange API (free) - DIY Q&A from diy.stackexchange.com
 * - Firecrawl (paid) - Family Handyman, This Old House, Bob Vila, Instructables
 */

// Types
export type {
  UnifiedGuide,
  UnifiedStep,
  GuideSearchResponse,
  GuideDetailResponse,
  IFixitGuide,
  IFixitSearchResult,
  YouTubeSearchResult,
  YouTubeVideoDetails,
  FirecrawlGuide,
} from "./types";

// iFixit (Free API)
export {
  searchIFixitGuides,
  getIFixitGuide,
  getIFixitCategories,
  getIFixitGuidesByCategory,
  getIFixitPopularGuides,
} from "./ifixit";

// YouTube (Free API - 10k units/day)
export {
  searchYouTubeVideos,
  getYouTubeVideoDetails,
  searchRepairVideos,
  getPopularRepairVideos,
  getYouTubeEmbedUrl,
} from "./youtube";

// Stack Exchange (Free API - 300 req/day without key, 10k with key)
export {
  searchStackExchangeQuestions,
  getStackExchangeQuestion,
  getStackExchangePopularQuestions,
  searchStackExchangeByTags,
} from "./stackexchange";

// Firecrawl (Paid - for sites without APIs)
export {
  searchFirecrawlSource,
  searchAllSources,
  scrapeGuideDetails,
  scrapeMultipleGuides,
  searchFamilyHandyman,
  searchThisOldHouse,
  searchBobVila,
} from "./firecrawl";

// Instructables (Free internal API with Firecrawl fallback)
export {
  searchInstructables,
  scrapeInstructablesGuide,
  getInstructablesPopular,
  getInstructablesFeatured,
  getInstructablesByChannel,
  searchInstructablesHomeRepair,
} from "./instructables";

// ============================================
// Unified Search Function
// ============================================

import type { UnifiedGuide, GuideSearchResponse } from "./types";
import { searchIFixitGuides } from "./ifixit";
import { searchYouTubeVideos } from "./youtube";
import { searchStackExchangeQuestions } from "./stackexchange";
import { searchAllSources } from "./firecrawl";
import { searchInstructables } from "./instructables";

export interface UnifiedSearchOptions {
  /** Include iFixit results (default: true) */
  includeIFixit?: boolean;
  /** Include YouTube results (default: true) */
  includeYouTube?: boolean;
  /** Include Stack Exchange results (default: true) */
  includeStackExchange?: boolean;
  /** Include Firecrawl-scraped results (default: true) */
  includeFirecrawl?: boolean;
  /** Include Instructables results (default: true) */
  includeInstructables?: boolean;
  /** Max results per source (default: 5) */
  limitPerSource?: number;
}

/**
 * Search all guide sources at once
 *
 * Prioritizes free APIs (iFixit, Stack Exchange, YouTube) and uses Firecrawl as supplement.
 * Results are merged and deduplicated.
 */
export async function searchAllGuides(
  query: string,
  options?: UnifiedSearchOptions
): Promise<GuideSearchResponse> {
  const {
    includeIFixit = true,
    includeYouTube = true,
    includeStackExchange = true,
    includeFirecrawl = true,
    includeInstructables = true,
    limitPerSource = 5,
  } = options || {};

  const promises: Promise<GuideSearchResponse>[] = [];

  // Free APIs first (prioritize these)
  if (includeIFixit) {
    promises.push(searchIFixitGuides(query, { limit: limitPerSource }));
  }

  if (includeStackExchange) {
    promises.push(searchStackExchangeQuestions(query, { limit: limitPerSource }));
  }

  if (includeYouTube) {
    promises.push(searchYouTubeVideos(query, { maxResults: limitPerSource }));
  }

  // Firecrawl sources last (costs credits)
  if (includeFirecrawl) {
    promises.push(searchAllSources(query, { limitPerSource: Math.ceil(limitPerSource / 3) }));
  }

  if (includeInstructables) {
    promises.push(searchInstructables(query, { limit: Math.ceil(limitPerSource / 2) }));
  }

  const results = await Promise.allSettled(promises);

  const allGuides: UnifiedGuide[] = [];
  const errors: string[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.success) {
      allGuides.push(...result.value.guides);
    } else if (result.status === "rejected") {
      errors.push(result.reason?.message || "Unknown error");
    } else if (result.status === "fulfilled" && result.value.error) {
      errors.push(result.value.error);
    }
  });

  // Sort by source priority: iFixit > Stack Exchange > Firecrawl sites > Instructables > YouTube
  const sourcePriority: Record<string, number> = {
    ifixit: 1,
    diy_stackexchange: 2,
    family_handyman: 3,
    this_old_house: 3,
    bob_vila: 3,
    instructables: 4,
    youtube: 5,
    other: 6,
  };

  allGuides.sort((a, b) => {
    const priorityA = sourcePriority[a.source] || 7;
    const priorityB = sourcePriority[b.source] || 7;
    return priorityA - priorityB;
  });

  return {
    success: allGuides.length > 0,
    guides: allGuides,
    totalResults: allGuides.length,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

/**
 * Get guide details from any source
 */
import { getIFixitGuide } from "./ifixit";
import { getYouTubeVideoDetails } from "./youtube";
import { getStackExchangeQuestion } from "./stackexchange";
import { scrapeGuideDetails } from "./firecrawl";
import { scrapeInstructablesGuide } from "./instructables";
import type { GuideDetailResponse } from "./types";

export async function getGuideDetails(
  guideId: string,
  source: UnifiedGuide["source"]
): Promise<GuideDetailResponse> {
  switch (source) {
    case "ifixit":
      return getIFixitGuide(parseInt(guideId));

    case "youtube":
      return getYouTubeVideoDetails(guideId);

    case "diy_stackexchange":
      return getStackExchangeQuestion(parseInt(guideId));

    case "instructables":
      // For Instructables, guideId is the URL
      return scrapeInstructablesGuide(guideId);

    case "family_handyman":
    case "this_old_house":
    case "bob_vila":
    case "other":
      // For Firecrawl sources, guideId is the URL
      return scrapeGuideDetails(guideId);

    default:
      return {
        success: false,
        error: `Unknown source: ${source}`,
      };
  }
}
