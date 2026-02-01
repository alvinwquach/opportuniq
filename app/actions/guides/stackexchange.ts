"use server";

/**
 * Stack Exchange API Server Actions
 *
 * Free API for DIY Q&A content from diy.stackexchange.com
 * Docs: https://api.stackexchange.com/docs
 *
 * No API key required for basic usage (300 requests/day).
 * With API key: 10,000 requests/day (register at https://stackapps.com)
 */

import type {
  UnifiedGuide,
  GuideSearchResponse,
  GuideDetailResponse,
} from "./types";

const STACKEXCHANGE_BASE_URL = "https://api.stackexchange.com/2.3";
const DIY_SITE = "diy"; // diy.stackexchange.com

// Stack Exchange API response types
interface StackExchangeQuestion {
  question_id: number;
  title: string;
  body?: string;
  body_markdown?: string;
  link: string;
  tags: string[];
  score: number;
  answer_count: number;
  view_count: number;
  is_answered: boolean;
  accepted_answer_id?: number;
  creation_date: number;
  last_activity_date: number;
  owner: {
    user_id?: number;
    display_name: string;
    reputation?: number;
    profile_image?: string;
  };
}

interface StackExchangeAnswer {
  answer_id: number;
  question_id: number;
  body?: string;
  body_markdown?: string;
  score: number;
  is_accepted: boolean;
  creation_date: number;
  owner: {
    user_id?: number;
    display_name: string;
    reputation?: number;
  };
}

