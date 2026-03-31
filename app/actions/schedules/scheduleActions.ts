// This directive tells Next.js that every exported function here is a
// Server Action — it runs exclusively on the server and is never sent
// to or executed in the browser. React hooks call these functions and
// Next.js handles the network communication transparently.
"use server";

// Import the Supabase server-side client factory. Reading the user's session
// cookie must happen server-side for security, so we always use the server
// variant of the client in Server Actions.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client. Every SQL query in this file
// goes through this object.
import { db } from "@/app/db/client";

// Import the four database table definitions used for scheduling:
//   diySchedules — rows representing a scheduled repair/maintenance event
//   issues       — the repair issues that schedules are linked to
//   groups       — the groups (households/teams) that own issues
//   groupMembers — the join table recording which users belong to which groups
import { diySchedules, issues, groups, groupMembers } from "@/app/db/schema";

// Import Drizzle ORM query helpers:
//   eq(col, val)         — SQL: WHERE col = val
//   and(...conditions)   — SQL: AND (combines multiple WHERE conditions)
//   inArray(col, arr)    — SQL: WHERE col IN (arr)  (matches any value in the array)
//   desc(col)            — SQL: ORDER BY col DESC   (newest/largest first)
//   gte(col, val)        — SQL: WHERE col >= val    (greater than or equal)
//   lte(col, val)        — SQL: WHERE col <= val    (less than or equal)
//   sql`...`             — escape hatch to write raw SQL fragments when Drizzle
//                          helpers don't cover the exact syntax needed
import { eq, and, inArray, desc, gte, lte, sql } from "drizzle-orm";

// Private helper: confirms that the request is coming from a logged-in user.
// All actions in this file call this first to prevent unauthenticated access.
async function getAuthUser() {
  // Create a fresh Supabase server client for this request.
  const supabase = await createClient();
  // Validate the session cookie and retrieve the user object.
  const { data: { user } } = await supabase.auth.getUser();
  // If no valid session is found, stop immediately with an Unauthorized error.
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can access user.id.
  return user;
}

// Private helper: looks up all group IDs where the given user is an active member.
// This is used to scope schedule queries to only the groups the user belongs to,
// preventing one user from seeing another group's data.
// Parameters:
//   userId — the ID of the user whose group memberships should be fetched
// Returns: an array of group ID strings (may be empty if the user has no groups)
async function getUserGroupIds(userId: string) {
  // SQL: SELECT groupId FROM groupMembers
  //      WHERE userId = userId AND status = 'active'
  const memberships = await db.select({ groupId: groupMembers.groupId })
    .from(groupMembers).where(and(eq(groupMembers.userId, userId), eq(groupMembers.status, "active")));
  // Extract just the groupId values from each membership row into a plain array.
  return memberships.map((m) => m.groupId);
}

// Exported server action: fetches a single schedule record by its ID,
// joined with the related issue and group for context.
// Parameters:
//   id — the UUID of the diySchedules row to retrieve
// Returns: an object with { schedule, issue, group } or null if not found
export async function getSchedule(id: string) {
  // Confirm the caller is authenticated before exposing schedule data.
  await getAuthUser();
  // SQL:
  //   SELECT diySchedules.*, issues.*, groups.*
  //   FROM diySchedules
  //   INNER JOIN issues ON diySchedules.issueId = issues.id
  //   INNER JOIN groups ON issues.groupId = groups.id
  //   WHERE diySchedules.id = id
  //   LIMIT 1
  // The INNER JOINs pull in the related issue details and the group the
  // issue belongs to, so callers get all context in one query.
  const [schedule] = await db.select({ schedule: diySchedules, issue: issues, group: groups })
    .from(diySchedules).innerJoin(issues, eq(diySchedules.issueId, issues.id))
    .innerJoin(groups, eq(issues.groupId, groups.id))
    .where(eq(diySchedules.id, id)).limit(1);
  // Return the record or null when no matching row exists.
  return schedule ?? null;
}

