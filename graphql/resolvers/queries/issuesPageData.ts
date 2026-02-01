/**
 * Issues Page Data Resolver
 *
 * Comprehensive resolver that returns all data needed for the issues page view.
 * Includes stats, chart data, and full issue details for client-side filtering.
 */

import { eq, and, inArray, desc, sql } from "drizzle-orm";
import {
  groups,
  groupMembers,
  issues,
  decisions,
  decisionOptions,
  decisionOutcomes,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
  automotive: "#3ECF8E",
  home_repair: "#3ECF8E",
  appliance: "#8b5cf6",
  cleaning: "#10b981",
  yard_outdoor: "#22c55e",
  safety: "#ef4444",
  maintenance: "#f59e0b",
  installation: "#06b6d4",
  other: "#6b7280",
  // Subcategory colors
  Plumbing: "#3ECF8E",
  HVAC: "#06b6d4",
  Electrical: "#f59e0b",
  Appliances: "#8b5cf6",
  Security: "#ef4444",
  Garage: "#f59e0b",
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

export async function issuesPageDataResolver(
  _: unknown,
  __: unknown,
  ctx: Context
) {
  requireAuth(ctx);

  // PHASE 1: Get user's active groups
  const userGroupsResult = await ctx.db
    .select({
      group: groups,
      membership: groupMembers,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, ctx.userId),
        eq(groupMembers.status, "active")
      )
    );

  const activeGroups = userGroupsResult.filter((g) => g.membership.status === "active");
  const groupIds: string[] = activeGroups
    .map((g) => g.group.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  // Return empty data if no groups
  if (groupIds.length === 0) {
    return {
      totalSaved: 0,
      diyCount: 0,
      proCount: 0,
      activeIssueCount: 0,
      issues: [],
      savingsOverTime: [],
      categoryDistribution: [],
      resolutionBreakdown: {
        diy: 0,
        pro: 0,
        diySuccessRate: 0,
      },
      groups: [],
      categories: [],
    };
  }

  // PHASE 2: Fetch all issues for user's groups
  const allIssuesResult = await ctx.db
    .select({
      issue: issues,
      group: groups,
    })
    .from(issues)
    .innerJoin(groups, eq(issues.groupId, groups.id))
    .where(inArray(issues.groupId, groupIds))
    .orderBy(desc(issues.updatedAt));

  // PHASE 3: Get decisions and outcomes for resolved issues
  const issueIds = allIssuesResult.map((r) => r.issue.id);

  let decisionsWithOutcomes: Array<{
    decision: typeof decisions.$inferSelect;
    option: typeof decisionOptions.$inferSelect;
    outcome: typeof decisionOutcomes.$inferSelect | null;
    issueId: string;
  }> = [];

  if (issueIds.length > 0) {
    // Get decisions with their selected options and outcomes
    const decisionsResult = await ctx.db
      .select({
        decision: decisions,
        option: decisionOptions,
      })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .where(inArray(decisions.issueId, issueIds));

    // Get outcomes for these decisions
    if (decisionsResult.length > 0) {
      const decisionIds = decisionsResult.map((d) => d.decision.id);
      const outcomesResult = await ctx.db
        .select()
        .from(decisionOutcomes)
        .where(inArray(decisionOutcomes.decisionId, decisionIds));

      const outcomeMap = new Map(outcomesResult.map((o) => [o.decisionId, o]));

      decisionsWithOutcomes = decisionsResult.map((d) => ({
        decision: d.decision,
        option: d.option,
        outcome: outcomeMap.get(d.decision.id) || null,
        issueId: d.decision.issueId,
      }));
    }
  }

  // Create lookup maps
  const decisionByIssueId = new Map(
    decisionsWithOutcomes.map((d) => [d.issueId, d])
  );

  // PHASE 4: Transform issues to IssueWithDetails
  const issuesWithDetails = allIssuesResult.map(({ issue, group }) => {
    const decisionData = decisionByIssueId.get(issue.id);

    // Calculate costs and savings
    let diyCost: number | null = null;
    let proCost: number | null = null;
    let savedAmount: number | null = null;
    let resolvedBy: string | null = null;

    if (decisionData) {
      const { option, outcome } = decisionData;

      // Get cost estimates from the option
      if (option.costMin) {
        diyCost = option.type === "diy" ? parseFloat(option.costMin) : null;
        proCost = option.type === "hire" ? parseFloat(option.costMin) : null;
      }

      // Determine resolution type
      if (issue.resolutionType === "diy" || option.type === "diy") {
        resolvedBy = "diy";
      } else if (issue.resolutionType === "hired" || option.type === "hire") {
        resolvedBy = "pro";
      }

      // Calculate savings from outcome
      if (outcome?.costDelta) {
        savedAmount = Math.abs(parseFloat(outcome.costDelta));
      }
    }

    return {
      id: issue.id,
      title: issue.title || "Untitled Issue",
      status: issue.status,
      priority: issue.priority || "medium",
      category: issue.category || issue.subcategory || null,
      groupId: group.id,
      groupName: group.name,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      diagnosis: issue.diagnosis,
      confidence: issue.confidenceLevel,
      diyCost,
      proCost,
      resolvedAt: issue.resolvedAt,
      resolvedBy,
      savedAmount,
    };
  });

  // PHASE 5: Calculate stats
  const completedIssues = issuesWithDetails.filter((i) => i.status === "completed");
  const activeIssues = issuesWithDetails.filter(
    (i) => !["completed", "deferred"].includes(i.status)
  );

  const diyResolved = completedIssues.filter((i) => i.resolvedBy === "diy");
  const proResolved = completedIssues.filter((i) => i.resolvedBy === "pro");

  const totalSaved = completedIssues.reduce(
    (sum, i) => sum + (i.savedAmount || 0),
    0
  );

  // PHASE 6: Calculate category distribution
  const categoryMap = new Map<string, number>();
  for (const issue of allIssuesResult) {
    const cat = issue.issue.subcategory || issue.issue.category || "other";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const categoryDistribution = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other,
    }))
    .sort((a, b) => b.value - a.value);

  // PHASE 7: Calculate savings over time (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlySavingsMap = new Map<string, { savings: number; issues: number }>();

  // Initialize all months
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthKey = date.toLocaleString("en-US", { month: "short" });
    monthlySavingsMap.set(monthKey, { savings: 0, issues: 0 });
  }

  // Accumulate savings by month
  let cumulativeSavings = 0;
  for (const issue of completedIssues) {
    if (issue.resolvedAt && issue.resolvedAt >= sixMonthsAgo) {
      const monthKey = new Date(issue.resolvedAt).toLocaleString("en-US", { month: "short" });
      const current = monthlySavingsMap.get(monthKey);
      if (current) {
        current.savings += issue.savedAmount || 0;
        current.issues += 1;
      }
    }
  }

  // Convert to cumulative and format
  const savingsOverTime: Array<{ month: string; savings: number; issues: number }> = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthKey = date.toLocaleString("en-US", { month: "short" });
    const data = monthlySavingsMap.get(monthKey) || { savings: 0, issues: 0 };
    cumulativeSavings += data.savings;
    savingsOverTime.push({
      month: monthKey,
      savings: cumulativeSavings,
      issues: data.issues,
    });
  }

  // PHASE 8: Calculate resolution breakdown
  const diySuccessRate = diyResolved.length > 0
    ? (diyResolved.filter((i) => i.savedAmount && i.savedAmount > 0).length / diyResolved.length) * 100
    : 0;

  const resolutionBreakdown = {
    diy: diyResolved.length,
    pro: proResolved.length,
    diySuccessRate: Math.round(diySuccessRate),
  };

  // PHASE 9: Get unique categories for filter
  const uniqueCategories = Array.from(
    new Set(
      allIssuesResult
        .map((r) => r.issue.subcategory || r.issue.category)
        .filter((c): c is string => !!c)
    )
  );

  // PHASE 10: Format groups for filter
  const groupOptions = activeGroups.map((g) => ({
    id: g.group.id,
    name: g.group.name,
  }));

  return {
    totalSaved,
    diyCount: diyResolved.length,
    proCount: proResolved.length,
    activeIssueCount: activeIssues.length,
    issues: issuesWithDetails,
    savingsOverTime,
    categoryDistribution,
    resolutionBreakdown,
    groups: groupOptions,
    categories: uniqueCategories,
  };
}
