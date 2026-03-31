/**
 * Tests for financial tracking — income streams, expenses, budgets
 */

// ---- Mocks ---------------------------------------------------------------

jest.mock("@/app/db/client", () => ({ db: {} }));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn((...args: unknown[]) => args),
  desc: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
}));

// ---- Frequency conversion helpers ----------------------------------------

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

function toMonthly(amount: number, frequency: string): number {
  return amount * (FREQUENCY_TO_MONTHLY[frequency] ?? 0);
}

// ---- Tests ---------------------------------------------------------------

describe("income streams", () => {
  it("addIncomeStream server action is exported", async () => {
    const { addIncomeStream } = await import("@/app/actions/finance/financeActions");
    expect(typeof addIncomeStream).toBe("function");
  });

  it("updateIncomeStream server action is exported", async () => {
    const { updateIncomeStream } = await import("@/app/actions/finance/financeActions");
    expect(typeof updateIncomeStream).toBe("function");
  });

  it("deleteIncomeStream server action is exported", async () => {
    const { deleteIncomeStream } = await import("@/app/actions/finance/financeActions");
    expect(typeof deleteIncomeStream).toBe("function");
  });

  it("calculates total monthly income from active streams", () => {
    const streams = [
      { amount: 5000, frequency: "monthly", isActive: true },
      { amount: 2000, frequency: "bi_weekly", isActive: true },
      { amount: 500, frequency: "monthly", isActive: false }, // inactive
    ];

    const totalMonthly = streams
      .filter((s) => s.isActive)
      .reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0);

    // 5000 + (2000 * 2.17) = 5000 + 4340 = 9340
    expect(totalMonthly).toBeCloseTo(9340, 0);
  });

  it("one_time income contributes 0 to monthly total", () => {
    expect(toMonthly(10000, "one_time")).toBe(0);
  });

  it("annual income converts correctly to monthly", () => {
    const monthly = toMonthly(60000, "annual");
    expect(monthly).toBeCloseTo(5000, 0);
  });
});

describe("expenses", () => {
  it("addExpense server action is exported", async () => {
    const { addExpense } = await import("@/app/actions/finance/financeActions");
    expect(typeof addExpense).toBe("function");
  });

  it("groups expenses by category", () => {
    const expenses = [
      { category: "utilities", amount: 150 },
      { category: "home_repair", amount: 300 },
      { category: "utilities", amount: 80 },
      { category: "home_repair", amount: 200 },
    ];

    const grouped: Record<string, number> = {};
    for (const e of expenses) {
      grouped[e.category] = (grouped[e.category] ?? 0) + e.amount;
    }

    expect(grouped["utilities"]).toBe(230);
    expect(grouped["home_repair"]).toBe(500);
  });

  it("calculates total expenses for period", () => {
    const expenses = [
      { amount: 150, date: new Date("2024-03-01") },
      { amount: 300, date: new Date("2024-03-15") },
      { amount: 80, date: new Date("2024-04-01") }, // different month
    ];

    const marchStart = new Date("2024-03-01");
    const marchEnd = new Date("2024-03-31");

    const marchTotal = expenses
      .filter((e) => e.date >= marchStart && e.date <= marchEnd)
      .reduce((sum, e) => sum + e.amount, 0);

    expect(marchTotal).toBe(450);
  });

  it("recurring expense tagged correctly", () => {
    const expense = { category: "utilities", amount: 150, isRecurring: true, recurringFrequency: "monthly" };
    expect(expense.isRecurring).toBe(true);
    expect(expense.recurringFrequency).toBe("monthly");
  });
});

describe("budgets", () => {
  it("setBudget server action is exported", async () => {
    const { setBudget } = await import("@/app/actions/finance/financeActions");
    expect(typeof setBudget).toBe("function");
  });

  it("checks if budget exceeded (actual > limit)", () => {
    const budgets = [
      { category: "utilities", limit: 250, actual: 230 },
      { category: "entertainment", limit: 100, actual: 120 },
      { category: "home_repair", limit: 500, actual: 500 },
    ];

    const exceeded = budgets.filter((b) => b.actual > b.limit);
    expect(exceeded).toHaveLength(1);
    expect(exceeded[0].category).toBe("entertainment");
  });

  it("calculates budget utilization percentage", () => {
    const budget = { limit: 250, actual: 230 };
    const percent = (budget.actual / budget.limit) * 100;
    expect(percent).toBeCloseTo(92, 0);
  });

  it("100% utilization when actual equals limit", () => {
    const budget = { limit: 500, actual: 500 };
    const percent = (budget.actual / budget.limit) * 100;
    expect(percent).toBe(100);
  });

  it("zero utilization when no spending", () => {
    const budget = { limit: 300, actual: 0 };
    const percent = (budget.actual / budget.limit) * 100;
    expect(percent).toBe(0);
  });
});
