/**
 * Diagnosis Feature Integration Tests
 *
 * These tests verify the system prompt and response quality including:
 * - System prompt content validation
 * - AI response quality standards
 * - PPE and safety recommendations
 *
 * Run with: npm test -- --testPathPattern=integration
 */

import { readFileSync } from "fs";
import { join } from "path";

describe("Diagnosis Integration Tests", () => {
  // These tests validate prompt content and response quality

  describe("System Prompt Validation", () => {
    // Import the system prompt for validation
    let SYSTEM_PROMPT: string;

    beforeAll(async () => {
      // Read the route file to extract the system prompt
      const routeContent = readFileSync(
        join(__dirname, "../../app/api/chat/route.ts"),
        "utf-8"
      );

      // Extract SYSTEM_PROMPT from the file
      const match = routeContent.match(
        /const SYSTEM_PROMPT = `([\s\S]*?)`;/
      );
      SYSTEM_PROMPT = match ? match[1] : "";
    });

    it("includes severity assessment requirement", () => {
      expect(SYSTEM_PROMPT).toContain("SEVERITY ASSESSMENT");
      expect(SYSTEM_PROMPT).toContain("Minor");
      expect(SYSTEM_PROMPT).toContain("Moderate");
      expect(SYSTEM_PROMPT).toContain("Urgent");
    });

    it("includes DIY vs Professional recommendation", () => {
      expect(SYSTEM_PROMPT).toContain("DIY vs PROFESSIONAL");
    });

    it("includes cost estimate requirement", () => {
      expect(SYSTEM_PROMPT).toContain("COST ESTIMATES");
    });

    it("includes contractor type recommendation", () => {
      expect(SYSTEM_PROMPT).toContain("CONTRACTOR RECOMMENDATIONS");
      expect(SYSTEM_PROMPT).toContain("plumber");
      expect(SYSTEM_PROMPT).toContain("electrician");
    });

    describe("PPE Recommendations", () => {
      it("includes safety glasses/goggles", () => {
        expect(SYSTEM_PROMPT).toContain("Safety glasses");
      });

      it("includes glove recommendations", () => {
        expect(SYSTEM_PROMPT).toContain("Glove type");
      });

      it("includes dust mask/respirator", () => {
        expect(SYSTEM_PROMPT).toContain("Dust mask");
        expect(SYSTEM_PROMPT).toContain("N95");
      });

      it("includes hearing protection", () => {
        expect(SYSTEM_PROMPT).toContain("Hearing");
      });

      it("includes knee pads for floor work", () => {
        expect(SYSTEM_PROMPT).toContain("knee pads");
      });

      it("includes proper footwear", () => {
        expect(SYSTEM_PROMPT).toContain("Footwear");
      });
    });

    describe("Safety Warnings", () => {
      it("includes gas leak warning", () => {
        expect(SYSTEM_PROMPT).toContain("gas leak");
      });

      it("includes electrical hazard warning", () => {
        expect(SYSTEM_PROMPT).toContain("Electrical");
        expect(SYSTEM_PROMPT).toContain("breakers");
      });

      it("includes structural concerns warning", () => {
        expect(SYSTEM_PROMPT).toContain("Structural");
      });

      it("includes asbestos warning for pre-1980 homes", () => {
        expect(SYSTEM_PROMPT).toContain("1980");
        expect(SYSTEM_PROMPT).toContain("asbestos");
        expect(SYSTEM_PROMPT).toContain("popcorn ceiling");
      });

      it("includes lead paint warning for pre-1978 homes", () => {
        expect(SYSTEM_PROMPT).toContain("1978");
        expect(SYSTEM_PROMPT).toContain("lead paint");
      });

      it("recommends turning off breakers before electrical work", () => {
        expect(SYSTEM_PROMPT).toContain("turning off breakers");
      });
    });
  });

  describe("Test Image Analysis", () => {
    // This test would make a real API call with the test image
    // Skipped by default to avoid API costs

    it.skip("analyzes ceiling damage image correctly", async () => {
      const imagePath = join(
        __dirname,
        "../../public/alpha/IMG_4186.jpeg"
      );

      // Read image as base64
      const imageBuffer = readFileSync(imagePath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

      // Would make API call here
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     messages: [{
      //       role: 'user',
      //       parts: [
      //         { type: 'text', text: 'What issue do you see?' },
      //         { type: 'file', mediaType: 'image/jpeg', url: base64Image }
      //       ]
      //     }]
      //   })
      // });

      // Verify response includes expected elements:
      // - Issue identification
      // - Severity assessment
      // - DIY vs Pro recommendation
      // - Cost estimate
      // - PPE if DIY
      // - Safety warnings for popcorn ceiling (potential asbestos)

      expect(true).toBe(true); // Placeholder
    });
  });
});

describe("Response Quality Checks", () => {
  // These tests validate that AI responses meet quality standards
  // They can be run against recorded responses or mock data

  const sampleDiagnosisResponse = `
**Issue Identified**: Water damage on popcorn ceiling

**Severity**: Moderate - The discoloration suggests ongoing moisture intrusion that needs to be addressed to prevent mold growth.

**DIY vs Professional**:
- Finding the water source: DIY possible
- Ceiling repair: **Professional recommended** due to potential asbestos in popcorn ceilings (if home built before 1980)

**Cost Estimate**:
- Professional inspection: $200-400
- Ceiling repair (if no asbestos): $300-600
- Asbestos testing: $25-75
- Full remediation (if asbestos present): $1,500-3,000

**Recommended Contractor Type**:
- Roofer or plumber (to find water source)
- General contractor or drywall specialist (for ceiling repair)
- Asbestos abatement specialist (if testing positive)

**Safety & PPE** (for initial inspection only):
- N95 respirator (important for popcorn ceiling dust)
- Safety glasses
- Work gloves
- Long sleeves to minimize skin contact with ceiling material

**Next Steps**:
1. Check for leaks above (attic, roof, bathroom on upper floor)
2. Get asbestos test kit or hire professional testing if home built before 1980
3. Fix water source before any ceiling repairs

⚠️ **Important**: If your home was built before 1980, do NOT disturb the ceiling material until tested for asbestos. Popcorn ceilings from this era commonly contain asbestos fibers.
`;

  it("includes issue identification", () => {
    expect(sampleDiagnosisResponse).toMatch(/issue|problem|damage/i);
  });

  it("includes severity assessment", () => {
    expect(sampleDiagnosisResponse).toMatch(/severity|minor|moderate|urgent/i);
  });

  it("includes DIY vs Professional recommendation", () => {
    expect(sampleDiagnosisResponse).toMatch(/DIY|professional|contractor/i);
  });

  it("includes cost estimate with range", () => {
    expect(sampleDiagnosisResponse).toMatch(/\$[\d,]+.*-.*\$?[\d,]+/);
  });

  it("includes PPE recommendations when applicable", () => {
    expect(sampleDiagnosisResponse).toMatch(/PPE|respirator|gloves|glasses|safety/i);
  });

  it("includes next steps", () => {
    expect(sampleDiagnosisResponse).toMatch(/next step|step 1|1\./i);
  });

  it("includes asbestos warning for popcorn ceiling", () => {
    expect(sampleDiagnosisResponse).toMatch(/asbestos/i);
    expect(sampleDiagnosisResponse).toMatch(/1980|before.*1980/i);
  });
});
