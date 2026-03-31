// Tell Next.js this entire module runs only on the server (Node.js),
// never in the browser — this keeps DB credentials and server logic off the client.
"use server";

// createClient: factory that creates a Supabase auth client scoped to the current
// HTTP request, so we can identify which user is logged in via their session cookie.
import { createClient } from "@/lib/supabase/server";
// db: the Drizzle ORM instance that talks to our PostgreSQL database.
import { db } from "@/app/db/client";
// diyGuides: the Drizzle table definition for the "diy_guides" table —
// importing it lets us write type-safe queries against that table.
import { diyGuides } from "@/app/db/schema";
// eq: builds a SQL "WHERE col = value" condition.
// desc: builds an "ORDER BY col DESC" clause so newest records come first.
import { eq, desc } from "drizzle-orm";

// SOURCE_MAP: a lookup table that normalises the raw source strings stored in the DB
// (e.g. "family_handyman") into the shorter, consistent keys the UI components expect.
// Any source not listed here falls back to "other".
const SOURCE_MAP: Record<string, string> = {
  reddit: "reddit", diy_stackexchange: "other", instructables: "instructables",
  family_handyman: "familyHandyman", this_old_house: "thisOldHouse", bob_vila: "other",
  doityourself: "other", hometalk: "other", diy_chatroom: "other", youtube: "youtube", ifixit: "ifixit",
};
// DIFFICULTY_OPTIONS: the three valid difficulty labels used to assign a difficulty
// to each guide via a round-robin index (index % 3), because the DB doesn't store difficulty directly.
const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced"] as const;
// monthNames: short month labels used when building the savingsOverTime chart data.
// Index 0 = January, index 11 = December, matching JavaScript's getMonth() return values.
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// getTimeEstimate: derives a human-readable time estimate string based on the source of
// a guide, since different platforms have characteristically different content lengths.
// YouTube videos tend to be short; iFixit step-by-step guides take longer; everything else is middle-ground.
function getTimeEstimate(source: string): string {
  if (source === "youtube") return "10-30 min";
  if (source === "ifixit") return "30-60 min";
  return "15-45 min";
}

