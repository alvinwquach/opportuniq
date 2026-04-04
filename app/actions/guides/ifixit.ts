"use server";

/**
 * iFixit API Server Actions
 *
 * Free API for device/appliance repair guides.
 * Docs: https://www.ifixit.com/api/2.0/doc/
 *
 * No API key required for public endpoints.
 */

import type {
  IFixitGuide,
  IFixitSearchResult,
  IFixitCategory,
  UnifiedGuide,
  UnifiedStep,
  GuideSearchResponse,
  GuideDetailResponse,
} from "./types";

const IFIXIT_BASE_URL = "https://www.ifixit.com/api/2.0";

/**
 * Search iFixit guides by query
 */
export async function searchIFixitGuides(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<GuideSearchResponse> {
  try {
    const limit = options?.limit ?? 10;
    const offset = options?.offset ?? 0;

    const url = `${IFIXIT_BASE_URL}/search/${encodeURIComponent(query)}?filter=guide&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`iFixit API error: ${response.status}`);
    }

    const data = await response.json();

    // iFixit search returns results in different formats
    const results: IFixitSearchResult[] = data.results || [];

    const guides: UnifiedGuide[] = results.map((result) => ({
      id: `ifixit-${result.guideid}`,
      externalId: String(result.guideid),
      source: "ifixit" as const,
      sourceUrl: result.url || `https://www.ifixit.com/Guide/${result.guideid}`,
      title: result.title,
      description: result.summary,
      difficulty: result.difficulty,
      timeEstimate: result.time_required,
      thumbnailUrl: result.image?.standard,
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: data.totalResults || guides.length,
    };
  } catch (error) {
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search iFixit",
    };
  }
}

/**
 * Get a specific iFixit guide by ID
 */
export async function getIFixitGuide(guideId: number): Promise<GuideDetailResponse> {
  try {
    const url = `${IFIXIT_BASE_URL}/guides/${guideId}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`iFixit API error: ${response.status}`);
    }

    const data: IFixitGuide = await response.json();

    // Transform steps
    const steps: UnifiedStep[] = data.steps.map((step, index) => ({
      stepNumber: index + 1,
      title: step.title || `Step ${index + 1}`,
      instruction: step.lines.map((line) => line.text_raw).join("\n"),
      imageUrl: step.media?.data?.[0]?.standard,
    }));

    const guide: UnifiedGuide = {
      id: `ifixit-${data.guideid}`,
      externalId: String(data.guideid),
      source: "ifixit",
      sourceUrl: data.url || `https://www.ifixit.com/Guide/${data.guideid}`,
      title: data.title,
      description: data.summary || data.introduction_raw,
      difficulty: data.difficulty,
      timeEstimate: data.time_required,
      tools: data.tools?.map((t) => t.text) || [],
      materials: data.parts?.map((p) => p.text) || [],
      steps,
      thumbnailUrl: data.image?.standard,
      author: data.author?.username,
      fetchedAt: new Date().toISOString(),
    };

    return {
      success: true,
      guide,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get iFixit guide",
    };
  }
}

/**
 * Get iFixit categories (for browsing)
 */
export async function getIFixitCategories(): Promise<{
  success: boolean;
  categories: IFixitCategory[];
  error?: string;
}> {
  try {
    const url = `${IFIXIT_BASE_URL}/categories`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`iFixit API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the nested category structure into flat list
    const categories: IFixitCategory[] = [];

    const flattenCategories = (obj: Record<string, unknown>, depth = 0) => {
      if (depth > 2) return; // Limit depth

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null) {
          categories.push({
            title: key,
            display_title: key,
            description: "",
            image: {} as IFixitCategory["image"],
            guides_count: 0,
          });
          flattenCategories(value as Record<string, unknown>, depth + 1);
        }
      }
    };

    flattenCategories(data);

    return {
      success: true,
      categories,
    };
  } catch (error) {
    return {
      success: false,
      categories: [],
      error: error instanceof Error ? error.message : "Failed to get iFixit categories",
    };
  }
}

/**
 * Get guides by category
 */
export async function getIFixitGuidesByCategory(
  category: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<GuideSearchResponse> {
  try {
    const limit = options?.limit ?? 10;
    const offset = options?.offset ?? 0;

    const url = `${IFIXIT_BASE_URL}/categories/${encodeURIComponent(category)}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`iFixit API error: ${response.status}`);
    }

    const data = await response.json();

    // Get guides from category data
    const guideIds: number[] = data.guides || [];

    // Fetch each guide (limited for performance)
    const guidesToFetch = guideIds.slice(offset, offset + limit);
    const guidePromises = guidesToFetch.map((id) => getIFixitGuide(id));
    const guideResults = await Promise.all(guidePromises);

    const guides: UnifiedGuide[] = guideResults
      .filter((r) => r.success && r.guide)
      .map((r) => r.guide!);

    return {
      success: true,
      guides,
      totalResults: guideIds.length,
    };
  } catch (error) {
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to get category guides",
    };
  }
}

/**
 * Get popular/featured guides from iFixit
 */
export async function getIFixitPopularGuides(
  limit = 10
): Promise<GuideSearchResponse> {
  // iFixit doesn't have a "popular" endpoint, so we search for common repairs
  const commonSearches = [
    "screen replacement",
    "battery replacement",
    "keyboard repair",
  ];

  const randomSearch = commonSearches[Math.floor(Math.random() * commonSearches.length)];
  return searchIFixitGuides(randomSearch, { limit });
}
