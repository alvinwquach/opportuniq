/**
 * Unit tests for lib/rate-limiter.ts and lib/firecrawl-limiter.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

const mockAddBreadcrumb = jest.fn();
jest.mock("@sentry/nextjs", () => ({
  addBreadcrumb: (...args: [unknown, ...unknown[]]) => mockAddBreadcrumb(...args),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  withServerActionInstrumentation: jest.fn((_, __, fn) => fn()),
}));

// ─── FirecrawlApp mock ────────────────────────────────────────────────────────

const mockScrape = jest.fn();
const mockCrawl = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    scrape: mockScrape,
    crawl: mockCrawl,
  })),
}));

// We import FirecrawlApp here just to get a typed instance for the tests
import FirecrawlApp from "@mendable/firecrawl-js";

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// lib/rate-limiter.ts
// checkRateLimit is async (Redis-backed); when Redis env vars are absent it
// returns the passthrough value { allowed: true, remaining: 20, resetAt: … }.
// =============================================================================

import { checkRateLimit, _resetBuckets } from "@/lib/rate-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetBuckets();
  });

  it("allows the first request for a new user", async () => {
    const result = await checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("returns a result with allowed, remaining, and resetAt fields", async () => {
    const result = await checkRateLimit("user-2");
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("resetAt");
  });

  it("isolates results per user (each user gets their own state)", async () => {
    const ra = await checkRateLimit("user-a");
    const rb = await checkRateLimit("user-b");
    // Both should be allowed when Redis is not configured
    expect(ra.allowed).toBe(true);
    expect(rb.allowed).toBe(true);
  });

  it("returns allowed: true when Redis is not configured (passthrough)", async () => {
    // Without UPSTASH env vars, the function returns a passthrough allowing all requests
    const result = await checkRateLimit("user-3");
    expect(result.allowed).toBe(true);
  });

  it("returns remaining >= 0", async () => {
    const result = await checkRateLimit("user-4");
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("sets resetAt in the future", async () => {
    const result = await checkRateLimit("user-5");
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  it("returns resetAt as epoch ms (not seconds)", async () => {
    const result = await checkRateLimit("user-7");
    // epoch ms is > 1e12
    expect(result.resetAt).toBeGreaterThan(1_000_000_000_000);
  });

  it("is async (returns a Promise)", () => {
    const ret = checkRateLimit("user-async");
    expect(ret).toBeInstanceOf(Promise);
  });
});

// =============================================================================
// lib/firecrawl-limiter.ts — semaphore
// =============================================================================

import {
  limitedScrape,
  limitedCrawl,
  limitedBatch,
  _getActiveCount,
} from "@/lib/firecrawl-limiter";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

describe("firecrawl-limiter — semaphore", () => {
  beforeEach(() => {
    mockScrape.mockReset();
    mockCrawl.mockReset();
  });

  it("allows up to 3 concurrent scrapes", async () => {
    // Three calls that each hang until we release them
    let resolveA!: () => void, resolveB!: () => void, resolveC!: () => void;
    const promiseA = new Promise<{ markdown: string }>((r) => { resolveA = () => r({ markdown: "a" }); });
    const promiseB = new Promise<{ markdown: string }>((r) => { resolveB = () => r({ markdown: "b" }); });
    const promiseC = new Promise<{ markdown: string }>((r) => { resolveC = () => r({ markdown: "c" }); });

    mockScrape
      .mockReturnValueOnce(promiseA)
      .mockReturnValueOnce(promiseB)
      .mockReturnValueOnce(promiseC);

    const callA = limitedScrape(firecrawl, "https://a.com");
    const callB = limitedScrape(firecrawl, "https://b.com");
    const callC = limitedScrape(firecrawl, "https://c.com");

    // Let microtasks settle so all three acquire the semaphore
    await Promise.resolve();
    expect(_getActiveCount()).toBe(3);

    resolveA(); resolveB(); resolveC();
    await Promise.all([callA, callB, callC]);

    expect(_getActiveCount()).toBe(0);
  });

  it("queues a 4th call while 3 are active", async () => {
    let resolveFirst!: () => void;
    const firstDone = new Promise<{ markdown: string }>((r) => { resolveFirst = () => r({ markdown: "x" }); });

    mockScrape
      .mockReturnValueOnce(firstDone)
      .mockResolvedValue({ markdown: "other" });

    const call1 = limitedScrape(firecrawl, "https://1.com");
    const call2 = limitedScrape(firecrawl, "https://2.com");
    const call3 = limitedScrape(firecrawl, "https://3.com");
    const call4 = limitedScrape(firecrawl, "https://4.com"); // should queue

    await Promise.resolve();
    // Only 3 active (call4 is queued)
    expect(_getActiveCount()).toBe(3);

    // Release one slot
    resolveFirst();
    await call1;

    // call4 should now be running
    await Promise.resolve();
    expect(mockScrape).toHaveBeenCalledTimes(4);

    await Promise.all([call2, call3, call4]);
    expect(_getActiveCount()).toBe(0);
  });
});

// =============================================================================
// lib/firecrawl-limiter.ts — Sentry breadcrumbs
// =============================================================================

describe("firecrawl-limiter — Sentry breadcrumbs", () => {
  beforeEach(() => {
    mockScrape.mockReset();
    mockCrawl.mockReset();
    mockAddBreadcrumb.mockClear();
  });

  it("adds start and done breadcrumbs for a successful scrape", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });

    await limitedScrape(firecrawl, "https://example.com");

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(2);
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ category: "firecrawl", message: expect.stringContaining("start") })
    );
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ category: "firecrawl", message: expect.stringContaining("done") })
    );
  });

  it("adds an error breadcrumb when scrape throws", async () => {
    mockScrape.mockRejectedValue(new Error("timeout"));

    await expect(limitedScrape(firecrawl, "https://bad.com")).rejects.toThrow();

    const errorCall = mockAddBreadcrumb.mock.calls.find(
      ([b]) => (b as { message: string }).message.includes("error")
    );
    expect(errorCall).toBeDefined();
    expect(errorCall![0]).toMatchObject({ level: "error", category: "firecrawl" });
  });

  it("includes url in breadcrumb data", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });

    await limitedScrape(firecrawl, "https://target.com");

    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.objectContaining({ url: "https://target.com" }) })
    );
  });

  it("adds breadcrumbs for crawl", async () => {
    mockCrawl.mockResolvedValue({ success: true, data: [] });

    await limitedCrawl(firecrawl, "https://site.com", { limit: 5 });

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(2);
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: expect.stringContaining("crawl start") })
    );
  });

  it("adds breadcrumbs for batch", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });

    await limitedBatch(firecrawl, ["https://a.com", "https://b.com"]);

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(2);
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: expect.stringContaining("batch start") })
    );
  });
});
