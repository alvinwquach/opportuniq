// This directive tells Next.js that every exported function in this file
// is a Server Action — code that runs only on the server. The browser never
// executes these functions directly; Next.js serialises the call over the
// network automatically when a React component or hook invokes one.
"use server";

// Import the factory function that creates a Supabase client suitable for
// server-side use, reading the current user's session from HTTP-only cookies.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client. All SQL queries in this file
// are executed through this object.
import { db } from "@/app/db/client";

// Import the database table definitions and enum this file works with:
//   diyGuides         — table of AI-generated or scraped DIY repair guides for a user
//   diyGuideSourceEnum — the allowed values for the guide's "source" column (e.g. "ai", "web")
//   userGuideProgress — table tracking how far a user has progressed through a guide
//   guides            — table of generic guide records (imported but reserved for future use)
import { diyGuides, diyGuideSourceEnum, userGuideProgress, guides } from "@/app/db/schema";

// Import three Drizzle ORM query-building helpers:
//   eq(col, val)       — generates SQL: WHERE col = val
//   and(...conditions) — combines multiple conditions with SQL AND
//   desc(col)          — generates SQL: ORDER BY col DESC (newest first)
import { eq, and, desc } from "drizzle-orm";

// A private authentication helper shared by all actions in this file.
// Not exported — only callable from within this module.
async function getAuthUser() {
  // Instantiate the Supabase server client for this request.
  const supabase = await createClient();
  // Verify the session cookie and retrieve the currently logged-in user.
  const { data: { user } } = await supabase.auth.getUser();
  // If the session is missing or expired, throw an error immediately.
  // This prevents any unauthenticated access to guide data.
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can read user.id, etc.
  return user;
}

// Exported server action: retrieves all DIY guides that belong to the
// currently logged-in user, with optional filtering.
// Parameters:
//   filters (optional) — an object with any of the following optional fields:
//     bookmarkedOnly — if true, return only guides the user has bookmarked
//     source         — filter to guides from a specific source (e.g. "ai", "web")
//     limit          — cap the number of rows returned
// Returns: an array of diyGuides rows, ordered newest-first
export async function getMyGuides(filters?: { bookmarkedOnly?: boolean; source?: string; limit?: number }) {
  // Authenticate first. We need the user's ID to scope the query to their guides.
  const user = await getAuthUser();
  // Start building the WHERE conditions array.
  // The first condition is always required: only return this user's guides.
  const conditions = [eq(diyGuides.userId, user.id)];
  // If the caller only wants bookmarked guides, add a second condition:
  //   AND wasBookmarked = true
  if (filters?.bookmarkedOnly) conditions.push(eq(diyGuides.wasBookmarked, true));
  // If the caller filtered by source, add:
  //   AND source = filters.source
  // The cast ensures the string matches the allowed enum values at the type level.
  if (filters?.source) conditions.push(eq(diyGuides.source, filters.source as typeof diyGuideSourceEnum.enumValues[number]));
  // Build the full query: SELECT * FROM diyGuides WHERE <conditions> ORDER BY createdAt DESC
  // All conditions are combined with AND using the `and()` helper.
  const query = db.select().from(diyGuides).where(and(...conditions)).orderBy(desc(diyGuides.createdAt));
  // If a limit was specified, append LIMIT N to the query.
  if (filters?.limit) query.limit(filters.limit);
  // Execute and return the query results.
  return query;
}

// Exported server action: toggles the bookmark flag on a DIY guide.
// Parameters:
//   input.guideId    — the UUID of the diyGuides row to update
//   input.bookmarked — true to bookmark, false to un-bookmark
// Returns: the updated diyGuides row
export async function bookmarkGuide(input: { guideId: string; bookmarked: boolean }) {
  // Authenticate and get the user so we can confirm they own this guide.
  const user = await getAuthUser();
  // Run a SQL UPDATE:
  //   UPDATE diyGuides SET wasBookmarked = input.bookmarked
  //   WHERE id = input.guideId AND userId = user.id
  // The userId check ensures a user cannot bookmark or un-bookmark
  // another user's guide records.
  const [updated] = await db.update(diyGuides)
    .set({ wasBookmarked: input.bookmarked })
    .where(and(eq(diyGuides.id, input.guideId), eq(diyGuides.userId, user.id)))
    .returning();
  // Return the updated row.
  return updated;
}