// Exported server action: returns all schedules that belong to any group
// the currently logged-in user is an active member of.
// An optional date range filter lets callers request only schedules within
// a specific window (e.g. for a monthly calendar view).
// Parameters:
//   filters (optional):
//     startDate — ISO date string; only return schedules at or after this date
//     endDate   — ISO date string; only return schedules at or before this date
// Returns: an array of { schedule, issue, group } objects ordered by scheduledTime ASC
export async function getMySchedules(filters?: { startDate?: string; endDate?: string }) {
  // Authenticate and get the user object so we can look up their groups.
  const user = await getAuthUser();
  // Find all group IDs where this user is an active member.
  const groupIds = await getUserGroupIds(user.id);
  // If the user has no group memberships, there can be no schedules to show.
  if (groupIds.length === 0) return [];
  // Start building the WHERE conditions array. The first condition ensures we
  // only return schedules whose parent issue belongs to one of the user's groups.
  //   SQL: WHERE issues.groupId IN (groupIds)
  const conditions = [inArray(issues.groupId, groupIds)];
  // If a startDate filter was provided, add:
  //   AND diySchedules.scheduledTime >= startDate
  if (filters?.startDate) conditions.push(gte(diySchedules.scheduledTime, new Date(filters.startDate)));
  // If an endDate filter was provided, add:
  //   AND diySchedules.scheduledTime <= endDate
  if (filters?.endDate) conditions.push(lte(diySchedules.scheduledTime, new Date(filters.endDate)));
  // Execute the full query with all conditions combined via AND:
  //   SELECT diySchedules.*, issues.*, groups.*
  //   FROM diySchedules
  //   INNER JOIN issues ON diySchedules.issueId = issues.id
  //   INNER JOIN groups ON issues.groupId = groups.id
  //   WHERE <conditions>
  //   ORDER BY scheduledTime ASC
  return db.select({ schedule: diySchedules, issue: issues, group: groups })
    .from(diySchedules).innerJoin(issues, eq(diySchedules.issueId, issues.id))
    .innerJoin(groups, eq(issues.groupId, groups.id))
    .where(and(...conditions)).orderBy(diySchedules.scheduledTime);
}

// Exported server action: returns all schedules for a specific group.
// Similar to getMySchedules but scoped to a single group rather than all of
// the user's groups. Useful for a group-level calendar view.
// Parameters:
//   groupId — the UUID of the group whose schedules should be listed
//   filters (optional):
//     startDate — ISO date string; only return schedules on or after this date
//     endDate   — ISO date string; only return schedules on or before this date
// Returns: an array of { schedule, issue } objects ordered by scheduledTime ASC
export async function getGroupSchedules(groupId: string, filters?: { startDate?: string; endDate?: string }) {
  // Confirm the caller is authenticated before exposing group schedule data.
  await getAuthUser();
  // Start with a condition that filters to this specific group's issues.
  //   SQL: WHERE issues.groupId = groupId
  const conditions = [eq(issues.groupId, groupId)];
  // Optionally narrow the results to a start date:
  //   AND diySchedules.scheduledTime >= startDate
  if (filters?.startDate) conditions.push(gte(diySchedules.scheduledTime, new Date(filters.startDate)));
  // Optionally narrow the results to an end date:
  //   AND diySchedules.scheduledTime <= endDate
  if (filters?.endDate) conditions.push(lte(diySchedules.scheduledTime, new Date(filters.endDate)));
  // Build and execute the query. We only join issues here (not groups) because
  // the caller already knows which group they're looking at.
  return db.select({ schedule: diySchedules, issue: issues })
    .from(diySchedules).innerJoin(issues, eq(diySchedules.issueId, issues.id))
    .where(and(...conditions)).orderBy(diySchedules.scheduledTime);
}

