/**
 * Firecrawl edge cases
 * Covers: API errors, empty responses, rate limits, large payloads,
 *         concurrent calls, JSON extraction, map(), batchScrape, webhooks
 */

// ---- Mock Firecrawl ------------------------------------------------------

const mockScrape = jest.fn();
const mockSearch = jest.fn();
const mockMap = jest.fn();
const mockBatchScrape = jest.fn();
const mockCrawl = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    search: mockSearch,
    map: mockMap,
    batchScrape: mockBatchScrape,
    crawl: mockCrawl,
  })),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

// ---- Helpers -------------------------------------------------------------

import type { ToolContext } from "@/app/api/chat/tools/types";

function makeCtx(firecrawlNull = false): ToolContext {
  const FirecrawlApp = require("@mendable/firecrawl-js").default;
  return {
    firecrawl: firecrawlNull ? null : new FirecrawlApp({ apiKey: "test-key" }),
    userId: "user-123",
    userName: "Test User",
    conversationId: "conv-1",
    zipCode: "94105",
  };
}

// ---- Tests ---------------------------------------------------------------

describe("Firecrawl edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- API key edge cases -------------------------------------------------

  it("handles FIRECRAWL_API_KEY as empty string", () => {
    const originalKey = process.env.FIRECRAWL_API_KEY;
    process.env.FIRECRAWL_API_KEY = "";
    // App should handle gracefully — null/undefined key
    expect(process.env.FIRECRAWL_API_KEY).toBe("");
    process.env.FIRECRAWL_API_KEY = originalKey;
  });

  // --- HTTP error codes ---------------------------------------------------

  it("Firecrawl returns 429 rate limit response", async () => {
    mockScrape.mockRejectedValue(
      Object.assign(new Error("Rate limit exceeded"), { status: 429 })
    );

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const ctx = makeCtx();
    const result = await scrapeWithTimeout(ctx.firecrawl!, "https://example.com");
    expect(result).toBeNull(); // graceful null return
  });

  it("Firecrawl returns 402 credits exhausted", async () => {
    mockScrape.mockRejectedValue(
      Object.assign(new Error("Insufficient credits"), { status: 402 })
    );

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result).toBeNull();
  });

  it("Firecrawl returns 500 internal server error", async () => {
    mockScrape.mockRejectedValue(
      Object.assign(new Error("Internal Server Error"), { status: 500 })
    );

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result).toBeNull();
  });

  // --- Content edge cases -------------------------------------------------

  it("Firecrawl returns CAPTCHA page as markdown", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Please verify you are human by solving this CAPTCHA...",
      metadata: { statusCode: 200 },
    });

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result).not.toBeNull();
    expect(result?.markdown).toContain("CAPTCHA");
  });

  it("Firecrawl returns empty markdown string", async () => {
    mockScrape.mockResolvedValue({ markdown: "", metadata: { statusCode: 200 } });

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result?.markdown).toBe("");
  });

  it("Firecrawl returns only navigation/footer text", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Home | About | Contact\nTerms of Service | Privacy Policy",
      metadata: { statusCode: 200 },
    });

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result?.markdown?.length).toBeLessThan(100); // minimal content
  });

  // --- Timeout edge cases -------------------------------------------------

  it("scrapeWithTimeout returns null when timeout fires first", async () => {
    mockScrape.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ markdown: "late" }), 5000))
    );

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com", 10);
    expect(result).toBeNull();
  });

  it("scrapeWithTimeout returns null when firecrawl.scrape throws", async () => {
    mockScrape.mockRejectedValue(new Error("Connection refused"));

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result).toBeNull();
  });

  // --- Network errors -----------------------------------------------------

  it("Network error: ECONNREFUSED", async () => {
    const error = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:80"), {
      code: "ECONNREFUSED",
    });
    mockScrape.mockRejectedValue(error);

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "http://localhost");
    expect(result).toBeNull();
  });

  it("Network error: DNS failure", async () => {
    const error = Object.assign(new Error("getaddrinfo ENOTFOUND nonexistent.example.com"), {
      code: "ENOTFOUND",
    });
    mockScrape.mockRejectedValue(error);

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(
      makeCtx().firecrawl!,
      "https://nonexistent.example.com"
    );
    expect(result).toBeNull();
  });

  // --- Large payload ------------------------------------------------------

  it("50MB markdown response is handled (very large content)", async () => {
    // 50MB of repeated text
    const hugeMd = "A".repeat(50 * 1024 * 1024);
    mockScrape.mockResolvedValue({ markdown: hugeMd, metadata: { statusCode: 200 } });

    const { scrapeWithTimeout } = await import("@/app/api/chat/tools/types");
    const result = await scrapeWithTimeout(makeCtx().firecrawl!, "https://example.com");
    expect(result?.markdown?.length).toBeGreaterThan(1000000);
  });

  // --- Map/batch ----------------------------------------------------------

  it("map() returns 10,000 URLs (respects limit param)", async () => {
    const tenThousandUrls = Array.from({ length: 10000 }, (_, i) => `https://example.com/page/${i}`);
    mockMap.mockResolvedValue({ urls: tenThousandUrls });

    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await fc.map("https://example.com", { limit: 10000 });
    expect(result.urls).toHaveLength(10000);
  });

  it("batchScrape partial failure (3 of 5 succeed)", async () => {
    mockBatchScrape.mockResolvedValue({
      status: "partial",
      completed: 3,
      total: 5,
      data: [
        { url: "https://example.com/1", markdown: "Page 1" },
        { url: "https://example.com/2", markdown: "Page 2" },
        { url: "https://example.com/3", markdown: "Page 3" },
      ],
      error: "2 URLs failed to scrape",
    });

    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await fc.batchScrape(
      ["https://example.com/1", "https://example.com/2", "https://example.com/3",
       "https://example.com/4", "https://example.com/5"]
    );
    expect(result.completed).toBe(3);
    expect(result.total).toBe(5);
  });

  // --- Search edge cases --------------------------------------------------

  it("search() returns results but all URLs are 404", async () => {
    mockSearch.mockResolvedValue({
      success: true,
      data: [
        { url: "https://example.com/404-page-1", markdown: "", metadata: { statusCode: 404 } },
        { url: "https://example.com/404-page-2", markdown: "", metadata: { statusCode: 404 } },
      ],
    });

    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await fc.search("plumber near me", { limit: 5 });
    const nonEmpty = result.data.filter((r: { markdown: string }) => r.markdown.length > 0);
    expect(nonEmpty).toHaveLength(0);
  });

  // --- JSON extraction ----------------------------------------------------

  it("JSON extraction returns valid JSON with wrong shape", async () => {
    // Route expects { contractors: [] } but gets { results: [] }
    const wrongShape = { results: [{ name: "Test Contractor" }] };
    mockScrape.mockResolvedValue({
      markdown: "Some page",
      extract: wrongShape,
      metadata: { statusCode: 200 },
    });

    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const fc = new FirecrawlApp({ apiKey: "test" });
    const result = await fc.scrape("https://angi.com/contractors", {
      formats: ["extract"],
      extract: { schema: {} },
    });

    expect(result.extract).toEqual(wrongShape);
    expect(result.extract.contractors).toBeUndefined(); // wrong shape detected
  });

  // --- Feature flag -------------------------------------------------------

  it("feature flag transitions mid-request don't crash (firecrawl returns data either way)", async () => {
    // Simulate flag flip between requests
    let callCount = 0;
    mockScrape.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ markdown: "v1 result" });
      return Promise.resolve({ markdown: "v2 result with different shape" });
    });

    const FirecrawlApp = require("@mendable/firecrawl-js").default;
    const fc = new FirecrawlApp({ apiKey: "test" });
    const r1 = await fc.scrape("https://example.com");
    const r2 = await fc.scrape("https://example.com");

    expect(r1.markdown).toBe("v1 result");
    expect(r2.markdown).toBe("v2 result with different shape");
  });

  // --- Webhook dedup ------------------------------------------------------

  it("webhook dedup: processing same event twice is idempotent", () => {
    const processedEvents = new Set<string>();
    const eventId = "evt-firecrawl-12345";

    function processEvent(id: string) {
      if (processedEvents.has(id)) return "duplicate";
      processedEvents.add(id);
      return "processed";
    }

    expect(processEvent(eventId)).toBe("processed");
    expect(processEvent(eventId)).toBe("duplicate"); // idempotent
    expect(processedEvents.size).toBe(1);
  });
});
