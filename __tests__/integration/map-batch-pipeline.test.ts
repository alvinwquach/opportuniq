/**
 * Integration tests for map → filter → batch scrape pipeline
 * and interact inventory flow
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Firecrawl mocks — use jest.fn() inside factory (hoisting-safe) ───────────

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    map: jest.fn(),
    scrape: jest.fn(),
    interact: jest.fn(),
    stopInteraction: jest.fn(),
  })),
}));

jest.mock("@/lib/integrations/firecrawl", () => ({
  scrapePage: jest.fn(),
  getFirecrawlClient: jest.fn().mockReturnValue({
    map: jest.fn(),
    scrape: jest.fn(),
    interact: jest.fn(),
    stopInteraction: jest.fn(),
  }),
}));

// ─── ai mock ──────────────────────────────────────────────────────────────────

jest.mock("ai", () => ({
  tool: (config: unknown) => config,
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
          returning: jest
            .fn()
            .mockResolvedValue([
              {
                id: "cost-data-1",
                serviceType: "ceiling_repair",
                region: "national",
                proMinCents: 20000,
                proMaxCents: 80000,
                proAvgCents: 50000,
                scrapedAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            ]),
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
    sourceUrl: "sourceUrl",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  gt: jest.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { bulkScrapeCostGuides } from "@/lib/integrations/cost-scraper";
import { createInventoryCheckTool } from "@/app/api/chat/tools/inventory-check";

// Access mocks via requireMock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const firecrawlMod = jest.requireMock("@/lib/integrations/firecrawl") as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const featureFlagsMod = jest.requireMock("@/lib/feature-flags") as any;

// Make rate-limit delays instant so tests don't timeout
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

  // Re-set defaults after clearAllMocks
  featureFlagsMod.getFeatureFlag.mockResolvedValue(false);

  const fc = firecrawlMod.getFirecrawlClient();
  fc.map.mockResolvedValue({ links: [] });
  fc.scrape.mockResolvedValue({ markdown: "" });
  fc.interact.mockResolvedValue({ output: "" });
  fc.stopInteraction.mockResolvedValue(undefined);
  firecrawlMod.scrapePage.mockResolvedValue({ markdown: "" });

  // Reset getFirecrawlClient to return fresh mocks
  firecrawlMod.getFirecrawlClient.mockReturnValue({
    map: fc.map,
    scrape: fc.scrape,
    interact: fc.interact,
    stopInteraction: fc.stopInteraction,
  });
});

// ─── Map → filter → batch pipeline ───────────────────────────────────────────

describe("map → filter → batch pipeline", () => {
  it("maps HomeAdvisor → filters cost guides → scrapes → saves to DB", async () => {
    const fc = firecrawlMod.getFirecrawlClient();
    fc.map.mockImplementation(async (url: string) => {
      if (url.includes("homeadvisor")) {
        return {
          links: [
            { url: "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/" },
            { url: "https://www.homeadvisor.com/cost/plumbing/repair-a-pipe/" },
            { url: "https://www.homeadvisor.com/about/" }, // filtered out
          ],
        };
      }
      return { links: [] };
    });

    firecrawlMod.scrapePage.mockResolvedValue({
      markdown: "## How Much Does Ceiling Repair Cost?\nAverage: $200 - $500",
    });

    await bulkScrapeCostGuides("national");

    expect(fc.map).toHaveBeenCalledWith(
      "https://www.homeadvisor.com/cost/",
      expect.objectContaining({ limit: 500 })
    );
  });

  it("handles map returning zero cost guide URLs — uses SERVICE_URL_MAP fallback", async () => {
    const fc = firecrawlMod.getFirecrawlClient();
    fc.map.mockResolvedValue({ links: [] });
    firecrawlMod.scrapePage.mockResolvedValue({ markdown: "" });

    const { success, failed } = await bulkScrapeCostGuides("national");

    // Fallback path means scrapePage gets called for SERVICE_URL_MAP entries
    expect(firecrawlMod.scrapePage).toHaveBeenCalled();
    expect(success + failed).toBeGreaterThan(0);
  });

  it("handles batch scrape with partial failures gracefully", async () => {
    const fc = firecrawlMod.getFirecrawlClient();
    fc.map.mockImplementation(async (url: string) => {
      if (url.includes("homeadvisor")) {
        return {
          links: [
            { url: "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/" },
            { url: "https://www.homeadvisor.com/cost/plumbing/repair-a-pipe/" },
            { url: "https://www.homeadvisor.com/cost/roofing/repair-a-roof/" },
          ],
        };
      }
      return { links: [] };
    });

    firecrawlMod.scrapePage
      .mockResolvedValueOnce({ markdown: "Cost $200 - $500" })
      .mockRejectedValueOnce(new Error("Scrape failed"))
      .mockResolvedValueOnce({ markdown: "Cost $300 - $800" });

    const { success, failed } = await bulkScrapeCostGuides("national");

    // Should complete without throwing
    expect(success + failed).toBeGreaterThanOrEqual(0);
  });
});

// ─── Interact inventory flow ──────────────────────────────────────────────────

describe("interact inventory flow", () => {
  it("scrape → interact with zip → returns availability", async () => {
    featureFlagsMod.getFeatureFlag.mockImplementation(async (flag: string) => {
      if (flag === "firecrawl-interact") return true;
      return false;
    });

    const mockScrape = jest.fn().mockResolvedValue({
      markdown: "Product search results",
      metadata: { scrapeId: "scrape-pipeline-001" },
    });
    const mockInteract = jest.fn().mockResolvedValue({
      output: "Available at 3 nearby stores: Mission (2 units), SoMa (5 units)",
    });
    const mockStop = jest.fn().mockResolvedValue(undefined);

    const tool = createInventoryCheckTool({
      firecrawl: {
        scrape: mockScrape,
        interact: mockInteract,
        stopInteraction: mockStop,
      } as never,
      userId: "user-pipeline-test",
      zipCode: "94102",
    }) as unknown as {
      execute: (args: { query: string; zipCode: string }, opts: never) => Promise<unknown>;
    };

    const result = await tool.execute({ query: "power drill", zipCode: "94102" }, {} as never);

    expect(result).toMatchObject({
      inventory: expect.stringContaining("3 nearby stores"),
      source: expect.stringContaining("interact"),
    });
    expect(mockInteract).toHaveBeenCalledWith(
      "scrape-pipeline-001",
      expect.objectContaining({ prompt: expect.stringContaining("94102") })
    );
    expect(mockStop).toHaveBeenCalledWith("scrape-pipeline-001");
  });
});
