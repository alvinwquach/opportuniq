/**
 * System Prompt Unit Tests
 *
 * Pure unit tests for the diagnosis system prompt content.
 * These tests validate that all required sections are present.
 */

import { readFileSync } from "fs";
import { join } from "path";

describe("System Prompt Unit Tests", () => {
  let SYSTEM_PROMPT: string;

  beforeAll(() => {
    const routeContent = readFileSync(
      join(__dirname, "../../app/api/chat/route.ts"),
      "utf-8"
    );
    const match = routeContent.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
    SYSTEM_PROMPT = match ? match[1] : "";
  });

  describe("Required Sections", () => {
    it("has issue identification section", () => {
      expect(SYSTEM_PROMPT).toContain("ISSUE IDENTIFICATION");
    });

    it("has severity assessment section", () => {
      expect(SYSTEM_PROMPT).toContain("SEVERITY ASSESSMENT");
    });

    it("has urgency and timeline section", () => {
      expect(SYSTEM_PROMPT).toContain("URGENCY & TIMELINE");
    });

    it("has DIY vs professional section", () => {
      expect(SYSTEM_PROMPT).toContain("DIY vs PROFESSIONAL");
    });

    it("has safety risks section", () => {
      expect(SYSTEM_PROMPT).toContain("SAFETY RISKS");
    });

    it("has PPE requirements section", () => {
      expect(SYSTEM_PROMPT).toContain("PPE");
      expect(SYSTEM_PROMPT).toContain("Personal Protective Equipment");
    });

    it("has tools required section", () => {
      expect(SYSTEM_PROMPT).toContain("TOOLS REQUIRED");
    });

    it("has materials required section", () => {
      expect(SYSTEM_PROMPT).toContain("MATERIALS REQUIRED");
    });

    it("has cost estimates section", () => {
      expect(SYSTEM_PROMPT).toContain("COST ESTIMATES");
    });

    it("has contractor recommendations section", () => {
      expect(SYSTEM_PROMPT).toContain("CONTRACTOR RECOMMENDATIONS");
    });

    it("has next steps section", () => {
      expect(SYSTEM_PROMPT).toContain("NEXT STEPS");
    });
  });

  describe("Severity Levels", () => {
    it("defines Minor severity", () => {
      expect(SYSTEM_PROMPT).toContain("Minor");
      expect(SYSTEM_PROMPT).toMatch(/minor.*cosmetic|non-urgent/i);
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
      expect(SYSTEM_PROMPT).toMatch(/hands|glove/i);
    });

    it("covers hearing protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/hearing/i);
    });

    it("covers foot protection", () => {
      expect(SYSTEM_PROMPT).toMatch(/feet|footwear/i);
    });
  });

  describe("Safety Warnings", () => {
    it("warns about asbestos in pre-1980 homes", () => {
      expect(SYSTEM_PROMPT).toContain("1980");
      expect(SYSTEM_PROMPT).toContain("asbestos");
    });

    it("warns about lead paint in pre-1978 homes", () => {
      expect(SYSTEM_PROMPT).toContain("1978");
      expect(SYSTEM_PROMPT).toContain("lead paint");
    });

    it("warns about electrical safety", () => {
      expect(SYSTEM_PROMPT).toMatch(/electrical|breakers|voltage/i);
    });

    it("warns about gas safety", () => {
      expect(SYSTEM_PROMPT).toMatch(/gas leak|carbon monoxide/i);
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
      expect(SYSTEM_PROMPT).toMatch(/DIY cost|materials.*tools/i);
    });

    it("includes professional cost guidance", () => {
      expect(SYSTEM_PROMPT).toMatch(/professional cost|labor.*materials/i);
    });

    it("includes cost of ignoring", () => {
      expect(SYSTEM_PROMPT).toMatch(/cost if ignored|delay/i);
    });
  });

  describe("Tool Sourcing", () => {
    it("mentions where to get tools", () => {
      expect(SYSTEM_PROMPT).toMatch(/home depot|harbor freight|rental/i);
    });
  });
});
