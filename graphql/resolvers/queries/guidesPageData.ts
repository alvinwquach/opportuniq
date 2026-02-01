/**
 * Guides Page Data Resolver
 *
 * Fetches comprehensive data for the guides page view.
 */

import { eq, desc, and, sql } from "drizzle-orm";
import { diyGuides, decisionOutcomes } from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Source mapping from database values to GraphQL enum values
const SOURCE_MAP: Record<string, string> = {
  reddit: "reddit",
  diy_stackexchange: "other",
  instructables: "instructables",
  family_handyman: "familyHandyman",
  this_old_house: "thisOldHouse",
  bob_vila: "other",
  doityourself: "other",
  hometalk: "other",
  diy_chatroom: "other",
  youtube: "youtube",
  ifixit: "ifixit",
};

// Difficulty options based on index
const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced"] as const;

// Get time estimate based on source/category
function getTimeEstimate(source: string): string {
  switch (source) {
    case "youtube":
      return "10-30 min";
    case "ifixit":
      return "30-60 min";
    default:
      return "15-45 min";
  }
}

export async function guidesPageDataResolver(
  _: unknown,
  __: unknown,
  ctx: Context
) {
  requireAuth(ctx);

  // Fetch all user's guides
  const allGuides = await ctx.db
    .select()
    .from(diyGuides)
    .where(eq(diyGuides.userId, ctx.userId))
    .orderBy(desc(diyGuides.createdAt));

  // Transform guides to GuideDetail format
  const guides = allGuides.map((guide, index) => {
    const source = SOURCE_MAP[guide.source] || "other";
    const isVideo =
      source === "youtube" ||
      guide.url.includes("youtube.com") ||
      guide.url.includes("youtu.be");

    // Determine category from issue category or focus area
    const category = guide.issueCategory || guide.focusArea || "Other";

    // Assign difficulty based on index (could be enhanced with real data)
    const difficulty = DIFFICULTY_OPTIONS[index % 3];

    // Calculate rating from relevance score if available
    const rating = guide.relevanceScore
      ? Math.min(5, guide.relevanceScore / 20 + 3)
      : null;

    // Calculate view count from upvotes if available
    const viewCount = guide.upvotes ? guide.upvotes * 10 : null;

    // Determine progress based on helpful status
    const progress = guide.wasHelpful ? 100 : guide.wasClicked ? 50 : null;
    const completedSteps = guide.wasHelpful ? 5 : guide.wasClicked ? 2 : null;

    return {
      id: guide.id,
      title: guide.title,
      description: guide.excerpt,
      url: guide.url,
      source,
      category,
      difficulty,
      timeEstimate: getTimeEstimate(guide.source),
      rating,
      viewCount,
      isVideo,
      isBookmarked: guide.wasBookmarked,
      progress,
      completedSteps,
      totalSteps: 5,
      author: guide.subreddit ? `r/${guide.subreddit}` : null,
      createdAt: guide.createdAt,
    };
  });

  // Calculate stats
  const completedCount = guides.filter((g) => g.progress === 100).length;
  const inProgressCount = guides.filter(
    (g) => g.progress && g.progress > 0 && g.progress < 100
  ).length;
  const savedCount = guides.filter((g) => g.isBookmarked).length;

  // Calculate total savings from helpful guides
  const totalSaved = allGuides.reduce((sum, g) => {
    return sum + parseFloat(g.estimatedSavings ?? "0");
  }, 0);

  // Estimate time saved (assume 2 hours per completed guide)
  const timeSavedHours = completedCount * 2;
  const timeSaved =
    timeSavedHours >= 24
      ? `${Math.round(timeSavedHours / 24)}d`
      : `${timeSavedHours}h`;

  const stats = {
    completedCount,
    inProgressCount,
    savedCount,
    totalGuides: guides.length,
    totalSaved,
    timeSaved,
  };

  // Generate savings over time data (last 6 months)
  const now = new Date();
  const savingsOverTime = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 5; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthGuides = allGuides.filter((g) => {
      const guideDate = new Date(g.createdAt);
      return (
        guideDate.getMonth() === targetMonth.getMonth() &&
        guideDate.getFullYear() === targetMonth.getFullYear()
      );
    });

    const saved = monthGuides.reduce((sum, g) => {
      return sum + parseFloat(g.estimatedSavings ?? "0");
    }, 0);

    // Estimate what it would have cost (saved + typical pro cost markup)
    const wouldCost = saved > 0 ? saved * 2.5 : 0;

    savingsOverTime.push({
      month: monthNames[targetMonth.getMonth()],
      saved,
      wouldCost,
    });
  }

  // Get unique categories
  const categories = [
    ...new Set(guides.map((g) => g.category).filter((c) => c !== "Other")),
  ].sort();

  // Get unique sources
  const sources = [
    ...new Set(guides.map((g) => g.source)),
  ] as string[];

  return {
    guides,
    stats,
    savingsOverTime,
    categories,
    sources,
  };
}
