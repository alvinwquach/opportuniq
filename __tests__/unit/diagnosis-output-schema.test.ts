/**
 * DiagnosisOutputSchema Unit Tests
 */

import { DiagnosisOutputSchema, TitleSchema } from "../../lib/schemas/diagnosis-output";

const validDiagnosis = {
  issueIdentified: "Leaking pipe under bathroom sink",
  severity: "moderate" as const,
  safetyRisks: ["Water damage to cabinet", "Mold growth if untreated"],
  diyFeasibility: "possible_with_experience" as const,
  ppeRequired: ["Safety glasses", "Rubber gloves"],
  nextSteps: ["Turn off water supply", "Inspect P-trap", "Replace if cracked"],
  urgencyTimeframe: "within 2 days",
};

describe("DiagnosisOutputSchema", () => {
  it("validates complete diagnosis output", () => {
    const result = DiagnosisOutputSchema.safeParse(validDiagnosis);
    expect(result.success).toBe(true);
  });

  it("validates with optional fields present", () => {
    const withOptionals = {
      ...validDiagnosis,
      estimatedCostRange: { diyMin: 20, diyMax: 60, proMin: 150, proMax: 300 },
      recommendedContractorType: "plumber",
    };
    const result = DiagnosisOutputSchema.safeParse(withOptionals);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recommendedContractorType).toBe("plumber");
      expect(result.data.estimatedCostRange?.proMin).toBe(150);
    }
  });

  it("requires severity to be one of the enum values", () => {
    const badSeverity = { ...validDiagnosis, severity: "catastrophic" };
    const result = DiagnosisOutputSchema.safeParse(badSeverity);
    expect(result.success).toBe(false);
  });

  it("allows optional estimatedCostRange to be omitted", () => {
    const result = DiagnosisOutputSchema.safeParse(validDiagnosis);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedCostRange).toBeUndefined();
    }
  });

  it("requires ppeRequired and nextSteps as arrays", () => {
    const noPpe = { ...validDiagnosis, ppeRequired: "glasses" };
    expect(DiagnosisOutputSchema.safeParse(noPpe).success).toBe(false);

    const noSteps = { ...validDiagnosis, nextSteps: "fix it" };
    expect(DiagnosisOutputSchema.safeParse(noSteps).success).toBe(false);
  });

  it("rejects invalid severity value", () => {
    const result = DiagnosisOutputSchema.safeParse({
      ...validDiagnosis,
      severity: "critical",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("severity");
    }
  });

  it("validates all diyFeasibility enum values", () => {
    const values = [
      "recommended",
      "possible_with_experience",
      "not_recommended",
      "dangerous",
    ] as const;
    for (const val of values) {
      const result = DiagnosisOutputSchema.safeParse({
        ...validDiagnosis,
        diyFeasibility: val,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid diyFeasibility value", () => {
    const result = DiagnosisOutputSchema.safeParse({
      ...validDiagnosis,
      diyFeasibility: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("allows partial estimatedCostRange (only some fields)", () => {
    const partial = {
      ...validDiagnosis,
      estimatedCostRange: { proMin: 200, proMax: 400 },
    };
    const result = DiagnosisOutputSchema.safeParse(partial);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedCostRange?.diyMin).toBeUndefined();
      expect(result.data.estimatedCostRange?.proMax).toBe(400);
    }
  });
});

describe("TitleSchema", () => {
  it("validates a title string", () => {
    const result = TitleSchema.safeParse({ title: "Ceiling Crack - Minor" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Ceiling Crack - Minor");
    }
  });

  it("rejects missing title field", () => {
    const result = TitleSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
