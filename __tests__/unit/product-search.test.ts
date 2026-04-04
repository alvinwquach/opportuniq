/**
 * Product Search Tool Tests
 *
 * Covers: null firecrawl, buy mode (scrape, enhanced, popup, images, timeout),
 * review mode (search flag ON/OFF, JSON extraction, fallback, errors).
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

const mockCaptureException = jest.fn();
const mockCaptureMessage = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: [unknown, ...unknown[]]) => mockCaptureException(...args),
  captureMessage: (...args: [unknown, ...unknown[]]) => mockCaptureMessage(...args),
}));

// ─── Feature flags ────────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();

jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: [unknown, ...unknown[]]) => mockGetFeatureFlag(...args),
}));

// ─── Firecrawl search ─────────────────────────────────────────────────────────

const mockFirecrawlSearch = jest.fn();

jest.mock("@/lib/integrations/firecrawl-search", () => ({
  firecrawlSearch: (...args: [unknown, ...unknown[]]) => mockFirecrawlSearch(...args),
}));

// ─── AI SDK ───────────────────────────────────────────────────────────────────

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
}));

// ─── Firecrawl SDK mock ───────────────────────────────────────────────────────

const mockScrape = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
  })),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import FirecrawlApp from "@mendable/firecrawl-js";
import { createProductSearchTool } from "@/app/api/chat/tools/product-search";
import type { ToolContext } from "@/app/api/chat/tools/types";

function makeCtx(overrides: Partial<ToolContext> = {}): ToolContext {
  const fc = new FirecrawlApp({ apiKey: "test" });
  (fc as { scrape: jest.Mock }).scrape = mockScrape;
  return {
    firecrawl: fc,
    userId: "user-123",
    conversationId: "conv-1",
    zipCode: "94105",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: all flags OFF
  mockGetFeatureFlag.mockResolvedValue(false);
  mockFirecrawlSearch.mockResolvedValue(null);
  mockScrape.mockResolvedValue({ markdown: "# Products\n$29.99" });
});

// ─── No firecrawl ─────────────────────────────────────────────────────────────

describe("createProductSearchTool — no firecrawl", () => {
  it("returns error with suggestion for buy mode", async () => {
    const tool = createProductSearchTool({ firecrawl: null });
    const result = await tool.execute!({ query: "PVC pipe", mode: "buy" }, {} as never);
    expect((result as { error: string }).error).toMatch(/not available/i);
    expect((result as { suggestion: string }).suggestion).toContain("PVC pipe");
  });

  it("returns error with suggestion for review mode", async () => {
    const tool = createProductSearchTool({ firecrawl: null });
    const result = await tool.execute!({ query: "DeWalt drill", mode: "review" }, {} as never);
    expect((result as { error: string }).error).toMatch(/not available/i);
    expect((result as { suggestion: string }).suggestion).toContain("DeWalt drill");
  });
});

// ─── BUY mode ─────────────────────────────────────────────────────────────────

describe("createProductSearchTool — buy mode", () => {
  it("returns scrape results with source, shopUrl, and images", async () => {
    mockScrape.mockResolvedValue({
      markdown: "# PVC Pipe\n$5.99 per foot",
      images: ["https://homedepot.com/img1.jpg", "https://homedepot.com/img2.jpg"],
    });
    mockGetFeatureFlag.mockResolvedValue(false); // enhanced mode OFF

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "PVC pipe 1/2 inch", mode: "buy", category: "materials" }, {} as never);

    expect((result as { source: string }).source).toBe("Home Depot");
    expect((result as { results: string }).results).toContain("PVC Pipe");
    expect((result as { images: string[] }).images).toHaveLength(2);
    expect((result as { shopUrl: string }).shopUrl).toContain("PVC");
    expect((result as { category: string }).category).toBe("materials");
  });

  it("limits images to 10", async () => {
    const manyImages = Array.from({ length: 20 }, (_, i) => `https://img.com/${i}.jpg`);
    mockScrape.mockResolvedValue({ markdown: "# Results", images: manyImages });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "drill bits", mode: "buy" }, {} as never);

    expect((result as { images: string[] }).images).toHaveLength(10);
  });

  it("passes enhancedMode when flag is ON and URL is a known domain", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-enhanced-mode";
    });
    mockScrape.mockResolvedValue({ markdown: "# Results" });

    const tool = createProductSearchTool(makeCtx());
    await tool.execute!({ query: "hammer", mode: "buy" }, {} as never);

    expect(mockScrape).toHaveBeenCalledWith(
      expect.stringContaining("homedepot.com"),
      expect.objectContaining({ enhancedMode: true })
    );
  });

  it("does NOT pass enhancedMode when flag is OFF", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "# Results" });

    const tool = createProductSearchTool(makeCtx());
    await tool.execute!({ query: "hammer", mode: "buy" }, {} as never);

    const callArgs = mockScrape.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(callArgs?.enhancedMode).toBeUndefined();
  });

  it("includes POPUP_DISMISS_ACTIONS in scrape call", async () => {
    mockScrape.mockResolvedValue({ markdown: "content" });

    const tool = createProductSearchTool(makeCtx());
    await tool.execute!({ query: "screws", mode: "buy" }, {} as never);

    expect(mockScrape).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ actions: expect.any(Array) })
    );
  });

  it("returns error when scrape returns no markdown", async () => {
    mockScrape.mockResolvedValue({ markdown: "" });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "nails", mode: "buy" }, {} as never);

    expect((result as { error: string }).error).toBeTruthy();
    expect((result as { shopUrl: string }).shopUrl).toContain("nails");
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({ level: "warning" })
    );
  });

  it("returns error and calls captureException when scrape throws", async () => {
    mockScrape.mockRejectedValue(new Error("scrape failed"));

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "pipe wrench", mode: "buy" }, {} as never);

    expect((result as { error: string }).error).toBeTruthy();
    expect(mockCaptureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ tool: "searchProducts" }) })
    );
  });

  it("truncates markdown results to 3000 chars", async () => {
    mockScrape.mockResolvedValue({ markdown: "x".repeat(5000) });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "tape", mode: "buy" }, {} as never);

    expect((result as { results: string }).results.length).toBeLessThanOrEqual(3000);
  });
});

// ─── REVIEW mode (flag OFF — falls back to HD scrape) ─────────────────────────

describe("createProductSearchTool — review mode (search flag OFF)", () => {
  it("falls back to Home Depot scrape when flag is OFF", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "# DeWalt Reviews\n4.5/5 stars" });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "DeWalt DCD777", mode: "review" }, {} as never);

    expect((result as { product: string }).product).toBe("DeWalt DCD777");
    expect((result as { results: string }).results).toContain("DeWalt Reviews");
    expect((result as { reviewSources: unknown[] }).reviewSources).toBeDefined();
  });

  it("returns error and calls captureMessage when HD scrape returns no markdown (review mode)", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "" });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "Milwaukee drill", mode: "review" }, {} as never);

    expect((result as { error: string }).error).toContain("timed out");
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({ level: "warning" })
    );
  });

  it("returns timeout error and calls captureMessage when HD scrape throws (scrapeWithTimeout returns null)", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    // scrapeWithTimeout catches errors internally and returns null — so tool hits "timed out" path
    mockScrape.mockRejectedValue(new Error("network error"));

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "Moen faucet", mode: "review" }, {} as never);

    expect((result as { error: string }).error).toContain("timed out");
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({ level: "warning" })
    );
  });
});

// ─── REVIEW mode (flag ON — uses firecrawlSearch) ─────────────────────────────

describe("createProductSearchTool — review mode (search flag ON)", () => {
  it("returns review sources from firecrawlSearch", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-search-v2";
    });
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        { url: "https://review1.com", title: "Best Drills 2024", description: "Top picks" },
        { url: "https://review2.com", title: "DeWalt vs Milwaukee", description: "Head to head" },
      ],
    });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "cordless drill", mode: "review" }, {} as never);

    expect((result as { product: string }).product).toBe("cordless drill");
    const sources = (result as { reviewSources: Array<{ url: string }> }).reviewSources;
    expect(sources).toHaveLength(2);
    expect(sources[0].url).toBe("https://review1.com");
    expect((result as { tip: string }).tip).toBeTruthy();
  });

  it("includes JSON extraction insights when both flags ON", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-search-v2" || flag === "firecrawl-json-extraction";
    });
    mockFirecrawlSearch.mockResolvedValue({
      web: [{ url: "https://review1.com", title: "Top Drills", description: "Review" }],
    });
    mockScrape.mockResolvedValue({
      json: { rating: 4.5, reviewCount: 120, pros: ["powerful"], cons: ["heavy"] },
    });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "impact driver", mode: "review" }, {} as never);

    expect((result as { insights: unknown }).insights).toEqual(
      expect.objectContaining({ rating: 4.5 })
    );
  });

  it("returns results without insights if JSON extraction throws (non-fatal)", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-search-v2" || flag === "firecrawl-json-extraction";
    });
    mockFirecrawlSearch.mockResolvedValue({
      web: [{ url: "https://review1.com", title: "Review", description: "text" }],
    });
    mockScrape.mockRejectedValue(new Error("extraction failed"));

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "socket set", mode: "review" }, {} as never);

    // Should still return review sources even though extraction failed
    expect((result as { reviewSources: unknown[] }).reviewSources).toBeDefined();
    expect((result as { insights: unknown }).insights).toBeNull();
  });

  it("falls back to HD scrape when firecrawlSearch returns empty web array", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-search-v2";
    });
    mockFirecrawlSearch.mockResolvedValue({ web: [] });
    mockScrape.mockResolvedValue({ markdown: "# HD Results" });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "tape measure", mode: "review" }, {} as never);

    // Falls back to HD scrape path
    expect(mockScrape).toHaveBeenCalled();
    expect((result as { product: string }).product).toBe("tape measure");
  });

  it("falls back to HD scrape when firecrawlSearch returns null", async () => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      return flag === "firecrawl-search-v2";
    });
    mockFirecrawlSearch.mockResolvedValue(null);
    mockScrape.mockResolvedValue({ markdown: "# HD Results" });

    const tool = createProductSearchTool(makeCtx());
    const result = await tool.execute!({ query: "caulk gun", mode: "review" }, {} as never);

    expect(mockScrape).toHaveBeenCalled();
    expect((result as { product: string }).product).toBe("caulk gun");
  });

  it("uses 'system' userId when ctx.userId is undefined (no flag checks)", async () => {
    const tool = createProductSearchTool(makeCtx({ userId: undefined }));
    mockScrape.mockResolvedValue({ markdown: "content" });

    const result = await tool.execute!({ query: "gloves", mode: "buy" }, {} as never);

    // Should succeed with a system userId
    expect((result as { source: string }).source).toBe("Home Depot");
  });
});
