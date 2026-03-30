/**
 * Unit tests for lib/integrations/firecrawl-search.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

const mockCaptureException = jest.fn();
jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// ─── Firecrawl limiter mock ───────────────────────────────────────────────────

const mockLimitedSearch = jest.fn();
jest.mock("@/lib/firecrawl-limiter", () => ({
  limitedSearch: (...args: unknown[]) => mockLimitedSearch(...args),
  limitedScrape: jest.fn(),
  limitedCrawl: jest.fn(),
  limitedBatch: jest.fn(),
  getCreditUsage: jest.fn(),
  _resetCreditTracking: jest.fn(),
  _getActiveCount: jest.fn(),
}));

// ─── FirecrawlApp mock ────────────────────────────────────────────────────────

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

import FirecrawlApp from "@mendable/firecrawl-js";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

const firecrawl = new FirecrawlApp({ apiKey: "test" });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("firecrawlSearch wrapper", () => {
  it("calls firecrawl.search() (via limitedSearch) with correct query and limit", async () => {
    mockLimitedSearch.mockResolvedValue({ web: [] });

    await firecrawlSearch(firecrawl, "water heater replacement", { limit: 5 });

    expect(mockLimitedSearch).toHaveBeenCalledTimes(1);
    expect(mockLimitedSearch).toHaveBeenCalledWith(
      firecrawl,
      "water heater replacement",
      expect.objectContaining({ limit: 5 })
    );
  });

  it("passes location option through when provided", async () => {
    mockLimitedSearch.mockResolvedValue({ web: [] });

    await firecrawlSearch(firecrawl, "permit requirements", {
      location: { country: "US" },
    });

    expect(mockLimitedSearch).toHaveBeenCalledWith(
      firecrawl,
      "permit requirements",
      expect.objectContaining({ location: "US" })
    );
  });

  it("defaults location to US when zipCode is provided and no explicit location", async () => {
    mockLimitedSearch.mockResolvedValue({ web: [] });

    await firecrawlSearch(firecrawl, "heat pump rebate", { zipCode: "94102" });

    expect(mockLimitedSearch).toHaveBeenCalledWith(
      firecrawl,
      "heat pump rebate",
      expect.objectContaining({ location: "US" })
    );
  });

  it("passes scrapeOptions through when provided", async () => {
    mockLimitedSearch.mockResolvedValue({ web: [] });

    await firecrawlSearch(firecrawl, "reddit diy repair", {
      scrapeOptions: { formats: ["markdown"] },
    });

    expect(mockLimitedSearch).toHaveBeenCalledWith(
      firecrawl,
      "reddit diy repair",
      expect.objectContaining({
        scrapeOptions: { formats: ["markdown"] },
      })
    );
  });

  it("returns null on timeout (does not throw)", async () => {
    jest.useFakeTimers();

    // limitedSearch never resolves
    mockLimitedSearch.mockImplementation(() => new Promise(() => {}));

    const resultPromise = firecrawlSearch(firecrawl, "slow query", { timeout: 100 });

    // Advance past the timeout
    jest.advanceTimersByTime(200);

    const result = await resultPromise;
    expect(result).toBeNull();

    jest.useRealTimers();
  });

  it("returns null on network error", async () => {
    mockLimitedSearch.mockRejectedValue(new Error("network error"));

    const result = await firecrawlSearch(firecrawl, "failing query");

    expect(result).toBeNull();
  });

  it("calls Sentry.captureException on error with tool context", async () => {
    const error = new Error("API error");
    mockLimitedSearch.mockRejectedValue(error);

    await firecrawlSearch(firecrawl, "bad query");

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        extra: expect.objectContaining({
          tool: "firecrawl-search",
          query: "bad query",
        }),
      })
    );
  });

  it("returns structured results on success", async () => {
    const mockData = {
      web: [
        { url: "https://example.com/permit", title: "Permit Guide", description: "How to get a permit" },
        { url: "https://city.gov/permits", title: "City Permits", description: "Official city permit info" },
      ],
    };
    mockLimitedSearch.mockResolvedValue(mockData);

    const result = await firecrawlSearch(firecrawl, "building permit requirements");

    expect(result).toEqual(mockData);
    expect(result?.web).toHaveLength(2);
    expect(result?.web?.[0]).toMatchObject({ url: "https://example.com/permit", title: "Permit Guide" });
  });

  it("handles firecrawl returning empty data.web array", async () => {
    mockLimitedSearch.mockResolvedValue({ web: [] });

    const result = await firecrawlSearch(firecrawl, "obscure query");

    expect(result).toEqual({ web: [] });
    expect(result?.web).toHaveLength(0);
  });
});
