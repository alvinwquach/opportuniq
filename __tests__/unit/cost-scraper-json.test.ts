/**
 * Unit tests for cost-scraper.ts — JSON extraction path
 */

// ─── Sentry mock ──────────────────────────────────────────────────────────────

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// ─── Firecrawl mock ───────────────────────────────────────────────────────────

const mockScrape = jest.fn();
const mockScrapePage = jest.fn();
jest.mock("@/lib/integrations/firecrawl", () => ({
  scrapePage: (...args: unknown[]) => mockScrapePage(...args),
  getFirecrawlClient: () => ({ scrape: mockScrape }),
}));

// ─── Feature flag mock ────────────────────────────────────────────────────────

const mockGetFeatureFlag = jest.fn();
jest.mock("@/lib/feature-flags", () => ({
  getFeatureFlag: (...args: unknown[]) => mockGetFeatureFlag(...args),
}));

// ─── PostHog analytics mock ───────────────────────────────────────────────────

jest.mock("@/lib/analytics-server", () => ({
  trackCostDataCacheHit: jest.fn(),
  trackCostDataCacheMiss: jest.fn(),
  trackContractorSearchZeroResults: jest.fn(),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

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

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((_col: unknown, val: unknown) => `eq(${val})`),
  and: jest.fn((...args: unknown[]) => `and(${args.join(",")})`),
  gt: jest.fn((_col: unknown, val: unknown) => `gt(${val})`),
}));

// ─── firecrawl-schemas mock ───────────────────────────────────────────────────

jest.mock("@/lib/integrations/firecrawl-schemas", () => ({
  COST_ESTIMATE_SCHEMA: { type: "object", properties: {}, required: ["proMin", "proMax"] },
  CONTRACTOR_SCHEMA: { type: "object", properties: {} },
}));

import { scrapeCostGuide } from "@/lib/integrations/cost-scraper";