// Exported server action: records whether a guide was helpful to the user.
// Parameters:
//   guideId — the UUID of the diyGuides row to rate
//   helpful — true if the guide was useful, false if not
// Returns: the updated diyGuides row
export async function rateGuide(guideId: string, helpful: boolean) {
  // Authenticate and retrieve the user to scope the update.
  const user = await getAuthUser();
  // Run a SQL UPDATE:
  //   UPDATE diyGuides SET wasHelpful = helpful
  //   WHERE id = guideId AND userId = user.id
  // Scoping by userId prevents one user from altering another user's rating.
  const [updated] = await db.update(diyGuides)
    .set({ wasHelpful: helpful })
    .where(and(eq(diyGuides.id, guideId), eq(diyGuides.userId, user.id)))
    .returning();
  // Return the updated row so the UI can reflect the submitted rating.
  return updated;
}

// Exported server action: flags a guide as "clicked" to track engagement.
// This is called when the user opens / follows a guide link, so the app
// knows which guides are actually being used.
// Parameters:
//   guideId — the UUID of the diyGuides row to mark
// Returns: the updated diyGuides row
export async function trackGuideClick(guideId: string) {
  // Authenticate and retrieve the user so we scope the update correctly.
  const user = await getAuthUser();
  // Run a SQL UPDATE:
  //   UPDATE diyGuides SET wasClicked = true
  //   WHERE id = guideId AND userId = user.id
  const [updated] = await db.update(diyGuides)
    .set({ wasClicked: true })
    .where(and(eq(diyGuides.id, guideId), eq(diyGuides.userId, user.id)))
    .returning();
  // Return the updated row.
  return updated;
}

// Exported server action: saves (or updates) a user's progress through a guide.
// Uses an "upsert" — if a progress row already exists for this user+guide
// combination, it updates it in place; otherwise it inserts a new row.
// Parameters:
//   input.guideId        — the UUID of the guide being tracked
//   input.progress       — a number from 0–100 representing completion percentage
//   input.completedSteps — optional count of steps the user has finished
// Returns: true to signal the operation succeeded
export async function updateGuideProgress(input: { guideId: string; progress: number; completedSteps?: number }) {
  // Authenticate. We need the user's ID to record whose progress this is.
  const user = await getAuthUser();
  // Determine whether the guide is fully complete (progress has reached 100%).
  const isCompleted = input.progress >= 100;
  // Build an array of completed step IDs. If completedSteps is provided,
  // generate sequential string IDs: ["1", "2", ..., "N"].
  // Array.from({ length: N }, (_, i) => String(i + 1)) creates an array of N
  // strings starting at "1". If completedSteps is not provided, use an empty array.
  // Run a SQL INSERT ... ON CONFLICT DO UPDATE (upsert):
  //   INSERT INTO userGuideProgress (guideId, userId, isCompleted, completedStepIds, lastAccessedAt)
  //   ON CONFLICT (guideId, userId) DO UPDATE SET isCompleted = ..., completedStepIds = ..., lastAccessedAt = now()
  // The target [guideId, userId] is the unique constraint — if a row already
  // exists for this guide + user pair, update it rather than inserting a duplicate.
  await db.insert(userGuideProgress)
    .values({ guideId: input.guideId, userId: user.id, isCompleted, completedStepIds: input.completedSteps ? Array.from({ length: input.completedSteps }, (_, i) => String(i + 1)) : [], lastAccessedAt: new Date() })
    .onConflictDoUpdate({ target: [userGuideProgress.guideId, userGuideProgress.userId], set: { isCompleted, completedStepIds: input.completedSteps ? Array.from({ length: input.completedSteps }, (_, i) => String(i + 1)) : [], lastAccessedAt: new Date() } });
  // Return true as a simple success signal.
  return true;
}
