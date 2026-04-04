/**
 * Guardrails Unit Tests
 */

import { checkDiagnosisGuardrails } from "../../lib/guardrails";

const costTool = () => ({ name: "getCostEstimate", args: {} });
const redditTool = () => ({ name: "searchReddit", args: {} });
const rebatesTool = () => ({ name: "lookupLocalInfo", args: {} });

describe("checkDiagnosisGuardrails", () => {
  it("passes when response has costs and getCostEstimate was called", () => {
    const result = checkDiagnosisGuardrails(
      "The repair will cost $300 based on current data.",
      [costTool()]
    );
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails HALLUCINATED_COST when $ amounts with no cost tool call", () => {
    const result = checkDiagnosisGuardrails(
      "A plumber will charge around $500 for this repair.",
      []
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(
      "HALLUCINATED_COST: Response contains dollar amounts but no cost data tool was called"
    );
  });

  it("does not flag $ amounts that came from searchReddit tool", () => {
    const result = checkDiagnosisGuardrails(
      "Reddit users report paying $200 for this fix.",
      [redditTool()]
    );
    expect(result.passed).toBe(true);
    expect(result.violations.some((v) => v.includes("HALLUCINATED_COST"))).toBe(false);
  });

  it("does not flag $ amounts that came from lookupLocalInfo tool", () => {
    const result = checkDiagnosisGuardrails(
      "There is a $500 rebate available from your utility provider.",
      [rebatesTool()]
    );
    expect(result.passed).toBe(true);
    expect(result.violations.some((v) => v.includes("HALLUCINATED_COST"))).toBe(false);
  });

  it("fails MISSING_SAFETY when electrical work without breaker warning", () => {
    const result = checkDiagnosisGuardrails(
      "You will need to replace the outlet and check the wiring.",
      []
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(
      "MISSING_SAFETY: Electrical work mentioned without breaker safety warning"
    );
  });

  it("passes when electrical work includes breaker warning", () => {
    const result = checkDiagnosisGuardrails(
      "Turn off the breaker before working on the outlet.",
      []
    );
    expect(result.passed).toBe(true);
    expect(result.violations.some((v) => v.includes("MISSING_SAFETY"))).toBe(false);
  });

  it("fails MISSING_ASBESTOS_WARNING for pre-1980 home without warning", () => {
    const result = checkDiagnosisGuardrails(
      "You should replace the floor tiles in your home.",
      [],
      1975
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(
      "MISSING_ASBESTOS_WARNING: Pre-1980 home but no asbestos warning"
    );
  });

  it("passes for pre-1980 home when asbestos is mentioned", () => {
    const result = checkDiagnosisGuardrails(
      "Be aware of potential asbestos in tiles from this era. Have them tested before disturbing.",
      [],
      1975
    );
    expect(result.violations.some((v) => v.includes("MISSING_ASBESTOS_WARNING"))).toBe(false);
  });

  it("fails MISSING_LEAD_WARNING for pre-1978 home without warning", () => {
    const result = checkDiagnosisGuardrails(
      "You should sand and repaint the window trim.",
      [],
      1970
    );
    expect(result.passed).toBe(false);
    expect(
      result.violations.some((v) => v.includes("MISSING_LEAD_WARNING"))
    ).toBe(true);
  });

  it("fails DANGEROUS_DIY when recommending DIY for gas line work", () => {
    const result = checkDiagnosisGuardrails(
      "You can do this yourself — just repair the gas line carefully.",
      []
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(
      "DANGEROUS_DIY: Recommending DIY for work that requires a licensed professional"
    );
  });

  it("fails DANGEROUS_DIY when recommending DIY for asbestos removal", () => {
    const result = checkDiagnosisGuardrails(
      "DIY is recommended for the asbestos removal in your basement.",
      []
    );
    expect(result.passed).toBe(false);
    expect(result.violations).toContain(
      "DANGEROUS_DIY: Recommending DIY for work that requires a licensed professional"
    );
  });

  it("passes when professional is recommended for dangerous work", () => {
    const result = checkDiagnosisGuardrails(
      "You must hire a licensed contractor to handle the gas line. Do not attempt this yourself.",
      []
    );
    expect(result.violations.some((v) => v.includes("DANGEROUS_DIY"))).toBe(false);
  });

  it("handles empty response string", () => {
    const result = checkDiagnosisGuardrails("", []);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("handles empty toolCalls array", () => {
    const result = checkDiagnosisGuardrails("No issues found.", []);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("handles undefined yearBuilt (skips age-specific checks)", () => {
    const result = checkDiagnosisGuardrails(
      "You should replace the floor tiles.",
      [],
      undefined
    );
    expect(result.violations.some((v) => v.includes("ASBESTOS"))).toBe(false);
    expect(result.violations.some((v) => v.includes("LEAD"))).toBe(false);
  });

  it("returns all violations when multiple guardrails fail", () => {
    // No cost tool, electrical without breaker, pre-1978 home
    const result = checkDiagnosisGuardrails(
      "The outlet and circuit will cost $200 to fix.",
      [],
      1970
    );
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
    expect(result.violations.some((v) => v.includes("HALLUCINATED_COST"))).toBe(true);
    expect(result.violations.some((v) => v.includes("MISSING_SAFETY"))).toBe(true);
    expect(result.violations.some((v) => v.includes("MISSING_LEAD_WARNING"))).toBe(true);
  });
});
