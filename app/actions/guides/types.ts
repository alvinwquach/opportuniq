"use server";

/**
 * Types for external guide sources (iFixit, YouTube, Firecrawl)
 */

// ============================================
// iFixit Types
// ============================================

export interface IFixitGuide {
  guideid: number;
  title: string;
  type: string;
  category: string;
  subject: string;
  summary: string;
  difficulty: string;
  time_required: string;
  time_required_min: number;
  time_required_max: number;
  steps: IFixitStep[];
  tools: IFixitTool[];
  parts: IFixitPart[];
  image: IFixitImage;
  url: string;
  author: {
    userid: number;
    username: string;
  };
  locale: string;
  public: boolean;
  conclusion_raw: string;
  introduction_raw: string;
}

export interface IFixitStep {
  stepid: number;
  orderby: number;
  title: string;
  lines: {
    text_raw: string;
    bullet: string;
    level: number;
  }[];
  media: {
    type: string;
    data: IFixitImage[];
  };
}

export interface IFixitTool {
  text: string;
  url?: string;
  thumbnail?: string;
  notes?: string;
}

export interface IFixitPart {
  text: string;
  url?: string;
  thumbnail?: string;
  notes?: string;
}

export interface IFixitImage {
  id: number;
  guid: string;
  mini: string;
  thumbnail: string;
  standard: string;
  medium: string;
  large: string;
  huge: string;
  original: string;
}

export interface IFixitSearchResult {
  guideid: number;
  title: string;
  type: string;
  category: string;
  url: string;
  image: IFixitImage;
  summary: string;
  difficulty: string;
  time_required: string;
}

export interface IFixitCategory {
  title: string;
  display_title: string;
  description: string;
  image: IFixitImage;
  guides_count: number;
}

// ============================================
// YouTube Types
// ============================================

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  tags?: string[];
}

// ============================================
// Firecrawl Types
// ============================================

export interface FirecrawlGuide {
  url: string;
  title: string;
  description?: string;
  steps: FirecrawlStep[];
  tools?: string[];
  materials?: string[];
  difficulty?: string;
  timeEstimate?: string;
  author?: string;
  publishedDate?: string;
  source: "family_handyman" | "this_old_house" | "bob_vila" | "other";
  images?: string[];
  warnings?: string[];
  tips?: string[];
}

export interface FirecrawlStep {
  stepNumber: number;
  title?: string;
  instruction: string;
  imageUrl?: string;
  tip?: string;
  warning?: string;
}

export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  source: string;
}

// ============================================
// Unified Guide Type (for storage/display)
// ============================================

export interface UnifiedGuide {
  id: string;
  externalId: string;
  source: "ifixit" | "youtube" | "family_handyman" | "this_old_house" | "bob_vila" | "diy_stackexchange" | "instructables" | "other";
  sourceUrl: string;
  title: string;
  description?: string;
  difficulty?: string;
  timeEstimate?: string;
  tools?: string[];
  materials?: string[];
  steps?: UnifiedStep[];
  thumbnailUrl?: string;
  author?: string;
  viewCount?: number;
  rating?: number;
  fetchedAt: string;
  // Stack Exchange specific
  tags?: string[];
  answerCount?: number;
  isAccepted?: boolean;
}

export interface UnifiedStep {
  stepNumber: number;
  title?: string;
  instruction: string;
  imageUrl?: string;
  videoUrl?: string;
  warnings?: string[];
  tips?: string[];
}

// ============================================
// API Response Types
// ============================================

export interface GuideSearchResponse {
  success: boolean;
  guides: UnifiedGuide[];
  totalResults?: number;
  error?: string;
  // Stack Exchange specific
  quotaRemaining?: number;
}

export interface GuideDetailResponse {
  success: boolean;
  guide?: UnifiedGuide;
  error?: string;
}