beforeEach(() => {
  jest.clearAllMocks();
  mockSelect.mockReset();
  mockInsert.mockReset();
  mockScrape.mockReset();
  mockScrapePage.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe("cost scraper with JSON extraction", () => {
  describe("flag ON", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
    });

    it("calls firecrawl.scrape with COST_ESTIMATE_SCHEMA in formats", async () => {
      mockScrape.mockResolvedValue({
        markdown: "# Ceiling Repair\n$300 - $800",
        json: { proMin: 300, proMax: 800 },
      });

      await scrapeCostGuide("homeadvisor", "ceilings/repair-a-ceiling");

      expect(mockScrape).toHaveBeenCalledTimes(1);
      const [, options] = mockScrape.mock.calls[0] as [string, { formats: unknown[]; maxAge: number }];
      expect(options.formats).toContainEqual(
        expect.objectContaining({ type: "json" })
      );
      expect(options.maxAge).toBe(604800000);
    });

    it("converts proMin dollars to proMinCents correctly", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 350, proMax: 900 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.proMinCents).toBe(35000);
    });

    it("converts proMax dollars to proMaxCents correctly", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 350, proMax: 900 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.proMaxCents).toBe(90000);
    });

    it("calculates proAvg as midpoint when proAvg not returned", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 200, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.proAvgCents).toBe(50000); // (200+800)/2 * 100
    });

    it("uses proAvg from JSON when provided", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 200, proMax: 800, proAvg: 450 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.proAvgCents).toBe(45000);
    });

    it("handles diyMin/diyMax when present", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 300, proMax: 800, diyMin: 50, diyMax: 150, diyAvg: 100 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.diyMinCents).toBe(5000);
      expect(result?.diyMaxCents).toBe(15000);
      expect(result?.diyAvgCents).toBe(10000);
    });

    it("handles diyMin/diyMax when absent (returns undefined)", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 300, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.diyMinCents).toBeUndefined();
      expect(result?.diyMaxCents).toBeUndefined();
      expect(result?.diyAvgCents).toBeUndefined();
    });

    it("passes costFactors array through", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 300, proMax: 800, costFactors: ["Size of damage", "Material type"] },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.costFactors).toEqual(["Size of damage", "Material type"]);
    });

    it("passes timeEstimate object through", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 300, proMax: 800, timeEstimate: { pro: "2-4 hours", diy: "4-8 hours" } },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.timeEstimate).toEqual({ pro: "2-4 hours", diy: "4-8 hours" });
    });

    it("passes sampleSize through", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 300, proMax: 800, sampleSize: 1250 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.sampleSize).toBe(1250);
    });

    it("falls back to regex when JSON extraction returns null", async () => {
      mockScrape.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
        json: null,
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // Should still return data (from regex parsing of the markdown)
      expect(result).not.toBeNull();
      expect(result?.rawContent).toBe("professional cost: $300 - $800");
    });

    it("falls back to regex when JSON extraction returns empty object", async () => {
      mockScrape.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
        json: {},
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // result.json.proMin is undefined → not a number → falls back to regex
      expect(result).not.toBeNull();
    });

    it("includes rawContent from markdown field", async () => {
      mockScrape.mockResolvedValue({
        markdown: "# Repair Costs\nProfessionals charge $300–$800.",
        json: { proMin: 300, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result?.rawContent).toBe("# Repair Costs\nProfessionals charge $300–$800.");
    });
  });

  describe("flag OFF", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(false);
    });

    it("uses parseCostContent() regex as before (calls scrapePage, not firecrawl.scrape)", async () => {
      mockScrapePage.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
      });

      await scrapeCostGuide("homeadvisor", "ceilings/repair-a-ceiling");

      expect(mockScrapePage).toHaveBeenCalledTimes(1);
      expect(mockScrape).not.toHaveBeenCalled();
    });

    it("passes maxAge 604800000 to scrapePage", async () => {
      mockScrapePage.mockResolvedValue({ markdown: "content" });

      await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(mockScrapePage).toHaveBeenCalledWith(
        expect.any(String),
        604800000
      );
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockGetFeatureFlag.mockResolvedValue(true);
    });

    it("JSON returns proMin=0 (free service) — does not treat as missing", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 0, proMax: 100 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result).not.toBeNull();
      expect(result?.proMinCents).toBe(0);
      expect(result?.proMaxCents).toBe(10000);
    });

    it("JSON returns negative numbers — treats as invalid, falls back to regex", async () => {
      mockScrape.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
        json: { proMin: -100, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // proMin < 0 → falls back to regex
      expect(result).not.toBeNull();
      // The regex path is used, so proMinCents comes from markdown parsing
      // (regex finds "$300 - $800" and sets proMinCents = 30000)
      expect(result?.proMinCents).toBe(30000);
    });

    it("JSON returns proMin > proMax — still stores both", async () => {
      mockScrape.mockResolvedValue({
        markdown: "content",
        json: { proMin: 800, proMax: 300 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // Both are non-negative numbers, so both are stored as-is
      expect(result?.proMinCents).toBe(80000);
      expect(result?.proMaxCents).toBe(30000);
    });

    it("JSON returns non-numeric proMin — falls back to regex", async () => {
      mockScrape.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
        json: { proMin: "300", proMax: 800 }, // proMin is a string
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // typeof "300" !== 'number' → falls back to regex
      expect(result).not.toBeNull();
      // Regex parsed $300 - $800
      expect(result?.proMinCents).toBe(30000);
    });

    it("page is in different language — JSON extraction still works", async () => {
      mockScrape.mockResolvedValue({
        markdown: "# Reparación de techos\nLos profesionales cobran entre 300 y 800 dólares.",
        json: { proMin: 300, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // JSON extraction works regardless of page language
      expect(result?.proMinCents).toBe(30000);
      expect(result?.proMaxCents).toBe(80000);
    });

    it("returns null when markdown is empty even with JSON extraction", async () => {
      mockScrape.mockResolvedValue({
        markdown: undefined,
        json: { proMin: 300, proMax: 800 },
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      expect(result).toBeNull();
    });

    it("falls back to scrapePage when JSON extraction call throws", async () => {
      mockScrape.mockRejectedValue(new Error("Firecrawl API error"));
      mockScrapePage.mockResolvedValue({
        markdown: "professional cost: $300 - $800",
      });

      const result = await scrapeCostGuide("angi", "how-much-does-ceiling-repair-cost");

      // JSON extraction threw → falls back to scrapePage
      expect(mockScrapePage).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
    });
  });
});
