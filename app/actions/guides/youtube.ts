"use server";

/**
 * YouTube Data API v3 Server Actions
 *
 * Free tier: 10,000 quota units/day
 * - Search: 100 units per request (~100 searches/day)
 * - Video details: 1 unit per request
 *
 * Docs: https://developers.google.com/youtube/v3/getting-started
 */

import type {
  YouTubeSearchResult,
  YouTubeVideoDetails,
  UnifiedGuide,
  GuideSearchResponse,
  GuideDetailResponse,
} from "./types";

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }
  return apiKey;
}

/**
 * Search YouTube for DIY/repair videos
 *
 * Cost: 100 quota units per search
 */
export async function searchYouTubeVideos(
  query: string,
  options?: {
    maxResults?: number;
    pageToken?: string;
    relevanceLanguage?: string;
  }
): Promise<GuideSearchResponse & { nextPageToken?: string }> {
  try {
    const apiKey = getApiKey();
    const maxResults = options?.maxResults ?? 10;

    // Add "DIY" or "how to" to improve relevance for repair content
    const enhancedQuery = query.toLowerCase().includes("how to")
      ? query
      : `how to ${query} DIY repair`;

    const params = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      q: enhancedQuery,
      maxResults: String(maxResults),
      relevanceLanguage: options?.relevanceLanguage ?? "en",
      videoDuration: "medium", // 4-20 minutes (good for tutorials)
      videoEmbeddable: "true",
      safeSearch: "moderate",
    });

    if (options?.pageToken) {
      params.append("pageToken", options.pageToken);
    }

    const url = `${YOUTUBE_BASE_URL}/search?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const guides: UnifiedGuide[] = data.items.map((item: {
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
          high?: { url: string };
          medium?: { url: string };
          default?: { url: string };
        };
      };
    }) => ({
      id: `youtube-${item.id.videoId}`,
      externalId: item.id.videoId,
      source: "youtube" as const,
      sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      author: item.snippet.channelTitle,
      fetchedAt: new Date().toISOString(),
    }));

    return {
      success: true,
      guides,
      totalResults: data.pageInfo?.totalResults,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search YouTube",
    };
  }
}

/**
 * Get YouTube video details by ID
 *
 * Cost: 1 quota unit per video
 */
export async function getYouTubeVideoDetails(
  videoId: string
): Promise<GuideDetailResponse> {
  try {
    const apiKey = getApiKey();

    const params = new URLSearchParams({
      key: apiKey,
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    const url = `${YOUTUBE_BASE_URL}/videos?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        error: "Video not found",
      };
    }

    const item = data.items[0];
    const details: YouTubeVideoDetails = {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails.duration,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
      thumbnails: item.snippet.thumbnails,
      tags: item.snippet.tags,
    };

    // Parse duration (ISO 8601 format: PT1H30M15S)
    const durationMatch = details.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    let timeEstimate = "";
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || "0");
      const minutes = parseInt(durationMatch[2] || "0");
      const seconds = parseInt(durationMatch[3] || "0");
      if (hours > 0) {
        timeEstimate = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        timeEstimate = `${minutes} min`;
      } else {
        timeEstimate = `${seconds}s`;
      }
    }

    const guide: UnifiedGuide = {
      id: `youtube-${details.videoId}`,
      externalId: details.videoId,
      source: "youtube",
      sourceUrl: `https://www.youtube.com/watch?v=${details.videoId}`,
      title: details.title,
      description: details.description,
      timeEstimate,
      thumbnailUrl:
        details.thumbnails?.maxres?.url ||
        details.thumbnails?.high?.url ||
        details.thumbnails?.medium?.url,
      author: details.channelTitle,
      viewCount: parseInt(details.viewCount || "0"),
      fetchedAt: new Date().toISOString(),
      // YouTube videos don't have structured steps, but we can provide the video as a single "step"
      steps: [
        {
          stepNumber: 1,
          title: "Watch Video Tutorial",
          instruction: details.description,
          videoUrl: `https://www.youtube.com/embed/${details.videoId}`,
        },
      ],
    };

    return {
      success: true,
      guide,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get video details",
    };
  }
}

/**
 * Search for repair videos by appliance/device type
 */
export async function searchRepairVideos(
  deviceOrIssue: string,
  options?: {
    maxResults?: number;
    specificModel?: string;
  }
): Promise<GuideSearchResponse> {
  const query = options?.specificModel
    ? `${options.specificModel} ${deviceOrIssue} repair tutorial`
    : `${deviceOrIssue} repair DIY tutorial`;

  return searchYouTubeVideos(query, {
    maxResults: options?.maxResults ?? 5,
  });
}

/**
 * Get popular home repair channels' videos
 *
 * Searches videos from known quality DIY channels
 */
export async function getPopularRepairVideos(
  topic?: string
): Promise<GuideSearchResponse> {
  // Search with topic or general home repair
  const query = topic
    ? `${topic} home repair tutorial`
    : "home repair DIY tutorial";

  return searchYouTubeVideos(query, {
    maxResults: 10,
  });
}

/**
 * Get video embed URL (for displaying in app)
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    start?: number; // Start time in seconds
    modestbranding?: boolean;
    rel?: boolean; // Show related videos
  }
): string {
  const params = new URLSearchParams();

  if (options?.autoplay) params.append("autoplay", "1");
  if (options?.start) params.append("start", String(options.start));
  if (options?.modestbranding !== false) params.append("modestbranding", "1");
  if (options?.rel === false) params.append("rel", "0");

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;
}
