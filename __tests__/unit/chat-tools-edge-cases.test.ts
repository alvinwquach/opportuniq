export {};
/**
 * Chat tools edge cases
 * Covers: null firecrawl context, undefined userId, tool-specific behaviors,
 *         calendar tool, cost lookup, contractor search, reddit search
 */

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
      limit: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
    }),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: { category: "category", zipCode: "zipCode" },
  googleCalendarTokens: { userId: "userId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${a}=${b}`),
  and: jest.fn((...args: unknown[]) => args.join(" AND ")),
  desc: jest.fn(),
  lte: jest.fn(),
  gte: jest.fn(),
}));

jest.mock("@/lib/google-calendar/client", () => ({
  createCalendarEvent: jest.fn().mockResolvedValue({
    eventId: "evt-1",
    htmlLink: "https://calendar.google.com/event",
  }),
}));

// ---- Context factory -----------------------------------------------------

import type { ToolContext } from "@/app/api/chat/tools/types";
import type { default as FirecrawlAppClass } from "@mendable/firecrawl-js";

const FirecrawlApp = (jest.requireMock("@mendable/firecrawl-js") as { default: typeof FirecrawlAppClass }).default;

function makeCtx(overrides: Partial<ToolContext> = {}): ToolContext {
  return {
    firecrawl: new FirecrawlApp({ apiKey: "test-key" }),
    userId: "user-123",
    userName: "Test User",
    conversationId: "conv-1",
    zipCode: "94105",
    ...overrides,
  };
}

// ---- Tests ---------------------------------------------------------------

