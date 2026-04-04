/**
 * Tutorial Finder Tool Tests
 *
 * Covers: no firecrawl early return, search flag ON, search flag OFF (YouTube scrape),
 * timeout handling, Sentry capture on failure.
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
import { createTutorialFinderTool } from "@/app/api/chat/tools/tutorial-finder";
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
  mockGetFeatureFlag.mockResolvedValue(false);
  mockFirecrawlSearch.mockResolvedValue(null);
  mockScrape.mockResolvedValue({ markdown: "# YouTube Results" });
});

// ─── No firecrawl ─────────────────────────────────────────────────────────────

describe("createTutorialFinderTool — no firecrawl", () => {
  it("returns error, suggestion, and youtubeUrl immediately", async () => {
    const tool = createTutorialFinderTool({ firecrawl: null });
    const result = await tool.execute!({ repairTask: "replace toilet flapper" }, {} as never);

    expect((result as { error: string }).error).toMatch(/not available/i);
    expect((result as { suggestion: string }).suggestion).toContain("replace toilet flapper");
    expect((result as { youtubeUrl: string }).youtubeUrl).toContain("youtube.com");
    expect((result as { youtubeUrl: string }).youtubeUrl).toContain("replace");
  });

  it("does not call firecrawlSearch or scrape", async () => {
    const tool = createTutorialFinderTool({ firecrawl: null });
    await tool.execute!({ repairTask: "patch drywall" }, {} as never);

    expect(mockFirecrawlSearch).not.toHaveBeenCalled();
    expect(mockScrape).not.toHaveBeenCalled();
  });
});

// ─── Flag ON — uses firecrawlSearch ───────────────────────────────────────────

describe("createTutorialFinderTool — search flag ON", () => {
  it("returns tutorials array with youtubeUrl and tips", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);
    mockFirecrawlSearch.mockResolvedValue({
      web: [
        {
          url: "https://youtube.com/watch?v=abc",
          title: "How to Replace Toilet Flapper - YouTube",
          description: "Step by step guide",
        },
        {
          url: "https://youtube.com/watch?v=def",
          title: "Toilet Flapper Fix - YouTube",
          description: "Easy 5-minute repair",
        },
      ],
    });

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "replace toilet flapper" }, {} as never);

    expect((result as { searchQuery: string }).searchQuery).toBe("replace toilet flapper");
    expect((result as { youtubeUrl: string }).youtubeUrl).toContain("youtube.com");
    const tutorials = (result as { tutorials: Array<{ url: string; title?: string }> }).tutorials;
    expect(tutorials).toHaveLength(2);
    expect(tutorials[0].url).toBe("https://youtube.com/watch?v=abc");
    expect(tutorials[0].title).toContain("Toilet Flapper");
    const tips = (result as { tips: string[] }).tips;
    expect(Array.isArray(tips)).toBe(true);
    expect(tips.length).toBeGreaterThan(0);
  });

  it("passes the repair task and site:youtube.com in the search query", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);
    mockFirecrawlSearch.mockResolvedValue({ web: [] });
    mockScrape.mockResolvedValue({ markdown: "fallback content" });

    const tool = createTutorialFinderTool(makeCtx());
    await tool.execute!({ repairTask: "fix leaky faucet" }, {} as never);

    expect(mockFirecrawlSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("site:youtube.com"),
      expect.any(Object)
    );
    expect(mockFirecrawlSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining("fix leaky faucet"),
      expect.any(Object)
    );
  });

  it("falls back to YouTube scrape when search returns empty results", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);
    mockFirecrawlSearch.mockResolvedValue({ web: [] });
    mockScrape.mockResolvedValue({ markdown: "# YouTube video results..." });

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "patch drywall" }, {} as never);

    expect(mockScrape).toHaveBeenCalled();
    expect((result as { results: string }).results).toContain("YouTube video results");
  });

  it("does not call scrape when search returns results", async () => {
    mockGetFeatureFlag.mockResolvedValue(true);
    mockFirecrawlSearch.mockResolvedValue({
      web: [{ url: "https://youtube.com/watch?v=1", title: "Tutorial", description: "desc" }],
    });

    const tool = createTutorialFinderTool(makeCtx());
    await tool.execute!({ repairTask: "replace outlet" }, {} as never);

    expect(mockScrape).not.toHaveBeenCalled();
  });
});

// ─── Flag OFF — uses YouTube scrape ───────────────────────────────────────────

describe("createTutorialFinderTool — search flag OFF (YouTube scrape fallback)", () => {
  it("scrapes YouTube search URL and returns results with tips", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "# How to change brake pads videos..." });

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "change brake pads" }, {} as never);

    expect(mockScrape).toHaveBeenCalled();
    expect((result as { searchQuery: string }).searchQuery).toBe("change brake pads");
    expect((result as { results: string }).results).toContain("brake pads");
    expect((result as { youtubeUrl: string }).youtubeUrl).toContain("youtube.com");
    const tips = (result as { tips: string[] }).tips;
    expect(Array.isArray(tips)).toBe(true);
    expect(tips.length).toBeGreaterThan(0);
  });

  it("does NOT call firecrawlSearch when flag is OFF", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "content" });

    const tool = createTutorialFinderTool(makeCtx());
    await tool.execute!({ repairTask: "fix squeaky door" }, {} as never);

    expect(mockFirecrawlSearch).not.toHaveBeenCalled();
  });

  it("returns timeout error and calls captureMessage when scrape returns no markdown", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "" });

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "install ceiling fan" }, {} as never);

    expect((result as { error: string }).error).toContain("timed out");
    expect((result as { youtubeUrl: string }).youtubeUrl).toContain("youtube.com");
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({
        level: "warning",
        extra: expect.objectContaining({ tool: "findTutorial" }),
      })
    );
  });

  it("returns timeout error and calls captureMessage when scrape throws (scrapeWithTimeout returns null)", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    // scrapeWithTimeout catches errors internally and returns null — so tool hits "timed out" path
    mockScrape.mockRejectedValue(new Error("YouTube blocked"));

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "fix garbage disposal" }, {} as never);

    expect((result as { error: string }).error).toContain("timed out");
    expect((result as { youtubeUrl: string }).youtubeUrl).toBeTruthy();
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      "Tool returned error",
      expect.objectContaining({ level: "warning" })
    );
  });

  it("truncates results to 2000 chars", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "y".repeat(5000) });

    const tool = createTutorialFinderTool(makeCtx());
    const result = await tool.execute!({ repairTask: "unclog drain" }, {} as never);

    expect((result as { results: string }).results.length).toBeLessThanOrEqual(2000);
  });
});

// ─── No userId — skips flag checks ────────────────────────────────────────────

describe("createTutorialFinderTool — no userId", () => {
  it("skips flag check and goes straight to YouTube scrape", async () => {
    mockScrape.mockResolvedValue({ markdown: "# YouTube videos" });

    const tool = createTutorialFinderTool(makeCtx({ userId: undefined }));
    const result = await tool.execute!({ repairTask: "patch drywall hole" }, {} as never);

    expect(mockGetFeatureFlag).not.toHaveBeenCalled();
    expect(mockScrape).toHaveBeenCalled();
    expect((result as { results: string }).results).toBeTruthy();
  });
});
