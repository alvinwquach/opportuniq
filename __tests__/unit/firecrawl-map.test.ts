/**
 * Unit tests for map()-based URL discovery in lib/integrations/cost-scraper.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Firecrawl mock ───────────────────────────────────────────────────────────

const mockMap = jest.fn();
const mockScrapeForCost = jest.fn();
const mockScrapePage = jest.fn();

jest.mock("@/lib/integrations/firecrawl", () => ({
  scrapePage: (...args: [unknown, ...unknown[]]) => mockScrapePage(...args),
  getFirecrawlClient: () => ({
    map: mockMap,
    scrape: mockScrapeForCost,
  }),
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: jest.fn().mockResolvedValue(false),
}));

// ─── Analytics mock ───────────────────────────────────────────────────────────

jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: jest.fn(),
  trackCostDataCacheMiss: jest.fn(),
  trackContractorSearchZeroResults: jest.fn(),
  trackCalendarReminderCreated: jest.fn(),
  trackContractorVerified: jest.fn(),
  trackEmailDelivered: jest.fn(),
  trackEmailOpenedByRecipient: jest.fn(),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbInsert = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue([]),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => ({
          returning: mockDbInsert,
        })),
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: { serviceType: "serviceType", region: "region", source: "source" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gt: jest.fn(),
}));

import { bulkScrapeCostGuides } from "@/lib/integrations/cost-scraper";

// Make the 2-second rate-limit delay instant so tests don't timeout
let setTimeoutSpy: jest.SpyInstance;
beforeAll(() => {
  setTimeoutSpy = jest
    .spyOn(global, "setTimeout")
    .mockImplementation((fn: () => void) => {
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });
});
afterAll(() => {
  setTimeoutSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();

  // Default: scrape returns no parseable cost data → failed++
  mockScrapePage.mockResolvedValue({ markdown: "" });
  mockScrapeForCost.mockResolvedValue({ markdown: "" });
  mockDbInsert.mockResolvedValue([
    {
      id: "test-id",
      serviceType: "ceiling_repair",
      region: "national",
      source: "homeadvisor",
      proMinCents: 20000,
      proMaxCents: 80000,
      proAvgCents: 50000,
      scrapedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);
});

describe("map()-based URL discovery in bulkScrapeCostGuides()", () => {
  it("calls firecrawl.map with correct HomeAdvisor URL and limit", async () => {
    mockMap.mockResolvedValue({ links: [] });

    await bulkScrapeCostGuides("national");

    expect(mockMap).toHaveBeenCalledWith(
      "https://www.homeadvisor.com/cost/",
      expect.objectContaining({ limit: 500 })
    );
  });

  it("calls firecrawl.map with correct Angi URL, limit, and search filter", async () => {
    mockMap.mockResolvedValue({ links: [] });

    await bulkScrapeCostGuides("national");

    expect(mockMap).toHaveBeenCalledWith(
      "https://www.angi.com/articles/",
      expect.objectContaining({
        limit: 500,
        search: "how much does cost",
      })
    );
  });

  it("filters returned URLs to cost guide pages only (HomeAdvisor /cost/ pattern)", async () => {
    mockMap.mockImplementation(async (url: string) => {
      if (url.includes("homeadvisor")) {
        return {
          links: [
            { url: "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/" },
            { url: "https://www.homeadvisor.com/about/" }, // not a cost guide
            { url: "https://www.homeadvisor.com/cost/" },  // root — no slug
          ],
        };
      }
      return { links: [] };
    });

    // scrapePage returns valid data so we can verify how many URLs get scraped
    mockScrapePage.mockResolvedValue({
      markdown: "Average cost $200 - $500",
    });

    await bulkScrapeCostGuides("national");

    // Only the valid cost guide URL should be scraped (not /about/ or bare /cost/)
    const scrapedUrls = mockScrapePage.mock.calls.map((c) => c[0] as string);
    expect(
      scrapedUrls.every((u) => /homeadvisor\.com\/cost\/.+/.test(u))
    ).toBe(true);
  });

  it("returns zero discovered URLs and falls back when map returns empty links", async () => {
    mockMap.mockResolvedValue({ links: [] });

    // With fallback, bulkScrapeCostGuides iterates SERVICE_URL_MAP entries
    await bulkScrapeCostGuides("national");

    // Verify that scrapePage was called (fallback path active)
    // The fallback uses SERVICE_URL_MAP which has 27 entries
    expect(mockScrapePage).toHaveBeenCalled();
  });

  it("falls back to SERVICE_URL_MAP when map() throws", async () => {
    mockMap.mockRejectedValue(new Error("map() network error"));

    await bulkScrapeCostGuides("national");

    // Fallback path should have been used — scrapePage called for SERVICE_URL_MAP entries
    expect(mockScrapePage).toHaveBeenCalled();

    const { captureException } = jest.requireMock("@sentry/nextjs");
    expect(captureException).toHaveBeenCalled();
  });

  it("processes Angi URLs discovered via map()", async () => {
    mockMap.mockImplementation(async (url: string) => {
      if (url.includes("angi")) {
        return {
          links: [
            {
              url: "https://www.angi.com/articles/how-much-does-ceiling-repair-cost.htm",
            },
          ],
        };
      }
      return { links: [] };
    });

    mockScrapePage.mockResolvedValue({
      markdown: "Average cost $200 - $400",
    });

    await bulkScrapeCostGuides("national");

    const angiCalls = mockScrapePage.mock.calls.filter((c) =>
      (c[0] as string).includes("angi.com")
    );
    expect(angiCalls.length).toBeGreaterThan(0);
  });
});
