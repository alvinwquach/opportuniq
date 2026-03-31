/**
 * Dashboard V2 Data Adapters
 *
 * Functions to transform production data into demo component format.
 */

// Import every TypeScript type that describes the shape of data the display
// components expect. These types live in ./types so they can be shared across
// the whole dashboard v2 feature.
import type {
  AdaptedDashboardData,  // The final fully-adapted object passed to display components
  StatCard,              // Shape of a single stat card (label, value, trend, etc.)
  PipelineStage,         // Shape of one stage in the issue pipeline chart
  PipelineSummary,       // Raw counts for each pipeline stage (open, investigating, etc.)
  OpenIssue,             // Shape of an issue shown in the "open issues" list
  SafetyAlert,           // Shape of a safety alert card
  PendingDecision,       // Shape of a decision awaiting user action
  DeferredDecision,      // Shape of a decision the user has postponed
  Group,                 // Shape of a household group summary card
  Financials,            // Shape of the financials block (income, spent, budget, etc.)
  BudgetCategory,        // Shape of one spending category slice (label + amount + color)
  SavingsData,           // Shape of the savings summary (total saved, DIY count, etc.)
  SavingsOverTime,       // Shape of one data point in the savings-over-time chart
  CalendarEvent,         // Shape of a single calendar event
  Reminder,              // Shape of a single reminder item
  ActiveGuide,           // Shape of an in-progress how-to guide
  RecentOutcome,         // Shape of a completed issue outcome record
  PendingVendor,         // Shape of a vendor awaiting a decision
  ShoppingItem,          // Shape of a product on the shopping list
  Activity,              // Shape of a recent-activity feed entry
  OutcomeSummary,        // Aggregate stats about resolved issues (success rate, avg cost, etc.)
  WeatherData,           // Shape of current weather information
  UserLocation,          // Shape of the user's location (postal code, lat/lng, city)
} from "./types";

// =============================================================================
// PIPELINE ADAPTERS
// =============================================================================

// Map each pipeline stage name to its display color (hex string).
// This is defined once here so the color stays consistent across every place
// the pipeline chart is rendered.
const PIPELINE_COLORS = {
  Open: "#3ECF8E",
  Investigating: "#f59e0b",
  "Options Ready": "#8b5cf6",
  "In Progress": "#3b82f6",
  Completed: "#10b981",
  Deferred: "#6b7280",
};

// Convert the flat pipeline summary (just counts) into the array of stage objects
// that the bar/funnel chart component expects.
// Each object has: the stage label, how many issues are in that stage, and the color.
export function adaptPipelineToDemo(summary: PipelineSummary): PipelineStage[] {
  return [
    { stage: "Open",          count: summary.open,             color: PIPELINE_COLORS.Open },
    { stage: "Investigating", count: summary.investigating,    color: PIPELINE_COLORS.Investigating },
    { stage: "Options Ready", count: summary.optionsGenerated, color: PIPELINE_COLORS["Options Ready"] },
    { stage: "In Progress",   count: summary.inProgress,       color: PIPELINE_COLORS["In Progress"] },
    { stage: "Completed",     count: summary.completed,        color: PIPELINE_COLORS.Completed },
  ];
}

// Calculate two rolled-up counts from the pipeline:
//   active    = all stages that still need work (open + investigating + optionsGenerated + inProgress)
//   completed = issues that are fully resolved
// These are used for the summary badges next to the pipeline chart title.
export function calculatePipelineCounts(summary: PipelineSummary): { active: number; completed: number } {
  return {
    active: summary.open + summary.investigating + summary.optionsGenerated + summary.inProgress,
    completed: summary.completed,
  };
}

// =============================================================================
// STATS ADAPTERS
// =============================================================================

