// Tell Next.js this entire module runs only on the server (Node.js),
// never in the browser — this keeps DB credentials and query logic off the client bundle.
"use server";

// createClient: factory that creates a Supabase auth client scoped to the current
// HTTP request, so we can identify which user is logged in via their session cookie.
import { createClient } from "@/lib/supabase/server";
// db: the Drizzle ORM instance that talks to our PostgreSQL database.
import { db } from "@/app/db/client";
// groups: the Drizzle table definition for household/property groups.
// groupMembers: the join table linking users to groups (with a membership status).
// issues: the table of repair/maintenance issues logged against a group.
// decisions: the table recording which repair option was chosen for an issue.
// decisionOptions: the table of available DIY or hire options generated for an issue.
// decisionOutcomes: the table recording the actual result (cost delta, etc.) after a decision was acted on.
import { groups, groupMembers, issues, decisions, decisionOptions, decisionOutcomes } from "@/app/db/schema";
// eq: builds "WHERE col = value".
// and: combines multiple WHERE conditions with SQL AND.
// inArray: builds "WHERE col IN (array)" — used when filtering by a list of IDs.
// desc: builds "ORDER BY col DESC" (newest first).
import { eq, and, inArray, desc } from "drizzle-orm";

// CATEGORY_COLORS: maps raw issue category/subcategory strings to hex color codes
// so each category has a consistent visual identity in charts and badges.
// Both snake_case DB values (e.g. "home_repair") and Title Case UI labels (e.g. "Plumbing") are included
// because the data can arrive in either form depending on how it was entered.
const CATEGORY_COLORS: Record<string, string> = {
  automotive: "#3ECF8E", home_repair: "#3ECF8E", appliance: "#8b5cf6",
  cleaning: "#10b981", yard_outdoor: "#22c55e", safety: "#ef4444",
  maintenance: "#f59e0b", installation: "#06b6d4", other: "#6b7280",
  Plumbing: "#3ECF8E", HVAC: "#06b6d4", Electrical: "#f59e0b",
  Appliances: "#8b5cf6", Security: "#ef4444", Garage: "#f59e0b",
};

