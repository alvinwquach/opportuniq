// Tell Next.js this entire module runs only on the server (Node.js process).
// No code in this file is ever sent to or executed in the browser.
"use server";

// createClient() creates a Supabase client that reads the current request's
// cookies so we can call supabase.auth.getUser() to identify the caller.
import { createClient } from "@/lib/supabase/server";
// db is the Drizzle ORM client connected to our PostgreSQL database.
// Every SQL query in this file goes through this object.
import { db } from "@/app/db/client";
// Import every database table (schema object) we need to query.
// Each name here corresponds to a real PostgreSQL table.
import {
  users,
  groups,
  groupMembers,
  groupConstraints,
  userIncomeStreams,
  userBudgets,
  userExpenses,
  issues,
  decisions,
  decisionOptions,
  decisionOutcomes,
  guides,
  userGuideProgress,
  diySchedules,
  vendorContacts,
  productRecommendations,
} from "@/app/db/schema";
// Import Drizzle query-building helpers:
// eq         → WHERE a = b
// and        → combine multiple WHERE conditions with AND
// gte        → WHERE col >= value
// desc       → ORDER BY col DESC (newest / largest first)
// count      → SQL COUNT() aggregate
// sql        → raw SQL template tag for expressions Drizzle can't express natively
// isNotNull  → WHERE col IS NOT NULL
// inArray    → WHERE col IN (array)
import { eq, and, gte, desc, count, sql, isNotNull, inArray } from "drizzle-orm";

// Maps an income stream's payment frequency to a "how many times per month"
// multiplier. Multiplying a stream's amount by this value normalises any
// frequency to a monthly equivalent (e.g., weekly pay × 4.33 = monthly income).
// one_time is 0 because a one-off payment doesn't recur and shouldn't be counted
// as ongoing monthly income.
const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

// The number of working hours in a standard full-time year (52 weeks × 40 hours).
// Used to convert annual income to an hourly rate so the dashboard can display
// "this repair costs X hours of your time", making costs feel more tangible.
const ANNUAL_HOURS = 2080;

// Maps home-maintenance issue categories to a hex colour used in the spending
// pie chart. Categories not in this map fall back to the "Other" grey colour.
const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#3ECF8E",
  HVAC: "#3ECF8E",
  Electrical: "#f59e0b",
  Outdoor: "#8b5cf6",
  Appliances: "#10b981",
  Repairs: "#3ECF8E",
  Maintenance: "#f59e0b",
  Other: "#6b7280",
};

// Helper that converts a past Date into a human-friendly relative string
// such as "3m ago", "2h ago", or "5d ago".  Used in the activity feed so
// users immediately understand recency without reading a raw timestamp.
function getRelativeTime(date: Date): string {
  // Capture the current time at the moment this function is called.
  const now = new Date();
  // Compute the elapsed time in milliseconds between the event and right now.
  const diffMs = now.getTime() - date.getTime();
  // Convert to whole minutes (floor so we don't round up to a future time).
  const diffMins = Math.floor(diffMs / 60000);
  // Convert to whole hours.
  const diffHours = Math.floor(diffMs / 3600000);
  // Convert to whole days.
  const diffDays = Math.floor(diffMs / 86400000);
  // Less than one minute ago — show "just now" to avoid "0m ago".
  if (diffMins < 1) return "just now";
  // Less than one hour ago — show minutes, e.g. "12m ago".
  if (diffMins < 60) return `${diffMins}m ago`;
  // Less than one day ago — show hours, e.g. "3h ago".
  if (diffHours < 24) return `${diffHours}h ago`;
  // Less than one week ago — show days, e.g. "5d ago".
  if (diffDays < 7) return `${diffDays}d ago`;
  // Older than a week — show the full locale date string for precision.
  return date.toLocaleDateString();
}

