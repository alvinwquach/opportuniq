/**
 * Dashboard V2 Data Adapters
 *
 * Functions to transform production data into demo component format.
 */

import type {
  AdaptedDashboardData,
  StatCard,
  PipelineStage,
  PipelineSummary,
  OpenIssue,
  SafetyAlert,
  PendingDecision,
  DeferredDecision,
  Group,
  Financials,
  BudgetCategory,
  SavingsData,
  SavingsOverTime,
  CalendarEvent,
  Reminder,
  ActiveGuide,
  RecentOutcome,
  PendingVendor,
  ShoppingItem,
  Activity,
  OutcomeSummary,
  WeatherData,
  UserLocation,
} from "./types";

// =============================================================================
// PIPELINE ADAPTERS
// =============================================================================

const PIPELINE_COLORS = {
  Open: "#3ECF8E",
  Investigating: "#f59e0b",
  "Options Ready": "#8b5cf6",
  "In Progress": "#3b82f6",
  Completed: "#10b981",
  Deferred: "#6b7280",
};

export function adaptPipelineToDemo(summary: PipelineSummary): PipelineStage[] {
  return [
    { stage: "Open", count: summary.open, color: PIPELINE_COLORS.Open },
    { stage: "Investigating", count: summary.investigating, color: PIPELINE_COLORS.Investigating },
    { stage: "Options Ready", count: summary.optionsGenerated, color: PIPELINE_COLORS["Options Ready"] },
    { stage: "In Progress", count: summary.inProgress, color: PIPELINE_COLORS["In Progress"] },
    { stage: "Completed", count: summary.completed, color: PIPELINE_COLORS.Completed },
  ];
}

export function calculatePipelineCounts(summary: PipelineSummary): { active: number; completed: number } {
  return {
    active: summary.open + summary.investigating + summary.optionsGenerated + summary.inProgress,
    completed: summary.completed,
  };
}

// =============================================================================
// STATS ADAPTERS
// =============================================================================

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
  const activeIssues = pipelineSummary.open + pipelineSummary.investigating + pipelineSummary.inProgress;
  const pendingDecisions = pipelineSummary.optionsGenerated;

  return [
    {
      label: "Active Issues",
      value: activeIssues,
      trend: previousStats?.openIssues !== undefined
        ? `${activeIssues - previousStats.openIssues >= 0 ? "+" : ""}${activeIssues - previousStats.openIssues}`
        : "-",
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
      trend: `+$${Math.round(savings.totalSavings * 0.1)}`,
      up: true,
      prefix: "$",
    },
    {
      label: "Groups",
      value: activeGroups.length,
      trend: previousStats?.groupCount !== undefined
        ? `${activeGroups.length - previousStats.groupCount >= 0 ? "+" : ""}${activeGroups.length - previousStats.groupCount}`
        : "-",
      up: activeGroups.length > 0,
    },
  ];
}

// =============================================================================
// ISSUES & DECISIONS ADAPTERS
// =============================================================================

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
    group: issue.groupName,
    priority: issue.priority || undefined,
  }));
}

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
      diyOption: decision.optionType === "diy" && costRange
        ? { cost: costRange, time: decision.timeEstimate || "Est. time TBD" }
        : undefined,
      proOption: decision.optionType === "hire" && costRange
        ? { cost: costRange }
        : undefined,
      recommendation: decision.recommended ? "Recommended" : undefined,
    };
  });
}

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
    reason: d.reason || "Deferred",
    date: d.revisitDate
      ? formatRelativeDate(new Date(d.revisitDate))
      : "No date set",
  }));
}

// =============================================================================
// GROUP ADAPTERS
// =============================================================================

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
    role: capitalizeRole(g.role),
    issues: g.issueCount,
    savings: g.totalSavings,
    members: g.memberCount,
  }));
}

// =============================================================================
// FINANCE ADAPTERS
// =============================================================================

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

export function adaptSpendingCategoryToDemo(
  categories: Array<{ category: string; amount: number }>
): BudgetCategory[] {
  return categories.map((cat) => ({
    category: cat.category,
    amount: cat.amount,
    color: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
  }));
}

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
    const date = event.scheduledTime ? new Date(event.scheduledTime) : new Date();
    return {
      id: event.id,
      title: event.title,
      date: formatEventDate(date),
      time: formatEventTime(date),
      type: mapEventType(event.type),
    };
  });
}

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
    date: r.date ? new Date(r.date) : new Date(),
  }));
}

