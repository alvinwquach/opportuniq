// This directive marks every exported function in this file as a Next.js
// Server Action — code that runs only on the server, never in the browser.
// React components and TanStack Query hooks call these functions directly;
// Next.js serialises the call over the network automatically.
"use server";

// Import the Supabase server-side client factory. We need the server variant
// because it reads the user's session from HTTP-only cookies, which are only
// accessible on the server.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client used to execute all SQL queries.
import { db } from "@/app/db/client";

// Import the database table definitions this file operates on:
//   decisions        — one row per group issue that records which option was chosen
//   decisionOptions  — the individual repair options (DIY / hire / defer) for an issue
//   decisionOutcomes — post-repair records of how the chosen option actually went
//   decisionVotes    — individual member votes (approve / reject / abstain) on a decision
//   issues           — the repair issues that decisions belong to
//   groupMembers     — the join table recording group membership and roles
import {
  decisions, decisionOptions, decisionOutcomes, decisionVotes,
  issues, groupMembers,
} from "@/app/db/schema";

// Import Drizzle ORM query helpers:
//   eq(col, val)       — SQL: WHERE col = val
//   and(...conditions) — SQL: AND (combines multiple WHERE conditions)
//   inArray(col, arr)  — SQL: WHERE col IN (arr)
//   desc(col)          — SQL: ORDER BY col DESC (newest first)
import { eq, and, inArray, desc } from "drizzle-orm";

// Private helper: verifies that the request has an active login session.
// Called at the top of every action to prevent unauthenticated access.
async function getAuthUser() {
  // Instantiate the Supabase server client for this request.
  const supabase = await createClient();
  // Ask Supabase to validate the session cookie and return the user.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no valid session, stop immediately and surface an error.
  if (!user) throw new Error("Unauthorized");
  // Return the user object so callers can read user.id.
  return user;
}

// Private helper: checks whether a specific user is an active member of a
// specific group. Used to enforce group membership before allowing votes.
// Parameters:
//   userId  — the authenticated user's ID
//   groupId — the group to check membership in
// Returns: the groupMembers row if the user is an active member, or null if not
async function getMemberInGroup(userId: string, groupId: string) {
  // SQL:
  //   SELECT * FROM groupMembers
  //   WHERE userId = userId AND groupId = groupId AND status = 'active'
  //   LIMIT 1
  const [member] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId), eq(groupMembers.status, "active")))
    .limit(1);
  // Return the row if found, or null to indicate the user is not in this group.
  return member ?? null;
}

// Exported server action: fetches a single decision option by its ID.
// Decision options represent the possible repair approaches (e.g. "DIY",
// "hire a contractor", "defer") that were generated for an issue.
// Parameters:
//   id — the UUID of the decisionOptions row to retrieve
// Returns: the decisionOptions row or null if not found
export async function getDecisionOption(id: string) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // SQL: SELECT * FROM decisionOptions WHERE id = id LIMIT 1
  const [option] = await db.select().from(decisionOptions).where(eq(decisionOptions.id, id)).limit(1);
  // Return the found row, or null if no matching record exists.
  return option ?? null;
}

// Exported server action: records which decision option was selected for an issue.
// This is an "upsert" — if a decision row already exists for the issue, it
// updates the chosen option; otherwise it inserts a new decisions row.
// Parameters:
//   optionId    — the UUID of the decisionOptions row the user is selecting
//   assumptions — optional JSON-compatible object capturing the reasoning or
//                 assumptions the user held when making this choice
// Returns: the inserted or updated decisions row
export async function selectDecisionOption(optionId: string, assumptions?: unknown) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // Look up the option to find out which issue it belongs to.
  // SQL: SELECT * FROM decisionOptions WHERE id = optionId LIMIT 1
  const [option] = await db.select().from(decisionOptions).where(eq(decisionOptions.id, optionId)).limit(1);
  // If the option doesn't exist, there is nothing to select — surface a clear error.
  if (!option) throw new Error("Option not found");

  // Insert a new decision row linking the issue to the selected option.
  // If a decision already exists for this issue (the issueId is the unique
  // conflict target), update it to point to the newly selected option instead.
  // SQL equivalent (upsert):
  //   INSERT INTO decisions (issueId, selectedOptionId, approvedAt, assumptions)
  //   ON CONFLICT (issueId) DO UPDATE SET selectedOptionId = ..., approvedAt = now(), assumptions = ...
  const [decision] = await db.insert(decisions)
    .values({ issueId: option.issueId, selectedOptionId: optionId, approvedAt: new Date(), assumptions: assumptions as Record<string, unknown> | null })
    .onConflictDoUpdate({ target: decisions.issueId, set: { selectedOptionId: optionId, approvedAt: new Date(), assumptions: assumptions as Record<string, unknown> | null } })
    .returning();
  // Return the saved decision row.
  return decision;
}

