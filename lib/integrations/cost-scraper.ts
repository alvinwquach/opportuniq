/**
 * Cost Data Scraper
 *
 * Scrapes pricing data from HomeAdvisor and Angi cost guide pages.
 * Caches results in database to minimize API calls.
 *
 * Usage:
 * - getCostEstimate("ceiling_repair", "94102") -> returns cached or fresh cost data
 * - scrapeCostGuide("homeadvisor", "drywall-repair") -> scrapes and parses cost page
 */

import * as Sentry from "@sentry/nextjs";
import { scrapePage } from "./firecrawl";
import { db } from "@/app/db/client";
import { costData, type CostData, type NewCostData } from "@/app/db/schema";
import { eq, and, gt } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface CostEstimate {
  serviceType: string;
  region: string;
  diy: {
    min: number; // in dollars
    max: number;
    avg: number;
  } | null;
  pro: {
    min: number;
    max: number;
    avg: number;
  } | null;
  costFactors?: string[];
  timeEstimate?: {
    diy?: string;
    pro?: string;
  };
  source: "homeadvisor" | "angi" | "thumbtack" | "manual" | "user_submitted";
  sourceUrl?: string;
  lastUpdated: Date;
  isEstimate: boolean; // true if AI-generated fallback, false if real data
}

// Map service types to URL slugs
const SERVICE_URL_MAP: Record<
  string,
  { homeadvisor?: string; angi?: string }