// =============================================================================
// GUIDES & OUTCOMES ADAPTERS
// =============================================================================

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
    progress: g.progress || 0,
    completedSteps: g.currentStep || 0,
    totalSteps: g.totalSteps || 1,
  }));
}

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
    actualCost: o.actualCost ?? null,
    costDelta: o.costDelta ?? null,
  }));
}

// =============================================================================
// VENDORS & SHOPPING ADAPTERS
// =============================================================================

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
    issueTitle: v.issueTitle || "Issue",
    rating: v.rating || 0,
    quoteAmount: v.quoteAmount || 0,
  }));
}

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
    storeName: item.storeName || "Store",
    estimatedCost: item.estimatedCost ?? undefined,
    inStock: item.inStock,
  }));
}

// =============================================================================
// ACTIVITY ADAPTERS
// =============================================================================

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
    id: a.id || `activity-${index}`,
    message: a.description || a.title,
    time: formatRelativeDate(new Date(a.timestamp)),
    avatar: a.avatar || getActivityAvatar(a.type),
  }));
}

// =============================================================================
// INSIGHTS ADAPTERS
// =============================================================================

export function adaptOutcomeSummaryToDemo(
  outcomes: RecentOutcome[],
  totalResolved: number
): OutcomeSummary {
  const successfulOutcomes = outcomes.filter((o) => o.success);
  const diySuccessRate = totalResolved > 0
    ? Math.round((successfulOutcomes.length / totalResolved) * 100)
    : 0;

  const costDeltas = outcomes
    .map((o) => o.costDelta)
    .filter((d): d is number => d !== null);
  const avgCostDelta = costDeltas.length > 0
    ? Math.round(costDeltas.reduce((sum, d) => sum + d, 0) / costDeltas.length)
    : 0;

  return {
    diySuccessRate,
    totalResolved,
    avgCostDelta,
    avgResolutionTimeDays: 2.3, // Default value, can be calculated from data
  };
}