// Build the array of four stat cards shown at the top of the Overview tab.
// Accepts:
//   pipelineSummary  = raw pipeline stage counts
//   savings          = savings totals
//   activeGroups     = list of groups the user belongs to
//   previousStats    = optional snapshot from a previous period, used to calculate trend arrows
export function adaptStatsToDemo(
  pipelineSummary: PipelineSummary,
  savings: SavingsData,
  activeGroups: Group[],
  previousStats?: {
    openIssues?: number;
    pendingDecisions?: number;
    totalSaved?: number;
    groupCount?: number;
  }
): StatCard[] {
  // "Active Issues" = everything not yet completed or deferred.
  const activeIssues = pipelineSummary.open + pipelineSummary.investigating + pipelineSummary.inProgress;
  // "Pending Decisions" = issues where options have been generated and the user must choose.
  const pendingDecisions = pipelineSummary.optionsGenerated;

  return [
    {
      label: "Active Issues",
      value: activeIssues,
      // If we have a previous value to compare against, show the delta (e.g. "+2" or "-1").
      // If no previous data, show a dash as a neutral placeholder.
      trend: previousStats?.openIssues !== undefined
        ? `${activeIssues - previousStats.openIssues >= 0 ? "+" : ""}${activeIssues - previousStats.openIssues}`
        : "-",
      // Fewer active issues is better, so "up" is false (trend arrow points down = good).
      up: false,
    },
    {
      label: "Pending Decisions",
      value: pendingDecisions,
      trend: previousStats?.pendingDecisions !== undefined
        ? `${pendingDecisions - previousStats.pendingDecisions >= 0 ? "+" : ""}${pendingDecisions - previousStats.pendingDecisions}`
        : "-",
      up: false,
    },
    {
      label: "Total Saved",
      value: savings.totalSavings,
      // Estimate the trend as 10% of current total savings as a rough monthly delta.
      trend: `+$${Math.round(savings.totalSavings * 0.1)}`,
      // More savings is good, so "up" is true.
      up: true,
      // Prepend a "$" sign when the value is displayed.
      prefix: "$",
    },
    {
      label: "Groups",
      value: activeGroups.length,
      trend: previousStats?.groupCount !== undefined
        ? `${activeGroups.length - previousStats.groupCount >= 0 ? "+" : ""}${activeGroups.length - previousStats.groupCount}`
        : "-",
      // Having groups is generally positive, so "up" is true when there is at least one.
      up: activeGroups.length > 0,
    },
  ];
}

// =============================================================================
// ISSUES & DECISIONS ADAPTERS
// =============================================================================

// Transform the raw open-issues list (which may have nested fields) into the
// flat OpenIssue shape that the issues list component renders.
export function adaptOpenIssuesToDemo(
  issues: Array<{
    id: string;
    title: string;
    status: string;
    groupName: string;
    priority?: string | null;
  }>
): OpenIssue[] {
  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    status: issue.status,
    // Rename "groupName" to "group" to match the display component's expected prop name.
    group: issue.groupName,
    // Convert null priority to undefined so optional fields are handled consistently.
    priority: issue.priority || undefined,
  }));
}

// Safety alerts are already in the correct shape; this adapter just re-maps
// the fields to ensure any nullable optional fields become undefined instead of null,
// keeping the TypeScript types clean.
export function adaptSafetyAlertsToDemo(alerts: SafetyAlert[]): SafetyAlert[] {
  // Already in the right format, just ensure consistency
  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    groupName: alert.groupName,
    emergencyInstructions: alert.emergencyInstructions || undefined,
  }));
}

// Transform the raw pending-decisions list into the shape the decision cards expect.
// Handles cost range formatting and distinguishes DIY vs. professional options.
export function adaptPendingDecisionsToDemo(
  decisions: Array<{
    id: string;
    issueTitle: string;
    groupName: string;
    priority: string;
    optionType: string;
    costMin: number | null;
    costMax: number | null;
    timeEstimate: string | null;
    recommended: boolean;
  }>
): PendingDecision[] {
  return decisions.map((decision) => {
    // Build a human-readable cost range string (e.g. "$50-$150" or "$50" or null).
    const costRange = decision.costMin !== null && decision.costMax !== null
      ? `$${decision.costMin}-$${decision.costMax}`
      : decision.costMin !== null
        ? `$${decision.costMin}`
        : null;

    return {
      id: decision.id,
      issueTitle: decision.issueTitle,
      groupName: decision.groupName,
      priority: decision.priority,
      // Only populate diyOption if this decision is a DIY type AND we have a cost to show.
      diyOption: decision.optionType === "diy" && costRange
        ? { cost: costRange, time: decision.timeEstimate || "Est. time TBD" }
        : undefined,
      // Only populate proOption if this decision is a "hire a professional" type.
      proOption: decision.optionType === "hire" && costRange
        ? { cost: costRange }
        : undefined,
      // Show "Recommended" label only when the server has flagged this option as recommended.
      recommendation: decision.recommended ? "Recommended" : undefined,
    };
  });
}

// Transform deferred decisions into the shape the deferred-decisions list expects.
// Formats the revisit date into a human-readable relative string (e.g. "2 days ago").
export function adaptDeferredDecisionsToDemo(
  decisions: Array<{
    id: string;
    title: string;
    revisitDate?: Date | string | null;
    reason?: string;
  }>
): DeferredDecision[] {
  return decisions.map((d) => ({
    id: d.id,
    title: d.title,
    // Fall back to the generic label "Deferred" if no reason was supplied.
    reason: d.reason || "Deferred",
    // Convert the raw date into a relative string like "3 days ago".
    // If no date was set, display a friendly placeholder.
    date: d.revisitDate
      ? formatRelativeDate(new Date(d.revisitDate))
      : "No date set",
  }));
}

// =============================================================================
// GROUP ADAPTERS
// =============================================================================

