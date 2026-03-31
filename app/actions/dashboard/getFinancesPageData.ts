// Tell Next.js this entire module runs only on the server (Node.js),
// never in the browser — this keeps DB credentials and financial data off the client bundle.
"use server";

// createClient: factory that creates a Supabase auth client scoped to the current
// HTTP request, so we can identify which user is logged in via their session cookie.
import { createClient } from "@/lib/supabase/server";
// db: the Drizzle ORM instance that talks to our PostgreSQL database.
import { db } from "@/app/db/client";
// userIncomeStreams: table of the user's recurring income sources (salary, freelance, etc.).
// userExpenses: table of individual expense records the user has logged.
// userBudgets: table of per-category monthly budget limits the user has configured.
import { userIncomeStreams, userExpenses, userBudgets } from "@/app/db/schema";
// eq: builds "WHERE col = value".
// desc: builds "ORDER BY col DESC" (newest first).
// and: combines multiple WHERE conditions with AND.
// gte: builds "WHERE col >= value" (greater than or equal).
import { eq, desc, and, gte } from "drizzle-orm";

// frequencyMultipliers: converts any payment frequency into a monthly multiplier so that
// all income and expense amounts can be compared on a common monthly basis.
// For example, a weekly payment happens ~4.33 times per month;
// an annual payment happens 1/12 of a time per month.
// one_time payments are excluded from recurring totals (multiplier = 0).
const frequencyMultipliers: Record<string, number> = {
  weekly: 4.33, bi_weekly: 2.17, semi_monthly: 2, monthly: 1,
  quarterly: 1 / 3, annual: 1 / 12, one_time: 0,
};
// categoryColors: maps each spending category to a hex color used by the pie/bar charts
// in the UI so each category has a consistent, distinct visual identity.
const categoryColors: Record<string, string> = {
  Housing: "#3ECF8E", Utilities: "#249361", Repairs: "#f59e0b", Maintenance: "#84cc16",
  Insurance: "#10b981", Groceries: "#ec4899", Transportation: "#059669",
  Healthcare: "#ef4444", Entertainment: "#f97316", Other: "#94a3b8",
};
// monthNames: short month labels used when building historical chart data arrays.
// Index 0 = January, index 11 = December, matching JavaScript's getMonth() return values.
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// getFinancesPageData: the single server action that fetches every piece of data
// needed to render the Finances dashboard page. Running it server-side avoids
// multiple client round-trips and keeps sensitive financial figures off the client.
export async function getFinancesPageData() {
  // Create a Supabase auth client tied to this request's cookies/session.
  const supabase = await createClient();
  // Ask Supabase who the currently logged-in user is.
  const { data: { user } } = await supabase.auth.getUser();
  // If no authenticated user is found, stop immediately — we must not expose
  // another user's financial data.
  if (!user) throw new Error("Unauthorized");

  // Capture the current date/time once so all time-window calculations are consistent.
  const now = new Date();
  // Calculate the first day of the month that is 5 months before the current month.
  // This gives us a 6-month window (5 months back + current month) for historical charts.
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  // Calculate the first day of the current calendar month.
  // Used to filter expenses that belong to "this month" for the spending breakdown.
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Calculate the last day of the current calendar month by rolling forward to month+1, day 0
  // (day 0 of the next month = the last day of the current month).
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fire all three DB queries in parallel using Promise.all to reduce total wait time.
  // We fetch income streams, expenses (limited to the 6-month window), and budgets simultaneously.
  const [incomeStreamsRaw, expensesRaw, budgetsRaw] = await Promise.all([
    // Fetch all income streams for this user, sorted by amount descending so the
    // largest income sources appear first in the UI list.
    db.select().from(userIncomeStreams).where(eq(userIncomeStreams.userId, user.id)).orderBy(desc(userIncomeStreams.amount)),
    // Fetch all expense records for this user that are within the 6-month window,
    // sorted by date descending so the most recent expenses appear first.
    // The 6-month limit keeps the dataset manageable and covers the chart range.
    db.select().from(userExpenses).where(and(eq(userExpenses.userId, user.id), gte(userExpenses.date, sixMonthsAgo))).orderBy(desc(userExpenses.date)),
    // Fetch all budget configurations for this user (no date filter — budgets are ongoing).
    db.select().from(userBudgets).where(eq(userBudgets.userId, user.id)),
  ]);

  // Transform each raw income stream DB row into the shape the UI components consume,
  // calculating the monthly equivalent amount so everything can be compared on a monthly basis.
  const incomeStreams = incomeStreamsRaw.map((stream) => {
    // Convert the DB numeric string (e.g. "3500.00") to a JavaScript float for arithmetic.
    const amount = parseFloat(stream.amount ?? "0");
    // Look up how many times per month this frequency occurs; default to 1 (monthly) if unknown.
    const multiplier = frequencyMultipliers[stream.frequency] ?? 1;
    return { id: stream.id, source: stream.source ?? "", amount, frequency: stream.frequency, isActive: stream.isActive ?? false, description: stream.description,
      // monthlyEquivalent: the amount normalised to "per month" — e.g. a $500/week stream
      // becomes $500 × 4.33 = $2,165/month. Used to aggregate total monthly income.
      monthlyEquivalent: amount * multiplier };
  });

  // Sum up the monthly equivalents of all currently active income streams to get
  // the user's total monthly income figure shown at the top of the finances page.
  const monthlyIncome = incomeStreams.filter((s) => s.isActive).reduce((sum, s) => sum + s.monthlyEquivalent, 0);

  // Transform each raw expense DB row into the UI shape, converting the date to an ISO string
  // so it can be safely serialised when passed from the server action to the client.
  const expenses = expensesRaw.map((expense) => ({
    id: expense.id, category: expense.category ?? "", amount: parseFloat(expense.amount ?? "0"),
    description: expense.description,
    // Convert the DB Date object to an ISO 8601 string for safe client serialisation.
    date: expense.date.toISOString(), isRecurring: expense.isRecurring ?? false,
    frequency: expense.recurringFrequency, issueTitle: null, urgency: null,
  }));

  // Calculate total recurring expenses per month by summing each recurring expense
  // normalised to its monthly equivalent (using the same frequency multiplier logic as income).
  const monthlyExpenses = expenses.filter((e) => e.isRecurring).reduce((sum, e) => {
    // Default to "monthly" multiplier if no frequency is set on the expense record.
    const multiplier = frequencyMultipliers[e.frequency ?? "monthly"] ?? 1;
    return sum + e.amount * multiplier;
  }, 0);

  // Calculate the total of all one-time (non-recurring) expenses that fall within the
  // current calendar month, so we can add them to the monthly total spend.
  const oneTimeThisMonth = expenses.filter((e) => {
    // Skip recurring expenses — they are already counted in monthlyExpenses above.
    if (e.isRecurring) return false;
    const expDate = new Date(e.date);
    // Only include expenses whose date falls on or between the first and last day of this month.
    return expDate >= startOfMonth && expDate <= endOfMonth;
  }).reduce((sum, e) => sum + e.amount, 0);

  // Total spent this month = recurring monthly costs + any one-off purchases this month.
  const totalSpent = monthlyExpenses + oneTimeThisMonth;
  // Sum up all category budget limits to get the user's overall monthly budget cap.
  // If no budgets are configured, fall back to a sensible default of $800.
  const monthlyBudget = budgetsRaw.reduce((sum, b) => sum + parseFloat(b.monthlyLimit ?? "0"), 0) || 800;
  // Remaining budget = how much of the budget the user has not yet spent this month.
  const remaining = monthlyBudget - totalSpent;
  // Estimate pending urgent costs as 20% of each recurring expense — a conservative buffer
  // representing potential upcoming irregular charges or late fees.
  const pendingUrgent = expenses.filter((e) => e.isRecurring).reduce((sum, e) => sum + e.amount * 0.2, 0);
  // Reserve 10% of monthly income as a buffer (savings/emergency fund contribution)
  // before calculating how much money is truly available for discretionary spending.
  const monthlyBuffer = monthlyIncome * 0.1;
  // Available funds = income minus committed recurring expenses, the safety buffer,
  // and the pending urgent estimate — what's left for discretionary or unexpected costs.
  const availableFunds = monthlyIncome - monthlyExpenses - monthlyBuffer - pendingUrgent;
  // Placeholder for the emergency fund progress percentage — hardcoded until we
  // have a dedicated emergency fund tracking feature.
  const emergencyFundPercent = 47;
  // Placeholder for total money saved via DIY repairs — set to 0 until we wire up
  // the cross-table join with issues/decisions savings data.
  const diySaved = 0;

  // Build the "upcoming expenses" preview list: take up to 5 recurring expenses and
  // assign each a next-due date of approximately one month from today.
  const upcomingExpenses = expenses.filter((e) => e.isRecurring).map((e) => {
    // Create a next-due date by advancing today's date by one month.
    const nextDue = new Date(); nextDue.setMonth(nextDue.getMonth() + 1);
    return { id: e.id, category: e.category, description: e.description ?? e.category ?? "", amount: e.amount,
      // Convert the computed next-due Date to an ISO string for client serialisation.
      dueDate: nextDue.toISOString(), urgency: null, isRecurring: true };
  // Only show the first 5 to keep the UI card compact.
  }).slice(0, 5);

  // Build a per-category spending total for the current month's spending breakdown chart.
  // We accumulate amounts into an object keyed by category name.
  const categoryTotals: Record<string, number> = {};
  // Filter to only current-month expenses, then add each expense's amount to its category's running total.
  expenses.filter((e) => { const d = new Date(e.date); return d >= startOfMonth && d <= endOfMonth; })
    .forEach((e) => { const cat = e.category ?? "Uncategorized"; categoryTotals[cat] = (categoryTotals[cat] ?? 0) + e.amount; });

  // Convert the category-totals object into a sorted array for the pie chart,
  // attaching the configured color for each category and sorting largest-to-smallest
  // so the most significant categories appear prominently.
  const spendingByCategory = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount, color: categoryColors[category] ?? "#94a3b8" }))
    .sort((a, b) => b.amount - a.amount);

  // Initialise three parallel arrays that will be populated month-by-month
  // for the cash flow, income trend, and expense trend charts.
  const cashFlowHistory = [];
  const incomeHistory = [];
  const expenseHistory = [];

  // Loop over the last 6 months (i=5 is the oldest; i=0 is the current month).
  for (let i = 5; i >= 0; i--) {
    // Compute the target calendar month's date by subtracting i months from now.
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    // Get the short month label (e.g. "Mar") for the chart x-axis.
    const monthName = monthNames[targetMonth];

    // Sum all expense amounts (recurring + one-time) recorded in this target month.
    const monthExpenses = expensesRaw.filter((e) => {
      const d = new Date(e.date); return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    }).reduce((sum, e) => sum + parseFloat(e.amount ?? "0"), 0);

    // Sum only the recurring expense amounts recorded in this target month.
    // We need this breakdown so the chart can show recurring vs one-time separately.
    const recurringExpenses = expensesRaw.filter((e) => {
      const d = new Date(e.date); return e.isRecurring && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    }).reduce((sum, e) => sum + parseFloat(e.amount ?? "0"), 0);

    // Derive one-time expenses for the month by subtracting recurring from total.
    const oneTimeExpenses = monthExpenses - recurringExpenses;
    // Push a cash flow data point: income is the same each month (no per-month income history yet).
    cashFlowHistory.push({ month: monthName, income: monthlyIncome, expenses: monthExpenses });
    // Push an income breakdown point, splitting into a rough 75/25 primary/secondary split
    // as a placeholder until per-stream historical data is tracked.
    incomeHistory.push({ month: monthName, total: monthlyIncome, primary: monthlyIncome * 0.75, secondary: monthlyIncome * 0.25 });
    // Push an expense breakdown point separating recurring from one-time costs.
    expenseHistory.push({ month: monthName, total: monthExpenses, recurring: recurringExpenses, oneTime: oneTimeExpenses });
  }

  // Build the budget-vs-actual comparison array from the user's saved budget records.
  // Each entry shows the configured limit and the actual spend recorded for that category.
  const budgetVsActual = budgetsRaw.map((b) => ({
    category: b.category, budget: parseFloat(b.monthlyLimit ?? "0"), actual: parseFloat(b.currentSpend ?? "0"),
  }));

  // Collect all unique expense category names and sort them alphabetically.
  // This powers the category filter dropdown in the expenses table.
  const categories = [...new Set(expenses.map((e) => e.category))].sort();

  // Return the complete page payload. The TanStack Query hook in lib/hooks/ will
  // cache this and distribute individual fields to each React component that needs them.
  return {
    monthlyIncome, monthlyExpenses: totalSpent, availableFunds, monthlyBudget, remaining,
    emergencyFundPercent, diySaved, pendingUrgent, incomeStreams, expenses: expenses.slice(0, 20),
    upcomingExpenses, spendingByCategory, cashFlowHistory, incomeHistory, expenseHistory,
    budgetVsActual, categories,
  };
}