// getGuidesPageData: the single server action that fetches every piece of data
// needed to render the Guides dashboard page. Running it server-side means the
// client receives ready-to-use data in one round-trip instead of many.
export async function getGuidesPageData() {
  // Create a Supabase auth client tied to this request's cookies/session.
  const supabase = await createClient();
  // Ask Supabase who the currently logged-in user is.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no authenticated user, bail out immediately with an error
  // rather than attempting to query data that belongs to someone else.
  if (!user) throw new Error("Unauthorized");

  // Query the diy_guides table for every guide that belongs to the current user,
  // sorted newest-first so the most recently saved guides appear at the top.
  const allGuides = await db.select().from(diyGuides)
    .where(eq(diyGuides.userId, user.id)).orderBy(desc(diyGuides.createdAt));

  // Transform each raw database guide row into the shape the UI components consume.
  // We derive several computed fields here because they are not stored directly in the DB.
  const guides = allGuides.map((guide, index) => {
    // Normalise the source string using SOURCE_MAP; fall back to "other" if unrecognised.
    const source = SOURCE_MAP[guide.source] || "other";
    // Determine whether the guide is a video by checking both the normalised source
    // and the raw URL, because some video links may come from sources not yet in SOURCE_MAP.
    const isVideo = source === "youtube" || guide.url.includes("youtube.com") || guide.url.includes("youtu.be");
    // Pick the most specific category label available; fall back to "Other" if neither is set.
    const category = guide.issueCategory || guide.focusArea || "Other";
    // Assign difficulty by cycling through the three options using the guide's array position.
    // This is a placeholder until difficulty is stored properly in the DB.
    const difficulty = DIFFICULTY_OPTIONS[index % 3];
    // Convert the relevanceScore (0–100 scale from the AI) to a 1–5 star rating.
    // We add 3 as a base offset so even low-scoring guides show at least 3 stars,
    // then cap the result at 5 to avoid going over the maximum.
    const rating = guide.relevanceScore ? Math.min(5, guide.relevanceScore / 20 + 3) : null;
    // Derive an approximate view count from the upvotes field (upvotes × 10),
    // giving the UI a sense of popularity when actual view data isn't available.
    const viewCount = guide.upvotes ? guide.upvotes * 10 : null;
    // Map the user's interaction flags to a progress percentage:
    // wasHelpful means the user completed it (100%), wasClicked means started (50%), neither = not started.
    const progress = guide.wasHelpful ? 100 : guide.wasClicked ? 50 : null;
    // Map the same interaction flags to a step count out of a fixed total of 5 steps.
    const completedSteps = guide.wasHelpful ? 5 : guide.wasClicked ? 2 : null;
    return {
      id: guide.id, title: guide.title, description: guide.excerpt, url: guide.url, source, category,
      difficulty, timeEstimate: getTimeEstimate(guide.source), rating, viewCount, isVideo,
      isBookmarked: guide.wasBookmarked, progress, completedSteps, totalSteps: 5,
      // If the guide came from Reddit, prefix the subreddit name with "r/" as the author label.
      author: guide.subreddit ? `r/${guide.subreddit}` : null,
      // Convert the DB timestamp (a JS Date) to an ISO 8601 string so it is serialisable
      // when passed from the server action to the client.
      createdAt: guide.createdAt.toISOString(),
    };
  });

  // Count guides where the user marked them as fully completed (progress === 100).
  const completedCount = guides.filter((g) => g.progress === 100).length;
  // Count guides that are started but not yet finished (progress between 1 and 99 inclusive).
  const inProgressCount = guides.filter((g) => g.progress && g.progress > 0 && g.progress < 100).length;
  // Count guides the user has bookmarked for later reference.
  const savedCount = guides.filter((g) => g.isBookmarked).length;
  // Estimate total time saved: each completed guide is assumed to have saved 2 hours of
  // professional research or paid labour time.
  const timeSavedHours = completedCount * 2;
  // Format the time-saved value: if it totals 24 hours or more, display it in days;
  // otherwise display it in hours — keeping the label compact for the stats card.
  const timeSaved = timeSavedHours >= 24 ? `${Math.round(timeSavedHours / 24)}d` : `${timeSavedHours}h`;
  // Bundle all the summary statistics into a single object for the stats card UI.
  // totalSaved is 0 for now because monetary savings tracking for guides is not yet implemented.
  const stats = { completedCount, inProgressCount, savedCount, totalGuides: guides.length, totalSaved: 0, timeSaved };

  // Capture the current date/time once so all chart calculations use the same reference point.
  const now = new Date();
  // Build a 6-month savings trend array for the chart.
  // Starting index 5 means we go back 5 months from today; ending at 0 means the current month.
  const savingsOverTime = [];
  for (let i = 5; i >= 0; i--) {
    // Calculate the first day of the target month by subtracting i months from the current month.
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // Push a data point with the month label and zeroed-out values.
    // Saved and wouldCost are 0 because guide-specific monetary savings are not tracked yet.
    savingsOverTime.push({ month: monthNames[targetMonth.getMonth()], saved: 0, wouldCost: 0 });
  }

  // Collect every unique, non-"Other" category across all guides and sort them alphabetically.
  // This powers the category filter dropdown in the UI.
  const categories = [...new Set(guides.map((g) => g.category).filter((c) => c !== "Other"))].sort();
  // Collect every unique source identifier across all guides.
  // This powers the source filter dropdown in the UI.
  const sources = [...new Set(guides.map((g) => g.source))] as string[];

  // Return the complete page payload. The TanStack Query hook in lib/hooks/ will
  // cache this and distribute the individual fields to each React component that needs them.
  return { guides, stats, savingsOverTime, categories, sources };
}