interface StackExchangeResponse<T> {
  items: T[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

/**
 * Search DIY Stack Exchange for questions
 */
export async function searchStackExchangeQuestions(
  query: string,
  options?: {
    limit?: number;
    sort?: "relevance" | "votes" | "activity" | "creation";
    tagged?: string[];
  }
): Promise<GuideSearchResponse> {
  try {
    const limit = options?.limit ?? 10;
    const sort = options?.sort ?? "relevance";

    const params = new URLSearchParams({
      order: "desc",
      sort,
      site: DIY_SITE,
      pagesize: String(limit),
      filter: "withbody", // Include body content
      intitle: query,
    });

    // Add tag filter if specified
    if (options?.tagged?.length) {
      params.set("tagged", options.tagged.join(";"));
    }

    const url = `${STACKEXCHANGE_BASE_URL}/search/advanced?${params}`;

    const response = await fetch(url, {
      headers: {
        "Accept-Encoding": "gzip",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Stack Exchange API error: ${response.status}`);
    }

    const data: StackExchangeResponse<StackExchangeQuestion> = await response.json();

    const guides: UnifiedGuide[] = data.items
      .filter((q) => q.is_answered && q.answer_count > 0) // Only questions with answers
      .map((question) => ({
        id: `stackexchange-${question.question_id}`,
        externalId: String(question.question_id),
        source: "diy_stackexchange" as const,
        sourceUrl: question.link,
        title: decodeHtmlEntities(question.title),
        description: question.body
          ? stripHtml(question.body).slice(0, 300)
          : undefined,
        difficulty: estimateDifficultyFromTags(question.tags),
        viewCount: question.view_count,
        rating: question.score,
        author: question.owner.display_name,
        thumbnailUrl: question.owner.profile_image,
        fetchedAt: new Date().toISOString(),
        // Store extra metadata in a way that's accessible
        tags: question.tags,
        answerCount: question.answer_count,
        isAccepted: !!question.accepted_answer_id,
      }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
      quotaRemaining: data.quota_remaining,
    };
  } catch (error) {
    console.error("Stack Exchange search error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search Stack Exchange",
    };
  }
}

/**
 * Get a specific question with its answers
 */
export async function getStackExchangeQuestion(
  questionId: number
): Promise<GuideDetailResponse> {
  try {
    // Fetch question and answers in parallel
    const [questionResponse, answersResponse] = await Promise.all([
      fetch(
        `${STACKEXCHANGE_BASE_URL}/questions/${questionId}?site=${DIY_SITE}&filter=withbody`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `${STACKEXCHANGE_BASE_URL}/questions/${questionId}/answers?site=${DIY_SITE}&order=desc&sort=votes&filter=withbody`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    if (!questionResponse.ok || !answersResponse.ok) {
      throw new Error("Failed to fetch question or answers");
    }

    const questionData: StackExchangeResponse<StackExchangeQuestion> =
      await questionResponse.json();
    const answersData: StackExchangeResponse<StackExchangeAnswer> =
      await answersResponse.json();

    if (questionData.items.length === 0) {
      throw new Error("Question not found");
    }

    const question = questionData.items[0];
    const answers = answersData.items;

    // Convert answers to steps (best answer first)
    const sortedAnswers = [...answers].sort((a, b) => {
      // Accepted answer first, then by score
      if (a.is_accepted && !b.is_accepted) return -1;
      if (!a.is_accepted && b.is_accepted) return 1;
      return b.score - a.score;
    });

    const guide: UnifiedGuide = {
      id: `stackexchange-${question.question_id}`,
      externalId: String(question.question_id),
      source: "diy_stackexchange",
      sourceUrl: question.link,
      title: decodeHtmlEntities(question.title),
      description: question.body ? stripHtml(question.body) : undefined,
      difficulty: estimateDifficultyFromTags(question.tags),
      viewCount: question.view_count,
      rating: question.score,
      author: question.owner.display_name,
      steps: sortedAnswers.map((answer, index) => ({
        stepNumber: index + 1,
        title: answer.is_accepted
          ? `Accepted Answer (${answer.score} votes)`
          : `Answer ${index + 1} (${answer.score} votes)`,
        instruction: answer.body ? stripHtml(answer.body) : "",
        tips: answer.is_accepted ? ["This answer was accepted by the question author"] : undefined,
      })),
      fetchedAt: new Date().toISOString(),
    };

    return {
      success: true,
      guide,
    };
  } catch (error) {
    console.error("Stack Exchange get question error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get question",
    };
  }
}

/**
 * Get popular/hot questions from DIY Stack Exchange
 */
export async function getStackExchangePopularQuestions(
  limit = 10
): Promise<GuideSearchResponse> {
  try {
    const params = new URLSearchParams({
      order: "desc",
      sort: "votes",
      site: DIY_SITE,
      pagesize: String(limit),
      filter: "withbody",
    });

    const url = `${STACKEXCHANGE_BASE_URL}/questions?${params}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Stack Exchange API error: ${response.status}`);
    }

    const data: StackExchangeResponse<StackExchangeQuestion> = await response.json();

    const guides: UnifiedGuide[] = data.items
      .filter((q) => q.is_answered)
      .map((question) => ({
        id: `stackexchange-${question.question_id}`,
        externalId: String(question.question_id),
        source: "diy_stackexchange" as const,
        sourceUrl: question.link,
        title: decodeHtmlEntities(question.title),
        description: question.body
          ? stripHtml(question.body).slice(0, 300)
          : undefined,
        difficulty: estimateDifficultyFromTags(question.tags),
        viewCount: question.view_count,
        rating: question.score,
        author: question.owner.display_name,
        fetchedAt: new Date().toISOString(),
      }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
    };
  } catch (error) {
    console.error("Stack Exchange popular error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to get popular questions",
    };
  }
}

/**
 * Search by specific tags (e.g., "plumbing", "electrical", "hvac")
 */
export async function searchStackExchangeByTags(
  tags: string[],
  options?: { limit?: number }
): Promise<GuideSearchResponse> {
  try {
    const limit = options?.limit ?? 10;

    const params = new URLSearchParams({
      order: "desc",
      sort: "votes",
      site: DIY_SITE,
      pagesize: String(limit),
      filter: "withbody",
      tagged: tags.join(";"),
    });

    const url = `${STACKEXCHANGE_BASE_URL}/questions?${params}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Stack Exchange API error: ${response.status}`);
    }

    const data: StackExchangeResponse<StackExchangeQuestion> = await response.json();

    const guides: UnifiedGuide[] = data.items
      .filter((q) => q.is_answered)
      .map((question) => ({
        id: `stackexchange-${question.question_id}`,
        externalId: String(question.question_id),
        source: "diy_stackexchange" as const,
        sourceUrl: question.link,
        title: decodeHtmlEntities(question.title),
        description: question.body
          ? stripHtml(question.body).slice(0, 300)
          : undefined,
        difficulty: estimateDifficultyFromTags(question.tags),
        viewCount: question.view_count,
        rating: question.score,
        author: question.owner.display_name,
        fetchedAt: new Date().toISOString(),
      }));

    return {
      success: true,
      guides,
      totalResults: guides.length,
    };
  } catch (error) {
    console.error("Stack Exchange tag search error:", error);
    return {
      success: false,
      guides: [],
      error: error instanceof Error ? error.message : "Failed to search by tags",
    };
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Estimate difficulty from tags
 */
function estimateDifficultyFromTags(tags: string[]): string | undefined {
  const hardTags = ["electrical", "electrical-panel", "circuit-breaker", "wiring", "gas", "structural"];
  const mediumTags = ["plumbing", "hvac", "drywall", "roofing", "framing"];
  const easyTags = ["painting", "caulking", "faucet", "toilet", "door", "window"];

  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  if (hardTags.some((t) => tagSet.has(t))) return "advanced";
  if (mediumTags.some((t) => tagSet.has(t))) return "intermediate";
  if (easyTags.some((t) => tagSet.has(t))) return "beginner";

  return undefined;
}