> = {
  // Ceiling/Drywall
  ceiling_repair: {
    homeadvisor: "ceilings/repair-a-ceiling",
    angi: "how-much-does-ceiling-repair-cost",
  },
  drywall_repair: {
    homeadvisor: "walls/repair-drywall",
    angi: "how-much-does-drywall-repair-cost",
  },
  popcorn_ceiling: {
    homeadvisor: "ceilings/remove-a-popcorn-ceiling",
    angi: "how-much-does-popcorn-ceiling-removal-cost",
  },

  // Plumbing
  plumbing_leak: {
    homeadvisor: "plumbing/repair-a-pipe",
    angi: "how-much-does-it-cost-to-fix-a-leaky-pipe",
  },
  faucet_repair: {
    homeadvisor: "plumbing/repair-a-faucet",
    angi: "how-much-does-faucet-repair-cost",
  },
  toilet_repair: {
    homeadvisor: "plumbing/repair-a-toilet",
    angi: "how-much-does-toilet-repair-cost",
  },
  water_heater: {
    homeadvisor: "plumbing/repair-a-water-heater",
    angi: "how-much-does-water-heater-repair-cost",
  },

  // HVAC
  hvac_repair: {
    homeadvisor: "heating-and-cooling/repair-a-central-air-conditioning-unit",
    angi: "how-much-does-hvac-repair-cost",
  },
  furnace_repair: {
    homeadvisor: "heating-and-cooling/repair-a-furnace",
    angi: "how-much-does-furnace-repair-cost",
  },

  // Electrical
  electrical_repair: {
    homeadvisor: "electrical/repair-electrical-items",
    angi: "how-much-does-electrical-repair-cost",
  },
  outlet_repair: {
    homeadvisor: "electrical/install-an-electrical-outlet",
    angi: "how-much-does-outlet-repair-cost",
  },

  // Roofing
  roof_repair: {
    homeadvisor: "roofing/repair-a-roof",
    angi: "how-much-does-roof-repair-cost",
  },
  roof_leak: {
    homeadvisor: "roofing/repair-a-roof",
    angi: "how-much-does-it-cost-to-fix-a-roof-leak",
  },

  // Foundation
  foundation_repair: {
    homeadvisor: "foundations/repair-a-foundation",
    angi: "how-much-does-foundation-repair-cost",
  },
  foundation_crack: {
    homeadvisor: "foundations/repair-a-foundation",
    angi: "how-much-does-foundation-crack-repair-cost",
  },

  // Automotive
  car_battery: {
    angi: "how-much-does-car-battery-replacement-cost",
  },
  brake_repair: {
    angi: "how-much-does-brake-repair-cost",
  },

  // Appliances
  appliance_repair: {
    homeadvisor: "appliances/repair-an-appliance",
    angi: "how-much-does-appliance-repair-cost",
  },
  refrigerator_repair: {
    homeadvisor: "appliances/repair-a-refrigerator",
    angi: "how-much-does-refrigerator-repair-cost",
  },
  dishwasher_repair: {
    homeadvisor: "appliances/repair-a-dishwasher",
    angi: "how-much-does-dishwasher-repair-cost",
  },

  // Mold
  mold_removal: {
    homeadvisor: "environmental-safety/remove-mold",
    angi: "how-much-does-mold-remediation-cost",
  },

  // Painting
  interior_painting: {
    homeadvisor: "painting/paint-a-room-or-interior",
    angi: "how-much-does-interior-painting-cost",
  },

  // Flooring
  flooring_repair: {
    homeadvisor: "flooring/repair-flooring",
    angi: "how-much-does-floor-repair-cost",
  },
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get cost estimate for a service type and region.
 * Checks cache first, scrapes fresh data if stale/missing.
 */
export async function getCostEstimate(
  serviceType: string,
  zipCode: string
): Promise<CostEstimate | null> {
  // Normalize service type
  const normalizedService = normalizeServiceType(serviceType);

  // Get region (first 3 digits of zip for regional pricing)
  const region = zipCode.slice(0, 3);

  // Check cache first
  const cached = await getCachedCost(normalizedService, region);

  if (cached && !isExpired(cached)) {
    return formatCostData(cached);
  }

  // Try to scrape fresh data
  try {
    const freshData = await scrapeFreshCostData(normalizedService, region);
    if (freshData) {
      return formatCostData(freshData);
    }
  } catch (error) {
    console.error("[CostScraper] Failed to scrape fresh data:", error);
    Sentry.captureException(error, {
      extra: { tool: "getCostEstimate", serviceType: normalizedService, region },
    });
  }

  // Fall back to national average if no regional data
  const nationalCached = await getCachedCost(normalizedService, "national");
  if (nationalCached) {
    return formatCostData(nationalCached);
  }

  // No data available
  return null;
}

/**
 * Scrape cost guide page and extract pricing data
 */
export async function scrapeCostGuide(
  source: "homeadvisor" | "angi",
  serviceSlug: string
): Promise<Partial<NewCostData> | null> {
  const url =
    source === "homeadvisor"
      ? `https://www.homeadvisor.com/cost/${serviceSlug}/`
      : `https://www.angi.com/articles/${serviceSlug}.htm`;

  console.log(`[CostScraper] Scraping ${source}: ${url}`);

  Sentry.setContext("firecrawl", { feature: "scrapeCostGuide", url });

  try {
    const result = await scrapePage(url);

    if (!result.markdown) {
      console.warn(`[CostScraper] No content from ${url}`);
      return null;
    }

    // Parse the markdown content for cost data
    const parsed = parseCostContent(result.markdown, source);

    return {
      source,
      sourceUrl: url,
      rawContent: result.markdown,
      ...parsed,
    };
  } catch (error) {
    console.error(`[CostScraper] Error scraping ${url}:`, error);
    Sentry.captureException(error, { extra: { tool: "scrapeCostGuide", url, source } });
    return null;
  }
}

/**
 * Manually add cost data (for co-founder's research)
 */
export async function addManualCostData(
  data: Omit<NewCostData, "id" | "createdAt" | "updatedAt" | "scrapedAt">
): Promise<CostData> {
  const [inserted] = await db
    .insert(costData)
    .values({
      ...data,
      source: "manual",
      scrapedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    })
    .onConflictDoUpdate({
      target: [costData.serviceType, costData.region, costData.source],
      set: {
        diyMinCents: data.diyMinCents,
        diyMaxCents: data.diyMaxCents,
        diyAvgCents: data.diyAvgCents,
        proMinCents: data.proMinCents,
        proMaxCents: data.proMaxCents,
        proAvgCents: data.proAvgCents,
        costFactors: data.costFactors,
        timeEstimate: data.timeEstimate,
        updatedAt: new Date(),
        scrapedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })
    .returning();

  return inserted;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize service type to match our mapping
 */
function normalizeServiceType(input: string): string {
  // Convert to lowercase and replace spaces/hyphens with underscores
  const normalized = input.toLowerCase().replace(/[\s-]+/g, "_");

  // Check for direct match
  if (SERVICE_URL_MAP[normalized]) {
    return normalized;
  }

  // Check for partial matches
  for (const key of Object.keys(SERVICE_URL_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }

  // Common mappings
  const mappings: Record<string, string> = {
    ceiling: "ceiling_repair",
    drywall: "drywall_repair",
    plumbing: "plumbing_leak",
    hvac: "hvac_repair",
    ac: "hvac_repair",
    air_conditioning: "hvac_repair",
    roof: "roof_repair",
    foundation: "foundation_repair",
    mold: "mold_removal",
    painting: "interior_painting",
    floor: "flooring_repair",
    appliance: "appliance_repair",
  };

  for (const [pattern, serviceType] of Object.entries(mappings)) {
    if (normalized.includes(pattern)) {
      return serviceType;
    }
  }

  return normalized;
}

/**
 * Get cached cost data from database
 */
async function getCachedCost(
  serviceType: string,
  region: string
): Promise<CostData | null> {
  const results = await db
    .select()
    .from(costData)
    .where(
      and(eq(costData.serviceType, serviceType), eq(costData.region, region))
    )
    .limit(1);

  return results[0] || null;
}

/**
 * Check if cached data is expired
 */
function isExpired(data: CostData): boolean {
  if (!data.expiresAt) return true;
  return new Date() > data.expiresAt;
}

/**
 * Scrape fresh cost data and save to cache
 */
async function scrapeFreshCostData(
  serviceType: string,
  region: string
): Promise<CostData | null> {
  const urlConfig = SERVICE_URL_MAP[serviceType];
  if (!urlConfig) {
    console.warn(`[CostScraper] No URL mapping for service: ${serviceType}`);
    return null;
  }

  // Try HomeAdvisor first (usually has better data)
  if (urlConfig.homeadvisor) {
    const haData = await scrapeCostGuide("homeadvisor", urlConfig.homeadvisor);
    if (haData && (haData.proMinCents || haData.diyMinCents)) {
      return saveCostData(serviceType, region, haData);
    }
  }

  // Fall back to Angi
  if (urlConfig.angi) {
    const angiData = await scrapeCostGuide("angi", urlConfig.angi);
    if (angiData && (angiData.proMinCents || angiData.diyMinCents)) {
      return saveCostData(serviceType, region, angiData);
    }
  }

  return null;
}

/**
 * Save cost data to database
 */
async function saveCostData(
  serviceType: string,
  region: string,
  data: Partial<NewCostData>
): Promise<CostData> {
  const [inserted] = await db
    .insert(costData)
    .values({
      serviceType,
      region,
      source: data.source || "homeadvisor",
      sourceUrl: data.sourceUrl,
      diyMinCents: data.diyMinCents,
      diyMaxCents: data.diyMaxCents,
      diyAvgCents: data.diyAvgCents,
      proMinCents: data.proMinCents,
      proMaxCents: data.proMaxCents,
      proAvgCents: data.proAvgCents,
      costFactors: data.costFactors,
      timeEstimate: data.timeEstimate,
      rawContent: data.rawContent,
      sampleSize: data.sampleSize,
      scrapedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
    .onConflictDoUpdate({
      target: [costData.serviceType, costData.region, costData.source],
      set: {
        diyMinCents: data.diyMinCents,
        diyMaxCents: data.diyMaxCents,
        diyAvgCents: data.diyAvgCents,
        proMinCents: data.proMinCents,
        proMaxCents: data.proMaxCents,
        proAvgCents: data.proAvgCents,
        costFactors: data.costFactors,
        timeEstimate: data.timeEstimate,
        rawContent: data.rawContent,
        sampleSize: data.sampleSize,
        updatedAt: new Date(),
        scrapedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    .returning();

  console.log(`[CostScraper] Saved cost data for ${serviceType} in ${region}`);
  return inserted;
}

/**
 * Parse scraped markdown content for cost data
 */
function parseCostContent(
  markdown: string,
  source: string
): Partial<NewCostData> {
  const result: Partial<NewCostData> = {};

  // Extract cost ranges using regex patterns
  // Pattern: "$X - $Y" or "$X to $Y" or "between $X and $Y"
  const costRangePattern =
    /\$([0-9,]+)\s*(?:-|to|and)\s*\$([0-9,]+)/gi;
  const avgCostPattern =
    /(?:average|typical|national average)[:\s]*\$([0-9,]+)/gi;
  const sampleSizePattern =
    /(?:based on|from)\s*([0-9,]+)\s*(?:projects?|estimates?|homeowners?)/gi;

  // Find all cost mentions
  const costMatches = [...markdown.matchAll(costRangePattern)];

  if (costMatches.length > 0) {
    // First range is usually the main cost (professional)
    const [, minStr, maxStr] = costMatches[0];
    const min = parseInt(minStr.replace(/,/g, ""), 10);
    const max = parseInt(maxStr.replace(/,/g, ""), 10);

    result.proMinCents = min * 100;
    result.proMaxCents = max * 100;
    result.proAvgCents = Math.round(((min + max) / 2) * 100);
  }

  // Look for DIY costs (usually mentioned separately)
  const diyPattern =
    /(?:DIY|do.?it.?yourself|materials?.?(?:only|cost))[:\s]*\$([0-9,]+)\s*(?:-|to)?\s*\$?([0-9,]*)/gi;
  const diyMatch = diyPattern.exec(markdown);

  if (diyMatch) {
    const diyMin = parseInt(diyMatch[1].replace(/,/g, ""), 10);
    const diyMax = diyMatch[2]
      ? parseInt(diyMatch[2].replace(/,/g, ""), 10)
      : diyMin * 1.5;

    result.diyMinCents = diyMin * 100;
    result.diyMaxCents = Math.round(diyMax * 100);
    result.diyAvgCents = Math.round(((diyMin + diyMax) / 2) * 100);
  }

  // Extract average cost
  const avgMatch = avgCostPattern.exec(markdown);
  if (avgMatch && !result.proAvgCents) {
    result.proAvgCents = parseInt(avgMatch[1].replace(/,/g, ""), 10) * 100;
  }

  // Extract sample size
  const sampleMatch = sampleSizePattern.exec(markdown);
  if (sampleMatch) {
    result.sampleSize = parseInt(sampleMatch[1].replace(/,/g, ""), 10);
  }

  // Extract cost factors (bullet points or numbered lists)
  const factorPatterns = [
    /factors?.+?(?:include|affect|impact)[:\s]*\n((?:[-*•]\s*.+\n?)+)/gi,
    /(?:what affects|cost depends on)[:\s]*\n((?:[-*•]\s*.+\n?)+)/gi,
  ];

  for (const pattern of factorPatterns) {
    const factorMatch = pattern.exec(markdown);
    if (factorMatch) {
      const factors = factorMatch[1]
        .split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter((line) => line.length > 0 && line.length < 100);

      if (factors.length > 0) {
        result.costFactors = factors.slice(0, 10); // Max 10 factors
        break;
      }
    }
  }

  // Extract time estimates
  const timePattern =
    /(?:takes?|duration|time)[:\s]*([0-9]+(?:-[0-9]+)?)\s*(hours?|days?|weeks?)/gi;
  const timeMatch = timePattern.exec(markdown);
  if (timeMatch) {
    const timeStr = `${timeMatch[1]} ${timeMatch[2]}`;
    result.timeEstimate = { pro: timeStr };
  }

  return result;
}

/**
 * Format database record to CostEstimate response
 */
function formatCostData(data: CostData): CostEstimate {
  return {
    serviceType: data.serviceType,
    region: data.region,
    diy:
      data.diyMinCents || data.diyMaxCents || data.diyAvgCents
        ? {
            min: (data.diyMinCents || 0) / 100,
            max: (data.diyMaxCents || 0) / 100,
            avg: (data.diyAvgCents || 0) / 100,
          }
        : null,
    pro:
      data.proMinCents || data.proMaxCents || data.proAvgCents
        ? {
            min: (data.proMinCents || 0) / 100,
            max: (data.proMaxCents || 0) / 100,
            avg: (data.proAvgCents || 0) / 100,
          }
        : null,
    costFactors: data.costFactors || undefined,
    timeEstimate: data.timeEstimate || undefined,
    source: data.source,
    sourceUrl: data.sourceUrl || undefined,
    lastUpdated: data.scrapedAt,
    isEstimate: false,
  };
}

/**
 * Get all available service types
 */
export function getAvailableServiceTypes(): string[] {
  return Object.keys(SERVICE_URL_MAP);
}

/**
 * Bulk scrape all cost guides (for initial data population)
 * Use sparingly - consumes Firecrawl credits
 */
export async function bulkScrapeCostGuides(
  region: string = "national"
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const serviceType of Object.keys(SERVICE_URL_MAP)) {
    try {
      const data = await scrapeFreshCostData(serviceType, region);
      if (data) {
        success++;
      } else {
        failed++;
      }
      // Rate limit: wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[CostScraper] Failed to scrape ${serviceType}:`, error);
      Sentry.captureException(error, { extra: { tool: "bulkScrapeCostGuides", url: serviceType, region } });
      failed++;
    }
  }

  console.log(
    `[CostScraper] Bulk scrape complete: ${success} success, ${failed} failed`
  );
  return { success, failed };
}
