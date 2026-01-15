"use server";

import { db } from "@/app/db/client";
import { diyGuides } from "@/app/db/schema";
import { getCurrentUser } from "@/lib/supabase/server";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

export interface GuideSearchResult {
  id: string;
  title: string;
  url: string;
  source: string;
  subreddit: string | null;
  upvotes: number | null;
  commentCount: number | null;
  excerpt: string | null;
  relevanceScore: number | null;
  focusArea: string | null;
  issueCategory: string | null;
  wasBookmarked: boolean;
  wasHelpful: boolean | null;
  createdAt: Date;
}

export async function getUserGuides(): Promise<{
  bookmarked: GuideSearchResult[];
  recent: GuideSearchResult[];
  helpful: GuideSearchResult[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { bookmarked: [], recent: [], helpful: [] };
  }

  const [bookmarked, recent, helpful] = await Promise.all([
    // Bookmarked guides
    db
      .select()
      .from(diyGuides)
      .where(and(eq(diyGuides.userId, user.id), eq(diyGuides.wasBookmarked, true)))
      .orderBy(desc(diyGuides.createdAt))
      .limit(20),

    // Recent guides (clicked)
    db
      .select()
      .from(diyGuides)
      .where(and(eq(diyGuides.userId, user.id), eq(diyGuides.wasClicked, true)))
      .orderBy(desc(diyGuides.clickedAt))
      .limit(10),

    // Helpful guides
    db
      .select()
      .from(diyGuides)
      .where(and(eq(diyGuides.userId, user.id), eq(diyGuides.wasHelpful, true)))
      .orderBy(desc(diyGuides.createdAt))
      .limit(10),
  ]);

  return {
    bookmarked: bookmarked as GuideSearchResult[],
    recent: recent as GuideSearchResult[],
    helpful: helpful as GuideSearchResult[],
  };
}

export async function searchGuides(query: string): Promise<GuideSearchResult[]> {
  const user = await getCurrentUser();
  if (!user || !query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  const results = await db
    .select()
    .from(diyGuides)
    .where(
      and(
        eq(diyGuides.userId, user.id),
        or(
          ilike(diyGuides.title, searchTerm),
          ilike(diyGuides.excerpt, searchTerm),
          ilike(diyGuides.issueCategory, searchTerm),
          ilike(diyGuides.searchQuery, searchTerm)
        )
      )
    )
    .orderBy(desc(diyGuides.relevanceScore), desc(diyGuides.createdAt))
    .limit(20);

  return results as GuideSearchResult[];
}

export async function toggleGuideBookmark(guideId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const [guide] = await db
    .select({ wasBookmarked: diyGuides.wasBookmarked })
    .from(diyGuides)
    .where(and(eq(diyGuides.id, guideId), eq(diyGuides.userId, user.id)))
    .limit(1);

  if (!guide) {
    return false;
  }

  await db
    .update(diyGuides)
    .set({ wasBookmarked: !guide.wasBookmarked })
    .where(eq(diyGuides.id, guideId));

  return !guide.wasBookmarked;
}

export async function markGuideClicked(guideId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await db
    .update(diyGuides)
    .set({ wasClicked: true, clickedAt: new Date() })
    .where(and(eq(diyGuides.id, guideId), eq(diyGuides.userId, user.id)));
}
