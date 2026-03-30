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
// =============================================================================

import { checkRateLimit, _resetBuckets } from "@/lib/rate-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetBuckets();
  });

  it("allows the first request for a new user", () => {
    const result = checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("decrements remaining on each call", () => {
    checkRateLimit("user-2");
    checkRateLimit("user-2");
    const result = checkRateLimit("user-2");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(17);
  });

  it("isolates buckets per user", () => {
    checkRateLimit("user-a");
    checkRateLimit("user-a");
    const r = checkRateLimit("user-b");
    expect(r.remaining).toBe(19); // user-b is fresh
  });

  it("blocks after 20 requests", () => {
    for (let i = 0; i < 20; i++) {
      const r = checkRateLimit("user-3");
      expect(r.allowed).toBe(true);
    }
    const blocked = checkRateLimit("user-3");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("sets resetAt in the future when blocked", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("user-4");
    const blocked = checkRateLimit("user-4");
    expect(blocked.resetAt).toBeGreaterThan(Date.now());
  });

  it("refills tokens over time", () => {
    // Drain the bucket
    for (let i = 0; i < 20; i++) checkRateLimit("user-5");
    expect(checkRateLimit("user-5").allowed).toBe(false);

    // Fast-forward time by 3 seconds (enough for 1 token at 20/min)
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 3_000);

    const result = checkRateLimit("user-5");
    expect(result.allowed).toBe(true);

    jest.spyOn(Date, "now").mockRestore();
  });

  it("does not exceed capacity during refill", () => {
    // Never used — bucket starts full
    // Fast-forward 60 seconds
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 60_000);
    const result = checkRateLimit("user-6");
    // Should have 20 tokens (cap), not 40
    expect(result.remaining).toBe(19);
    jest.spyOn(Date, "now").mockRestore();
  });

  it("returns resetAt as epoch ms (not seconds)", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("user-7");
    const { resetAt } = checkRateLimit("user-7");
    // epoch ms is > 1e12
    expect(resetAt).toBeGreaterThan(1_000_000_000_000);
  });
});

// =============================================================================
// lib/firecrawl-limiter.ts — semaphore
// =============================================================================

import {
  limitedScrape,
  limitedCrawl,
  limitedBatch,
  getCreditUsage,
  _resetCreditTracking,
  _getActiveCount,
} from "@/lib/firecrawl-limiter";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

describe("firecrawl-limiter — semaphore", () => {
  beforeEach(() => {
    _resetCreditTracking();
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
// lib/firecrawl-limiter.ts — credit tracking
// =============================================================================

describe("firecrawl-limiter — credit tracking", () => {
  beforeEach(() => {
    _resetCreditTracking();
    mockScrape.mockReset();
    mockCrawl.mockReset();
  });

  it("tracks 1 credit per limitedScrape call", async () => {
    mockScrape.mockResolvedValue({ markdown: "content" });

    await limitedScrape(firecrawl, "https://example.com");

    const { total, log } = getCreditUsage();
    expect(total).toBe(1);
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ tool: "scrape", url: "https://example.com", credits: 1 });
  });

  it("tracks limit credits per limitedCrawl call", async () => {
    mockCrawl.mockResolvedValue({ success: true, data: [] });

    await limitedCrawl(firecrawl, "https://example.com", { limit: 5 });

    const { total, log } = getCreditUsage();
    expect(total).toBe(5);
    expect(log[0]).toMatchObject({ tool: "crawl", credits: 5 });
  });

  it("defaults to 10 credits for crawl when limit not specified", async () => {
    mockCrawl.mockResolvedValue({ success: true, data: [] });

    await limitedCrawl(firecrawl, "https://example.com");

    expect(getCreditUsage().total).toBe(10);
  });

  it("tracks N credits for limitedBatch of N URLs", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });

    await limitedBatch(firecrawl, [
      "https://a.com",
      "https://b.com",
      "https://c.com",
    ]);

    const { total, log } = getCreditUsage();
    expect(total).toBe(3);
    expect(log[0]).toMatchObject({ tool: "batch", credits: 3 });
  });

  it("accumulates credits across multiple calls", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });
    mockCrawl.mockResolvedValue({ success: true, data: [] });

    await limitedScrape(firecrawl, "https://a.com");
    await limitedScrape(firecrawl, "https://b.com");
    await limitedCrawl(firecrawl, "https://c.com", { limit: 3 });

    expect(getCreditUsage().total).toBe(5);
    expect(getCreditUsage().log).toHaveLength(3);
  });

  it("does not track credits when call throws", async () => {
    mockScrape.mockRejectedValue(new Error("network error"));

    await expect(limitedScrape(firecrawl, "https://fail.com")).rejects.toThrow("network error");

    expect(getCreditUsage().total).toBe(0);
  });

  it("getCreditUsage returns a copy of the log (not a live reference)", async () => {
    mockScrape.mockResolvedValue({ markdown: "ok" });
    await limitedScrape(firecrawl, "https://a.com");

    const { log } = getCreditUsage();
    const lengthBefore = log.length;

    mockScrape.mockResolvedValue({ markdown: "ok" });
    await limitedScrape(firecrawl, "https://b.com");

    expect(log.length).toBe(lengthBefore); // snapshot not affected
  });
});

// =============================================================================
// lib/firecrawl-limiter.ts — Sentry breadcrumbs
// =============================================================================

describe("firecrawl-limiter — Sentry breadcrumbs", () => {
  beforeEach(() => {
    _resetCreditTracking();
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
