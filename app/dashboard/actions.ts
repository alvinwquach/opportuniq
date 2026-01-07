"use server";

import { db } from "@/app/db/client";
import {
  users,
  groupMembers,
  groups,
  userIncomeStreams,
  userBudgets,
  userExpenses,
  groupConstraints,
  groupExpenses,
  budgetContributions,
  issues,
  decisions,
  decisionOptions,
  decisionVotes,
  guides,
  userGuideProgress,
  decisionOutcomes,
  diySchedules,
  vendorContacts,
  productRecommendations,
} from "@/app/db/schema";
import { eq, and, gte, lte, desc, count, sql, isNotNull, avg, inArray } from "drizzle-orm";
import { geocodePostalCode } from "@/lib/geocoding";

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

export async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Helper to handle database connection errors
  const handleDbError = (error: any, operation: string) => {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || error?.cause?.code;
    
    // Check for "Tenant or user not found" error (XX000)
    if (
      errorCode === "XX000" ||
      errorMsg.includes("Tenant or user not found") ||
      errorMsg.includes("authentication") ||
      errorMsg.includes("password")
    ) {
      console.error(`[Dashboard] Database connection error in ${operation}:`, {
        error: errorMsg,
        code: errorCode,
      });
      
      throw new Error(
        `Database connection failed. Please check your DATABASE_URL environment variable. ` +
        `Error: ${errorMsg}`
      );
    }
    
    throw error;
  };

  try {
    // PHASE 1: Get user data and groups (needed for subsequent queries)
    const [
      userGroupsResult,
      userProfileResult,
      incomeStreamsResult,
      budgetsResult,
      monthlyExpensesResult,
    ] = await Promise.allSettled([
      // User's groups with membership info
      db
        .select({
          group: groups,
          membership: groupMembers,
          constraints: groupConstraints,
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .leftJoin(groupConstraints, eq(groups.id, groupConstraints.groupId))
        .where(eq(groupMembers.userId, userId)),

      // User profile
      db.select().from(users).where(eq(users.id, userId)),

      // Income streams
      db
        .select()
        .from(userIncomeStreams)
        .where(
          and(
            eq(userIncomeStreams.userId, userId),
            eq(userIncomeStreams.isActive, true)
          )
        ),

      // User budgets
      db.select().from(userBudgets).where(eq(userBudgets.userId, userId)),

      // This month's personal expenses
      db
        .select({
          total: sql<number>`COALESCE(SUM(${userExpenses.amount}), 0)`,
        })
        .from(userExpenses)
        .where(
          and(
            eq(userExpenses.userId, userId),
            gte(userExpenses.date, startOfMonth)
          )
        ),
    ]);

    // Check for database connection errors
    const errors = [
      userGroupsResult,
      userProfileResult,
      incomeStreamsResult,
      budgetsResult,
      monthlyExpensesResult,
    ].filter((r) => r.status === "rejected");

    for (const errorResult of errors) {
      if (errorResult.status === "rejected") {
        const error = errorResult.reason;
        const errorMsg = error?.message || String(error);
        const errorCode = error?.code || error?.cause?.code;
        
        if (
          errorCode === "XX000" ||
          errorMsg.includes("Tenant or user not found") ||
          errorMsg.includes("authentication") ||
          errorMsg.includes("password")
        ) {
          handleDbError(error, "database query");
        }
      }
    }

    // Extract results (use defaults if failed)
    const userGroups = userGroupsResult.status === "fulfilled" ? userGroupsResult.value : [];
    const userProfileArray = userProfileResult.status === "fulfilled" ? userProfileResult.value : [];
    const incomeStreams = incomeStreamsResult.status === "fulfilled" ? incomeStreamsResult.value : [];
    const budgets = budgetsResult.status === "fulfilled" ? budgetsResult.value : [];
    const monthlyExpenses = monthlyExpensesResult.status === "fulfilled" ? monthlyExpensesResult.value : [{ total: 0 }];

    const [userProfile] = userProfileArray;
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Calculate monthly and hourly income
    let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }
  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

    // Get active groups
    const activeGroups = userGroups.filter((g) => g.membership.status === "active");
    const pendingGroups = userGroups.filter((g) => g.membership.status === "pending");
  // Ensure groupIds is always an array (even if empty) and contains only valid UUIDs
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  
  // Debug: Log groupIds to ensure it's an array
  if (groupIds.length > 0) {
    console.log("[Dashboard] groupIds array:", { length: groupIds.length, first: groupIds[0], isArray: Array.isArray(groupIds) });
  }

  // FAST PATH: For new users with no groups, return minimal data immediately
  if (groupIds.length === 0) {
    // Calculate budget info
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
    const totalSpent = Number(monthlyExpenses[0]?.total || 0);

    return {
      userProfile,
      activeGroups: [],
      pendingGroups,
      incomeStreams,
      budgets,
      financials: {
        monthlyIncome,
        annualIncome,
        hourlyRate,
        totalSpent,
        remaining: monthlyIncome - totalSpent,
        budgetUsedPercent: monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0,
        totalBudget,
      },
      pendingDecisions: [],
      openIssues: [],
      recentActivity: [],
      spendingByCategory: [],
      hasIncomeSetup: incomeStreams.length > 0,
      activeGuides: [],
      upcomingReminders: [],
      savings: { totalSavings: 0, successfulDiyCount: 0 },
      groupFinances: [],
      calendarEvents: [],
      recentOutcomes: [],
      pendingVendors: [],
      shoppingList: [],
      personalBudgets: [],
      recentPersonalExpenses: [],
      safetyAlerts: [],
      aiInsights: [],
      mapVendors: [],
      mapStores: [],
      deferredDecisions: [],
      groupActivityFeed: [],
      pipelineSummary: {
        open: 0, investigating: 0, options_generated: 0,
        decided: 0, in_progress: 0, completed: 0, deferred: 0,
      },
    };
  }

  // Full path for users with groups

  let pendingDecisions: {
    issue: typeof issues.$inferSelect;
    option: typeof decisionOptions.$inferSelect;
    group: typeof groups.$inferSelect;
    voteCount: number;
    totalMembers: number;
  }[] = [];

  let openIssues: {
    issue: typeof issues.$inferSelect;
    group: typeof groups.$inferSelect;
  }[] = [];

  let recentActivity: {
    type: "issue" | "decision" | "expense";
    title: string;
    description: string;
    timestamp: Date;
    groupName: string;
  }[] = [];

  // PHASE 2: Run all group-related queries in parallel (if user has groups)
  // Safety check: Ensure groupIds is a proper array before using inArray
  if (groupIds.length > 0 && Array.isArray(groupIds)) {
    // Double-check: ensure all IDs are strings
    const validGroupIds = groupIds.filter((id): id is string => typeof id === "string" && id.length > 0);
    
    if (validGroupIds.length === 0) {
      // No valid group IDs, skip group queries
      console.warn("[Dashboard] No valid group IDs found, skipping group queries");
    } else {
      const [
        issuesWithRecommendedOptions,
        openIssuesResult,
        recentIssues,
        recentDecisionsResult,
        memberCounts,
      ] = await Promise.all([
        // Get issues with recommended options in a single query (no loop!)
        db
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
              inArray(issues.groupId, validGroupIds),
              eq(issues.status, "options_generated"),
              eq(decisionOptions.recommended, true)
            )
          )
          .orderBy(desc(issues.updatedAt))
          .limit(5),

        // Get open issues (not yet analyzed)
        db
          .select({
            issue: issues,
            group: groups,
          })
          .from(issues)
          .innerJoin(groups, eq(issues.groupId, groups.id))
          .where(
            and(
              inArray(issues.groupId, validGroupIds),
              sql`${issues.status} IN ('open', 'investigating')`
            )
          )
          .orderBy(desc(issues.createdAt))
          .limit(5),

        // Recent issues created in last 7 days
        db
          .select({
            issue: issues,
            group: groups,
          })
          .from(issues)
          .innerJoin(groups, eq(issues.groupId, groups.id))
          .where(
            and(
              inArray(issues.groupId, validGroupIds),
              gte(issues.createdAt, sevenDaysAgo)
            )
          )
          .orderBy(desc(issues.createdAt))
          .limit(10),

        // Get decisions with outcomes for activity feed
        db
          .select({
            decision: decisions,
            option: decisionOptions,
            issue: issues,
            group: groups,
            outcome: decisionOutcomes,
          })
          .from(decisions)
          .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
          .innerJoin(issues, eq(decisions.issueId, issues.id))
          .innerJoin(groups, eq(issues.groupId, groups.id))
          .leftJoin(decisionOutcomes, eq(decisions.id, decisionOutcomes.decisionId))
          .where(
            and(
              inArray(issues.groupId, validGroupIds),
              gte(decisions.approvedAt, sevenDaysAgo)
            )
          )
          .orderBy(desc(decisions.approvedAt))
          .limit(5),

        // Get member counts for all groups in a single query
        db
          .select({
            groupId: groupMembers.groupId,
            memberCount: count(),
          })
          .from(groupMembers)
          .where(
            and(
              inArray(groupMembers.groupId, validGroupIds),
              eq(groupMembers.status, "active")
            )
          )
          .groupBy(groupMembers.groupId),
      ]);

    // Build member count lookup
    const memberCountMap = new Map(memberCounts.map(m => [m.groupId, m.memberCount]));

    // Build pending decisions from joined query results
    pendingDecisions = issuesWithRecommendedOptions.map(({ issue, group, option }) => ({
      issue,
      option,
      group,
      voteCount: 0,
      totalMembers: memberCountMap.get(group.id) || 0,
    }));

    openIssues = openIssuesResult;

    recentActivity = recentIssues.map(({ issue, group }) => ({
      type: "issue" as const,
      title: issue.title,
      description: issue.description || "No description",
      timestamp: issue.createdAt,
      groupName: group.name,
    }));

    // Add decisions to activity feed
    for (const { decision, option, issue, group, outcome } of recentDecisionsResult) {
      recentActivity.push({
        type: "decision" as const,
        title: `${option.type === "diy" ? "DIY" : option.type === "hire" ? "Hired" : option.type} decision on ${issue.title}`,
        description: outcome?.success
          ? `Completed successfully${outcome.actualCost ? ` for $${outcome.actualCost}` : ""}`
          : option.title,
        timestamp: decision.approvedAt,
        groupName: group.name,
      });
    }

    // Sort activity by timestamp
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    recentActivity = recentActivity.slice(0, 10);
    }
  }

  // PHASE 3: Run ALL remaining queries in parallel (massive optimization)
  // Note: Some queries require groupIds, so we need to handle them conditionally
  const validGroupIdsForPhase3 = groupIds.length > 0 && Array.isArray(groupIds) 
    ? groupIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  const [
    activeGuidesResult,
    deferredDecisionsResult,
    completedDiyDecisionsResult,
    outcomeResultsData,
    allGroupExpenses,
    allContributions,
    schedulesResult,
    vendorsResult,
    productsResult,
    spendingByCategory,
    recentPersonalExpenses,
    urgentIssuesResult,
    statusCountsResult,
    otherIssuesResult,
    otherExpensesResult,
    vendorsWithCoordsResult,
    productsWithCoordsResult,
    deferredListResult,
  ] = await Promise.all([
    // Active guides
    db
      .select({ progress: userGuideProgress, guide: guides })
      .from(userGuideProgress)
      .innerJoin(guides, eq(userGuideProgress.guideId, guides.id))
      .where(and(eq(userGuideProgress.userId, userId), eq(userGuideProgress.isCompleted, false)))
      .orderBy(desc(userGuideProgress.lastAccessedAt))
      .limit(3),

    // Deferred decisions for reminders
    db
      .select({ decision: decisions, option: decisionOptions, issue: issues, group: groups })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(
            inArray(issues.groupId, validGroupIdsForPhase3),
        eq(decisionOptions.type, "defer"),
        isNotNull(decisions.revisitDate),
        gte(decisions.revisitDate, now)
      ))
      .orderBy(decisions.revisitDate)
      .limit(5),

    // Completed DIY decisions for savings
    db
      .select({ outcome: decisionOutcomes, diyOption: decisionOptions, decision: decisions, issue: issues })
      .from(decisionOutcomes)
      .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .where(and(
            inArray(issues.groupId, validGroupIdsForPhase3),
        eq(decisionOptions.type, "diy"),
        eq(decisionOutcomes.success, true)
      )),

    // Recent outcomes
    db
      .select({ outcome: decisionOutcomes, option: decisionOptions, decision: decisions, issue: issues, group: groups })
      .from(decisionOutcomes)
      .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(inArray(issues.groupId, validGroupIdsForPhase3))
      .orderBy(desc(decisionOutcomes.completedAt))
      .limit(5),

    // All group expenses this month (batched, not per-group)
    db
      .select({ expense: groupExpenses, groupId: groupExpenses.groupId })
      .from(groupExpenses)
      .where(and(inArray(groupExpenses.groupId, validGroupIdsForPhase3), gte(groupExpenses.date, startOfMonth)))
      .orderBy(desc(groupExpenses.date)),

    // All contributions (batched)
    db
      .select({ contribution: budgetContributions, member: groupMembers, user: users, groupId: budgetContributions.groupId })
      .from(budgetContributions)
      .innerJoin(groupMembers, eq(budgetContributions.memberId, groupMembers.id))
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(inArray(budgetContributions.groupId, validGroupIdsForPhase3))
      .orderBy(desc(budgetContributions.contributedAt)),

    // DIY schedules
    db
      .select({ schedule: diySchedules, issue: issues, group: groups })
      .from(diySchedules)
      .innerJoin(issues, eq(diySchedules.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(
            inArray(issues.groupId, validGroupIdsForPhase3),
        gte(diySchedules.scheduledTime, now),
        lte(diySchedules.scheduledTime, thirtyDaysFromNow)
      ))
      .orderBy(diySchedules.scheduledTime)
      .limit(10),

    // Pending vendors
    db
      .select({ vendor: vendorContacts, issue: issues, group: groups })
      .from(vendorContacts)
      .innerJoin(issues, eq(vendorContacts.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, validGroupIdsForPhase3), eq(vendorContacts.contacted, false)))
      .orderBy(desc(issues.createdAt))
      .limit(5),

    // Product recommendations
    db
      .select({ product: productRecommendations, option: decisionOptions, issue: issues })
      .from(productRecommendations)
      .innerJoin(decisionOptions, eq(productRecommendations.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(and(
            inArray(issues.groupId, validGroupIdsForPhase3),
        eq(decisionOptions.type, "diy"),
        sql`${issues.status} IN ('options_generated', 'decided', 'in_progress')`
      ))
      .orderBy(desc(issues.updatedAt))
      .limit(10),

    // Spending by category
    db
      .select({ category: userExpenses.category, total: sql<number>`SUM(${userExpenses.amount})` })
      .from(userExpenses)
      .where(and(eq(userExpenses.userId, userId), gte(userExpenses.date, startOfMonth)))
      .groupBy(userExpenses.category),

    // Recent personal expenses
    db.select().from(userExpenses).where(eq(userExpenses.userId, userId)).orderBy(desc(userExpenses.date)).limit(10),

    // Safety alerts (urgent issues)
    db
      .select({ issue: issues, group: groups })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(
            inArray(issues.groupId, validGroupIdsForPhase3),
        sql`${issues.status}::text NOT IN ('completed', 'deferred')`,
        sql`(${issues.severity}::text IN ('serious', 'critical') OR ${issues.urgency}::text IN ('now', 'emergency') OR ${issues.isEmergency} = true)`
      ))
      .orderBy(desc(issues.createdAt))
      .limit(5),

    // Pipeline status counts
    db
      .select({ status: issues.status, count: count() })
      .from(issues)
      .where(inArray(issues.groupId, validGroupIdsForPhase3))
      .groupBy(issues.status),

    // Other issues for activity feed
    db
      .select({ issue: issues, group: groups, creator: users })
      .from(issues)
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .innerJoin(users, eq(issues.createdBy, users.id))
      .where(and(inArray(issues.groupId, validGroupIdsForPhase3), gte(issues.createdAt, sevenDaysAgo), sql`${issues.createdBy} != ${userId}`))
      .orderBy(desc(issues.createdAt))
      .limit(10),

    // Other expenses for activity feed
    db
      .select({ expense: groupExpenses, group: groups, payer: groupMembers, creator: users })
      .from(groupExpenses)
      .innerJoin(groups, eq(groupExpenses.groupId, groups.id))
      .innerJoin(groupMembers, eq(groupExpenses.paidBy, groupMembers.id))
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(and(inArray(groupExpenses.groupId, validGroupIdsForPhase3), gte(groupExpenses.createdAt, sevenDaysAgo), sql`${groupMembers.userId} != ${userId}`))
      .orderBy(desc(groupExpenses.createdAt))
      .limit(5),

    // Vendors with coordinates for map
    db
      .select({ vendor: vendorContacts, issue: issues })
      .from(vendorContacts)
      .innerJoin(issues, eq(vendorContacts.issueId, issues.id))
      .where(and(inArray(issues.groupId, validGroupIdsForPhase3), isNotNull(vendorContacts.latitude), isNotNull(vendorContacts.longitude)))
      .limit(20),

    // Products with coordinates for map
    db
      .select({ product: productRecommendations, option: decisionOptions, issue: issues })
      .from(productRecommendations)
      .innerJoin(decisionOptions, eq(productRecommendations.optionId, decisionOptions.id))
      .innerJoin(issues, eq(decisionOptions.issueId, issues.id))
      .where(and(inArray(issues.groupId, validGroupIdsForPhase3), isNotNull(productRecommendations.storeLatitude), isNotNull(productRecommendations.storeLongitude)))
      .limit(20),

    // Deferred decisions list
    db
      .select({ decision: decisions, option: decisionOptions, issue: issues, group: groups })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .innerJoin(groups, eq(issues.groupId, groups.id))
      .where(and(inArray(issues.groupId, validGroupIdsForPhase3), eq(decisionOptions.type, "defer"), isNotNull(decisions.revisitDate)))
      .orderBy(decisions.revisitDate)
      .limit(5),
  ]);

  // Process results (no more await calls from here!)
  const activeGuides = activeGuidesResult;

  const upcomingReminders = deferredDecisionsResult
    .filter(d => d.decision.revisitDate)
    .map(({ decision, issue, group }) => ({
      type: "deferred_decision" as const,
      title: issue.title,
      date: decision.revisitDate!,
      issueId: issue.id,
      groupName: group.name,
    }));

  let totalSavings = 0;
  let successfulDiyCount = 0;
  for (const { decision } of completedDiyDecisionsResult) {
    successfulDiyCount++;
    const assumptions = decision.assumptions as { costSavings?: number } | null;
    if (assumptions?.costSavings) totalSavings += assumptions.costSavings;
  }

  const recentOutcomes = outcomeResultsData.map(({ outcome, option, issue, group }) => ({
    issueTitle: issue.title,
    optionType: option.type,
    success: outcome.success,
    actualCost: outcome.actualCost ? Number(outcome.actualCost) : null,
    predictedCost: option.costMax ? Number(option.costMax) : null,
    costDelta: outcome.costDelta ? Number(outcome.costDelta) : null,
    whatWentWell: outcome.whatWentWell,
    whatWentWrong: outcome.whatWentWrong,
    lessonsLearned: outcome.lessonsLearned,
    completedAt: outcome.completedAt,
    groupName: group.name,
  }));

  // Build group finances from batched queries
  const expensesByGroup = new Map<string, typeof allGroupExpenses>();
  for (const e of allGroupExpenses) {
    if (!expensesByGroup.has(e.groupId)) expensesByGroup.set(e.groupId, []);
    expensesByGroup.get(e.groupId)!.push(e);
  }
  const contributionsByGroup = new Map<string, typeof allContributions>();
  for (const c of allContributions) {
    if (!contributionsByGroup.has(c.groupId)) contributionsByGroup.set(c.groupId, []);
    contributionsByGroup.get(c.groupId)!.push(c);
  }

  const groupFinances = activeGroups.map(({ group, constraints }) => {
    const expenses = (expensesByGroup.get(group.id) || []).slice(0, 5);
    const contributions = (contributionsByGroup.get(group.id) || []).slice(0, 3);
    const monthlyGroupSpent = expenses.reduce((sum, { expense }) => sum + Number(expense.amount), 0);
    return {
      groupId: group.id,
      groupName: group.name,
      sharedBalance: constraints ? Number(constraints.sharedBalance) : 0,
      monthlyBudget: constraints?.monthlyBudget ? Number(constraints.monthlyBudget) : null,
      emergencyBuffer: constraints?.emergencyBuffer ? Number(constraints.emergencyBuffer) : null,
      monthlySpent: monthlyGroupSpent,
      recentExpenses: expenses.map(({ expense }) => ({
        id: expense.id, category: expense.category, amount: Number(expense.amount),
        description: expense.description, date: expense.date, isEmergency: expense.isEmergency ?? false,
      })),
      recentContributions: contributions.map(({ contribution, user }) => ({
        id: contribution.id, amount: Number(contribution.amount), note: contribution.note,
        contributedAt: contribution.contributedAt, memberName: user.name,
      })),
    };
  });

  // Calendar events
  let calendarEvents: {
    id: string;
    date: Date;
    type: "diy" | "contractor" | "reminder";
    title: string;
    time: string | null;
    duration: number | null;
    groupName: string;
    issueId: string;
  }[] = schedulesResult.map(({ schedule, issue, group }) => ({
    id: schedule.id,
    date: schedule.scheduledTime,
    type: "diy" as const,
    title: issue.title,
    time: schedule.scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    duration: schedule.estimatedDuration,
    groupName: group.name,
    issueId: issue.id,
  }));
  for (const reminder of upcomingReminders) {
    calendarEvents.push({
      id: `reminder-${reminder.issueId}`,
      date: reminder.date,
      type: "reminder",
      title: `Review: ${reminder.title}`,
      time: null,
      duration: null,
      groupName: reminder.groupName,
      issueId: reminder.issueId,
    });
  }
  calendarEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const pendingVendors = vendorsResult.map(({ vendor, issue, group }) => ({
    id: vendor.id, vendorName: vendor.vendorName,
    quoteAmount: vendor.quoteAmount ? Number(vendor.quoteAmount) : null,
    rating: vendor.rating, issueTitle: issue.title, groupName: group.name, contacted: vendor.contacted,
  }));

  const shoppingList = productsResult.map(({ product, issue }) => ({
    id: product.id, productName: product.productName,
    estimatedCost: product.estimatedCost ? Number(product.estimatedCost) : null,
    storeName: product.storeName, inStock: product.inStock, issueTitle: issue.title,
  }));

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const totalSpent = Number(monthlyExpenses[0]?.total || 0);
  const remaining = monthlyIncome - totalSpent;
  const budgetUsedPercent = monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0;

  // Build personal budget details with spending vs limit
  const personalBudgets: {
    category: string;
    monthlyLimit: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
  }[] = [];

  for (const budget of budgets) {
    const categorySpend = spendingByCategory.find(
      (s) => s.category.toLowerCase() === budget.category.toLowerCase()
    );
    const spent = categorySpend ? Number(categorySpend.total) : 0;
    const limit = Number(budget.monthlyLimit);
    personalBudgets.push({
      category: budget.category,
      monthlyLimit: limit,
      spent,
      remaining: limit - spent,
      percentUsed: limit > 0 ? (spent / limit) * 100 : 0,
      isOverBudget: spent > limit,
    });
  }

  // SAFETY ALERTS - use urgentIssuesResult from parallel query
  const safetyAlerts = urgentIssuesResult.map(({ issue, group }) => ({
    id: issue.id,
    title: issue.title,
    riskLevel: issue.severity || "unknown",
    severity: issue.severity || "unknown",
    groupName: group.name,
    emergencyInstructions: issue.emergencyInstructions,
    createdAt: issue.createdAt,
  }));

  // AI LEARNING INSIGHTS - Patterns from outcomes
  const aiInsights: {
    type: "time_accuracy" | "cost_accuracy" | "diy_success" | "pattern";
    title: string;
    description: string;
    metric?: string;
    trend?: "improving" | "declining" | "stable";
  }[] = [];

  if (recentOutcomes.length >= 3) {
    const costDeltas = recentOutcomes.filter((o) => o.costDelta !== null).map((o) => o.costDelta!);
    if (costDeltas.length >= 2) {
      const avgCostDelta = costDeltas.reduce((a, b) => a + b, 0) / costDeltas.length;
      if (avgCostDelta > 50) {
        aiInsights.push({
          type: "cost_accuracy", title: "Cost Underestimation",
          description: `Your projects cost ~$${Math.abs(avgCostDelta).toFixed(0)} more than estimated on average`,
          metric: `+$${Math.abs(avgCostDelta).toFixed(0)}`, trend: "declining",
        });
      } else if (avgCostDelta < -50) {
        aiInsights.push({
          type: "cost_accuracy", title: "Cost Savings",
          description: `You're spending ~$${Math.abs(avgCostDelta).toFixed(0)} less than estimated on average`,
          metric: `-$${Math.abs(avgCostDelta).toFixed(0)}`, trend: "improving",
        });
      }
    }
    const diyOutcomes = recentOutcomes.filter((o) => o.optionType === "diy");
    if (diyOutcomes.length >= 2) {
      const successRate = (diyOutcomes.filter((o) => o.success).length / diyOutcomes.length) * 100;
      aiInsights.push({
        type: "diy_success", title: "DIY Success Rate",
        description: successRate >= 80 ? "You're great at DIY projects! Keep it up."
          : successRate >= 50 ? "Consider hiring for complex projects" : "You may want to focus on simpler DIY tasks",
        metric: `${successRate.toFixed(0)}%`,
        trend: successRate >= 70 ? "improving" : successRate >= 50 ? "stable" : "declining",
      });
    }
  }

  // MAP DATA - use vendorsWithCoordsResult and productsWithCoordsResult from parallel query
  const mapVendors = vendorsWithCoordsResult
    .filter((v) => v.vendor.latitude && v.vendor.longitude)
    .map(({ vendor }) => ({
      id: vendor.id, name: vendor.vendorName, latitude: vendor.latitude!, longitude: vendor.longitude!,
      rating: vendor.rating ? parseFloat(vendor.rating) : undefined,
      specialty: vendor.specialty || undefined, type: "vendor" as const,
    }));

  const storeMap = new Map<string, { name: string; latitude: number; longitude: number; distance?: number; productCount: number }>();
  for (const { product } of productsWithCoordsResult) {
    if (product.storeLatitude && product.storeLongitude) {
      const storeKey = `${product.storeName}-${product.storeLatitude}-${product.storeLongitude}`;
      if (storeMap.has(storeKey)) storeMap.get(storeKey)!.productCount++;
      else storeMap.set(storeKey, { name: product.storeName, latitude: product.storeLatitude, longitude: product.storeLongitude, distance: product.distanceMiles ?? undefined, productCount: 1 });
    }
  }
  const mapStores = Array.from(storeMap.entries()).map(([key, store]) => ({ id: key, ...store, type: "store" as const }));

  // DEFERRED DECISIONS - use deferredListResult from parallel query
  const deferredDecisions = deferredListResult
    .filter((d) => d.decision.revisitDate)
    .map(({ decision, issue, group }) => {
      const revisitDate = decision.revisitDate!;
      const daysUntil = Math.ceil((revisitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: decision.id, issueId: issue.id, issueTitle: issue.title, revisitDate,
        reason: decision.assumptions ? (decision.assumptions as { reason?: string }).reason || null : null,
        groupName: group.name, daysUntilRevisit: daysUntil,
      };
    });

  // PIPELINE SUMMARY - use statusCountsResult from parallel query
  const pipelineSummary = {
    open: 0, investigating: 0, options_generated: 0, decided: 0, in_progress: 0, completed: 0, deferred: 0,
  };
  for (const { status, count: cnt } of statusCountsResult) {
    if (status && status in pipelineSummary) pipelineSummary[status as keyof typeof pipelineSummary] = cnt;
  }

  // GROUP ACTIVITY FEED - use otherIssuesResult and otherExpensesResult from parallel query
  let groupActivityFeed: {
    type: "issue_created" | "decision_made" | "expense_added" | "member_joined";
    actorName: string | null; description: string; timestamp: Date; groupName: string; issueId?: string;
  }[] = [];

  for (const { issue, group, creator } of otherIssuesResult) {
    groupActivityFeed.push({
      type: "issue_created", actorName: creator.name, description: `reported "${issue.title}"`,
      timestamp: issue.createdAt, groupName: group.name, issueId: issue.id,
    });
  }
  for (const { expense, group, creator } of otherExpensesResult) {
    groupActivityFeed.push({
      type: "expense_added", actorName: creator.name,
      description: `added $${Number(expense.amount).toFixed(0)} expense for ${expense.category}`,
      timestamp: expense.createdAt, groupName: group.name,
    });
  }
  groupActivityFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  groupActivityFeed = groupActivityFeed.slice(0, 10);

  return {
    userProfile,
    activeGroups,
    pendingGroups,
    incomeStreams,
    budgets,
    financials: {
      monthlyIncome,
      annualIncome,
      hourlyRate,
      totalSpent,
      remaining,
      budgetUsedPercent,
      totalBudget,
    },
    pendingDecisions,
    openIssues,
    recentActivity,
    spendingByCategory,
    hasIncomeSetup: incomeStreams.length > 0,
    activeGuides,
    upcomingReminders,
    savings: {
      totalSavings,
      successfulDiyCount,
    },
    // Enhanced data
    groupFinances,
    calendarEvents,
    recentOutcomes,
    pendingVendors,
    shoppingList,
    personalBudgets,
    recentPersonalExpenses: recentPersonalExpenses.map((e) => ({
      id: e.id,
      category: e.category,
      amount: Number(e.amount),
      date: e.date,
      description: e.description,
    })),
    // New dashboard features
    safetyAlerts,
    aiInsights,
    mapVendors,
    mapStores,
    deferredDecisions,
    groupActivityFeed,
    pipelineSummary,
  };
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || error?.cause?.code;
    
    // Check for database connection errors
    if (
      errorCode === "XX000" ||
      errorMsg.includes("Tenant or user not found") ||
      errorMsg.includes("authentication") ||
      errorMsg.includes("password")
    ) {
      console.error("[Dashboard] Database connection error:", {
        error: errorMsg,
        code: errorCode,
      });
      
      throw new Error(
        `Database connection failed. Please check your DATABASE_URL environment variable. ` +
        `The database may be paused, or your connection string may be incorrect. ` +
        `Error: ${errorMsg}`
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function addIncomeStream(
  userId: string,
  data: {
    source: string;
    amount: number;
    frequency: "weekly" | "bi_weekly" | "semi_monthly" | "monthly" | "quarterly" | "annual";
    description?: string;
  }
) {
  const [stream] = await db
    .insert(userIncomeStreams)
    .values({
      userId,
      source: data.source,
      amount: data.amount.toString(),
      frequency: data.frequency,
      description: data.description,
      isActive: true,
    })
    .returning();

  return stream;
}

export async function updateIncomeStream(
  streamId: string,
  userId: string,
  data: {
    source?: string;
    amount?: number;
    frequency?: "weekly" | "bi_weekly" | "semi_monthly" | "monthly" | "quarterly" | "annual";
    description?: string;
    isActive?: boolean;
  }
) {
  const [stream] = await db
    .update(userIncomeStreams)
    .set({
      ...(data.source && { source: data.source }),
      ...(data.amount && { amount: data.amount.toString() }),
      ...(data.frequency && { frequency: data.frequency }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userIncomeStreams.id, streamId),
        eq(userIncomeStreams.userId, userId)
      )
    )
    .returning();

  return stream;
}

export async function deleteIncomeStream(streamId: string, userId: string) {
  await db
    .delete(userIncomeStreams)
    .where(
      and(
        eq(userIncomeStreams.id, streamId),
        eq(userIncomeStreams.userId, userId)
      )
    );
}

/**
 * Geocode a user's postal code and update their coordinates
 * Used for existing users who don't have geocoded coordinates
 */
export async function geocodeUserLocation(userId: string) {
  // Get user's postal code and country
  const [user] = await db
    .select({
      postalCode: users.postalCode,
      country: users.country,
      latitude: users.latitude,
      longitude: users.longitude,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.postalCode) {
    return { success: false, error: "No postal code set" };
  }

  // Skip if already geocoded
  if (user.latitude && user.longitude) {
    return { success: true, alreadyGeocoded: true };
  }

  // Geocode the postal code
  const result = await geocodePostalCode(user.postalCode, user.country || "US");

  if (!result) {
    return { success: false, error: "Geocoding failed" };
  }

  // Update user with geocoded coordinates
  await db
    .update(users)
    .set({
      latitude: result.latitude,
      longitude: result.longitude,
      formattedAddress: result.formattedAddress,
      geocodedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true, coordinates: result };
}

/**
 * Update user's postal code and geocode it
 */
export async function updateUserLocation(
  userId: string,
  data: {
    postalCode: string;
    country?: string;
  }
) {
  const { postalCode, country = "US" } = data;

  // Geocode the new postal code
  const result = await geocodePostalCode(postalCode, country);

  // Update user with new location data
  await db
    .update(users)
    .set({
      postalCode,
      country,
      latitude: result?.latitude ?? null,
      longitude: result?.longitude ?? null,
      formattedAddress: result?.formattedAddress ?? null,
      geocodedAt: result ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true, coordinates: result };
}