// Exported server action: casts a vote (approve / reject / abstain) on a decision.
// Before inserting the vote, several checks are made:
//   1. The decision must exist.
//   2. The issue the decision belongs to must exist.
//   3. The voter must be an active member of the group that owns the issue.
// Parameters:
//   input.decisionId — the UUID of the decisions row being voted on
//   input.vote       — "approve", "reject", or "abstain"
//   input.comment    — optional free-text explanation for the vote
// Returns: the newly created decisionVotes row
export async function voteOnDecision(input: { decisionId: string; vote: string; comment?: string }) {
  // Authenticate and get the user so we can check group membership.
  const user = await getAuthUser();
  // Fetch the decision row to confirm it exists.
  // SQL: SELECT * FROM decisions WHERE id = input.decisionId LIMIT 1
  const [decision] = await db.select().from(decisions).where(eq(decisions.id, input.decisionId)).limit(1);
  // If no decision is found, reject the vote with a descriptive error.
  if (!decision) throw new Error("Decision not found");
  // Fetch the issue the decision belongs to, so we can determine the group.
  // SQL: SELECT * FROM issues WHERE id = decision.issueId LIMIT 1
  const [issue] = await db.select().from(issues).where(eq(issues.id, decision.issueId)).limit(1);
  // If the issue can't be found, reject the vote.
  if (!issue) throw new Error("Issue not found");
  // Check that the authenticated user is actually a member of the group that
  // owns the issue. This prevents outsiders from voting on another group's decisions.
  const member = await getMemberInGroup(user.id, issue.groupId);
  // If the user is not a member, reject the request.
  if (!member) throw new Error("You are not a member of this group");

  // Insert the vote row.
  // SQL: INSERT INTO decisionVotes (decisionId, memberId, vote, comment) VALUES (...)
  // memberId is the groupMembers row ID (not the user ID) so the vote is
  // tied to the specific membership record.
  const [vote] = await db.insert(decisionVotes)
    .values({ decisionId: input.decisionId, memberId: member.id, vote: input.vote as "approve" | "reject" | "abstain", comment: input.comment })
    .returning();
  // Return the newly created vote row.
  return vote;
}

// Exported server action: changes an existing vote (e.g. from "approve" to "reject").
// Parameters:
//   voteId  — the UUID of the decisionVotes row to update
//   vote    — the new vote value: "approve", "reject", or "abstain"
//   comment — optional updated explanation
// Returns: the updated decisionVotes row
export async function changeVote(voteId: string, vote: string, comment?: string) {
  // Confirm the caller is authenticated before allowing a vote change.
  await getAuthUser();
  // SQL:
  //   UPDATE decisionVotes
  //   SET vote = vote, comment = comment
  //   WHERE id = voteId
  const [updated] = await db.update(decisionVotes)
    .set({ vote: vote as "approve" | "reject" | "abstain", comment })
    .where(eq(decisionVotes.id, voteId))
    .returning();
  // Return the updated vote row.
  return updated;
}

// Exported server action: fetches the outcome record for a decision.
// An outcome is recorded after the repair has been completed and documents
// whether it succeeded, what it cost, and what was learned.
// Parameters:
//   decisionId — the UUID of the decisions row whose outcome to retrieve
// Returns: the decisionOutcomes row or null if no outcome has been recorded yet
export async function getDecisionOutcome(decisionId: string) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // SQL: SELECT * FROM decisionOutcomes WHERE decisionId = decisionId LIMIT 1
  const [outcome] = await db.select().from(decisionOutcomes).where(eq(decisionOutcomes.decisionId, decisionId)).limit(1);
  // Return the found row or null if no outcome exists yet.
  return outcome ?? null;
}