// Transform the raw group list (with nested GraphQL fields) into the flat Group
// shape that the group cards in the sidebar expect.
export function adaptGroupsToDemo(
  groups: Array<{
    id: string;
    name: string;
    role: string;
    issueCount: number;
    totalSavings: number;
    memberCount?: number;
  }>
): Group[] {
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    // Capitalize the role string so "coordinator" becomes "Coordinator" for display.
    role: capitalizeRole(g.role),
    // Rename "issueCount" to "issues" to match the display component's expected prop name.
    issues: g.issueCount,
    // Rename "totalSavings" to "savings".
    savings: g.totalSavings,
    members: g.memberCount,
  }));
}

// =============================================================================
// FINANCE ADAPTERS
// =============================================================================

// Map each spending category name to a consistent display color.
// Categories not in this list fall back to the "Other" grey color.
const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#3ECF8E",
  HVAC: "#3ECF8E",
  Electrical: "#f59e0b",
  Outdoor: "#8b5cf6",
  Appliances: "#3b82f6",
  Repairs: "#10b981",
  Maintenance: "#6b7280",
  Other: "#6b7280",
};

// Transform the spending-by-category data into BudgetCategory objects that
// the pie/donut chart component can render. Assigns a color to each category.
export function adaptSpendingCategoryToDemo(
  categories: Array<{ category: string; amount: number }>
): BudgetCategory[] {
  return categories.map((cat) => ({
    category: cat.category,
    amount: cat.amount,
    // Look up the category color; fall back to the "Other" color if unknown.
    color: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
  }));
}

// Transform the savings-over-time data, mapping field names to the shape
// the area chart component expects. The "avoided" field is optional.
export function adaptSavingsOverTimeToDemo(
  data: Array<{ month: string; savings: number; diy: number; avoided?: number }>
): SavingsOverTime[] {
  return data.map((d) => ({
    month: d.month,
    savings: d.savings,
    diy: d.diy,
    avoided: d.avoided,
  }));
}

// =============================================================================
// CALENDAR & REMINDERS ADAPTERS
// =============================================================================

// Transform raw calendar events into CalendarEvent objects with pre-formatted
// date and time strings so the calendar grid doesn't need to do any formatting.
export function adaptCalendarEventsToDemo(
  events: Array<{
    id: string;
    title: string;
    scheduledTime?: Date | string;
    type?: string;
    groupName?: string;
  }>
): CalendarEvent[] {
  return events.map((event) => {
    // If no scheduled time is set, default to now so the component always has a valid Date.
    const date = event.scheduledTime ? new Date(event.scheduledTime) : new Date();
    return {
      id: event.id,
      title: event.title,
      // Format to "Mon, Jan 1" style string.
      date: formatEventDate(date),
      // Format to "9:00 AM" style string.
      time: formatEventTime(date),
      // Normalize the raw type string (could be anything from the server) into
      // the three allowed display types: "contractor" | "diy" | "reminder".
      type: mapEventType(event.type),
    };
  });
}

// Transform raw reminder data into Reminder objects that the reminders list expects.
// Converts the date field to a JavaScript Date object for consistent handling.
export function adaptRemindersToDemo(
  reminders: Array<{
    id: string;
    title: string;
    date?: Date | string | null;
    issueId?: string;
    groupName?: string;
  }>
): Reminder[] {
  return reminders.map((r) => ({
    id: r.id,
    issueId: r.issueId,
    title: r.title,
    groupName: r.groupName,
    // Default to "now" if the date is missing, to avoid null Date values downstream.
    date: r.date ? new Date(r.date) : new Date(),
  }));
}

// =============================================================================
// GUIDES & OUTCOMES ADAPTERS
// =============================================================================

// Transform in-progress guides into ActiveGuide objects that the guide progress
// cards expect. Defaults progress/step counts to safe values if missing.
export function adaptActiveGuidesToDemo(
  guides: Array<{
    id: string;
    title: string;
    progress?: number;
    currentStep?: number;
    totalSteps?: number;
  }>
): ActiveGuide[] {
  return guides.map((g) => ({
    id: g.id,
    title: g.title,
    // Default to 0% progress if not provided, so the progress bar renders correctly.
    progress: g.progress || 0,
    // Map "currentStep" to "completedSteps" to match the display component's prop name.
    completedSteps: g.currentStep || 0,
    // Default totalSteps to 1 to avoid division-by-zero in the progress bar calculation.
    totalSteps: g.totalSteps || 1,
  }));
}

