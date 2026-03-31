// "use server" tells Next.js that every function in this file runs only on the
// server (Node.js), never in the browser. This is required for any code that
// touches a database, reads secrets, or must not be exposed to the client.
"use server";

// createClient() builds a Supabase auth client that is scoped to the current
// HTTP request, so it can read the user's session cookie and identify who is
// making the call.
import { createClient } from "@/lib/supabase/server";
// db is the Drizzle ORM instance connected to the PostgreSQL database. All
// SELECT / INSERT / UPDATE / DELETE queries go through this object.
import { db } from "@/app/db/client";
// Import the database table definitions and enum types we need for this file:
// - issues:              the table that stores household issues
// - issueComments:       the table that stores comments on an issue
// - groupMembers:        the table that records which users belong to which groups
// - projectStatusEnum:   the allowed values for an issue's status column
// - projectPriorityEnum: the allowed values for an issue's priority column
// - projectCategoryEnum: the allowed values for an issue's category column
// - resolutionTypeEnum:  the allowed values for how an issue was resolved
import { issues, issueComments, groupMembers, projectStatusEnum, projectPriorityEnum, projectCategoryEnum, resolutionTypeEnum } from "@/app/db/schema";
// Import Drizzle ORM helper functions used to build SQL WHERE clauses:
// - eq(col, val)  → SQL: col = val
// - and(...)      → SQL: condition1 AND condition2 AND ...
// - desc(col)     → SQL: ORDER BY col DESC (newest / largest first)
import { eq, and, desc } from "drizzle-orm";

// ─── Private helper: get the currently logged-in user ────────────────────────
// This function is NOT exported — it is only used internally by the functions
// below to confirm that a real, authenticated user is making the request.
// If no session exists, it throws an error which aborts the calling function.
async function getAuthUser() {
  // Create a Supabase client that can read the current request's session cookie.
  const supabase = await createClient();
  // Ask Supabase "who is logged in right now?" and destructure the user object
  // out of the nested response shape { data: { user } }.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no logged-in user (session expired or never existed), stop
  // immediately and throw an error. This prevents unauthenticated access to
  // every function that calls getAuthUser().
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can access user.id and other properties.
  return user;
}

