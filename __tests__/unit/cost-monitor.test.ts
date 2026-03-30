/**
 * Unit tests for lib/integrations/cost-monitor.ts
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
}));

// ─── Firecrawl mock ───────────────────────────────────────────────────────────

const mockScrape = jest.fn();

jest.mock("@mendable/firecrawl-js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ scrape: mockScrape })),
}));

jest.mock("@/lib/integrations/firecrawl", () => ({
  getFirecrawlClient: () => ({ scrape: mockScrape }),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockDbUpdate = jest.fn();

jest.mock("@/app/db/client", () => ({
  db: {
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: mockDbUpdate,
      })),
    })),
  },
}));

jest.mock("@/app/db/schema", () => ({
  costData: { sourceUrl: "sourceUrl", expiresAt: "expiresAt" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

import { checkCostGuideChanges } from "@/lib/integrations/cost-monitor";

beforeEach(() => {
  jest.clearAllMocks();
  mockDbUpdate.mockResolvedValue(undefined);
});

describe("checkCostGuideChanges()", () => {
  it("detects added content in cost guide", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Updated cost guide",
      changeTracking: {
        previousScrapeAt: "2026-03-01T00:00:00Z",
        changes: [
          {
            type: "added",
            content: "National average: $450",
          },
        ],
      },
    });

    const results = await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/",
    ]);

    expect(results[0].hasChanges).toBe(true);
    expect(results[0].changes[0].type).toBe("added");
  });

  it("detects removed content in cost guide", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Updated content",
      changeTracking: {
        previousScrapeAt: "2026-03-01T00:00:00Z",
        changes: [
          { type: "removed", content: "Old price: $300" },
        ],
      },
    });

    const results = await checkCostGuideChanges([
      "https://www.angi.com/articles/how-much-does-ceiling-repair-cost.htm",
    ]);

    expect(results[0].hasChanges).toBe(true);
    expect(results[0].changes[0].type).toBe("removed");
  });

  it("invalidates cache when changes detected", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Changed",
      changeTracking: {
        changes: [{ type: "modified", before: "old", after: "new" }],
      },
    });

    await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/plumbing/repair-a-pipe/",
    ]);

    // DB update called to expire the cache entry
    expect(mockDbUpdate).toHaveBeenCalled();
  });

  it("does NOT invalidate cache when no changes", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Same content",
      changeTracking: {
        previousScrapeAt: "2026-03-01T00:00:00Z",
        changes: [],
      },
    });

    await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/",
    ]);

    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("handles page that no longer exists (scrape throws)", async () => {
    mockScrape.mockRejectedValue(new Error("404 Not Found"));

    const results = await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/nonexistent/",
    ]);

    expect(results[0].hasChanges).toBe(false);
    expect(results[0].error).toContain("Not Found");
  });

  it("handles no changes (returns empty changes array)", async () => {
    mockScrape.mockResolvedValue({
      markdown: "Same content as before",
      changeTracking: {
        previousScrapeAt: "2026-03-20T00:00:00Z",
        changes: [],
      },
    });

    const results = await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/roofing/repair-a-roof/",
    ]);

    expect(results[0].hasChanges).toBe(false);
    expect(results[0].changes).toHaveLength(0);
  });

  it("processes multiple URLs independently", async () => {
    mockScrape
      .mockResolvedValueOnce({
        markdown: "Content A",
        changeTracking: { changes: [{ type: "modified", content: "price changed" }] },
      })
      .mockResolvedValueOnce({
        markdown: "Content B",
        changeTracking: { changes: [] },
      });

    const results = await checkCostGuideChanges([
      "https://www.homeadvisor.com/cost/ceilings/repair-a-ceiling/",
      "https://www.homeadvisor.com/cost/roofing/repair-a-roof/",
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].hasChanges).toBe(true);
    expect(results[1].hasChanges).toBe(false);
  });
});