// Exported server action: fetches up to 50 issues for a group that are in
// a state where scheduling work makes sense (not yet closed/resolved).
// This is used to populate a "pick an issue to schedule" dropdown in the UI.
// Parameters:
//   groupId — the UUID of the group whose schedulable issues should be listed
// Returns: an array of issues rows ordered newest-first, capped at 50 rows
export async function getIssuesForScheduling(groupId: string) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // SQL:
  //   SELECT * FROM issues
  //   WHERE groupId = groupId
  //     AND status IN ('open', 'investigating', 'in_progress', 'decided')
  //   ORDER BY createdAt DESC
  //   LIMIT 50
  // The raw sql`` template is used here because Drizzle's inArray() helper
  // works with plain values but the `status` column is a PostgreSQL enum type.
  // Casting with ::text IN (...) is the safest way to compare enum values in
  // raw SQL without Drizzle type errors.
  return db.select().from(issues)
    .where(and(eq(issues.groupId, groupId), sql`${issues.status}::text IN ('open', 'investigating', 'in_progress', 'decided')`))
    .orderBy(desc(issues.createdAt)).limit(50);
}

// Exported server action: creates a new schedule entry for a repair issue.
// Parameters:
//   input.issueId           — the UUID of the issue this schedule is for
//   input.scheduledTime     — ISO date-time string of when the work is planned
//   input.estimatedDuration — optional length of the job in minutes (or another unit)
//   input.participants      — optional array of user IDs who will be present
// Returns: the newly created diySchedules row
export async function createSchedule(input: {
  issueId: string; scheduledTime: string; estimatedDuration?: number;
  participants?: string[];
}) {
  // Authenticate and retrieve the user so we can record who created the schedule.
  const user = await getAuthUser();
  // SQL:
  //   INSERT INTO diySchedules (issueId, scheduledTime, estimatedDuration, participants, createdBy)
  //   VALUES (...)
  // Convert the scheduledTime ISO string to a JavaScript Date object because
  // Drizzle/Postgres expects a Date for timestamp columns.
  // Default participants to an empty array if none were provided.
  const [schedule] = await db.insert(diySchedules)
    .values({ issueId: input.issueId, scheduledTime: new Date(input.scheduledTime), estimatedDuration: input.estimatedDuration, participants: input.participants ?? [], createdBy: user.id })
    .returning();
  // Return the created row.
  return schedule;
}

// Exported server action: updates mutable fields on an existing schedule.
// Parameters:
//   id    — the UUID of the diySchedules row to update
//   input — an object with any combination of optional fields:
//             scheduledTime     — new ISO date-time string for when work is planned
//             estimatedDuration — updated job length
//             participants      — updated list of participant user IDs
// Returns: the updated diySchedules row
export async function updateSchedule(id: string, input: { scheduledTime?: string; estimatedDuration?: number; participants?: string[] }) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // Separate scheduledTime from the other fields so it can be converted to a
  // Date object independently. `rest` contains estimatedDuration and participants.
  const { scheduledTime, ...rest } = input;
  // SQL:
  //   UPDATE diySchedules
  //   SET estimatedDuration = ..., participants = ...,
  //       [scheduledTime = ...] (only if provided)
  //   WHERE id = id
  // The conditional spread `...(scheduledTime ? { scheduledTime: new Date(...) } : {})`
  // adds the scheduledTime field only when a new value was actually passed in.
  const [updated] = await db.update(diySchedules)
    .set({ ...rest, ...(scheduledTime ? { scheduledTime: new Date(scheduledTime) } : {}) })
    .where(eq(diySchedules.id, id)).returning();
  // Return the updated row.
  return updated;
}

// Exported server action: permanently removes a schedule record.
// Parameters:
//   id — the UUID of the diySchedules row to delete
// Returns: true to signal successful deletion
export async function deleteSchedule(id: string) {
  // Confirm the caller is authenticated before allowing deletion.
  await getAuthUser();
  // SQL: DELETE FROM diySchedules WHERE id = id
  await db.delete(diySchedules).where(eq(diySchedules.id, id));
  // Return true as a simple success signal to the calling hook.
  return true;
}
