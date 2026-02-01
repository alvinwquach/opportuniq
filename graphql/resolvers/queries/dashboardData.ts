/**
 * Dashboard Data Resolver
 *
 * Comprehensive resolver that returns all data needed for the main dashboard view.
 * Ports logic from app/dashboard/actions.ts to GraphQL.
 */

import { eq, and, gte, lte, desc, count, sql, isNotNull, inArray } from "drizzle-orm";
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
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Frequency multipliers to convert to monthly
const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

// Convert to hourly (assuming 40hr work week, 52 weeks)
const ANNUAL_HOURS = 2080;

// Color palette for spending categories
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

export async function dashboardDataResolver(
  _: unknown,
  __: unknown,
  ctx: Context
) {
  requireAuth(ctx);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // PHASE 1: Get user data and groups (needed for subsequent queries)
  const [userGroupsResult, userProfileResult, incomeStreamsResult, budgetsResult, monthlyExpensesResult] =
    await Promise.all([
      // User's groups with membership info
      ctx.db
        .select({
          group: groups,
          membership: groupMembers,
          constraints: groupConstraints,
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .leftJoin(groupConstraints, eq(groups.id, groupConstraints.groupId))
        .where(eq(groupMembers.userId, ctx.userId)),

      // User profile
      ctx.db.select().from(users).where(eq(users.id, ctx.userId)),

      // Income streams
      ctx.db
        .select()
        .from(userIncomeStreams)
        .where(
          and(eq(userIncomeStreams.userId, ctx.userId), eq(userIncomeStreams.isActive, true))
        ),

      // User budgets
      ctx.db.select().from(userBudgets).where(eq(userBudgets.userId, ctx.userId)),

      // This month's personal expenses
      ctx.db
        .select({
          total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)`,
        })
        .from(userExpenses)
        .where(and(eq(userExpenses.userId, ctx.userId), gte(userExpenses.date, startOfMonth))),
    ]);

  const [userProfile] = userProfileResult;

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  // Calculate monthly and hourly income
  let monthlyIncome = 0;
  for (const stream of incomeStreamsResult) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  // Get active groups
  const activeGroups = userGroupsResult.filter((g) => g.membership.status === "active");
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  // Calculate budget info
  const totalBudget = budgetsResult.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const totalSpent = Number(monthlyExpensesResult[0]?.total || 0);

  // Base user data
  const user = {
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    avatarUrl: userProfile.avatarUrl,
    postalCode: userProfile.postalCode,
    city: userProfile.city,
    latitude: userProfile.latitude ?? null,
    longitude: userProfile.longitude ?? null,
  };

  const financials = {
    monthlyIncome,
    annualIncome,
    hourlyRate,
    totalSpent,
    remaining: Math.max(0, (totalBudget || monthlyIncome * 0.2) - totalSpent),
    budgetUsedPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    totalBudget: totalBudget || monthlyIncome * 0.2,
  };

  const userLocation = userProfile.postalCode
    ? {
        postalCode: userProfile.postalCode,
        city: userProfile.city,
        latitude: userProfile.latitude ?? null,
        longitude: userProfile.longitude ?? null,
      }
    : null;

  // If no groups, return minimal data
  if (groupIds.length === 0) {
    return {
      user,
      financials,
      stats: {
        activeIssues: 0,
        activeIssuesTrend: null,
        pendingDecisions: 0,
        pendingDecisionsTrend: null,
        totalSaved: 0,
        totalSavedTrend: null,
        groupCount: 0,
        groupCountTrend: null,
      },
      pipelineSummary: {
        open: 0,
        investigating: 0,
        optionsGenerated: 0,
        decided: 0,
        inProgress: 0,
        completed: 0,
        deferred: 0,
      },
      openIssues: [],
      safetyAlerts: [],
      pendingDecisions: [],
      deferredDecisions: [],
      groups: [],
      calendarEvents: [],
      reminders: [],
      activeGuides: [],
      recentOutcomes: [],
      outcomeSummary: {
        diySuccessRate: 0,
        totalResolved: 0,
        avgCostDelta: 0,
        avgResolutionTimeDays: 0,
      },
      pendingVendors: [],
      shoppingList: [],
      spendingByCategory: [],
      savingsOverTime: [],
      recentActivity: [],
      userLocation,
      weatherData: null,
    };
  }

  // PHASE 2: Fetch all group-related data in parallel
  const [
    openIssuesResult,
    safetyAlertsResult,
    pendingDecisionsResult,
    deferredResult,
    memberCountsResult,
    statusCountsResult,
    activeGuidesResult,
    outcomesResult,
    schedulesResult,
    vendorsResult,
    productsResult,
    spendingResult,
  ] = await Promise.all([
    // Open issues
    ctx.db
      .select({
        issue: issues,
        group: groups,
      })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(
        and(
          inArray(issues.groupId, groupIds),
          sql`${issues.status}::text IN ('open', 'investigating', 'in_progress')`
        )
      )
      .orderBy(desc(issues.createdAt))
      .limit(10),

    // Safety alerts (high severity/urgency issues)
    ctx.db
      .select({
        issue: issues,
        group: groups,
      })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(
        and(
          inArray(issues.groupId, groupIds),
          sql`${issues.status}::text NOT IN ('completed', 'deferred')`,
          sql`(
            (${issues.severity} IS NOT NULL AND ${issues.severity}::text = 'critical')
            OR (${issues.urgency} IS NOT NULL AND ${issues.urgency}::text IN ('now', 'emergency'))
            OR ${issues.isEmergency} = true
          )`
        )
      )
      .limit(5),

    // Pending decisions (issues with options generated awaiting decision)
    ctx.db
      .select({
        issue: issues,
        group: groups,
        option: decisionOptions,
      })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .innerJoin(decisionOptions, eq(decisionOptions.issueId, issues.id))
      .where(
        and(
          inArray(issues.groupId, groupIds),
          sql`${issues.status}::text = 'options_generated'`,
          eq(decisionOptions.recommended, true)
        )
      )
      .orderBy(desc(issues.updatedAt))
      .limit(5),

    // Deferred decisions
    ctx.db
      .select({
        decision: decisions,
        option: decisionOptions,
        issue: issues,
        group: groups,
      })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(
        and(
          inArray(issues.groupId, groupIds),
          eq(decisionOptions.type, "defer"),
          isNotNull(decisions.revisitDate)
        )
      )
      .orderBy(decisions.revisitDate)
      .limit(5),

    // Member counts for groups
    ctx.db
      .select({
        groupId: groupMembers.groupId,
        memberCount: count(),
      })
      .from(groupMembers)
      .where(and(inArray(groupMembers.groupId, groupIds), eq(groupMembers.status, "active")))
      .groupBy(groupMembers.groupId),

    // Status counts for pipeline
    ctx.db
      .select({
        status: issues.status,
        count: count(),
      })
      .from(issues)
      .where(inArray(issues.groupId, groupIds))
      .groupBy(issues.status),

    // Active guides
    ctx.db
      .select({ progress: userGuideProgress, guide: guides })
      .from(userGuideProgress)
      .innerJoin(guides, eq(userGuideProgress.guideId, guides.id))
      .where(and(eq(userGuideProgress.userId, ctx.userId), eq(userGuideProgress.isCompleted, false)))
      .orderBy(desc(userGuideProgress.lastAccessedAt))
      .limit(3),

    // Recent outcomes
    ctx.db
      .select({
        outcome: decisionOutcomes,
        option: decisionOptions,
        decision: decisions,
        issue: issues,
      })
      .from(decisionOutcomes)
      .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .where(inArray(issues.groupId, groupIds))
      .orderBy(desc(decisionOutcomes.completedAt))
      .limit(5),

    // Scheduled events
    ctx.db
      .select({
        schedule: diySchedules,
        issue: issues,
        group: groups,
      })
      .from(diySchedules)
      .innerJoin(issues, eq(diySchedules.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(
        and(inArray(issues.groupId, groupIds), gte(diySchedules.scheduledTime, now))
      )
      .orderBy(diySchedules.scheduledTime)
      .limit(5),

    // Pending vendors
    ctx.db
      .select({
        vendor: vendorContacts,
        option: decisionOptions,
        issue: issues,
      })
      .from(vendorContacts)
      .innerJoin(decisionOptions, eq(vendorContacts.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(and(inArray(issues.groupId, groupIds), eq(vendorContacts.contacted, false)))
      .limit(5),

    // Shopping list
    ctx.db
      .select({
        product: productRecommendations,
        option: decisionOptions,
        issue: issues,
      })
      .from(productRecommendations)
      .innerJoin(decisionOptions, eq(productRecommendations.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(inArray(issues.groupId, groupIds))
      .limit(10),

    // Spending by category this month
    ctx.db
      .select({
        category: userExpenses.category,
        total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)`,
      })
      .from(userExpenses)
      .where(and(eq(userExpenses.userId, ctx.userId), gte(userExpenses.date, startOfMonth)))
      .groupBy(userExpenses.category),
  ]);

  // Build lookup maps
  const memberCountMap = new Map(memberCountsResult.map((m) => [m.groupId, m.memberCount]));
  const statusCountMap = new Map(statusCountsResult.map((s) => [s.status, Number(s.count)]));

  // Format open issues
  const openIssues = openIssuesResult.map(({ issue, group }) => ({
    id: issue.id,
    title: issue.title || "Untitled Issue",
    status: issue.status,
    priority: issue.priority || "medium",
    groupName: group.name,
    groupId: group.id,
    createdAt: issue.createdAt,
  }));

  // Format safety alerts
  const safetyAlerts = safetyAlertsResult.map(({ issue, group }) => ({
    id: issue.id,
    title: issue.title || "Untitled Issue",
    severity: issue.severity || "high",
    groupName: group.name,
    emergencyInstructions: issue.emergencyInstructions,
  }));

  // Format pending decisions
  const pendingDecisions = pendingDecisionsResult.map(({ issue, group, option }) => ({
    id: issue.id,
    issueId: issue.id,
    title: issue.title || "Untitled Issue",
    priority: issue.priority || "medium",
    groupName: group.name,
    optionType: option.type,
    costMin: option.costMin ? parseFloat(option.costMin) : null,
    costMax: option.costMax ? parseFloat(option.costMax) : null,
    timeEstimate: option.timeEstimate,
    voteCount: 0,
    totalMembers: memberCountMap.get(group.id) || 0,
  }));

  // Format deferred decisions
  const deferredDecisions = deferredResult.map(({ decision, issue }) => ({
    id: decision.id,
    title: issue.title || "Untitled Issue",
    revisitDate: decision.revisitDate,
    reason: decision.deferralReason,
  }));

  // Format groups
  const formattedGroups = activeGroups.map(({ group, membership }) => ({
    id: group.id,
    name: group.name,
    role: membership.role,
    memberCount: memberCountMap.get(group.id) || 0,
    issueCount: 0, // Would need another query
    savings: 0, // Would need outcome calculations
  }));

  // Format calendar events
  const calendarEvents = schedulesResult.map(({ schedule, issue, group }) => {
    const date = new Date(schedule.scheduledTime);
    return {
      id: schedule.id,
      title: issue.title || "Scheduled work",
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      type: "diy",
      groupName: group.name,
    };
  });

  // Format reminders from deferred decisions
  const reminders = deferredResult
    .filter(({ decision }) => decision.revisitDate)
    .map(({ decision, issue, group }) => ({
      id: decision.id,
      issueId: issue.id,
      title: `Follow up: ${issue.title}`,
      groupName: group.name,
      date: decision.revisitDate!,
    }));

  // Format active guides
  const activeGuidesFormatted = activeGuidesResult.map(({ progress, guide }) => ({
    id: guide.id,
    title: guide.title,
    progress: progress.progressPercent || 0,
    totalSteps: guide.totalSteps || 1,
    completedSteps: progress.currentStep || 0,
  }));

  // Format recent outcomes
  const recentOutcomes = outcomesResult.map(({ outcome, option, issue }) => ({
    id: outcome.id,
    issueTitle: issue.title || "Untitled Issue",
    success: outcome.success ?? true,
    optionType: option.type,
    actualCost: outcome.actualCost ? parseFloat(outcome.actualCost) : null,
    costDelta: outcome.costDelta ? parseFloat(outcome.costDelta) : null,
  }));

  // Calculate outcome summary
  const successfulOutcomes = outcomesResult.filter(({ outcome }) => outcome.success);
  const diyOutcomes = outcomesResult.filter(({ option }) => option.type === "diy");
  const diySuccessful = diyOutcomes.filter(({ outcome }) => outcome.success);
  const totalCostDelta = outcomesResult.reduce(
    (sum, { outcome }) => sum + (outcome.costDelta ? parseFloat(outcome.costDelta) : 0),
    0
  );

  const outcomeSummary = {
    diySuccessRate: diyOutcomes.length > 0 ? Math.round((diySuccessful.length / diyOutcomes.length) * 100) : 0,
    totalResolved: outcomesResult.length,
    avgCostDelta: outcomesResult.length > 0 ? totalCostDelta / outcomesResult.length : 0,
    avgResolutionTimeDays: 2.3, // Would need more complex calculation
  };

  // Format pending vendors
  const pendingVendors = vendorsResult.map(({ vendor, issue }) => ({
    id: vendor.id,
    vendorName: vendor.vendorName,
    issueTitle: issue.title,
    rating: vendor.rating ? parseFloat(vendor.rating) : null,
    quoteAmount: vendor.quoteAmount ? parseFloat(vendor.quoteAmount) : null,
  }));

  // Format shopping list
  const shoppingList = productsResult.map(({ product }) => ({
    id: product.id,
    productName: product.productName,
    storeName: product.storeName,
    estimatedCost: product.estimatedCost ? parseFloat(product.estimatedCost) : null,
    inStock: product.inStock,
  }));

  // Format spending by category
  const spendingByCategory = spendingResult
    .filter(({ category }) => category)
    .map(({ category, total }) => ({
      category: category!,
      amount: Number(total),
      color: CATEGORY_COLORS[category!] || CATEGORY_COLORS.Other,
    }));

  // Pipeline summary
  const pipelineSummary = {
    open: statusCountMap.get("open") || 0,
    investigating: statusCountMap.get("investigating") || 0,
    optionsGenerated: statusCountMap.get("options_generated") || 0,
    decided: statusCountMap.get("decided") || 0,
    inProgress: statusCountMap.get("in_progress") || 0,
    completed: statusCountMap.get("completed") || 0,
    deferred: deferredResult.length,
  };

  // Stats
  const stats = {
    activeIssues: openIssues.length,
    activeIssuesTrend: null,
    pendingDecisions: pendingDecisions.length,
    pendingDecisionsTrend: null,
    totalSaved: successfulOutcomes.reduce(
      (sum, { outcome }) => sum + Math.max(0, -(outcome.costDelta ? parseFloat(outcome.costDelta) : 0)),
      0
    ),
    totalSavedTrend: null,
    groupCount: activeGroups.length,
    groupCountTrend: null,
  };

  // Recent activity (combine issues and outcomes)
  const recentActivity = [
    ...openIssuesResult.slice(0, 3).map(({ issue, group }) => ({
      id: issue.id,
      message: `New issue: ${issue.title}`,
      time: getRelativeTime(issue.createdAt),
      avatar: "📋",
      type: "issue",
    })),
    ...outcomesResult.slice(0, 2).map(({ outcome, issue }) => ({
      id: outcome.id,
      message: `${outcome.success ? "Completed" : "Closed"}: ${issue.title}`,
      time: getRelativeTime(outcome.completedAt || new Date()),
      avatar: outcome.success ? "✅" : "❌",
      type: "outcome",
    })),
  ].slice(0, 5);

  return {
    user,
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
    savingsOverTime: [], // Would need historical data query
    recentActivity,
    userLocation,
    weatherData: null, // Weather is fetched separately
  };
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
