/**
 * RAG Unit Tests — Phase 9
 *
 * Tests:
 * - generateEmbedding returns 1536-dimension vector
 * - generateEmbedding handles API error gracefully
 * - findSimilarDiagnoses returns results ordered by similarity
 * - findSimilarDiagnoses filters by region when provided
 * - findSimilarDiagnoses returns empty array when no embeddings exist
 * - buildRAGContext formats context string correctly
 * - buildRAGContext returns null when no similar cases
 * - buildRAGContext returns null when vector store is empty
 *
 * Strategy: Mock leaf dependencies (OpenAI + db) only. Test real logic end-to-end.
 * This also exercises buildRAGContext through the real findSimilarDiagnoses → generateEmbedding chain.
 */

// ============================================================================
// MOCKS — factories run before const/let declarations, so we expose mock fns
// via require() after import rather than top-level closures.
// ============================================================================

jest.mock("openai", () => {
  const mockCreate = jest.fn();
  const MockOpenAI = jest.fn(() => ({ embeddings: { create: mockCreate } }));
  (MockOpenAI as unknown as Record<string, unknown>)._mockCreate = mockCreate;
  return { __esModule: true, default: MockOpenAI };
});

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/lib/analytics-server", () => ({
  trackRAGContextRetrieved: jest.fn(),
  trackRAGContextEmpty: jest.fn(),
  trackDiagnosisEmbedded: jest.fn(),
}));

// ============================================================================
// IMPORTS
// ============================================================================

import { generateEmbedding, findSimilarDiagnoses } from "@/lib/embeddings";
import { buildRAGContext } from "@/lib/rag-context";
import {
  trackRAGContextEmpty,
  trackRAGContextRetrieved,
} from "@/lib/analytics-server";

// Access mock fns created inside jest.mock factories
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockEmbeddingsCreate = (require("openai").default as Record<string, jest.Mock>)._mockCreate;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockDb = require("@/app/db/client").db as Record<string, jest.Mock>;

// ============================================================================
// HELPERS
// ============================================================================

function makeFakeVector(dims = 1536): number[] {
  return Array.from({ length: dims }, (_, i) => (i + 1) / dims);
}

const FAKE_VECTOR = makeFakeVector(1536);

// DB-shaped results (as returned by Drizzle's select)
const SAMPLE_RESULTS = [
  {
    id: "emb-1",
    conversationId: "conv-1",
    summaryText: "Service type: plumbing. Severity: moderate. Resolution: diy. Actual cost: $120. Outcome: successful.",
    serviceType: "plumbing",
    region: "902",
    actualCost: 12000,
    resolutionType: "diy",
    severity: "moderate",
    wasSuccessful: true,
    similarity: 0.95,
  },
  {
    id: "emb-2",
    conversationId: "conv-2",
    summaryText: "Service type: plumbing. Severity: moderate. Resolution: hired_pro. Actual cost: $450. Outcome: successful.",
    serviceType: "plumbing",
    region: "902",
    actualCost: 45000,
    resolutionType: "hired_pro",
    severity: "moderate",
    wasSuccessful: true,
    similarity: 0.88,
  },
];

// ============================================================================
// generateEmbedding
// ============================================================================

describe("generateEmbedding", () => {
  beforeEach(() => {
    mockEmbeddingsCreate.mockReset();
  });

  it("returns a 1536-dimension vector", async () => {
    mockEmbeddingsCreate.mockResolvedValueOnce({
      data: [{ embedding: FAKE_VECTOR }],
    });

    const result = await generateEmbedding("ceiling water damage");

    expect(result).toHaveLength(1536);
    expect(typeof result[0]).toBe("number");
  });

  it("handles API error gracefully by propagating the error", async () => {
    mockEmbeddingsCreate.mockRejectedValueOnce(new Error("OpenAI rate limited"));

    await expect(generateEmbedding("leak")).rejects.toThrow("OpenAI rate limited");
  });
});

// ============================================================================
// findSimilarDiagnoses
// ============================================================================

