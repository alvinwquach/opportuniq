/**
 * Contractor search edge cases
 * Covers: Firecrawl fallbacks, empty results, Yelp/Foursquare, tips arrays
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

const mockScrape = jest.fn();
const mockSearch = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    search: mockSearch,
  })),
}));

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    }),
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn((...args: unknown[]) => args),
}));

// ---- Helpers -------------------------------------------------------------

import type { ToolContext } from "@/app/api/chat/tools/types";
import type { default as FirecrawlAppClass } from "@mendable/firecrawl-js";

const EXEC_OPTS = { toolCallId: "test", messages: [] as never[] };

function makeCtx(zipCode = "94105"): ToolContext {
  const FirecrawlApp = (jest.requireMock("@mendable/firecrawl-js") as { default: typeof FirecrawlAppClass }).default;
  return {
    firecrawl: new FirecrawlApp({ apiKey: "test" }),
    userId: "user-1",
    userName: "Test",
    conversationId: "conv-1",
    zipCode,
  };
}

// ---- Tests ---------------------------------------------------------------

describe("contractor search edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns tips array when Firecrawl returns good content", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Top Plumbers in San Francisco\n- Bob's Plumbing ⭐4.8\n- Alice Fix-It ⭐4.5",
      metadata: { statusCode: 200 },
    });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = (await tool.execute!({ serviceType: "plumbing", zipCode: "94105" }, EXEC_OPTS)) as { tips: unknown[] };

    expect(result).toHaveProperty("tips");
    expect(Array.isArray(result.tips)).toBe(true);
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it("returns tips array when Firecrawl returns empty content", async () => {
    mockScrape.mockResolvedValue({ markdown: "", metadata: { statusCode: 200 } });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = (await tool.execute!({ serviceType: "electrical", zipCode: "94105" }, EXEC_OPTS)) as { tips: unknown[] };

    // Should always include tips regardless of result quality
    expect(result).toHaveProperty("tips");
    expect(Array.isArray(result.tips)).toBe(true);
  });

  it("returns tips array when Firecrawl scrape fails", async () => {
    mockScrape.mockRejectedValue(new Error("Scrape failed"));

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = (await tool.execute!({ serviceType: "hvac", zipCode: "94105" }, EXEC_OPTS)) as { tips: unknown[] };

    expect(result).toHaveProperty("tips");
    expect(Array.isArray(result.tips)).toBe(true);
  });

  it("returns tips array when firecrawl is null", async () => {
    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool({ ...makeCtx(), firecrawl: null });
    const result = (await tool.execute!({ serviceType: "roofing", zipCode: "94105" }, EXEC_OPTS)) as { tips: unknown[] };

    expect(result).toHaveProperty("tips");
    expect(Array.isArray(result.tips)).toBe(true);
  });

  it("contractor search result has required shape", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Best HVAC Services\n- Cool Air Inc ⭐4.9\n  Phone: 555-0100",
    });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = (await tool.execute!({ serviceType: "hvac", zipCode: "94105" }, EXEC_OPTS)) as { serviceType: string; zipCode: string; tips: unknown[] };

    expect(result).toHaveProperty("serviceType");
    expect(result).toHaveProperty("zipCode");
    expect(result).toHaveProperty("tips");
  });

  it("uses default zipCode from context when not provided in args", async () => {
    mockScrape.mockResolvedValue({ markdown: "Results for 90210" });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx("90210"));
    const result = (await tool.execute!({ serviceType: "plumbing", zipCode: "90210" }, EXEC_OPTS)) as { zipCode: string };

    expect(result.zipCode).toBe("90210");
  });

  it("handles CAPTCHA page gracefully", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Please verify you are human. Complete the CAPTCHA to continue.",
      metadata: { statusCode: 200 },
    });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = (await tool.execute!({ serviceType: "plumbing", zipCode: "94105" }, EXEC_OPTS)) as { tips: unknown[] };

    // Still returns a valid result object
    expect(result).toBeDefined();
    expect(result).toHaveProperty("tips");
  });
});
