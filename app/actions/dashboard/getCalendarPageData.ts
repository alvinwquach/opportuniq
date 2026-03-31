// Tell Next.js this entire module runs only on the server (Node.js),
// never in the browser — this keeps DB credentials and scheduling logic off the client bundle.
"use server";

// createClient: factory that creates a Supabase auth client scoped to the current
// HTTP request, so we can identify which user is logged in via their session cookie.
import { createClient } from "@/lib/supabase/server";
// db: the Drizzle ORM instance that talks to our PostgreSQL database.
import { db } from "@/app/db/client";
import {
  // groups: the table of household/property groups.
  groups,
  // groupMembers: the join table linking users to groups (with a membership status).
  groupMembers,
  // issues: the table of repair/maintenance issues logged against a group.
  issues,
  // decisions: the table recording which repair option was chosen for an issue.
  decisions,
  // decisionOptions: the table of available DIY or hire options generated for an issue.
  decisionOptions,
  // diySchedules: the table storing user-scheduled DIY project dates tied to issues.
  diySchedules,
  // userExpenses: the table of individual expense records the user has logged.
  userExpenses,
} from "@/app/db/schema";
// eq: builds "WHERE col = value".
// and: combines multiple WHERE conditions with SQL AND.
// inArray: builds "WHERE col IN (array)" — used when filtering by a list of group/issue IDs.
// desc: builds "ORDER BY col DESC" (newest/latest first).
// sql: allows writing raw SQL fragments when the ORM's helpers aren't expressive enough.
// gte: builds "WHERE col >= value" (greater than or equal) — used for date range filters.
import { eq, and, inArray, desc, sql, gte } from "drizzle-orm";

