/**
 * Groups Page Data Resolver
 *
 * Comprehensive resolver that returns all data needed for the groups page view.
 * Includes group stats, members, charts data, and activity items.
 */

import { eq, and, inArray, desc, sql, gte, isNull } from "drizzle-orm";
import {
  groups,
  groupMembers,
  groupConstraints,
  groupInvitations,
  budgetContributions,
  issues,
  decisions,
  decisionOptions,
  decisionOutcomes,
  users,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Color palette for member contributions
const MEMBER_COLORS = [
  "#3ECF8E",
  "#249361",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export async function groupsPageDataResolver(
  _: unknown,
  __: unknown,
  ctx: Context
) {
  requireAuth(ctx);

  // PHASE 1: Get user's active groups with membership info
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
    )
    .orderBy(desc(groups.createdAt));

  // Return empty data if no groups
  if (userGroupsResult.length === 0) {
    return {
      totalGroups: 0,
      totalMembers: 0,
      totalSavings: 0,
      totalIssues: 0,
      activeIssueCount: 0,
      resolvedIssueCount: 0,
      groups: [],
      selectedGroup: null,
    };
  }

  const groupIds = userGroupsResult.map((g) => g.group.id);

  // PHASE 2: Get all members for all groups
  const allMembersResult = await ctx.db
    .select({
      member: groupMembers,
      user: users,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(
      and(
        inArray(groupMembers.groupId, groupIds),
        eq(groupMembers.status, "active")
      )
    );

  // Group members by groupId
  const membersByGroup = new Map<string, typeof allMembersResult>();
  for (const m of allMembersResult) {
    const list = membersByGroup.get(m.member.groupId) || [];
    list.push(m);
    membersByGroup.set(m.member.groupId, list);
  }

  // PHASE 3: Get all issues for all groups
  const allIssuesResult = await ctx.db
    .select()
    .from(issues)
    .where(inArray(issues.groupId, groupIds))
    .orderBy(desc(issues.updatedAt));

  // Group issues by groupId
  const issuesByGroup = new Map<string, (typeof allIssuesResult)[number][]>();
  for (const issue of allIssuesResult) {
    const list = issuesByGroup.get(issue.groupId) || [];
    list.push(issue);
    issuesByGroup.set(issue.groupId, list);
  }

  // PHASE 4: Get constraints for all groups
  const constraintsResult = await ctx.db
    .select()
    .from(groupConstraints)
    .where(inArray(groupConstraints.groupId, groupIds));

  const constraintsByGroup = new Map(
    constraintsResult.map((c) => [c.groupId, c])
  );

  // PHASE 5: Get contributions for all groups
  const contributionsResult = await ctx.db
    .select()
    .from(budgetContributions)
    .where(inArray(budgetContributions.groupId, groupIds))
    .orderBy(desc(budgetContributions.contributedAt));

  // Group contributions by groupId
  const contributionsByGroup = new Map<
    string,
    (typeof contributionsResult)[number][]
  >();
  for (const c of contributionsResult) {
    const list = contributionsByGroup.get(c.groupId) || [];
    list.push(c);
    contributionsByGroup.set(c.groupId, list);
  }

  // PHASE 6: Get decisions and outcomes for savings calculation
  const issueIds = allIssuesResult.map((i) => i.id);
  let decisionsWithOutcomes: Array<{
    decision: typeof decisions.$inferSelect;
    option: typeof decisionOptions.$inferSelect | null;
    outcome: typeof decisionOutcomes.$inferSelect | null;
    issueId: string;
    groupId: string;
  }> = [];

  if (issueIds.length > 0) {
    const decisionsResult = await ctx.db
      .select({
        decision: decisions,
        option: decisionOptions,
      })
      .from(decisions)
      .leftJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .where(inArray(decisions.issueId, issueIds));

    if (decisionsResult.length > 0) {
      const decisionIds = decisionsResult.map((d) => d.decision.id);
      const outcomesResult = await ctx.db
        .select()
        .from(decisionOutcomes)
        .where(inArray(decisionOutcomes.decisionId, decisionIds));

      const outcomeMap = new Map(outcomesResult.map((o) => [o.decisionId, o]));

      // Get issue groupId lookup
      const issueGroupMap = new Map(
        allIssuesResult.map((i) => [i.id, i.groupId])
      );

      decisionsWithOutcomes = decisionsResult.map((d) => ({
        decision: d.decision,
        option: d.option,
        outcome: outcomeMap.get(d.decision.id) || null,
        issueId: d.decision.issueId,
        groupId: issueGroupMap.get(d.decision.issueId) || "",
      }));
    }
  }

  // Calculate savings by group
  const savingsByGroup = new Map<string, number>();
  for (const d of decisionsWithOutcomes) {
    if (d.outcome?.costDelta) {
      const savings = Math.abs(parseFloat(d.outcome.costDelta));
      savingsByGroup.set(
        d.groupId,
        (savingsByGroup.get(d.groupId) || 0) + savings
      );
    }
  }

  // PHASE 7: Get pending invitations for all groups
  const now = new Date();
  const pendingInvitationsResult = await ctx.db
    .select()
    .from(groupInvitations)
    .where(
      and(
        inArray(groupInvitations.groupId, groupIds),
        isNull(groupInvitations.acceptedAt),
        gte(groupInvitations.expiresAt, now)
      )
    );

  const invitationsByGroup = new Map<
    string,
    (typeof pendingInvitationsResult)[number][]
  >();
  for (const inv of pendingInvitationsResult) {
    const list = invitationsByGroup.get(inv.groupId) || [];
    list.push(inv);
    invitationsByGroup.set(inv.groupId, list);
  }

  // PHASE 8: Build groups with stats
  const groupsWithStats = userGroupsResult.map(({ group, membership }) => {
    const members = membersByGroup.get(group.id) || [];
    const groupIssues = issuesByGroup.get(group.id) || [];
    const activeIssues = groupIssues.filter(
      (i) => !["completed", "deferred"].includes(i.status)
    );
    const resolvedIssues = groupIssues.filter((i) => i.status === "completed");
    const savings = savingsByGroup.get(group.id) || 0;

    return {
      id: group.id,
      name: group.name,
      postalCode: group.postalCode,
      role: membership.role,
      memberCount: members.length,
      issueCount: groupIssues.length,
      activeIssueCount: activeIssues.length,
      resolvedCount: resolvedIssues.length,
      savings,
      members: members.slice(0, 3).map((m) => ({
        id: m.member.id,
        name: m.user.name,
        avatar: m.user.name?.[0]?.toUpperCase() || "?",
        role: m.member.role,
      })),
      createdAt: group.createdAt,
    };
  });

  // PHASE 9: Build selected group details (first group)
  const firstGroup = userGroupsResult[0];
  let selectedGroup = null;

  if (firstGroup) {
    const group = firstGroup.group;
    const membership = firstGroup.membership;
    const members = membersByGroup.get(group.id) || [];
    const groupIssues = issuesByGroup.get(group.id) || [];
    const constraints = constraintsByGroup.get(group.id);
    const contributions = contributionsByGroup.get(group.id) || [];
    const invitations = invitationsByGroup.get(group.id) || [];

    const activeIssues = groupIssues.filter(
      (i) => !["completed", "deferred"].includes(i.status)
    );
    const resolvedIssues = groupIssues.filter((i) => i.status === "completed");
    const savings = savingsByGroup.get(group.id) || 0;

    // Calculate member contributions
    const memberContributionMap = new Map<string, number>();
    for (const c of contributions) {
      memberContributionMap.set(
        c.memberId,
        (memberContributionMap.get(c.memberId) || 0) + parseFloat(c.amount)
      );
    }

    // Calculate issues created/resolved by member
    const issuesCreatedByMember = new Map<string, number>();
    const issuesResolvedByMember = new Map<string, number>();
    for (const issue of groupIssues) {
      if (issue.createdById) {
        issuesCreatedByMember.set(
          issue.createdById,
          (issuesCreatedByMember.get(issue.createdById) || 0) + 1
        );
      }
      if (issue.resolvedById && issue.status === "completed") {
        issuesResolvedByMember.set(
          issue.resolvedById,
          (issuesResolvedByMember.get(issue.resolvedById) || 0) + 1
        );
      }
    }

    // Build member details
    const memberDetails = members.map((m) => ({
      id: m.member.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.name?.[0]?.toUpperCase() || "?",
      role: m.member.role,
      joinedAt: m.member.joinedAt,
      contributions: memberContributionMap.get(m.member.id) || 0,
      issuesCreated: issuesCreatedByMember.get(m.member.id) || 0,
      issuesResolved: issuesResolvedByMember.get(m.member.id) || 0,
    }));

    // Build pending invitations
    const pendingInvitations = invitations.map((inv) => ({
      id: inv.id,
      email: inv.inviteeEmail,
      role: inv.role,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
    }));

    // Calculate budget stats
    const monthlyBudget = constraints?.monthlyBudget
      ? parseFloat(constraints.monthlyBudget)
      : null;
    const sharedBalance = constraints?.sharedBalance
      ? parseFloat(constraints.sharedBalance)
      : 0;
    const emergencyFund = constraints?.emergencyBuffer
      ? parseFloat(constraints.emergencyBuffer)
      : null;

    // Calculate monthly spent (from contributions vs balance)
    const totalContributions = contributions.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );
    const monthlySpent = Math.max(0, totalContributions - sharedBalance);
    const budgetUsedPercent = monthlyBudget
      ? Math.min((monthlySpent / monthlyBudget) * 100, 100)
      : 0;

    // Calculate DIY rate
    const diyDecisions = decisionsWithOutcomes.filter(
      (d) => d.groupId === group.id && d.option?.type === "diy"
    );
    const totalDecisions = decisionsWithOutcomes.filter(
      (d) => d.groupId === group.id
    );
    const diyRate =
      totalDecisions.length > 0
        ? (diyDecisions.length / totalDecisions.length) * 100
        : 0;

    // Build contribution data for pie chart
    const totalContrib = Array.from(memberContributionMap.values()).reduce(
      (sum, v) => sum + v,
      0
    );
    const contributionData = members
      .filter((m) => memberContributionMap.get(m.member.id))
      .map((m, i) => {
        const amount = memberContributionMap.get(m.member.id) || 0;
        return {
          name: m.user.name || "Unknown",
          value: totalContrib > 0 ? (amount / totalContrib) * 100 : 0,
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        };
      });

    // Build monthly savings data (last 6 months)
    const monthlySavingsData = buildMonthlySavingsData(
      decisionsWithOutcomes.filter((d) => d.groupId === group.id),
      contributions
    );

    // Build resolution data for bar chart
    const diyCount = diyDecisions.length;
    const hiredCount = totalDecisions.length - diyCount;
    const resolutionData = [
      {
        name: group.name,
        diy: diyCount,
        hired: hiredCount,
      },
    ];

    // Build recent issues
    const recentIssues = groupIssues.slice(0, 4).map((issue) => ({
      id: issue.id,
      title: issue.title || "Untitled",
      category: issue.subcategory || issue.category,
      status: issue.status,
      priority: issue.priority || "medium",
      createdAt: issue.createdAt,
    }));

    // Build recent activity
    const recentActivity = buildRecentActivity(
      groupIssues,
      contributions,
      members,
      invitations
    );

    selectedGroup = {
      id: group.id,
      name: group.name,
      postalCode: group.postalCode,
      role: membership.role,
      createdAt: group.createdAt,
      openIssueCount: activeIssues.length,
      resolvedCount: resolvedIssues.length,
      balance: sharedBalance,
      savings,
      monthlyBudget,
      monthlySpent,
      emergencyFund,
      members: memberDetails,
      pendingInvitations,
      budgetUsedPercent,
      diyRate: Math.round(diyRate),
      contributionData,
      monthlySavingsData,
      resolutionData,
      recentIssues,
      recentActivity,
    };
  }

  // PHASE 10: Calculate totals
  const totalMembers = new Set(allMembersResult.map((m) => m.user.id)).size;
  const totalSavings = Array.from(savingsByGroup.values()).reduce(
    (sum, s) => sum + s,
    0
  );
  const activeIssueCount = allIssuesResult.filter(
    (i) => !["completed", "deferred"].includes(i.status)
  ).length;
  const resolvedIssueCount = allIssuesResult.filter(
    (i) => i.status === "completed"
  ).length;

  return {
    totalGroups: groupsWithStats.length,
    totalMembers,
    totalSavings,
    totalIssues: allIssuesResult.length,
    activeIssueCount,
    resolvedIssueCount,
    groups: groupsWithStats,
    selectedGroup,
  };
}

function buildMonthlySavingsData(
  decisions: Array<{
    outcome: { costDelta: string | null; completedAt: Date } | null;
  }>,
  contributions: Array<{ amount: string; contributedAt: Date }>
) {
  const now = new Date();
  const months: Array<{ month: string; savings: number; spent: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleString("en-US", { month: "short" });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Calculate savings for this month
    const monthlySavings = decisions
      .filter((d) => {
        if (!d.outcome?.completedAt) return false;
        const completedAt = new Date(d.outcome.completedAt);
        return completedAt >= monthStart && completedAt <= monthEnd;
      })
      .reduce(
        (sum, d) => sum + Math.abs(parseFloat(d.outcome?.costDelta || "0")),
        0
      );

    // Calculate spent for this month (based on contributions)
    const monthlySpent = contributions
      .filter((c) => {
        const contributedAt = new Date(c.contributedAt);
        return contributedAt >= monthStart && contributedAt <= monthEnd;
      })
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    months.push({
      month: monthKey,
      savings: monthlySavings,
      spent: monthlySpent,
    });
  }

  return months;
}

function buildRecentActivity(
  issues: Array<{
    id: string;
    title: string | null;
    status: string;
    resolvedById: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
  }>,
  contributions: Array<{
    id: string;
    memberId: string;
    amount: string;
    contributedAt: Date;
  }>,
  members: Array<{
    member: { id: string };
    user: { name: string | null };
  }>,
  invitations: Array<{
    id: string;
    inviteeEmail: string;
    role: string;
    createdAt: Date;
  }>
) {
  const memberNameMap = new Map(
    members.map((m) => [m.member.id, m.user.name])
  );

  const activities: Array<{
    id: string;
    type: string;
    message: string;
    memberName: string | null;
    memberAvatar: string | null;
    savings: number | null;
    timestamp: Date;
  }> = [];

  // Add resolved issues
  for (const issue of issues.filter((i) => i.status === "completed")) {
    if (issue.resolvedAt) {
      const memberName = issue.resolvedById
        ? memberNameMap.get(issue.resolvedById)
        : null;
      activities.push({
        id: `issue-${issue.id}`,
        type: "resolved",
        message: `${memberName || "Someone"} resolved "${issue.title || "issue"}"`,
        memberName: memberName || null,
        memberAvatar: memberName?.[0]?.toUpperCase() || null,
        savings: null,
        timestamp: issue.resolvedAt,
      });
    }
  }

  // Add contributions
  for (const c of contributions) {
    const memberName = memberNameMap.get(c.memberId);
    activities.push({
      id: `contrib-${c.id}`,
      type: "contribution",
      message: `${memberName || "Someone"} contributed $${parseFloat(c.amount).toFixed(0)}`,
      memberName: memberName || null,
      memberAvatar: memberName?.[0]?.toUpperCase() || null,
      savings: null,
      timestamp: c.contributedAt,
    });
  }

  // Add invitations sent
  for (const inv of invitations) {
    activities.push({
      id: `invite-${inv.id}`,
      type: "invitation",
      message: `Invited ${inv.inviteeEmail} as ${inv.role}`,
      memberName: null,
      memberAvatar: null,
      savings: null,
      timestamp: inv.createdAt,
    });
  }

  // Sort by timestamp descending and take top 4
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 4);
}