// getDashboardData is the single server action that powers the main Dashboard
// page.  It authenticates the user, then fetches their personal profile,
// financials, group memberships, all open issues, pending decisions, guide
// progress, spending data, calendar events, and recent activity in one call
// so the page can be fully server-rendered in a single round-trip.
export async function getDashboardData() {
  // Create a server-side Supabase client bound to the incoming request context.
  const supabase = await createClient();
  // Retrieve the currently authenticated user from the session cookie.
  // If no valid session exists, user will be null.
  const { data: { user } } = await supabase.auth.getUser();
  // Guard clause: if there is no authenticated user, reject the request
  // immediately so no sensitive data leaks to unauthenticated callers.
  if (!user) throw new Error("Unauthorized");

  // Capture the current moment once so all time-based calculations in this
  // function are consistent (no drift between consecutive new Date() calls).
  const now = new Date();
  // Compute midnight on the 1st of the current month.  This is the start of
  // the window we use to aggregate "this month's" expenses and spending.
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run five independent database queries simultaneously using Promise.all.
  // Because none of these queries depend on each other's output, firing them
  // in parallel is significantly faster than running them sequentially.
  const [userGroupsResult, userProfileResult, incomeStreamsResult, budgetsResult, monthlyExpensesResult] =
    await Promise.all([
      // Query 1: Fetch every group this user belongs to, along with their
      // membership record (role, status) and the group's budget constraints
      // (monthly limit, emergency buffer).  We use a left join for constraints
      // so we still get the group row even if no constraints have been configured.
      db.select({ group: groups, membership: groupMembers, constraints: groupConstraints })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .leftJoin(groupConstraints, eq(groups.id, groupConstraints.groupId))
        .where(eq(groupMembers.userId, user.id)),

      // Query 2: Fetch the user's own profile row (name, email, avatar, location).
      // We expect exactly one row; the array is destructured to [userProfile] below.
      db.select().from(users).where(eq(users.id, user.id)),

      // Query 3: Fetch all active income streams for this user.
      // isActive = true means the stream is ongoing (not cancelled or paused).
      // Each stream has an amount and a frequency we'll normalise to monthly below.
      db.select().from(userIncomeStreams).where(
        and(eq(userIncomeStreams.userId, user.id), eq(userIncomeStreams.isActive, true))
      ),

      // Query 4: Fetch all budget category limits the user has defined.
      // Each row has a monthlyLimit; we sum them to get the total monthly budget.
      db.select().from(userBudgets).where(eq(userBudgets.userId, user.id)),

      // Query 5: Sum this month's total expenses in a single aggregate query.
      // COALESCE ensures we get 0 instead of NULL when there are no expenses yet.
      // We filter by date >= startOfMonth to only count the current calendar month.
      db.select({ total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)` })
        .from(userExpenses)
        .where(and(eq(userExpenses.userId, user.id), gte(userExpenses.date, startOfMonth))),
    ]);

  // Destructure the first (and only expected) row from the profile query.
  const [userProfile] = userProfileResult;
  // If no profile row exists the database is in an inconsistent state — stop
  // processing rather than propagating null reference errors.
  if (!userProfile) throw new Error("User profile not found");

  // Calculate monthly income by summing all active income streams, each
  // normalised to a monthly amount using the FREQUENCY_TO_MONTHLY multiplier.
  let monthlyIncome = 0;
  for (const stream of incomeStreamsResult) {
    // Look up the frequency multiplier; default to 0 if the frequency is unrecognised.
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    // Multiply the stream's amount (stored as a Decimal / string) by the multiplier
    // and add to the running monthly income total.
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  // Annual income = monthly income × 12 months.
  const annualIncome = monthlyIncome * 12;
  // Hourly rate = annual income ÷ 2080 standard working hours per year.
  // This lets us express repair costs in "hours of work" on the dashboard.
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  // Filter down to only the groups where the user's membership is "active".
  // A membership row may exist with status "invited" or "removed", but we
  // should only show groups the user is actually participating in.
  const activeGroups = userGroupsResult.filter((g) => g.membership.status === "active");
  // Extract the IDs of active groups, filtering out any null/empty values
  // defensively to ensure the resulting array is safe to pass to SQL IN clauses.
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  // Sum all budget category limits to get the user's total monthly budget cap.
  const totalBudget = budgetsResult.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  // The aggregate expenses query returns a single row with a `total` field.
  // Fall back to 0 if the result is empty (no expenses recorded yet this month).
  const totalSpent = Number(monthlyExpensesResult[0]?.total || 0);

  // Shape the user profile into a lean object with only the fields the client
  // needs.  Avoid sending sensitive columns (e.g., internal flags) to the UI.
  const userObj = {
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    avatarUrl: userProfile.avatarUrl,
    postalCode: userProfile.postalCode,
    city: userProfile.city,
    // Coerce null to explicit null (rather than undefined) for consistent JSON serialisation.
    latitude: userProfile.latitude ?? null,
    longitude: userProfile.longitude ?? null,
  };

  // Bundle all financial metrics into one object for the Finance Summary widget.
  const financials = {
    monthlyIncome,
    annualIncome,
    hourlyRate,
    totalSpent,
    // remaining = budget cap minus what has been spent this month.
    // If no explicit budget is set, fall back to 20% of monthly income as a
    // reasonable default.  Math.max(0, …) prevents a negative "remaining" value.
    remaining: Math.max(0, (totalBudget || monthlyIncome * 0.2) - totalSpent),
    // budgetUsedPercent is a 0–100 percentage; guard against division by zero
    // when the user hasn't set up any budget categories yet.
    budgetUsedPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    // Use the explicit budget total if available, otherwise the 20% income fallback.
    totalBudget: totalBudget || monthlyIncome * 0.2,
  };

  // Build a location object from the user's profile, or null if they haven't
  // entered a postal code yet.  Used to fetch local weather and nearby vendors.
  const userLocation = userProfile.postalCode
    ? { postalCode: userProfile.postalCode, city: userProfile.city, latitude: userProfile.latitude ?? null, longitude: userProfile.longitude ?? null }
    : null;

  // Define the zero-state return value for users who aren't in any active group.
  // Returning a consistent shape (not null) means the UI only needs to handle
  // empty arrays/zeros, not missing object properties.
  const emptyResult = {
    user: userObj, financials,
    stats: { activeIssues: 0, activeIssuesTrend: null, pendingDecisions: 0, pendingDecisionsTrend: null, totalSaved: 0, totalSavedTrend: null, groupCount: 0, groupCountTrend: null },
    pipelineSummary: { open: 0, investigating: 0, optionsGenerated: 0, decided: 0, inProgress: 0, completed: 0, deferred: 0 },
    openIssues: [], safetyAlerts: [], pendingDecisions: [], deferredDecisions: [], groups: [],
    calendarEvents: [], reminders: [], activeGuides: [], recentOutcomes: [],
    outcomeSummary: { diySuccessRate: 0, totalResolved: 0, avgCostDelta: 0, avgResolutionTimeDays: 0 },
    pendingVendors: [], shoppingList: [], spendingByCategory: [], savingsOverTime: [],
    recentActivity: [], userLocation, weatherData: null,
  };

  // If the user has no active group memberships there is nothing group-related
  // to fetch — return the empty result now and skip all remaining queries.
  if (groupIds.length === 0) return emptyResult;

  // Run twelve independent database queries simultaneously using Promise.all.
  // Grouping all these queries in one parallel batch minimises total wall-clock
  // time: instead of waiting for each query to finish before starting the next,
  // they all execute at the same time and we wait for the slowest one.
  const [
    openIssuesResult, safetyAlertsResult, pendingDecisionsResult, deferredResult,
    memberCountsResult, statusCountsResult, activeGuidesResult, outcomesResult,
    schedulesResult, vendorsResult, productsResult, spendingResult,
  ] = await Promise.all([
    // Query 1: Fetch the 10 most recently created issues that are still actively
    // being worked on (status is "open", "investigating", or "in_progress").
    // Joining with groups gives us the group name for display on each issue card.
    db.select({ issue: issues, group: groups })
      .from(issues).innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, groupIds), sql`${issues.status}::text IN ('open', 'investigating', 'in_progress')`))
      .orderBy(desc(issues.createdAt)).limit(10),

    // Query 2: Fetch up to 5 issues that qualify as safety alerts — meaning they
    // are not yet resolved AND meet at least one urgency criterion:
    //   • severity is "critical"
    //   • urgency is "now" or "emergency"
    //   • the isEmergency flag is explicitly set to true
    // These appear in the Safety Alerts banner at the top of the dashboard.
    db.select({ issue: issues, group: groups })
      .from(issues).innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, groupIds), sql`${issues.status}::text NOT IN ('completed', 'deferred')`,
        sql`((${issues.severity} IS NOT NULL AND ${issues.severity}::text = 'critical') OR (${issues.urgency} IS NOT NULL AND ${issues.urgency}::text IN ('now', 'emergency')) OR ${issues.isEmergency} = true)`))
      .limit(5),

    // Query 3: Fetch up to 5 issues that are in "options_generated" status and
    // have a recommended decision option ready for the user to approve.
    // Joining decisionOptions lets us surface the recommended option's type and
    // cost estimate directly in the "Pending Decisions" widget.
    db.select({ issue: issues, group: groups, option: decisionOptions })
      .from(issues).innerJoin(groups, eq(issues.groupId, groups.id))
      .innerJoin(decisionOptions, eq(decisionOptions.issueId, issues.id))
      .where(and(inArray(issues.groupId, groupIds), sql`${issues.status}::text = 'options_generated'`, eq(decisionOptions.recommended, true)))
      .orderBy(desc(issues.updatedAt)).limit(5),

    // Query 4: Fetch up to 5 decisions that were deferred (the chosen option type
    // is "defer") and have a revisit date set, ordered by revisit date ascending
    // so the most overdue items appear first.  Joining all the way through to
    // groups lets us label each deferred item with its group name.
    db.select({ decision: decisions, option: decisionOptions, issue: issues, group: groups })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, groupIds), eq(decisionOptions.type, "defer"), isNotNull(decisions.revisitDate)))
      .orderBy(decisions.revisitDate).limit(5),

    // Query 5: Count active members per group so we can display member totals
    // without fetching all member rows.  groupBy produces one row per group.
    db.select({ groupId: groupMembers.groupId, memberCount: count() })
      .from(groupMembers)
      .where(and(inArray(groupMembers.groupId, groupIds), eq(groupMembers.status, "active")))
      .groupBy(groupMembers.groupId),

    // Query 6: Count issues grouped by status so we can populate the pipeline
    // summary funnel (open → investigating → options_generated → … → completed).
    // This avoids fetching every issue just to count them.
    db.select({ status: issues.status, count: count() })
      .from(issues).where(inArray(issues.groupId, groupIds)).groupBy(issues.status),

    // Query 7: Fetch the 3 most recently accessed in-progress guides for this user.
    // isCompleted = false means the guide is still actively being worked through.
    // Joining guides gives us the guide title to show in the Active Guides widget.
    db.select({ progress: userGuideProgress, guide: guides })
      .from(userGuideProgress).innerJoin(guides, eq(userGuideProgress.guideId, guides.id))
      .where(and(eq(userGuideProgress.userId, user.id), eq(userGuideProgress.isCompleted, false)))
      .orderBy(desc(userGuideProgress.lastAccessedAt)).limit(3),

    // Query 8: Fetch the 5 most recently completed decision outcomes across all
    // groups.  We join all the way through to issues to get the issue title, and
    // to decisionOptions to know whether the resolution was DIY or hired.
    db.select({ outcome: decisionOutcomes, option: decisionOptions, decision: decisions, issue: issues })
      .from(decisionOutcomes)
      .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .where(inArray(issues.groupId, groupIds))
      .orderBy(desc(decisionOutcomes.completedAt)).limit(5),

    // Query 9: Fetch upcoming DIY schedule entries (scheduled time >= now) for
    // the user's groups, ordered chronologically so the next appointment appears
    // first.  These populate the Calendar widget.
    db.select({ schedule: diySchedules, issue: issues, group: groups })
      .from(diySchedules).innerJoin(issues, eq(diySchedules.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, groupIds), gte(diySchedules.scheduledTime, now)))
      .orderBy(diySchedules.scheduledTime).limit(5),

    // Query 10: Fetch up to 5 vendor contacts that have NOT been contacted yet
    // (contacted = false).  Joining through decisionOptions → issues lets us
    // show which issue each vendor is associated with.
    db.select({ vendor: vendorContacts, option: decisionOptions, issue: issues })
      .from(vendorContacts)
      .innerJoin(decisionOptions, eq(vendorContacts.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(and(inArray(issues.groupId, groupIds), eq(vendorContacts.contacted, false))).limit(5),

    // Query 11: Fetch up to 10 product recommendations linked to issues in the
    // user's groups.  These form the Shopping List widget so users know what
    // parts or supplies to buy before starting a DIY repair.
    db.select({ product: productRecommendations, option: decisionOptions, issue: issues })
      .from(productRecommendations)
      .innerJoin(decisionOptions, eq(productRecommendations.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(inArray(issues.groupId, groupIds)).limit(10),

    // Query 12: Aggregate this month's expenses grouped by category so we can
    // build the spending pie chart.  COALESCE ensures we get 0 instead of NULL
    // for any category with no recorded spending.
    db.select({ category: userExpenses.category, total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)` })
      .from(userExpenses)
      .where(and(eq(userExpenses.userId, user.id), gte(userExpenses.date, startOfMonth)))
      .groupBy(userExpenses.category),
  ]);

  // Build a Map where:
  //   key   → group ID (string)
  //   value → active member count (number)
  // O(1) lookup used when building the formattedGroups and pendingDecisions
  // arrays to attach a member count to each group without re-querying.
  const memberCountMap = new Map(memberCountsResult.map((m) => [m.groupId, m.memberCount]));
  // Build a Map where:
  //   key   → issue status string (e.g. "open", "completed")
  //   value → count of issues in that status (number)
  // Used to populate the pipeline summary funnel in O(1) per status bucket.
  const statusCountMap = new Map(statusCountsResult.map((s) => [s.status, Number(s.count)]));

  // Transform the open issues query result into the shape the IssueCard
  // component expects, providing safe fallbacks for nullable fields.
  const openIssues = openIssuesResult.map(({ issue, group }) => ({
    id: issue.id,
    title: issue.title || "Untitled Issue",
    status: issue.status,
    // Default priority to "medium" when it wasn't explicitly set on the issue.
    priority: issue.priority || "medium",
    groupName: group.name,
    groupId: group.id,
    // Convert createdAt Date to ISO string for safe server→client serialisation.
    createdAt: issue.createdAt.toISOString(),
  }));

  // Shape safety alert issues into the minimal object the AlertBanner needs.
  // We include emergencyInstructions so the UI can show immediate action steps.
  const safetyAlerts = safetyAlertsResult.map(({ issue, group }) => ({
    id: issue.id,
    title: issue.title || "Untitled Issue",
    // Default severity to "high" when not explicitly set, since these are alerts.
    severity: issue.severity || "high",
    groupName: group.name,
    emergencyInstructions: issue.emergencyInstructions,
  }));

  // Shape pending decisions into the object the DecisionCard component expects.
  // We include cost range and vote counts so the user can make an informed choice.
  const pendingDecisions = pendingDecisionsResult.map(({ issue, group, option }) => ({
    id: issue.id, issueId: issue.id,
    title: issue.title || "Untitled Issue",
    priority: issue.priority || "medium",
    groupName: group.name,
    // The type of the recommended option (e.g. "diy", "hire", "defer").
    optionType: option.type,
    // Parse cost range strings to floats; null if no estimate was provided.
    costMin: option.costMin ? parseFloat(option.costMin) : null,
    costMax: option.costMax ? parseFloat(option.costMax) : null,
    timeEstimate: option.timeEstimate,
    // voteCount is not stored in DB yet — placeholder for future feature.
    voteCount: 0,
    // Attach total member count so the UI can show "2 of 4 members voted".
    totalMembers: memberCountMap.get(group.id) || 0,
  }));

  // Shape deferred decisions into the object the DeferredCard component expects.
  // We surface the revisit date so users know when they committed to revisiting.
  const deferredDecisions = deferredResult.map(({ decision, issue }) => ({
    id: decision.id,
    title: issue.title || "Untitled Issue",
    // Convert revisitDate to ISO string if set; null means no date was chosen.
    revisitDate: decision.revisitDate?.toISOString() ?? null,
    // The reasoning for deferral is stored as a JSON blob in the assumptions field;
    // we safely extract the "reasoning" key if it exists.
    reason: (decision.assumptions as { reasoning?: string } | null)?.reasoning ?? null,
  }));

  // Shape each active group into the lean object the GroupChip component needs.
  // We attach member count from the Map to avoid an extra query per group.
  const formattedGroups = activeGroups.map(({ group, membership }) => ({
    id: group.id, name: group.name, role: membership.role,
    memberCount: memberCountMap.get(group.id) || 0,
    // issueCount and savings are not aggregated here because this list is used
    // only for the Groups sidebar chip, not the full groups detail page.
    issueCount: 0, savings: 0,
  }));

  // Shape upcoming DIY schedule entries into calendar event objects.
  // We format the date and time into human-friendly strings on the server
  // so the client component doesn't need to do any date formatting.
  const calendarEvents = schedulesResult.map(({ schedule, issue, group }) => {
    // Parse the scheduled time into a Date object for formatting.
    const date = new Date(schedule.scheduledTime);
    return {
      id: schedule.id,
      title: issue.title || "Scheduled work",
      // Format: "Mon, Jan 6" — short weekday, short month, numeric day.
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      // Format: "9:30 AM" — hour, two-digit minute, AM/PM.
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      type: "diy",
      groupName: group.name,
    };
  });

  // Build reminder notifications from deferred decisions that have a revisit date.
  // These appear in the Reminders widget to prompt the user to follow up.
  const reminders = deferredResult
    // Only include decisions where a revisit date was actually set.
    .filter(({ decision }) => decision.revisitDate)
    .map(({ decision, issue, group }) => ({
      id: decision.id,
      issueId: issue.id,
      // Prefix the title with "Follow up:" so reminders are visually distinct
      // from new issues in the notification list.
      title: `Follow up: ${issue.title}`,
      groupName: group.name,
      // Non-null assertion is safe here because we filtered above.
      date: decision.revisitDate!.toISOString(),
    }));

  // Format each in-progress guide into the shape the GuideCard component needs,
  // including a calculated progress percentage.
  const activeGuidesFormatted = activeGuidesResult.map(({ progress, guide }) => {
    // How many steps the user has already completed in this guide.
    const completedSteps = progress.completedStepIds?.length || 0;
    // Estimate total steps: at minimum, completed + 1 more remaining.
    // We use Math.max with 5 as a floor to avoid 100% progress on guides
    // with very few completed steps (where 1 step might equal the total).
    const totalSteps = Math.max(completedSteps + 1, 5);
    // If the guide is flagged complete show 100%; otherwise compute the ratio.
    const progressPercent = progress.isCompleted ? 100 : Math.round((completedSteps / totalSteps) * 100);
    return { id: guide.id, title: guide.title, progress: progressPercent, totalSteps, completedSteps };
  });

  // Shape the 5 most recent decision outcomes for the Outcomes widget.
  // We parse cost strings to floats so the UI doesn't have to.
  const recentOutcomes = outcomesResult.map(({ outcome, option, issue }) => ({
    id: outcome.id,
    issueTitle: issue.title || "Untitled Issue",
    // Default to true if success flag was never explicitly set (optimistic default).
    success: outcome.success ?? true,
    optionType: option.type,
    // null means no actual cost was recorded.
    actualCost: outcome.actualCost ? parseFloat(outcome.actualCost) : null,
    // costDelta: negative = saved money vs estimate, positive = went over budget.
    costDelta: outcome.costDelta ? parseFloat(outcome.costDelta) : null,
  }));

  // Filter outcomes to those marked successful, used in stats and outcomeSummary.
  const successfulOutcomes = outcomesResult.filter(({ outcome }) => outcome.success);
  // Filter outcomes where the chosen option type was "diy".
  const diyOutcomes = outcomesResult.filter(({ option }) => option.type === "diy");
  // Of the DIY outcomes, how many were successful?
  const diySuccessful = diyOutcomes.filter(({ outcome }) => outcome.success);
  // Sum all costDelta values to compute the average later.
  // Negative deltas represent savings; positive deltas are cost overruns.
  const totalCostDelta = outcomesResult.reduce(
    (sum, { outcome }) => sum + (outcome.costDelta ? parseFloat(outcome.costDelta) : 0), 0
  );

  // Compute high-level outcome metrics for the Outcome Summary card.
  const outcomeSummary = {
    // Percentage of DIY attempts that succeeded (0 if no DIY outcomes yet).
    diySuccessRate: diyOutcomes.length > 0 ? Math.round((diySuccessful.length / diyOutcomes.length) * 100) : 0,
    // Total number of resolved issues across all groups.
    totalResolved: outcomesResult.length,
    // Average cost delta per outcome (negative = typically saved money).
    avgCostDelta: outcomesResult.length > 0 ? totalCostDelta / outcomesResult.length : 0,
    // Hard-coded placeholder until we implement resolution-time tracking.
    avgResolutionTimeDays: 2.3,
  };

  // Shape each uncontacted vendor into the object the VendorCard component needs.
  const pendingVendors = vendorsResult.map(({ vendor, issue }) => ({
    id: vendor.id,
    vendorName: vendor.vendorName,
    issueTitle: issue.title,
    // Parse rating and quoteAmount strings to floats; null if not yet provided.
    rating: vendor.rating ? parseFloat(vendor.rating) : null,
    quoteAmount: vendor.quoteAmount ? parseFloat(vendor.quoteAmount) : null,
  }));

  // Shape each product recommendation into the ShoppingListItem object.
  const shoppingList = productsResult.map(({ product }) => ({
    id: product.id,
    productName: product.productName,
    storeName: product.storeName,
    // Parse estimatedCost string to float; null if not provided.
    estimatedCost: product.estimatedCost ? parseFloat(product.estimatedCost) : null,
    inStock: product.inStock,
  }));

  // Build the spending pie chart dataset from the category-aggregated expenses query.
  // Filter out rows with a null category (unclassified expenses) to avoid a
  // nameless slice in the chart.
  const spendingByCategory = spendingResult
    .filter(({ category }) => category)
    .map(({ category, total }) => ({
      category: category!,
      // Ensure total is a JS number (the SQL aggregate returns a string via Drizzle).
      amount: Number(total),
      // Use the category's designated color, or the "Other" grey as a fallback.
      color: CATEGORY_COLORS[category!] || CATEGORY_COLORS.Other,
    }));

  // Assemble the pipeline funnel counts from the per-status Map.
  // Each status maps to a stage in the issue lifecycle.
  // "deferred" comes from the dedicated deferredResult query because deferred
  // issues may have any status string and the statusCountMap won't capture them all.
  const pipelineSummary = {
    open: statusCountMap.get("open") || 0,
    investigating: statusCountMap.get("investigating") || 0,
    optionsGenerated: statusCountMap.get("options_generated") || 0,
    decided: statusCountMap.get("decided") || 0,
    inProgress: statusCountMap.get("in_progress") || 0,
    completed: statusCountMap.get("completed") || 0,
    // Use the actual deferred decision count rather than the status bucket
    // because "deferred" is stored as a decision option type, not a status.
    deferred: deferredResult.length,
  };

  // Compute the headline stats shown in the KPI cards at the top of the dashboard.
  const stats = {
    // Count of currently active (open/investigating/in_progress) issues.
    activeIssues: openIssues.length,
    // Trend vs. prior period — not yet implemented; null signals "no data".
    activeIssuesTrend: null,
    pendingDecisions: pendingDecisions.length,
    pendingDecisionsTrend: null,
    // totalSaved = sum of money saved (negative costDelta) across all SUCCESSFUL outcomes.
    // Math.max(0, -delta) turns a negative delta into a positive saving;
    // we floor at 0 so a cost overrun (positive delta) doesn't reduce the total saved figure.
    totalSaved: successfulOutcomes.reduce(
      (sum, { outcome }) => sum + Math.max(0, -(outcome.costDelta ? parseFloat(outcome.costDelta) : 0)), 0
    ),
    totalSavedTrend: null,
    groupCount: activeGroups.length,
    groupCountTrend: null,
  };

  // Build the activity feed by combining the most recent issues and outcomes,
  // then taking only the 5 newest entries.
  const recentActivity = [
    // Take the 3 most recently created open issues and describe them as "New issue" events.
    ...openIssuesResult.slice(0, 3).map(({ issue }) => ({
      id: issue.id,
      message: `New issue: ${issue.title}`,
      // Format the createdAt date as a human-friendly relative time string.
      time: getRelativeTime(issue.createdAt),
      // Clipboard emoji used as a placeholder icon for issue events.
      avatar: "📋",
      type: "issue",
    })),
    // Take the 2 most recently completed outcomes and describe them as resolution events.
    ...outcomesResult.slice(0, 2).map(({ outcome, issue }) => ({
      id: outcome.id,
      // "Completed" if outcome was successful; "Closed" if it was not.
      message: `${outcome.success ? "Completed" : "Closed"}: ${issue.title}`,
      // completedAt may be null if the outcome was recorded without a timestamp;
      // fall back to now() so getRelativeTime still produces a readable result.
      time: getRelativeTime(outcome.completedAt || new Date()),
      // Green tick for success, red cross for failure — quick visual scan in the feed.
      avatar: outcome.success ? "✅" : "❌",
      type: "outcome",
    })),
  // Cap the combined list at 5 items so the activity feed doesn't become overwhelming.
  ].slice(0, 5);

  // Return the complete payload consumed by the Dashboard page.
  // Every field maps to a specific widget or section on the UI.
  return {
    user: userObj,
    financials,
    stats,
    pipelineSummary,
    openIssues,
    safetyAlerts,
    pendingDecisions,
    deferredDecisions,
    groups: formattedGroups,
    calendarEvents,
    reminders,
    activeGuides: activeGuidesFormatted,
    recentOutcomes,
    outcomeSummary,
    pendingVendors,
    shoppingList,
    spendingByCategory,
    // savingsOverTime chart is not yet implemented; placeholder empty array.
    savingsOverTime: [],
    recentActivity,
    userLocation,
    // weatherData is fetched client-side via a separate API call; null here.
    weatherData: null,
  };
}