// EVENT_TYPE_COLORS: maps each calendar event type to a hex color for consistent
// visual coding across calendar cells, charts, and legend items.
const EVENT_TYPE_COLORS: Record<string, string> = {
  diy: "#3ECF8E", contractor: "#249361", reminder: "#f59e0b", income: "#3ECF8E", expense: "#ef4444",
};
// EVENT_TYPE_NAMES: maps raw event type strings to human-readable display labels
// used in the event-type distribution legend and filter UI.
const EVENT_TYPE_NAMES: Record<string, string> = {
  diy: "DIY Projects", contractor: "Pro Visits", reminder: "Reminders", income: "Income", expense: "Expenses",
};
// monthNames: short month labels used when building the monthly comparison chart data.
// Index 0 = January, index 11 = December, matching JavaScript's getMonth() return values.
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// getCalendarPageData: the single server action that fetches every piece of data
// needed to render the Calendar dashboard page. It accepts optional year and month
// parameters so the user can navigate to different months; defaults to the current month.
export async function getCalendarPageData(year?: number, month?: number) {
  // Create a Supabase auth client tied to this request's cookies/session.
  const supabase = await createClient();
  // Ask Supabase who the currently logged-in user is.
  const { data: { user } } = await supabase.auth.getUser();
  // Stop immediately if no authenticated user — calendar data is personal and user-scoped.
  if (!user) throw new Error("Unauthorized");

  // Capture the current date/time once so all time calculations are consistent.
  const now = new Date();
  // Use the caller-supplied year/month if provided, otherwise default to the current year/month.
  // This allows the component to load other months for navigation without refetching auth state.
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();

  // Calculate the first moment (00:00:00.000) of the requested month.
  // Used as the lower bound for filtering events that belong to this calendar view.
  const startOfMonth = new Date(y, m, 1);
  // Calculate the last moment (23:59:59) of the requested month by rolling forward to
  // day 0 of the next month (which is the last day of this month), then setting the time to end-of-day.
  const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59);
  // Calculate the last moment of the month after the requested one.
  // Used to extend the "upcoming expenses" window one extra month into the future.
  const endOfNextMonth = new Date(y, m + 2, 0, 23, 59, 59);

  // Fetch all active group memberships for this user, joining with groups to get the group name.
  // We need group names to display alongside calendar events.
  const userGroupsResult = await db
    .select({ groupId: groupMembers.groupId, groupName: groups.name })
    .from(groupMembers).innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.status, "active")));

  // Define the empty/zero-state result returned when the user has no active groups,
  // so the calendar UI can render an empty state gracefully.
  const emptyResult = {
    events: [], monthStats: { scheduledEvents: 0, completedEvents: 0, proVisits: 0, diyProjects: 0, reminders: 0 },
    upcomingExpenses: [], totalUpcomingExpenses: 0, eventTypeDistribution: [],
    weeklyActivity: [], monthlyComparison: [], upcomingEvents: [], schedulableIssues: [],
  };

  // If the user has no active groups, return the empty state immediately.
  if (userGroupsResult.length === 0) return emptyResult;

  // Extract group IDs for use in subsequent IN queries.
  const groupIds = userGroupsResult.map((g) => g.groupId);
  // Build a Map for O(1) group name lookup by groupId when building event objects.
  // Key: group ID (string). Value: group display name (string).
  const groupNameMap = new Map(userGroupsResult.map((g) => [g.groupId, g.groupName]));

  // Fire all four DB queries in parallel to minimise total wait time.
  const [schedulesResult, decisionsResult, expensesResult, schedulableIssuesResult] = await Promise.all([
    // Fetch all DIY project schedule records for issues belonging to the user's groups.
    // Join with issues to get the issue title and description for the event label.
    // Ordered by scheduled time ascending (soonest first) for natural calendar ordering.
    db.select({ schedule: diySchedules, issue: issues })
      .from(diySchedules).innerJoin(issues, eq(diySchedules.issueId, issues.id))
      .where(inArray(issues.groupId, groupIds)).orderBy(diySchedules.scheduledTime),

    // Fetch all decisions where a "hire" option was selected (i.e. a contractor was booked).
    // Join with the selected option to get cost and description, and with the issue for title/groupId.
    // Ordered by the approval date descending so the most recently approved contractor visits appear first.
    db.select({ decision: decisions, option: decisionOptions, issue: issues })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .innerJoin(issues, eq(decisions.issueId, issues.id))
      .where(and(inArray(issues.groupId, groupIds), eq(decisionOptions.type, "hire")))
      .orderBy(desc(decisions.approvedAt)),

    // Fetch all expenses for this user that fall on or after the first day of the requested month.
    // The gte filter keeps the dataset to the current month and beyond, which is all the calendar needs.
    // Ordered by date ascending so expenses appear in date order.
    db.select().from(userExpenses)
      .where(and(eq(userExpenses.userId, user.id), gte(userExpenses.date, startOfMonth)))
      .orderBy(userExpenses.date),

    // Fetch issues that are in an actionable state (in_progress, decided, or options_generated)
    // so they can be offered to the user as things they could schedule on the calendar.
    // Limit to 20 to keep the "Schedule an Issue" dropdown manageable.
    db.select().from(issues)
      .where(and(inArray(issues.groupId, groupIds), sql`${issues.status}::text IN ('in_progress', 'decided', 'options_generated')`))
      .orderBy(desc(issues.createdAt)).limit(20),
  ]);

  // Define the TypeScript type for a single calendar event object.
  // All events — DIY, contractor, expense — are normalised into this common shape
  // so the calendar grid can render them uniformly.
  type CalendarEvent = {
    id: string; title: string; date: string; time: string | null; type: string;
    isRecurring: boolean; recurringPattern: string | null; location: string | null;
    assignee: string | null; notes: string | null; estimatedCost: number | null;
    reminder: string | null; linkedIssueId: string | null; linkedIssueTitle: string | null;
    groupId: string | null; groupName: string | null;
  };

  // Initialise the events array — all three source types (DIY, contractor, expense) will be pushed in.
  const events: CalendarEvent[] = [];

  // Convert each DIY schedule record into a calendar event.
  for (const { schedule, issue } of schedulesResult) {
    const scheduledDate = new Date(schedule.scheduledTime);
    events.push({
      id: schedule.id, title: issue.title ?? "DIY Project",
      // Format the date as "Mar 15, 2024" for display in the calendar grid cell.
      date: scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      // Format the time as "10:00 AM" for the event tooltip/detail panel.
      time: scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      type: "diy", isRecurring: false, recurringPattern: null, location: null,
      // DIY events are always self-assigned — no contractor involved.
      assignee: "Self",
      notes: issue.description ?? null, estimatedCost: null,
      // Default reminder to one day before so the user gets a notification.
      reminder: "1 day before",
      linkedIssueId: issue.id, linkedIssueTitle: issue.title,
      groupId: issue.groupId,
      // Look up the group name from the map we built earlier.
      groupName: groupNameMap.get(issue.groupId) ?? null,
    });
  }

  // Convert each approved contractor (hire) decision into a calendar event.
  for (const { decision, option, issue } of decisionsResult) {
    // Only add an event if the decision has an approval date — unconfirmed decisions
    // don't have a scheduled date yet and shouldn't appear on the calendar.
    if (decision.approvedAt) {
      const approvedDate = new Date(decision.approvedAt);
      events.push({
        id: decision.id, title: option.title ?? "Pro Visit",
        // Format the date the decision was approved as the contractor visit date.
        date: approvedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        // Default contractor visits to 10:00 AM since exact appointment times aren't stored.
        time: "10:00 AM", type: "contractor", isRecurring: false, recurringPattern: null,
        location: null, assignee: null, notes: option.description ?? null,
        // Use the option's minimum cost estimate as the event's estimated cost.
        estimatedCost: option.costMin ? parseFloat(option.costMin) : null,
        reminder: "1 day before", linkedIssueId: issue.id, linkedIssueTitle: issue.title,
        groupId: issue.groupId, groupName: groupNameMap.get(issue.groupId) ?? null,
      });
    }
  }

  // Convert each user expense record into a calendar event so expenses appear on the calendar.
  for (const expense of expensesResult) {
    const expenseDate = new Date(expense.date);
    events.push({
      id: expense.id, title: expense.description ?? expense.category ?? "Expense",
      date: expenseDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      // Expenses don't have a specific time — they're shown as all-day events.
      time: null, type: "expense", isRecurring: expense.isRecurring ?? false,
      recurringPattern: expense.recurringFrequency ?? null, location: null, assignee: null, notes: null,
      estimatedCost: expense.amount ? parseFloat(expense.amount) : null,
      reminder: null,
      // Link the expense to a specific issue if the expense was associated with one.
      linkedIssueId: expense.issueId ?? null, linkedIssueTitle: null,
      // Expenses are user-level, not group-level, so groupId/groupName are null.
      groupId: null, groupName: null,
    });
  }

  // Filter the full event list down to only events that fall within the requested calendar month.
  const currentMonthEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  });

  // Compute the month-level summary statistics shown in the stats cards at the top of the page.
  const monthStats = {
    // Total number of events scheduled in this calendar month.
    scheduledEvents: currentMonthEvents.length,
    // Events whose date has already passed are considered "completed" (they happened).
    completedEvents: currentMonthEvents.filter((e) => new Date(e.date) < now).length,
    // Count of contractor visit events specifically.
    proVisits: currentMonthEvents.filter((e) => e.type === "contractor").length,
    // Count of DIY project events specifically.
    diyProjects: currentMonthEvents.filter((e) => e.type === "diy").length,
    // Count of reminder events specifically.
    reminders: currentMonthEvents.filter((e) => e.type === "reminder").length,
  };

  // Build the upcoming expenses widget: expenses due between now and the end of next month,
  // limited to 5 entries so the widget stays compact.
  const upcomingExpenses = expensesResult
    .filter((e) => { const d = new Date(e.date); return d >= now && d <= endOfNextMonth; })
    .slice(0, 5).map((e) => ({
      id: e.id, title: e.description ?? e.category ?? "Expense",
      // Format as "Mar 15" (no year) for the compact upcoming-expenses widget.
      date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: e.amount ? parseFloat(e.amount) : 0, type: "expense" as const,
    }));
  // Sum all upcoming expense amounts for the total displayed in the widget footer.
  const totalUpcomingExpenses = upcomingExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Count how many events of each type appear in the current month for the distribution chart.
  const typeCounts: Record<string, number> = {};
  for (const event of currentMonthEvents) typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
  // Convert the counts object into the array shape the pie/donut chart expects,
  // attaching human-readable names and colors, and excluding types with zero events.
  const eventTypeDistribution = Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ name: EVENT_TYPE_NAMES[type] ?? type, value: count, color: EVENT_TYPE_COLORS[type] ?? "#666666" }));

  // Build per-week activity data for the current month (4 weeks).
  // Each week starts on the 1st, 8th, 15th, and 22nd of the month.
  const weeklyActivity = [];
  for (let i = 0; i < 4; i++) {
    // Week start: 1st, 8th, 15th, or 22nd day of the month.
    const weekStart = new Date(y, m, 1 + i * 7);
    // Week end: 7th, 14th, 21st, or 28th day of the month (may overlap with the next week's start).
    const weekEnd = new Date(y, m, 7 + i * 7);
    // Find all events that fall within this 7-day window.
    const weekEvents = events.filter((e) => { const d = new Date(e.date); return d >= weekStart && d <= weekEnd; });
    // Sum the estimated costs of expense events for the week's total spending.
    const weekExpenses = weekEvents.filter((e) => e.type === "expense").reduce((sum, e) => sum + (e.estimatedCost || 0), 0);
    weeklyActivity.push({ week: `Week ${i + 1}`, events: weekEvents.length, expenses: weekExpenses });
  }

  // Build a 4-month comparison array (current month + 3 prior months) for the trend chart.
  const monthlyComparison = [];
  // i=3 is the oldest month; i=0 is the current month.
  for (let i = 3; i >= 0; i--) {
    // Calculate the target month index, which may be negative if it crosses a year boundary.
    const targetMonth = m - i;
    // If the month is negative, we've crossed into the previous year.
    const targetYear = targetMonth < 0 ? y - 1 : y;
    // Normalise negative month values into the range 0–11 by adding 12.
    const normalizedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
    // Build the date range for this target month.
    const monthStart = new Date(targetYear, normalizedMonth, 1);
    const monthEnd = new Date(targetYear, normalizedMonth + 1, 0, 23, 59, 59);
    // Find all events that fall within this target month.
    const monthEvents = events.filter((e) => { const d = new Date(e.date); return d >= monthStart && d <= monthEnd; });
    // Count events that have already occurred (past dates) as "completed".
    const completedEvents = monthEvents.filter((e) => new Date(e.date) < now);
    // Push the month's totals keyed by the short month name for the chart x-axis.
    monthlyComparison.push({ month: monthNames[normalizedMonth], events: monthEvents.length, completed: completedEvents.length });
  }

  // Calculate the date 7 days from now to define the "upcoming events" window.
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  // Find events happening between now and 7 days from now, limited to 5 for the widget.
  const upcomingEvents = events.filter((e) => { const d = new Date(e.date); return d >= now && d <= nextWeek; }).slice(0, 5);

  // Build the list of issues that can be scheduled (added to the calendar) by the user.
  // These are issues in an active, actionable state that don't have a schedule entry yet.
  const schedulableIssues = schedulableIssuesResult.map((issue) => ({
    id: issue.id, title: issue.title ?? "Untitled Issue",
    // Look up the group name so the "Schedule Issue" dialog can show which property it belongs to.
    groupName: groupNameMap.get(issue.groupId) ?? "Unknown Group", status: issue.status,
  }));

  // Return the complete page payload. The TanStack Query hook in lib/hooks/ will
  // cache this and distribute individual fields to each React component that needs them.
  return { events, monthStats, upcomingExpenses, totalUpcomingExpenses, eventTypeDistribution, weeklyActivity, monthlyComparison, upcomingEvents, schedulableIssues };
}
