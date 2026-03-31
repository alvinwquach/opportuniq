// Tell Next.js this entire module runs only on the server (Node.js process).
// No code in this file is ever sent to or executed in the browser.
"use server";

// createClient() creates a Supabase client that is aware of the current
// HTTP request's cookies, letting us call supabase.auth.getUser() to
// identify who is making the request.
import { createClient } from "@/lib/supabase/server";
// db is the Drizzle ORM client connected to our PostgreSQL database.
// We use it to build and execute all SQL queries in this file.
import { db } from "@/app/db/client";
// Import every database table (schema object) we need to query.
// Each name here corresponds to a table in PostgreSQL.
import {
  groups, groupMembers, groupConstraints, groupInvitations, budgetContributions,
  issues, decisions, decisionOptions, decisionOutcomes, users,
} from "@/app/db/schema";
// Import Drizzle query-building helpers:
// eq  → WHERE a = b
// and → combine multiple WHERE conditions with AND
// inArray → WHERE col IN (array)
// desc → ORDER BY col DESC (newest / largest first)
// isNull → WHERE col IS NULL
// gte → WHERE col >= value
import { eq, and, inArray, desc, isNull, gte } from "drizzle-orm";

// A fixed palette of hex colors used to give each group member a distinct
// avatar background color when we render the member list on the page.
// We cycle through this array modulo its length so we never run out of colors.
const MEMBER_COLORS = ["#3ECF8E", "#249361", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];

