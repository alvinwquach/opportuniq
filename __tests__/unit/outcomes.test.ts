/**
 * Outcome Tracking Unit Tests
 *
 * Tests:
 * - costDelta calculation logic
 * - Accuracy rate calculation
 * - Zod schema validation (mirrors the API schema)
 * - PostHog analytics functions
 */

import { z } from "zod";

// ============================================================================
// COST DELTA CALCULATION
// ============================================================================

function calculateCostDelta(
  actualCost: number,
  costMin: number | null,
  costMax: number | null
): number | null {
  if (costMin === null) return null;
  const max = costMax !== null ? costMax : costMin;
  const predictedMid = (costMin + max) / 2;
  return actualCost - predictedMid;
}

describe("costDelta calculation", () => {
  it("positive delta when actual is over predicted midpoint", () => {
    const delta = calculateCostDelta(350, 200, 300);
    expect(delta).toBe(100); // midpoint 250, 350 - 250 = +100
  });

  it("negative delta when actual is under predicted midpoint", () => {
    const delta = calculateCostDelta(150, 200, 300);
    expect(delta).toBe(-100); // midpoint 250, 150 - 250 = -100
  });

  it("zero delta when actual equals midpoint", () => {
    const delta = calculateCostDelta(250, 200, 300);
    expect(delta).toBe(0);
  });

  it("uses costMin as midpoint when costMax is null", () => {
    const delta = calculateCostDelta(300, 200, null);
    expect(delta).toBe(100); // predicted = 200, 300 - 200 = +100
  });

  it("returns null when costMin is null", () => {
    const delta = calculateCostDelta(300, null, null);
    expect(delta).toBeNull();
  });
});

// ============================================================================
// ACCURACY RATE CALCULATION
// ============================================================================

function calculateAccuracyRate(
  outcomes: Array<{ costDelta: number; costMin: number }>
): number {
  if (outcomes.length === 0) return 0;
  const accurate = outcomes.filter(({ costDelta, costMin }) => {
    if (costMin === 0) return false;
    return Math.abs(costDelta) / costMin < 0.3;
  });
  return (accurate.length / outcomes.length) * 100;
}

describe("accuracy rate calculation", () => {
  it("returns 0 for zero outcomes", () => {
    expect(calculateAccuracyRate([])).toBe(0);
  });

  it("returns 100% when all outcomes are within ±30% of predicted", () => {
    const outcomes = [
      { costDelta: 20, costMin: 200 },  // 10% — accurate
      { costDelta: -30, costMin: 200 }, // 15% — accurate
    ];
    expect(calculateAccuracyRate(outcomes)).toBe(100);
  });

  it("returns 0% when all outcomes exceed ±30% of predicted", () => {
    const outcomes = [
      { costDelta: 100, costMin: 200 }, // 50% — inaccurate
      { costDelta: -80, costMin: 200 }, // 40% — inaccurate
    ];
    expect(calculateAccuracyRate(outcomes)).toBe(0);
  });

  it("handles a 50/50 mix correctly", () => {
    const outcomes = [
      { costDelta: 20, costMin: 200 },  // 10% — accurate
      { costDelta: 100, costMin: 200 }, // 50% — inaccurate
    ];
    expect(calculateAccuracyRate(outcomes)).toBe(50);
  });
});

// ============================================================================
// ZOD VALIDATION (mirrors API schema)
// ============================================================================

const recordOutcomeSchema = z.object({
  decisionId: z.string().uuid(),
  actualCost: z.number().min(0).optional(),
  actualTime: z.string().min(1).optional(),
  success: z.boolean(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const validOutcome = {
  decisionId: "550e8400-e29b-41d4-a716-446655440000",
  success: true,
};

describe("OutcomeForm Zod schema validation", () => {
  it("accepts minimal valid input", () => {
    expect(recordOutcomeSchema.safeParse(validOutcome).success).toBe(true);
  });

  it("rejects missing success field", () => {
    const { success: _s, ...without } = validOutcome;
    expect(recordOutcomeSchema.safeParse(without).success).toBe(false);
  });

  it("rejects missing decisionId", () => {
    const { decisionId: _d, ...without } = validOutcome;
    expect(recordOutcomeSchema.safeParse(without).success).toBe(false);
  });

  it("rejects negative actualCost", () => {
    expect(
      recordOutcomeSchema.safeParse({ ...validOutcome, actualCost: -1 }).success
    ).toBe(false);
  });

  it("accepts zero actualCost", () => {
    expect(
      recordOutcomeSchema.safeParse({ ...validOutcome, actualCost: 0 }).success
    ).toBe(true);
  });

  it("rejects invalid UUID for decisionId", () => {
    expect(
      recordOutcomeSchema.safeParse({ ...validOutcome, decisionId: "not-a-uuid" }).success
    ).toBe(false);
  });
});

// ============================================================================
// POSTHOG ANALYTICS
// ============================================================================

jest.mock("@/lib/posthog/client", () => ({
  __esModule: true,
  default: { capture: jest.fn() },
}));

import posthog from "@/lib/posthog/client";
import {
  trackIssueResolved,
  trackIssueReopened,
  trackAccuracyFeedbackGiven,
} from "@/lib/analytics";

const mockCapture = posthog.capture as jest.Mock;

beforeEach(() => mockCapture.mockClear());

describe("Outcome PostHog tracking functions", () => {
  it("trackIssueResolved captures 'Issue Resolved' with correct props", () => {
    trackIssueResolved({ issueId: "abc", resolutionType: "diy" });
    expect(mockCapture).toHaveBeenCalledWith(
      "Issue Resolved",
      expect.objectContaining({ issueId: "abc", resolutionType: "diy" })
    );
  });

  it("trackIssueReopened captures 'Issue Reopened'", () => {
    trackIssueReopened({ issueId: "abc", reason: "needs more work" });
    expect(mockCapture).toHaveBeenCalledWith(
      "Issue Reopened",
      expect.objectContaining({ issueId: "abc" })
    );
  });

  it("trackAccuracyFeedbackGiven captures 'Accuracy Feedback Given'", () => {
    trackAccuracyFeedbackGiven({ estimateAccurate: false, actualCost: 350 });
    expect(mockCapture).toHaveBeenCalledWith(
      "Accuracy Feedback Given",
      expect.objectContaining({ estimateAccurate: false, actualCost: 350 })
    );
  });
});
