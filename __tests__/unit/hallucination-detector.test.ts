/**
 * Hallucination Detector Unit Tests
 */

import { detectHallucination } from "../../lib/eval/hallucination-detector";
import type { Message, ToolCall } from "../../lib/eval/hallucination-detector";

const assistantMsg = (content: string): Message => ({ role: "assistant", content });
const userMsg = (content: string): Message => ({ role: "user", content });
const costTool = (): ToolCall => ({ name: "getCostEstimate", args: {}, result: { low: 400, high: 600 } });

describe("detectHallucination", () => {
  describe("hallucination detected", () => {
    it("flags $500 mentioned with no tool call", () => {
      const result = detectHallucination(
        [assistantMsg("A plumber will charge around $500 for this repair.")],
        []
      );
      expect(result.hallucinated).toBe(true);
      expect(result.amounts).toContain("$500");
      expect(result.hasToolCall).toBe(false);
    });

    it("flags multiple dollar amounts with no tool call", () => {
      const result = detectHallucination(
        [assistantMsg("DIY costs about $50. Hiring a pro runs $300–$500.")],
        []
      );
      expect(result.hallucinated).toBe(true);
      expect(result.amounts.length).toBeGreaterThanOrEqual(2);
    });

    it("only scans assistant messages, not user messages", () => {
      const result = detectHallucination(
        [
          userMsg("I was quoted $800."),
          assistantMsg("That seems reasonable for this type of work."),
        ],
        []
      );
      // "$800" is in a user message — should NOT be flagged
      expect(result.hallucinated).toBe(false);
      expect(result.amounts).toHaveLength(0);
    });
  });

  describe("no hallucination", () => {
    it("does NOT flag $500 when getCostEstimate was called", () => {
      const result = detectHallucination(
        [assistantMsg("Based on HomeAdvisor data, expect to pay around $500.")],
        [costTool()]
      );
      expect(result.hallucinated).toBe(false);
      expect(result.hasToolCall).toBe(true);
    });

    it("does NOT flag when no dollar amounts are mentioned", () => {
      const result = detectHallucination(
        [assistantMsg("You should call a licensed electrician for this.")],
        []
      );
      expect(result.hallucinated).toBe(false);
      expect(result.amounts).toHaveLength(0);
    });

    it("does NOT flag an empty conversation", () => {
      const result = detectHallucination([], []);
      expect(result.hallucinated).toBe(false);
    });
  });

  describe("amounts extraction", () => {
    it("deduplicates repeated amounts", () => {
      const result = detectHallucination(
        [assistantMsg("DIY costs $200. Hiring a pro also costs around $200.")],
        []
      );
      expect(result.amounts).toEqual(["$200"]);
    });

    it("handles amounts with commas like $1,500", () => {
      const result = detectHallucination(
        [assistantMsg("This repair typically costs $1,500.")],
        []
      );
      expect(result.hallucinated).toBe(true);
      expect(result.amounts).toContain("$1,500");
    });

    it("handles amounts with cents like $49.99", () => {
      const result = detectHallucination(
        [assistantMsg("The part costs $49.99 at Home Depot.")],
        []
      );
      expect(result.hallucinated).toBe(true);
      expect(result.amounts).toContain("$49.99");
    });
  });
});