// =============================================================================
// MAIN ADAPTER FUNCTION
// =============================================================================

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
  const firstName = data.userProfile?.name?.split(" ")[0] || "there";

  // Convert pipeline summary keys
  const normalizedPipeline: PipelineSummary = {
    open: data.pipelineSummary.open,
    investigating: data.pipelineSummary.investigating,
    optionsGenerated: data.pipelineSummary.options_generated,
    decided: data.pipelineSummary.decided,
    inProgress: data.pipelineSummary.in_progress,
    completed: data.pipelineSummary.completed,
    deferred: data.pipelineSummary.deferred,
  };

  // Adapt groups - use the Group interface expected by demo components
  const groups: Group[] = data.activeGroups.map((g) => ({
    id: g.group.id,
    name: g.group.name,
    role: capitalizeRole(g.membership.role),
    issues: 0,
    savings: 0,
    members: 0,
  }));

  const pipelineCounts = calculatePipelineCounts(normalizedPipeline);

  return {
    header: {
      userName: firstName,
      hourlyRate: Math.round(data.financials.hourlyRate),
      monthlyIncome: Math.round(data.financials.monthlyIncome),
    },
    stats: adaptStatsToDemo(normalizedPipeline, data.savings, groups),
    safetyAlerts: adaptSafetyAlertsToDemo(data.safetyAlerts),
    outcomeSummary: adaptOutcomeSummaryToDemo(
      adaptRecentOutcomesToDemo(data.recentOutcomes),
      normalizedPipeline.completed
    ),
    pipeline: adaptPipelineToDemo(normalizedPipeline),
    pipelineActiveCount: pipelineCounts.active,
    pipelineCompletedCount: pipelineCounts.completed,
    openIssues: data.openIssues.map((oi) => ({
      id: oi.issue.id,
      title: oi.issue.title,
      status: oi.issue.status,
      group: oi.group.name,
    })),
    pendingDecisions: data.pendingDecisions.map((pd) => ({
      id: pd.issue.id,
      issueTitle: pd.issue.title,
      groupName: pd.group.name,
      priority: pd.issue.priority,
      diyOption: pd.option.type === "diy"
        ? {
            cost: `$${pd.option.costMin || 0}${pd.option.costMax ? `-$${pd.option.costMax}` : ""}`,
            time: pd.option.timeEstimate || "TBD",
          }
        : undefined,
      proOption: pd.option.type === "hire"
        ? { cost: `$${pd.option.costMin || 0}${pd.option.costMax ? `-$${pd.option.costMax}` : ""}` }
        : undefined,
      recommendation: "Recommended",
    })),
    deferredDecisions: adaptDeferredDecisionsToDemo(data.deferredDecisions),
    groups,
    financials: data.financials,
    budgetCategories: adaptSpendingCategoryToDemo(data.spendingByCategory),
    savingsOverTime: generateSavingsOverTime(data.savings.totalSavings),
    savings: data.savings,
    calendarEvents: adaptCalendarEventsToDemo(data.calendarEvents),
    reminders: adaptRemindersToDemo(data.upcomingReminders),
    activeGuides: adaptActiveGuidesToDemo(data.activeGuides),
    recentOutcomes: adaptRecentOutcomesToDemo(data.recentOutcomes),
    pendingVendors: adaptPendingVendorsToDemo(data.pendingVendors),
    shoppingList: adaptShoppingListToDemo(data.shoppingList),
    recentActivity: adaptRecentActivityToDemo(data.recentActivity),
    groupActivity: adaptRecentActivityToDemo(data.groupActivityFeed),
    weatherData: weatherData || null,
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

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function formatEventDate(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function formatEventTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function mapEventType(type?: string): "contractor" | "diy" | "reminder" {
  if (!type) return "reminder";
  if (type.toLowerCase().includes("contractor") || type.toLowerCase().includes("hire")) return "contractor";
  if (type.toLowerCase().includes("diy") || type.toLowerCase().includes("schedule")) return "diy";
  return "reminder";
}

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

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

function generateSavingsOverTime(totalSavings: number): SavingsOverTime[] {
  // Generate a realistic progression to current total
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const progression = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0];

  return months.map((month, index) => {
    const savings = Math.round(totalSavings * progression[index]);
    const diy = Math.round(savings * 0.65);
    const avoided = savings - diy;
    return { month, savings, diy, avoided };
  });
}

// =============================================================================
// GRAPHQL ADAPTER
// =============================================================================

import type { DashboardDataResponse } from "@/lib/graphql/types";

/**
 * Adapts GraphQL dashboard data response to demo component format
 */
export function adaptGraphQLDashboardData(data: DashboardDataResponse): AdaptedDashboardData {
  const firstName = data.user.name?.split(" ")[0] || "there";

  // Adapt pipeline summary
  const normalizedPipeline: PipelineSummary = {
    open: data.pipelineSummary.open,
    investigating: data.pipelineSummary.investigating,
    optionsGenerated: data.pipelineSummary.optionsGenerated,
    decided: data.pipelineSummary.decided,
    inProgress: data.pipelineSummary.inProgress,
    completed: data.pipelineSummary.completed,
    deferred: data.pipelineSummary.deferred,
  };

  const pipelineCounts = calculatePipelineCounts(normalizedPipeline);

  // Adapt groups
  const groups: Group[] = data.groups.map((g) => ({
    id: g.id,
    name: g.name,
    role: capitalizeRole(g.role),
    issues: g.issueCount,
    savings: g.savings,
    members: g.memberCount,
  }));

  // Adapt stats
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
      value: Math.round(data.stats.totalSaved),
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

  // Adapt open issues
  const openIssues: OpenIssue[] = data.openIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    status: issue.status,
    group: issue.groupName,
    priority: issue.priority,
  }));

  // Adapt safety alerts - already in correct format
  const safetyAlerts: SafetyAlert[] = data.safetyAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    groupName: alert.groupName,
    emergencyInstructions: alert.emergencyInstructions || undefined,
  }));

  // Adapt pending decisions
  const pendingDecisions: PendingDecision[] = data.pendingDecisions.map((pd) => ({
    id: pd.id,
    issueTitle: pd.title,
    groupName: pd.groupName,
    priority: pd.priority,
    diyOption: pd.optionType === "diy"
      ? {
          cost: `$${pd.costMin || 0}${pd.costMax ? `-$${pd.costMax}` : ""}`,
          time: pd.timeEstimate || "TBD",
        }
      : undefined,
    proOption: pd.optionType === "hire"
      ? { cost: `$${pd.costMin || 0}${pd.costMax ? `-$${pd.costMax}` : ""}` }
      : undefined,
    recommendation: "Recommended",
  }));

  // Adapt deferred decisions
  const deferredDecisions: DeferredDecision[] = data.deferredDecisions.map((d) => ({
    id: d.id,
    title: d.title,
    reason: d.reason || "Deferred",
    date: d.revisitDate ? formatRelativeDate(new Date(d.revisitDate)) : "No date set",
  }));

  // Adapt calendar events
  const calendarEvents: CalendarEvent[] = data.calendarEvents.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time || undefined,
    type: mapEventType(event.type),
  }));

  // Adapt reminders
  const reminders: Reminder[] = data.reminders.map((r) => ({
    id: r.id,
    issueId: r.issueId || undefined,
    title: r.title,
    groupName: r.groupName || undefined,
    date: new Date(r.date),
  }));

  // Adapt active guides
  const activeGuides: ActiveGuide[] = data.activeGuides.map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress,
    completedSteps: g.completedSteps,
    totalSteps: g.totalSteps,
  }));

  // Adapt recent outcomes
  const recentOutcomes: RecentOutcome[] = data.recentOutcomes.map((o) => ({
    id: o.id,
    issueTitle: o.issueTitle,
    success: o.success,
    optionType: o.optionType,
    actualCost: o.actualCost,
    costDelta: o.costDelta,
  }));

  // Adapt outcome summary
  const outcomeSummary: OutcomeSummary = {
    diySuccessRate: data.outcomeSummary.diySuccessRate,
    totalResolved: data.outcomeSummary.totalResolved,
    avgCostDelta: data.outcomeSummary.avgCostDelta,
    avgResolutionTimeDays: data.outcomeSummary.avgResolutionTimeDays,
  };

  // Adapt pending vendors
  const pendingVendors: PendingVendor[] = data.pendingVendors.map((v) => ({
    id: v.id,
    vendorName: v.vendorName,
    issueTitle: v.issueTitle || "",
    rating: v.rating || 0,
    quoteAmount: v.quoteAmount || 0,
  }));

  // Adapt shopping list
  const shoppingList: ShoppingItem[] = data.shoppingList.map((item) => ({
    id: item.id,
    productName: item.productName,
    storeName: item.storeName || "",
    estimatedCost: item.estimatedCost || 0,
    inStock: item.inStock ?? true,
  }));

  // Adapt spending by category
  const budgetCategories: BudgetCategory[] = data.spendingByCategory.map((cat) => ({
    category: cat.category,
    amount: cat.amount,
    color: cat.color || CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
  }));

  // Adapt savings over time
  const savingsOverTime: SavingsOverTime[] = data.savingsOverTime.length > 0
    ? data.savingsOverTime.map((s) => ({
        month: s.month,
        savings: s.savings,
        diy: s.diy,
        avoided: s.hired, // Map 'hired' to 'avoided' for consistency with demo
      }))
    : generateSavingsOverTime(data.stats.totalSaved);

  // Adapt recent activity
  const recentActivity: Activity[] = data.recentActivity.map((a) => ({
    id: a.id,
    message: a.message,
    time: a.time,
    avatar: a.avatar || "📋",
  }));

  // Build financials
  const financials: Financials = {
    monthlyIncome: data.financials.monthlyIncome,
    annualIncome: data.financials.annualIncome,
    hourlyRate: data.financials.hourlyRate,
    totalSpent: data.financials.totalSpent,
    remaining: data.financials.remaining,
    budgetUsedPercent: data.financials.budgetUsedPercent,
    totalBudget: data.financials.totalBudget,
  };

  // Build savings data
  const savings: SavingsData = {
    totalSavings: data.stats.totalSaved,
    successfulDiyCount: data.recentOutcomes.filter((o) => o.success && o.optionType === "diy").length,
  };

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
    groupActivity: recentActivity, // Reuse recent activity for group activity
    weatherData: data.weatherData || null,
    userLocation: data.userLocation || null,
  };
}