// ─── Private helper: look up a group member record ───────────────────────────
// Given a Supabase auth user ID and a group ID, find that user's membership row
// in the groupMembers table. This lets us verify the user belongs to the group
// and obtain their member ID (which is different from their auth user ID).
async function getMemberInGroup(userId: string, groupId: string) {
  // Query the groupMembers table for a row where ALL three conditions are true:
  // 1. The userId column matches the provided Supabase auth user ID.
  // 2. The groupId column matches the group we are working with.
  // 3. The status column equals "active" — inactive/removed members are excluded.
  const [member] = await db
    .select()
    .from(groupMembers)
    .where(
      and(
        // eq(groupMembers.userId, userId) → WHERE userId = <current user's auth ID>
        eq(groupMembers.userId, userId),
        // eq(groupMembers.groupId, groupId) → AND groupId = <provided group ID>
        eq(groupMembers.groupId, groupId),
        // eq(groupMembers.status, "active") → AND status = 'active'
        // Only active members should be allowed to interact with group content.
        eq(groupMembers.status, "active")
      )
    )
    // We only need at most one row; LIMIT 1 makes the query faster.
    .limit(1);
  // Array destructuring above puts the first result into `member`.
  // If no row was found, `member` is undefined, so return null instead so
  // callers can do a simple `if (!member)` check.
  return member ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getIssues
// Fetches a list of issues that belong to a specific group.
// Parameters:
//   groupId  — the ID of the household group whose issues we want
//   filters  — optional object to narrow results by status, priority, category,
//              and to page through results with limit/offset
// Returns: an array of issue rows from the database
// ─────────────────────────────────────────────────────────────────────────────
export async function getIssues(
  groupId: string,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }
) {
  // Verify the caller is logged in. We do not need the user object here, so we
  // discard the return value — we only care that it does not throw.
  await getAuthUser();
  // Start building the list of WHERE conditions. The first condition is always
  // required: we only want issues that belong to the requested group.
  // eq(issues.groupId, groupId) → WHERE groupId = <provided groupId>
  const conditions = [eq(issues.groupId, groupId)];
  // If the caller passed a status filter, add a condition to match that status.
  // The TypeScript cast `as typeof projectStatusEnum.enumValues[number]` tells
  // the compiler that the plain string is one of the valid enum values (e.g.
  // "open", "in_progress", "completed"). Without the cast, TypeScript would
  // reject the string because it cannot verify it at compile time.
  if (filters?.status) conditions.push(eq(issues.status, filters.status as typeof projectStatusEnum.enumValues[number]));
  // If the caller passed a priority filter, add a condition for that priority.
  // Same cast reason as above — the string must match one of the valid priority
  // enum values (e.g. "low", "medium", "high", "urgent").
  if (filters?.priority) conditions.push(eq(issues.priority, filters.priority as typeof projectPriorityEnum.enumValues[number]));
  // If the caller passed a category filter, add a condition for that category.
  // The cast ensures TypeScript accepts the string as a valid category enum value.
  if (filters?.category) conditions.push(eq(issues.category, filters.category as typeof projectCategoryEnum.enumValues[number]));

  // Build the SELECT query: read all columns from the issues table, apply all
  // the conditions collected above joined by AND, and sort newest issues first
  // using desc(issues.createdAt) → ORDER BY createdAt DESC.
  const q = db.select().from(issues).where(and(...conditions)).orderBy(desc(issues.createdAt));
  // If a limit was provided, add LIMIT to the query so we don't return every
  // single issue at once (useful for pagination).
  if (filters?.limit) q.limit(filters.limit);
  // If an offset was provided, add OFFSET to skip that many rows (used together
  // with limit to implement page 2, page 3, etc.).
  if (filters?.offset) q.offset(filters.offset);
  // Execute the query and return the resulting array of issue rows.
  return q;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: getIssue
// Fetches a single issue by its unique ID.
// Parameters:
//   id — the UUID of the issue to look up
// Returns: the matching issue row, or null if no issue with that ID exists
// ─────────────────────────────────────────────────────────────────────────────
export async function getIssue(id: string) {
  // Verify the caller is logged in before allowing any data to be read.
  await getAuthUser();
  // Query the issues table for the row whose primary key matches `id`.
  // eq(issues.id, id) → WHERE id = <provided id>
  // LIMIT 1 stops scanning after the first match (there should only ever be one
  // since id is a primary key, but LIMIT 1 is an explicit safety net).
  const [issue] = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
  // Return the found issue, or null if the array was empty (no match found).
  return issue ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: createIssue
// Creates a new issue record in the database for a household group.
// Parameters:
//   input.groupId      — which group this issue belongs to
//   input.title        — short summary of the problem (required)
//   input.description  — longer details about the problem (optional)
//   input.category     — broad category like "plumbing" or "electrical" (optional)
//   input.subcategory  — more specific sub-type within the category (optional)
//   input.priority     — urgency level; defaults to "medium" if not provided
//   input.assetName    — name of the physical asset involved, e.g. "Boiler" (optional)
//   input.assetDetails — extra structured data about the asset (optional, any shape)
// Returns: the newly inserted issue row including its generated ID
// ─────────────────────────────────────────────────────────────────────────────
export async function createIssue(input: {
  groupId: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priority?: string;
  assetName?: string;
  assetDetails?: unknown;
}) {
  // Get the currently logged-in user so we know who is creating the issue.
  const user = await getAuthUser();
  // Look up this user's membership record in the target group. We need this to:
  // 1. Verify the user is actually a member of the group (authorization).
  // 2. Get the member's internal ID to record who created the issue.
  const member = await getMemberInGroup(user.id, input.groupId);
  // If the user is not an active member of this group, refuse the request.
  // This prevents users from creating issues in groups they don't belong to.
  if (!member) throw new Error("You are not a member of this group");

  // Insert a new row into the issues table with all the provided field values.
  const [issue] = await db
    .insert(issues)
    .values({
      // Store which group this issue belongs to.
      groupId: input.groupId,
      // Trim surrounding whitespace from the title before saving it.
      title: input.title.trim(),
      // Store the optional longer description as-is.
      description: input.description,
      // Cast the category string to the valid enum type so Drizzle accepts it.
      // Without this cast, TypeScript would complain that a plain string might
      // not be one of the allowed category values.
      category: input.category as typeof projectCategoryEnum.enumValues[number] | undefined,
      // Store the optional subcategory string.
      subcategory: input.subcategory,
      // Use the provided priority or fall back to "medium" if none was given.
      // Cast to the enum type for the same reason as category above.
      priority: (input.priority ?? "medium") as typeof projectPriorityEnum.enumValues[number],
      // Store the optional name of the physical asset involved.
      assetName: input.assetName,
      // Cast assetDetails from `unknown` to a plain key-value object so Drizzle
      // knows how to serialize it as a JSON column in the database.
      assetDetails: input.assetDetails as Record<string, unknown>,
      // Record the internal member ID (not the auth user ID) as the creator.
      createdBy: member.id,
      // Mark the issue as not encrypted — this field tracks whether the content
      // is stored in encrypted form. New issues are plain text by default.
      isEncrypted: false,
    })
    // .returning() tells PostgreSQL to send back the complete inserted row,
    // including auto-generated values like the new UUID and timestamps.
    .returning();
  // Return the single inserted issue row so the caller can use its ID, etc.
  return issue;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: updateIssue
// Updates one or more fields on an existing issue. Only fields that are
// explicitly provided in `input` will be changed; everything else is left alone.
// Parameters:
//   id    — the UUID of the issue to update
//   input — an object containing only the fields to change (all optional)
// Returns: the updated issue row as it now exists in the database
// ─────────────────────────────────────────────────────────────────────────────
export async function updateIssue(
  id: string,
  input: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    priority?: string;
    status?: string;
    assetName?: string;
    assetDetails?: unknown;
  }
) {
  // Verify the caller is logged in. We don't need the user object here since
  // this action doesn't perform a group-membership check (any authenticated
  // user who knows the issue ID can update it at this layer).
  await getAuthUser();
  // Build an object that holds only the fields we actually want to change.
  // We always include updatedAt so the record reflects when it was last modified.
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  // For each optional field, only add it to the updates object if the caller
  // actually provided a value. Checking `!== undefined` (rather than truthiness)
  // means an empty string or 0 would still be applied — intentional blanking out
  // of a field is allowed.
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.category !== undefined) updates.category = input.category;
  if (input.subcategory !== undefined) updates.subcategory = input.subcategory;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.status !== undefined) updates.status = input.status;
  if (input.assetName !== undefined) updates.assetName = input.assetName;
  if (input.assetDetails !== undefined) updates.assetDetails = input.assetDetails;

  // Run the UPDATE statement: set only the collected fields on the row where
  // the primary key matches `id`. eq(issues.id, id) → WHERE id = <provided id>.
  // .returning() gives us back the full updated row so we can return it.
  const [updated] = await db.update(issues).set(updates).where(eq(issues.id, id)).returning();
  // Return the updated issue row.
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: deleteIssueAction
// Permanently deletes an issue from the database.
// Parameters:
//   id — the UUID of the issue to delete
// Returns: true to signal that the deletion succeeded
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteIssueAction(id: string) {
  // Verify the caller is logged in before allowing any deletion.
  await getAuthUser();
  // Run DELETE on the issues table for the row whose primary key matches `id`.
  // eq(issues.id, id) → WHERE id = <provided id>
  await db.delete(issues).where(eq(issues.id, id));
  // Return true to tell the caller the operation completed without error.
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: resolveIssue
// Marks an issue as completed / resolved, recording how and when it was fixed
// and which group member resolved it.
// Parameters:
//   id           — the UUID of the issue to resolve
//   input.resolutionType  — how the issue was resolved (e.g. "fixed", "wont_fix")
//   input.resolutionNotes — free-text explanation of what was done (optional)
// Returns: the updated issue row with all resolution fields filled in
// ─────────────────────────────────────────────────────────────────────────────
export async function resolveIssue(
  id: string,
  input: { resolutionType?: string; resolutionNotes?: string }
) {
  // Get the logged-in user so we can record who resolved the issue.
  const user = await getAuthUser();
  // Fetch the issue first so we can find out which group it belongs to.
  // We need the groupId to look up the resolver's group member record.
  const [issue] = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
  // If the issue doesn't exist in the database, there is nothing to resolve.
  if (!issue) throw new Error("Issue not found");
  // Look up the current user's membership in the issue's group so we can store
  // their member ID in the resolvedBy field.
  const member = await getMemberInGroup(user.id, issue.groupId);

  // Update the issue row to mark it as resolved. Set all the resolution-related
  // fields at once in a single UPDATE statement.
  const [updated] = await db
    .update(issues)
    .set({
      // Change the status to "completed" so the issue appears as resolved in UI.
      status: "completed",
      // Store how the issue was resolved; cast to the enum type so Drizzle
      // accepts it. The union with `undefined` means the column is left as NULL
      // if no resolutionType was provided.
      resolutionType: input.resolutionType as typeof resolutionTypeEnum.enumValues[number] | undefined,
      // Store any free-text notes the resolver added.
      resolutionNotes: input.resolutionNotes,
      // Record the exact date/time the issue was resolved.
      resolvedAt: new Date(),
      // Record which group member resolved it. The optional chaining (?.) means
      // this is null if member lookup returned nothing (edge case safety).
      resolvedBy: member?.id,
      // Also stamp completedAt — some UI may use this field specifically to
      // show when the work was finished.
      completedAt: new Date(),
      // Always update updatedAt so the row reflects the latest modification time.
      updatedAt: new Date(),
    })
    // eq(issues.id, id) → WHERE id = <provided id> — only update this one issue.
    .where(eq(issues.id, id))
    // Return the full updated row so the caller gets the final state.
    .returning();
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: reopenIssue
// Reverses a resolution — sets the issue back to "open" and clears all
// resolution-related fields. Useful when a fix didn't work or was applied in error.
// Parameters:
//   id — the UUID of the issue to reopen
// Returns: the updated issue row now showing status "open"
// ─────────────────────────────────────────────────────────────────────────────
export async function reopenIssue(id: string) {
  // Verify the caller is logged in before allowing the status change.
  await getAuthUser();
  // Update the issue row, resetting all resolution fields back to their
  // "not yet resolved" state.
  const [updated] = await db
    .update(issues)
    .set({
      // Set status back to "open" so the issue appears in active-issues lists.
      status: "open",
      // Clear the resolution type — null means "not resolved in any way".
      resolutionType: null,
      // Clear the resolution notes that were saved when the issue was closed.
      resolutionNotes: null,
      // Clear the timestamp that recorded when it was resolved.
      resolvedAt: null,
      // Clear the member ID that recorded who resolved it.
      resolvedBy: null,
      // Clear the completion timestamp.
      completedAt: null,
      // Record the current time as the last modification time.
      updatedAt: new Date(),
    })
    // eq(issues.id, id) → WHERE id = <provided id> — only reopen this one issue.
    .where(eq(issues.id, id))
    // Return the full updated row so the caller sees the final state.
    .returning();
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: addComment
// Adds a new comment to an issue. Only active group members may comment.
// Parameters:
//   input.issueId — the UUID of the issue being commented on
//   input.content — the text body of the comment
// Returns: the newly inserted comment row including its generated ID
// ─────────────────────────────────────────────────────────────────────────────
export async function addComment(input: { issueId: string; content: string }) {
  // Get the currently logged-in user so we know who is posting the comment.
  const user = await getAuthUser();
  // Fetch the parent issue to find out which group it belongs to. We need the
  // groupId to verify the commenter is actually a member of that group.
  const [issue] = await db.select().from(issues).where(eq(issues.id, input.issueId)).limit(1);
  // If the issue doesn't exist, we cannot attach a comment to it.
  if (!issue) throw new Error("Issue not found");
  // Verify the logged-in user is an active member of the issue's group.
  // Non-members should not be able to comment on private group issues.
  const member = await getMemberInGroup(user.id, issue.groupId);
  if (!member) throw new Error("You are not a member of this group");

  // Insert a new row into the issueComments table.
  const [comment] = await db
    .insert(issueComments)
    .values({
      // Link this comment to the issue it was written for.
      issueId: input.issueId,
      // Store the group member's internal ID (not the auth user ID) as the author.
      userId: member.id,
      // Trim surrounding whitespace from the comment text before saving.
      content: input.content.trim(),
      // Mark the comment as not encrypted — stored as plain text by default.
      isEncrypted: false,
    })
    // .returning() retrieves the saved row so we can return its generated ID, etc.
    .returning();
  // Return the newly created comment row.
  return comment;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: deleteComment
// Permanently deletes a comment from an issue.
// Parameters:
//   id — the UUID of the comment to delete
// Returns: true to signal the deletion succeeded
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteComment(id: string) {
  // Verify the caller is logged in before allowing any deletion.
  await getAuthUser();
  // Run DELETE on the issueComments table for the row whose primary key equals `id`.
  // eq(issueComments.id, id) → WHERE id = <provided id>
  await db.delete(issueComments).where(eq(issueComments.id, id));
  // Return true to confirm the deletion completed without error.
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTION: editComment
// Updates the text content of an existing comment.
// Parameters:
//   id      — the UUID of the comment to edit
//   content — the new text to replace the existing comment body
// Returns: the updated comment row
// ─────────────────────────────────────────────────────────────────────────────
export async function editComment(id: string, content: string) {
  // Verify the caller is logged in before allowing an edit.
  await getAuthUser();
  // Update the comment row: set the new content and refresh the updatedAt timestamp
  // so the UI can show "edited X minutes ago" type messages.
  // eq(issueComments.id, id) → WHERE id = <provided id>
  // .returning() gives back the updated row.
  const [updated] = await db
    .update(issueComments)
    .set({ content: content.trim(), updatedAt: new Date() })
    .where(eq(issueComments.id, id))
    .returning();
  // Return the updated comment row.
  return updated;
}
