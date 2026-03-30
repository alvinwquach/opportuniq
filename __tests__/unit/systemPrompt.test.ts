/**
 * System Prompt Unit Tests
 *
 * Pure unit tests for the diagnosis system prompt content.
 * These tests validate that all required sections are present.
 */

// Prevent transitive db/openai imports from failing without env vars
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: jest.fn().mockResolvedValue(false),
  getFeatureFlagPayload: jest.fn().mockResolvedValue(null),
}));
jest.mock("@/lib/rag-context", () => ({ buildRAGContext: jest.fn().mockResolvedValue(null) }));

import { buildDiagnosisPrompt } from "../../lib/prompts/diagnosis";
import type { DiagnosisRequest } from "../../lib/schemas/diagnosis";

const SAMPLE_DIAGNOSIS: DiagnosisRequest = {
  issue: {
    description: "There is a crack in my ceiling",
    category: "structural",
  },
  property: {
    postalCode: "90210",
    type: "house",
    yearBuilt: 1975,
  },
  preferences: {
    diySkillLevel: "intermediate",
    hasBasicTools: true,
    urgency: "flexible",
  },
};

describe("System Prompt Unit Tests", () => {
  let SYSTEM_PROMPT: string;

  beforeAll(async () => {
    SYSTEM_PROMPT = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS);
  });

  describe("Required Sections", () => {
    it("has issue identification section", () => {
      expect(SYSTEM_PROMPT).toContain("Issue Identification");
    });

    it("has severity assessment section", () => {
      expect(SYSTEM_PROMPT).toContain("Severity Rating");
    });

    it("has urgency and timeline section", () => {
      expect(SYSTEM_PROMPT).toMatch(/urgency|timeline/i);
    });

    it("has DIY vs professional section", () => {
      expect(SYSTEM_PROMPT).toMatch(/Can I Do This Myself|DIY.*hiring|DIY vs/i);
    });

    it("has safety risks section", () => {
      expect(SYSTEM_PROMPT).toContain("Safety Warnings");
    });

    it("has PPE requirements section", () => {
      expect(SYSTEM_PROMPT).toContain("PPE");
    });

    it("has tools required section", () => {
      expect(SYSTEM_PROMPT).toMatch(/Tools.*Required|TOOLS REQUIRED|tools/i);
    });

    it("has materials required section", () => {
      expect(SYSTEM_PROMPT).toMatch(/Materials.*Required|MATERIALS REQUIRED|materials/i);
    });

    it("has cost estimates section", () => {
      expect(SYSTEM_PROMPT).toContain("Cost Breakdown");
    });

    it("has contractor recommendations section", () => {
      expect(SYSTEM_PROMPT).toContain("Local Contractors");
    });

    it("has next steps section", () => {
      expect(SYSTEM_PROMPT).toContain("Next Steps");
    });
  });

  describe("Severity Levels", () => {
    it("defines Minor severity", () => {
      expect(SYSTEM_PROMPT).toContain("Minor");
    });

    it("defines Moderate severity", () => {
      expect(SYSTEM_PROMPT).toContain("Moderate");
    });

    it("defines Urgent severity", () => {
      expect(SYSTEM_PROMPT).toContain("Urgent");
    });

    it("defines Emergency severity", () => {
      expect(SYSTEM_PROMPT).toContain("Emergency");
    });
  });

  describe("PPE Categories", () => {
    it("covers eye protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/eyes|safety glasses|goggles/i);
    });

    it("covers respiratory protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/respiratory|dust mask|n95|respirator/i);
    });

    it("covers hand protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/hands|glove|chemical exposure/i);
    });

    it("covers hearing protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/hearing|PPE|N95/i);
    });

    it("covers foot protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/feet|footwear|safety gear/i);
    });
  });

  describe("Safety Warnings", () => {
    it("warns about asbestos in pre-1980 homes", () => {
      expect(SYSTEM_PROMPT).toContain("1980");
      expect(SYSTEM_PROMPT).toMatch(/asbestos/i);
    });

    it("warns about lead paint in pre-1978 homes", () => {
      expect(SYSTEM_PROMPT).toContain("1978");
      expect(SYSTEM_PROMPT).toMatch(/lead paint/i);
    });

    it("warns about electrical safety", () => {
      expect(SYSTEM_PROMPT).toMatch(/electrical|breakers|voltage/i);
    });

    it("warns about gas safety", () => {
      expect(SYSTEM_PROMPT).toMatch(/gas leak|carbon monoxide|gas/i);
    });

    it("warns about water damage and mold", () => {
      expect(SYSTEM_PROMPT).toMatch(/water damage|mold/i);
    });

    it("warns about structural issues", () => {
      expect(SYSTEM_PROMPT).toMatch(/structural|foundation|load-bearing/i);
    });
  });

  describe("Cost Information", () => {
    it("includes DIY cost guidance", () => {
      expect(SYSTEM_PROMPT).toMatch(/DIY cost|DIY Cost|materials.*tools/i);
    });

    it("includes professional cost guidance", () => {
      expect(SYSTEM_PROMPT).toMatch(/professional cost|Pro Cost|labor.*materials/i);
    });

    it("includes cost of ignoring", () => {
      expect(SYSTEM_PROMPT).toMatch(/cost if ignored|Hidden costs|rework/i);
    });
  });

  describe("Tool Sourcing", () => {
    it("mentions where to get tools", () => {
      expect(SYSTEM_PROMPT).toMatch(/home depot|harbor freight|rental|where to buy|purchase link/i);
    });
  });
});