// Transform resolved issue outcomes into RecentOutcome objects for the outcomes list.
// Uses ?? (nullish coalescing) to preserve explicit 0 values while replacing undefined with null.
export function adaptRecentOutcomesToDemo(
  outcomes: Array<{
    id: string;
    issueTitle: string;
    success?: boolean;
    optionType: string;
    actualCost?: number | null;
    costDelta?: number | null;
  }>
): RecentOutcome[] {
  return outcomes.map((o) => ({
    id: o.id,
    issueTitle: o.issueTitle,
    success: o.success,
    optionType: o.optionType,
    // Keep null explicitly (vs. undefined) so display components can distinguish
    // "no cost recorded" from "cost is zero".
    actualCost: o.actualCost ?? null,
    costDelta: o.costDelta ?? null,
  }));
}

// =============================================================================
// VENDORS & SHOPPING ADAPTERS
// =============================================================================

// Transform pending vendor data into PendingVendor objects for the vendor review list.
// Provides safe fallback values for optional fields to avoid rendering "undefined".
export function adaptPendingVendorsToDemo(
  vendors: Array<{
    id: string;
    vendorName: string;
    issueTitle?: string;
    rating?: number;
    quoteAmount?: number;
  }>
): PendingVendor[] {
  return vendors.map((v) => ({
    id: v.id,
    vendorName: v.vendorName,
    // Show "Issue" if no issue title is linked, to avoid a blank label.
    issueTitle: v.issueTitle || "Issue",
    // Default rating/quoteAmount to 0 when not provided so numeric displays don't break.
    rating: v.rating || 0,
    quoteAmount: v.quoteAmount || 0,
  }));
}

// Transform shopping list items into ShoppingItem objects.
// Uses ?? to preserve explicit null/0 values (estimatedCost: 0 is valid).
export function adaptShoppingListToDemo(
  items: Array<{
    id: string;
    productName: string;
    storeName?: string;
    estimatedCost?: number | null;
    inStock?: boolean;
  }>
): ShoppingItem[] {
  return items.map((item) => ({
    id: item.id,
    productName: item.productName,
    // Fallback store name prevents a blank store label in the UI.
    storeName: item.storeName || "Store",
    // Convert null to undefined so the display component's optional prop handling works.
    estimatedCost: item.estimatedCost ?? undefined,
    inStock: item.inStock,
  }));
}

// =============================================================================
// ACTIVITY ADAPTERS
// =============================================================================

// Transform the raw activity feed (which has a detailed shape) into the simpler
// Activity objects used by the activity timeline component.
export function adaptRecentActivityToDemo(
  activities: Array<{
    id?: string;
    type: string;
    title: string;
    description?: string;
    timestamp: Date | string;
    groupName?: string;
    avatar?: string;
  }>
): Activity[] {
  return activities.map((a, index) => ({
    // Generate a stable id if none is provided (avoids React key warnings).
    id: a.id || `activity-${index}`,
    // Prefer the description over the title; descriptions are usually more informative.
    message: a.description || a.title,
    // Format the timestamp as a human-readable relative string like "3h ago".
    time: formatRelativeDate(new Date(a.timestamp)),
    // Use the provided avatar emoji/URL, or pick a default based on activity type.
    avatar: a.avatar || getActivityAvatar(a.type),
  }));
}

// =============================================================================
// INSIGHTS ADAPTERS
// =============================================================================

// Build the OutcomeSummary aggregate from the list of recent outcomes.
// This is used by the insights panel to show overall success rates and cost stats.
export function adaptOutcomeSummaryToDemo(
  outcomes: RecentOutcome[],
  totalResolved: number
): OutcomeSummary {
  // Filter down to outcomes that were marked as successful.
  const successfulOutcomes = outcomes.filter((o) => o.success);
  // Calculate what percentage of resolved issues were successful DIY attempts.
  // Guard against divide-by-zero when totalResolved is 0.
  const diySuccessRate = totalResolved > 0
    ? Math.round((successfulOutcomes.length / totalResolved) * 100)
    : 0;

  // Collect all non-null cost deltas (the difference between estimated and actual cost).
  const costDeltas = outcomes
    .map((o) => o.costDelta)
    // Type predicate: only keep values that are actual numbers (not null).
    .filter((d): d is number => d !== null);
  // Average the cost deltas; if there are none, default to 0.
  const avgCostDelta = costDeltas.length > 0
    ? Math.round(costDeltas.reduce((sum, d) => sum + d, 0) / costDeltas.length)
    : 0;

  return {
    diySuccessRate,
    totalResolved,
    avgCostDelta,
    // Hard-coded default: a real implementation would calculate this from timestamps.
    avgResolutionTimeDays: 2.3, // Default value, can be calculated from data
  };
}

// =============================================================================
// MAIN ADAPTER FUNCTION
// =============================================================================

