/**
 * Unit tests for cost-scraper.ts — caching, maxAge, and PostHog events
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// ─── scrapePage mock ──────────────────────────────────────────────────────────

const mockScrapePage = jest.fn();
jest.mock("@/lib/integrations/firecrawl", () => ({
  scrapePage: (...args: [unknown, ...unknown[]]) => mockScrapePage(...args),
}));

// ─── PostHog analytics mock ───────────────────────────────────────────────────

const mockTrackCacheHit = jest.fn();
const mockTrackCacheMiss = jest.fn();
jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: (...args: [unknown, ...unknown[]]) => mockTrackCacheHit(...args),
  trackCostDataCacheMiss: (...args: [unknown, ...unknown[]]) => mockTrackCacheMiss(...args),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

// We mock the Drizzle db client used in cost-scraper
// Query chain: db.select().from(table).where(...).limit(1) → Promise<row[]>
const mockSelect = jest.fn();
const mockInsert = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => mockSelect()),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => ({
          returning: mockInsert,
        })),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: {
    serviceType: "serviceType",
    region: "region",
    source: "source",
  },
}));

// ─── drizzle-orm mock ─────────────────────────────────────────────────────────

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((_col: unknown, val: unknown) => `eq(${val})`),
  and: jest.fn((...args: unknown[]) => `and(${args.join(",")})`),
  gt: jest.fn((_col: unknown, val: unknown) => `gt(${val})`),
}));

import { getCostEstimate } from "@/lib/integrations/cost-scraper";

// Helper to build a mock CostData record
function makeCostData(overrides?: Partial<{
  serviceType: string;
  region: string;
  source: string;
  scrapedAt: Date;
  expiresAt: Date | null;
  diyMinCents: number;
  diyMaxCents: number;
  diyAvgCents: number;
  proMinCents: number;
  proMaxCents: number;
  proAvgCents: number;
  costFactors: string[] | null;
  timeEstimate: { pro?: string; diy?: string } | null;
  sourceUrl: string | null;
  rawContent: string | null;
  sampleSize: number | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: "cost-1",
    serviceType: "ceiling_repair",
    region: "941",
    source: "homeadvisor" as const,
    diyMinCents: 5000,
    diyMaxCents: 15000,
    diyAvgCents: 10000,
    proMinCents: 30000,
    proMaxCents: 100000,
    proAvgCents: 65000,
    costFactors: ["Size of damage", "Material type"],
    timeEstimate: { pro: "2-4 hours" },
    sourceUrl: "https://homeadvisor.com/cost/ceiling_repair",
    rawContent: null,
    sampleSize: 500,
    scrapedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29), // 29 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Reset mockResolvedValueOnce queues (clearAllMocks doesn't do this)
  mockSelect.mockReset();
  mockInsert.mockReset();
  mockScrapePage.mockReset();
});

describe("cost data caching", () => {
  it("returns cached data when not expired", async () => {
    const cachedRecord = makeCostData();
    mockSelect.mockResolvedValue([cachedRecord]);

    const result = await getCostEstimate("ceiling_repair", "94102");

    expect(result).not.toBeNull();
    expect(result?.serviceType).toBe("ceiling_repair");
    expect(mockScrapePage).not.toHaveBeenCalled();
  });

  it("scrapes fresh data when cache is expired", async () => {
    const expiredRecord = makeCostData({
      expiresAt: new Date(Date.now() - 1000), // 1 second ago
    });
    // First call (regional cache) → expired
    // Second call (national cache) → empty
    mockSelect
      .mockResolvedValueOnce([expiredRecord])
      .mockResolvedValueOnce([]);

    mockScrapePage.mockResolvedValue({ markdown: "" }); // scrape returns nothing parseable

    await getCostEstimate("ceiling_repair", "94102");

    expect(mockScrapePage).toHaveBeenCalled();
  });

  it("calls trackCostDataCacheHit on cache hit", async () => {
    mockSelect.mockResolvedValue([makeCostData()]);

    await getCostEstimate("ceiling_repair", "94102");

    expect(mockTrackCacheHit).toHaveBeenCalledTimes(1);
    expect(mockTrackCacheHit).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceType: "ceiling_repair",
        region: "941",
        ageMs: expect.any(Number),
      })
    );
    expect(mockTrackCacheMiss).not.toHaveBeenCalled();
  });

  it("calls trackCostDataCacheMiss on cache miss", async () => {
    // No cached data at all
    mockSelect.mockResolvedValue([]);
    mockScrapePage.mockResolvedValue({ markdown: "" });

    await getCostEstimate("ceiling_repair", "94102");

    expect(mockTrackCacheMiss).toHaveBeenCalledTimes(1);
    expect(mockTrackCacheMiss).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceType: "ceiling_repair",
        region: "941",
      })
    );
    expect(mockTrackCacheHit).not.toHaveBeenCalled();
  });

  it("falls back to national average when regional data missing", async () => {
    const nationalRecord = makeCostData({ region: "national" });

    // Flow: getCachedCost(regional) → miss → scrapeFreshCostData → no parseable data
    //       → getCachedCost(national) → hit
    mockSelect
      .mockResolvedValueOnce([]) // regional cache: miss
      .mockResolvedValueOnce([nationalRecord]); // national cache: hit

    mockScrapePage.mockResolvedValue({ markdown: "" }); // scrape returns nothing parseable

    const result = await getCostEstimate("ceiling_repair", "94102");

    // Returns national data as fallback
    expect(result).not.toBeNull();
  });

  it("returns null when no data exists anywhere", async () => {
    // unknown_service_xyz has no URL mapping → scrapeFreshCostData returns null immediately
    // Both regional and national cache queries return empty
    mockSelect.mockResolvedValue([]);
    mockScrapePage.mockResolvedValue({ markdown: "" });

    const result = await getCostEstimate("unknown_service_xyz", "99999");

    // No URL mapping, no cache entries → null
    expect(result).toBeNull();
  });

  it("maxAge passed to scrapePage correctly (7 days = 604800000ms)", async () => {
    mockSelect
      .mockResolvedValueOnce([]) // no cache
      .mockResolvedValueOnce([]); // no national either

    mockScrapePage.mockResolvedValue({
      markdown: "professional cost: $300 - $800",
    });
    mockInsert.mockResolvedValue([makeCostData()]);

    await getCostEstimate("ceiling_repair", "94102");

    // scrapePage should be called with maxAge = 604800000
    expect(mockScrapePage).toHaveBeenCalledWith(
      expect.any(String),
      604800000
    );
  });

  it("isExpired returns true when expiresAt is in the past", async () => {
    const expiredRecord = makeCostData({
      expiresAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
    });
    mockSelect
      .mockResolvedValueOnce([expiredRecord])
      .mockResolvedValueOnce([]); // national fallback also empty

    mockScrapePage.mockResolvedValue({ markdown: "" });

    await getCostEstimate("ceiling_repair", "94102");

    // Should have tried to scrape fresh data (expired triggers scrape)
    expect(mockScrapePage).toHaveBeenCalled();
  });

  it("isExpired returns true when expiresAt is null", async () => {
    const nullExpiry = makeCostData({ expiresAt: null });
    mockSelect
      .mockResolvedValueOnce([nullExpiry])
      .mockResolvedValueOnce([]); // national fallback empty

    mockScrapePage.mockResolvedValue({ markdown: "" });

    await getCostEstimate("ceiling_repair", "94102");

    expect(mockScrapePage).toHaveBeenCalled();
  });

  it("formatCostData converts cents to dollars correctly", async () => {
    const record = makeCostData({
      proMinCents: 30000, // $300.00
      proMaxCents: 80000, // $800.00
      proAvgCents: 55000, // $550.00
      diyMinCents: 5000,  // $50.00
      diyMaxCents: 15000, // $150.00
      diyAvgCents: 10000, // $100.00
    });
    mockSelect.mockResolvedValue([record]);

    const result = await getCostEstimate("ceiling_repair", "94102");

    expect(result?.pro?.min).toBe(300);
    expect(result?.pro?.max).toBe(800);
    expect(result?.pro?.avg).toBe(550);
    expect(result?.diy?.min).toBe(50);
    expect(result?.diy?.max).toBe(150);
    expect(result?.diy?.avg).toBe(100);
  });

  it("formatCostData handles zero values without dividing by zero", async () => {
    const record = makeCostData({
      proMinCents: 0,
      proMaxCents: 0,
      proAvgCents: 0,
      diyMinCents: null as unknown as number,
      diyMaxCents: null as unknown as number,
      diyAvgCents: null as unknown as number,
    });
    mockSelect.mockResolvedValue([record]);

    const result = await getCostEstimate("ceiling_repair", "94102");

    expect(result).not.toBeNull();
    // pro is present (all 0s still count as truthy check-fails → null in formatCostData)
    // Actually all zeros are falsy, so pro would be null
    expect(result?.diy).toBeNull();
  });
});
