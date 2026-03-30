/**
 * Root Query Resolvers
 *
 * Entry points for all read operations in the GraphQL API.
 * All queries that require authentication check ctx.user first.
 *
 * Admin queries are in ./queries/admin.ts and merged in index.ts
 */

import { eq, and, inArray, gte, lte, desc, sql, isNull } from "drizzle-orm";
import {
  groups,
  groupMembers,
  issues,
  diyGuides,
  userIncomeStreams,
  userExpenses,
  userBudgets,
  groupInvitations,
  decisions,
  decisionOutcomes,
  preferenceHistory,
  diySchedules,
  groupExpenseSettings,
  groupExpenseCategories,
} from "@/app/db/schema";
import type { Context } from "../utils/context";
import { requireAuth, notFound, forbidden } from "../utils/errors";
import { isMemberOfGroup } from "../utils/auth";
import { dashboardDataResolver } from "./queries/dashboardData";
import { issuesPageDataResolver } from "./queries/issuesPageData";
import { groupsPageDataResolver } from "./queries/groupsPageData";
import { calendarPageDataResolver } from "./queries/calendarPageData";
import { guidesPageDataResolver } from "./queries/guidesPageData";
import { financesPageDataResolver } from "./queries/financesPageData";
import { diagnosePageDataResolver } from "./queries/diagnosePageData";