// adaptDashboardData is the full server-action adapter (used by the non-GraphQL path).
// It accepts the raw server-action response object and an optional weather snapshot,
// and returns the fully adapted AdaptedDashboardData object that all display components use.
export function adaptDashboardData(
  data: {
    userProfile: { name?: string | null; postalCode?: string | null; city?: string | null; latitude?: number | null; longitude?: number | null } | null;
    financials: Financials;
    pipelineSummary: { open: number; investigating: number; options_generated: number; decided: number; in_progress: number; completed: number; deferred: number };
    openIssues: Array<{ issue: { id: string; title: string; status: string }; group: { name: string } }>;
    pendingDecisions: Array<{ issue: { id: string; title: string; priority: string }; option: { type: string; costMin: number | null; costMax: number | null; timeEstimate: string | null }; group: { name: string }; voteCount: number; totalMembers: number }>;
    safetyAlerts: SafetyAlert[];
    activeGroups: Array<{ group: { id: string; name: string }; membership: { role: string } }>;
    savings: SavingsData;
    spendingByCategory: Array<{ category: string; amount: number }>;
    calendarEvents: Array<{ id: string; title: string; scheduledTime?: Date | string; type?: string; groupName?: string }>;
    upcomingReminders: Array<{ id: string; title: string; date?: Date | string | null; issueId?: string; groupName?: string }>;
    activeGuides: Array<{ id: string; title: string; progress?: number; currentStep?: number; totalSteps?: number }>;
    recentOutcomes: Array<{ id: string; issueTitle: string; success?: boolean; optionType: string; actualCost?: number | null; costDelta?: number | null }>;
    pendingVendors: Array<{ id: string; vendorName: string; issueTitle?: string; rating?: number; quoteAmount?: number }>;
    shoppingList: Array<{ id: string; productName: string; storeName?: string; estimatedCost?: number | null; inStock?: boolean }>;
    recentActivity: Array<{ type: string; title: string; description?: string; timestamp: Date; groupName?: string }>;
    groupActivityFeed: Array<{ type: string; title: string; description?: string; timestamp: Date; groupName?: string }>;
    deferredDecisions: Array<{ id: string; title: string; revisitDate?: Date | string | null; reason?: string }>;
  },
  weatherData?: WeatherData | null
): AdaptedDashboardData {
  // Extract the user's first name from the full name, defaulting to "there"
  // if no name is present (used in the greeting: "Hey, there!").
  const firstName = data.userProfile?.name?.split(" ")[0] || "there";

  // The server action returns snake_case keys (options_generated, in_progress),
  // but the display components expect camelCase. Normalize them here.
  const normalizedPipeline: PipelineSummary = {
    open: data.pipelineSummary.open,
    investigating: data.pipelineSummary.investigating,
    optionsGenerated: data.pipelineSummary.options_generated,
    decided: data.pipelineSummary.decided,
    inProgress: data.pipelineSummary.in_progress,
    completed: data.pipelineSummary.completed,
    deferred: data.pipelineSummary.deferred,
  };

  // Flatten the nested activeGroups structure (group + membership) into the
  // simple Group shape. Issue/savings/member counts are not available here,
  // so they default to 0.
  const groups: Group[] = data.activeGroups.map((g) => ({
    id: g.group.id,
    name: g.group.name,
    role: capitalizeRole(g.membership.role),
    issues: 0,
    savings: 0,
    members: 0,
  }));

  // Compute the active/completed summary counts once and reuse below.
  const pipelineCounts = calculatePipelineCounts(normalizedPipeline);

  // Assemble and return the final adapted object by calling each sub-adapter.
  return {
    header: {
      userName: firstName,
      // Round to the nearest whole number so the header doesn't show decimals.
      hourlyRate: Math.round(data.financials.hourlyRate),
      monthlyIncome: Math.round(data.financials.monthlyIncome),
    },
    // Build the four stat cards at the top of the overview.
    stats: adaptStatsToDemo(normalizedPipeline, data.savings, groups),
    safetyAlerts: adaptSafetyAlertsToDemo(data.safetyAlerts),
    outcomeSummary: adaptOutcomeSummaryToDemo(
      adaptRecentOutcomesToDemo(data.recentOutcomes),
      normalizedPipeline.completed
    ),
    // The pipeline bar chart data.
    pipeline: adaptPipelineToDemo(normalizedPipeline),
    pipelineActiveCount: pipelineCounts.active,
    pipelineCompletedCount: pipelineCounts.completed,
    // Flatten the nested issue/group structure for the open issues list.
    openIssues: data.openIssues.map((oi) => ({
      id: oi.issue.id,
      title: oi.issue.title,
      status: oi.issue.status,
      group: oi.group.name,
    })),
    // Flatten the nested decision/issue/option/group structure for the decisions list.
    pendingDecisions: data.pendingDecisions.map((pd) => ({
      id: pd.issue.id,
      issueTitle: pd.issue.title,
      groupName: pd.group.name,
      priority: pd.issue.priority,
      // Build the DIY cost string only when the option type is "diy".
      diyOption: pd.option.type === "diy"
        ? {
            cost: `$${pd.option.costMin || 0}${pd.option.costMax ? `-$${pd.option.costMax}` : ""}`,
            time: pd.option.timeEstimate || "TBD",
          }
        : undefined,
      // Build the pro cost string only when the option type is "hire".
      proOption: pd.option.type === "hire"
        ? { cost: `$${pd.option.costMin || 0}${pd.option.costMax ? `-$${pd.option.costMax}` : ""}` }
        : undefined,
      recommendation: "Recommended",
    })),
    deferredDecisions: adaptDeferredDecisionsToDemo(data.deferredDecisions),
    groups,
    financials: data.financials,
    // Convert spending-by-category into chart-ready objects with colors.
    budgetCategories: adaptSpendingCategoryToDemo(data.spendingByCategory),
    // Generate a plausible month-by-month savings history from the total savings figure.
    savingsOverTime: generateSavingsOverTime(data.savings.totalSavings),
    savings: data.savings,
    calendarEvents: adaptCalendarEventsToDemo(data.calendarEvents),
    reminders: adaptRemindersToDemo(data.upcomingReminders),
    activeGuides: adaptActiveGuidesToDemo(data.activeGuides),
    recentOutcomes: adaptRecentOutcomesToDemo(data.recentOutcomes),
    pendingVendors: adaptPendingVendorsToDemo(data.pendingVendors),
    shoppingList: adaptShoppingListToDemo(data.shoppingList),
    recentActivity: adaptRecentActivityToDemo(data.recentActivity),
    // Group activity and recent activity use the same adapter; different source arrays.
    groupActivity: adaptRecentActivityToDemo(data.groupActivityFeed),
    // If no weather data was passed, explicitly set to null so components can check for it.
    weatherData: weatherData || null,
    // Build the user location object only if we have a postal code; otherwise null.
    userLocation: data.userProfile?.postalCode
      ? {
          postalCode: data.userProfile.postalCode,
          city: data.userProfile.city || "",
          latitude: data.userProfile.latitude || 0,
          longitude: data.userProfile.longitude || 0,
        }
      : null,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Convert a Date object into a human-readable relative string (e.g. "3h ago", "2 days ago").
// Used anywhere we display how long ago an event or activity occurred.
function formatRelativeDate(date: Date): string {
  const now = new Date();
  // Calculate the difference in raw milliseconds between now and the given date.
  const diffMs = now.getTime() - date.getTime();
  // Convert ms into whole days and whole hours for comparison.
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Return the most appropriate unit from smallest to largest.
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  // For anything older than a month, fall back to a locale-formatted date string.
  return date.toLocaleDateString();
}

// Format a Date into the short "Day, Mon D" string used on calendar event cards
// (e.g. "Mon, Jan 6").
function formatEventDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Format a Date into a 12-hour time string (e.g. "9:05 AM").
// Pads minutes with a leading zero so we always get two digits.
function formatEventTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  // Convert 0 (midnight) and 13+ to 12-hour format; 0 becomes 12.
  const displayHours = hours % 12 || 12;
  // Ensure minutes like "5" become "05".
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Map an arbitrary event type string from the server into one of the three
// display categories the calendar UI understands: "contractor", "diy", or "reminder".
function mapEventType(type?: string): "contractor" | "diy" | "reminder" {
  // If no type is provided, default to the generic "reminder" bucket.
  if (!type) return "reminder";
  if (type.toLowerCase().includes("contractor") || type.toLowerCase().includes("hire")) return "contractor";
  if (type.toLowerCase().includes("diy") || type.toLowerCase().includes("schedule")) return "diy";
  return "reminder";
}

// Capitalize the first letter and lowercase the rest of a role string.
// e.g. "COORDINATOR" → "Coordinator", "observer" → "Observer".
function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

// Return a default emoji avatar for an activity item based on its type.
// This is used when the activity record has no explicit avatar field.
function getActivityAvatar(type: string): string {
  switch (type) {
    case "issue":
      return "🔧";
    case "decision":
      return "✅";
    case "expense":
      return "💰";
    default:
      return "📋";
  }
}

// Generate a plausible 7-month savings history from only the final total.
// This is used when the server doesn't provide historical data, so the chart
// still has something meaningful to render.
function generateSavingsOverTime(totalSavings: number): SavingsOverTime[] {
  // The last 7 months leading up to (and including) the current month.
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  // Each value is the fraction of the total reached by that month,
  // growing linearly from 15% to 100%.
  const progression = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0];

  return months.map((month, index) => {
    // Scale total savings by the progression factor for this month.
    const savings = Math.round(totalSavings * progression[index]);
    // Assume 65% of savings came from DIY, the rest from avoided professional costs.
    const diy = Math.round(savings * 0.65);
    const avoided = savings - diy;
    return { month, savings, diy, avoided };
  });
}

// =============================================================================
// GRAPHQL ADAPTER
// =============================================================================

// Import the TypeScript type that describes the GraphQL query response shape.
import type { DashboardDataResponse } from "@/lib/hooks/types";

/**
 * Adapts GraphQL dashboard data response to demo component format.
 * This is the adapter used by DashboardClient (which fetches via GraphQL/TanStack Query).
 * adaptDashboardData above is the equivalent for the server-action path.
 */
export function adaptGraphQLDashboardData(data: DashboardDataResponse): AdaptedDashboardData {
  // Pull the first name from the full name string, defaulting to "there".
  const firstName = data.user.name?.split(" ")[0] || "there";

  // The GraphQL response already uses camelCase keys, so this is a straight mapping.
  const normalizedPipeline: PipelineSummary = {
    open: data.pipelineSummary.open,
    investigating: data.pipelineSummary.investigating,
    optionsGenerated: data.pipelineSummary.optionsGenerated,
    decided: data.pipelineSummary.decided,
    inProgress: data.pipelineSummary.inProgress,
    completed: data.pipelineSummary.completed,
    deferred: data.pipelineSummary.deferred,
  };

  // Compute active/completed totals once and reuse in multiple places below.
  const pipelineCounts = calculatePipelineCounts(normalizedPipeline);

  // Map each GraphQL group record to the flat Group display shape.
  const groups: Group[] = data.groups.map((g) => ({
    id: g.id,
    name: g.name,
    role: capitalizeRole(g.role),
    issues: g.issueCount,
    savings: g.savings,
    members: g.memberCount,
  }));

  // Build the four stat cards. The GraphQL response provides pre-computed trend strings
  // from the server; fall back to "-" if they're absent.
  const stats: StatCard[] = [
    {
      label: "Active Issues",
      value: data.stats.activeIssues,
      trend: data.stats.activeIssuesTrend || "-",
      up: false,
    },
    {
      label: "Pending Decisions",
      value: data.stats.pendingDecisions,
      trend: data.stats.pendingDecisionsTrend || "-",
      up: false,
    },
    {
      label: "Total Saved",
      // Round to avoid showing cents in the stat card.
      value: Math.round(data.stats.totalSaved),
      // Use server-provided trend string, or estimate as 10% of total if absent.
      trend: data.stats.totalSavedTrend || `+$${Math.round(data.stats.totalSaved * 0.1)}`,
      up: true,
      prefix: "$",
    },
    {
      label: "Groups",
      value: data.stats.groupCount,
      trend: data.stats.groupCountTrend || "-",
      up: data.stats.groupCount > 0,
    },
  ];

  // Flatten each open issue into the simple OpenIssue shape.
  const openIssues: OpenIssue[] = data.openIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    status: issue.status,
    group: issue.groupName,
    priority: issue.priority,
  }));

  // Safety alerts: already correct shape; re-map to enforce the type and
  // normalize optional fields from null to undefined.
  const safetyAlerts: SafetyAlert[] = data.safetyAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    groupName: alert.groupName,
    emergencyInstructions: alert.emergencyInstructions || undefined,
  }));

  // Build pending decision cards with DIY vs. pro cost strings.
  const pendingDecisions: PendingDecision[] = data.pendingDecisions.map((pd) => ({
    id: pd.id,
    issueTitle: pd.title,
    groupName: pd.groupName,
    priority: pd.priority,
    // Only populate diyOption when the option type is "diy".
    diyOption: pd.optionType === "diy"
      ? {
          cost: `$${pd.costMin || 0}${pd.costMax ? `-$${pd.costMax}` : ""}`,
          time: pd.timeEstimate || "TBD",
        }
      : undefined,
    // Only populate proOption when the option type is "hire".
    proOption: pd.optionType === "hire"
      ? { cost: `$${pd.costMin || 0}${pd.costMax ? `-$${pd.costMax}` : ""}` }
      : undefined,
    recommendation: "Recommended",
  }));

  // Build deferred decision items with formatted revisit dates.
  const deferredDecisions: DeferredDecision[] = data.deferredDecisions.map((d) => ({
    id: d.id,
    title: d.title,
    reason: d.reason || "Deferred",
    date: d.revisitDate ? formatRelativeDate(new Date(d.revisitDate)) : "No date set",
  }));

  // Map calendar events to display format with pre-formatted date/time strings.
  const calendarEvents: CalendarEvent[] = data.calendarEvents.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    // Normalize undefined to explicit undefined for optional prop consistency.
    time: event.time || undefined,
    type: mapEventType(event.type),
  }));

  // Map reminders, converting raw date strings to Date objects.
  const reminders: Reminder[] = data.reminders.map((r) => ({
    id: r.id,
    issueId: r.issueId || undefined,
    title: r.title,
    groupName: r.groupName || undefined,
    date: new Date(r.date),
  }));

  // Map in-progress guides to the ActiveGuide display shape.
  const activeGuides: ActiveGuide[] = data.activeGuides.map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    completedSteps: g.completedSteps,
    totalSteps: g.totalSteps,
  }));

  // Map resolved issue outcomes to the RecentOutcome display shape.
  const recentOutcomes: RecentOutcome[] = data.recentOutcomes.map((o) => ({
    id: o.id,
    issueTitle: o.issueTitle,
    success: o.success,
    optionType: o.optionType,
    actualCost: o.actualCost,
    costDelta: o.costDelta,
  }));

  // The GraphQL response provides a pre-computed outcome summary object;
  // just map field-by-field to ensure the local type is satisfied.
  const outcomeSummary: OutcomeSummary = {
    diySuccessRate: data.outcomeSummary.diySuccessRate,
    totalResolved: data.outcomeSummary.totalResolved,
    avgCostDelta: data.outcomeSummary.avgCostDelta,
    avgResolutionTimeDays: data.outcomeSummary.avgResolutionTimeDays,
  };

  // Map pending vendors to the PendingVendor display shape.
  const pendingVendors: PendingVendor[] = data.pendingVendors.map((v) => ({
    id: v.id,
    vendorName: v.vendorName,
    issueTitle: v.issueTitle || "",
    rating: v.rating || 0,
    quoteAmount: v.quoteAmount || 0,
  }));

  // Map shopping list items to the ShoppingItem display shape.
  const shoppingList: ShoppingItem[] = data.shoppingList.map((item) => ({
    id: item.id,
    productName: item.productName,
    storeName: item.storeName || "",
    estimatedCost: item.estimatedCost || 0,
    // Default inStock to true when missing, to avoid showing "out of stock" incorrectly.
    inStock: item.inStock ?? true,
  }));

  // Map spending-by-category to chart-ready objects.
  // The GraphQL response may already include a color hint; fall back to the
  // CATEGORY_COLORS lookup if not.
  const budgetCategories: BudgetCategory[] = data.spendingByCategory.map((cat) => ({
    category: cat.category,
    amount: cat.amount,
    color: cat.color || CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
  }));

  // If the GraphQL response includes real savings-over-time data, use it.
  // Otherwise generate a synthetic progression from the total savings figure.
  const savingsOverTime: SavingsOverTime[] = data.savingsOverTime.length > 0
    ? data.savingsOverTime.map((s) => ({
        month: s.month,
        savings: s.savings,
        diy: s.diy,
        // Rename the "hired" field to "avoided" to match the chart component's expected key.
        avoided: s.hired, // Map 'hired' to 'avoided' for consistency with demo
      }))
    : generateSavingsOverTime(data.stats.totalSaved);

  // Map the recent activity feed to the simple Activity display shape.
  const recentActivity: Activity[] = data.recentActivity.map((a) => ({
    id: a.id,
    message: a.message,
    time: a.time,
    // Use the server avatar if present; fall back to the clipboard emoji.
    avatar: a.avatar || "📋",
  }));

  // Build the Financials object for the spending/budget displays.
  const financials: Financials = {
    monthlyIncome: data.financials.monthlyIncome,
    annualIncome: data.financials.annualIncome,
    hourlyRate: data.financials.hourlyRate,
    totalSpent: data.financials.totalSpent,
    remaining: data.financials.remaining,
    budgetUsedPercent: data.financials.budgetUsedPercent,
    totalBudget: data.financials.totalBudget,
  };

  // Build the SavingsData summary object used by the stats card and sidebar.
  const savings: SavingsData = {
    totalSavings: data.stats.totalSaved,
    // Count how many outcomes were successful DIY resolutions (used for the DIY badge).
    successfulDiyCount: data.recentOutcomes.filter((o) => o.success && o.optionType === "diy").length,
  };

  // Return the fully assembled AdaptedDashboardData object.
  return {
    header: {
      userName: firstName,
      hourlyRate: Math.round(data.financials.hourlyRate),
      monthlyIncome: Math.round(data.financials.monthlyIncome),
    },
    stats,
    safetyAlerts,
    outcomeSummary,
    pipeline: adaptPipelineToDemo(normalizedPipeline),
    pipelineActiveCount: pipelineCounts.active,
    pipelineCompletedCount: pipelineCounts.completed,
    openIssues,
    pendingDecisions,
    deferredDecisions,
    groups,
    financials,
    budgetCategories,
    savingsOverTime,
    savings,
    calendarEvents,
    reminders,
    activeGuides,
    recentOutcomes,
    pendingVendors,
    shoppingList,
    recentActivity,
    // Reuse the same adapted recent activity array for the group activity feed,
    // since the GraphQL response currently provides the same data for both.
    groupActivity: recentActivity, // Reuse recent activity for group activity
    weatherData: data.weatherData || null,
    userLocation: data.userLocation || null,
  };
}