// Exported server action: saves (or updates) the outcome of a completed repair.
// Uses an upsert — if an outcome row already exists for this decision, it
// overwrites it; otherwise a new row is inserted.
// Parameters:
//   input.decisionId  — the UUID of the decisions row this outcome belongs to
//   input.success     — true if the repair went well, false if it failed
//   input.actualCost  — optional actual money spent (as a string, e.g. "750.00")
//   input.costDelta   — optional difference between estimated and actual cost
//   input.notes       — optional free-text notes about what went well or poorly
//   input.completedAt — optional timestamp of when the repair finished
// Returns: the inserted or updated decisionOutcomes row
export async function recordOutcome(input: {
  decisionId: string;
  success: boolean;
  actualCost?: string;
  costDelta?: string;
  notes?: string;
  completedAt?: Date;
}) {
  // Confirm the caller is authenticated before writing outcome data.
  await getAuthUser();
  // Separate `notes` from the rest of the input fields because the database
  // column is named `whatWentWell` — we need to remap it before inserting.
  const { notes, ...rest } = input;
  // Insert the outcome row or update the existing one if a row for this
  // decisionId already exists (decisionOutcomes.decisionId is the unique target).
  // `whatWentWell` stores the free-text notes field.
  // `completedAt` defaults to now if the caller didn't supply a specific time.
  const [outcome] = await db.insert(decisionOutcomes)
    .values({ ...rest, whatWentWell: notes, completedAt: input.completedAt ?? new Date() })
    .onConflictDoUpdate({ target: decisionOutcomes.decisionId, set: { ...rest, whatWentWell: notes, completedAt: input.completedAt ?? new Date() } })
    .returning();
  // Return the saved outcome row.
  return outcome;
}

// Exported server action: returns a summary count of how decisions in a group
// were resolved — broken down by type: DIY, hire a pro, or defer.
// Parameters:
//   groupId   — the UUID of the group to summarise
//   timeRange — optional string for future date-based filtering (not yet applied)
// Returns: an object with counts { diy, pro, deferred, total }
export async function getGroupResolutionStats(groupId: string, timeRange?: string) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // First, get the IDs of all issues that belong to this group.
  // SQL: SELECT id FROM issues WHERE groupId = groupId
  const issueList = await db.select({ id: issues.id }).from(issues).where(eq(issues.groupId, groupId));
  // Extract just the ID values into a plain array.
  const issueIds = issueList.map((i) => i.id);
  // If the group has no issues at all, return zeroed-out counts immediately
  // to avoid running an IN query with an empty array (which is invalid SQL).
  if (issueIds.length === 0) return { diy: 0, pro: 0, deferred: 0, total: 0 };

  // Fetch all decisions for these issues, joined with their selected options
  // so we can inspect each option's `type` field.
  // SQL:
  //   SELECT decisions.*, decisionOptions.*
  //   FROM decisions
  //   INNER JOIN decisionOptions ON decisions.selectedOptionId = decisionOptions.id
  //   WHERE decisions.issueId IN (issueIds)
  const decisionsResult = await db.select({ decision: decisions, option: decisionOptions })
    .from(decisions).innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .where(inArray(decisions.issueId, issueIds));

  // Count how many decisions selected a "diy" type option.
  const diy = decisionsResult.filter((d) => d.option.type === "diy").length;
  // Count how many decisions selected a "hire" (hire a professional) type option.
  const pro = decisionsResult.filter((d) => d.option.type === "hire").length;
  // Count how many decisions selected a "defer" (postpone) type option.
  const deferred = decisionsResult.filter((d) => d.option.type === "defer").length;
  // Return all four counts as a plain object.
  return { diy, pro, deferred, total: decisionsResult.length };
}

// Exported server action: returns a pageable history of past decisions for a
// group, ordered newest-first. Useful for showing "what we decided before"
// to help inform future decisions.
// Parameters:
//   groupId — the UUID of the group whose decision history to fetch
//   limit   — optional max number of rows to return (defaults to 20)
// Returns: an array of { decision, option, issue } objects
export async function getPreferenceHistory(groupId: string, limit?: number) {
  // Confirm the caller is authenticated.
  await getAuthUser();
  // Get the IDs of all issues in the group (needed for the IN filter below).
  // SQL: SELECT id FROM issues WHERE groupId = groupId
  const issueList = await db.select({ id: issues.id }).from(issues).where(eq(issues.groupId, groupId));
  // Extract the issue IDs into a plain array.
  const issueIds = issueList.map((i) => i.id);
  // If there are no issues, there can be no decision history — return early.
  if (issueIds.length === 0) return [];
  // Fetch decisions with their selected options and the parent issues, ordered
  // newest-first, capped at the specified limit (or 20 if not specified).
  // SQL:
  //   SELECT decisions.*, decisionOptions.*, issues.*
  //   FROM decisions
  //   INNER JOIN decisionOptions ON decisions.selectedOptionId = decisionOptions.id
  //   INNER JOIN issues ON decisions.issueId = issues.id
  //   WHERE decisions.issueId IN (issueIds)
  //   ORDER BY decisions.approvedAt DESC
  //   LIMIT <limit ?? 20>
  return db.select({ decision: decisions, option: decisionOptions, issue: issues })
    .from(decisions).innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .innerJoin(issues, eq(decisions.issueId, issues.id))
    .where(inArray(decisions.issueId, issueIds))
    .orderBy(desc(decisions.approvedAt))
    .limit(limit ?? 20);
}