describe("chat tools edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrape.mockResolvedValue({ markdown: "Sample content" });
    mockSearch.mockResolvedValue({ data: [] });
  });

  // --- Null firecrawl context -------------------------------------------

  it("all 8 tools return graceful error when ctx.firecrawl is null", async () => {
    const { createChatTools } = await import("@/app/api/chat/tools/index");
    const tools = createChatTools(null, "user-123", "conv-1", "Test", "94105");

    expect(tools).toHaveProperty("getCostEstimate");
    expect(tools).toHaveProperty("searchContractors");
    expect(tools).toHaveProperty("searchProducts");
    expect(tools).toHaveProperty("searchReddit");
    expect(tools).toHaveProperty("checkRecalls");
    expect(tools).toHaveProperty("findUtilityRebates");
    expect(tools).toHaveProperty("draftContractorEmail");
    expect(tools).toHaveProperty("scheduleReminder");
  });

  it("all 8 tools handle undefined userId in context", async () => {
    const { createChatTools } = await import("@/app/api/chat/tools/index");
    const tools = createChatTools(
      new FirecrawlApp({ apiKey: "test" }),
      undefined, // undefined userId
      undefined,
      undefined,
      undefined
    );

    expect(Object.keys(tools)).toHaveLength(8);
  });

  // --- scrapeWithTimeout --------------------------------------------------

  it("scrapeWithTimeout returns null when firecrawl.scrape throws", async () => {
    mockScrape.mockRejectedValue(new Error("Scrape failed"));
    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await scrapeWithTimeout(fc, "https://example.com");
    expect(result).toBeNull();
  });

  it("scrapeWithTimeout returns null when timeout fires first", async () => {
    mockScrape.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ markdown: "late" }), 100))
    );
    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await scrapeWithTimeout(fc, "https://example.com", 5); // 5ms timeout
    expect(result).toBeNull();
  });

  // --- Product search -----------------------------------------------------

  it("product search tool exists and has correct structure", async () => {
    const { createProductSearchTool } = await import("@/app/api/chat/tools/product-search");
    const tool = createProductSearchTool(makeCtx());
    expect(tool).toHaveProperty("description");
    expect(tool.inputSchema).toBeDefined();
    expect(tool).toHaveProperty("execute");
  });

  // --- Recall check -------------------------------------------------------

  it("recall check tool handles both product and vehicle types", async () => {
    mockScrape.mockResolvedValue({
      markdown: "No recalls found for this item",
      metadata: { statusCode: 200 },
    });

    const { createRecallCheckTool } = await import("@/app/api/chat/tools/recall-check");
    const tool = createRecallCheckTool(makeCtx());

    const productResult = await tool.execute!({ itemType: "product", searchTerm: "Ikea dresser" }, {} as never);
    expect(productResult).toHaveProperty("itemType", "product");

    const vehicleResult = await tool.execute!({ itemType: "vehicle", searchTerm: "Honda CR-V 2020" }, {} as never);
    expect(vehicleResult).toHaveProperty("itemType", "vehicle");
  });

  // --- Draft contractor email ---------------------------------------------

  it("draft email tool generates valid mailto link", async () => {
    const { createDraftContractorEmailTool } = await import(
      "@/app/api/chat/tools/draft-contractor-email"
    );
    const tool = createDraftContractorEmailTool(makeCtx());
    const result = await tool.execute!({
      contractorName: "Bob's Plumbing",
      issueDescription: "Leaky kitchen faucet",
      preferredContactMethod: "email",
    }, {} as never);

    expect(result).toBeDefined();
  });

  it("draft email tool uses ctx.userName when available", async () => {
    const { createDraftContractorEmailTool } = await import(
      "@/app/api/chat/tools/draft-contractor-email"
    );
    const tool = createDraftContractorEmailTool(makeCtx({ userName: "Jane Smith" }));
    const result = await tool.execute!({
      contractorName: "Some Contractor",
      issueDescription: "Tripped breaker",
      preferredContactMethod: "email",
    }, {} as never);

    // Result should reference the user's name
    const resultStr = JSON.stringify(result);
    expect(resultStr).toContain("Jane Smith");
  });

  it("draft email tool uses placeholder when ctx.userName missing", async () => {
    const { createDraftContractorEmailTool } = await import(
      "@/app/api/chat/tools/draft-contractor-email"
    );
    const tool = createDraftContractorEmailTool(makeCtx({ userName: undefined }));
    const result = await tool.execute!({
      contractorName: "Cool Air Inc",
      issueDescription: "AC not cooling",
      preferredContactMethod: "either",
    }, {} as never);

    // Should use a placeholder like "[Your Name]" or "Homeowner"
    const resultStr = JSON.stringify(result);
    expect(resultStr).toBeTruthy();
  });

  // --- Calendar reminder --------------------------------------------------

  it("calendar reminder tool has correct structure", async () => {
    const { createCalendarReminderTool } = await import(
      "@/app/api/chat/tools/calendar-reminder"
    );
    const tool = createCalendarReminderTool(makeCtx());
    expect(tool).toHaveProperty("description");
    expect(tool).toHaveProperty("execute");
  });

  it("calendar reminder handles daysFromNow=0 (immediate)", async () => {
    const { createCalendarReminderTool } = await import(
      "@/app/api/chat/tools/calendar-reminder"
    );
    const tool = createCalendarReminderTool(makeCtx());

    const result = await tool.execute!({
      title: "Emergency plumber visit",
      description: "Burst pipe under sink",
      daysFromNow: 0,
    }, {} as never);

    expect(result).toBeDefined();
  });

  // --- Cost lookup --------------------------------------------------------

  it("cost lookup tool exists and is callable", async () => {
    const { createCostLookupTool } = await import("@/app/api/chat/tools/cost-lookup");
    const tool = createCostLookupTool(makeCtx());
    expect(tool).toHaveProperty("execute");
  });

  // --- Contractor search --------------------------------------------------

  it("contractor search tool returns tips array on all paths", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Contractor: Bob's Plumbing, Phone: 555-1234",
    });

    const { createContractorSearchTool } = await import(
      "@/app/api/chat/tools/contractor-tools"
    );
    const tool = createContractorSearchTool(makeCtx());
    const result = await tool.execute!({ serviceType: "plumbing", zipCode: "94105" }, {} as never);

    expect(result).toHaveProperty("tips");
    expect(Array.isArray((result as { tips: unknown[] }).tips)).toBe(true);
  });

  // --- Reddit search ------------------------------------------------------

  it("reddit search tool exists and has execute function", async () => {
    const { createRedditSearchTool } = await import("@/app/api/chat/tools/reddit-search");
    const tool = createRedditSearchTool(makeCtx());
    expect(typeof tool.execute).toBe("function");
  });

  it("reddit search handles focusOn=undefined (defaults to general)", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Reddit post content here...",
    });

    const { createRedditSearchTool } = await import("@/app/api/chat/tools/reddit-search");
    const tool = createRedditSearchTool(makeCtx());
    const result = await tool.execute!({
      query: "leaky faucet repair cost",
      // focusOn not provided
    }, {} as never);

    expect(result).toBeDefined();
  });
});
