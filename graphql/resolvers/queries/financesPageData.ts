/**
 * Finances Page Data Resolver
 *
 * Fetches comprehensive data for the finances page view.
 */

import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import {
  userIncomeStreams,
  userExpenses,
  userBudgets,
  decisionOutcomes,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Frequency multipliers for monthly equivalent calculation
const frequencyMultipliers: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

// Category colors for charts
const categoryColors: Record<string, string> = {
  Housing: "#3ECF8E",
  Utilities: "#249361",
  Repairs: "#f59e0b",
  Maintenance: "#84cc16",
  Insurance: "#10b981",
  Groceries: "#ec4899",
  Transportation: "#059669",
  Healthcare: "#ef4444",
  Entertainment: "#f97316",
  Other: "#94a3b8",
};

// Month names for chart data
const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function financesPageDataResolver(
  _: unknown,
  __: unknown,
  ctx: Context
) {
  requireAuth(ctx);

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch all data in parallel
  const [incomeStreamsRaw, expensesRaw, budgetsRaw, allExpensesForHistory] = await Promise.all([
    // Income streams
    ctx.db
      .select()
      .from(userIncomeStreams)
      .where(eq(userIncomeStreams.userId, ctx.userId))
      .orderBy(desc(userIncomeStreams.amount)),

    // Recent expenses (last 6 months)
    ctx.db
      .select()
      .from(userExpenses)
      .where(
        and(
          eq(userExpenses.userId, ctx.userId),
          gte(userExpenses.date, sixMonthsAgo)
        )
      )
      .orderBy(desc(userExpenses.date)),

    // Budgets
    ctx.db
      .select()
      .from(userBudgets)
      .where(eq(userBudgets.userId, ctx.userId)),

    // All expenses for history charts
    ctx.db
      .select()
      .from(userExpenses)
      .where(
        and(
          eq(userExpenses.userId, ctx.userId),
          gte(userExpenses.date, sixMonthsAgo)
        )
      ),
  ]);

  // Transform income streams
  const incomeStreams = incomeStreamsRaw.map((stream) => {
    const amount = parseFloat(stream.amount ?? "0");
    const multiplier = frequencyMultipliers[stream.frequency] ?? 1;
    return {
      id: stream.id,
      source: stream.source,
      amount,
      frequency: stream.frequency,
      isActive: stream.isActive,
      description: stream.description,
      monthlyEquivalent: amount * multiplier,
    };
  });

  // Calculate monthly income
  const monthlyIncome = incomeStreams
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.monthlyEquivalent, 0);

  // Transform expenses
  const expenses = expensesRaw.map((expense) => ({
    id: expense.id,
    category: expense.category,
    amount: parseFloat(expense.amount ?? "0"),
    description: expense.description,
    date: expense.date,
    isRecurring: expense.isRecurring,
    frequency: expense.recurringFrequency,
    issueTitle: null, // Would need to join with issues table
    urgency: null, // Not stored in current schema
  }));

  // Calculate monthly expenses (recurring only)
  const monthlyExpenses = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => {
      const multiplier = frequencyMultipliers[e.frequency ?? "monthly"] ?? 1;
      return sum + e.amount * multiplier;
    }, 0);

  // Calculate one-time expenses this month
  const oneTimeThisMonth = expenses
    .filter((e) => {
      if (e.isRecurring) return false;
      const expDate = new Date(e.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpent = monthlyExpenses + oneTimeThisMonth;

  // Calculate monthly budget from budgets table
  const monthlyBudget = budgetsRaw.reduce(
    (sum, b) => sum + parseFloat(b.monthlyLimit ?? "0"),
    0
  ) || 800; // Default budget if none set

  const remaining = monthlyBudget - totalSpent;

  // Pending urgent expenses (upcoming recurring)
  const pendingUrgent = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + e.amount * 0.2, 0); // Estimate 20% of recurring as "pending"

  // Available funds calculation
  const monthlyBuffer = monthlyIncome * 0.1;
  const availableFunds = monthlyIncome - monthlyExpenses - monthlyBuffer - pendingUrgent;

  // Emergency fund (would come from user profile, defaulting to estimate)
  const emergencyFundPercent = 47; // Would calculate from actual savings

  // DIY savings (from decision outcomes)
  const diySaved = 0; // Would aggregate from decisionOutcomes where type is 'diy'

  // Upcoming expenses (recurring with next due dates)
  const upcomingExpenses = expenses
    .filter((e) => e.isRecurring)
    .map((e) => {
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);
      return {
        id: e.id,
        category: e.category,
        description: e.description ?? e.category,
        amount: e.amount,
        dueDate: nextDue,
        urgency: null,
        isRecurring: true,
      };
    })
    .slice(0, 5);

  // Spending by category
  const categoryTotals: Record<string, number> = {};
  expenses
    .filter((e) => {
      const expDate = new Date(e.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    })
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
    });

  const spendingByCategory = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] ?? "#94a3b8",
    }))
    .sort((a, b) => b.amount - a.amount);

  // Generate chart history data (last 6 months)
  const cashFlowHistory = [];
  const incomeHistory = [];
  const expenseHistory = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    const monthName = monthNames[targetMonth];

    // Calculate income for the month
    const monthIncome = monthlyIncome; // Simplified - assumes consistent income

    // Calculate expenses for the month
    const monthExpenses = allExpensesForHistory
      .filter((e) => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === targetMonth && expDate.getFullYear() === targetYear;
      })
      .reduce((sum, e) => sum + parseFloat(e.amount ?? "0"), 0);

    const recurringExpenses = allExpensesForHistory
      .filter((e) => {
        const expDate = new Date(e.date);
        return (
          e.isRecurring &&
          expDate.getMonth() === targetMonth &&
          expDate.getFullYear() === targetYear
        );
      })
      .reduce((sum, e) => sum + parseFloat(e.amount ?? "0"), 0);

    const oneTimeExpenses = monthExpenses - recurringExpenses;

    cashFlowHistory.push({
      month: monthName,
      income: monthIncome,
      expenses: monthExpenses,
    });

    incomeHistory.push({
      month: monthName,
      total: monthIncome,
      primary: monthIncome * 0.75,
      secondary: monthIncome * 0.25,
    });

    expenseHistory.push({
      month: monthName,
      total: monthExpenses,
      recurring: recurringExpenses,
      oneTime: oneTimeExpenses,
    });
  }

  // Budget vs actual
  const budgetVsActual = budgetsRaw.map((b) => ({
    category: b.category,
    budget: parseFloat(b.monthlyLimit ?? "0"),
    actual: parseFloat(b.currentSpend ?? "0"),
  }));

  // Get unique categories
  const categories = [
    ...new Set(expenses.map((e) => e.category)),
  ].sort();

  return {
    monthlyIncome,
    monthlyExpenses: totalSpent,
    availableFunds,
    monthlyBudget,
    remaining,
    emergencyFundPercent,
    diySaved,
    pendingUrgent,
    incomeStreams,
    expenses: expenses.slice(0, 20), // Limit recent expenses
    upcomingExpenses,
    spendingByCategory,
    cashFlowHistory,
    incomeHistory,
    expenseHistory,
    budgetVsActual,
    categories,
  };
}