// getGroupsPageData is the single server action that powers the Groups
// overview page. It fetches all groups the current user belongs to, plus
// every piece of data those groups need (members, issues, budgets, savings,
// invitations) and assembles everything into one cohesive return value so
// the page only needs one network round-trip.
export async function getGroupsPageData() {
  // Create a server-side Supabase client that can read the user's session
  // cookie from the incoming HTTP request.
  const supabase = await createClient();
  // Ask Supabase Auth who is currently logged in. If the session cookie is
  // valid this resolves to the authenticated user object; otherwise user is null.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no logged-in user, stop immediately and surface an error.
  // This prevents any unauthenticated person from reading group data.
  if (!user) throw new Error("Unauthorized");

  // Fetch every group this user is an ACTIVE member of, joined newest first.
  // We join groupMembers → groups so we get both the membership record
  // (role, status) and the full group details (name, postalCode, createdAt)
  // in a single query instead of two separate round-trips.
  const userGroupsResult = await db
    .select({ group: groups, membership: groupMembers })
    .from(groupMembers).innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.status, "active")))
    .orderBy(desc(groups.createdAt));

  // Define the zero-state return value used when the user is not in any group.
  // Returning a consistent shape (instead of null) means the UI never needs
  // to guard against a missing object — it just renders empty states.
  const emptyResult = {
    totalGroups: 0, totalMembers: 0, totalSavings: 0, totalIssues: 0,
    activeIssueCount: 0, resolvedIssueCount: 0, groups: [], selectedGroup: null,
  };

  // If the user has no active group memberships, return the empty result now
  // and skip all remaining database queries (nothing to load).
  if (userGroupsResult.length === 0) return emptyResult;

  // Extract just the group IDs into a plain array so we can pass them to
  // SQL IN clauses in the parallel queries below. This avoids repeating
  // the join logic in every subsequent query.
  const groupIds = userGroupsResult.map((g) => g.group.id);

  // Run four independent database queries at the same time using Promise.all.
  // Because these queries don't depend on each other's results we can fire
  // them simultaneously — this is much faster than running them one after
  // another and waiting for each to finish before starting the next.
  const [allMembersResult, allIssuesResult, constraintsResult, contributionsResult] = await Promise.all([
    // Query 1: Fetch every active member across all of the user's groups,
    // joining with the users table so we also get the member's name and email
    // (stored in the users table, not groupMembers).
    db.select({ member: groupMembers, user: users })
      .from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id))
      .where(and(inArray(groupMembers.groupId, groupIds), eq(groupMembers.status, "active"))),

    // Query 2: Fetch all issues that belong to any of the user's groups,
    // ordered by most recently updated so the freshest issues appear first.
    db.select().from(issues).where(inArray(issues.groupId, groupIds)).orderBy(desc(issues.updatedAt)),

    // Query 3: Fetch the budget/constraint settings for every group
    // (monthly budget cap, shared balance, emergency buffer amounts).
    db.select().from(groupConstraints).where(inArray(groupConstraints.groupId, groupIds)),

    // Query 4: Fetch all budget contributions made to any of the user's groups,
    // ordered newest first so we can easily pick the most recent ones.
    db.select().from(budgetContributions)
      .where(inArray(budgetContributions.groupId, groupIds))
      .orderBy(desc(budgetContributions.contributedAt)),
  ]);

  // Build a lookup Map where:
  //   key   → group ID (string)
  //   value → array of member rows (each containing both groupMembers and users columns)
  // This lets us retrieve all members for a specific group in O(1) instead of
  // scanning the full allMembersResult array every time we need members for a group.
  const membersByGroup = new Map<string, typeof allMembersResult>();
  for (const m of allMembersResult) {
    // Look up the existing list for this group, or start a new empty array.
    const list = membersByGroup.get(m.member.groupId) || [];
    // Append the current member row to that group's list.
    list.push(m);
    // Write the updated list back into the Map under this group's ID.
    membersByGroup.set(m.member.groupId, list);
  }

  // Build a lookup Map where:
  //   key   → group ID (string)
  //   value → array of issue rows belonging to that group
  // Same pattern as above: O(1) issue lookup per group.
  const issuesByGroup = new Map<string, (typeof allIssuesResult)[number][]>();
  for (const issue of allIssuesResult) {
    // Retrieve the existing array for this group, or start fresh.
    const list = issuesByGroup.get(issue.groupId) || [];
    // Add this issue to the group's list.
    list.push(issue);
    // Save the updated list back.
    issuesByGroup.set(issue.groupId, list);
  }

  // Build a lookup Map where:
  //   key   → group ID (string)
  //   value → a single groupConstraints row (one constraint record per group)
  // Using Map constructor with an array of [key, value] pairs is a shorthand
  // for the push loop pattern used above — valid here because each group has
  // at most one constraint row.
  const constraintsByGroup = new Map(constraintsResult.map((c) => [c.groupId, c]));

  // Build a lookup Map where:
  //   key   → group ID (string)
  //   value → array of budgetContribution rows for that group
  const contributionsByGroup = new Map<string, (typeof contributionsResult)[number][]>();
  for (const c of contributionsResult) {
    // Retrieve the existing list or start a new one.
    const list = contributionsByGroup.get(c.groupId) || [];
    // Append the current contribution row.
    list.push(c);
    // Persist the updated list.
    contributionsByGroup.set(c.groupId, list);
  }

  // Collect all issue IDs so we can look up their decisions in the next query.
  // We need this list before we can query the decisions table because decisions
  // are linked to issues, not directly to groups.
  const issueIds = allIssuesResult.map((i) => i.id);
  // Declare the variable that will hold the fully-assembled decision records.
  // We initialise it to an empty array so the code further down still works
  // even when there are no issues at all.
  let decisionsWithOutcomes: Array<{
    decision: typeof decisions.$inferSelect;
    option: typeof decisionOptions.$inferSelect | null;
    outcome: typeof decisionOutcomes.$inferSelect | null;
    issueId: string; groupId: string;
  }> = [];

  // Only query decisions and outcomes if there are actually issues to look up.
  // Skipping this block when issueIds is empty avoids a pointless DB round-trip
  // and prevents Drizzle from generating an invalid "IN ()" SQL clause.
  if (issueIds.length > 0) {
    // Fetch every decision that belongs to one of our issues, and left-join the
    // selected decision option so we know what type of resolution was chosen
    // (diy, hired, deferred, etc.).  A left join means we still get the decision
    // row even if selectedOptionId is null (i.e. no option was picked yet).
    const decisionsResult = await db
      .select({ decision: decisions, option: decisionOptions })
      .from(decisions).leftJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .where(inArray(decisions.issueId, issueIds));

    // Only query outcomes if we actually found some decisions to look up.
    if (decisionsResult.length > 0) {
      // Extract the decision IDs so we can query their outcome rows.
      const decisionIds = decisionsResult.map((d) => d.decision.id);
      // Fetch the outcome record for each decision. An outcome records the
      // real-world result: actual cost, cost delta (savings), completion date.
      const outcomesResult = await db.select().from(decisionOutcomes)
        .where(inArray(decisionOutcomes.decisionId, decisionIds));
      // Build a Map where:
      //   key   → decision ID (string)
      //   value → the outcome row for that decision
      // This lets us attach an outcome to a decision in O(1) below.
      const outcomeMap = new Map(outcomesResult.map((o) => [o.decisionId, o]));
      // Build a Map where:
      //   key   → issue ID (string)
      //   value → the group ID that issue belongs to
      // We need this because decisions only store issueId, not groupId directly,
      // but we want to aggregate savings by group.
      const issueGroupMap = new Map(allIssuesResult.map((i) => [i.id, i.groupId]));
      // Combine the decision, its selected option, its outcome, and the parent
      // group ID into one flat object per decision for easy consumption below.
      decisionsWithOutcomes = decisionsResult.map((d) => ({
        decision: d.decision, option: d.option,
        // Look up the outcome by decision ID; fall back to null if none exists yet.
        outcome: outcomeMap.get(d.decision.id) || null,
        issueId: d.decision.issueId,
        // Resolve the group ID via the issue-to-group map; empty string if missing.
        groupId: issueGroupMap.get(d.decision.issueId) || "",
      }));
    }
  }

  // Build a Map where:
  //   key   → group ID (string)
  //   value → cumulative savings (number, in dollars) for that group
  // Savings are derived from decision outcomes: each outcome stores a
  // costDelta which is the difference between estimated and actual cost.
  // A negative delta means we spent less than expected — that's money saved.
  // We use Math.abs() because cost savings are stored as negative deltas.
  const savingsByGroup = new Map<string, number>();
  for (const d of decisionsWithOutcomes) {
    if (d.outcome?.costDelta) {
      // Convert the costDelta string to a float, then take the absolute value
      // so that a negative delta (money saved) becomes a positive savings figure.
      const savings = Math.abs(parseFloat(d.outcome.costDelta));
      // Add these savings to the running total for this group.
      savingsByGroup.set(d.groupId, (savingsByGroup.get(d.groupId) || 0) + savings);
    }
  }

  // Capture the current timestamp so we can filter invitations that haven't
  // expired yet.  We define "now" once here to keep all comparisons consistent.
  const now = new Date();
  // Fetch all pending (not yet accepted, not yet expired) invitations for the
  // user's groups. We only want invitations that are still actionable.
  // - isNull(acceptedAt) → invitation has not been accepted
  // - gte(expiresAt, now) → invitation has not yet passed its expiry date
  const pendingInvitationsResult = await db.select().from(groupInvitations)
    .where(and(inArray(groupInvitations.groupId, groupIds), isNull(groupInvitations.acceptedAt), gte(groupInvitations.expiresAt, now)));

  // Build a Map where:
  //   key   → group ID (string)
  //   value → array of pending invitation rows for that group
  const invitationsByGroup = new Map<string, (typeof pendingInvitationsResult)[number][]>();
  for (const inv of pendingInvitationsResult) {
    // Get the existing list for this group, or start a new empty one.
    const list = invitationsByGroup.get(inv.groupId) || [];
    // Append this invitation to the list.
    list.push(inv);
    // Save back to the Map.
    invitationsByGroup.set(inv.groupId, list);
  }

  // Transform each group + membership pair into a summary card object that
  // the Groups overview page can render without any further data fetching.
  const groupsWithStats = userGroupsResult.map(({ group, membership }) => {
    // Look up all members for this group from the pre-built Map (O(1) lookup).
    const members = membersByGroup.get(group.id) || [];
    // Look up all issues for this group.
    const groupIssues = issuesByGroup.get(group.id) || [];
    // Active issues are everything that is NOT completed or deferred —
    // i.e. still requiring attention from the group.
    const activeIssues = groupIssues.filter((i) => !["completed", "deferred"].includes(i.status));
    // Resolved issues are those whose status is exactly "completed".
    const resolvedIssues = groupIssues.filter((i) => i.status === "completed");
    // Total dollar savings achieved for this group (may be 0 if no outcomes yet).
    const savings = savingsByGroup.get(group.id) || 0;
    return {
      id: group.id, name: group.name, postalCode: group.postalCode, role: membership.role,
      memberCount: members.length, issueCount: groupIssues.length,
      activeIssueCount: activeIssues.length, resolvedCount: resolvedIssues.length, savings,
      // Only send the first three members to the UI for the avatar stack preview.
      // Sending all members would waste bandwidth for large groups.
      members: members.slice(0, 3).map((m) => ({
        id: m.member.id,
        name: m.user.name,
        // Use the first character of the member's name (uppercased) as a fallback
        // avatar letter when no profile photo is available.
        avatar: m.user.name?.[0]?.toUpperCase() || "?",
        role: m.member.role,
      })),
      // Convert the JavaScript Date to an ISO 8601 string so it serialises
      // correctly when Next.js passes this data from Server to Client Component.
      createdAt: group.createdAt.toISOString(),
    };
  });

  // The "selected group" shown in the detail panel defaults to the first (newest)
  // group returned by the initial query.
  const firstGroup = userGroupsResult[0];
  // Initialise to null so we can conditionally build the full detail object below.
  let selectedGroup = null;

  // Only build the selected-group detail block if there is at least one group.
  if (firstGroup) {
    // Destructure for convenience — these are the raw DB rows for the first group.
    const group = firstGroup.group;
    const membership = firstGroup.membership;
    // Retrieve all members of this specific group from our pre-built lookup Map.
    const members = membersByGroup.get(group.id) || [];
    // Retrieve all issues for this specific group.
    const groupIssues = issuesByGroup.get(group.id) || [];
    // Retrieve the budget/constraint settings for this group (may be undefined).
    const constraints = constraintsByGroup.get(group.id);
    // Retrieve all contributions made to this group's shared fund.
    const contributions = contributionsByGroup.get(group.id) || [];
    // Retrieve pending invitations for this group.
    const invitations = invitationsByGroup.get(group.id) || [];

    // Calculate active and resolved issue counts for this specific group,
    // using the same filtering logic as the group card summary above.
    const activeIssues = groupIssues.filter((i) => !["completed", "deferred"].includes(i.status));
    const resolvedIssues = groupIssues.filter((i) => i.status === "completed");
    // Total savings for this group.
    const savings = savingsByGroup.get(group.id) || 0;

    // Build a Map where:
    //   key   → member ID (string, groupMembers.id)
    //   value → total dollar amount this member has contributed to the group fund
    // We sum across all contribution rows for each member.
    const memberContributionMap = new Map<string, number>();
    for (const c of contributions) {
      memberContributionMap.set(c.memberId, (memberContributionMap.get(c.memberId) || 0) + parseFloat(c.amount));
    }

    // Build two Maps for per-member issue activity:
    //   issuesCreatedByMember: key → member ID, value → count of issues they opened
    //   issuesResolvedByMember: key → member ID, value → count of issues they resolved
    // These power the "contribution score" displayed on each member's card.
    const issuesCreatedByMember = new Map<string, number>();
    const issuesResolvedByMember = new Map<string, number>();
    for (const issue of groupIssues) {
      // Count the issue toward the creator's tally (if createdBy is set).
      if (issue.createdBy) issuesCreatedByMember.set(issue.createdBy, (issuesCreatedByMember.get(issue.createdBy) || 0) + 1);
      // Count the issue toward the resolver's tally only if the issue is completed
      // (resolvedBy on an open issue would be misleading).
      if (issue.resolvedBy && issue.status === "completed") issuesResolvedByMember.set(issue.resolvedBy, (issuesResolvedByMember.get(issue.resolvedBy) || 0) + 1);
    }

    // Shape each member into the object the MemberCard component expects,
    // pulling contribution totals and issue activity counts from the Maps above.
    const memberDetails = members.map((m) => ({
      id: m.member.id, userId: m.user.id, name: m.user.name, email: m.user.email,
      // Single uppercase letter used as an avatar fallback, or "?" if name is null.
      avatar: m.user.name?.[0]?.toUpperCase() || "?",
      role: m.member.role,
      // Convert joinedAt to ISO string, or null if the member was imported without a join date.
      joinedAt: m.member.joinedAt?.toISOString() ?? null,
      // Dollar total contributed by this member; 0 if they haven't contributed yet.
      contributions: memberContributionMap.get(m.member.id) || 0,
      // Number of issues this member has opened.
      issuesCreated: issuesCreatedByMember.get(m.member.id) || 0,
      // Number of completed issues this member resolved.
      issuesResolved: issuesResolvedByMember.get(m.member.id) || 0,
    }));

    // Shape each pending invitation into a minimal object safe to send to the client
    // (we intentionally exclude internal fields like tokens).
    const pendingInvitations = invitations.map((inv) => ({
      id: inv.id, email: inv.inviteeEmail, role: inv.role,
      // Convert dates to ISO strings for safe serialisation across the server/client boundary.
      createdAt: inv.createdAt.toISOString(), expiresAt: inv.expiresAt.toISOString(),
    }));

    // Parse the budget/constraint fields from string to number.
    // These are stored as numeric strings in PostgreSQL (NUMERIC type).
    // null is preserved so the UI can distinguish "not set" from "set to 0".
    const monthlyBudget = constraints?.monthlyBudget ? parseFloat(constraints.monthlyBudget) : null;
    // sharedBalance defaults to 0 (not null) because it's a running balance, not a setting.
    const sharedBalance = constraints?.sharedBalance ? parseFloat(constraints.sharedBalance) : 0;
    const emergencyFund = constraints?.emergencyBuffer ? parseFloat(constraints.emergencyBuffer) : null;
    // Sum every contribution amount to get the total money put into the shared fund.
    const totalContributions = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    // monthlySpent = money that flowed out (contributions minus remaining balance).
    // Math.max(0, ...) prevents a negative "spent" value in edge cases.
    const monthlySpent = Math.max(0, totalContributions - sharedBalance);
    // budgetUsedPercent shows how much of the monthly budget cap has been consumed.
    // We cap at 100 to avoid rendering a progress bar over 100%.
    const budgetUsedPercent = monthlyBudget ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;

    // Count how many decisions for this group chose the DIY option — doing the
    // repair themselves rather than hiring a contractor.
    const diyDecisions = decisionsWithOutcomes.filter((d) => d.groupId === group.id && d.option?.type === "diy");
    // All decisions for this group, regardless of option type, for the denominator.
    const totalDecisions = decisionsWithOutcomes.filter((d) => d.groupId === group.id);
    // diyRate is the percentage of issues resolved by DIY vs. hiring.
    // Guard against division by zero when no decisions exist yet.
    const diyRate = totalDecisions.length > 0 ? (diyDecisions.length / totalDecisions.length) * 100 : 0;

    // Sum all contribution amounts across all members to use as the denominator
    // when calculating each member's percentage share of contributions.
    const totalContrib = Array.from(memberContributionMap.values()).reduce((sum, v) => sum + v, 0);
    // Build the pie-chart dataset: one slice per member who has contributed at least once.
    const contributionData = members
      // Exclude members who haven't made any contributions yet (they'd be 0% slices).
      .filter((m) => memberContributionMap.get(m.member.id))
      .map((m, i) => {
        const amount = memberContributionMap.get(m.member.id) || 0;
        return {
          name: m.user.name || "Unknown",
          // Express this member's contribution as a percentage of the group total.
          // Guard against division by zero if totalContrib is somehow 0.
          value: totalContrib > 0 ? (amount / totalContrib) * 100 : 0,
          // Assign a color from the palette, cycling with modulo so we never run out.
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        };
      });

    // Monthly savings data (last 6 months)
    // Build the line/bar chart dataset showing savings and spending for each of
    // the last 6 calendar months, used to visualise trends over time.
    const monthlySavingsData = [];
    // i=5 is 5 months ago; i=0 is the current month. Descending loop so we push
    // oldest first and the array ends up in chronological order.
    for (let i = 5; i >= 0; i--) {
      // Compute the 1st of the target month. new Date(year, month-i, 1) automatically
      // handles year rollovers (e.g., January minus 2 months = November of prior year).
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Short month label like "Jan", "Feb" for chart axis labels.
      const monthKey = date.toLocaleString("en-US", { month: "short" });
      // First millisecond of the target month (inclusive start of range).
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      // Last day of the target month (day 0 of the NEXT month = last day of THIS month).
      // This gives us the inclusive end of the date range for filtering.
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      // Sum the cost savings from all decisions in this group that were completed
      // within the target month's date range.
      const monthlySavings = decisionsWithOutcomes
        // Only decisions for this specific group that have an outcome with a completion date.
        .filter((d) => d.groupId === group.id && d.outcome?.completedAt)
        // Only outcomes completed within the target month window.
        .filter((d) => { const ca = new Date(d.outcome!.completedAt!); return ca >= monthStart && ca <= monthEnd; })
        // Sum the absolute value of each outcome's costDelta. costDelta is stored as
        // a negative number for money saved, so Math.abs converts it to a positive figure.
        .reduce((sum, d) => sum + Math.abs(parseFloat(d.outcome?.costDelta || "0")), 0);
      // Sum all contribution amounts recorded during the target month window.
      const monthlySpentContrib = contributions
        .filter((c) => { const ca = new Date(c.contributedAt); return ca >= monthStart && ca <= monthEnd; })
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);
      // Push one data point per month into the chart dataset.
      monthlySavingsData.push({ month: monthKey, savings: monthlySavings, spent: monthlySpentContrib });
    }

    // Number of DIY resolutions for this group (already computed above).
    const diyCount = diyDecisions.length;
    // Number of hired-out resolutions = total decisions minus DIY decisions.
    const hiredCount = totalDecisions.length - diyCount;
    // Shape the data into the format expected by the grouped bar chart component.
    // One entry per group is enough since this is the detail view for a single group.
    const resolutionData = [{ name: group.name, diy: diyCount, hired: hiredCount }];

    // Take the four most recently updated issues for the "Recent Issues" widget.
    // Issues are already sorted by updatedAt desc from the original query.
    const recentIssues = groupIssues.slice(0, 4).map((issue) => ({
      id: issue.id,
      title: issue.title || "Untitled",
      // Prefer the more specific subcategory label; fall back to the broad category.
      category: issue.subcategory || issue.category,
      status: issue.status,
      priority: issue.priority || "medium",
      createdAt: issue.createdAt.toISOString(),
    }));

    // Build a Map where:
    //   key   → member ID (string, groupMembers.id)
    //   value → the member's display name (string | null)
    // Used to look up names when assembling activity feed messages below.
    const memberNameMap = new Map(members.map((m) => [m.member.id, m.user.name]));
    // Typed array that collects activity feed events from multiple sources before
    // we sort them all together chronologically at the end.
    const activities: Array<{ id: string; type: string; message: string; memberName: string | null; memberAvatar: string | null; savings: number | null; timestamp: Date }> = [];
    // Source 1: generate one activity item for each completed issue that has
    // a resolvedAt timestamp, attributing it to the resolving member by name.
    for (const issue of groupIssues.filter((i) => i.status === "completed")) {
      if (issue.resolvedAt) {
        // Look up the resolver's display name; fall back to "Someone" if unknown.
        const memberName = issue.resolvedBy ? memberNameMap.get(issue.resolvedBy) : null;
        activities.push({ id: `issue-${issue.id}`, type: "resolved", message: `${memberName || "Someone"} resolved "${issue.title || "issue"}"`, memberName: memberName || null, memberAvatar: memberName?.[0]?.toUpperCase() || null, savings: null, timestamp: issue.resolvedAt });
      }
    }
    // Source 2: generate one activity item for each budget contribution, showing
    // how much the contributing member added to the shared fund.
    for (const c of contributions) {
      const memberName = memberNameMap.get(c.memberId);
      activities.push({ id: `contrib-${c.id}`, type: "contribution", message: `${memberName || "Someone"} contributed $${parseFloat(c.amount).toFixed(0)}`, memberName: memberName || null, memberAvatar: memberName?.[0]?.toUpperCase() || null, savings: null, timestamp: c.contributedAt });
    }
    // Source 3: generate one activity item for each pending invitation, showing
    // who was invited and in what role.
    for (const inv of invitations) {
      activities.push({ id: `invite-${inv.id}`, type: "invitation", message: `Invited ${inv.inviteeEmail} as ${inv.role}`, memberName: null, memberAvatar: null, savings: null, timestamp: inv.createdAt });
    }
    // Sort all activity items newest-first, keep only the four most recent,
    // then convert each timestamp Date to an ISO string for serialisation.
    const recentActivity = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 4)
      .map((a) => ({ ...a, timestamp: a.timestamp.toISOString() }));

    // Assemble the full detail object for the selected (first) group, combining
    // raw group fields with all the computed stats, charts, and lists built above.
    selectedGroup = {
      id: group.id, name: group.name, postalCode: group.postalCode, role: membership.role,
      createdAt: group.createdAt.toISOString(), openIssueCount: activeIssues.length, resolvedCount: resolvedIssues.length,
      balance: sharedBalance, savings, monthlyBudget, monthlySpent, emergencyFund,
      members: memberDetails, pendingInvitations, budgetUsedPercent, diyRate: Math.round(diyRate),
      contributionData, monthlySavingsData, resolutionData, recentIssues, recentActivity,
    };
  }

  // Count UNIQUE users across all groups (a person in multiple groups should
  // only be counted once). We extract every user ID into a Set, which
  // automatically deduplicates, then read the Set's size.
  const totalMembers = new Set(allMembersResult.map((m) => m.user.id)).size;
  // Sum savings across all groups to produce a single portfolio-level figure.
  const totalSavings = Array.from(savingsByGroup.values()).reduce((sum, s) => sum + s, 0);
  // Count issues that are still in progress (not completed or deferred).
  const activeIssueCount = allIssuesResult.filter((i) => !["completed", "deferred"].includes(i.status)).length;
  // Count issues that have been fully completed.
  const resolvedIssueCount = allIssuesResult.filter((i) => i.status === "completed").length;

  // Return the complete payload for the Groups page:
  // - Top-level aggregate stats (totalGroups, totalMembers, totalSavings, etc.)
  // - The summary card data for every group (groups)
  // - The full detail object for the first (default-selected) group (selectedGroup)
  return {
    totalGroups: groupsWithStats.length, totalMembers, totalSavings,
    totalIssues: allIssuesResult.length, activeIssueCount, resolvedIssueCount,
    groups: groupsWithStats, selectedGroup,
  };
}