// getIssuesPageData: the single server action that fetches every piece of data
// needed to render the Issues dashboard page. It resolves groups → issues → decisions
// → outcomes in a series of queries (some parallel) and assembles a rich payload
// so the client never needs to make additional requests.
export async function getIssuesPageData() {
  // Create a Supabase auth client tied to this request's cookies/session.
  const supabase = await createClient();
  // Ask Supabase who the currently logged-in user is.
  const { data: { user } } = await supabase.auth.getUser();
  // Stop immediately if no authenticated user — we must not expose another user's issues.
  if (!user) throw new Error("Unauthorized");

  // Fetch all groups that the current user is a member of (active membership only).
  // We join groupMembers to groups so we get the full group row in one query.
  const userGroupsResult = await db
    .select({ group: groups, membership: groupMembers })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    // Filter: only rows where this user is the member AND the membership is currently active.
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.status, "active")));

  // Keep only memberships confirmed as active (double-check after the JOIN, since status can change).
  const activeGroups = userGroupsResult.filter((g) => g.membership.status === "active");
  // Extract just the group IDs as an array of strings for use in subsequent IN queries.
  // The type guard ensures we only keep non-empty string IDs (guards against null/undefined in the DB).
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  // Define the empty/zero-state result returned when the user has no active groups,
  // so the UI can render an empty state gracefully without special-casing undefined.
  const emptyResult = {
    totalSaved: 0, diyCount: 0, proCount: 0, activeIssueCount: 0,
    issues: [], savingsOverTime: [], categoryDistribution: [],
    resolutionBreakdown: { diy: 0, pro: 0, diySuccessRate: 0 }, groups: [], categories: [],
  };

  // If the user has no active groups they can't have any issues — return the empty state immediately
  // rather than attempting an IN query with an empty array (which is invalid SQL).
  if (groupIds.length === 0) return emptyResult;

  // Fetch all issues belonging to any of the user's active groups, joined with their
  // group details so we have the group name available for display. Sorted newest-first.
  const allIssuesResult = await db
    .select({ issue: issues, group: groups })
    .from(issues).innerJoin(groups, eq(issues.groupId, groups.id))
    .where(inArray(issues.groupId, groupIds)).orderBy(desc(issues.updatedAt));

  // Collect all issue IDs so we can fetch decisions and outcomes in a single IN query
  // instead of one query per issue.
  const issueIds = allIssuesResult.map((r) => r.issue.id);
  // Initialise the combined decisions+outcomes array that will be populated below.
  // The TypeScript type annotation documents the exact shape each element must have.
  let decisionsWithOutcomes: Array<{
    decision: typeof decisions.$inferSelect;
    option: typeof decisionOptions.$inferSelect;
    outcome: typeof decisionOutcomes.$inferSelect | null;
    issueId: string;
  }> = [];

  // Only run the decisions queries if there are issues — avoids an invalid IN([]) SQL error.
  if (issueIds.length > 0) {
    // Fetch every decision that was made on any of the issues, joined with the specific
    // option that was selected (e.g. "DIY: fix the pipe yourself for $50").
    const decisionsResult = await db
      .select({ decision: decisions, option: decisionOptions })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .where(inArray(decisions.issueId, issueIds));

    // If any decisions were found, fetch the outcomes for all of them in one query.
    if (decisionsResult.length > 0) {
      // Extract the decision IDs to use in the outcomes IN query.
      const decisionIds = decisionsResult.map((d) => d.decision.id);
      // Fetch outcome records for every decision at once — outcomes tell us the actual
      // cost delta (how much was saved or overspent compared to the estimate).
      const outcomesResult = await db.select().from(decisionOutcomes)
        .where(inArray(decisionOutcomes.decisionId, decisionIds));
      // Build a Map keyed by decisionId → outcome row for O(1) lookup below.
      // Key: decision ID (string). Value: the full outcome row for that decision.
      const outcomeMap = new Map(outcomesResult.map((o) => [o.decisionId, o]));
      // Combine each decision+option pair with its outcome (or null if no outcome recorded yet),
      // and attach the issueId for easy grouping in the next step.
      decisionsWithOutcomes = decisionsResult.map((d) => ({
        decision: d.decision, option: d.option,
        outcome: outcomeMap.get(d.decision.id) || null, issueId: d.decision.issueId,
      }));
    }
  }

  // Build a Map keyed by issueId → decision+option+outcome data for O(1) lookup per issue.
  // Key: issue ID (string). Value: the combined decision/option/outcome object for that issue.
  const decisionByIssueId = new Map(decisionsWithOutcomes.map((d) => [d.issueId, d]));

  // Transform each issue+group DB row into the rich shape the UI components consume,
  // merging in cost and resolution data from the decision/option/outcome if available.
  const issuesWithDetails = allIssuesResult.map(({ issue, group }) => {
    // Look up whether a decision exists for this issue using the map we just built.
    const decisionData = decisionByIssueId.get(issue.id);
    // Initialise cost and resolution fields as null — they'll be populated from the
    // decision data if present, or left null if the issue hasn't been decided yet.
    let diyCost: number | null = null;
    let proCost: number | null = null;
    let savedAmount: number | null = null;
    let resolvedBy: string | null = null;

    if (decisionData) {
      const { option, outcome } = decisionData;
      if (option.costMin) {
        // Assign the cost estimate to the correct bucket (DIY or professional) based on the option type.
        diyCost = option.type === "diy" ? parseFloat(option.costMin) : null;
        proCost = option.type === "hire" ? parseFloat(option.costMin) : null;
      }
      // Determine how the issue was resolved: prefer the issue's own resolutionType field,
      // but fall back to the selected option's type if resolutionType wasn't set explicitly.
      if (issue.resolutionType === "diy" || option.type === "diy") resolvedBy = "diy";
      else if (issue.resolutionType === "hired" || option.type === "hire") resolvedBy = "pro";
      // If the outcome recorded a cost delta, use its absolute value as the amount saved
      // (positive delta = saved money; negative = overspent — we show the magnitude either way).
      if (outcome?.costDelta) savedAmount = Math.abs(parseFloat(outcome.costDelta));
    }

    return {
      id: issue.id, title: issue.title || "Untitled Issue", status: issue.status,
      priority: issue.priority || "medium", category: issue.category || issue.subcategory || null,
      groupId: group.id, groupName: group.name,
      // Convert DB Date objects to ISO strings so they serialise safely across the server/client boundary.
      createdAt: issue.createdAt.toISOString(), updatedAt: issue.updatedAt?.toISOString() ?? issue.createdAt.toISOString(),
      diagnosis: issue.diagnosis, confidence: issue.confidenceLevel,
      diyCost, proCost, resolvedAt: issue.resolvedAt?.toISOString() ?? null, resolvedBy, savedAmount,
    };
  });

  // Separate issues into "completed" and "active" buckets for stats and filtering.
  const completedIssues = issuesWithDetails.filter((i) => i.status === "completed");
  // Active = anything that is not completed or deferred (i.e. still needs action).
  const activeIssues = issuesWithDetails.filter((i) => !["completed", "deferred"].includes(i.status));
  // DIY-resolved: completed issues where the user fixed it themselves.
  const diyResolved = completedIssues.filter((i) => i.resolvedBy === "diy");
  // Pro-resolved: completed issues where a contractor was hired.
  const proResolved = completedIssues.filter((i) => i.resolvedBy === "pro");
  // Sum up the saved amounts across all completed issues for the total savings headline figure.
  const totalSaved = completedIssues.reduce((sum, i) => sum + (i.savedAmount || 0), 0);

  // Build a count per category across ALL issues (active + completed) for the distribution chart.
  // Key: category/subcategory string. Value: number of issues in that category.
  const categoryMap = new Map<string, number>();
  for (const issue of allIssuesResult) {
    // Prefer subcategory (more specific) over category; fall back to "other".
    const cat = issue.issue.subcategory || issue.issue.category || "other";
    // Increment the count for this category (or initialise it to 1 if first seen).
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  // Convert the category Map into a sorted array for the pie/bar chart,
  // formatting the display name (capitalise first letter, replace underscores with spaces)
  // and attaching the configured color, sorted largest-to-smallest so the biggest categories
  // are most prominent.
  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
      value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other,
    })).sort((a, b) => b.value - a.value);

  // Set up the 6-month savings trend chart.
  const now = new Date();
  // Define the start of the 6-month window (5 months before the start of the current month).
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  // Pre-populate the Map with all 6 months in chronological order so months with zero
  // activity are still present in the chart (no gaps).
  // Key: short month label (e.g. "Jan"). Value: object tracking savings total and issue count for that month.
  const monthlySavingsMap = new Map<string, { savings: number; issues: number }>();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    // Use the locale-specific short month name as the map key so it matches the chart label format.
    monthlySavingsMap.set(date.toLocaleString("en-US", { month: "short" }), { savings: 0, issues: 0 });
  }
  // Running total for the cumulative savings line on the chart.
  let cumulativeSavings = 0;
  // Accumulate savings from completed issues into the correct month bucket.
  for (const issue of completedIssues) {
    // Only count issues resolved within the 6-month window.
    if (issue.resolvedAt && new Date(issue.resolvedAt) >= sixMonthsAgo) {
      // Find the short month label for this issue's resolution date (e.g. "Feb").
      const monthKey = new Date(issue.resolvedAt).toLocaleString("en-US", { month: "short" });
      const current = monthlySavingsMap.get(monthKey);
      // If the month is in our window, add the savings and increment the issue count.
      if (current) { current.savings += issue.savedAmount || 0; current.issues += 1; }
    }
  }
  // Build the final savingsOverTime array in chronological order, converting monthly savings
  // into a running cumulative total so the chart line always goes up over time.
  const savingsOverTime: Array<{ month: string; savings: number; issues: number }> = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthKey = date.toLocaleString("en-US", { month: "short" });
    const data = monthlySavingsMap.get(monthKey) || { savings: 0, issues: 0 };
    // Add this month's savings to the running cumulative total.
    cumulativeSavings += data.savings;
    // Push the data point with the cumulative savings figure so the chart shows a
    // continuously growing line rather than per-month bars.
    savingsOverTime.push({ month: monthKey, savings: cumulativeSavings, issues: data.issues });
  }

  // Calculate the DIY success rate: the percentage of DIY-resolved issues that
  // actually recorded a positive savings amount (i.e. did not overspend vs. the estimate).
  // Returns 0 if there are no DIY-resolved issues to avoid division by zero.
  const diySuccessRate = diyResolved.length > 0
    ? (diyResolved.filter((i) => i.savedAmount && i.savedAmount > 0).length / diyResolved.length) * 100 : 0;

  // Collect all unique, non-null category/subcategory strings from all issues.
  // This powers the category filter dropdown in the issues list UI.
  const uniqueCategories = Array.from(new Set(
    allIssuesResult.map((r) => r.issue.subcategory || r.issue.category).filter((c): c is string => !!c)
  ));

  // Build the group options list for the group filter dropdown,
  // using only the active groups found at the top of this function.
  const groupOptions = activeGroups.map((g) => ({ id: g.group.id, name: g.group.name }));

  // Return the complete page payload. The TanStack Query hook in lib/hooks/ will
  // cache this and distribute individual fields to each React component that needs them.
  return {
    totalSaved, diyCount: diyResolved.length, proCount: proResolved.length,
    activeIssueCount: activeIssues.length, issues: issuesWithDetails, savingsOverTime,
    categoryDistribution, resolutionBreakdown: { diy: diyResolved.length, pro: proResolved.length, diySuccessRate: Math.round(diySuccessRate) },
    groups: groupOptions, categories: uniqueCategories,
  };
}
