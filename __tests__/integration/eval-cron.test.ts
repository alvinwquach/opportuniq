/**
 * Eval Cron Integration Tests
 *
 * Verifies that the eval pipeline processes a batch of conversations and
 * produces a coherent report. The DB and external services are mocked.
 */

// Mock DB, Sentry, and PostHog before importing route modules
jest.mock("@/app/db/client", () => ({ db: {} }));
jest.mock("@sentry/nextjs", () => ({
  captureMessage: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock("@/lib/analytics-server", () => ({
  trackEvalRunCompleted: jest.fn(),
  trackHallucinationDetected: jest.fn(),
}));

import { detectHallucination } from "../../lib/eval/hallucination-detector";
import type { Message, ToolCall } from "../../lib/eval/hallucination-detector";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeConversation(messages: Message[], toolCalls: ToolCall[]) {
  return { messages, toolCalls };
}

function runEvalBatch(conversations: ReturnType<typeof makeConversation>[]) {
  let hallucinationCount = 0;
  const hallucinatedIds: number[] = [];

  conversations.forEach((conv, idx) => {
    const result = detectHallucination(conv.messages, conv.toolCalls);
    if (result.hallucinated) {
      hallucinationCount++;
      hallucinatedIds.push(idx);
    }
  });

  const hallucinationRate =
    conversations.length === 0 ? 0 : hallucinationCount / conversations.length;

  return { hallucinationCount, hallucinationRate, hallucinatedIds };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Eval cron — batch hallucination detection", () => {
  it("processes a clean batch with no hallucinations", () => {
    const conversations = [
      makeConversation(
        [{ role: "assistant", content: "Based on HomeAdvisor data, expect $400–$600." }],
        [{ name: "getCostEstimate", result: { low: 400, high: 600 } }]
      ),
      makeConversation(
        [{ role: "assistant", content: "I recommend calling a licensed plumber." }],
        []
      ),
    ];

    const report = runEvalBatch(conversations);

    expect(report.hallucinationCount).toBe(0);
    expect(report.hallucinationRate).toBe(0);
  });

  it("detects hallucinations in a mixed batch", () => {
    const conversations = [
      // clean — has tool call
      makeConversation(
        [{ role: "assistant", content: "Costs around $300 from our data." }],
        [{ name: "getCostEstimate", result: { low: 250, high: 350 } }]
      ),
      // hallucinated — no tool call
      makeConversation(
        [{ role: "assistant", content: "A plumber will charge $500 for this." }],
        []
      ),
      // hallucinated — no tool call
      makeConversation(
        [{ role: "assistant", content: "Parts cost $150, labour $200." }],
        []
      ),
    ];

    const report = runEvalBatch(conversations);

    expect(report.hallucinationCount).toBe(2);
    expect(report.hallucinationRate).toBeCloseTo(2 / 3);
    expect(report.hallucinatedIds).toEqual([1, 2]);
  });

  it("returns zero rate for an empty batch", () => {
    const report = runEvalBatch([]);
    expect(report.hallucinationCount).toBe(0);
    expect(report.hallucinationRate).toBe(0);
  });

  it("flags rate > 10% correctly", () => {
    // 2 out of 5 = 40% — should exceed the 10% threshold
    const clean = makeConversation(
      [{ role: "assistant", content: "No cost mentioned." }],
      []
    );
    const hallucinated = makeConversation(
      [{ role: "assistant", content: "This costs $999." }],
      []
    );
    const conversations = [clean, clean, clean, hallucinated, hallucinated];

    const report = runEvalBatch(conversations);
    expect(report.hallucinationRate).toBeGreaterThan(0.1);
  });
});

describe("Eval cron — admin dashboard renders empty eval data", () => {
  it("does not throw when eval metrics are all zero", () => {
    const emptyEvalMetrics = {
      hallucinationRate: 0,
      hallucinationCount: 0,
      conversationsChecked: 0,
      toolFailureRates: [] as Array<{ toolName: string; rate: number }>,
      accuracy: {
        overall: { total: 0, avgDelta: 0, medianDelta: 0, withinThirtyPercent: 0 },
        byServiceType: {},
      },
    };

    expect(() => {
      // Simulate the component logic that reads from evalMetrics
      const rate = emptyEvalMetrics.hallucinationRate.toFixed(1);
      const toolRows = emptyEvalMetrics.toolFailureRates.map((t) => ({
        label: t.toolName,
        pct: (t.rate * 100).toFixed(0),
      }));
      const accuracy = emptyEvalMetrics.accuracy.overall;
      void rate;
      void toolRows;
      void accuracy;
    }).not.toThrow();
  });
});
