/**
 * Calendar Page Data Resolver
 *
 * Comprehensive resolver that returns all data needed for the calendar page view.
 * Includes events, stats, charts data, and upcoming expenses.
 */

import { eq, and, inArray, desc, sql, gte, lte } from "drizzle-orm";
import {
  groups,
  groupMembers,
  issues,
  decisions,
  decisionOptions,
  diySchedules,
  userExpenses,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Color palette for event types
const EVENT_TYPE_COLORS: Record<string, string> = {
  diy: "#3ECF8E",
  contractor: "#249361",
  reminder: "#f59e0b",
  income: "#3ECF8E",
  expense: "#ef4444",
};

// Event type names for display
const EVENT_TYPE_NAMES: Record<string, string> = {
  diy: "DIY Projects",
  contractor: "Pro Visits",
  reminder: "Reminders",
  income: "Income",
  expense: "Expenses",
};

export async function calendarPageDataResolver(
  _: unknown,
  args: { year?: number; month?: number },
  ctx: Context
) {
  requireAuth(ctx);

  const now = new Date();
  const year = args.year ?? now.getFullYear();
  const month = args.month ?? now.getMonth();

  // Calculate date ranges
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
  const startOfNextMonth = new Date(year, month + 1, 1);
  const endOfNextMonth = new Date(year, month + 2, 0, 23, 59, 59);

  // For monthly comparison charts - last 4 months
  const fourMonthsAgo = new Date(year, month - 3, 1);

  // PHASE 1: Get user's active groups
  const userGroupsResult = await ctx.db
    .select({
      groupId: groupMembers.groupId,
      groupName: groups.name,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, ctx.userId),
        eq(groupMembers.status, "active")
      )
    );

  // Return empty data if no groups
  if (userGroupsResult.length === 0) {
    return {
      events: [],
      monthStats: {
        scheduledEvents: 0,
        completedEvents: 0,
        proVisits: 0,
        diyProjects: 0,
        reminders: 0,
      },
      upcomingExpenses: [],
      totalUpcomingExpenses: 0,
      eventTypeDistribution: [],
      weeklyActivity: [],
      monthlyComparison: [],
      upcomingEvents: [],
      schedulableIssues: [],
    };
  }

  const groupIds = userGroupsResult.map((g) => g.groupId);
  const groupNameMap = new Map(
    userGroupsResult.map((g) => [g.groupId, g.groupName])
  );

  // PHASE 2: Get DIY schedules (events)
  const schedulesResult = await ctx.db
    .select({
      schedule: diySchedules,
      issue: issues,
    })
    .from(diySchedules)
    .innerJoin(issues, eq(diySchedules.issueId, issues.id))
    .where(inArray(issues.groupId, groupIds))
    .orderBy(diySchedules.scheduledTime);

  // PHASE 3: Get decisions with scheduled times (contractor visits)
  const decisionsResult = await ctx.db
    .select({
      decision: decisions,
      option: decisionOptions,
      issue: issues,
    })
    .from(decisions)
    .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .innerJoin(issues, eq(decisions.issueId, issues.id))
    .where(
      and(
        inArray(issues.groupId, groupIds),
        eq(decisionOptions.type, "hire")
      )
    )
    .orderBy(desc(decisions.approvedAt));

  // PHASE 4: Get user expenses for the month and upcoming
  const expensesResult = await ctx.db
    .select()
    .from(userExpenses)
    .where(
      and(
        eq(userExpenses.userId, ctx.userId),
        gte(userExpenses.date, startOfMonth)
      )
    )
    .orderBy(userExpenses.date);

  // PHASE 5: Get issues for scheduling
  const schedulableIssuesResult = await ctx.db
    .select()
    .from(issues)
    .where(
      and(
        inArray(issues.groupId, groupIds),
        sql`${issues.status}::text IN ('in_progress', 'decided', 'options_generated')`
      )
    )
    .orderBy(desc(issues.createdAt))
    .limit(20);

  // PHASE 6: Build events list
  const events: Array<{
    id: string;
    title: string;
    date: string;
    time: string | null;
    type: string;
    isRecurring: boolean;
    recurringPattern: string | null;
    location: string | null;
    assignee: string | null;
    notes: string | null;
    estimatedCost: number | null;
    reminder: string | null;
    linkedIssueId: string | null;
    linkedIssueTitle: string | null;
    groupId: string | null;
    groupName: string | null;
  }> = [];

  // Add DIY schedules as events
  for (const { schedule, issue } of schedulesResult) {
    const scheduledDate = new Date(schedule.scheduledTime);
    events.push({
      id: schedule.id,
      title: issue.title ?? "DIY Project",
      date: scheduledDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: scheduledDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      type: "diy",
      isRecurring: false,
      recurringPattern: null,
      location: null,
      assignee: "Self",
      notes: issue.description ?? null,
      estimatedCost: null,
      reminder: "1 day before",
      linkedIssueId: issue.id,
      linkedIssueTitle: issue.title,
      groupId: issue.groupId,
      groupName: groupNameMap.get(issue.groupId) ?? null,
    });
  }

  // Add contractor decisions as events
  for (const { decision, option, issue } of decisionsResult) {
    if (decision.approvedAt) {
      const approvedDate = new Date(decision.approvedAt);
      events.push({
        id: decision.id,
        title: option.title ?? "Pro Visit",
        date: approvedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: "10:00 AM", // Default time for contractor visits
        type: "contractor",
        isRecurring: false,
        recurringPattern: null,
        location: null,
        assignee: null,
        notes: option.description ?? null,
        estimatedCost: option.costMin ? parseFloat(option.costMin) : null,
        reminder: "1 day before",
        linkedIssueId: issue.id,
        linkedIssueTitle: issue.title,
        groupId: issue.groupId,
        groupName: groupNameMap.get(issue.groupId) ?? null,
      });
    }
  }

  // Add expenses as events
  for (const expense of expensesResult) {
    const expenseDate = new Date(expense.date);
    events.push({
      id: expense.id,
      title: expense.description ?? expense.category,
      date: expenseDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: null,
      type: "expense",
      isRecurring: expense.isRecurring ?? false,
      recurringPattern: expense.recurringFrequency ?? null,
      location: null,
      assignee: null,
      notes: null,
      estimatedCost: expense.amount ? parseFloat(expense.amount) : null,
      reminder: null,
      linkedIssueId: expense.issueId ?? null,
      linkedIssueTitle: null,
      groupId: null,
      groupName: null,
    });
  }

  // PHASE 7: Calculate month stats
  const currentMonthEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  });

  const monthStats = {
    scheduledEvents: currentMonthEvents.length,
    completedEvents: currentMonthEvents.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate < now;
    }).length,
    proVisits: currentMonthEvents.filter((e) => e.type === "contractor").length,
    diyProjects: currentMonthEvents.filter((e) => e.type === "diy").length,
    reminders: currentMonthEvents.filter((e) => e.type === "reminder").length,
  };

  // PHASE 8: Calculate upcoming expenses
  const upcomingExpenses = expensesResult
    .filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= now && expenseDate <= endOfNextMonth;
    })
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      title: e.description ?? e.category,
      date: new Date(e.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: e.amount ? parseFloat(e.amount) : 0,
      type: "expense" as const,
    }));

  const totalUpcomingExpenses = upcomingExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // PHASE 9: Calculate event type distribution
  const typeCounts: Record<string, number> = {};
  for (const event of currentMonthEvents) {
    typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
  }

  const eventTypeDistribution = Object.entries(typeCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: EVENT_TYPE_NAMES[type] ?? type,
      value: count,
      color: EVENT_TYPE_COLORS[type] ?? "#666666",
    }));

  // PHASE 10: Calculate weekly activity for the current month
  const weeklyActivity: Array<{
    week: string;
    events: number;
    expenses: number;
  }> = [];

  // Get 4 weeks
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(year, month, 1 + i * 7);
    const weekEnd = new Date(year, month, 7 + i * 7);

    const weekEvents = events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    const weekExpenses = weekEvents
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + (e.estimatedCost || 0), 0);

    weeklyActivity.push({
      week: `Week ${i + 1}`,
      events: weekEvents.length,
      expenses: weekExpenses,
    });
  }

  // PHASE 11: Calculate monthly comparison (last 4 months)
  const monthlyComparison: Array<{
    month: string;
    events: number;
    completed: number;
  }> = [];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 3; i >= 0; i--) {
    const targetMonth = month - i;
    const targetYear = targetMonth < 0 ? year - 1 : year;
    const normalizedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;

    const monthStart = new Date(targetYear, normalizedMonth, 1);
    const monthEnd = new Date(targetYear, normalizedMonth + 1, 0, 23, 59, 59);

    const monthEvents = events.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    const completedEvents = monthEvents.filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate < now;
    });

    monthlyComparison.push({
      month: monthNames[normalizedMonth],
      events: monthEvents.length,
      completed: completedEvents.length,
    });
  }

  // PHASE 12: Get upcoming events for sidebar (next 7 days)
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingEvents = events
    .filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= now && eventDate <= nextWeek;
    })
    .slice(0, 5);

  // PHASE 13: Format schedulable issues
  const schedulableIssues = schedulableIssuesResult.map((issue) => ({
    id: issue.id,
    title: issue.title ?? "Untitled Issue",
    groupName: groupNameMap.get(issue.groupId) ?? "Unknown Group",
    status: issue.status,
  }));

  return {
    events,
    monthStats,
    upcomingExpenses,
    totalUpcomingExpenses,
    eventTypeDistribution,
    weeklyActivity,
    monthlyComparison,
    upcomingEvents,
    schedulableIssues,
  };
}
