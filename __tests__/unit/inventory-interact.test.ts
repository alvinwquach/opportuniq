/**
 * Unit tests for inventory-check.ts — interact flow (firecrawl-interact flag)
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── ai mock ──────────────────────────────────────────────────────────────────
// Prevents TransformStream errors from the full AI SDK in jsdom environment

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: [unknown, ...unknown[]]) => mockGetFeatureFlag(...args),
}));

// ─── Firecrawl mock ───────────────────────────────────────────────────────────

const mockScrape = jest.fn();
const mockInteract = jest.fn();
const mockStopInteraction = jest.fn();

const mockFirecrawl = {
  scrape: mockScrape,
  interact: mockInteract,
  stopInteraction: mockStopInteraction,
};

import { createInventoryCheckTool } from "@/app/api/chat/tools/inventory-check";

function makeTool(zipCode = "94102") {
  const toolDef = createInventoryCheckTool({
    firecrawl: mockFirecrawl as never,
    userId: "user-123",
    conversationId: "conv-abc",
    zipCode,
  }) as unknown as {
    execute: (args: { query: string; zipCode: string }, opts: never) => Promise<unknown>;
  };
  return toolDef;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFeatureFlag.mockResolvedValue(false); // both flags OFF by default
  mockStopInteraction.mockResolvedValue(undefined);
});

// ─── Flag ON ──────────────────────────────────────────────────────────────────

describe("firecrawl-interact flag ON", () => {
  beforeEach(() => {
    mockGetFeatureFlag.mockImplementation(async (flag: string) => {
      if (flag === "firecrawl-interact") return true;
      return false;
    });
  });

  it("scrapes page first to get scrapeId", async () => {
    mockScrape.mockResolvedValue({
      markdown: "some content",
      metadata: { scrapeId: "scrape-xyz" },
    });
    mockInteract.mockResolvedValue({ output: "In stock at 3 stores" });

    const tool = makeTool();
    await tool.execute({ query: "drill bit set", zipCode: "94102" }, {} as never);

    expect(mockScrape).toHaveBeenCalledTimes(1);
    expect(mockScrape).toHaveBeenCalledWith(
      expect.stringContaining("homedepot.com"),
      expect.any(Object)
    );
  });

  it("calls interact with zip code prompt", async () => {
    mockScrape.mockResolvedValue({
      markdown: "content",
      metadata: { scrapeId: "scrape-xyz" },
    });
    mockInteract.mockResolvedValue({ output: "In stock" });

    const tool = makeTool("90210");
    await tool.execute({ query: "drill", zipCode: "90210" }, {} as never);

    expect(mockInteract).toHaveBeenCalledWith(
      "scrape-xyz",
      expect.objectContaining({
        prompt: expect.stringContaining("90210"),
      })
    );
  });

  it("calls stopInteraction after getting response", async () => {
    mockScrape.mockResolvedValue({
      markdown: "content",
      metadata: { scrapeId: "scrape-abc" },
    });
    mockInteract.mockResolvedValue({ output: "In stock" });

    const tool = makeTool();
    await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(mockStopInteraction).toHaveBeenCalledWith("scrape-abc");
  });

  it("returns inventory availability from response.output", async () => {
    mockScrape.mockResolvedValue({
      markdown: "content",
      metadata: { scrapeId: "scrape-xyz" },
    });
    mockInteract.mockResolvedValue({
      output: "Available at Mission District Home Depot (123 Main St) — 5 in stock",
    });

    const tool = makeTool();
    const result = await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(result).toMatchObject({
      inventory: "Available at Mission District Home Depot (123 Main St) — 5 in stock",
      source: expect.stringContaining("interact"),
    });
  });

  it("falls back to basic scrape when interact fails", async () => {
    mockScrape
      .mockResolvedValueOnce({
        markdown: "content",
        metadata: { scrapeId: "scrape-xyz" },
      })
      .mockResolvedValueOnce({ markdown: "Basic scrape result" });
    mockInteract.mockRejectedValue(new Error("interact API error"));

    const tool = makeTool();
    const result = await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    // Should have fallen back to the basic scrape result
    expect(result).toMatchObject({ source: "Home Depot" });
    // NOT the interact-flavored source
    expect((result as { source: string }).source).not.toContain("interact");
  });

  it("falls back when scrapeId is missing from metadata", async () => {
    mockScrape
      .mockResolvedValueOnce({
        markdown: "content",
        metadata: {}, // no scrapeId
      })
      .mockResolvedValueOnce({ markdown: "Fallback result" });

    const tool = makeTool();
    const result = await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(mockInteract).not.toHaveBeenCalled();
    expect(result).toMatchObject({ source: "Home Depot" });
  });

  it("stopInteraction failure does not throw (cleanup only)", async () => {
    mockScrape.mockResolvedValue({
      markdown: "content",
      metadata: { scrapeId: "scrape-xyz" },
    });
    mockInteract.mockResolvedValue({ output: "In stock" });
    mockStopInteraction.mockRejectedValue(new Error("stop failed"));

    const tool = makeTool();
    // Should not throw even if stopInteraction fails
    await expect(
      tool.execute({ query: "drill", zipCode: "94102" }, {} as never)
    ).resolves.not.toThrow();
  });
});

// ─── Flag OFF ─────────────────────────────────────────────────────────────────

describe("firecrawl-interact flag OFF", () => {
  it("uses basic scrape without calling interact", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    mockScrape.mockResolvedValue({ markdown: "Basic search results" });

    const tool = makeTool();
    await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(mockInteract).not.toHaveBeenCalled();
    expect(mockScrape).toHaveBeenCalledTimes(1);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("returns error when firecrawl is not available", async () => {
    const tool = createInventoryCheckTool({
      firecrawl: null,
      userId: "user-123",
    }) as unknown as {
      execute: (args: { query: string; zipCode: string }, opts: never) => Promise<unknown>;
    };

    const result = await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(result).toMatchObject({ error: expect.any(String) });
  });

  it("returns error when basic scrape times out (null result)", async () => {
    mockGetFeatureFlag.mockResolvedValue(false);
    // Scrape never resolves — simulated by returning null immediately
    mockScrape.mockResolvedValue(null);

    const tool = makeTool();
    const result = await tool.execute({ query: "drill", zipCode: "94102" }, {} as never);

    expect(result).toMatchObject({ error: expect.any(String) });
  });
});
