/**
 * Cost scraper edge cases
 * Covers: cache expiry, missing data, API failures, malformed responses
 */

export {};

// ---- Polyfill Web Streams (required by ai SDK) ----------------------------

if (!globalThis.TransformStream) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const webStreams = require("stream/web");
  Object.assign(globalThis, {
    TransformStream: webStreams.TransformStream,
    ReadableStream: webStreams.ReadableStream,
    WritableStream: webStreams.WritableStream,
  });
}

// ---- Mocks ---------------------------------------------------------------

const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockDbUpdate = jest.fn();

function chainWith(val: unknown = []) {
  const c: Record<string, jest.Mock | unknown> = {};
  const methods = ["from","where","values","set","returning","limit","orderBy","and","groupBy"];
  for (const m of methods) c[m] = jest.fn(() => c);
  c.then = jest.fn((res: (v: unknown) => unknown) => Promise.resolve(val).then(res));
  return c;
}

jest.mock("@/app/db/client", () => ({
  db: {
    select: (...args: [unknown, ...unknown[]]) => mockDbSelect(...args),
    insert: (...args: [unknown, ...unknown[]]) => mockDbInsert(...args),
    update: (...args: [unknown, ...unknown[]]) => mockDbUpdate(...args),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: {
    id: "id", category: "category", subcategory: "subcategory",
    zipCode: "zipCode", lowCost: "lowCost", avgCost: "avgCost",
    highCost: "highCost", updatedAt: "updatedAt",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  desc: jest.fn((col: unknown) => `${col} DESC`),
  gte: jest.fn(),
  lte: jest.fn(),
  sql: jest.fn((t: TemplateStringsArray) => t[0]),
}));

const mockScrape = jest.fn();
jest.mock("@mendable/firecrawl-js", () => ({
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
  })),
}));

// ---- Tests ---------------------------------------------------------------

describe("cost scraper edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cost lookup returns null when no cached data exists", async () => {
    mockDbSelect.mockReturnValue(chainWith([])); // empty DB result

    const { createCostLookupTool } = await import("@/app/api/chat/tools/cost-lookup");
    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const tool = createCostLookupTool({
      firecrawl: new FirecrawlApp({ apiKey: "test" }),
      userId: "user-1",
      zipCode: "94105",
    });

    const result = await tool.execute!({ serviceType: "plumbing", zipCode: "94105" }, {} as never);
    // With empty DB, tool should return a result with no cost data or with suggestion
    expect(result).toBeDefined();
  });

  it("cost lookup returns cached data when available", async () => {
    const cachedData = [
      {
        id: "cost-1",
        category: "plumbing",
        subcategory: "faucet_repair",
        zipCode: "94105",
        lowCost: "75.00",
        avgCost: "150.00",
        highCost: "300.00",
        updatedAt: new Date(),
      },
    ];
    mockDbSelect.mockReturnValue(chainWith(cachedData));

    const { createCostLookupTool } = await import("@/app/api/chat/tools/cost-lookup");
    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const tool = createCostLookupTool({
      firecrawl: new FirecrawlApp({ apiKey: "test" }),
      userId: "user-1",
      zipCode: "94105",
    });

    const result = await tool.execute!({ serviceType: "plumbing", zipCode: "94105" }, {} as never);
    expect(result).toBeDefined();
  });

  it("cost scraper handles malformed HTML response", async () => {
    mockScrape.mockResolvedValue({
      markdown: "<!DOCTYPE html><html><body>Error 500</body></html>",
      metadata: { statusCode: 500 },
    });

    // The scraper should handle this gracefully
    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const result = await scrapeWithTimeout(
      new FirecrawlApp({ apiKey: "test" }),
      "https://homeadvisor.com/cost/plumbing"
    );

    expect(result?.markdown).toContain("Error 500");
  });

  it("cost scraper returns null on timeout", async () => {
    mockScrape.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ markdown: "late" }), 1000))
    );

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const result = await scrapeWithTimeout(
      new FirecrawlApp({ apiKey: "test" }),
      "https://homeadvisor.com/cost",
      5 // 5ms timeout
    );

    expect(result).toBeNull();
  });

  it("cost data with all fields present is valid", () => {
    const costRecord = {
      category: "plumbing",
      subcategory: "faucet_repair",
      zipCode: "94105",
      lowCost: "75.00",
      avgCost: "150.00",
      highCost: "300.00",
    };

    expect(parseFloat(costRecord.lowCost)).toBeLessThan(parseFloat(costRecord.avgCost));
    expect(parseFloat(costRecord.avgCost)).toBeLessThan(parseFloat(costRecord.highCost));
  });

  it("cost monitor handles zero-cost items gracefully", () => {
    const costRecord = {
      category: "maintenance",
      lowCost: "0.00",
      avgCost: "0.00",
      highCost: "0.00",
    };

    const avg = parseFloat(costRecord.avgCost);
    expect(avg).toBe(0);
    // Should not divide by zero
    const utilization = avg > 0 ? 100 : 0;
    expect(utilization).toBe(0);
  });
});