export const Query = {
  /**
   * Get the currently authenticated user
   *
   * @returns User or null if not authenticated
   *
   * @example
   * query {
   *   me {
   *     id
   *     email
   *     name
   *     groups { name }
   *   }
   * }
   */
  me: async (_: unknown, __: unknown, ctx: Context) => {
    return ctx.user;
  },

  /**
   * Get a group by ID
   *
   * User must be an active member of the group.
   *
   * @example
   * query {
   *   group(id: "uuid-here") {
   *     name
   *     members { user { name } }
   *     issues { title }
   *   }
   * }
   */
  group: async (_: unknown, args: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const group = await ctx.loaders.groupById.load(args.id);
    if (!group) {
      throw notFound("Group");
    }

    // Check membership
    const isMember = await isMemberOfGroup(ctx.userId, args.id);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    return group;
  },

  /**
   * Get all groups the user belongs to
   *
   * @example
   * query {
   *   myGroups {
   *     id
   *     name
   *     memberCount
   *     activeIssueCount
   *   }
   * }
   */
  myGroups: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    // Get all active memberships
    const memberships = await ctx.db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, ctx.userId),
          eq(groupMembers.status, "active")
        )
      );

    if (memberships.length === 0) {
      return [];
    }

    // Load all groups
    const groupIds = memberships.map((m) => m.groupId);
    const results = await ctx.db
      .select()
      .from(groups)
      .where(inArray(groups.id, groupIds));

    return results;
  },

  /**
   * Get an issue by ID
   *
   * User must be a member of the issue's group.
   *
   * @example
   * query {
   *   issue(id: "uuid-here") {
   *     title
   *     status
   *     diagnosis
   *     options { title costMin costMax }
   *     decision { selectedOption { title } }
   *   }
   * }
   */
  issue: async (_: unknown, args: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const issue = await ctx.loaders.issueById.load(args.id);
    if (!issue) {
      throw notFound("Issue");
    }

    // Check membership in issue's group
    const isMember = await isMemberOfGroup(ctx.userId, issue.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    return issue;
  },

  /**
   * Get issues for a group with filters
   *
   * @example
   * query {
   *   issues(groupId: "uuid", status: in_progress, limit: 10) {
   *     id
   *     title
   *     priority
   *     createdAt
   *   }
   * }
   */
  issues: async (
    _: unknown,
    args: {
      groupId: string;
      status?: string;
      priority?: string;
      category?: string;
      limit?: number;
      offset?: number;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Check membership
    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    // Build query conditions
    const conditions = [eq(issues.groupId, args.groupId)];

    // Note: For dynamic filtering, we'd need to build the query differently
    // This is a simplified version - in production you might use a query builder
    const query = ctx.db.select().from(issues).where(and(...conditions));

    // Apply limit/offset
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;

    const results = await query.limit(limit).offset(offset);

    // Filter in memory for now (could be optimized with dynamic where clauses)
    let filtered = results;
    if (args.status) {
      filtered = filtered.filter((i) => i.status === args.status);
    }
    if (args.priority) {
      filtered = filtered.filter((i) => i.priority === args.priority);
    }
    if (args.category) {
      filtered = filtered.filter((i) => i.category === args.category);
    }

    return filtered;
  },

  /**
   * Get a decision option by ID
   *
   * @example
   * query {
   *   decisionOption(id: "uuid") {
   *     title
   *     type
   *     costMin
   *     costMax
   *     products { productName storeName }
   *     vendors { vendorName rating }
   *   }
   * }
   */
  decisionOption: async (_: unknown, args: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const option = await ctx.loaders.optionById.load(args.id);
    if (!option) {
      throw notFound("Decision option");
    }

    // Get the issue to check group membership
    const issue = await ctx.loaders.issueById.load(option.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const isMember = await isMemberOfGroup(ctx.userId, issue.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    return option;
  },

  /**
   * Get user's saved DIY guides
   *
   * @example
   * query {
   *   myGuides(bookmarkedOnly: true, limit: 10) {
   *     title
   *     url
   *     source
   *     wasHelpful
   *   }
   * }
   */
  myGuides: async (
    _: unknown,
    args: {
      bookmarkedOnly?: boolean;
      source?: string;
      limit?: number;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    let guides = await ctx.loaders.guidesByUserId.load(ctx.userId);

    // Apply filters
    if (args.bookmarkedOnly) {
      guides = guides.filter((g) => g.wasBookmarked);
    }
    if (args.source) {
      guides = guides.filter((g) => g.source === args.source);
    }

    // Apply limit
    const limit = Math.min(args.limit ?? 50, 100);
    return guides.slice(0, limit);
  },

  // ===========================================================================
  // FINANCE QUERIES
  // ===========================================================================

  /**
   * Get user's income streams
   *
   * @example
   * query {
   *   myIncomeStreams(activeOnly: true) {
   *     id
   *     source
   *     amount
   *     frequency
   *     monthlyEquivalent
   *   }
   * }
   */
  myIncomeStreams: async (
    _: unknown,
    args: { activeOnly?: boolean },
    ctx: Context
  ) => {
    requireAuth(ctx);

    let streams = await ctx.loaders.incomeStreamsByUserId.load(ctx.userId);

    if (args.activeOnly) {
      streams = streams.filter((s) => s.isActive);
    }

    return streams;
  },

  /**
   * Get user's expenses with optional filters
   *
   * @example
   * query {
   *   myExpenses(startDate: "2024-01-01", limit: 20) {
   *     id
   *     category
   *     amount
   *     date
   *     isRecurring
   *   }
   * }
   */
  myExpenses: async (
    _: unknown,
    args: {
      startDate?: string;
      endDate?: string;
      category?: string;
      isRecurring?: boolean;
      limit?: number;
      offset?: number;
    },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Build conditions
    const conditions = [eq(userExpenses.userId, ctx.userId)];

    if (args.startDate) {
      conditions.push(gte(userExpenses.date, new Date(args.startDate)));
    }
    if (args.endDate) {
      conditions.push(lte(userExpenses.date, new Date(args.endDate)));
    }
    if (args.category) {
      conditions.push(eq(userExpenses.category, args.category));
    }
    if (args.isRecurring !== undefined) {
      conditions.push(eq(userExpenses.isRecurring, args.isRecurring));
    }

    const limit = Math.min(args.limit ?? 50, 100);
    const offset = args.offset ?? 0;

    const results = await ctx.db
      .select()
      .from(userExpenses)
      .where(and(...conditions))
      .orderBy(desc(userExpenses.date))
      .limit(limit)
      .offset(offset);

    return results;
  },

  /**
   * Get user's budget categories
   *
   * @example
   * query {
   *   myBudgets {
   *     id
   *     category
   *     monthlyLimit
   *     currentSpend
   *     remainingBudget
   *     percentUsed
   *   }
   * }
   */
  myBudgets: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);
    return ctx.loaders.budgetsByUserId.load(ctx.userId);
  },

  /**
   * Get aggregated financial summary
   *
   * @example
   * query {
   *   myFinancialSummary {
   *     totalMonthlyIncome
   *     totalMonthlyExpenses
   *     netMonthlyCashFlow
   *   }
   * }
   */
  myFinancialSummary: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    // Get income streams
    const incomeStreams = await ctx.loaders.incomeStreamsByUserId.load(ctx.userId);
    const activeStreams = incomeStreams.filter((s) => s.isActive);

    // Calculate total monthly income
    const frequencyToMonthly: Record<string, number> = {
      weekly: 4.33,
      bi_weekly: 2.17,
      semi_monthly: 2,
      monthly: 1,
      quarterly: 1 / 3,
      annual: 1 / 12,
      one_time: 0,
    };

    const totalMonthlyIncome = activeStreams.reduce((sum, stream) => {
      const amount = parseFloat(stream.amount ?? "0");
      const multiplier = frequencyToMonthly[stream.frequency] ?? 1;
      return sum + amount * multiplier;
    }, 0);

    // Get budgets
    const budgets = await ctx.loaders.budgetsByUserId.load(ctx.userId);
    const totalBudgetLimit = budgets.reduce(
      (sum, b) => sum + parseFloat(b.monthlyLimit ?? "0"),
      0
    );
    const totalBudgetSpent = budgets.reduce(
      (sum, b) => sum + parseFloat(b.currentSpend ?? "0"),
      0
    );

    // Get recurring expenses for monthly estimate
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = await ctx.db
      .select()
      .from(userExpenses)
      .where(
        and(
          eq(userExpenses.userId, ctx.userId),
          gte(userExpenses.date, startOfMonth),
          lte(userExpenses.date, endOfMonth)
        )
      );

    const totalMonthlyExpenses = monthlyExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount ?? "0"),
      0
    );

    // Get user for emergency fund info
    const user = ctx.user;

    return {
      totalMonthlyIncome: totalMonthlyIncome.toFixed(2),
      totalMonthlyExpenses: totalMonthlyExpenses.toFixed(2),
      netMonthlyCashFlow: (totalMonthlyIncome - totalMonthlyExpenses).toFixed(2),
      totalBudgetLimit: totalBudgetLimit.toFixed(2),
      totalBudgetSpent: totalBudgetSpent.toFixed(2),
      emergencyFundTarget: user?.emergencyBuffer ?? null,
      emergencyFundCurrent: null, // TODO: Track emergency fund balance
    };
  },

  // ===========================================================================
  // DASHBOARD QUERIES
  // ===========================================================================

  /**
   * Get aggregated dashboard statistics
   */
  dashboardStats: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    // Get user's groups
    const memberships = await ctx.db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, ctx.userId),
          eq(groupMembers.status, "active")
        )
      );

    const groupIds = memberships.map((m) => m.groupId);

    // Count open issues
    let openIssues = 0;
    let pendingDecisions = 0;

    if (groupIds.length > 0) {
      const openIssueResults = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(issues)
        .where(
          and(
            inArray(issues.groupId, groupIds),
            sql`${issues.status}::text IN ('open', 'investigating', 'options_generated', 'in_progress')`
          )
        );
      openIssues = Number(openIssueResults[0]?.count ?? 0);

      // Count pending decisions (issues in "options_generated" status)
      const pendingResults = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(issues)
        .where(
          and(
            inArray(issues.groupId, groupIds),
            sql`${issues.status}::text = 'options_generated'`
          )
        );
      pendingDecisions = Number(pendingResults[0]?.count ?? 0);
    }

    // Count completed DIY projects
    const diyResults = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(diyGuides)
      .where(eq(diyGuides.userId, ctx.userId));
    const diyProjectsCompleted = Number(diyResults[0]?.count ?? 0);

    // Calculate total saved (from completed DIY guides)
    // TODO: Implement estimatedSavings field in guides schema
    const totalSaved = 0;

    return {
      openIssues,
      pendingDecisions,
      diyProjectsCompleted,
      totalSaved: totalSaved.toFixed(2),
      activeGroups: groupIds.length,
      upcomingReminders: 0, // TODO: Implement reminders
    };
  },

  /**
   * Get resolution statistics for a group
   */
  groupResolutionStats: async (
    _: unknown,
    args: { groupId: string; timeRange?: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    // Get resolved issues with their decisions
    const resolvedIssues = await ctx.db
      .select()
      .from(issues)
      .where(
        and(eq(issues.groupId, args.groupId), sql`${issues.status}::text = 'completed'`)
      );

    // Get decisions for resolved issues
    const issueIds = resolvedIssues.map((i) => i.id);
    let resolvedDecisions: Awaited<ReturnType<typeof ctx.db.select>>[] = [];

    if (issueIds.length > 0) {
      resolvedDecisions = await ctx.db
        .select()
        .from(decisions)
        .where(inArray(decisions.issueId, issueIds));
    }

    // Count by resolution type
    let diyCount = 0;
    let hiredCount = 0;
    let replacedCount = 0;
    let deferredCount = 0;
    let totalSaved = 0;

    for (const decision of resolvedDecisions) {
      switch (decision.resolutionType) {
        case "diy":
          diyCount++;
          break;
        case "hire":
          hiredCount++;
          break;
        case "replace":
          replacedCount++;
          break;
        case "defer":
          deferredCount++;
          break;
      }
      // Calculate savings (estimated cost - actual cost if we have outcome)
      if (decision.estimatedCost) {
        const outcome = await ctx.loaders.outcomeByDecisionId.load(decision.id);
        if (outcome?.actualCost) {
          const estimated = parseFloat(decision.estimatedCost);
          const actual = parseFloat(outcome.actualCost);
          totalSaved += Math.max(0, estimated - actual);
        }
      }
    }

    const totalResolved = resolvedDecisions.length;
    const averageSavings = totalResolved > 0 ? totalSaved / totalResolved : 0;

    return {
      totalResolved,
      diyCount,
      hiredCount,
      replacedCount,
      deferredCount,
      totalSaved: totalSaved.toFixed(2),
      averageSavings: averageSavings.toFixed(2),
    };
  },

  // ===========================================================================
  // INVITATION QUERIES
  // ===========================================================================

  /**
   * Get pending invitations for a group (coordinators only)
   */
  groupInvitations: async (
    _: unknown,
    args: { groupId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    // Get pending invitations (not accepted, not expired)
    const now = new Date();
    const invitations = await ctx.db
      .select()
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.groupId, args.groupId),
          isNull(groupInvitations.acceptedAt),
          gte(groupInvitations.expiresAt, now)
        )
      );

    return invitations;
  },

  /**
   * Get user's pending invitations to join groups
   */
  myPendingInvitations: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    if (!ctx.user?.email) {
      return [];
    }

    const now = new Date();
    const invitations = await ctx.db
      .select()
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.inviteeEmail, ctx.user.email),
          isNull(groupInvitations.acceptedAt),
          gte(groupInvitations.expiresAt, now)
        )
      );

    return invitations;
  },

  // ===========================================================================
  // OUTCOME QUERIES
  // ===========================================================================

  /**
   * Get outcome for a decision
   */
  decisionOutcome: async (
    _: unknown,
    args: { decisionId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get the decision first to check permissions
    const decision = await ctx.loaders.decisionById.load(args.decisionId);
    if (!decision) {
      throw notFound("Decision");
    }

    const issue = await ctx.loaders.issueById.load(decision.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const isMember = await isMemberOfGroup(ctx.userId, issue.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    return ctx.loaders.outcomeByDecisionId.load(args.decisionId);
  },

  /**
   * Get preference history for a group
   */
  preferenceHistory: async (
    _: unknown,
    args: { groupId: string; limit?: number },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    const limit = Math.min(args.limit ?? 50, 100);

    const history = await ctx.db
      .select()
      .from(preferenceHistory)
      .where(eq(preferenceHistory.groupId, args.groupId))
      .orderBy(desc(preferenceHistory.changedAt))
      .limit(limit);

    return history;
  },

  // ===========================================================================
  // SCHEDULE QUERIES
  // ===========================================================================

  /**
   * Get a schedule by ID
   */
  schedule: async (_: unknown, args: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    const schedule = await ctx.loaders.scheduleById.load(args.id);
    if (!schedule) {
      throw notFound("Schedule");
    }

    // Check membership via issue
    const issue = await ctx.loaders.issueById.load(schedule.issueId);
    if (!issue) {
      throw notFound("Issue");
    }

    const isMember = await isMemberOfGroup(ctx.userId, issue.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    return schedule;
  },

  /**
   * Get user's schedules within a date range
   */
  mySchedules: async (
    _: unknown,
    args: { startDate?: string; endDate?: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    // Get user's groups
    const memberships = await ctx.db
      .select({ groupId: groupMembers.groupId, memberId: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, ctx.userId),
          eq(groupMembers.status, "active")
        )
      );

    if (memberships.length === 0) {
      return [];
    }

    const memberIds = memberships.map((m) => m.memberId);
    const groupIds = memberships.map((m) => m.groupId);

    // Build conditions
    const conditions = [];

    // Get schedules where user is creator or participant
    // First get all issues from user's groups
    const groupIssues = await ctx.db
      .select({ id: issues.id })
      .from(issues)
      .where(inArray(issues.groupId, groupIds));

    if (groupIssues.length === 0) {
      return [];
    }

    const issueIds = groupIssues.map((i) => i.id);
    conditions.push(inArray(diySchedules.issueId, issueIds));

    if (args.startDate) {
      conditions.push(gte(diySchedules.scheduledTime, new Date(args.startDate)));
    }
    if (args.endDate) {
      conditions.push(lte(diySchedules.scheduledTime, new Date(args.endDate)));
    }

    const schedules = await ctx.db
      .select()
      .from(diySchedules)
      .where(and(...conditions))
      .orderBy(diySchedules.scheduledTime);

    // Enrich with issue and group details
    const enrichedSchedules = await Promise.all(
      schedules.map(async (s) => {
        const issue = await ctx.loaders.issueById.load(s.issueId);
        const group = issue ? await ctx.loaders.groupById.load(issue.groupId) : null;
        return {
          ...s,
          issueId: s.issueId,
          issueTitle: issue?.title ?? null,
          groupId: issue?.groupId ?? null,
          groupName: group?.name ?? null,
        };
      })
    );

    return enrichedSchedules;
  },

  /**
   * Get schedules for a specific group
   */
  groupSchedules: async (
    _: unknown,
    args: { groupId: string; startDate?: string; endDate?: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    // Get issues for this group
    const groupIssues = await ctx.db
      .select({ id: issues.id })
      .from(issues)
      .where(eq(issues.groupId, args.groupId));

    if (groupIssues.length === 0) {
      return [];
    }

    const issueIds = groupIssues.map((i) => i.id);
    const conditions = [inArray(diySchedules.issueId, issueIds)];

    if (args.startDate) {
      conditions.push(gte(diySchedules.scheduledTime, new Date(args.startDate)));
    }
    if (args.endDate) {
      conditions.push(lte(diySchedules.scheduledTime, new Date(args.endDate)));
    }

    const schedules = await ctx.db
      .select()
      .from(diySchedules)
      .where(and(...conditions))
      .orderBy(diySchedules.scheduledTime);

    // Enrich with issue details
    const group = await ctx.loaders.groupById.load(args.groupId);
    const enrichedSchedules = await Promise.all(
      schedules.map(async (s) => {
        const issue = await ctx.loaders.issueById.load(s.issueId);
        return {
          ...s,
          issueId: s.issueId,
          issueTitle: issue?.title ?? null,
          groupId: args.groupId,
          groupName: group?.name ?? null,
        };
      })
    );

    return enrichedSchedules;
  },

  /**
   * Get issues available for scheduling in a group
   */
  issuesForScheduling: async (
    _: unknown,
    args: { groupId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    // Get issues that are in progress or ready for DIY
    const schedulableIssues = await ctx.db
      .select()
      .from(issues)
      .where(
        and(
          eq(issues.groupId, args.groupId),
          sql`${issues.status}::text IN ('in_progress', 'decided', 'options_generated')`
        )
      )
      .orderBy(desc(issues.createdAt));

    return schedulableIssues;
  },

  // ===========================================================================
  // EXPENSE SETTINGS QUERIES
  // ===========================================================================

  /**
   * Get expense settings for a group
   */
  groupExpenseSettings: async (
    _: unknown,
    args: { groupId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    const [settings] = await ctx.db
      .select()
      .from(groupExpenseSettings)
      .where(eq(groupExpenseSettings.groupId, args.groupId))
      .limit(1);

    return settings ?? null;
  },

  /**
   * Get expense categories for a group
   */
  groupExpenseCategories: async (
    _: unknown,
    args: { groupId: string },
    ctx: Context
  ) => {
    requireAuth(ctx);

    const isMember = await isMemberOfGroup(ctx.userId, args.groupId);
    if (!isMember) {
      throw forbidden("You are not a member of this group");
    }

    const categories = await ctx.db
      .select()
      .from(groupExpenseCategories)
      .where(eq(groupExpenseCategories.groupId, args.groupId))
      .orderBy(groupExpenseCategories.name);

    return categories;
  },

  // ===========================================================================
  // COMPREHENSIVE DASHBOARD DATA
  // ===========================================================================

  /**
   * Get comprehensive dashboard data for the main dashboard view
   */
  dashboardData: dashboardDataResolver,

  /**
   * Get comprehensive data for the issues page view
   */
  issuesPageData: issuesPageDataResolver,

  /**
   * Get comprehensive data for the groups page view
   */
  groupsPageData: groupsPageDataResolver,

  /**
   * Get comprehensive data for the calendar page view
   */
  calendarPageData: calendarPageDataResolver,

  /**
   * Get comprehensive data for the guides page view
   */
  guidesPageData: guidesPageDataResolver,

  /**
   * Get comprehensive data for the finances page view
   */
  financesPageData: financesPageDataResolver,

  /**
   * Get comprehensive data for the diagnose page view
   */
  diagnosePageData: diagnosePageDataResolver,
};
