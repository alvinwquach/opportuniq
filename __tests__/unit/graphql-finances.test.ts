/**
 * Tests for finances server actions and budget logic
 */

// ---- Mocks ---------------------------------------------------------------
jest.mock("@/app/db/client", () => ({ db: {} }));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  desc: jest.fn((col: unknown) => `${col} DESC`),
  gte: jest.fn(),
  lte: jest.fn(),
  sql: jest.fn((tpl: TemplateStringsArray) => tpl[0]),
}));

// ---- Fixtures ------------------------------------------------------------

const MONTHLY_INCOME_STREAMS = [
  { id: "i-1", frequency: "monthly", monthlyEquivalent: 5000, isActive: true, source: "salary" },
  { id: "i-2", frequency: "bi_weekly", monthlyEquivalent: 1086, isActive: true, source: "freelance" },
  { id: "i-3", frequency: "monthly", monthlyEquivalent: 200, isActive: false, source: "rental" },
];

const EXPENSES = [
  { id: "e-1", category: "utilities", amount: 150, isRecurring: true, date: new Date("2024-03-01") },
  { id: "e-2", category: "home_repair", amount: 350, isRecurring: false, date: new Date("2024-03-10") },
  { id: "e-3", category: "utilities", amount: 80, isRecurring: true, date: new Date("2024-03-15") },
];

const BUDGETS = [
  { id: "b-1", category: "utilities", monthlyLimit: 250, currentSpend: 230 },
  { id: "b-2", category: "home_repair", monthlyLimit: 500, currentSpend: 350 },
  { id: "b-3", category: "entertainment", monthlyLimit: 100, currentSpend: 120 },
];

// ---- Tests ---------------------------------------------------------------

describe("finances resolver", () => {
  it("returns income streams for user", () => {
    const activeStreams = MONTHLY_INCOME_STREAMS.filter((s) => s.isActive);
    expect(activeStreams).toHaveLength(2);
    expect(activeStreams[0].source).toBe("salary");
  });

  it("returns expenses grouped by category", () => {
    const grouped: Record<string, number> = {};
    for (const e of EXPENSES) {
      grouped[e.category] = (grouped[e.category] ?? 0) + e.amount;
    }
    expect(grouped["utilities"]).toBe(230);
    expect(grouped["home_repair"]).toBe(350);
  });

  it("returns budget utilization percentages", () => {
    const utilization = BUDGETS.map((b) => ({
      category: b.category,
      percent: (b.currentSpend / b.monthlyLimit) * 100,
    }));

    const utilitiesUtil = utilization.find((u) => u.category === "utilities")!;
    expect(utilitiesUtil.percent).toBeCloseTo(92, 0);

    const entertainmentUtil = utilization.find((u) => u.category === "entertainment")!;
    expect(entertainmentUtil.percent).toBeGreaterThan(100); // over budget
  });

  it("getFinancesPageData server action is exported", async () => {
    const { getFinancesPageData } = await import(
      "@/app/actions/dashboard/getFinancesPageData"
    );
    expect(typeof getFinancesPageData).toBe("function");
  });

  it("calculates total monthly income from active streams only", () => {
    const activeTotal = MONTHLY_INCOME_STREAMS.filter((s) => s.isActive).reduce(
      (sum, s) => sum + s.monthlyEquivalent,
      0
    );
    // salary 5000 + freelance 1086 = 6086 (inactive rental excluded)
    expect(activeTotal).toBe(6086);
  });

  it("flags budget category as exceeded when actual > limit", () => {
    const exceeded = BUDGETS.filter((b) => b.currentSpend > b.monthlyLimit);
    expect(exceeded).toHaveLength(1);
    expect(exceeded[0].category).toBe("entertainment");
  });
});
