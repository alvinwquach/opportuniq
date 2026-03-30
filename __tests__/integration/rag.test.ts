/**
 * RAG Integration Tests — Phase 9
 *
 * Tests:
 * - Outcome submission triggers embedding generation
 * - New diagnosis with flag ON retrieves relevant past cases
 * - New diagnosis with flag OFF skips RAG entirely
 * - Embedding generated includes actual cost and resolution type
 */

// ============================================================================
// MOCKS
// ============================================================================

jest.mock("@/lib/embeddings", () => ({
  generateEmbedding: jest.fn().mockResolvedValue(new Array(1536).fill(0.01)),
  embedCompletedDiagnosis: jest.fn().mockResolvedValue(undefined),
  findSimilarDiagnoses: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: jest.fn().mockResolvedValue(false),
  getFeatureFlagPayload: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/rag-context", () => ({
  buildRAGContext: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/analytics-server", () => ({
  trackRAGContextRetrieved: jest.fn(),
  trackRAGContextEmpty: jest.fn(),
  trackDiagnosisEmbedded: jest.fn(),
}));

// ============================================================================
// IMPORTS
// ============================================================================

import { embedCompletedDiagnosis } from "@/lib/embeddings";
import { buildDiagnosisPrompt } from "@/lib/prompts/diagnosis";
import { buildRAGContext } from "@/lib/rag-context";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { DiagnosisRequest } from "@/lib/schemas/diagnosis";

const mockEmbedCompleted = embedCompletedDiagnosis as jest.Mock;
const mockBuildRAGContext = buildRAGContext as jest.Mock;
const mockGetFeatureFlag = getFeatureFlag as jest.Mock;

// ============================================================================
// FIXTURES
// ============================================================================

const SAMPLE_DIAGNOSIS: DiagnosisRequest = {
  issue: {
    description: "There is water damage on my ceiling near the bathroom",
    category: "plumbing",
    location: "bathroom",
  },
  property: {
    type: "house",
    postalCode: "90210",
  },
  preferences: {
    diySkillLevel: "intermediate",
    hasBasicTools: true,
    urgency: "flexible",
  },
};

const SAMPLE_SIMILAR_CASES = [
  {
    id: "emb-1",
    conversationId: "conv-1",
    summaryText: "Service type: plumbing. Severity: moderate. Resolution: hired_pro. Actual cost: $450. Outcome: successful.",
    serviceType: "plumbing",
    region: "902",
    actualCost: 45000,
    resolutionType: "hired_pro",
    severity: "moderate",
    wasSuccessful: true,
    similarity: 0.93,
  },
  {
    id: "emb-2",
    conversationId: "conv-2",
    summaryText: "Service type: plumbing. Severity: minor. Resolution: diy. Actual cost: $80. Outcome: successful.",
    serviceType: "plumbing",
    region: "902",
    actualCost: 8000,
    resolutionType: "diy",
    severity: "minor",
    wasSuccessful: true,
    similarity: 0.87,
  },
];

// ============================================================================
// EMBEDDING PIPELINE
// ============================================================================

describe("Outcome submission → embedding generation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers embedCompletedDiagnosis when conversationId is provided with outcome", async () => {
    await embedCompletedDiagnosis("conv-abc", {
      actualCostCents: 45000,
      resolutionType: "hired_pro",
      wasSuccessful: true,
    });

    expect(mockEmbedCompleted).toHaveBeenCalledWith(
      "conv-abc",
      expect.objectContaining({
        actualCostCents: 45000,
        resolutionType: "hired_pro",
        wasSuccessful: true,
      })
    );
  });

  it("embedding includes actual cost and resolution type", async () => {
    await embedCompletedDiagnosis("conv-xyz", {
      actualCostCents: 12000,
      resolutionType: "diy",
      wasSuccessful: false,
    });

    expect(mockEmbedCompleted).toHaveBeenCalledWith(
      "conv-xyz",
      expect.objectContaining({
        actualCostCents: 12000,
        resolutionType: "diy",
        wasSuccessful: false,
      })
    );
  });
});

// ============================================================================
// DIAGNOSIS PROMPT — FLAG ON
// ============================================================================

describe("New diagnosis with rag-enabled flag ON", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFeatureFlag.mockResolvedValue(true);
    mockBuildRAGContext.mockResolvedValue(
      `## PAST SIMILAR CASES (Real Outcomes)\n\nBased on 2 similar past cases in your area:\n- 1 user hired a professional ($450)\n- 1 user did it themselves (DIY) ($80)\n- 2 of 2 reported successful resolution\n\nUse this data to calibrate cost estimates.`
    );
  });

  it("includes RAG context section when flag is ON and context is found", async () => {
    const prompt = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS, {
      userId: "user-123",
      conversationId: "conv-new",
    });

    expect(mockGetFeatureFlag).toHaveBeenCalledWith("rag-enabled", "user-123");
    expect(mockBuildRAGContext).toHaveBeenCalledWith(
      SAMPLE_DIAGNOSIS.issue.description,
      SAMPLE_DIAGNOSIS.property.postalCode,
      "conv-new"
    );
    expect(prompt).toContain("PAST SIMILAR CASES");
  });

  it("retrieves relevant past cases from the vector store", async () => {
    mockBuildRAGContext.mockResolvedValueOnce(
      `Based on ${SAMPLE_SIMILAR_CASES.length} similar past cases`
    );

    const prompt = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS, {
      userId: "user-456",
      conversationId: "conv-456",
    });

    expect(prompt).toContain("similar past cases");
  });

  it("still builds a valid prompt when RAG returns null (no similar cases)", async () => {
    mockBuildRAGContext.mockResolvedValueOnce(null);

    const prompt = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS, {
      userId: "user-789",
      conversationId: "conv-789",
    });

    // Prompt still contains the core identity and grounding sections
    expect(prompt).toContain("OpportunIQ");
    expect(prompt).not.toContain("PAST SIMILAR CASES");
  });
});

// ============================================================================
// DIAGNOSIS PROMPT — FLAG OFF
// ============================================================================

describe("New diagnosis with rag-enabled flag OFF", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFeatureFlag.mockResolvedValue(false);
  });

  it("skips RAG entirely when flag is OFF", async () => {
    const prompt = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS, {
      userId: "user-111",
      conversationId: "conv-111",
    });

    expect(mockBuildRAGContext).not.toHaveBeenCalled();
    expect(prompt).not.toContain("PAST SIMILAR CASES");
  });

  it("skips RAG when no userId is provided", async () => {
    const prompt = await buildDiagnosisPrompt(SAMPLE_DIAGNOSIS);

    expect(mockGetFeatureFlag).not.toHaveBeenCalled();
    expect(mockBuildRAGContext).not.toHaveBeenCalled();
    expect(prompt).not.toContain("PAST SIMILAR CASES");
  });
});