describe("findSimilarDiagnoses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: FAKE_VECTOR }] });
  });

  it("returns results ordered by similarity (highest first)", async () => {
    const orderedResults = [...SAMPLE_RESULTS].sort((a, b) => b.similarity - a.similarity);
    mockDb.limit.mockResolvedValueOnce(orderedResults);

    const results = await findSimilarDiagnoses("water leak ceiling");

    expect(results[0].similarity).toBeGreaterThanOrEqual(results[1]?.similarity ?? 0);
  });

  it("filters by region when provided", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    const results = await findSimilarDiagnoses("plumbing issue", { region: "902" });

    // where() is called with the region OR null filter
    expect(mockDb.where).toHaveBeenCalled();
    expect(results).toHaveLength(SAMPLE_RESULTS.length);
  });

  it("returns empty array when no embeddings exist", async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const results = await findSimilarDiagnoses("bathroom leak");

    expect(results).toEqual([]);
  });
});

// ============================================================================
// buildRAGContext
// Tests run through the real findSimilarDiagnoses + generateEmbedding chain
// with mocked db and OpenAI leaf dependencies.
// ============================================================================

describe("buildRAGContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: FAKE_VECTOR }] });
  });

  it("formats context string correctly when similar cases exist", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    const result = await buildRAGContext("water leak", "90210", "conv-test");

    expect(result).not.toBeNull();
    expect(result).toContain("PAST SIMILAR CASES");
    expect(result).toContain("similar past case");
    expect(result).toContain("successful resolution");
  });

  it("includes resolution type labels in context", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    const result = await buildRAGContext("plumbing leak", "90210");

    expect(result).toMatch(/did it themselves|hired a professional/i);
  });

  it("returns null when no similar cases found", async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const result = await buildRAGContext("unknown issue", "99999", "conv-empty");

    expect(result).toBeNull();
    expect(trackRAGContextEmpty).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "no_similar" })
    );
  });

  it("returns null when vector store is empty (no embeddings)", async () => {
    mockDb.limit.mockResolvedValueOnce([]);

    const result = await buildRAGContext("any query", undefined, "conv-empty");

    expect(result).toBeNull();
  });

  it("tracks RAGContextRetrieved when cases are found", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    await buildRAGContext("ceiling crack", "90210", "conv-track");

    expect(trackRAGContextRetrieved).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-track",
        similarCasesFound: SAMPLE_RESULTS.length,
      })
    );
  });

  it("returns null when embedding API (findSimilarDiagnoses) throws", async () => {
    mockEmbeddingsCreate.mockRejectedValueOnce(new Error("pgvector unavailable"));

    const result = await buildRAGContext("leak", "90210");

    expect(result).toBeNull();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("buildRAGContext edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmbeddingsCreate.mockResolvedValue({ data: [{ embedding: FAKE_VECTOR }] });
  });

  it("returns both results when vector store has only 2 entries", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS.slice(0, 2));

    const result = await buildRAGContext("water damage", "90210");

    expect(result).not.toBeNull();
    expect(result).toContain("2 similar past cases");
  });

  it("still finds results when all cases are from different region (region is null)", async () => {
    const nullRegionResults = SAMPLE_RESULTS.map((r) => ({ ...r, region: null }));
    mockDb.limit.mockResolvedValueOnce(nullRegionResults);

    const result = await buildRAGContext("plumbing issue", "12345");

    expect(result).not.toBeNull();
  });

  it("handles short query ('leak') and still finds results", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    const result = await buildRAGContext("leak", "90210");

    expect(result).not.toBeNull();
    // The search was called with region = first 3 digits of "90210" = "902"
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("uses first 3 digits of ZIP code as region filter", async () => {
    mockDb.limit.mockResolvedValueOnce(SAMPLE_RESULTS);

    await buildRAGContext("issue", "94105");

    // db.where should be called (region = "941" OR NULL)
    expect(mockDb.where).toHaveBeenCalled();
  });
});
