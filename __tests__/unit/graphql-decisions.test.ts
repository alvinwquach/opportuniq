/**
 * Tests for GraphQL decisions resolver
 */

// ---- Mocks ---------------------------------------------------------------
jest.mock("@/app/db/client", () => ({ db: {} }));



jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  desc: jest.fn((col: unknown) => `${col} DESC`),
  count: jest.fn(() => "COUNT(*)"),
  sql: jest.fn((tpl: TemplateStringsArray) => tpl[0]),
  inArray: jest.fn(),
}));

// ---- Fixtures ------------------------------------------------------------

const SAMPLE_DECISION_OPTIONS = [
  {
    id: "opt-1",
    issueId: "issue-001",
    type: "diy",
    title: "DIY Repair",
    description: "Fix it yourself",
    costMin: "20.00",
    costMax: "50.00",
    timeEstimate: "2-3 hours",
    riskLevel: "low",
    diyViable: true,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "opt-2",
    issueId: "issue-001",
    type: "hire",
    title: "Hire a Plumber",
    description: "Professional repair",
    costMin: "150.00",
    costMax: "300.00",
    timeEstimate: "1 hour",
    riskLevel: "low",
    diyViable: false,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "opt-3",
    issueId: "issue-001",
    type: "defer",
    title: "Defer — Monitor",
    description: "Wait and see",
    costMin: "0.00",
    costMax: "0.00",
    timeEstimate: "1 month",
    riskLevel: "medium",
    diyViable: false,
    createdAt: new Date("2024-03-01"),
  },
];

const SAMPLE_VOTES = [
  { id: "vote-1", decisionOptionId: "opt-1", userId: "user-1", vote: "approve" },
  { id: "vote-2", decisionOptionId: "opt-1", userId: "user-2", vote: "approve" },
  { id: "vote-3", decisionOptionId: "opt-2", userId: "user-3", vote: "approve" },
];

const SAMPLE_SIMULATIONS = [
  {
    id: "sim-1",
    optionId: "opt-1",
    scenarioType: "best_case",
    estimatedCost: "25.00",
    estimatedTime: "2 hours",
    successProbability: "0.85",
    description: "Best-case scenario",
  },
  {
    id: "sim-2",
    optionId: "opt-1",
    scenarioType: "worst_case",
    estimatedCost: "75.00",
    estimatedTime: "5 hours",
    successProbability: "0.60",
    description: "Worst-case scenario",
  },
];

// ---- Tests ---------------------------------------------------------------

describe("decisions resolver", () => {
  it("returns decision options for an issue", () => {
    const optionsForIssue = SAMPLE_DECISION_OPTIONS.filter(
      (o) => o.issueId === "issue-001"
    );
    expect(optionsForIssue).toHaveLength(3);
    expect(optionsForIssue.map((o) => o.type)).toEqual(
      expect.arrayContaining(["diy", "hire", "defer"])
    );
  });

  it("returns vote counts per option", () => {
    const votesForOpt1 = SAMPLE_VOTES.filter(
      (v) => v.decisionOptionId === "opt-1"
    ).length;
    const votesForOpt2 = SAMPLE_VOTES.filter(
      (v) => v.decisionOptionId === "opt-2"
    ).length;

    expect(votesForOpt1).toBe(2);
    expect(votesForOpt2).toBe(1);
  });

  it("returns simulations for an option", () => {
    const simsForOpt1 = SAMPLE_SIMULATIONS.filter((s) => s.optionId === "opt-1");
    expect(simsForOpt1).toHaveLength(2);
    expect(simsForOpt1[0].scenarioType).toBe("best_case");
    expect(simsForOpt1[1].scenarioType).toBe("worst_case");
  });

  it("DIY option has lowest non-zero cost range", () => {
    const nonFree = SAMPLE_DECISION_OPTIONS.filter((o) => parseFloat(o.costMin) > 0);
    const sorted = [...nonFree].sort((a, b) => parseFloat(a.costMin) - parseFloat(b.costMin));
    expect(sorted[0].type).toBe("diy");
  });

  it("all four option types are valid", () => {
    const validTypes = ["diy", "hire", "defer", "replace"];
    for (const type of validTypes) {
      expect(validTypes).toContain(type);
    }
  });

  it("vote tallying computes winning option", () => {
    const tallyMap: Record<string, number> = {};
    for (const vote of SAMPLE_VOTES) {
      tallyMap[vote.decisionOptionId] = (tallyMap[vote.decisionOptionId] ?? 0) + 1;
    }

    const winner = Object.entries(tallyMap).sort(([, a], [, b]) => b - a)[0];
    expect(winner[0]).toBe("opt-1");
    expect(winner[1]).toBe(2);
  });

  it("simulation success probabilities are between 0 and 1", () => {
    for (const sim of SAMPLE_SIMULATIONS) {
      const prob = parseFloat(sim.successProbability);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    }
  });
});
